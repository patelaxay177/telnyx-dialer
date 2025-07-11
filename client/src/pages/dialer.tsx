import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCallState } from '@/hooks/use-call-state';
import { useWebSocket } from '@/hooks/use-websocket';
import { Settings } from 'lucide-react';
import { DialerKeypad } from '@/components/dialer/keypad';
import { CallDisplay } from '@/components/dialer/call-display';
import { CallControls } from '@/components/dialer/call-controls';
import { CallHistory } from '@/components/dialer/call-history';
import { IncomingCallModal } from '@/components/dialer/incoming-call-modal';
import { TransferModal } from '@/components/dialer/transfer-modal';
import type { Call } from '@shared/schema';

const CURRENT_USER_ID = 1; // In a real app, this would come from authentication

export default function DialerPage() {
  const callState = useCallState(CURRENT_USER_ID);

  // WebSocket connection for real-time events
  const { isConnected, connectionStatus } = useWebSocket({
    userId: CURRENT_USER_ID,
    onMessage: (message) => {
      switch (message.type) {
        case 'incoming_call':
          callState.setIncomingCall({
            callId: message.data.callId,
            fromNumber: message.data.fromNumber,
            toNumber: message.data.toNumber,
          });
          break;
        case 'call_answered':
        case 'call_ended':
          // These are handled by the mutations in useCallState
          break;
        case 'call_hold_changed':
          // Update hold status if needed
          break;
        case 'call_mute_changed':
          // Update mute status if needed
          break;
      }
    },
  });

  // Fetch call history
  const { data: callHistory = [] } = useQuery<Call[]>({
    queryKey: ['/api/calls', CURRENT_USER_ID],
  });

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (callState.isInCall && callState.activeCall) {
      interval = setInterval(() => {
        callState.setCallDuration(callState.callDuration + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [callState.isInCall, callState.callDuration]);

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected to Telnyx';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      case 'error':
        return 'Connection Error';
      case 'failed':
        return 'Connection Failed';
      default:
        return 'Unknown Status';
    }
  };

  const getConnectionStatusColor = () => {
    return isConnected ? 'bg-call-green' : 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-telnyx-blue rounded-lg flex items-center justify-center">
                <i className="fas fa-phone text-white text-sm"></i>
              </div>
              <h1 className="text-xl font-semibold text-slate-900">VoIP Dialer</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 ${getConnectionStatusColor()} rounded-full ${isConnected ? 'animate-pulse' : ''}`}></div>
                <span className="text-sm text-slate-600">{getConnectionStatusText()}</span>
              </div>
              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Dialer Section */}
          <div className="lg:col-span-2">
            {/* Current Call Display */}
            <CallDisplay
              dialedNumber={callState.dialedNumber}
              isInCall={callState.isInCall}
              activeCall={callState.activeCall}
              callDuration={callState.callDuration}
            />

            {/* Keypad */}
            <DialerKeypad
              onKeyPress={callState.appendDigit}
              onCall={() => callState.initiateCall('+15551234567')} // Replace with user's number
              onHangup={callState.hangupCall}
              onBackspace={callState.deleteLastDigit}
              isInCall={callState.isInCall}
              isLoading={callState.isLoading}
            />

            {/* Call Controls */}
            {callState.isInCall && (
              <CallControls
                isMuted={callState.isMuted}
                isOnHold={callState.isOnHold}
                onToggleMute={callState.toggleMute}
                onToggleHold={callState.toggleHold}
                onTransfer={() => {/* Will be handled by TransferModal */}}
                onMerge={() => {/* TODO: Implement merge functionality */}}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <CallHistory
              calls={callHistory}
              onRedial={(number) => callState.initiateCall('+15551234567', number)}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {callState.incomingCall && (
        <IncomingCallModal
          incomingCall={callState.incomingCall}
          onAnswer={callState.answerCall}
          onDecline={callState.declineCall}
        />
      )}

      <TransferModal
        isOpen={false} // TODO: Add transfer modal state
        onClose={() => {}}
        onTransfer={callState.transferCall}
      />
    </div>
  );
}
