
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Building, Users, Wallet } from 'lucide-react';

const PenjualanKredit = () => {
  const [activeTab, setActiveTab] = useState('unit');

  const pelangganUnit = [
    { id: 1, nama: 'Unit A - Perumahan Indah', jenisPayment: 'cash', totalTagihan: 2500000, status: 'aktif' },
    { id: 2, nama: 'Unit B - Komplek Mawar', jenisPayment: 'kredit', totalTagihan: 1800000, status: 'menunggak' },
    { id: 3, nama: 'Unit C - Perum Melati', jenisPayment: 'cash', totalTagihan: 3200000, status: 'aktif' },
  ];

  const pelangganPerorangan = [
    { id: 1, nama: 'Budi Santoso', jabatan: 'Staff IT', gaji: 5000000, potongGaji: 500000, sisaPiutang: 1200000 },
    { id: 2, nama: 'Siti Rahayu', jabatan: 'Admin', gaji: 3500000, potongGaji: 350000, sisaPiutang: 800000 },
    { id: 3, nama: 'Ahmad Fauzi', jabatan: 'Security', gaji: 3000000, potongGaji: 300000, sisaPiutang: 600000 },
  ];

  const riwayatTransaksi = [
    { id: 1, tanggal: '2024-05-30', pelanggan: 'Unit A', jumlah: 250000, jenis: 'cash', status: 'lunas' },
    { id: 2, tanggal: '2024-05-30', pelanggan: 'Budi Santoso', jumlah: 500000, jenis: 'potong_gaji', status: 'kredit' },
    { id: 3, tanggal: '2024-05-29', pelanggan: 'Unit B', jumlah: 180000, jenis: 'kredit', status: 'belum_lunas' },
  ];

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Penjualan Kredit</h1>
          <p className="text-gray-600">Kelola penjualan kredit untuk unit dan perorangan dengan sistem potong gaji</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Piutang Unit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatRupiah(pelangganUnit.reduce((sum, unit) => sum + unit.totalTagihan, 0))}
              </div>
              <p className="text-xs text-gray-500 mt-1">{pelangganUnit.length} unit</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Piutang Perorangan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatRupiah(pelangganPerorangan.reduce((sum, person) => sum + person.sisaPiutang, 0))}
              </div>
              <p className="text-xs text-gray-500 mt-1">{pelangganPerorangan.length} orang</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Potong Gaji Bulan Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatRupiah(pelangganPerorangan.reduce((sum, person) => sum + person.potongGaji, 0))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Total potongan</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Transaksi Hari Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {riwayatTransaksi.filter(t => t.tanggal === '2024-05-30').length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Transaksi</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Manajemen Penjualan Kredit</span>
            </CardTitle>
            <CardDescription>Kelola pelanggan unit dan perorangan dengan berbagai sistem pembayaran</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="unit" className="flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <span>Pelanggan Unit</span>
                </TabsTrigger>
                <TabsTrigger value="perorangan" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Perorangan</span>
                </TabsTrigger>
                <TabsTrigger value="riwayat" className="flex items-center space-x-2">
                  <Wallet className="h-4 w-4" />
                  <span>Riwayat</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="unit" className="mt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Pelanggan Unit</h3>
                    <Button>Tambah Unit Baru</Button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">Nama Unit</th>
                          <th className="text-left p-3 font-medium">Jenis Pembayaran</th>
                          <th className="text-left p-3 font-medium">Total Tagihan</th>
                          <th className="text-left p-3 font-medium">Status</th>
                          <th className="text-left p-3 font-medium">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pelangganUnit.map((unit) => (
                          <tr key={unit.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{unit.nama}</td>
                            <td className="p-3">
                              <Badge variant={unit.jenisPayment === 'cash' ? 'default' : 'secondary'}>
                                {unit.jenisPayment === 'cash' ? 'Cash' : 'Kredit'}
                              </Badge>
                            </td>
                            <td className="p-3 font-semibold text-blue-600">
                              {formatRupiah(unit.totalTagihan)}
                            </td>
                            <td className="p-3">
                              <Badge variant={unit.status === 'aktif' ? 'default' : 'destructive'}>
                                {unit.status === 'aktif' ? 'Aktif' : 'Menunggak'}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <Button size="sm" variant="outline">Detail</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="perorangan" className="mt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Pelanggan Perorangan (Sistem Potong Gaji)</h3>
                    <Button>Tambah Pelanggan</Button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">Nama</th>
                          <th className="text-left p-3 font-medium">Jabatan</th>
                          <th className="text-left p-3 font-medium">Gaji</th>
                          <th className="text-left p-3 font-medium">Potong Gaji</th>
                          <th className="text-left p-3 font-medium">Sisa Piutang</th>
                          <th className="text-left p-3 font-medium">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pelangganPerorangan.map((person) => (
                          <tr key={person.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{person.nama}</td>
                            <td className="p-3 text-gray-600">{person.jabatan}</td>
                            <td className="p-3">{formatRupiah(person.gaji)}</td>
                            <td className="p-3 text-orange-600 font-semibold">
                              {formatRupiah(person.potongGaji)}
                            </td>
                            <td className="p-3 text-red-600 font-semibold">
                              {formatRupiah(person.sisaPiutang)}
                            </td>
                            <td className="p-3">
                              <Button size="sm" variant="outline">Detail</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="riwayat" className="mt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Riwayat Transaksi Kredit</h3>
                    <Button variant="outline">Export Data</Button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">Tanggal</th>
                          <th className="text-left p-3 font-medium">Pelanggan</th>
                          <th className="text-left p-3 font-medium">Jumlah</th>
                          <th className="text-left p-3 font-medium">Jenis</th>
                          <th className="text-left p-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {riwayatTransaksi.map((transaksi) => (
                          <tr key={transaksi.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">{transaksi.tanggal}</td>
                            <td className="p-3 font-medium">{transaksi.pelanggan}</td>
                            <td className="p-3 font-semibold text-green-600">
                              {formatRupiah(transaksi.jumlah)}
                            </td>
                            <td className="p-3">
                              <Badge variant="outline">
                                {transaksi.jenis === 'cash' ? 'Cash' : 
                                 transaksi.jenis === 'kredit' ? 'Kredit' : 'Potong Gaji'}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <Badge variant={transaksi.status === 'lunas' ? 'default' : 'destructive'}>
                                {transaksi.status === 'lunas' ? 'Lunas' : 
                                 transaksi.status === 'kredit' ? 'Kredit' : 'Belum Lunas'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PenjualanKredit;
