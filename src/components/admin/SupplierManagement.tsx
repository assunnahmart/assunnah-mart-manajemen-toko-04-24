
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus, Edit, Trash2, Package, Building, Phone, MapPin } from 'lucide-react';
import { useSupplier, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '@/hooks/useSupplier';
import { useToast } from '@/hooks/use-toast';

const SupplierManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [newSupplier, setNewSupplier] = useState({
    nama: '',
    alamat: '',
    telepon: '',
    email: '',
    kontak_person: '',
    jenis: 'supplier'
  });

  const { data: suppliers } = useSupplier();
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();
  const { toast } = useToast();

  const filteredSuppliers = suppliers?.filter(supplier =>
    supplier.nama.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCreateSupplier = async () => {
    try {
      await createSupplier.mutateAsync(newSupplier);
      toast({
        title: "Berhasil",
        description: "Supplier berhasil ditambahkan"
      });
      setIsDialogOpen(false);
      setNewSupplier({
        nama: '',
        alamat: '',
        telepon: '',
        email: '',
        kontak_person: '',
        jenis: 'supplier'
      });
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan saat menambahkan supplier",
        variant: "destructive"
      });
    }
  };

  const handleEditSupplier = (supplier) => {
    setEditingSupplier({
      ...supplier,
      kontak_person: supplier.kontak_person || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateSupplier = async () => {
    try {
      await updateSupplier.mutateAsync({
        id: editingSupplier.id,
        updates: {
          nama: editingSupplier.nama,
          alamat: editingSupplier.alamat,
          telepon: editingSupplier.telepon,
          email: editingSupplier.email,
          kontak_person: editingSupplier.kontak_person,
          jenis: editingSupplier.jenis
        }
      });
      toast({
        title: "Berhasil",
        description: "Supplier berhasil diperbarui"
      });
      setIsEditDialogOpen(false);
      setEditingSupplier(null);
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan saat memperbarui supplier",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSupplier = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus supplier ini?')) {
      try {
        await deleteSupplier.mutateAsync(id);
        toast({
          title: "Berhasil",
          description: "Supplier berhasil dihapus"
        });
      } catch (error) {
        toast({
          title: "Gagal",
          description: "Terjadi kesalahan saat menghapus supplier",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manajemen Supplier</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tambah Supplier Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nama">Nama Supplier *</Label>
                  <Input
                    id="nama"
                    value={newSupplier.nama}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, nama: e.target.value }))}
                    placeholder="Masukkan nama supplier"
                  />
                </div>
                <div>
                  <Label htmlFor="kontak_person">Kontak Person</Label>
                  <Input
                    id="kontak_person"
                    value={newSupplier.kontak_person}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, kontak_person: e.target.value }))}
                    placeholder="Nama kontak person"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telepon">Nomor Telepon</Label>
                  <Input
                    id="telepon"
                    value={newSupplier.telepon}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, telepon: e.target.value }))}
                    placeholder="Nomor telepon"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Email supplier"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="alamat">Alamat</Label>
                <Textarea
                  id="alamat"
                  value={newSupplier.alamat}
                  onChange={(e) => setNewSupplier(prev => ({ ...prev, alamat: e.target.value }))}
                  placeholder="Alamat lengkap supplier"
                />
              </div>

              <Button
                onClick={handleCreateSupplier}
                disabled={!newSupplier.nama || createSupplier.isPending}
                className="w-full"
              >
                <Building className="h-4 w-4 mr-2" />
                {createSupplier.isPending ? 'Menyimpan...' : 'Simpan Supplier'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
          </DialogHeader>
          {editingSupplier && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_nama">Nama Supplier *</Label>
                  <Input
                    id="edit_nama"
                    value={editingSupplier.nama}
                    onChange={(e) => setEditingSupplier(prev => ({ ...prev, nama: e.target.value }))}
                    placeholder="Masukkan nama supplier"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_kontak_person">Kontak Person</Label>
                  <Input
                    id="edit_kontak_person"
                    value={editingSupplier.kontak_person}
                    onChange={(e) => setEditingSupplier(prev => ({ ...prev, kontak_person: e.target.value }))}
                    placeholder="Nama kontak person"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_telepon">Nomor Telepon</Label>
                  <Input
                    id="edit_telepon"
                    value={editingSupplier.telepon || ''}
                    onChange={(e) => setEditingSupplier(prev => ({ ...prev, telepon: e.target.value }))}
                    placeholder="Nomor telepon"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_email">Email</Label>
                  <Input
                    id="edit_email"
                    value={editingSupplier.email || ''}
                    onChange={(e) => setEditingSupplier(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Email supplier"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit_alamat">Alamat</Label>
                <Textarea
                  id="edit_alamat"
                  value={editingSupplier.alamat || ''}
                  onChange={(e) => setEditingSupplier(prev => ({ ...prev, alamat: e.target.value }))}
                  placeholder="Alamat lengkap supplier"
                />
              </div>

              <Button
                onClick={handleUpdateSupplier}
                disabled={!editingSupplier.nama || updateSupplier.isPending}
                className="w-full"
              >
                <Building className="h-4 w-4 mr-2" />
                {updateSupplier.isPending ? 'Menyimpan...' : 'Update Supplier'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Supplier</CardTitle>
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari nama supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {filteredSuppliers.map((supplier) => (
              <Card key={supplier.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{supplier.nama}</h3>
                      <Badge variant="outline">Supplier</Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {supplier.telepon || 'No phone'}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {supplier.alamat || 'No address'}
                      </div>
                      {supplier.kontak_person && (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Contact: {supplier.kontak_person}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="text-sm">
                      <div>Status: <Badge variant="default">Aktif</Badge></div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditSupplier(supplier)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteSupplier(supplier.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplierManagement;
