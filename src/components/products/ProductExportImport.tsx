import { Button } from '@/components/ui/button';
import { Download, Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSupplier } from '@/hooks/useSupplier';
import { useCreateBarang } from '@/hooks/useBarang';
import * as XLSX from 'xlsx';
import { useState } from 'react';
import { Progress } from '@/components/ui/progress';

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
  kategori_pembelian?: string;
  supplier?: {
    nama: string;
  };
}

interface ProductExportImportProps {
  products: Product[];
  onImportSuccess: () => void;
}

const ProductExportImport = ({ products, onImportSuccess }: ProductExportImportProps) => {
  const { toast } = useToast();
  const { data: suppliers } = useSupplier();
  const createProduct = useCreateBarang();
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const exportToExcel = () => {
    if (!products || products.length === 0) {
      toast({
        title: "Tidak ada data",
        description: "Tidak ada produk untuk diekspor",
        variant: "destructive"
      });
      return;
    }

    // Prepare data for export with all fields including kategori pembelian
    const exportData = products.map(product => ({
      'Nama Produk': product.nama,
      'Barcode': product.barcode || '',
      'Jenis Barang': product.jenis_konsinyasi === 'harian' ? 'Harian' : 'Mingguan',
      'Kategori Pembelian': product.kategori_pembelian || 'retail',
      'Satuan': product.satuan,
      'Harga Beli': product.harga_beli || 0,
      'Harga Jual': product.harga_jual || 0,
      'Stok Saat Ini': product.stok_saat_ini,
      'Stok Minimal': product.stok_minimal,
      'Status': product.status,
      'Supplier': product.supplier?.nama || ''
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Auto-size columns
    const range = XLSX.utils.decode_range(ws['!ref']!);
    const wscols = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      let max_width = 10;
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cell_address = XLSX.utils.encode_cell({ c: C, r: R });
        const cell = ws[cell_address];
        if (cell && cell.v) {
          max_width = Math.max(max_width, cell.v.toString().length);
        }
      }
      wscols.push({ wch: Math.min(max_width + 2, 30) });
    }
    ws['!cols'] = wscols;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Daftar Produk');

    // Create template sheet with updated fields
    const templateData = [{
      'Nama Produk': 'Contoh Produk',
      'Barcode': '1234567890',
      'Jenis Barang': 'Harian',
      'Kategori Pembelian': 'retail',
      'Satuan': 'pcs',
      'Harga Beli': 5000,
      'Harga Jual': 7000,
      'Stok Saat Ini': 100,
      'Stok Minimal': 10,
      'Status': 'aktif',
      'Supplier': 'Nama Supplier'
    }];
    
    const templateWs = XLSX.utils.json_to_sheet(templateData);
    templateWs['!cols'] = wscols;
    XLSX.utils.book_append_sheet(wb, templateWs, 'Template Import');

    // Generate filename with current date
    const fileName = `daftar_produk_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Write file
    XLSX.writeFile(wb, fileName);

    toast({
      title: "Ekspor berhasil",
      description: `${products.length} produk berhasil diekspor ke file ${fileName}`
    });
  };

  // Process import in batches for better performance
  const processBatch = async (batch: any[], batchIndex: number, totalBatches: number) => {
    const results = { success: 0, errors: [] as string[] };
    
    for (let i = 0; i < batch.length; i++) {
      const row = batch[i];
      const rowNumber = batchIndex * 100 + i + 2; // +2 because of header row and 1-based indexing
      
      try {
        // Find supplier by name
        let supplierId = null;
        if (row['Supplier'] && suppliers) {
          const supplier = suppliers.find(s => 
            s.nama.toLowerCase() === row['Supplier'].toString().toLowerCase()
          );
          supplierId = supplier?.id || null;
        }

        // Prepare product data with kategori_pembelian
        const productData = {
          nama: row['Nama Produk']?.toString() || '',
          barcode: row['Barcode']?.toString() || '',
          jenis_konsinyasi: row['Jenis Barang']?.toString().toLowerCase() === 'mingguan' ? 'mingguan' : 'harian',
          kategori_pembelian: row['Kategori Pembelian']?.toString().toLowerCase() || 'retail',
          satuan: row['Satuan']?.toString() || 'pcs',
          harga_beli: parseFloat(row['Harga Beli']) || 0,
          harga_jual: parseFloat(row['Harga Jual']) || 0,
          stok_saat_ini: parseInt(row['Stok Saat Ini']) || 0,
          stok_minimal: parseInt(row['Stok Minimal']) || 0,
          status: row['Status']?.toString().toLowerCase() === 'nonaktif' ? 'nonaktif' : 'aktif',
          supplier_id: supplierId
        };

        // Validate required fields
        if (!productData.nama) {
          results.errors.push(`Baris ${rowNumber}: Nama produk tidak boleh kosong`);
          continue;
        }

        // Create product
        await createProduct.mutateAsync(productData);
        results.success++;

      } catch (error) {
        console.error(`Error importing row ${rowNumber}:`, error);
        results.errors.push(`Baris ${rowNumber}: ${error.message || 'Gagal menyimpan produk'}`);
      }
    }
    
    return results;
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportProgress(0);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Read the first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
        
        if (jsonData.length === 0) {
          toast({
            title: "File kosong",
            description: "File tidak mengandung data untuk diimpor",
            variant: "destructive"
          });
          setIsImporting(false);
          return;
        }

        // Process in batches of 100 items for better performance
        const batchSize = 100;
        const totalBatches = Math.ceil(jsonData.length / batchSize);
        let totalSuccess = 0;
        let allErrors: string[] = [];

        for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
          const start = batchIndex * batchSize;
          const end = Math.min(start + batchSize, jsonData.length);
          const batch = jsonData.slice(start, end);
          
          console.log(`Processing batch ${batchIndex + 1}/${totalBatches} (${batch.length} items)`);
          
          const batchResults = await processBatch(batch, batchIndex, totalBatches);
          totalSuccess += batchResults.success;
          allErrors = [...allErrors, ...batchResults.errors];
          
          // Update progress
          const progress = ((batchIndex + 1) / totalBatches) * 100;
          setImportProgress(progress);
          
          // Small delay to prevent UI blocking
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Show results
        if (totalSuccess > 0) {
          onImportSuccess();
          toast({
            title: "Import berhasil",
            description: `${totalSuccess} produk berhasil diimpor. ${allErrors.length > 0 ? `${allErrors.length} produk gagal.` : ''}`
          });
        }

        if (allErrors.length > 0 && allErrors.length <= 5) {
          // Show first few errors
          toast({
            title: "Beberapa produk gagal diimpor",
            description: allErrors.slice(0, 3).join('; '),
            variant: "destructive"
          });
        } else if (allErrors.length > 5) {
          toast({
            title: "Banyak produk gagal diimpor",
            description: `${allErrors.length} produk gagal diimpor. Periksa format file.`,
            variant: "destructive"
          });
        }

      } catch (error) {
        console.error('Import error:', error);
        toast({
          title: "Gagal import",
          description: "Format file tidak valid atau terjadi kesalahan",
          variant: "destructive"
        });
      } finally {
        setIsImporting(false);
        setImportProgress(0);
      }
    };
    
    reader.readAsArrayBuffer(file);
    
    // Reset input
    event.target.value = '';
  };

  return (
    <div className="space-y-4">
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
          disabled={isImporting}
        >
          <Upload className="h-4 w-4" />
          {isImporting ? 'Mengimpor...' : 'Import Excel'}
        </Button>
        
        <input
          id="import-excel-file"
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileImport}
          className="hidden"
        />
      </div>

      {isImporting && (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            Mengimpor data... {Math.round(importProgress)}%
          </div>
          <Progress value={importProgress} className="w-full" />
        </div>
      )}
    </div>
  );
};

export default ProductExportImport;
