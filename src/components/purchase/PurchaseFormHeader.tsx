
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import PurchaseSupplierSelect from './PurchaseSupplierSelect';

interface PurchaseFormHeaderProps {
  supplierId: string;
  setSupplierId: (value: string) => void;
  jenisTransaksi: 'cash' | 'kredit';
  setJenisTransaksi: (value: 'cash' | 'kredit') => void;
  jatuhTempo: string;
  setJatuhTempo: (value: string) => void;
  catatan: string;
  setCatatan: (value: string) => void;
  suppliers: any[];
}

const PurchaseFormHeader = ({
  supplierId,
  setSupplierId,
  jenisTransaksi,
  setJenisTransaksi,
  jatuhTempo,
  setJatuhTempo,
  catatan,
  setCatatan,
  suppliers
}: PurchaseFormHeaderProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <PurchaseSupplierSelect
        supplierId={supplierId}
        setSupplierId={setSupplierId}
        suppliers={suppliers}
      />

      <div>
        <Label htmlFor="jenis">Jenis Pembayaran</Label>
        <Select value={jenisTransaksi || "cash"} onValueChange={(value: 'cash' | 'kredit') => setJenisTransaksi(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Tunai</SelectItem>
            <SelectItem value="kredit">Kredit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {jenisTransaksi === 'kredit' && (
        <div>
          <Label htmlFor="jatuhTempo">Jatuh Tempo</Label>
          <Input
            id="jatuhTempo"
            type="date"
            value={jatuhTempo}
            onChange={(e) => setJatuhTempo(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      )}

      <div className={jenisTransaksi === 'cash' ? 'md:col-span-2' : ''}>
        <Label htmlFor="catatan">Catatan</Label>
        <Textarea
          id="catatan"
          placeholder="Catatan transaksi..."
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
};

export default PurchaseFormHeader;
