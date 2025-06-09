
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const StockOpnameInstructions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Input Manual Stok Opname</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-600">
            Gunakan tombol "Quick Scan" untuk scan barcode secara berulang dan mempercepat proses stok opname,
            atau "Input Manual" untuk input satu per satu produk.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Mode Quick Scan:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Scan barcode dengan kamera</li>
              <li>• Produk otomatis terpilih</li>
              <li>• Input stok fisik aktual</li>
              <li>• Setelah simpan, kembali ke scanner untuk item berikutnya</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockOpnameInstructions;
