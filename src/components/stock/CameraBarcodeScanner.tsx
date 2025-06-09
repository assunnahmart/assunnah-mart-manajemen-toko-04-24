
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Camera, Scan, AlertCircle } from 'lucide-react';
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
  const [cameraPermission, setCameraPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerElementId = "qr-scanner";
  const inputRef = useRef<HTMLInputElement>(null);

  // Check camera permission on mount
  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const hasCamera = devices.some(device => device.kind === 'videoinput');
          
          if (hasCamera) {
            // Try to access camera to check permission
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ video: true });
              stream.getTracks().forEach(track => track.stop());
              setCameraPermission('granted');
            } catch (error) {
              setCameraPermission('denied');
              setScannerError('Akses kamera ditolak. Silakan gunakan input manual atau izinkan akses kamera.');
            }
          } else {
            setScannerError('Kamera tidak tersedia pada perangkat ini.');
            setCameraPermission('denied');
          }
        } else {
          setScannerError('Browser tidak mendukung akses kamera.');
          setCameraPermission('denied');
        }
      } catch (error) {
        console.error('Error checking camera:', error);
        setScannerError('Gagal mengakses kamera.');
        setCameraPermission('denied');
      }
    };

    if (isOpen) {
      checkCameraPermission();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && isScanning && cameraPermission === 'granted') {
      console.log('Initializing barcode scanner...');
      setScannerError('');
      
      try {
        // Clear any existing scanner
        if (scannerRef.current) {
          scannerRef.current.clear().catch(console.error);
        }

        // Initialize new scanner
        scannerRef.current = new Html5QrcodeScanner(
          scannerElementId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            experimentalFeatures: {
              useBarCodeDetectorIfSupported: true
            },
            supportedScanTypes: [
              // @ts-ignore - Types might not be complete for Html5QrcodeScanner
              0, // QR_CODE
              1, // AZTEC
              2, // CODABAR
              3, // CODE_39
              4, // CODE_93
              5, // CODE_128
              6, // DATA_MATRIX
              7, // MAXICODE
              8, // ITF
              9, // EAN_13
              10, // EAN_8
              11, // PDF_417
              12, // RSS_14
              13, // RSS_EXPANDED
              14, // UPC_A
              15, // UPC_E
              16, // UPC_EAN_EXTENSION
            ]
          },
          false
        );

        // Start scanning
        scannerRef.current.render(
          (decodedText) => {
            // Success callback
            console.log(`Barcode scanned successfully: ${decodedText}`);
            onScan(decodedText);
            stopScanning();
          },
          (error) => {
            // Error callback - don't show errors for continuous scanning
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
      if (isScanning) {
        stopScanning();
      }
    };
  }, [isOpen, isScanning, cameraPermission]);

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

  const startCameraScanning = async () => {
    console.log('Starting camera scanning...');
    setScannerError('');
    
    if (cameraPermission === 'denied') {
      setScannerError('Akses kamera ditolak. Silakan izinkan akses kamera atau gunakan input manual.');
      return;
    }
    
    if (cameraPermission === 'unknown') {
      setScannerError('Memeriksa akses kamera...');
      return;
    }
    
    setIsScanning(true);
  };

  const handleClose = () => {
    stopScanning();
    setManualBarcode('');
    setScannerError('');
    setCameraPermission('unknown');
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
                
                {cameraPermission === 'granted' && (
                  <Button 
                    onClick={startCameraScanning}
                    className="w-full gap-2"
                    variant="default"
                  >
                    <Camera className="h-4 w-4" />
                    Gunakan Kamera
                  </Button>
                )}
                
                {cameraPermission === 'denied' && (
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 text-orange-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">Kamera tidak tersedia</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Gunakan input manual untuk memasukkan barcode
                    </p>
                  </div>
                )}
                
                {scannerError && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{scannerError}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Atau Input Manual
                  </span>
                </div>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Masukkan Barcode</label>
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Ketik atau scan barcode di sini..."
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                    autoFocus
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Arahkan scanner barcode ke kolom ini atau ketik manual
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
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <p className="text-blue-700 text-sm">
                    📱 Pastikan barcode berada dalam kotak scanner dan fokus dengan jelas
                  </p>
                </div>
              </div>
              
              {/* Scanner container */}
              <div 
                id={scannerElementId} 
                className="w-full min-h-[300px] bg-gray-100 rounded-lg overflow-hidden"
              ></div>
              
              {scannerError && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{scannerError}</span>
                  </div>
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
