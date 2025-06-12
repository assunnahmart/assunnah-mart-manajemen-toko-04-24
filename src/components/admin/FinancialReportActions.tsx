
import { Button } from '@/components/ui/button';
import { Download, Printer, FileSpreadsheet, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface FinancialReportActionsProps {
  reportType: string;
  reportData: any[];
  periodName: string;
}

const FinancialReportActions = ({ reportType, reportData, periodName }: FinancialReportActionsProps) => {
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const exportToExcel = () => {
    if (!reportData || reportData.length === 0) {
      toast({
        title: "Error",
        description: "Tidak ada data untuk diekspor",
        variant: "destructive"
      });
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      reportData.map(item => ({
        'Kode Akun': item.chart_of_accounts?.kode_akun || '',
        'Nama Akun': item.chart_of_accounts?.nama_akun || '',
        'Debit': item.debit_total || item.debit_amount || 0,
        'Credit': item.credit_total || item.credit_amount || 0,
        'Saldo': item.ending_balance || item.amount || 0
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, reportType);
    XLSX.writeFile(workbook, `${reportType}_${periodName}.xlsx`);

    toast({
      title: "Berhasil",
      description: "Laporan berhasil diekspor ke Excel",
    });
  };

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportType} - ${periodName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .text-right { text-align: right; }
            .header { text-align: center; margin-bottom: 30px; }
            .period { font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${reportType}</h1>
            <p class="period">Periode: ${periodName}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Kode Akun</th>
                <th>Nama Akun</th>
                <th class="text-right">Debit</th>
                <th class="text-right">Credit</th>
                <th class="text-right">Saldo</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.map(item => `
                <tr>
                  <td>${item.chart_of_accounts?.kode_akun || ''}</td>
                  <td>${item.chart_of_accounts?.nama_akun || ''}</td>
                  <td class="text-right">${formatCurrency(item.debit_total || item.debit_amount || 0)}</td>
                  <td class="text-right">${formatCurrency(item.credit_total || item.credit_amount || 0)}</td>
                  <td class="text-right">${formatCurrency(item.ending_balance || item.amount || 0)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={exportToExcel}
        className="flex items-center gap-2"
      >
        <FileSpreadsheet className="h-4 w-4" />
        Export Excel
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={printReport}
        className="flex items-center gap-2"
      >
        <Printer className="h-4 w-4" />
        Cetak
      </Button>
    </div>
  );
};

export default FinancialReportActions;
