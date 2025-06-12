
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, History, DollarSign, Edit, Trash2, Printer } from 'lucide-react';
import { useStockOpname, useDeleteStockOpname, useEditStockOpname } from '@/hooks/useStockManagement';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const StockOpnameHistory = () => {
  const { data: opnameHistory, isLoading } = useStockOpname();
  const [selectedOpname, setSelectedOpname] = useState(null);
  const [editData, setEditData] = useState({ stok_fisik: 0, keterangan: '' });
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  const deleteOpname = useDeleteStockOpname();
  const editOpname = useEditStockOpname();
  const { toast } = useToast();

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
        // Access harga_beli from the joined barang_konsinyasi data
        const hargaBeli = item.barang_konsinyasi?.harga_beli || 0;
        const realStok = item.stok_fisik || 0;
        return total + (Number(hargaBeli) * realStok);
      }, 0);
  };

  const getTotalRealStock = () => {
    if (!opnameHistory) return 0;
    
    return opnameHistory
      .filter(item => item.status === 'approved')
      .reduce((total, item) => total + (item.stok_fisik || 0), 0);
  };

  const handleEdit = (opname: any) => {
    setSelectedOpname(opname);
    setEditData({
      stok_fisik: opname.stok_fisik,
      keterangan: opname.keterangan || ''
    });
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedOpname) return;
    
    try {
      await editOpname.mutateAsync({
        id: selectedOpname.id,
        stok_fisik: editData.stok_fisik,
        keterangan: editData.keterangan
      });
      
      toast({
        title: "Berhasil",
        description: "Data stok opname berhasil diperbarui"
      });
      
      setShowEditDialog(false);
      setSelectedOpname(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memperbarui data",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    
    try {
      await deleteOpname.mutateAsync(id);
      toast({
        title: "Berhasil",
        description: "Data berhasil dihapus"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus data",
        variant: "destructive"
      });
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <html>
        <head>
          <title>Riwayat Stok Opname</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { background-color: #f9f9f9; padding: 15px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Riwayat Stok Opname</h2>
            <p>Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}</p>
          </div>
          <div class="summary">
            <h3>Ringkasan:</h3>
            <p>Total Nilai Real Stok: Rp ${calculateTotalValue().toLocaleString('id-ID')}</p>
            <p>Total Real Stok: ${getTotalRealStock().toLocaleString('id-ID')} unit</p>
            <p>Total Entry: ${opnameHistory?.length || 0} entry</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Produk</th>
                <th>Stok Sistem</th>
                <th>Stok Fisik</th>
                <th>Selisih</th>
                <th>Harga Beli</th>
                <th>Nilai Real Stok</th>
                <th>Kasir</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${opnameHistory?.map((item) => {
                const selisih = (item.stok_fisik || 0) - (item.stok_sistem || 0);
                const hargaBeli = Number(item.barang_konsinyasi?.harga_beli || 0);
                const nilaiRealStok = hargaBeli * (item.stok_fisik || 0);
                return `
                  <tr>
                    <td>${format(new Date(item.tanggal_opname), 'dd/MM/yyyy')}</td>
                    <td>${item.barang_konsinyasi?.nama || 'Unknown'}</td>
                    <td>${item.stok_sistem} ${item.barang_konsinyasi?.satuan || 'pcs'}</td>
                    <td>${item.stok_fisik} ${item.barang_konsinyasi?.satuan || 'pcs'}</td>
                    <td>${selisih > 0 ? '+' : ''}${selisih}</td>
                    <td>Rp ${hargaBeli.toLocaleString('id-ID')}</td>
                    <td>Rp ${nilaiRealStok.toLocaleString('id-ID')}</td>
                    <td>${item.kasir?.nama || 'Unknown'}</td>
                    <td>${item.status || 'draft'}</td>
                  </tr>
                `;
              }).join('') || ''}
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
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
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Riwayat Stok Opname
          </div>
          <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Cetak Laporan
          </Button>
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
                  const hargaBeli = Number(item.barang_konsinyasi?.harga_beli || 0);
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
                        <div className="flex items-center gap-2">
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
                                        Rp {Number(selectedOpname.barang_konsinyasi?.harga_beli || 0).toLocaleString('id-ID')}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Nilai Real Stok</label>
                                      <p className="text-green-700 font-bold">
                                        Rp {(Number(selectedOpname.barang_konsinyasi?.harga_beli || 0) * selectedOpname.stok_fisik).toLocaleString('id-ID')}
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
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Stok Opname</DialogTitle>
          </DialogHeader>
          
          {selectedOpname && (
            <div className="space-y-4">
              <div>
                <Label>Produk</Label>
                <Input value={selectedOpname.barang_konsinyasi?.nama} disabled />
              </div>
              
              <div>
                <Label>Stok Sistem</Label>
                <Input value={`${selectedOpname.stok_sistem} ${selectedOpname.barang_konsinyasi?.satuan}`} disabled />
              </div>
              
              <div>
                <Label htmlFor="stok_fisik">Stok Fisik</Label>
                <Input
                  id="stok_fisik"
                  type="number"
                  value={editData.stok_fisik}
                  onChange={(e) => setEditData(prev => ({ ...prev, stok_fisik: Number(e.target.value) }))}
                />
              </div>
              
              <div>
                <Label htmlFor="keterangan">Keterangan</Label>
                <Textarea
                  id="keterangan"
                  value={editData.keterangan}
                  onChange={(e) => setEditData(prev => ({ ...prev, keterangan: e.target.value }))}
                  placeholder="Masukkan keterangan..."
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={editOpname.isPending}
                  className="flex-1"
                >
                  {editOpname.isPending ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default StockOpnameHistory;
