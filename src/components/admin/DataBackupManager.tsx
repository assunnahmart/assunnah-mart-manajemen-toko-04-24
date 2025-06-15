
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Download, 
  Trash2, 
  AlertTriangle, 
  Database,
  FileSpreadsheet,
  Users,
  Building
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDataBackup, useDeleteLedgerHistory } from '@/hooks/useDataBackup';
import { useCustomerReceivablesSummary, useSupplierPayablesSummary } from '@/hooks/useLedgers';
import { useSupplier } from '@/hooks/useSupplier';

const DataBackupManager = () => {
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [isDeleteCustomerDialogOpen, setIsDeleteCustomerDialogOpen] = useState(false);
  const [isDeleteSupplierDialogOpen, setIsDeleteSupplierDialogOpen] = useState(false);

  const { toast } = useToast();
  const { exportAllData } = useDataBackup();
  const { deleteCustomerLedgerHistory, deleteSupplierLedgerHistory } = useDeleteLedgerHistory();
  const { data: customerSummary } = useCustomerReceivablesSummary();
  const { data: supplierSummary } = useSupplierPayablesSummary();
  const { data: suppliers } = useSupplier();

  const handleExportData = async () => {
    try {
      const result = await exportAllData.mutateAsync();
      toast({
        title: "Berhasil",
        description: `Data berhasil di-backup ke file ${result.fileName}`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal membuat backup data",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCustomerHistory = async () => {
    try {
      await deleteCustomerLedgerHistory.mutateAsync(selectedCustomer || undefined);
      toast({
        title: "Berhasil",
        description: selectedCustomer 
          ? `Riwayat piutang ${selectedCustomer} berhasil dihapus`
          : "Semua riwayat piutang berhasil dihapus"
      });
      setIsDeleteCustomerDialogOpen(false);
      setSelectedCustomer('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus riwayat piutang",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSupplierHistory = async () => {
    try {
      await deleteSupplierLedgerHistory.mutateAsync(selectedSupplier || undefined);
      const supplierName = suppliers?.find(s => s.id === selectedSupplier)?.nama;
      toast({
        title: "Berhasil",
        description: selectedSupplier 
          ? `Riwayat hutang ${supplierName} berhasil dihapus`
          : "Semua riwayat hutang berhasil dihapus"
      });
      setIsDeleteSupplierDialogOpen(false);
      setSelectedSupplier('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus riwayat hutang",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Manajemen Data & Backup</h2>
        <p className="text-gray-600">Kelola backup data dan riwayat transaksi</p>
      </div>

      {/* Data Backup Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Backup Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <FileSpreadsheet className="h-8 w-8 text-green-600" />
              <div className="flex-1">
                <h3 className="font-medium">Export Semua Data ke Excel</h3>
                <p className="text-sm text-gray-600">
                  Backup semua data sistem termasuk produk, transaksi, stok opname, dan ledger
                </p>
              </div>
              <Button 
                onClick={handleExportData}
                disabled={exportAllData.isPending}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {exportAllData.isPending ? 'Exporting...' : 'Export Data'}
              </Button>
            </div>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                File Excel akan berisi semua data sistem. Pastikan untuk menyimpan file backup di tempat yang aman.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Delete Customer Ledger History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Hapus Riwayat Piutang
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Pilih Pelanggan (Kosongkan untuk hapus semua)</Label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih pelanggan atau kosongkan untuk semua" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Pelanggan</SelectItem>
                  {customerSummary?.map((customer) => (
                    <SelectItem key={customer.pelanggan_name} value={customer.pelanggan_name}>
                      {customer.pelanggan_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Dialog open={isDeleteCustomerDialogOpen} onOpenChange={setIsDeleteCustomerDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Hapus Riwayat Piutang
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Konfirmasi Hapus Riwayat Piutang</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Peringatan!</strong> Tindakan ini tidak dapat dibatalkan. 
                      {selectedCustomer 
                        ? ` Semua riwayat piutang untuk ${selectedCustomer} akan dihapus permanen.`
                        : ' Semua riwayat piutang untuk semua pelanggan akan dihapus permanen.'
                      }
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDeleteCustomerDialogOpen(false)}
                      className="flex-1"
                    >
                      Batal
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteCustomerHistory}
                      disabled={deleteCustomerLedgerHistory.isPending}
                      className="flex-1"
                    >
                      {deleteCustomerLedgerHistory.isPending ? 'Menghapus...' : 'Hapus'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Delete Supplier Ledger History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Hapus Riwayat Hutang
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Pilih Supplier (Kosongkan untuk hapus semua)</Label>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih supplier atau kosongkan untuk semua" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Supplier</SelectItem>
                  {suppliers?.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Dialog open={isDeleteSupplierDialogOpen} onOpenChange={setIsDeleteSupplierDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Hapus Riwayat Hutang
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Konfirmasi Hapus Riwayat Hutang</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Peringatan!</strong> Tindakan ini tidak dapat dibatalkan. 
                      {selectedSupplier 
                        ? ` Semua riwayat hutang untuk ${suppliers?.find(s => s.id === selectedSupplier)?.nama} akan dihapus permanen.`
                        : ' Semua riwayat hutang untuk semua supplier akan dihapus permanen.'
                      }
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDeleteSupplierDialogOpen(false)}
                      className="flex-1"
                    >
                      Batal
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteSupplierHistory}
                      disabled={deleteSupplierLedgerHistory.isPending}
                      className="flex-1"
                    >
                      {deleteSupplierLedgerHistory.isPending ? 'Menghapus...' : 'Hapus'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataBackupManager;
