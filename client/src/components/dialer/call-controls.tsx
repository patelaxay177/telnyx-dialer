import { Mic, MicOff, Pause, Play, Share, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CallControlsProps {
  isMuted: boolean;
  isOnHold: boolean;
  onToggleMute: () => void;
  onToggleHold: () => void;
  onTransfer: () => void;
  onMerge: () => void;
}

export function CallControls({
  isMuted,
  isOnHold,
  onToggleMute,
  onToggleHold,
  onTransfer,
  onMerge
}: CallControlsProps) {
  return (
    <div className="mt-6 bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Mute Button */}
        <button
          onClick={onToggleMute}
          className="flex flex-col items-center p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
            isMuted ? 'bg-call-red' : 'bg-slate-200'
          }`}>
            {isMuted ? (
              <MicOff className="w-5 h-5 text-white" />
            ) : (
              <Mic className="w-5 h-5 text-slate-600" />
            )}
          </div>
          <span className="text-sm font-medium text-slate-700">
            {isMuted ? 'Unmute' : 'Mute'}
          </span>
        </button>

        {/* Hold Button */}
        <button
          onClick={onToggleHold}
          className="flex flex-col items-center p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
            isOnHold ? 'bg-call-amber' : 'bg-slate-200'
          }`}>
            {isOnHold ? (
              <Play className="w-5 h-5 text-white" />
            ) : (
              <Pause className="w-5 h-5 text-slate-600" />
            )}
          </div>
          <span className="text-sm font-medium text-slate-700">
            {isOnHold ? 'Resume' : 'Hold'}
          </span>
        </button>

        {/* Transfer Button */}
        <button
          onClick={onTransfer}
          className="flex flex-col items-center p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mb-2">
            <Share className="w-5 h-5 text-slate-600" />
          </div>
          <span className="text-sm font-medium text-slate-700">Transfer</span>
        </button>

        {/* Merge Button */}
        <button
          onClick={onMerge}
          className="flex flex-col items-center p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mb-2">
            <Users className="w-5 h-5 text-slate-600" />
          </div>
          <span className="text-sm font-medium text-slate-700">Merge</span>
        </button>
      </div>
    </div>
  );
}
