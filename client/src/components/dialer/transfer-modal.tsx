import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (toNumber: string) => void;
}

export function TransferModal({ isOpen, onClose, onTransfer }: TransferModalProps) {
  const [transferNumber, setTransferNumber] = useState('');

  const handleTransfer = () => {
    if (transferNumber.trim()) {
      onTransfer(transferNumber.trim());
      setTransferNumber('');
      onClose();
    }
  };

  const handleCancel = () => {
    setTransferNumber('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Transfer Call</h3>
          <button
            onClick={handleCancel}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="transferNumber" className="block text-sm font-medium text-slate-700 mb-2">
              Transfer to
            </Label>
            <Input
              id="transferNumber"
              type="tel"
              value={transferNumber}
              onChange={(e) => setTransferNumber(e.target.value)}
              placeholder="Enter phone number"
              className="w-full"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={!transferNumber.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Transfer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
