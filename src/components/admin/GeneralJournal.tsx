
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Save, Edit, Trash2, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useChartOfAccounts } from '@/hooks/useChartOfAccounts';
import { useGeneralLedger } from '@/hooks/useFinancialReports';
import { supabase } from '@/integrations/supabase/client';

const GeneralJournal = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [journalEntries, setJournalEntries] = useState([
    { account_id: '', debit: 0, credit: 0, description: '' }
  ]);
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  
  const { toast } = useToast();
  const { data: accounts } = useChartOfAccounts();
  const { data: generalLedger, refetch } = useGeneralLedger(selectedPeriod);

  const addJournalEntry = () => {
    setJournalEntries([...journalEntries, { account_id: '', debit: 0, credit: 0, description: '' }]);
  };

  const removeJournalEntry = (index: number) => {
    if (journalEntries.length > 1) {
      setJournalEntries(journalEntries.filter((_, i) => i !== index));
    }
  };

  const updateJournalEntry = (index: number, field: string, value: any) => {
    const updated = [...journalEntries];
    updated[index] = { ...updated[index], [field]: value };
    setJournalEntries(updated);
  };

  const getTotalDebit = () => journalEntries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
  const getTotalCredit = () => journalEntries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
  const isBalanced = getTotalDebit() === getTotalCredit() && getTotalDebit() > 0;

  const handleSaveJournal = async () => {
    if (!isBalanced) {
      toast({
        title: "Error",
        description: "Total debit dan credit harus seimbang",
        variant: "destructive"
      });
      return;
    }

    try {
      for (const entry of journalEntries) {
        if (entry.account_id && (entry.debit > 0 || entry.credit > 0)) {
          const { error } = await supabase.rpc('create_general_ledger_entry', {
            p_transaction_date: transactionDate,
            p_account_id: entry.account_id,
            p_debit_amount: entry.debit || 0,
            p_credit_amount: entry.credit || 0,
            p_description: entry.description || description,
            p_reference_type: 'manual_journal',
            p_reference_id: null
          });

          if (error) throw error;
        }
      }

      toast({
        title: "Berhasil",
        description: "Jurnal berhasil disimpan",
      });

      setIsDialogOpen(false);
      setJournalEntries([{ account_id: '', debit: 0, credit: 0, description: '' }]);
      setDescription('');
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan jurnal",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Jurnal Umum</h3>
          <p className="text-gray-600">
            Kelola entri jurnal manual dan lihat riwayat transaksi
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Buat Jurnal Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Buat Jurnal Umum</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Tanggal Transaksi</Label>
                  <Input
                    id="date"
                    type="date"
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Keterangan</Label>
                  <Input
                    id="description"
                    placeholder="Keterangan jurnal..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Entri Jurnal</Label>
                {journalEntries.map((entry, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-4">
                      <Select
                        value={entry.account_id}
                        onValueChange={(value) => updateJournalEntry(index, 'account_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih akun..." />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts?.map(account => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.kode_akun} - {account.nama_akun}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Debit"
                        value={entry.debit || ''}
                        onChange={(e) => updateJournalEntry(index, 'debit', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Credit"
                        value={entry.credit || ''}
                        onChange={(e) => updateJournalEntry(index, 'credit', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        placeholder="Keterangan..."
                        value={entry.description}
                        onChange={(e) => updateJournalEntry(index, 'description', e.target.value)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeJournalEntry(index)}
                        disabled={journalEntries.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={addJournalEntry}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Entri
                </Button>
                
                <div className="text-sm space-y-1">
                  <div>Total Debit: <span className="font-medium">{formatCurrency(getTotalDebit())}</span></div>
                  <div>Total Credit: <span className="font-medium">{formatCurrency(getTotalCredit())}</span></div>
                  <div className={`font-medium ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                    {isBalanced ? '✓ Seimbang' : '✗ Tidak Seimbang'}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleSaveJournal} disabled={!isBalanced}>
                  <Save className="h-4 w-4 mr-2" />
                  Simpan Jurnal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* General Ledger Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Buku Besar Umum
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Akun</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead>Referensi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {generalLedger?.slice(0, 100).map(entry => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {new Date(entry.transaction_date).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{entry.chart_of_accounts?.nama_akun}</div>
                        <div className="text-gray-500">{entry.chart_of_accounts?.kode_akun}</div>
                      </div>
                    </TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell className="text-right">
                      {entry.debit_amount > 0 ? formatCurrency(entry.debit_amount) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.credit_amount > 0 ? formatCurrency(entry.credit_amount) : '-'}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {entry.reference_type || 'manual'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {generalLedger && generalLedger.length > 100 && (
            <p className="text-sm text-gray-500 mt-2">
              Menampilkan 100 entri terbaru dari {generalLedger.length} total entri
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralJournal;
