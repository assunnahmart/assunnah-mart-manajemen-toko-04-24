
import { Button } from '@/components/ui/button';
import { Download, Upload, FileText } from 'lucide-react';
import { usePOSTransactions } from '@/hooks/usePOSTransactions';
import { useToast } from '@/hooks/use-toast';

const POSExportImport = () => {
  const { data: transactions } = usePOSTransactions();
  const { toast } = useToast();

  const exportTransactions = () => {
    if (!transactions || transactions.length === 0) {
      toast({
        title: "Tidak ada data",
        description: "Tidak ada transaksi untuk diekspor",
        variant: "destructive"
      });
      return;
    }

    // Prepare data for export
    const exportData = transactions.map(transaction => ({
      nomor_transaksi: transaction.transaction_number,
      kasir: transaction.kasir_name,
      tanggal: new Date(transaction.created_at).toLocaleDateString('id-ID'),
      waktu: new Date(transaction.created_at).toLocaleTimeString('id-ID'),
      total_amount: transaction.total_amount,
      payment_method: transaction.payment_method,
      amount_paid: transaction.amount_paid,
      change_amount: transaction.change_amount,
      items_count: transaction.items_count,
      status: transaction.status,
      notes: transaction.notes || ''
    }));

    // Convert to CSV
    const csvContent = convertToCSV(exportData);
    
    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pos_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Ekspor berhasil",
      description: `${transactions.length} transaksi berhasil diekspor`
    });
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        return typeof value === 'string' && value.includes(',') 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        // Basic CSV parsing - in production, you'd want more robust parsing
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        toast({
          title: "Impor berhasil",
          description: `File ${file.name} berhasil dibaca dengan ${lines.length - 1} baris data`
        });
      } catch (error) {
        toast({
          title: "Gagal impor",
          description: "Format file tidak valid",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={exportTransactions}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Ekspor
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => document.getElementById('import-file')?.click()}
      >
        <Upload className="h-4 w-4" />
        Impor
      </Button>
      
      <input
        id="import-file"
        type="file"
        accept=".csv"
        onChange={handleFileImport}
        className="hidden"
      />
    </div>
  );
};

export default POSExportImport;
