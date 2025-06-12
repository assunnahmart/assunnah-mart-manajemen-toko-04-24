
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Info, Calendar, RefreshCw, Download, Clock, User, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface AuditTrailItem {
  id: string;
  tanggal_opname: string;
  nama_barang: string;
  nama_kasir: string;
  stok_sistem: number;
  stok_fisik: number;
  selisih: number;
  keterangan?: string;
  status: string;
  created_at: string;
}

const NewStokAuditTrail = () => {
  const [dateFrom, setDateFrom] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterKasir, setFilterKasir] = useState('all');

  const { data: auditData, isLoading, error, refetch } = useQuery({
    queryKey: ['stock_opname_audit', dateFrom, dateTo, filterStatus, filterKasir],
    queryFn: async (): Promise<AuditTrailItem[]> => {
      console.log('Fetching audit trail for period:', { dateFrom, dateTo, filterStatus, filterKasir });
      
      let query = supabase
        .from('stok_opname')
        .select(`
          id,
          tanggal_opname,
          stok_sistem,
          stok_fisik,
          selisih,
          keterangan,
          status,
          created_at,
          barang_konsinyasi(nama),
          kasir(nama)
        `)
        .gte('tanggal_opname', dateFrom)
        .lte('tanggal_opname', dateTo)
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching audit trail:', error);
        throw error;
      }
      
      const transformedData: AuditTrailItem[] = (data || []).map(item => ({
        id: item.id,
        tanggal_opname: item.tanggal_opname,
        nama_barang: item.barang_konsinyasi?.nama || 'Produk Tidak Ditemukan',
        nama_kasir: item.kasir?.nama || 'Kasir Tidak Ditemukan',
        stok_sistem: item.stok_sistem,
        stok_fisik: item.stok_fisik,
        selisih: item.selisih || (item.stok_fisik - item.stok_sistem),
        keterangan: item.keterangan,
        status: item.status,
        created_at: item.created_at
      }));

      // Filter by kasir if specified
      if (filterKasir !== 'all') {
        return transformedData.filter(item => item.nama_kasir === filterKasir);
      }
      
      return transformedData;
    },
    enabled: !!dateFrom && !!dateTo,
  });

  const { data: kasirList } = useQuery({
    queryKey: ['kasir_list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kasir')
        .select('id, nama')
        .eq('status', 'aktif')
        .order('nama');
      
      if (error) throw error;
      return data;
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 text-white">Disetujui</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 text-white">Ditolak</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSelisihBadge = (selisih: number) => {
    if (selisih > 0) return <Badge className="bg-yellow-500 text-white">+{selisih}</Badge>;
    if (selisih < 0) return <Badge className="bg-red-500 text-white">{selisih}</Badge>;
    return <Badge className="bg-green-500 text-white">0</Badge>;
  };

  const handleExport = () => {
    if (!auditData || auditData.length === 0) return;
    
    const csvContent = [
      ['Tanggal', 'Waktu Input', 'Produk', 'Kasir', 'Stok Sistem', 'Stok Fisik', 'Selisih', 'Status', 'Keterangan'],
      ...auditData.map(item => [
        format(new Date(item.tanggal_opname), 'dd/MM/yyyy'),
        format(new Date(item.created_at), 'HH:mm:ss'),
        item.nama_barang,
        item.nama_kasir,
        item.stok_sistem,
        item.stok_fisik,
        item.selisih,
        item.status,
        item.keterangan || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${dateFrom}-${dateTo}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalEntries = auditData?.length || 0;
  const approvedEntries = auditData?.filter(item => item.status === 'approved').length || 0;
  const pendingEntries = auditData?.filter(item => item.status === 'pending').length || 0;

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Audit Trail New Stok:</strong> Jejak audit lengkap semua aktivitas stok opname untuk compliance dan transparansi sistem.
        </AlertDescription>
      </Alert>

      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filter Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div>
              <Label htmlFor="dateFrom">Tanggal Mulai</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">Tanggal Selesai</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="approved">Disetujui</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Kasir</Label>
              <Select value={filterKasir} onValueChange={setFilterKasir}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kasir..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kasir</SelectItem>
                  {kasirList?.map((kasir) => (
                    <SelectItem key={kasir.id} value={kasir.nama}>
                      {kasir.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => refetch()} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              <p>Total entri: {totalEntries}</p>
              <p>Disetujui: {approvedEntries}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Aktivitas</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold text-blue-600">{totalEntries}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Disetujui</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold text-green-600">{approvedEntries}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold text-yellow-600">{pendingEntries}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Trail Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Detail Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Memuat audit trail...</p>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Error: {error.message}
              </AlertDescription>
            </Alert>
          ) : auditData?.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">
                Belum ada aktivitas audit untuk periode yang dipilih
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Waktu Input</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead>Kasir</TableHead>
                    <TableHead>Stok Sistem</TableHead>
                    <TableHead>Stok Fisik</TableHead>
                    <TableHead>Selisih</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Keterangan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditData?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {format(new Date(item.tanggal_opname), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          {format(new Date(item.created_at), 'HH:mm:ss')}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.nama_barang}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-gray-400" />
                          {item.nama_kasir}
                        </div>
                      </TableCell>
                      <TableCell>{item.stok_sistem}</TableCell>
                      <TableCell>{item.stok_fisik}</TableCell>
                      <TableCell>
                        {getSelisihBadge(item.selisih)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(item.status)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {item.keterangan || '-'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NewStokAuditTrail;
