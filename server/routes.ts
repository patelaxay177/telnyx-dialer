import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { telnyxService, type TelnyxCallEvent } from "./services/telnyx";
import { insertCallSchema } from "@shared/schema";

interface WebSocketMessage {
  type: string;
  data?: any;
}

interface ClientWebSocket extends WebSocket {
  userId?: number;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time communication
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Set<ClientWebSocket>();

  wss.on('connection', (ws: ClientWebSocket) => {
    clients.add(ws);
    console.log('Client connected to WebSocket');

    ws.on('message', async (message: string) => {
      try {
        const data: WebSocketMessage = JSON.parse(message);
        
        switch (data.type) {
          case 'auth':
            ws.userId = data.data.userId;
            break;
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong' }));
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      console.log('Client disconnected from WebSocket');
    });
  });

  function broadcastToUser(userId: number, message: WebSocketMessage) {
    clients.forEach(client => {
      if (client.userId === userId && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  function broadcastToAll(message: WebSocketMessage) {
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  // API Routes
  
  // Get call history
  app.get("/api/calls/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const calls = await storage.getCallsByUserId(userId);
      res.json(calls);
    } catch (error) {
      console.error('Get calls error:', error);
      res.status(500).json({ error: 'Failed to get calls' });
    }
  });

  // Initiate outbound call
  app.post("/api/calls", async (req, res) => {
    try {
      const callData = insertCallSchema.parse(req.body);
      
      // Create call record
      const call = await storage.createCall(callData);
      
      // Initiate call via Telnyx
      const telnyxCall = await telnyxService.initiateCall(
        callData.fromNumber,
        callData.toNumber
      );
      
      // Update call with Telnyx call ID
      const updatedCall = await storage.updateCall(call.id, {
        telnyxCallId: telnyxCall.call_control_id,
        status: 'ringing'
      });

      // Broadcast call status to user
      broadcastToUser(callData.userId, {
        type: 'call_initiated',
        data: updatedCall
      });

      res.json(updatedCall);
    } catch (error) {
      console.error('Initiate call error:', error);
      res.status(500).json({ error: 'Failed to initiate call' });
    }
  });

  // Answer call
  app.post("/api/calls/:callId/answer", async (req, res) => {
    try {
      const callId = req.params.callId;
      const call = await storage.getCallByCallId(callId);
      
      if (!call || !call.telnyxCallId) {
        return res.status(404).json({ error: 'Call not found' });
      }

      await telnyxService.answerCall(call.telnyxCallId);
      
      const updatedCall = await storage.updateCall(call.id, {
        status: 'answered'
      });

      broadcastToUser(call.userId, {
        type: 'call_answered',
        data: updatedCall
      });

      res.json(updatedCall);
    } catch (error) {
      console.error('Answer call error:', error);
      res.status(500).json({ error: 'Failed to answer call' });
    }
  });

  // Hangup call
  app.post("/api/calls/:callId/hangup", async (req, res) => {
    try {
      const callId = req.params.callId;
      const call = await storage.getCallByCallId(callId);
      
      if (!call || !call.telnyxCallId) {
        return res.status(404).json({ error: 'Call not found' });
      }

      await telnyxService.hangupCall(call.telnyxCallId);
      
      const updatedCall = await storage.updateCall(call.id, {
        status: 'completed',
        endTime: new Date()
      });

      broadcastToUser(call.userId, {
        type: 'call_ended',
        data: updatedCall
      });

      res.json(updatedCall);
    } catch (error) {
      console.error('Hangup call error:', error);
      res.status(500).json({ error: 'Failed to hangup call' });
    }
  });

  // Hold/Unhold call
  app.post("/api/calls/:callId/hold", async (req, res) => {
    try {
      const callId = req.params.callId;
      const { hold } = req.body;
      const call = await storage.getCallByCallId(callId);
      
      if (!call || !call.telnyxCallId) {
        return res.status(404).json({ error: 'Call not found' });
      }

      if (hold) {
        await telnyxService.holdCall(call.telnyxCallId);
      } else {
        await telnyxService.unholdCall(call.telnyxCallId);
      }

      broadcastToUser(call.userId, {
        type: 'call_hold_changed',
        data: { callId, onHold: hold }
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Hold call error:', error);
      res.status(500).json({ error: 'Failed to change hold status' });
    }
  });

  // Mute/Unmute call
  app.post("/api/calls/:callId/mute", async (req, res) => {
    try {
      const callId = req.params.callId;
      const { mute } = req.body;
      const call = await storage.getCallByCallId(callId);
      
      if (!call || !call.telnyxCallId) {
        return res.status(404).json({ error: 'Call not found' });
      }

      if (mute) {
        await telnyxService.muteCall(call.telnyxCallId);
      } else {
        await telnyxService.unmuteCall(call.telnyxCallId);
      }

      broadcastToUser(call.userId, {
        type: 'call_mute_changed',
        data: { callId, muted: mute }
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Mute call error:', error);
      res.status(500).json({ error: 'Failed to change mute status' });
    }
  });

  // Transfer call
  app.post("/api/calls/:callId/transfer", async (req, res) => {
    try {
      const callId = req.params.callId;
      const { toNumber } = req.body;
      const call = await storage.getCallByCallId(callId);
      
      if (!call || !call.telnyxCallId) {
        return res.status(404).json({ error: 'Call not found' });
      }

      await telnyxService.transferCall(call.telnyxCallId, toNumber);

      broadcastToUser(call.userId, {
        type: 'call_transferred',
        data: { callId, toNumber }
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Transfer call error:', error);
      res.status(500).json({ error: 'Failed to transfer call' });
    }
  });

  // Get contacts
  app.get("/api/contacts/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const contacts = await storage.getContactsByUserId(userId);
      res.json(contacts);
    } catch (error) {
      console.error('Get contacts error:', error);
      res.status(500).json({ error: 'Failed to get contacts' });
    }
  });

  // Telnyx webhooks
  app.post("/api/webhooks/telnyx", async (req, res) => {
    try {
      const event: TelnyxCallEvent = telnyxService.processWebhookEvent(req.body);
      
      if (event.payload.call_control_id) {
        const call = await storage.getCallByCallId(event.payload.call_control_id);
        
        if (call) {
          let updatedCall;
          
          switch (event.event_type) {
            case 'call.answered':
              updatedCall = await storage.updateCall(call.id, { status: 'answered' });
              broadcastToUser(call.userId, {
                type: 'call_answered',
                data: updatedCall
              });
              break;
              
            case 'call.hangup':
              const duration = call.startTime ? Math.floor((new Date().getTime() - new Date(call.startTime).getTime()) / 1000) : null;
              updatedCall = await storage.updateCall(call.id, { 
                status: 'completed',
                endTime: new Date(),
                duration
              });
              broadcastToUser(call.userId, {
                type: 'call_ended',
                data: updatedCall
              });
              break;
              
            case 'call.initiated':
              if (event.payload.direction === 'incoming') {
                // Handle incoming call
                broadcastToUser(call.userId, {
                  type: 'incoming_call',
                  data: {
                    callId: call.callId,
                    fromNumber: event.payload.from,
                    toNumber: event.payload.to
                  }
                });
              }
              break;
          }
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  return httpServer;
}
