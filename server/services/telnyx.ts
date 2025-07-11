import { WebSocket } from 'ws';

export interface TelnyxCall {
  call_control_id: string;
  call_leg_id: string;
  call_session_id: string;
  connection_id: string;
  from: string;
  to: string;
  direction: 'incoming' | 'outgoing';
  state: string;
}

export interface TelnyxCallEvent {
  event_type: string;
  payload: {
    call_control_id: string;
    call_leg_id?: string;
    call_session_id?: string;
    connection_id?: string;
    from?: string;
    to?: string;
    direction?: 'incoming' | 'outgoing';
    state?: string;
    hangup_cause?: string;
    hangup_source?: string;
  };
}

export class TelnyxService {
  private apiKey: string;
  private baseUrl = 'https://api.telnyx.com/v2';

  constructor() {
    this.apiKey = process.env.TELNYX_API_KEY || process.env.TELNYX_API_KEY_ENV_VAR || "";
    if (!this.apiKey) {
      console.warn('TELNYX_API_KEY not found in environment variables');
    }
  }

  private async makeRequest(endpoint: string, method: string = 'GET', data?: any) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (data && (method === 'POST' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Telnyx API Error ${response.status}: ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Telnyx API request failed:', error);
      throw error;
    }
  }

  async initiateCall(fromNumber: string, toNumber: string, connectionId?: string): Promise<TelnyxCall> {
    const data = {
      to: toNumber,
      from: fromNumber,
      connection_id: connectionId || process.env.TELNYX_CONNECTION_ID,
      webhook_url: `${process.env.WEBHOOK_BASE_URL || 'http://localhost:5000'}/api/webhooks/telnyx`,
    };

    const response = await this.makeRequest('/calls', 'POST', data);
    return response.data;
  }

  async answerCall(callControlId: string): Promise<void> {
    await this.makeRequest(`/calls/${callControlId}/actions/answer`, 'POST');
  }

  async hangupCall(callControlId: string): Promise<void> {
    await this.makeRequest(`/calls/${callControlId}/actions/hangup`, 'POST');
  }

  async holdCall(callControlId: string): Promise<void> {
    await this.makeRequest(`/calls/${callControlId}/actions/hold`, 'POST');
  }

  async unholdCall(callControlId: string): Promise<void> {
    await this.makeRequest(`/calls/${callControlId}/actions/unhold`, 'POST');
  }

  async muteCall(callControlId: string): Promise<void> {
    await this.makeRequest(`/calls/${callControlId}/actions/mute`, 'POST');
  }

  async unmuteCall(callControlId: string): Promise<void> {
    await this.makeRequest(`/calls/${callControlId}/actions/unmute`, 'POST');
  }

  async transferCall(callControlId: string, toNumber: string): Promise<void> {
    const data = { to: toNumber };
    await this.makeRequest(`/calls/${callControlId}/actions/transfer`, 'POST', data);
  }

  async bridgeCalls(callControlId1: string, callControlId2: string): Promise<void> {
    const data = { 
      call_control_id: callControlId2 
    };
    await this.makeRequest(`/calls/${callControlId1}/actions/bridge`, 'POST', data);
  }

  processWebhookEvent(event: TelnyxCallEvent): TelnyxCallEvent {
    // Process and validate webhook events from Telnyx
    return event;
  }
}

export const telnyxService = new TelnyxService();
