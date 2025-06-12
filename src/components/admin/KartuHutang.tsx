
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Plus, FileText, Calendar, DollarSign, User, Building2, TrendingUp, CreditCard } from 'lucide-react';
import { usePelangganKredit } from '@/hooks/usePelanggan';
import { usePiutangPelanggan, useTodayCreditSales, useKasUmumSummary } from '@/hooks/usePiutang';

const KartuHutang = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const { data: pelangganKredit } = usePelangganKredit();
  const { data: piutangData } = usePiutangPelanggan();
  const { data: creditSales } = useTodayCreditSales();
  const { data: kasUmumData } = useKasUmumSummary();

  // Combine both unit and perorangan customers
  const allCustomers = [
    ...(pelangganKredit?.unit || []),
    ...(pelangganKredit?.perorangan || [])
  ];

  const filteredCustomers = allCustomers.filter(customer =>
    customer.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.nama_unit && customer.nama_unit.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Kartu Hutang Pelanggan</h1>
          <p className="text-gray-600">Kelola piutang pelanggan terintegrasi dengan POS dan Kas Umum</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Buat Kartu Baru
        </Button>
      </div>

      {/* Summary Cards - Sync with POS and Kas Umum */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Piutang</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              Rp {(piutangData?.totalPiutang || 0).toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {piutangData?.totalCreditCustomers || 0} pelanggan kredit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kredit Hari Ini</CardTitle>
            <CreditCard className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              Rp {(creditSales?.totalCreditSales || 0).toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {creditSales?.totalCreditTransactions || 0} transaksi kredit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kas Masuk Hari Ini</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Rp {(kasUmumData?.kasMasuk || 0).toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Saldo: Rp {(kasUmumData?.saldoKas || 0).toLocaleString('id-ID')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unit vs Perorangan</CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-blue-600">
              {(piutangData?.pelangganUnit?.length || 0)} : {(piutangData?.pelangganPerorangan?.length || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Unit : Perorangan
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daftar Pelanggan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Daftar Pelanggan
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari pelanggan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedCustomer?.id === customer.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <div className="font-medium">{customer.nama}</div>
                  {customer.nama_unit && (
                    <div className="text-sm text-gray-600">{customer.nama_unit}</div>
                  )}
                  <div className="text-sm text-gray-500">{customer.telepon || 'No phone'}</div>
                  <div className="flex justify-between items-center mt-1">
                    <Badge variant={(customer.total_tagihan || customer.sisa_piutang) > 0 ? 'destructive' : 'default'}>
                      Rp {((customer.total_tagihan || 0) + (customer.sisa_piutang || 0)).toLocaleString('id-ID')}
                    </Badge>
                    <Badge variant="outline">
                      Limit: Rp {(customer.limit_kredit || 0).toLocaleString('id-ID')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            {filteredCustomers.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                {searchTerm ? 'Tidak ada pelanggan yang ditemukan' : 'Belum ada data pelanggan'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detail Kartu Hutang */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Kartu Hutang - {selectedCustomer ? selectedCustomer.nama : 'Pilih Pelanggan'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedCustomer ? (
              <div className="space-y-6">
                {/* Info Pelanggan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Nama Lengkap</Label>
                    <div className="font-medium">{selectedCustomer.nama}</div>
                  </div>
                  {selectedCustomer.nama_unit && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Unit/Perusahaan</Label>
                      <div className="font-medium">{selectedCustomer.nama_unit}</div>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Jabatan</Label>
                    <div className="font-medium">{selectedCustomer.jabatan || '-'}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Telepon</Label>
                    <div className="font-medium">{selectedCustomer.telepon || '-'}</div>
                  </div>
                </div>

                {/* Info Keuangan */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-red-500" />
                        <div>
                          <div className="text-sm text-gray-600">Total Hutang</div>
                          <div className="font-bold text-red-600">
                            Rp {((selectedCustomer.total_tagihan || 0) + (selectedCustomer.sisa_piutang || 0)).toLocaleString('id-ID')}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="text-sm text-gray-600">Limit Kredit</div>
                          <div className="font-bold text-blue-600">
                            Rp {(selectedCustomer.limit_kredit || 0).toLocaleString('id-ID')}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="text-sm text-gray-600">Status</div>
                          <Badge variant={selectedCustomer.status === 'aktif' ? 'default' : 'destructive'}>
                            {selectedCustomer.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Info Tambahan */}
                <div>
                  <Label className="text-sm font-medium text-gray-600">Alamat</Label>
                  <div className="font-medium">{selectedCustomer.alamat || '-'}</div>
                </div>

                {/* Sync Info */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Sinkronisasi Data</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>• Data tersinkron dengan sistem POS real-time</p>
                    <p>• Transaksi kredit otomatis masuk ke kas umum</p>
                    <p>• Update otomatis setiap 30 detik</p>
                  </div>
                </div>

                {/* Aksi */}
                <div className="flex gap-2">
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Cetak Kartu
                  </Button>
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Riwayat Transaksi
                  </Button>
                  <Button>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Bayar Hutang
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>Pilih pelanggan dari daftar untuk melihat kartu hutang</p>
                <p className="text-sm mt-2">Data akan tersinkron otomatis dengan POS dan Kas Umum</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KartuHutang;
