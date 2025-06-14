
import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import POSCustomerSelect from '@/components/pos/POSCustomerSelect';
import POSPaymentMethod from '@/components/pos/POSPaymentMethod';
import POSMainActions from '@/components/pos/POSMainActions';
import POSPayment from '@/components/pos/POSPayment';
import { useToast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  name: string;
  type: 'unit' | 'perorangan' | 'guest';
  phone?: string;
}

interface POSPaymentManagerProps {
  cartItems: any[];
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  selectedPaymentMethod: string;
  setSelectedPaymentMethod: (method: string) => void;
  onQuickSave: () => void;
  isProcessing: boolean;
  getTotalAmount: () => number;
  onPaymentSuccess: () => void;
}

const POSPaymentManager = ({
  cartItems,
  selectedCustomer,
  setSelectedCustomer,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  onQuickSave,
  isProcessing,
  getTotalAmount,
  onPaymentSuccess
}: POSPaymentManagerProps) => {
  const [showPayment, setShowPayment] = useState(false);
  const { toast } = useToast();

  const handleRegularPayment = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Keranjang kosong",
        description: "Tambahkan produk terlebih dahulu",
        variant: "destructive"
      });
      return;
    }

    if (selectedPaymentMethod === 'credit' && !selectedCustomer) {
      toast({
        title: "Pilih pelanggan",
        description: "Pembayaran kredit memerlukan pemilihan pelanggan",
        variant: "destructive"
      });
      return;
    }

    for (const item of cartItems) {
      if (item.stok_saat_ini < item.quantity) {
        toast({
          title: "Stok tidak mencukupi",
          description: `Stok ${item.nama} hanya tersisa ${item.stok_saat_ini}`,
          variant: "destructive"
        });
        return;
      }
    }

    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    onPaymentSuccess();
    setShowPayment(false);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <POSCustomerSelect 
          selectedCustomer={selectedCustomer} 
          onCustomerSelect={setSelectedCustomer} 
        />
        <POSPaymentMethod 
          selectedMethod={selectedPaymentMethod} 
          onMethodSelect={setSelectedPaymentMethod} 
        />
      </div>

      <POSMainActions
        onQuickSave={onQuickSave}
        onRegularPayment={handleRegularPayment}
        cartItemsLength={cartItems.length}
        selectedPaymentMethod={selectedPaymentMethod}
        selectedCustomer={selectedCustomer}
        isProcessing={isProcessing}
      />

      {selectedPaymentMethod === 'credit' && !selectedCustomer && (
        <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg mb-4">
          <p className="text-orange-700 text-sm flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Pembayaran kredit memerlukan pemilihan pelanggan
          </p>
        </div>
      )}

      {showPayment && (
        <POSPayment
          cartItems={cartItems}
          totalAmount={getTotalAmount()}
          selectedCustomer={selectedCustomer}
          selectedPaymentMethod={selectedPaymentMethod}
          onClose={() => setShowPayment(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};

export default POSPaymentManager;
