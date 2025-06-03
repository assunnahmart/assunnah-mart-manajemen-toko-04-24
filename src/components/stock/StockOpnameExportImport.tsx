
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { useStockData, useCreateStockOpname } from '@/hooks/useStockManagement';
import { useKasir } from '@/hooks/useKasir';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

const StockOpnameExportImport = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { data: stockData } = useStockData();
  const { data: kasirData } = useKasir();
  const { user } = useSimpleAuth();
  const createStockOpname = useCreateStockOpname();
  const { toast } = useToast();

  const userKasir = kasirData?.find(k => k.nama === user?.full_name);

  const handleExportTemplate = () => {
    if (!stockData || stockData.length === 0) {
      toast({
        title: "Tidak ada data",
        description: "Tidak ada data produk untuk diekspor",
        variant: "destructive"
      });
      return;
    }

    const exportData = stockData.map((item, index) => ({
      'No': index + 1,
      'ID Produk': item.id,
      'Nama Produk': item.nama,
      'Barcode': item.barcode || '',
      'Satuan': item.satuan,
      'Stok Sistem': item.stok_saat_ini,
      'Stok Fisik': item.stok_saat_ini, // Default sama dengan stok sistem
      'Keterangan': ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock Opname');
    
    // Set column widths
    worksheet['!cols'] = [
      { width: 5 },   // No
      { width: 25 },  // ID Produk
      { width: 30 },  // Nama Produk
      { width: 15 },  // Barcode
      { width: 10 },  // Satuan
      { width: 12 },  // Stok Sistem
      { width: 12 },  // Stok Fisik
      { width: 25 }   // Keterangan
    ];

    const fileName = `stock_opname_template_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast({
      title: "Template berhasil diekspor",
      description: `File ${fileName} telah diunduh`
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportData([]);
    }
  };

  const handlePreviewImport = async () => {
    if (!importFile) {
      toast({
        title: "Pilih file terlebih dahulu",
        description: "Silakan pilih file Excel yang akan diimpor",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const buffer = await importFile.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      // Validate and process data
      const processedData = jsonData.map((row: any, index) => {
        const stokSistem = parseInt(row['Stok Sistem']) || 0;
        const stokFisik = parseInt(row['Stok Fisik']) || 0;
        const selisih = stokFisik - stokSistem;
        
        return {
          id: row['ID Produk'],
          nama: row['Nama Produk'],
          barcode: row['Barcode'] || '',
          satuan: row['Satuan'],
          stokSistem,
          stokFisik,
          selisih,
          keterangan: row['Keterangan'] || '',
          status: selisih === 0 ? 'sama' : selisih > 0 ? 'lebih' : 'kurang',
          valid: row['ID Produk'] && row['Nama Produk'] && !isNaN(stokFisik)
        };
      }).filter(item => item.valid);

      setImportData(processedData);
      
      toast({
        title: "Preview berhasil",
        description: `${processedData.length} item siap untuk diimpor`
      });
    } catch (error) {
      toast({
        title: "Error membaca file",
        description: "Pastikan file Excel dalam format yang benar",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!userKasir) {
      toast({
        title: "Data kasir tidak ditemukan",
        description: "Pastikan Anda sudah login sebagai kasir",
        variant: "destructive"
      });
      return;
    }

    if (importData.length === 0) {
      toast({
        title: "Tidak ada data untuk diimpor",
        description: "Silakan preview file terlebih dahulu",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const item of importData) {
        if (item.selisih !== 0) { // Only process items with differences
          try {
            await createStockOpname.mutateAsync({
              barang_id: item.id,
              stok_fisik: item.stokFisik,
              kasir_id: userKasir.id,
              keterangan: `Import Excel: ${item.keterangan}`
            });
            successCount++;
          } catch (error) {
            console.error('Error processing item:', item.nama, error);
            errorCount++;
          }
        }
      }

      toast({
        title: "Import selesai",
        description: `${successCount} item berhasil diimpor, ${errorCount} item gagal`
      });

      // Reset state
      setImportFile(null);
      setImportData([]);
      setShowDialog(false);
      
    } catch (error) {
      toast({
        title: "Gagal melakukan import",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleExportTemplate}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export Template
        </Button>
        
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Import Excel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Import Stock Opname dari Excel
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="file">Pilih File Excel</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: .xlsx atau .xls. Gunakan template yang sudah diekspor untuk format yang benar.
                </p>
              </div>

              {importFile && (
                <div className="flex gap-2">
                  <Button
                    onClick={handlePreviewImport}
                    disabled={isProcessing}
                    className="flex items-center gap-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    {isProcessing ? 'Memproses...' : 'Preview Data'}
                  </Button>
                </div>
              )}

              {importData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Preview Data Import</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 flex gap-4">
                      <Badge variant="secondary">
                        Total: {importData.length} item
                      </Badge>
                      <Badge variant="default">
                        Selisih: {importData.filter(item => item.selisih !== 0).length} item
                      </Badge>
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="p-2 text-left">Produk</th>
                            <th className="p-2 text-center">Stok Sistem</th>
                            <th className="p-2 text-center">Stok Fisik</th>
                            <th className="p-2 text-center">Selisih</th>
                            <th className="p-2 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importData.map((item, index) => (
                            <tr key={index} className="border-b">
                              <td className="p-2">
                                <div>
                                  <p className="font-medium">{item.nama}</p>
                                  {item.barcode && (
                                    <p className="text-xs text-gray-500">{item.barcode}</p>
                                  )}
                                </div>
                              </td>
                              <td className="p-2 text-center">{item.stokSistem} {item.satuan}</td>
                              <td className="p-2 text-center">{item.stokFisik} {item.satuan}</td>
                              <td className="p-2 text-center">
                                <span className={`font-medium ${
                                  item.selisih > 0 ? 'text-green-600' : 
                                  item.selisih < 0 ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                  {item.selisih > 0 ? '+' : ''}{item.selisih}
                                </span>
                              </td>
                              <td className="p-2 text-center">
                                {item.selisih === 0 ? (
                                  <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                                ) : (
                                  <AlertCircle className={`h-4 w-4 mx-auto ${
                                    item.selisih > 0 ? 'text-green-600' : 'text-red-600'
                                  }`} />
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        onClick={handleConfirmImport}
                        disabled={isProcessing || importData.filter(item => item.selisih !== 0).length === 0}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        {isProcessing ? 'Mengimpor...' : 'Konfirmasi Import'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setImportData([]);
                          setImportFile(null);
                        }}
                      >
                        Reset
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">Panduan Export/Import</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Export Template:</strong> Unduh template Excel dengan data produk terkini</li>
            <li>• <strong>Edit File:</strong> Ubah kolom "Stok Fisik" sesuai hasil perhitungan fisik</li>
            <li>• <strong>Import:</strong> Upload file yang sudah diedit untuk update stok secara bulk</li>
            <li>• Sistem hanya akan memproses item yang memiliki selisih stok</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockOpnameExportImport;
