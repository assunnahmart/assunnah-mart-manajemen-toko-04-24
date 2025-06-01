
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scan, Camera } from 'lucide-react';

interface POSBarcodeScannerProps {
  onScan: (barcode: string) => void;
  children?: React.ReactNode;
}

const POSBarcodeScanner = ({ onScan, children }: POSBarcodeScannerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleManualSubmit = () => {
    if (manualBarcode.trim()) {
      onScan(manualBarcode.trim());
      setManualBarcode('');
      setIsOpen(false);
    }
  };

  const startCamera = async () => {
    setIsScanning(true);
    try {
      // In a real implementation, you would use a barcode scanning library like QuaggaJS or ZXing
      // For now, we'll show a placeholder message
      console.log('Camera scanning would be implemented here');
    } catch (error) {
      console.error('Camera access error:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Scan className="h-4 w-4 mr-2" />
            Scan Barcode
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Barcode Produk</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Manual Input */}
          <div>
            <Label htmlFor="barcode">Input Manual Barcode</Label>
            <div className="flex gap-2">
              <Input
                id="barcode"
                placeholder="Masukkan barcode..."
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleManualSubmit();
                  }
                }}
              />
              <Button onClick={handleManualSubmit} disabled={!manualBarcode.trim()}>
                OK
              </Button>
            </div>
          </div>

          {/* Camera Scanner */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Atau gunakan kamera untuk scan</p>
            <Button
              variant="outline"
              onClick={startCamera}
              disabled={isScanning}
              className="w-full"
            >
              <Camera className="h-4 w-4 mr-2" />
              {isScanning ? 'Scanning...' : 'Buka Kamera'}
            </Button>
            {isScanning && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <p className="text-sm text-gray-600">
                  Fitur kamera scanning akan diimplementasikan dengan library khusus barcode scanner.
                  Untuk sementara, gunakan input manual di atas.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsScanning(false)}
                  className="mt-2"
                >
                  Tutup
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default POSBarcodeScanner;
