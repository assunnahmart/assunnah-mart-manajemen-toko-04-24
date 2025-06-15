
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Building, TrendingUp } from 'lucide-react';

type Props = {
  totalPayables: number;
  totalSuppliers: number;
};

export function SupplierPayablesSummary({ totalPayables, totalSuppliers }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Hutang</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            Rp {totalPayables.toLocaleString('id-ID')}
          </div>
          <p className="text-xs text-muted-foreground">Outstanding payables</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Supplier Aktif</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSuppliers}</div>
          <p className="text-xs text-muted-foreground">Suppliers with outstanding balance</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rata-rata Hutang</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            Rp {totalSuppliers > 0 ? Math.round(totalPayables / totalSuppliers).toLocaleString('id-ID') : 0}
          </div>
          <p className="text-xs text-muted-foreground">Average per supplier</p>
        </CardContent>
      </Card>
    </div>
  );
}
