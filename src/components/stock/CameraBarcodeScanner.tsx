
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Camera, Scan } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface CameraBarcodeScannerProps {
  isOpen: boolean;
  onScan: (barcode: string) => void;
  onClose: () => void;
}

const CameraBarcodeScanner = ({ isOpen, onScan, onClose }: CameraBarcodeScannerProps) => {
  const [manualBarcode, setManualBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerElementId = "qr-scanner";

  useEffect(() => {
    if (isOpen && isScanning) {
      console.log('Initializing barcode scanner...');
      setScannerError('');
      
      try {
        // Initialize scanner
        scannerRef.current = new Html5QrcodeScanner(
          scannerElementId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            experimentalFeatures: {
              useBarCodeDetectorIfSupported: true
            }
          },
          false
        );

        // Start scanning
        scannerRef.current.render(
          (decodedText) => {
            // Success callback
            console.log(`Barcode scanned: ${decodedText}`);
            onScan(decodedText);
            stopScanning();
          },
          (error) => {
            // Error callback (optional)
            console.warn(`QR scan error: ${error}`);
          }
        );
      } catch (error) {
        console.error('Scanner initialization error:', error);
        setScannerError('Gagal menginisialisasi scanner. Pastikan kamera tersedia dan izin diberikan.');
        setIsScanning(false);
      }
    }

    return () => {
      stopScanning();
    };
  }, [isOpen, isScanning]);

  const stopScanning = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear().catch(console.error);
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
    setScannerError('');
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      console.log('Manual barcode input:', manualBarcode.trim());
      onScan(manualBarcode.trim());
      setManualBarcode('');
      onClose();
    }
  };

  const startCameraScanning = () => {
    console.log('Starting camera scanning...');
    setScannerError('');
    setIsScanning(true);
  };

  const handleClose = () => {
    stopScanning();
    setManualBarcode('');
    setScannerError('');
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Scan Barcode Produk
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isScanning ? (
            <>
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Pilih metode untuk scan barcode produk
                </p>
                
                <Button 
                  onClick={startCameraScanning}
                  className="w-full gap-2"
                  variant="default"
                >
                  <Camera className="h-4 w-4" />
                  Gunakan Kamera
                </Button>
                
                {scannerError && (
                  <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                    {scannerError}
                  </div>
                )}
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Atau
                  </span>
                </div>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Input Manual</label>
                  <Input
                    type="text"
                    placeholder="Masukkan kode barcode"
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    disabled={!manualBarcode.trim()}
                  >
                    Scan Manual
                  </Button>
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Batal
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Arahkan kamera ke barcode produk
                </p>
              </div>
              
              {/* Scanner container */}
              <div id={scannerElementId} className="w-full"></div>
              
              {scannerError && (
                <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                  {scannerError}
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  onClick={stopScanning} 
                  variant="outline" 
                  className="flex-1"
                >
                  Berhenti Scan
                </Button>
                <Button 
                  onClick={handleClose} 
                  variant="outline"
                >
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CameraBarcodeScanner;
