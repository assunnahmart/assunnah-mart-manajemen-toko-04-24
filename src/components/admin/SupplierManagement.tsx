
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSupplierData } from '@/hooks/useAdminReports';
import { Building, Package, DollarSign, Download } from 'lucide-react';

const SupplierManagement = () => {
  const { data: supplierData, isLoading } = useSupplierData();

  const exportSupplierData = () => {
    if (!supplierData) return;
    
    const data = {
      tanggal_cetak: new Date().toLocaleDateString('id-ID'),
      total_supplier: supplierData.totalSuppliers,
      total_produk: supplierData.totalProducts,
      detail_supplier: supplierData.suppliers
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-supplier-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Manajemen Supplier</h2>
          <p className="text-gray-600">Data supplier dan produk yang disuplai</p>
        </div>
        <Button onClick={exportSupplierData} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Supplier</p>
                <p className="text-2xl font-bold text-blue-600">
                  {supplierData?.totalSuppliers || 0}
                </p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Produk</p>
                <p className="text-2xl font-bold text-green-600">
                  {supplierData?.totalProducts || 0}
                </p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nilai Stok Total</p>
                <p className="text-2xl font-bold text-purple-600">
                  Rp {supplierData?.suppliers.reduce((sum, s) => sum + s.totalValue, 0).toLocaleString('id-ID') || '0'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Supplier List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {supplierData?.suppliers.map((supplier) => (
          <Card key={supplier.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{supplier.nama}</CardTitle>
                <Badge variant="outline">
                  {supplier.jenis || 'General'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Telepon:</p>
                    <p className="font-medium">{supplier.telepon || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email:</p>
                    <p className="font-medium">{supplier.email || 'N/A'}</p>
                  </div>
                </div>
                
                {supplier.alamat && (
                  <div className="text-sm">
                    <p className="text-gray-600">Alamat:</p>
                    <p className="font-medium">{supplier.alamat}</p>
                  </div>
                )}

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{supplier.totalProducts}</p>
                    <p className="text-xs text-gray-600">Produk</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">
                      Rp {supplier.totalValue.toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs text-gray-600">Nilai Stok</p>
                  </div>
                </div>

                {/* Top Products */}
                {supplier.products && supplier.products.length > 0 && (
                  <div className="pt-3 border-t">
                    <p className="text-sm font-medium text-gray-600 mb-2">Produk Utama:</p>
                    <div className="space-y-1">
                      {supplier.products.slice(0, 3).map((product) => (
                        <div key={product.id} className="flex items-center justify-between text-xs">
                          <span className="truncate">{product.nama}</span>
                          <span className="text-gray-500">Stok: {product.stok_saat_ini}</span>
                        </div>
                      ))}
                      {supplier.products.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{supplier.products.length - 3} produk lainnya
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )) || <p className="text-gray-500 text-center py-8 col-span-2">Tidak ada data supplier</p>}
      </div>
    </div>
  );
};

export default SupplierManagement;
