import { Phone, PhoneOff, Delete } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DialerKeypadProps {
  onKeyPress: (digit: string) => void;
  onCall: () => void;
  onHangup: () => void;
  onBackspace: () => void;
  isInCall: boolean;
  isLoading: boolean;
}

export function DialerKeypad({
  onKeyPress,
  onCall,
  onHangup,
  onBackspace,
  isInCall,
  isLoading
}: DialerKeypadProps) {
  const keypadData = [
    { digit: '1', letters: '' },
    { digit: '2', letters: 'ABC' },
    { digit: '3', letters: 'DEF' },
    { digit: '4', letters: 'GHI' },
    { digit: '5', letters: 'JKL' },
    { digit: '6', letters: 'MNO' },
    { digit: '7', letters: 'PQRS' },
    { digit: '8', letters: 'TUV' },
    { digit: '9', letters: 'WXYZ' },
    { digit: '*', letters: '' },
    { digit: '0', letters: '+' },
    { digit: '#', letters: '' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
      <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
        {keypadData.map(({ digit, letters }) => (
          <button
            key={digit}
            onClick={() => onKeyPress(digit)}
            className="aspect-square rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all duration-200 hover:shadow-lg hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <div className="flex flex-col items-center justify-center h-full">
              <span className="text-2xl font-semibold text-slate-900">{digit}</span>
              {letters && <span className="text-xs text-slate-500">{letters}</span>}
            </div>
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-6 mt-8">
        {/* Call Button */}
        {!isInCall && (
          <Button
            onClick={onCall}
            disabled={isLoading}
            className="w-16 h-16 bg-call-green hover:bg-call-green/90 rounded-full p-0 transition-all duration-200 hover:shadow-lg hover:scale-105"
          >
            <Phone className="w-6 h-6 text-white" />
          </Button>
        )}
        
        {/* End Call Button */}
        {isInCall && (
          <Button
            onClick={onHangup}
            disabled={isLoading}
            className="w-16 h-16 bg-call-red hover:bg-call-red/90 rounded-full p-0 transition-all duration-200 hover:shadow-lg hover:scale-105"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </Button>
        )}
        
        {/* Backspace Button */}
        <Button
          onClick={onBackspace}
          variant="secondary"
          className="w-16 h-16 bg-slate-200 hover:bg-slate-300 rounded-full p-0 transition-all duration-200 hover:shadow-lg hover:scale-105"
        >
          <Delete className="w-6 h-6 text-slate-700" />
        </Button>
      </div>
    </div>
  );
}
