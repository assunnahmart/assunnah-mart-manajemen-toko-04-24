
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, History, DollarSign } from 'lucide-react';
import { useStockOpname } from '@/hooks/useStockManagement';
import { format } from 'date-fns';

const StockOpnameHistory = () => {
  const { data: opnameHistory, isLoading } = useStockOpname();
  const [selectedOpname, setSelectedOpname] = useState(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500">Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  const calculateTotalValue = () => {
    if (!opnameHistory) return 0;
    
    return opnameHistory
      .filter(item => item.status === 'approved')
      .reduce((total, item) => {
        const hargaBeli = item.barang_konsinyasi?.harga_beli || 0;
        const realStok = item.stok_fisik || 0;
        return total + (hargaBeli * realStok);
      }, 0);
  };

  const getTotalRealStock = () => {
    if (!opnameHistory) return 0;
    
    return opnameHistory
      .filter(item => item.status === 'approved')
      .reduce((total, item) => total + (item.stok_fisik || 0), 0);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          Memuat riwayat stok opname...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Riwayat Stok Opname
        </CardTitle>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Nilai Real Stok</p>
                  <p className="text-lg font-bold text-green-600">
                    Rp {calculateTotalValue().toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Real Stok</p>
                  <p className="text-lg font-bold text-blue-600">
                    {getTotalRealStock().toLocaleString('id-ID')} unit
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Entry</p>
                  <p className="text-lg font-bold text-purple-600">
                    {opnameHistory?.length || 0} entry
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardHeader>
      
      <CardContent>
        {opnameHistory?.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada riwayat stok opname</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Produk</TableHead>
                  <TableHead>Stok Sistem</TableHead>
                  <TableHead>Stok Fisik</TableHead>
                  <TableHead>Selisih</TableHead>
                  <TableHead>Harga Beli</TableHead>
                  <TableHead>Nilai Real Stok</TableHead>
                  <TableHead>Kasir</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {opnameHistory?.map((item) => {
                  const selisih = (item.stok_fisik || 0) - (item.stok_sistem || 0);
                  const hargaBeli = item.barang_konsinyasi?.harga_beli || 0;
                  const nilaiRealStok = hargaBeli * (item.stok_fisik || 0);
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        {format(new Date(item.tanggal_opname), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.barang_konsinyasi?.nama || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <span className="text-blue-600 font-medium">
                          {item.stok_sistem} {item.barang_konsinyasi?.satuan || 'pcs'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-green-600 font-medium">
                          {item.stok_fisik} {item.barang_konsinyasi?.satuan || 'pcs'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${
                          selisih > 0 ? 'text-green-600' : 
                          selisih < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {selisih > 0 ? '+' : ''}{selisih}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          Rp {hargaBeli.toLocaleString('id-ID')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-green-700">
                          Rp {nilaiRealStok.toLocaleString('id-ID')}
                        </span>
                      </TableCell>
                      <TableCell>{item.kasir?.nama || 'Unknown'}</TableCell>
                      <TableCell>{getStatusBadge(item.status || 'draft')}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedOpname(item)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Detail Stok Opname</DialogTitle>
                            </DialogHeader>
                            {selectedOpname && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Produk</label>
                                    <p>{selectedOpname.barang_konsinyasi?.nama}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Tanggal</label>
                                    <p>{format(new Date(selectedOpname.tanggal_opname), 'dd/MM/yyyy')}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Stok Sistem</label>
                                    <p className="text-blue-600 font-medium">
                                      {selectedOpname.stok_sistem} {selectedOpname.barang_konsinyasi?.satuan}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Stok Fisik</label>
                                    <p className="text-green-600 font-medium">
                                      {selectedOpname.stok_fisik} {selectedOpname.barang_konsinyasi?.satuan}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Harga Beli</label>
                                    <p className="text-gray-700">
                                      Rp {(selectedOpname.barang_konsinyasi?.harga_beli || 0).toLocaleString('id-ID')}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Nilai Real Stok</label>
                                    <p className="text-green-700 font-bold">
                                      Rp {((selectedOpname.barang_konsinyasi?.harga_beli || 0) * selectedOpname.stok_fisik).toLocaleString('id-ID')}
                                    </p>
                                  </div>
                                </div>
                                
                                {selectedOpname.keterangan && (
                                  <div>
                                    <label className="text-sm font-medium">Keterangan</label>
                                    <p className="text-gray-600">{selectedOpname.keterangan}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockOpnameHistory;
