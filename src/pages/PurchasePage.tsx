
import NewProtectedRoute from '@/components/NewProtectedRoute';
import NewNavbar from '@/components/NewNavbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, FileText, CreditCard } from 'lucide-react';
import PurchaseForm from '@/components/purchase/PurchaseForm';
import PurchaseHistory from '@/components/purchase/PurchaseHistory';
import SupplierDebtCard from '@/components/purchase/SupplierDebtCard';
import { useSupplier } from '@/hooks/useSupplier';

const PurchasePage = () => {
  const { data: suppliers } = useSupplier();

  return (
    <NewProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <NewNavbar />
        
        <div className="container mx-auto p-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Pembelian</h1>
            <p className="text-gray-600">
              Kelola transaksi pembelian, stok barang, dan kartu hutang supplier
            </p>
          </div>
          
          <Tabs defaultValue="purchase-form" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="purchase-form" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Transaksi Baru
              </TabsTrigger>
              <TabsTrigger value="purchase-history" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Riwayat Pembelian
              </TabsTrigger>
              <TabsTrigger value="supplier-debt" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Kartu Hutang
              </TabsTrigger>
            </TabsList>

            <TabsContent value="purchase-form">
              <PurchaseForm suppliers={suppliers || []} />
            </TabsContent>

            <TabsContent value="purchase-history">
              <PurchaseHistory />
            </TabsContent>

            <TabsContent value="supplier-debt">
              <SupplierDebtCard />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </NewProtectedRoute>
  );
};

export default PurchasePage;
