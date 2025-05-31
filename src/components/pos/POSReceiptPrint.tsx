
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
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
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="center bold">
            TOKO ASSUNNAH
          </div>
          <div class="center">
            Jl. Contoh No. 123<br>
            Telp: (021) 1234567
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
            <span>${item.quantity} x ${item.harga_jual.toLocaleString('id-ID')}</span>
            <span>${(item.quantity * item.harga_jual).toLocaleString('id-ID')}</span>
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
            Barang yang sudah dibeli<br>
            tidak dapat dikembalikan
          </div>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <Button
      onClick={printReceipt}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
      disabled={cartItems.length === 0}
    >
      <Printer className="h-4 w-4" />
      Cetak Struk
    </Button>
  );
};

export default POSReceiptPrint;
