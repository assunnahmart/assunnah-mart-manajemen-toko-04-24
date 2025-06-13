
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { usePurchaseReturns, useSalesReturns, useApproveReturn } from '@/hooks/useReturTransactions';
import { useToast } from '@/hooks/use-toast';

const ReturnsHistory = () => {
  const { data: purchaseReturns, isLoading: loadingPurchaseReturns } = usePurchaseReturns();
  const { data: salesReturns, isLoading: loadingSalesReturns } = useSalesReturns();
  const approveReturn = useApproveReturn();
  const { toast } = useToast();

  const handleApprove = async (id: string, type: 'purchase' | 'sales') => {
    try {
      await approveReturn.mutateAsync({ id, type });
      toast({
        title: "Retur disetujui",
        description: "Retur telah disetujui dan stok sudah diperbarui"
      });
    } catch (error: any) {
      toast({
        title: "Gagal menyetujui retur",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Disetujui</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Ditolak</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <Tabs defaultValue="purchase-returns">
      <TabsList className="mb-4">
        <TabsTrigger value="purchase-returns">Retur Pembelian</TabsTrigger>
        <TabsTrigger value="sales-returns">Retur Penjualan</TabsTrigger>
      </TabsList>

      <TabsContent value="purchase-returns">
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Retur Pembelian</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingPurchaseReturns ? (
              <div className="text-center py-4">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nomor Retur</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Alasan</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseReturns?.map((retur) => (
                    <TableRow key={retur.id}>
                      <TableCell className="font-medium">{retur.nomor_retur}</TableCell>
                      <TableCell>{new Date(retur.tanggal_retur).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell>{retur.supplier?.nama}</TableCell>
                      <TableCell>Rp {retur.total_retur.toLocaleString('id-ID')}</TableCell>
                      <TableCell>{getStatusBadge(retur.status)}</TableCell>
                      <TableCell className="max-w-xs truncate">{retur.alasan_retur}</TableCell>
                      <TableCell>
                        {retur.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleApprove(retur.id, 'purchase')}
                            disabled={approveReturn.isPending}
                          >
                            Setujui
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="sales-returns">
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Retur Penjualan</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSalesReturns ? (
              <div className="text-center py-4">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nomor Retur</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Alasan</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesReturns?.map((retur) => (
                    <TableRow key={retur.id}>
                      <TableCell className="font-medium">{retur.nomor_retur}</TableCell>
                      <TableCell>{new Date(retur.tanggal_retur).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell>{retur.pelanggan_name || '-'}</TableCell>
                      <TableCell>Rp {retur.total_retur.toLocaleString('id-ID')}</TableCell>
                      <TableCell>
                        <Badge variant={retur.jenis_retur === 'uang' ? 'default' : 'secondary'}>
                          {retur.jenis_retur === 'uang' ? 'Refund' : 'Tukar Barang'}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(retur.status)}</TableCell>
                      <TableCell className="max-w-xs truncate">{retur.alasan_retur}</TableCell>
                      <TableCell>
                        {retur.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleApprove(retur.id, 'sales')}
                            disabled={approveReturn.isPending}
                          >
                            Setujui
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default ReturnsHistory;
