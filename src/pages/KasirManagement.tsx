
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User } from 'lucide-react';

const KasirManagement = () => {
  const [selectedWeek, setSelectedWeek] = useState('current');

  const kasirData = [
    { id: 1, nama: 'Ahmad Suharto', status: 'aktif', shift: 'Pagi (07:00-15:00)' },
    { id: 2, nama: 'Siti Nurhaliza', status: 'aktif', shift: 'Siang (15:00-23:00)' },
    { id: 3, nama: 'Budi Santoso', status: 'libur', shift: 'Pagi (07:00-15:00)' },
    { id: 4, nama: 'Rina Marlina', status: 'aktif', shift: 'Siang (15:00-23:00)' }
  ];

  const jadwalMingguan = [
    { hari: 'Senin', pagi: 'Ahmad', siang: 'Siti' },
    { hari: 'Selasa', pagi: 'Budi', siang: 'Rina' },
    { hari: 'Rabu', pagi: 'Ahmad', siang: 'Siti' },
    { hari: 'Kamis', pagi: 'Rina', siang: 'Budi' },
    { hari: 'Jumat', pagi: 'Siti', siang: 'Ahmad' },
    { hari: 'Sabtu', pagi: 'Budi', siang: 'Rina' },
    { hari: 'Minggu', pagi: 'Ahmad', siang: 'Siti' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Kasir</h1>
          <p className="text-gray-600">Kelola jadwal shift dan monitoring kasir</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Status Kasir Hari Ini */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Status Kasir Hari Ini</span>
              </CardTitle>
              <CardDescription>Monitoring kasir yang sedang bertugas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {kasirData.map((kasir) => (
                  <div key={kasir.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{kasir.nama}</p>
                      <p className="text-sm text-gray-600">{kasir.shift}</p>
                    </div>
                    <Badge variant={kasir.status === 'aktif' ? 'default' : 'secondary'}>
                      {kasir.status === 'aktif' ? 'Bertugas' : 'Libur'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shift Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Informasi Shift</span>
              </CardTitle>
              <CardDescription>Jam kerja dan pembagian shift</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900">Shift Pagi</h3>
                  <p className="text-blue-700">07:00 - 15:00 WIB</p>
                  <p className="text-sm text-blue-600 mt-1">Kasir: Ahmad & Budi (Bergiliran)</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h3 className="font-medium text-orange-900">Shift Siang</h3>
                  <p className="text-orange-700">15:00 - 23:00 WIB</p>
                  <p className="text-sm text-orange-600 mt-1">Kasir: Siti & Rina (Bergiliran)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Jadwal Mingguan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Jadwal Mingguan</span>
            </CardTitle>
            <CardDescription>Pembagian jadwal shift untuk minggu ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Hari</th>
                    <th className="text-left p-3 font-medium">Shift Pagi (07:00-15:00)</th>
                    <th className="text-left p-3 font-medium">Shift Siang (15:00-23:00)</th>
                  </tr>
                </thead>
                <tbody>
                  {jadwalMingguan.map((jadwal, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{jadwal.hari}</td>
                      <td className="p-3">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {jadwal.pagi}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="bg-orange-50 text-orange-700">
                          {jadwal.siang}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex space-x-2">
              <Button variant="outline">Edit Jadwal</Button>
              <Button variant="outline">Cetak Jadwal</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KasirManagement;
