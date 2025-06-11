
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, ArrowUpCircle, ArrowDownCircle, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { useKasUmumTransactions, useCreateKasTransaction, useKasUmumSummary } from '@/hooks/useKasUmum';
import { useChartOfAccounts } from '@/hooks/useChartOfAccounts';
import { useToast } from '@/hooks/use-toast';

const KasUmum = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    jenis_transaksi: 'masuk',
    akun_id: '',
    jumlah: 0,
    keterangan: '',
    kasir_username: 'admin',
    kasir_name: 'Administrator'
  });

  const { data: transactions } = useKasUmumTransactions();
  const { data: accounts } = useChartOfAccounts();
  const { data: summary } = useKasUmumSummary();
  const createTransaction = useCreateKasTransaction();
  const { toast } = useToast();

  const handleCreateTransaction = async () => {
    try {
      await createTransaction.mutateAsync({
        ...newTransaction,
        tanggal_transaksi: new Date().toISOString().split('T')[0]
      });

      toast({
        title: "Berhasil",
        description: "Transaksi kas berhasil ditambahkan"
      });

      setIsDialogOpen(false);
      setNewTransaction({
        jenis_transaksi: 'masuk',
        akun_id: '',
        jumlah: 0,
        keterangan: '',
        kasir_username: 'admin',
        kasir_name: 'Administrator'
      });
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan saat menambahkan transaksi",
        variant: "destructive"
      });
    }
  };

  const filteredTransactions = transactions?.filter(transaction =>
    transaction.keterangan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.chart_of_accounts?.nama_akun?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const transactionsMasuk = filteredTransactions.filter(t => t.jenis_transaksi === 'masuk');
  const transactionsKeluar = filteredTransactions.filter(t => t.jenis_transaksi === 'keluar');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Kas Umum</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Transaksi
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tambah Transaksi Kas</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jenis_transaksi">Jenis Transaksi</Label>
                  <Select
                    value={newTransaction.jenis_transaksi}
                    onValueChange={(value) => setNewTransaction(prev => ({ ...prev, jenis_transaksi: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masuk">Kas Masuk</SelectItem>
                      <SelectItem value="keluar">Kas Keluar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="akun_id">Akun</Label>
                  <Select
                    value={newTransaction.akun_id}
                    onValueChange={(value) => setNewTransaction(prev => ({ ...prev, akun_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih akun" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts?.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.kode_akun} - {account.nama_akun}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="jumlah">Jumlah</Label>
                <Input
                  id="jumlah"
                  type="number"
                  value={newTransaction.jumlah}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, jumlah: parseInt(e.target.value) || 0 }))}
                  placeholder="Masukkan jumlah"
                />
              </div>

              <div>
                <Label htmlFor="keterangan">Keterangan</Label>
                <Textarea
                  id="keterangan"
                  value={newTransaction.keterangan}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, keterangan: e.target.value }))}
                  placeholder="Masukkan keterangan transaksi"
                />
              </div>

              <Button
                onClick={handleCreateTransaction}
                disabled={!newTransaction.akun_id || !newTransaction.jumlah || createTransaction.isPending}
                className="w-full"
              >
                <Wallet className="h-4 w-4 mr-2" />
                {createTransaction.isPending ? 'Menyimpan...' : 'Simpan Transaksi'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Masuk</p>
                <p className="text-2xl font-bold text-green-600">
                  Rp {(summary?.totalMasuk || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Keluar</p>
                <p className="text-2xl font-bold text-red-600">
                  Rp {(summary?.totalKeluar || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Wallet className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Saldo</p>
                <p className="text-2xl font-bold text-blue-600">
                  Rp {(summary?.saldo || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Riwayat Transaksi</CardTitle>
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="semua" className="w-full">
            <TabsList>
              <TabsTrigger value="semua">Semua ({filteredTransactions.length})</TabsTrigger>
              <TabsTrigger value="masuk" className="flex items-center gap-2">
                <ArrowUpCircle className="h-4 w-4" />
                Kas Masuk ({transactionsMasuk.length})
              </TabsTrigger>
              <TabsTrigger value="keluar" className="flex items-center gap-2">
                <ArrowDownCircle className="h-4 w-4" />
                Kas Keluar ({transactionsKeluar.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="semua" className="mt-4">
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {transaction.jenis_transaksi === 'masuk' ? (
                        <ArrowUpCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <ArrowDownCircle className="h-6 w-6 text-red-500" />
                      )}
                      <div>
                        <div className="font-medium">{transaction.chart_of_accounts?.nama_akun || 'Unknown Account'}</div>
                        <div className="text-sm text-gray-600">{transaction.keterangan || 'No description'}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(transaction.created_at).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${
                        transaction.jenis_transaksi === 'masuk' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.jenis_transaksi === 'masuk' ? '+' : '-'}Rp {transaction.jumlah.toLocaleString()}
                      </div>
                      <Badge variant="outline">
                        {transaction.jenis_transaksi === 'masuk' ? 'Masuk' : 'Keluar'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="masuk" className="mt-4">
              <div className="space-y-4">
                {transactionsMasuk.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <ArrowUpCircle className="h-6 w-6 text-green-500" />
                      <div>
                        <div className="font-medium">{transaction.chart_of_accounts?.nama_akun || 'Unknown Account'}</div>
                        <div className="text-sm text-gray-600">{transaction.keterangan || 'No description'}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(transaction.created_at).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        +Rp {transaction.jumlah.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="keluar" className="mt-4">
              <div className="space-y-4">
                {transactionsKeluar.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <ArrowDownCircle className="h-6 w-6 text-red-500" />
                      <div>
                        <div className="font-medium">{transaction.chart_of_accounts?.nama_akun || 'Unknown Account'}</div>
                        <div className="text-sm text-gray-600">{transaction.keterangan || 'No description'}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(transaction.created_at).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-red-600">
                        -Rp {transaction.jumlah.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default KasUmum;
