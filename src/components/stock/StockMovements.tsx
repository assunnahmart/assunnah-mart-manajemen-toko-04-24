
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TrendingUp, TrendingDown, Package, Search, Filter, Edit, Trash2, Printer, Plus } from 'lucide-react';
import { useStockMutations, useDeleteStockMutation, useEditStockMutation } from '@/hooks/useStockManagement';
import { useToast } from '@/hooks/use-toast';

const StockMovements = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [selectedMutation, setSelectedMutation] = useState(null);
  const [editKeterangan, setEditKeterangan] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  const { data: mutations, isLoading } = useStockMutations();
  const deleteMutation = useDeleteStockMutation();
  const editMutation = useEditStockMutation();
  const { toast } = useToast();

  const filteredMutations = mutations?.filter(mutation => {
    const matchesSearch = mutation.barang_konsinyasi?.nama
      ?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || mutation.jenis_mutasi === filterType;
    const matchesSource = filterSource === 'all' || mutation.referensi_tipe === filterSource;
    
    return matchesSearch && matchesType && matchesSource;
  }) || [];

  const handleEdit = (mutation: any) => {
    setSelectedMutation(mutation);
    setEditKeterangan(mutation.keterangan || '');
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedMutation) return;
    
    try {
      await editMutation.mutateAsync({
        id: selectedMutation.id,
        keterangan: editKeterangan
      });
      
      toast({
        title: "Berhasil",
        description: "Keterangan berhasil diperbarui"
      });
      
      setShowEditDialog(false);
      setSelectedMutation(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memperbarui keterangan",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    
    try {
      await deleteMutation.mutateAsync(id);
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
          <title>Laporan Pergerakan Stok</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 30px; }
            .date { text-align: right; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Laporan Pergerakan Stok</h2>
          </div>
          <div class="date">
            Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}
          </div>
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Produk</th>
                <th>Jenis</th>
                <th>Jumlah</th>
                <th>Stok Sebelum</th>
                <th>Stok Sesudah</th>
                <th>Sumber</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              ${filteredMutations.map(mutation => `
                <tr>
                  <td>${new Date(mutation.created_at).toLocaleDateString('id-ID')}</td>
                  <td>${mutation.barang_konsinyasi?.nama}</td>
                  <td>${mutation.jenis_mutasi}</td>
                  <td>${mutation.jumlah}</td>
                  <td>${mutation.stok_sebelum}</td>
                  <td>${mutation.stok_sesudah}</td>
                  <td>${mutation.referensi_tipe}</td>
                  <td>${mutation.keterangan || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const getMovementIcon = (type: string) => {
    return type === 'masuk' ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getMovementBadge = (type: string) => {
    return type === 'masuk' ? (
      <Badge variant="default" className="bg-green-100 text-green-800">Masuk</Badge>
    ) : (
      <Badge variant="destructive" className="bg-red-100 text-red-800">Keluar</Badge>
    );
  };

  const getSourceBadge = (source: string) => {
    const sourceMap = {
      'penjualan': { label: 'Penjualan POS', color: 'bg-blue-100 text-blue-800' },
      'pembelian': { label: 'Pembelian', color: 'bg-purple-100 text-purple-800' },
      'stock_opname': { label: 'Stock Opname', color: 'bg-orange-100 text-orange-800' },
      'manual_adjustment': { label: 'Adjustment', color: 'bg-gray-100 text-gray-800' }
    };
    
    const sourceInfo = sourceMap[source] || { label: source, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge variant="outline" className={sourceInfo.color}>
        {sourceInfo.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Pergerakan Stok Real-time
          </div>
          <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Cetak Laporan
          </Button>
        </CardTitle>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Jenis Mutasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Jenis</SelectItem>
              <SelectItem value="masuk">Masuk</SelectItem>
              <SelectItem value="keluar">Keluar</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterSource} onValueChange={setFilterSource}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Sumber" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Sumber</SelectItem>
              <SelectItem value="penjualan">Penjualan POS</SelectItem>
              <SelectItem value="pembelian">Pembelian</SelectItem>
              <SelectItem value="stock_opname">Stock Opname</SelectItem>
              <SelectItem value="manual_adjustment">Adjustment</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Produk</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Stok Sebelum</TableHead>
                <TableHead>Stok Sesudah</TableHead>
                <TableHead>Sumber</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMutations.map((mutation) => (
                <TableRow key={mutation.id}>
                  <TableCell>
                    {new Date(mutation.created_at).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell className="font-medium">
                    {mutation.barang_konsinyasi?.nama}
                    <p className="text-xs text-gray-500">
                      {mutation.barang_konsinyasi?.satuan}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getMovementIcon(mutation.jenis_mutasi)}
                      {getMovementBadge(mutation.jenis_mutasi)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${
                      mutation.jenis_mutasi === 'masuk' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {mutation.jenis_mutasi === 'masuk' ? '+' : '-'}{mutation.jumlah}
                    </span>
                  </TableCell>
                  <TableCell>{mutation.stok_sebelum}</TableCell>
                  <TableCell>{mutation.stok_sesudah}</TableCell>
                  <TableCell>
                    {getSourceBadge(mutation.referensi_tipe)}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {mutation.keterangan || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(mutation)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {mutation.referensi_tipe === 'manual_adjustment' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(mutation.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {filteredMutations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Tidak ada data pergerakan stok yang ditemukan
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Keterangan Mutasi Stok</DialogTitle>
          </DialogHeader>
          
          {selectedMutation && (
            <div className="space-y-4">
              <div>
                <Label>Produk</Label>
                <Input value={selectedMutation.barang_konsinyasi?.nama} disabled />
              </div>
              
              <div>
                <Label>Jenis Mutasi</Label>
                <Input value={selectedMutation.jenis_mutasi} disabled />
              </div>
              
              <div>
                <Label>Jumlah</Label>
                <Input value={selectedMutation.jumlah} disabled />
              </div>
              
              <div>
                <Label htmlFor="keterangan">Keterangan</Label>
                <Textarea
                  id="keterangan"
                  value={editKeterangan}
                  onChange={(e) => setEditKeterangan(e.target.value)}
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
                  disabled={editMutation.isPending}
                  className="flex-1"
                >
                  {editMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default StockMovements;
