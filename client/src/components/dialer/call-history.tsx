import { Phone, PhoneOff, PhoneIncoming, Clock, NotebookTabs, History, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Call } from '@shared/schema';

interface CallHistoryProps {
  calls: Call[];
  onRedial: (number: string) => void;
}

export function CallHistory({ calls, onRedial }: CallHistoryProps) {
  const formatTime = (date: Date | string) => {
    const now = new Date();
    const callTime = new Date(date);
    const diffMinutes = Math.floor((now.getTime() - callTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'Missed';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCallIcon = (call: Call) => {
    if (call.status === 'completed' && call.duration) {
      return call.direction === 'outbound' ? Phone : PhoneIncoming;
    }
    return PhoneOff;
  };

  const getCallIconColor = (call: Call) => {
    if (call.status === 'completed' && call.duration) {
      return call.direction === 'outbound' ? 'from-emerald-100 to-emerald-200' : 'from-blue-100 to-blue-200';
    }
    return 'from-red-100 to-red-200';
  };

  const getCallIconTextColor = (call: Call) => {
    if (call.status === 'completed' && call.duration) {
      return call.direction === 'outbound' ? 'text-emerald-600' : 'text-blue-600';
    }
    return 'text-red-600';
  };

  const getDurationColor = (call: Call) => {
    if (call.status === 'completed' && call.duration) {
      return call.direction === 'outbound' ? 'text-emerald-600' : 'text-blue-600';
    }
    return 'text-red-600';
  };

  return (
    <>
      {/* Recent Calls */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Recent Calls</h2>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All
          </button>
        </div>
        
        {/* Call History List */}
        <div className="space-y-4">
          {calls.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No recent calls</p>
            </div>
          ) : (
            calls.slice(0, 5).map((call) => {
              const CallIcon = getCallIcon(call);
              const phoneNumber = call.direction === 'outbound' ? call.toNumber : call.fromNumber;
              
              return (
                <div
                  key={call.id}
                  onClick={() => onRedial(phoneNumber)}
                  className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className={`w-10 h-10 bg-gradient-to-br ${getCallIconColor(call)} rounded-full flex items-center justify-center`}>
                    <CallIcon className={`w-4 h-4 ${getCallIconTextColor(call)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {phoneNumber}
                    </p>
                    <p className="text-sm text-slate-500">
                      {phoneNumber}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatTime(call.startTime)}
                    </p>
                  </div>
                  <div className={`text-xs font-medium ${getDurationColor(call)}`}>
                    {formatDuration(call.duration)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="space-y-3">
          <button className="w-full flex items-center space-x-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-left">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <NotebookTabs className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-700">Call from Contacts</span>
          </button>
          
          <button className="w-full flex items-center space-x-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-left">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <History className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-700">Call History</span>
          </button>
          
          <button className="w-full flex items-center space-x-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-left">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-700">Settings</span>
          </button>
        </div>
      </div>
    </>
  );
}
