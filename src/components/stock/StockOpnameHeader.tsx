
import { Button } from '@/components/ui/button';
import { Plus, Scan } from 'lucide-react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useKasir } from '@/hooks/useKasir';

interface StockOpnameHeaderProps {
  onQuickScan: () => void;
  onManualInput: () => void;
}

const StockOpnameHeader = ({ onQuickScan, onManualInput }: StockOpnameHeaderProps) => {
  const { user } = useSimpleAuth();
  const { data: kasirData } = useKasir();
  
  const userKasir = kasirData?.find(k => 
    k.nama === user?.full_name || 
    k.nama === user?.username ||
    k.nama?.toLowerCase() === user?.full_name?.toLowerCase() ||
    k.nama?.toLowerCase() === user?.username?.toLowerCase()
  );

  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Stok Opname</h2>
        <p className="text-gray-600">Input dan monitoring stok fisik produk dengan scanner barcode</p>
        {user && (
          <p className="text-sm text-blue-600 mt-1">
            Login sebagai: {user.full_name} ({user.username})
          </p>
        )}
        {userKasir && (
          <p className="text-sm text-green-600">
            Data kasir: {userKasir.nama} (ID: {userKasir.id})
          </p>
        )}
        {!userKasir && kasirData?.length && (
          <p className="text-sm text-red-600">
            Peringatan: User tidak ditemukan dalam data kasir. Kasir tersedia: {kasirData.map(k => k.nama).join(', ')}
          </p>
        )}
      </div>
      
      <div className="flex gap-2">
        <Button 
          onClick={onQuickScan}
          className="gap-2 bg-green-600 hover:bg-green-700"
        >
          <Scan className="h-4 w-4" />
          Quick Scan
        </Button>
        
        <Button onClick={onManualInput} className="gap-2">
          <Plus className="h-4 w-4" />
          Input Manual
        </Button>
      </div>
    </div>
  );
};

export default StockOpnameHeader;
