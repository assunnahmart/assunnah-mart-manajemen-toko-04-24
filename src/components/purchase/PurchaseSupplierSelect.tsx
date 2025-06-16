
import { useState, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface PurchaseSupplierSelectProps {
  supplierId: string;
  setSupplierId: (value: string) => void;
  suppliers: any[];
}

const PurchaseSupplierSelect = ({
  supplierId,
  setSupplierId,
  suppliers
}: PurchaseSupplierSelectProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter suppliers based on search term and ensure valid IDs
  const validSuppliers = useMemo(() => {
    return suppliers?.filter(supplier => 
      supplier && 
      supplier.id && 
      typeof supplier.id === 'string' && 
      supplier.id.trim() !== '' &&
      supplier.nama &&
      supplier.nama.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  }, [suppliers, searchTerm]);

  return (
    <div>
      <Label htmlFor="supplier">Supplier ({validSuppliers.length} tersedia)</Label>
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={supplierId || ""} onValueChange={setSupplierId}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih supplier..." />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {validSuppliers.map((supplier) => (
              <SelectItem key={supplier.id} value={supplier.id}>
                <div className="flex flex-col">
                  <span>{supplier.nama}</span>
                  {supplier.telepon && (
                    <span className="text-xs text-gray-500">{supplier.telepon}</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default PurchaseSupplierSelect;
