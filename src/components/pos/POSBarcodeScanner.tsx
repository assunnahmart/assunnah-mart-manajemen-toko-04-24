
import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, X, Scan } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface POSBarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

const POSBarcodeScanner = ({ onScan, onClose, isOpen }: POSBarcodeScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const { toast } = useToast();
  const qrCodeRegionId = "qr-reader";

  useEffect(() => {
    if (isOpen) {
      initializeScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  // Hardware barcode scanner support
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Most barcode scanners send Enter after scanning
      if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
        const value = event.target.value.trim();
        if (value && isOpen) {
          event.preventDefault();
          handleScanSuccess(value);
          event.target.value = ''; // Clear the input
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keypress', handleKeyPress);
    }

    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, [isOpen]);

  const initializeScanner = async () => {
    try {
      setError(null);
      
      // Check if camera is available
      const cameras = await Html5Qrcode.getCameras();
      if (cameras.length === 0) {
        setError('Tidak ada kamera yang tersedia');
        return;
      }

      scannerRef.current = new Html5Qrcode(qrCodeRegionId);
      
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      // Use the back camera (environment facing) if available
      const cameraId = cameras.find(camera => 
        camera.label.toLowerCase().includes('back') || 
        camera.label.toLowerCase().includes('environment')
      )?.id || cameras[0].id;

      await scannerRef.current.start(
        cameraId,
        config,
        handleScanSuccess,
        handleScanError
      );

      setIsScanning(true);
    } catch (err) {
      console.error('Error starting scanner:', err);
      setError('Gagal memulai scanner. Pastikan browser memiliki akses kamera.');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setIsScanning(false);
  };

  const handleScanSuccess = (decodedText: string) => {
    console.log('Barcode scanned:', decodedText);
    toast({
      title: "Barcode berhasil dipindai",
      description: `Kode: ${decodedText}`
    });
    onScan(decodedText);
    onClose();
  };

  const handleScanError = (err: string) => {
    // Don't log scanning errors as they're normal during scanning
    // console.warn('Scan error:', err);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Scan className="h-5 w-5" />
              Scan Barcode
            </span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={initializeScanner} variant="outline">
                Coba Lagi
              </Button>
            </div>
          ) : (
            <>
              {/* Camera Scanner */}
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Arahkan kamera ke barcode produk
                  </p>
                  <div 
                    id={qrCodeRegionId} 
                    className="mx-auto"
                    style={{ width: '100%', maxWidth: '300px' }}
                  />
                </div>

                {/* Manual Input for Hardware Scanner */}
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-2 text-center">
                    Atau gunakan barcode scanner dan tekan Enter
                  </p>
                  <input
                    type="text"
                    placeholder="Scan barcode di sini..."
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={onClose} variant="outline" className="flex-1">
                  Batal
                </Button>
                {isScanning && (
                  <Button 
                    onClick={stopScanner} 
                    variant="destructive" 
                    className="flex-1"
                  >
                    Stop Scanner
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default POSBarcodeScanner;
