import { Badge } from '@/components/ui/badge';
import type { Call } from '@shared/schema';

interface CallDisplayProps {
  dialedNumber: string;
  isInCall: boolean;
  activeCall: Call | null;
  callDuration: number;
}

export function CallDisplay({ dialedNumber, isInCall, activeCall, callDuration }: CallDisplayProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    if (!isInCall) return 'Ready to Call';
    if (activeCall?.status === 'ringing') return 'Calling...';
    if (activeCall?.status === 'answered') return 'Connected';
    return 'In Call';
  };

  const getStatusColor = () => {
    if (!isInCall) return 'bg-slate-100 text-slate-700';
    if (activeCall?.status === 'ringing') return 'bg-call-amber text-white';
    if (activeCall?.status === 'answered') return 'bg-call-green text-white';
    return 'bg-blue-100 text-blue-700';
  };

  const displayNumber = isInCall && activeCall ? 
    (activeCall.direction === 'outbound' ? activeCall.toNumber : activeCall.fromNumber) : 
    dialedNumber;

  const getContactInitials = (name?: string) => {
    if (!name) return 'UN';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 mb-6">
      <div className="text-center">
        {/* Call Status Badge */}
        <Badge className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${getStatusColor()}`}>
          <div className="w-2 h-2 bg-current rounded-full mr-2 animate-pulse"></div>
          {getStatusText()}
        </Badge>
        
        {/* Phone Number Display */}
        <div className="bg-slate-50 rounded-xl p-6 mb-6">
          <div className="text-3xl font-mono font-semibold text-slate-900 tracking-wider min-h-[3rem] flex items-center justify-center">
            {displayNumber || 'Enter a number'}
          </div>
        </div>

        {/* Call Timer */}
        {isInCall && (
          <div className="mb-4">
            <div className="text-lg font-mono text-slate-600">{formatDuration(callDuration)}</div>
          </div>
        )}

        {/* Active Call Contact Info */}
        {isInCall && activeCall && (
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-xl font-semibold text-white">
                  {getContactInitials()}
                </span>
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-slate-900">
                  {activeCall.direction === 'outbound' ? activeCall.toNumber : activeCall.fromNumber}
                </h3>
                <p className="text-slate-600">
                  {activeCall.direction === 'outbound' ? 'Outgoing Call' : 'Incoming Call'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
