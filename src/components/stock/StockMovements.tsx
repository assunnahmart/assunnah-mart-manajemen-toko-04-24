
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Package, Search, Filter } from 'lucide-react';
import { useStockMutations } from '@/hooks/useStockManagement';

const StockMovements = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  
  const { data: mutations, isLoading } = useStockMutations();

  const filteredMutations = mutations?.filter(mutation => {
    const matchesSearch = mutation.barang_konsinyasi?.nama
      ?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || mutation.jenis_mutasi === filterType;
    const matchesSource = filterSource === 'all' || mutation.referensi_tipe === filterSource;
    
    return matchesSearch && matchesType && matchesSource;
  }) || [];

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
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Pergerakan Stok Real-time
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
    </Card>
  );
};

export default StockMovements;
