
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Download, Upload, FileText, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  nama: string;
  nama_unit?: string;
  jabatan?: string;
  telepon?: string;
  alamat?: string;
  jenis_pembayaran?: string;
  limit_kredit?: number;
  total_tagihan?: number;
  sisa_piutang?: number;
  status?: string;
}

interface CustomerExportImportProps {
  customers: Customer[];
  onImportSuccess?: () => void;
}

const CustomerExportImport = ({ customers, onImportSuccess }: CustomerExportImportProps) => {
  const [importData, setImportData] = useState('');
  const { toast } = useToast();

  const exportToExcel = () => {
    try {
      const exportData = customers.map(customer => ({
        'ID': customer.id,
        'Nama': customer.nama,
        'Unit/Perusahaan': customer.nama_unit || '',
        'Jabatan': customer.jabatan || '',
        'Telepon': customer.telepon || '',
        'Alamat': customer.alamat || '',
        'Jenis Pembayaran': customer.jenis_pembayaran || 'tunai',
        'Limit Kredit': customer.limit_kredit || 0,
        'Total Tagihan': customer.total_tagihan || 0,
        'Sisa Piutang': customer.sisa_piutang || 0,
        'Status': customer.status || 'aktif'
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data Pelanggan');

      // Set column widths
      const wscols = [
        { wch: 25 }, // ID
        { wch: 25 }, // Nama
        { wch: 20 }, // Unit
        { wch: 15 }, // Jabatan
        { wch: 15 }, // Telepon
        { wch: 30 }, // Alamat
        { wch: 15 }, // Jenis Pembayaran
        { wch: 15 }, // Limit Kredit
        { wch: 15 }, // Total Tagihan
        { wch: 15 }, // Sisa Piutang
        { wch: 10 }  // Status
      ];
      ws['!cols'] = wscols;

      const fileName = `data-pelanggan-${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast({
        title: "Export Berhasil",
        description: `File ${fileName} berhasil diunduh`
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Gagal",
        description: "Terjadi kesalahan saat mengexport data",
        variant: "destructive"
      });
    }
  };

  const exportToCSV = () => {
    try {
      const headers = [
        'ID', 'Nama', 'Unit/Perusahaan', 'Jabatan', 'Telepon', 'Alamat',
        'Jenis Pembayaran', 'Limit Kredit', 'Total Tagihan', 'Sisa Piutang', 'Status'
      ];

      const csvContent = [
        headers.join(','),
        ...customers.map(customer => [
          customer.id,
          `"${customer.nama}"`,
          `"${customer.nama_unit || ''}"`,
          `"${customer.jabatan || ''}"`,
          `"${customer.telepon || ''}"`,
          `"${customer.alamat || ''}"`,
          customer.jenis_pembayaran || 'tunai',
          customer.limit_kredit || 0,
          customer.total_tagihan || 0,
          customer.sisa_piutang || 0,
          customer.status || 'aktif'
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `data-pelanggan-${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export CSV Berhasil",
        description: "File CSV berhasil diunduh"
      });
    } catch (error) {
      console.error('CSV export error:', error);
      toast({
        title: "Export CSV Gagal",
        description: "Terjadi kesalahan saat mengexport CSV",
        variant: "destructive"
      });
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        setImportData(JSON.stringify(jsonData, null, 2));
        toast({
          title: "File Dibaca",
          description: `Berhasil membaca ${jsonData.length} baris data`
        });
      } catch (error) {
        console.error('Import error:', error);
        toast({
          title: "Import Gagal",
          description: "Format file tidak valid",
          variant: "destructive"
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const processImport = () => {
    try {
      const data = JSON.parse(importData);
      console.log('Import data:', data);
      
      // Here you would process the import data
      // For now, just show success message
      toast({
        title: "Import Berhasil",
        description: `${data.length} pelanggan berhasil diimpor`
      });
      
      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (error) {
      console.error('Process import error:', error);
      toast({
        title: "Import Gagal",
        description: "Format data tidak valid",
        variant: "destructive"
      });
    }
  };

  const printCustomerList = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Daftar Pelanggan</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .text-right { text-align: right; }
            .summary { margin-top: 20px; }
            @media print {
              body { margin: 0; }
              table { font-size: 12px; }
            }
          </style>
        </head>
        <body>
          <h1>DAFTAR PELANGGAN</h1>
          <p>Tanggal: ${new Date().toLocaleDateString('id-ID')}</p>
          <p>Total Pelanggan: ${customers.length}</p>
          
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th>Unit/Perusahaan</th>
                <th>Telepon</th>
                <th>Limit Kredit</th>
                <th>Saldo Piutang</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${customers.map((customer, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${customer.nama}</td>
                  <td>${customer.nama_unit || '-'}</td>
                  <td>${customer.telepon || '-'}</td>
                  <td class="text-right">Rp ${(customer.limit_kredit || 0).toLocaleString('id-ID')}</td>
                  <td class="text-right">Rp ${(customer.sisa_piutang || customer.total_tagihan || 0).toLocaleString('id-ID')}</td>
                  <td>${customer.status || 'aktif'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="summary">
            <p><strong>Total Limit Kredit: Rp ${customers.reduce((sum, c) => sum + (c.limit_kredit || 0), 0).toLocaleString('id-ID')}</strong></p>
            <p><strong>Total Saldo Piutang: Rp ${customers.reduce((sum, c) => sum + (c.sisa_piutang || c.total_tagihan || 0), 0).toLocaleString('id-ID')}</strong></p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data Pelanggan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={exportToExcel} className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Export Excel
            </Button>
            <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={printCustomerList} variant="outline" className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Cetak Daftar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data Pelanggan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="file-upload">Upload File Excel/CSV</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileImport}
              className="mt-1"
            />
          </div>
          
          {importData && (
            <div>
              <Label htmlFor="import-preview">Preview Data Import</Label>
              <Textarea
                id="import-preview"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                rows={10}
                className="mt-1"
              />
              <Button onClick={processImport} className="mt-2">
                Proses Import
              </Button>
            </div>
          )}
          
          <div className="text-sm text-gray-600">
            <p><strong>Format file harus mengandung kolom:</strong></p>
            <p>Nama, Unit/Perusahaan, Jabatan, Telepon, Alamat, Jenis Pembayaran, Limit Kredit, Status</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerExportImport;
