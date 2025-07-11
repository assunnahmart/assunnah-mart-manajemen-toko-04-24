import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Edit, Trash2, Building2, User, Phone, MapPin, FileSpreadsheet } from 'lucide-react';
import { usePelangganUnit, usePelangganPerorangan, useCreatePelangganUnit, useCreatePelangganPerorangan } from '@/hooks/usePelanggan';
import { useToast } from '@/hooks/use-toast';
import CustomerExportImport from './CustomerExportImport';

const PelangganManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editingType, setEditingType] = useState('unit');
  const [newCustomer, setNewCustomer] = useState({
    nama: '',
    nama_unit: '',
    jabatan: '',
    telepon: '',
    alamat: '',
    jenis_pembayaran: 'tunai',
    limit_kredit: 0
  });

  const { data: pelangganUnit, refetch: refetchUnit } = usePelangganUnit();
  const { data: pelangganPerorangan, refetch: refetchPerorangan } = usePelangganPerorangan();
  const createPelangganUnit = useCreatePelangganUnit();
  const createPelangganPerorangan = useCreatePelangganPerorangan();
  const { toast } = useToast();

  // Combine all customers for export
  const allCustomers = [
    ...(pelangganUnit || []).map(customer => ({ ...customer, type: 'unit' })),
    ...(pelangganPerorangan || []).map(customer => ({ ...customer, type: 'perorangan' }))
  ];

  const handleCreateCustomer = async (type) => {
    try {
      const customerData = {
        ...newCustomer,
        nama_unit: type === 'unit' ? newCustomer.nama_unit : null
      };

      if (type === 'unit') {
        await createPelangganUnit.mutateAsync(customerData);
      } else {
        await createPelangganPerorangan.mutateAsync(customerData);
      }

      toast({
        title: "Berhasil",
        description: `Pelanggan ${type} berhasil ditambahkan`
      });

      setIsDialogOpen(false);
      setNewCustomer({
        nama: '',
        nama_unit: '',
        jabatan: '',
        telepon: '',
        alamat: '',
        jenis_pembayaran: 'tunai',
        limit_kredit: 0
      });
    } catch (error) {
      console.error('Error creating customer:', error);
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan saat menambahkan pelanggan",
        variant: "destructive"
      });
    }
  };

  const handleEditCustomer = (customer, type) => {
    setEditingCustomer({
      ...customer,
      nama_unit: customer.nama_unit || ''
    });
    setEditingType(type);
    setIsEditDialogOpen(true);
  };

  const handleUpdateCustomer = async () => {
    try {
      // This would need to be implemented with update mutations
      // For now, just close the dialog
      toast({
        title: "Info",
        description: "Fitur edit akan segera tersedia"
      });
      setIsEditDialogOpen(false);
      setEditingCustomer(null);
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan saat memperbarui pelanggan",
        variant: "destructive"
      });
    }
  };

  const filteredPelangganUnit = pelangganUnit?.filter(customer =>
    customer.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.nama_unit && customer.nama_unit.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const filteredPelangganPerorangan = pelangganPerorangan?.filter(customer =>
    customer.nama.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleImportSuccess = () => {
    refetchUnit();
    refetchPerorangan();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manajemen Pelanggan</h1>
        <div className="flex gap-2">
          <Dialog open={isExportImportOpen} onOpenChange={setIsExportImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-green-600 hover:bg-green-700 text-white">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export/Import
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Export/Import Data Pelanggan</DialogTitle>
              </DialogHeader>
              <CustomerExportImport 
                customers={allCustomers} 
                onImportSuccess={handleImportSuccess}
              />
            </DialogContent>
          </Dialog>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Pelanggan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tambah Pelanggan Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nama">Nama Lengkap *</Label>
                    <Input
                      id="nama"
                      value={newCustomer.nama}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, nama: e.target.value }))}
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nama_unit">Nama Unit/Perusahaan</Label>
                    <Input
                      id="nama_unit"
                      value={newCustomer.nama_unit}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, nama_unit: e.target.value }))}
                      placeholder="Nama unit atau perusahaan"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="jabatan">Jabatan</Label>
                    <Input
                      id="jabatan"
                      value={newCustomer.jabatan}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, jabatan: e.target.value }))}
                      placeholder="Jabatan"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telepon">Nomor Telepon</Label>
                    <Input
                      id="telepon"
                      value={newCustomer.telepon}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, telepon: e.target.value }))}
                      placeholder="Nomor telepon"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="alamat">Alamat</Label>
                  <Textarea
                    id="alamat"
                    value={newCustomer.alamat}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, alamat: e.target.value }))}
                    placeholder="Alamat lengkap"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="jenis_pembayaran">Jenis Pembayaran</Label>
                    <Select
                      value={newCustomer.jenis_pembayaran}
                      onValueChange={(value) => setNewCustomer(prev => ({ ...prev, jenis_pembayaran: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tunai">Tunai</SelectItem>
                        <SelectItem value="kredit">Kredit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="limit_kredit">Limit Kredit</Label>
                    <Input
                      id="limit_kredit"
                      type="number"
                      value={newCustomer.limit_kredit}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, limit_kredit: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleCreateCustomer('unit')}
                    disabled={!newCustomer.nama || createPelangganUnit.isPending}
                    className="flex-1"
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Simpan sebagai Unit
                  </Button>
                  <Button
                    onClick={() => handleCreateCustomer('perorangan')}
                    disabled={!newCustomer.nama || createPelangganPerorangan.isPending}
                    variant="outline"
                    className="flex-1"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Simpan sebagai Perorangan
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Pelanggan</DialogTitle>
          </DialogHeader>
          {editingCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_nama">Nama Lengkap *</Label>
                  <Input
                    id="edit_nama"
                    value={editingCustomer.nama}
                    onChange={(e) => setEditingCustomer(prev => ({ ...prev, nama: e.target.value }))}
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                {editingType === 'unit' && (
                  <div>
                    <Label htmlFor="edit_nama_unit">Nama Unit/Perusahaan</Label>
                    <Input
                      id="edit_nama_unit"
                      value={editingCustomer.nama_unit}
                      onChange={(e) => setEditingCustomer(prev => ({ ...prev, nama_unit: e.target.value }))}
                      placeholder="Nama unit atau perusahaan"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_jabatan">Jabatan</Label>
                  <Input
                    id="edit_jabatan"
                    value={editingCustomer.jabatan || ''}
                    onChange={(e) => setEditingCustomer(prev => ({ ...prev, jabatan: e.target.value }))}
                    placeholder="Jabatan"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_telepon">Nomor Telepon</Label>
                  <Input
                    id="edit_telepon"
                    value={editingCustomer.telepon || ''}
                    onChange={(e) => setEditingCustomer(prev => ({ ...prev, telepon: e.target.value }))}
                    placeholder="Nomor telepon"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit_alamat">Alamat</Label>
                <Textarea
                  id="edit_alamat"
                  value={editingCustomer.alamat || ''}
                  onChange={(e) => setEditingCustomer(prev => ({ ...prev, alamat: e.target.value }))}
                  placeholder="Alamat lengkap"
                />
              </div>

              <Button
                onClick={handleUpdateCustomer}
                disabled={!editingCustomer.nama}
                className="w-full"
              >
                <User className="h-4 w-4 mr-2" />
                Update Pelanggan
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Pelanggan</CardTitle>
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari nama pelanggan atau unit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="unit" className="w-full">
            <TabsList>
              <TabsTrigger value="unit" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Pelanggan Unit ({filteredPelangganUnit.length})
              </TabsTrigger>
              <TabsTrigger value="perorangan" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Pelanggan Perorangan ({filteredPelangganPerorangan.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="unit" className="mt-4">
              <div className="grid gap-4">
                {filteredPelangganUnit.map((customer) => (
                  <Card key={customer.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{customer.nama}</h3>
                          <Badge variant="outline">{customer.nama_unit || 'No unit'}</Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {customer.jabatan || 'No position'}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {customer.telepon || 'No phone'}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {customer.alamat || 'No address'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-sm">
                          <div>Hutang: <span className="font-semibold text-red-600">Rp {(customer.total_tagihan || 0).toLocaleString()}</span></div>
                          <div>Limit: <span className="font-semibold">Rp {(customer.limit_kredit || 0).toLocaleString()}</span></div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditCustomer(customer, 'unit')}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="perorangan" className="mt-4">
              <div className="grid gap-4">
                {filteredPelangganPerorangan.map((customer) => (
                  <Card key={customer.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{customer.nama}</h3>
                          <Badge variant="secondary">Perorangan</Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {customer.jabatan || 'No position'}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {customer.telepon || 'No phone'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-sm">
                          <div>Piutang: <span className="font-semibold text-red-600">Rp {(customer.sisa_piutang || 0).toLocaleString()}</span></div>
                          <div>Limit: <span className="font-semibold">Rp {(customer.limit_kredit || 0).toLocaleString()}</span></div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditCustomer(customer, 'perorangan')}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PelangganManagement;
