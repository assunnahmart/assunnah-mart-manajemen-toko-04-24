
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Building } from 'lucide-react';

type Props = {
  totalPayables: number;
  totalSuppliers: number;
};

export function SupplierPayablesSummary({ totalPayables, totalSuppliers }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Hutang Outstanding</CardTitle>
          <CreditCard className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            Rp {totalPayables.toLocaleString('id-ID')}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Belum dibayar
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Supplier</CardTitle>
          <Building className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {totalSuppliers}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Dengan hutang aktif
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
