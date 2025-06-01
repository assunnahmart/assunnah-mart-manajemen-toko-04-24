
import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QrCode, X } from 'lucide-react';

interface POSBarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

const POSBarcodeScanner = ({ onScan, onClose }: POSBarcodeScannerProps) => {
  const [manualBarcode, setManualBarcode] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      onScan(manualBarcode.trim());
      setManualBarcode('');
      onClose();
    }
  };

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
          </div>
          
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Input Manual</label>
              <Input
                ref={inputRef}
                type="text"
                placeholder="Masukkan kode barcode"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={!manualBarcode.trim()}>
                Scan
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
