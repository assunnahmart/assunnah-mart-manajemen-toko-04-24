
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Edit, Trash2, Building2, Phone, Mail, MapPin } from 'lucide-react';
import { useSupplier } from '@/hooks/useSupplier';
import { useToast } from '@/hooks/use-toast';

const SupplierManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [supplierForm, setSupplierForm] = useState({
    nama: '',
    jenis: '',
    alamat: '',
    telepon: '',
    email: ''
  });

  const { data: suppliers, createSupplier, updateSupplier, deleteSupplier } = useSupplier();
  const { toast } = useToast();

  const filteredSuppliers = suppliers?.filter(supplier =>
    supplier.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.jenis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.alamat?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSubmit = async () => {
    try {
      if (editingSupplier) {
        await updateSupplier.mutateAsync({
          id: editingSupplier.id,
          ...supplierForm
        });
        toast({
          title: "Berhasil",
          description: "Data supplier berhasil diperbarui"
        });
      } else {
        await createSupplier.mutateAsync(supplierForm);
        toast({
          title: "Berhasil", 
          description: "Supplier baru berhasil ditambahkan"
        });
      }
      
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setSupplierForm({
      nama: supplier.nama,
      jenis: supplier.jenis || '',
      alamat: supplier.alamat || '',
      telepon: supplier.telepon || '',
      email: supplier.email || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (supplierId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus supplier ini?')) {
      try {
        await deleteSupplier.mutateAsync(supplierId);
        toast({
          title: "Berhasil",
          description: "Supplier berhasil dihapus"
        });
      } catch (error) {
        toast({
          title: "Error", 
          description: error.message,
          variant: "destructive"
        });
      }
    }
  };

  const resetForm = () => {
    setSupplierForm({
      nama: '',
      jenis: '',
      alamat: '',
      telepon: '',
      email: ''
    });
    setEditingSupplier(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Supplier</h1>
          <p className="text-gray-600">Kelola data supplier dan vendor</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Supplier
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSupplier ? 'Edit Supplier' : 'Tambah Supplier Baru'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nama Supplier</Label>
                <Input
                  value={supplierForm.nama}
                  onChange={(e) => setSupplierForm(prev => ({ ...prev, nama: e.target.value }))}
                  placeholder="Masukkan nama supplier"
                />
              </div>
              <div>
                <Label>Jenis/Kategori</Label>
                <Input
                  value={supplierForm.jenis}
                  onChange={(e) => setSupplierForm(prev => ({ ...prev, jenis: e.target.value }))}
                  placeholder="Masukkan jenis supplier"
                />
              </div>
              <div>
                <Label>Alamat</Label>
                <Input
                  value={supplierForm.alamat}
                  onChange={(e) => setSupplierForm(prev => ({ ...prev, alamat: e.target.value }))}
                  placeholder="Masukkan alamat supplier"
                />
              </div>
              <div>
                <Label>Telepon</Label>
                <Input
                  value={supplierForm.telepon}
                  onChange={(e) => setSupplierForm(prev => ({ ...prev, telepon: e.target.value }))}
                  placeholder="Masukkan nomor telepon"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={supplierForm.email}
                  onChange={(e) => setSupplierForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Masukkan email supplier"
                  type="email"
                />
              </div>
              <Button 
                onClick={handleSubmit} 
                disabled={createSupplier.isPending || updateSupplier.isPending}
                className="w-full"
              >
                {(createSupplier.isPending || updateSupplier.isPending) ? 'Menyimpan...' : 
                 editingSupplier ? 'Update Supplier' : 'Tambah Supplier'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari supplier berdasarkan nama, jenis, atau alamat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Suppliers List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Supplier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Supplier</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{supplier.nama}</span>
                      </div>
                    </TableCell>
                    <TableCell>{supplier.jenis || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">{supplier.alamat || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">{supplier.telepon || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">{supplier.email || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(supplier)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(supplier.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredSuppliers.length === 0 && (
              <div className="text-center py-8">
                <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">Tidak ada supplier</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Tidak ada supplier yang sesuai dengan pencarian.' : 'Mulai dengan menambahkan supplier baru.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplierManagement;
