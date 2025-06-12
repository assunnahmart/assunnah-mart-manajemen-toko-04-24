
import { Button } from '@/components/ui/button';

interface PurchaseSummaryProps {
  totalAmount: number;
  itemsCount: number;
  isSubmitting: boolean;
  onSubmit: () => void;
}

const PurchaseSummary = ({ totalAmount, itemsCount, isSubmitting, onSubmit }: PurchaseSummaryProps) => {
  return (
    <>
      {itemsCount > 0 && (
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <span className="text-lg font-semibold">Total:</span>
          <span className="text-xl font-bold">Rp {totalAmount.toLocaleString('id-ID')}</span>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={onSubmit}
          disabled={itemsCount === 0 || isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
        </Button>
      </div>
    </>
  );
};

export default PurchaseSummary;
