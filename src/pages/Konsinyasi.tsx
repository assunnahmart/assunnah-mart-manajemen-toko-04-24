
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Calendar, AlertTriangle } from 'lucide-react';

const Konsinyasi = () => {
  const [activeTab, setActiveTab] = useState('harian');

  const konsinyasiHarian = [
    { id: 1, nama: 'Roti Tawar', supplier: 'Toko Roti Sari', stok: 45, minimal: 20, status: 'aman' },
    { id: 2, nama: 'Susu Segar', supplier: 'Koperasi Susu', stok: 12, minimal: 15, status: 'kurang' },
    { id: 3, nama: 'Telur Ayam', supplier: 'Peternakan Jaya', stok: 30, minimal: 25, status: 'aman' },
    { id: 4, nama: 'Sayur Segar', supplier: 'Kebun Pak Tani', stok: 8, minimal: 10, status: 'kurang' }
  ];

  const konsinyasiMingguan = [
    { id: 1, nama: 'Snack Kemasan', supplier: 'Distributor ABC', stok: 120, minimal: 50, status: 'aman' },
    { id: 2, nama: 'Minuman Ringan', supplier: 'PT Segar Jaya', stok: 35, minimal: 40, status: 'kurang' },
    { id: 3, nama: 'Mie Instan', supplier: 'Grosir Berkah', stok: 200, minimal: 100, status: 'aman' },
    { id: 4, nama: 'Deterjen', supplier: 'Supplier Rumah Tangga', stok: 25, minimal: 30, status: 'kurang' }
  ];

  const getStatusColor = (status: string) => {
    return status === 'aman' ? 'bg-green-500' : 'bg-red-500';
  };

  const renderStokTable = (data: any[], type: string) => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Stok {type === 'harian' ? 'Harian' : 'Mingguan'}</h3>
        <Button variant="outline">Cek Stok Semua</Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 font-medium">Nama Barang</th>
              <th className="text-left p-3 font-medium">Supplier</th>
              <th className="text-left p-3 font-medium">Stok Saat Ini</th>
              <th className="text-left p-3 font-medium">Stok Minimal</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{item.nama}</td>
                <td className="p-3 text-gray-600">{item.supplier}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-white text-sm ${getStatusColor(item.status)}`}>
                    {item.stok}
                  </span>
                </td>
                <td className="p-3">{item.minimal}</td>
                <td className="p-3">
                  <div className="flex items-center space-x-1">
                    {item.status === 'kurang' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    <Badge variant={item.status === 'aman' ? 'default' : 'destructive'}>
                      {item.status === 'aman' ? 'Aman' : 'Perlu Restock'}
                    </Badge>
                  </div>
                </td>
                <td className="p-3">
                  <Button size="sm" variant="outline">Update</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Konsinyasi</h1>
          <p className="text-gray-600">Kelola stok barang konsinyasi harian dan mingguan</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Item Harian</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{konsinyasiHarian.length}</div>
              <p className="text-xs text-gray-500 mt-1">Jenis barang</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Item Mingguan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{konsinyasiMingguan.length}</div>
              <p className="text-xs text-gray-500 mt-1">Jenis barang</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Perlu Restock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {[...konsinyasiHarian, ...konsinyasiMingguan].filter(item => item.status === 'kurang').length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Items menipis</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Status Aman</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {[...konsinyasiHarian, ...konsinyasiMingguan].filter(item => item.status === 'aman').length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Items tersedia</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Monitoring Stok Konsinyasi</span>
            </CardTitle>
            <CardDescription>Pantau stok barang konsinyasi yang bisa dicek setiap hari</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="harian" className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Konsinyasi Harian</span>
                </TabsTrigger>
                <TabsTrigger value="mingguan" className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Konsinyasi Mingguan</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="harian" className="mt-6">
                {renderStokTable(konsinyasiHarian, 'harian')}
              </TabsContent>
              
              <TabsContent value="mingguan" className="mt-6">
                {renderStokTable(konsinyasiMingguan, 'mingguan')}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Konsinyasi;
