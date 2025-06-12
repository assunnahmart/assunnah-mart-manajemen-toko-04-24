
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileSpreadsheet, Info } from 'lucide-react';

const NewStokReporting = () => {
  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Reporting New Stok:</strong> Generate laporan standar nasional untuk analisis selisih stok dan audit compliance.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Sistem Reporting - Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileSpreadsheet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Fitur Reporting sedang dalam pengembangan</p>
            <p className="text-sm text-gray-400">
              Akan mendukung export ke Excel, PDF, dan format laporan standar nasional
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewStokReporting;
