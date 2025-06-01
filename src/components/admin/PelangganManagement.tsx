
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Users, Building } from 'lucide-react';
import { usePelangganUnit, usePelangganPerorangan, useCreatePelangganUnit, useCreatePelangganPerorangan } from '@/hooks/usePelanggan';
import { useToast } from '@/hooks/use-toast';

const PelangganManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [showAddPerorangan, setShowAddPerorangan] = useState(false);
  const { toast } = useToast();
  
  const { data: pelangganUnit, isLoading: loadingUnit } = usePelangganUnit();
  const { data: pelangganPerorangan, isLoading: loadingPerorangan } = usePelangganPerorangan();
  const createUnit = useCreatePelangganUnit();
  const createPerorangan = useCreatePelangganPerorangan();

  const [unitForm, setUnitForm] = useState({
    nama_unit: '',
    alamat: '',
    telepon: '',
    kontak_person: '',
    jenis_pembayaran: 'cash',
    limit_kredit: 0
  });

  const [peroranganForm, setPeroranganForm] = useState({
    nama: '',
    alamat: '',
    telepon: '',
    nik: '',
    jabatan: '',
    departemen: '',
    gaji_pokok: 0,
    batas_potong_gaji: 0
  });

  const handleCreateUnit = async () => {
    try {
      await createUnit.mutateAsync(unitForm);
      setShowAddUnit(false);
      setUnitForm({
        nama_unit: '',
        alamat: '',
        telepon: '',
        kontak_person: '',
        jenis_pembayaran: 'cash',
        limit_kredit: 0
      });
      toast({
        title: "Berhasil",
        description: "Pelanggan unit berhasil ditambahkan"
      });
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Gagal menambahkan pelanggan unit",
        variant: "destructive"
      });
    }
  };

  const handleCreatePerorangan = async () => {
    try {
      await createPerorangan.mutateAsync(peroranganForm);
      setShowAddPerorangan(false);
      setPeroranganForm({
        nama: '',
        alamat: '',
        telepon: '',
        nik: '',
        jabatan: '',
        departemen: '',
        gaji_pokok: 0,
        batas_potong_gaji: 0
      });
      toast({
        title: "Berhasil",
        description: "Pelanggan perorangan berhasil ditambahkan"
      });
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Gagal menambahkan pelanggan perorangan",
        variant: "destructive"
      });
    }
  };

  const filteredUnit = pelangganUnit?.filter(unit => 
    unit.nama_unit.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredPerorangan = pelangganPerorangan?.filter(person => 
    person.nama.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Manajemen Pelanggan</h2>
          <p className="text-gray-600">Kelola data pelanggan unit dan perorangan</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showAddUnit} onOpenChange={setShowAddUnit}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Tambah Unit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Tambah Pelanggan Unit</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nama Unit</Label>
                  <Input
                    value={unitForm.nama_unit}
                    onChange={(e) => setUnitForm({...unitForm, nama_unit: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Alamat</Label>
                  <Textarea
                    value={unitForm.alamat}
                    onChange={(e) => setUnitForm({...unitForm, alamat: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Telepon</Label>
                  <Input
                    value={unitForm.telepon}
                    onChange={(e) => setUnitForm({...unitForm, telepon: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Kontak Person</Label>
                  <Input
                    value={unitForm.kontak_person}
                    onChange={(e) => setUnitForm({...unitForm, kontak_person: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Jenis Pembayaran</Label>
                  <Select
                    value={unitForm.jenis_pembayaran}
                    onValueChange={(value) => setUnitForm({...unitForm, jenis_pembayaran: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Tunai</SelectItem>
                      <SelectItem value="credit">Kredit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Limit Kredit</Label>
                  <Input
                    type="number"
                    value={unitForm.limit_kredit}
                    onChange={(e) => setUnitForm({...unitForm, limit_kredit: Number(e.target.value)})}
                  />
                </div>
                <Button onClick={handleCreateUnit} className="w-full">
                  Simpan
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddPerorangan} onOpenChange={setShowAddPerorangan}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Tambah Perorangan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Tambah Pelanggan Perorangan</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nama</Label>
                  <Input
                    value={peroranganForm.nama}
                    onChange={(e) => setPeroranganForm({...peroranganForm, nama: e.target.value})}
                  />
                </div>
                <div>
                  <Label>NIK</Label>
                  <Input
                    value={peroranganForm.nik}
                    onChange={(e) => setPeroranganForm({...peroranganForm, nik: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Telepon</Label>
                  <Input
                    value={peroranganForm.telepon}
                    onChange={(e) => setPeroranganForm({...peroranganForm, telepon: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Jabatan</Label>
                  <Input
                    value={peroranganForm.jabatan}
                    onChange={(e) => setPeroranganForm({...peroranganForm, jabatan: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Departemen</Label>
                  <Input
                    value={peroranganForm.departemen}
                    onChange={(e) => setPeroranganForm({...peroranganForm, departemen: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Gaji Pokok</Label>
                  <Input
                    type="number"
                    value={peroranganForm.gaji_pokok}
                    onChange={(e) => setPeroranganForm({...peroranganForm, gaji_pokok: Number(e.target.value)})}
                  />
                </div>
                <Button onClick={handleCreatePerorangan} className="w-full">
                  Simpan
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Cari pelanggan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Content */}
      <Tabs defaultValue="unit" className="space-y-4">
        <TabsList>
          <TabsTrigger value="unit" className="gap-2">
            <Building className="h-4 w-4" />
            Pelanggan Unit ({filteredUnit.length})
          </TabsTrigger>
          <TabsTrigger value="perorangan" className="gap-2">
            <Users className="h-4 w-4" />
            Pelanggan Perorangan ({filteredPerorangan.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unit">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUnit.map((unit) => (
              <Card key={unit.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{unit.nama_unit}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant={unit.jenis_pembayaran === 'credit' ? 'destructive' : 'default'}>
                      {unit.jenis_pembayaran === 'credit' ? 'Kredit' : 'Tunai'}
                    </Badge>
                    <Badge variant={unit.status === 'aktif' ? 'default' : 'secondary'}>
                      {unit.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><strong>Kontak:</strong> {unit.kontak_person}</p>
                    <p><strong>Telepon:</strong> {unit.telepon}</p>
                    <p><strong>Total Tagihan:</strong> Rp {(unit.total_tagihan || 0).toLocaleString('id-ID')}</p>
                    <p><strong>Limit Kredit:</strong> Rp {(unit.limit_kredit || 0).toLocaleString('id-ID')}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="perorangan">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPerorangan.map((person) => (
              <Card key={person.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{person.nama}</CardTitle>
                  <Badge variant={person.status === 'aktif' ? 'default' : 'secondary'}>
                    {person.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><strong>NIK:</strong> {person.nik}</p>
                    <p><strong>Jabatan:</strong> {person.jabatan}</p>
                    <p><strong>Departemen:</strong> {person.departemen}</p>
                    <p><strong>Telepon:</strong> {person.telepon}</p>
                    <p><strong>Sisa Piutang:</strong> Rp {(person.sisa_piutang || 0).toLocaleString('id-ID')}</p>
                    <p><strong>Gaji Pokok:</strong> Rp {(person.gaji_pokok || 0).toLocaleString('id-ID')}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PelangganManagement;
