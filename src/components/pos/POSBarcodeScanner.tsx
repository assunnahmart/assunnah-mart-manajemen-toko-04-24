
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QrCode, X, Scan } from 'lucide-react';

interface POSBarcodeScannerProps {
  isOpen?: boolean;
  onScan: (barcode: string) => void;
  onClose: () => void;
  children?: React.ReactNode;
}

const POSBarcodeScanner = ({ isOpen = true, onScan, onClose, children }: POSBarcodeScannerProps) => {
  const [manualBarcode, setManualBarcode] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      onScan(manualBarcode.trim());
      setManualBarcode('');
      onClose();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setManualBarcode(value);
    
    // Auto-submit if barcode looks complete (typically 8+ digits)
    if (value.length >= 8 && /^\d+$/.test(value)) {
      setTimeout(() => {
        onScan(value.trim());
        setManualBarcode('');
        onClose();
      }, 300); // Small delay to allow user to see the input
    }
  };

  // If children are provided, render as a button trigger
  if (children) {
    return (
      <div onClick={onClose}>
        {children}
      </div>
    );
  }

  // If not open, don't render the modal
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Scan Barcode
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Scan barcode produk atau input manual
            </p>
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <p className="text-blue-700 text-sm">
                💡 Arahkan scanner barcode ke kolom input atau ketik manual
              </p>
            </div>
          </div>
          
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Input Barcode</label>
              <Input
                ref={inputRef}
                type="text"
                placeholder="Scan atau ketik kode barcode..."
                value={manualBarcode}
                onChange={handleInputChange}
                autoFocus
                className="mt-1 text-center text-lg font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Barcode akan otomatis diproses setelah 8+ digit
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={!manualBarcode.trim()}
              >
                <Scan className="h-4 w-4 mr-2" />
                Proses Barcode
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default POSBarcodeScanner;
