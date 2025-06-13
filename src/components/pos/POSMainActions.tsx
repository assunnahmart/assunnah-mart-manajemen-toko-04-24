
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Save, CreditCard } from 'lucide-react';

interface POSMainActionsProps {
  onQuickSave: () => void;
  onRegularPayment: () => void;
  cartItemsLength: number;
  selectedPaymentMethod: string;
  selectedCustomer: any;
  isProcessing: boolean;
}

const POSMainActions = ({
  onQuickSave,
  onRegularPayment,
  cartItemsLength,
  selectedPaymentMethod,
  selectedCustomer,
  isProcessing
}: POSMainActionsProps) => {
  return (
    <div className="mb-6">
      <Card className="border-blue-200">
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button 
              onClick={onQuickSave} 
              disabled={cartItemsLength === 0 || isProcessing} 
              className="bg-green-600 hover:bg-green-700 shadow-lg" 
              size="lg"
            >
              <Save className="h-4 w-4 mr-2" />
              {isProcessing ? 'Menyimpan...' : 'Simpan ke Database (F2)'}
            </Button>

            <Button 
              onClick={onRegularPayment} 
              disabled={cartItemsLength === 0 || (selectedPaymentMethod === 'credit' && !selectedCustomer)} 
              size="lg" 
              className="bg-red-500 hover:bg-red-600 shadow-lg"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {selectedPaymentMethod === 'credit' ? 'Proses Kredit' : 'Bayar & Cetak'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default POSMainActions;
