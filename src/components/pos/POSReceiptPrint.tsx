
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Printer, Eye } from 'lucide-react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';

interface CartItem {
  id: string;
  nama: string;
  harga_jual: number;
  quantity: number;
  satuan: string;
}

interface POSReceiptPrintProps {
  cartItems: CartItem[];
  totalAmount: number;
  transactionNumber?: string;
  amountPaid?: number;
  changeAmount?: number;
}

const POSReceiptPrint = ({ 
  cartItems, 
  totalAmount, 
  transactionNumber,
  amountPaid,
  changeAmount 
}: POSReceiptPrintProps) => {
  const { user } = useSimpleAuth();
  const [showPreview, setShowPreview] = useState(false);

  const printReceipt = () => {
    const receiptContent = generateReceiptContent();
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  const generateReceiptContent = () => {
    const now = new Date();
    const date = now.toLocaleDateString('id-ID');
    const time = now.toLocaleTimeString('id-ID');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Struk Belanja</title>
        <style>
          @media print {
            body { margin: 0; padding: 10px; }
            .receipt { width: 58mm; font-family: monospace; font-size: 12px; }
          }
          body { font-family: monospace; font-size: 12px; }
          .receipt { max-width: 300px; margin: 0 auto; }
          .center { text-align: center; }
          .line { border-bottom: 1px dashed #000; margin: 5px 0; }
          .row { display: flex; justify-content: space-between; margin: 2px 0; }
          .bold { font-weight: bold; }
          .logo { width: 80px; height: 80px; margin: 0 auto 10px; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="center">
            <img src="/lovable-uploads/a2af9547-58f3-45de-b565-8283573a9b0e.png" 
                 alt="Logo Assunnah Mart" class="logo" />
          </div>
          <div class="center bold">
            ASSUNNAH MART
          </div>
          <div class="center">
            Jl. Kalitanjung No. 52B<br>
            Kec. Kesambi, Cirebon<br>
            Telp: +62 896-0335-0353<br>
            Email: info@assunnahmart.com
          </div>
          <div class="line"></div>
          
          <div class="row">
            <span>Tanggal:</span>
            <span>${date}</span>
          </div>
          <div class="row">
            <span>Waktu:</span>
            <span>${time}</span>
          </div>
          <div class="row">
            <span>Kasir:</span>
            <span>${user?.full_name || 'Unknown'}</span>
          </div>
          ${transactionNumber ? `
          <div class="row">
            <span>No. Transaksi:</span>
            <span>${transactionNumber}</span>
          </div>
          ` : ''}
          <div class="line"></div>
          
          ${cartItems.map(item => `
          <div class="row">
            <span>${item.nama}</span>
          </div>
          <div class="row">
            <span>${item.quantity} x Rp ${item.harga_jual.toLocaleString('id-ID')}</span>
            <span>Rp ${(item.quantity * item.harga_jual).toLocaleString('id-ID')}</span>
          </div>
          `).join('')}
          
          <div class="line"></div>
          <div class="row bold">
            <span>TOTAL:</span>
            <span>Rp ${totalAmount.toLocaleString('id-ID')}</span>
          </div>
          
          ${amountPaid !== undefined ? `
          <div class="row">
            <span>Bayar:</span>
            <span>Rp ${amountPaid.toLocaleString('id-ID')}</span>
          </div>
          ` : ''}
          
          ${changeAmount !== undefined ? `
          <div class="row">
            <span>Kembali:</span>
            <span>Rp ${changeAmount.toLocaleString('id-ID')}</span>
          </div>
          ` : ''}
          
          <div class="line"></div>
          <div class="center">
            Terima kasih atas kunjungan Anda<br>
            Semoga berkah dan barokah<br>
            <br>
            Barang yang sudah dibeli<br>
            tidak dapat dikembalikan<br>
            kecuali ada kesepakatan
          </div>
          <div class="center" style="margin-top: 10px; font-size: 10px;">
            www.assunnahmart.com
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const ReceiptPreview = () => {
    const now = new Date();
    const date = now.toLocaleDateString('id-ID');
    const time = now.toLocaleTimeString('id-ID');

    return (
      <div className="max-w-sm mx-auto bg-white p-4 font-mono text-xs border">
        <div className="text-center mb-4">
          <img 
            src="/lovable-uploads/a2af9547-58f3-45de-b565-8283573a9b0e.png" 
            alt="Logo Assunnah Mart" 
            className="w-16 h-16 mx-auto rounded-lg mb-2"
          />
          <div className="font-bold text-sm">ASSUNNAH MART</div>
          <div className="text-xs text-gray-600">
            Jl. Kalitanjung No. 52B<br/>
            Kec. Kesambi, Cirebon<br/>
            Telp: +62 896-0335-0353<br/>
            Email: info@assunnahmart.com
          </div>
        </div>
        
        <div className="border-t border-dashed border-gray-400 my-2"></div>
        
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Tanggal:</span>
            <span>{date}</span>
          </div>
          <div className="flex justify-between">
            <span>Waktu:</span>
            <span>{time}</span>
          </div>
          <div className="flex justify-between">
            <span>Kasir:</span>
            <span>{user?.full_name || 'Unknown'}</span>
          </div>
          {transactionNumber && (
            <div className="flex justify-between">
              <span>No. Transaksi:</span>
              <span>{transactionNumber}</span>
            </div>
          )}
        </div>
        
        <div className="border-t border-dashed border-gray-400 my-2"></div>
        
        <div className="space-y-2">
          {cartItems.map((item) => (
            <div key={item.id}>
              <div className="text-left">{item.nama}</div>
              <div className="flex justify-between">
                <span>{item.quantity} x Rp {item.harga_jual.toLocaleString('id-ID')}</span>
                <span>Rp {(item.quantity * item.harga_jual).toLocaleString('id-ID')}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="border-t border-dashed border-gray-400 my-2"></div>
        
        <div className="flex justify-between font-bold">
          <span>TOTAL:</span>
          <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
        </div>
        
        {amountPaid !== undefined && (
          <div className="flex justify-between">
            <span>Bayar:</span>
            <span>Rp {amountPaid.toLocaleString('id-ID')}</span>
          </div>
        )}
        
        {changeAmount !== undefined && (
          <div className="flex justify-between">
            <span>Kembali:</span>
            <span>Rp {changeAmount.toLocaleString('id-ID')}</span>
          </div>
        )}
        
        <div className="border-t border-dashed border-gray-400 my-2"></div>
        
        <div className="text-center text-xs">
          Terima kasih atas kunjungan Anda<br/>
          Semoga berkah dan barokah<br/><br/>
          Barang yang sudah dibeli<br/>
          tidak dapat dikembalikan<br/>
          kecuali ada kesepakatan
        </div>
        
        <div className="text-center text-xs mt-2 text-gray-500">
          www.assunnahmart.com
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          onClick={() => setShowPreview(true)}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          disabled={cartItems.length === 0}
        >
          <Eye className="h-4 w-4" />
          Preview
        </Button>
        <Button
          onClick={printReceipt}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          disabled={cartItems.length === 0}
        >
          <Printer className="h-4 w-4" />
          Cetak
        </Button>
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Preview Struk</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <ReceiptPreview />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Tutup
            </Button>
            <Button onClick={() => { printReceipt(); setShowPreview(false); }}>
              <Printer className="h-4 w-4 mr-2" />
              Cetak Sekarang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default POSReceiptPrint;
