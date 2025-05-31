
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User, Plus, Search } from 'lucide-react';
import { usePelangganUnit, usePelangganPerorangan } from '@/hooks/usePelanggan';

interface Customer {
  id: string;
  name: string;
  type: 'unit' | 'perorangan' | 'guest';
  phone?: string;
}

interface POSCustomerSelectProps {
  selectedCustomer: Customer | null;
  onCustomerSelect: (customer: Customer | null) => void;
}

const POSCustomerSelect = ({ selectedCustomer, onCustomerSelect }: POSCustomerSelectProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  const { data: pelangganUnit } = usePelangganUnit();
  const { data: pelangganPerorangan } = usePelangganPerorangan();

  const allCustomers: Customer[] = [
    ...(pelangganUnit?.map(unit => ({
      id: unit.id,
      name: unit.nama_unit,
      type: 'unit' as const,
      phone: unit.telepon || undefined
    })) || []),
    ...(pelangganPerorangan?.map(person => ({
      id: person.id,
      name: person.nama,
      type: 'perorangan' as const,
      phone: person.telepon || undefined
    })) || [])
  ];

  const filteredCustomers = allCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGuestCustomer = () => {
    if (guestName.trim()) {
      const guestCustomer: Customer = {
        id: 'guest',
        name: guestName.trim(),
        type: 'guest',
        phone: guestPhone.trim() || undefined
      };
      onCustomerSelect(guestCustomer);
      setGuestName('');
      setGuestPhone('');
      setShowCustomerDialog(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Pelanggan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {selectedCustomer ? (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{selectedCustomer.name}</p>
                  <p className="text-sm text-gray-600">
                    {selectedCustomer.type === 'unit' ? 'Unit' : 
                     selectedCustomer.type === 'perorangan' ? 'Perorangan' : 'Tamu'}
                  </p>
                  {selectedCustomer.phone && (
                    <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCustomerSelect(null)}
                >
                  Ubah
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Pilih Pelanggan
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Pilih Pelanggan</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Cari pelanggan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Customer List */}
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {filteredCustomers.map((customer) => (
                        <Button
                          key={customer.id}
                          variant="ghost"
                          className="w-full justify-start h-auto p-3"
                          onClick={() => {
                            onCustomerSelect(customer);
                            setShowCustomerDialog(false);
                          }}
                        >
                          <div className="text-left">
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-gray-600">
                              {customer.type === 'unit' ? 'Unit' : 'Perorangan'}
                            </p>
                          </div>
                        </Button>
                      ))}
                    </div>

                    {/* Guest Customer */}
                    <div className="border-t pt-4">
                      <Label className="text-sm font-medium">Atau tambah tamu:</Label>
                      <div className="space-y-2 mt-2">
                        <Input
                          placeholder="Nama tamu"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                        />
                        <Input
                          placeholder="No. Telepon (opsional)"
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                        />
                        <Button
                          onClick={handleGuestCustomer}
                          disabled={!guestName.trim()}
                          className="w-full"
                        >
                          Tambah Tamu
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => onCustomerSelect({
                  id: 'umum',
                  name: 'Umum',
                  type: 'guest'
                })}
              >
                Pelanggan Umum
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default POSCustomerSelect;
