import { Phone, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IncomingCallModalProps {
  incomingCall: {
    callId: string;
    fromNumber: string;
    toNumber: string;
    name?: string;
  };
  onAnswer: () => void;
  onDecline: () => void;
}

export function IncomingCallModal({ incomingCall, onAnswer, onDecline }: IncomingCallModalProps) {
  const getContactInitials = (name?: string) => {
    if (!name) {
      // Generate initials from phone number last 2 digits
      const lastTwo = incomingCall.fromNumber.slice(-2);
      return lastTwo;
    }
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const displayName = incomingCall.name || incomingCall.fromNumber;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
        <div className="mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {getContactInitials(incomingCall.name)}
            </span>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-1">
            {displayName}
          </h3>
          <p className="text-slate-600">{incomingCall.fromNumber}</p>
          <p className="text-sm text-slate-500 mt-2">Incoming Call</p>
        </div>
        
        <div className="flex justify-center space-x-8">
          <Button
            onClick={onDecline}
            className="w-16 h-16 bg-call-red hover:bg-call-red/90 rounded-full p-0 transition-all duration-200 hover:shadow-lg hover:scale-105"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </Button>
          <Button
            onClick={onAnswer}
            className="w-16 h-16 bg-call-green hover:bg-call-green/90 rounded-full p-0 transition-all duration-200 hover:shadow-lg hover:scale-105"
          >
            <Phone className="w-6 h-6 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
}
