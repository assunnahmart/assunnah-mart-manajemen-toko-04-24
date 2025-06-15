
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';

type Props = {
  onRefresh: () => void;
};

export function PageHeader({ onRefresh }: Props) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">Pembayaran Piutang</h1>
        <p className="text-gray-600">Kelola pembayaran piutang pelanggan</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
}
