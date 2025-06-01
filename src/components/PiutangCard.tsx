
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { usePiutangPelanggan, useTodayCreditSales } from '@/hooks/usePiutang';

const PiutangCard = () => {
  const { data: piutangData, isLoading: piutangLoading } = usePiutangPelanggan();
  const { data: creditSales, isLoading: creditLoading } = useTodayCreditSales();

  if (piutangLoading || creditLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Piutang */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Piutang</p>
              <p className="text-2xl font-bold text-red-600">
                Rp {(piutangData?.totalPiutang || 0).toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {piutangData?.totalCreditCustomers || 0} pelanggan
              </p>
            </div>
            <CreditCard className="h-8 w-8 text-red-600" />
          </div>
        </CardContent>
      </Card>

      {/* Piutang Unit */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Piutang Unit</p>
              <p className="text-xl font-bold text-orange-600">
                Rp {(piutangData?.totalPiutangUnit || 0).toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {piutangData?.pelangganUnit?.length || 0} unit
              </p>
            </div>
            <Users className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>

      {/* Piutang Perorangan */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Piutang Perorangan</p>
              <p className="text-xl font-bold text-purple-600">
                Rp {(piutangData?.totalPiutangPerorangan || 0).toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {piutangData?.pelangganPerorangan?.length || 0} orang
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      {/* Penjualan Kredit Hari Ini */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Kredit Hari Ini</p>
              <p className="text-xl font-bold text-blue-600">
                Rp {(creditSales?.totalCreditSales || 0).toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {creditSales?.totalCreditTransactions || 0} transaksi
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      {/* Detail Piutang Terbesar */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Top 5 Piutang Terbesar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Piutang Unit */}
            <div>
              <h4 className="font-medium mb-3 text-orange-600">Unit/Instansi</h4>
              <div className="space-y-2">
                {piutangData?.pelangganUnit?.slice(0, 5).map((unit, index) => (
                  <div key={unit.id} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                    <div>
                      <p className="font-medium text-sm">{unit.nama_unit}</p>
                      <p className="text-xs text-gray-600">{unit.jenis_pembayaran}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-600">
                        Rp {(unit.total_tagihan || 0).toLocaleString('id-ID')}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        #{index + 1}
                      </Badge>
                    </div>
                  </div>
                )) || <p className="text-gray-500 text-sm">Tidak ada data</p>}
              </div>
            </div>

            {/* Piutang Perorangan */}
            <div>
              <h4 className="font-medium mb-3 text-purple-600">Perorangan</h4>
              <div className="space-y-2">
                {piutangData?.pelangganPerorangan?.slice(0, 5).map((person, index) => (
                  <div key={person.id} className="flex items-center justify-between p-2 bg-purple-50 rounded">
                    <div>
                      <p className="font-medium text-sm">{person.nama}</p>
                      <p className="text-xs text-gray-600">{person.jabatan || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-600">
                        Rp {(person.sisa_piutang || 0).toLocaleString('id-ID')}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        #{index + 1}
                      </Badge>
                    </div>
                  </div>
                )) || <p className="text-gray-500 text-sm">Tidak ada data</p>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PiutangCard;
