
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
          .logo { width: 80px; height: 80px; margin: 0 auto 10px; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="center">
            <img src="https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=80&h=80&fit=crop&crop=center" 
                 alt="Logo Assunnah Mart" class="logo" />
          </div>
          <div class="center bold">
            ASSUNNAH MART
          </div>
          <div class="center">
            Jl. Raya Bogor No. 123<br>
            Cibinong, Bogor 16911<br>
            Telp: (021) 8756-4321<br>
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
