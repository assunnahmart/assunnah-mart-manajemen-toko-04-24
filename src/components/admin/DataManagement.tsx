
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, AlertTriangle, Database, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const DataManagement = () => {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedDeleteType, setSelectedDeleteType] = useState<string | null>(null);
  const { toast } = useToast();

  const deleteOperations = [
    {
      id: 'transactions',
      title: 'Semua Transaksi POS',
      description: 'Hapus semua data transaksi POS dan item transaksi',
      tables: ['pos_transactions', 'pos_transaction_items'],
      confirmText: 'HAPUS TRANSAKSI POS',
      color: 'bg-red-100 text-red-800'
    },
    {
      id: 'stock_opname',
      title: 'Data Stok Opname',
      description: 'Hapus semua data stok opname dan mutasi stok terkait',
      tables: ['stok_opname'],
      confirmText: 'HAPUS STOK OPNAME',
      color: 'bg-orange-100 text-orange-800'
    },
    {
      id: 'kas_umum',
      title: 'Data Kas Umum',
      description: 'Hapus semua transaksi kas umum',
      tables: ['kas_umum_transactions'],
      confirmText: 'HAPUS KAS UMUM',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'purchases',
      title: 'Data Pembelian',
      description: 'Hapus semua transaksi pembelian dan detail pembelian',
      tables: ['transaksi_pembelian', 'detail_transaksi_pembelian', 'hutang_supplier'],
      confirmText: 'HAPUS PEMBELIAN',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'konsinyasi',
      title: 'Laporan Konsinyasi',
      description: 'Hapus semua data laporan konsinyasi dan detail',
      tables: ['konsinyasi_laporan', 'konsinyasi_detail', 'konsinyasi_harian'],
      confirmText: 'HAPUS KONSINYASI',
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'kasir_kas',
      title: 'Kas Kasir',
      description: 'Hapus semua transaksi kas kasir',
      tables: ['kasir_kas_transactions'],
      confirmText: 'HAPUS KAS KASIR',
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 'stock_mutations',
      title: 'Mutasi Stok',
      description: 'Hapus semua data mutasi stok',
      tables: ['mutasi_stok'],
      confirmText: 'HAPUS MUTASI STOK',
      color: 'bg-indigo-100 text-indigo-800'
    }
  ];

  const handleDeleteData = async (operation: any) => {
    setIsDeleting(operation.id);
    
    try {
      // Delete data from each table in the operation
      for (const table of operation.tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
        
        if (error) {
          throw new Error(`Error deleting from ${table}: ${error.message}`);
        }
      }
      
      toast({
        title: "Berhasil",
        description: `${operation.title} berhasil dihapus`,
      });
      
      setShowConfirmDialog(false);
      setConfirmText('');
      setSelectedDeleteType(null);
      
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: `Gagal menghapus data: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const openConfirmDialog = (operation: any) => {
    setSelectedDeleteType(operation);
    setShowConfirmDialog(true);
    setConfirmText('');
  };

  const isConfirmTextValid = () => {
    return selectedDeleteType && confirmText === selectedDeleteType.confirmText;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Data</h2>
          <p className="text-gray-600">
            Hapus data sistem untuk pembersihan atau reset data
          </p>
        </div>
        <Badge variant="destructive" className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Admin Only
        </Badge>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Peringatan:</strong> Operasi penghapusan data tidak dapat dibatalkan. 
          Pastikan Anda telah membuat backup data sebelum melakukan operasi ini.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deleteOperations.map((operation) => (
          <Card key={operation.id} className="border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <span>{operation.title}</span>
                <Badge variant="outline" className={operation.color}>
                  <Database className="h-3 w-3 mr-1" />
                  {operation.tables.length} tabel
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                {operation.description}
              </p>
              
              <div className="text-xs text-gray-500">
                <strong>Tabel:</strong> {operation.tables.join(', ')}
              </div>
              
              <Button
                variant="destructive"
                onClick={() => openConfirmDialog(operation)}
                disabled={isDeleting === operation.id}
                className="w-full flex items-center gap-2"
              >
                {isDeleting === operation.id ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {isDeleting === operation.id ? 'Menghapus...' : 'Hapus Data'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Konfirmasi Penghapusan Data
            </DialogTitle>
          </DialogHeader>
          
          {selectedDeleteType && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Anda akan menghapus <strong>{selectedDeleteType.title}</strong>. 
                  Operasi ini tidak dapat dibatalkan!
                </AlertDescription>
              </Alert>
              
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Ketik "{selectedDeleteType.confirmText}" untuk konfirmasi:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder={selectedDeleteType.confirmText}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowConfirmDialog(false);
                    setConfirmText('');
                    setSelectedDeleteType(null);
                  }}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteData(selectedDeleteType)}
                  disabled={!isConfirmTextValid() || isDeleting === selectedDeleteType.id}
                  className="flex-1"
                >
                  {isDeleting === selectedDeleteType.id ? 'Menghapus...' : 'Hapus'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataManagement;
