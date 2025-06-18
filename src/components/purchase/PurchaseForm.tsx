
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, AlertCircle } from 'lucide-react';
import { useCreatePurchaseTransaction } from '@/hooks/usePurchaseTransactions';
import { useBarang } from '@/hooks/useBarang';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useKasir } from '@/hooks/useKasir';
import { useSupplier } from '@/hooks/useSupplier';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PurchaseFormHeader from './PurchaseFormHeader';
import PurchaseItemForm from './PurchaseItemForm';
import PurchaseItemsTable from './PurchaseItemsTable';
import PurchaseSummary from './PurchaseSummary';

interface PurchaseItem {
  barang_id: string;
  nama_barang: string;
  jumlah: number;
  harga_satuan: number;
  subtotal: number;
}

const PurchaseForm = () => {
  const [supplierId, setSupplierId] = useState('');
  const [jenisTransaksi, setJenisTransaksi] = useState<'cash' | 'kredit'>('cash');
  const [jatuhTempo, setJatuhTempo] = useState('');
  const [catatan, setCatatan] = useState('');
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

  const { data: productsResult } = useBarang();
  const { data: suppliers } = useSupplier();
  const { data: kasirData } = useKasir();
  const { user } = useSimpleAuth();
  const createPurchase = useCreatePurchaseTransaction();
  const { toast } = useToast();

  const products = productsResult?.data || [];
  const userKasir = kasirData?.find(k => k.nama === user?.full_name);

  // Filter products based on selected supplier with improved performance
  useEffect(() => {
    if (supplierId && products) {
      const supplierProducts = products.filter(product => 
        product.supplier_id === supplierId &&
        product.id &&
        typeof product.id === 'string' &&
        product.id.trim() !== ''
      );
      setFilteredProducts(supplierProducts.slice(0, 5000)); // Limit to 5000 products
    } else {
      setFilteredProducts(products.slice(0, 5000));
    }
    setSelectedProduct('');
    setUnitPrice(0);
  }, [supplierId, products]);

  // Auto-fill product price when product is selected
  useEffect(() => {
    if (selectedProduct && products) {
      const product = products.find(p => p.id === selectedProduct);
      if (product && product.harga_jual) {
        setUnitPrice(product.harga_jual);
      }
    }
  }, [selectedProduct, products]);

  const addItem = () => {
    if (!selectedProduct || quantity <= 0 || unitPrice <= 0) return;

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const newItem: PurchaseItem = {
      barang_id: selectedProduct,
      nama_barang: product.nama,
      jumlah: quantity,
      harga_satuan: unitPrice,
      subtotal: quantity * unitPrice
    };

    setItems([...items, newItem]);
    setSelectedProduct('');
    setQuantity(1);
    setUnitPrice(0);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

  const handleSubmit = async () => {
    if (!supplierId) {
      toast({
        title: "Error",
        description: "Pilih supplier terlebih dahulu",
        variant: "destructive"
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Error", 
        description: "Tambahkan minimal satu item",
        variant: "destructive"
      });
      return;
    }

    if (!userKasir) {
      toast({
        title: "Error",
        description: "Data kasir tidak ditemukan",
        variant: "destructive"
      });
      return;
    }

    if (jenisTransaksi === 'kredit' && !jatuhTempo) {
      toast({
        title: "Error",
        description: "Tanggal jatuh tempo harus diisi untuk transaksi kredit",
        variant: "destructive"
      });
      return;
    }

    try {
      await createPurchase.mutateAsync({
        transaction: {
          supplier_id: supplierId,
          subtotal: totalAmount,
          total: totalAmount,
          jenis_pembayaran: jenisTransaksi,
          kasir_id: userKasir.id,
          jatuh_tempo: jenisTransaksi === 'kredit' ? jatuhTempo : null,
          catatan,
          status: 'completed'
        },
        items: items.map(item => ({
          barang_id: item.barang_id,
          nama_barang: item.nama_barang,
          jumlah: item.jumlah,
          harga_satuan: item.harga_satuan,
          subtotal: item.subtotal
        }))
      });

      toast({
        title: "Transaksi pembelian berhasil",
        description: jenisTransaksi === 'cash' 
          ? "Data pembelian telah disimpan dan terintegrasi dengan kas umum"
          : "Data pembelian telah disimpan dan terintegrasi dengan kartu hutang"
      });

      // Reset form
      setSupplierId('');
      setJenisTransaksi('cash');
      setJatuhTempo('');
      setCatatan('');
      setItems([]);
    } catch (error: any) {
      console.error('Purchase transaction error:', error);
      toast({
        title: "Gagal menyimpan transaksi",
        description: error.message || "Terjadi kesalahan saat menyimpan transaksi",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Transaksi Pembelian Baru
        </CardTitle>
        {products && products.length >= 5000 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Sistem mendukung hingga 5000 produk. Gunakan pencarian untuk menemukan produk lebih cepat.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <PurchaseFormHeader
          supplierId={supplierId}
          setSupplierId={setSupplierId}
          jenisTransaksi={jenisTransaksi}
          setJenisTransaksi={setJenisTransaksi}
          jatuhTempo={jatuhTempo}
          setJatuhTempo={setJatuhTempo}
          catatan={catatan}
          setCatatan={setCatatan}
          suppliers={suppliers || []}
        />

        <PurchaseItemForm
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
          quantity={quantity}
          setQuantity={setQuantity}
          unitPrice={unitPrice}
          setUnitPrice={setUnitPrice}
          filteredProducts={filteredProducts}
          supplierId={supplierId}
          onAddItem={addItem}
        />

        <PurchaseItemsTable
          items={items}
          onRemoveItem={removeItem}
        />

        <PurchaseSummary
          totalAmount={totalAmount}
          itemsCount={items.length}
          isSubmitting={createPurchase.isPending}
          onSubmit={handleSubmit}
        />
      </CardContent>
    </Card>
  );
};

export default PurchaseForm;
