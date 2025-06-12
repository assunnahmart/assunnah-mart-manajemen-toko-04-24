
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart3, Info } from 'lucide-react';

const NewStokRekapTerpadu = () => {
  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Rekap Terpadu New Stok:</strong> Integrasi data dari semua sumber untuk analisis komprehensif selisih stok sistem vs real.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Rekap Terpadu - Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Fitur Rekap Terpadu sedang dalam pengembangan</p>
            <p className="text-sm text-gray-400">
              Akan menampilkan analisis komprehensif dari semua data stok opname
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewStokRekapTerpadu;
