
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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
  console.log('PurchaseFormHeader - DEBUG START');
  console.log('PurchaseFormHeader suppliers:', suppliers);
  
  // Enhanced validation to filter out suppliers with invalid IDs
  const validSuppliers = suppliers?.filter(supplier => {
    const hasValidId = supplier && 
                      supplier.id && 
                      typeof supplier.id === 'string' && 
                      supplier.id.trim() !== '' &&
                      supplier.id !== null &&
                      supplier.id !== undefined;
    
    console.log('Supplier validation:', { 
      supplier: supplier?.nama, 
      id: supplier?.id, 
      type: typeof supplier?.id,
      isValid: hasValidId 
    });
    
    if (!hasValidId) {
      console.error('INVALID SUPPLIER DETECTED:', supplier);
    }
    
    return hasValidId;
  }) || [];

  console.log('Valid suppliers after filtering:', validSuppliers.length);
  console.log('PurchaseFormHeader - DEBUG END');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="supplier">Supplier</Label>
        <Select value={supplierId || ""} onValueChange={setSupplierId}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih supplier..." />
          </SelectTrigger>
          <SelectContent>
            {validSuppliers.map((supplier) => {
              console.log('Rendering supplier SelectItem:', { id: supplier.id, nama: supplier.nama });
              if (!supplier.id || supplier.id.trim() === '') {
                console.error('ATTEMPTING TO RENDER INVALID SUPPLIER:', supplier);
                return null;
              }
              return (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.nama}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

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
        />
      </div>
    </div>
  );
};

export default PurchaseFormHeader;
