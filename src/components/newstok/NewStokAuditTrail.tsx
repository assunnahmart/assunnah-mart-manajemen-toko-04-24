
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Info } from 'lucide-react';

const NewStokAuditTrail = () => {
  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Audit Trail New Stok:</strong> Jejak audit lengkap semua aktivitas stok opname untuk compliance dan transparansi.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Audit Trail - Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Fitur Audit Trail sedang dalam pengembangan</p>
            <p className="text-sm text-gray-400">
              Akan menampilkan log lengkap semua perubahan dan aktivitas stok opname
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewStokAuditTrail;
