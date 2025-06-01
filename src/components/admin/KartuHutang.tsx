
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePiutangPelanggan } from '@/hooks/usePiutang';
import { Download, CreditCard, AlertTriangle } from 'lucide-react';

const KartuHutang = () => {
  const { data: piutangData, isLoading } = usePiutangPelanggan();

  const exportKartuHutang = () => {
    if (!piutangData) return;
    
    const data = {
      tanggal_cetak: new Date().toLocaleDateString('id-ID'),
      total_piutang: piutangData.totalPiutang,
      piutang_unit: {
        total: piutangData.totalPiutangUnit,
        jumlah_pelanggan: piutangData.pelangganUnit.length,
        detail: piutangData.pelangganUnit
      },
      piutang_perorangan: {
        total: piutangData.totalPiutangPerorangan,
        jumlah_pelanggan: piutangData.pelangganPerorangan.length,
        detail: piutangData.pelangganPerorangan
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kartu-hutang-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Kartu Hutang Pelanggan</h2>
          <p className="text-gray-600">Monitoring piutang dan status pembayaran</p>
        </div>
        <Button onClick={exportKartuHutang} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Piutang</p>
                <p className="text-2xl font-bold text-red-600">
                  Rp {(piutangData?.totalPiutang || 0).toLocaleString('id-ID')}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Piutang Unit</p>
                <p className="text-2xl font-bold text-orange-600">
                  Rp {(piutangData?.totalPiutangUnit || 0).toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-gray-500">{piutangData?.pelangganUnit?.length || 0} unit</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Piutang Perorangan</p>
                <p className="text-2xl font-bold text-purple-600">
                  Rp {(piutangData?.totalPiutangPerorangan || 0).toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-gray-500">{piutangData?.pelangganPerorangan?.length || 0} orang</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Piutang */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Piutang Unit */}
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600">Piutang Unit/Instansi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {piutangData?.pelangganUnit?.map((unit) => (
                <div key={unit.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{unit.nama_unit}</h4>
                    <Badge variant={unit.total_tagihan > unit.limit_kredit ? 'destructive' : 'secondary'}>
                      {unit.total_tagihan > unit.limit_kredit ? 'Over Limit' : 'Normal'}
                    </Badge>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Tagihan:</span>
                      <span className="font-bold text-orange-600">
                        Rp {(unit.total_tagihan || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Limit Kredit:</span>
                      <span>Rp {(unit.limit_kredit || 0).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kontak:</span>
                      <span>{unit.kontak_person}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Telepon:</span>
                      <span>{unit.telepon}</span>
                    </div>
                  </div>
                </div>
              )) || <p className="text-gray-500 text-center py-4">Tidak ada data piutang unit</p>}
            </div>
          </CardContent>
        </Card>

        {/* Piutang Perorangan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-purple-600">Piutang Perorangan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {piutangData?.pelangganPerorangan?.map((person) => (
                <div key={person.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{person.nama}</h4>
                    <Badge variant={person.sisa_piutang > person.batas_potong_gaji ? 'destructive' : 'secondary'}>
                      {person.sisa_piutang > person.batas_potong_gaji ? 'Over Limit' : 'Normal'}
                    </Badge>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sisa Piutang:</span>
                      <span className="font-bold text-purple-600">
                        Rp {(person.sisa_piutang || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gaji Pokok:</span>
                      <span>Rp {(person.gaji_pokok || 0).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Batas Potong:</span>
                      <span>Rp {(person.batas_potong_gaji || 0).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Jabatan:</span>
                      <span>{person.jabatan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Departemen:</span>
                      <span>{person.departemen}</span>
                    </div>
                  </div>
                </div>
              )) || <p className="text-gray-500 text-center py-4">Tidak ada data piutang perorangan</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KartuHutang;
