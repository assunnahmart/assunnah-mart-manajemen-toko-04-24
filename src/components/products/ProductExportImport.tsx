
import { Button } from '@/components/ui/button';
import { Download, Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface Product {
  id: string;
  nama: string;
  barcode?: string;
  jenis_konsinyasi: string;
  satuan: string;
  harga_beli?: number;
  harga_jual?: number;
  stok_saat_ini: number;
  stok_minimal: number;
  status: string;
}

interface ProductExportImportProps {
  products: Product[];
}

const ProductExportImport = ({ products }: ProductExportImportProps) => {
  const { toast } = useToast();

  const exportToExcel = () => {
    if (!products || products.length === 0) {
      toast({
        title: "Tidak ada data",
        description: "Tidak ada produk untuk diekspor",
        variant: "destructive"
      });
      return;
    }

    // Prepare data for export
    const exportData = products.map(product => ({
      'Nama Produk': product.nama,
      'Barcode': product.barcode || '',
      'Jenis Konsinyasi': product.jenis_konsinyasi === 'harian' ? 'Harian' : 'Mingguan',
      'Satuan': product.satuan,
      'Harga Beli': product.harga_beli || 0,
      'Harga Jual': product.harga_jual || 0,
      'Stok Saat Ini': product.stok_saat_ini,
      'Stok Minimal': product.stok_minimal,
      'Status': product.status
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Daftar Produk');

    // Generate filename with current date
    const fileName = `daftar_produk_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Write file
    XLSX.writeFile(wb, fileName);

    toast({
      title: "Ekspor berhasil",
      description: `${products.length} produk berhasil diekspor ke file ${fileName}`
    });
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Read the first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        toast({
          title: "Import berhasil",
          description: `File ${file.name} berhasil dibaca dengan ${jsonData.length} baris data. Fitur import akan segera tersedia.`
        });
        
        console.log('Imported data:', jsonData);
      } catch (error) {
        console.error('Import error:', error);
        toast({
          title: "Gagal import",
          description: "Format file tidak valid atau terjadi kesalahan",
          variant: "destructive"
        });
      }
    };
    
    reader.readAsArrayBuffer(file);
    
    // Reset input
    event.target.value = '';
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={exportToExcel}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Export Excel
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => document.getElementById('import-excel-file')?.click()}
      >
        <Upload className="h-4 w-4" />
        Import Excel
      </Button>
      
      <input
        id="import-excel-file"
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileImport}
        className="hidden"
      />
    </div>
  );
};

export default ProductExportImport;
