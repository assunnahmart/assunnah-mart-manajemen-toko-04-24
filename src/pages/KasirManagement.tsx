
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Users, Plus, Clock, Edit, Trash2 } from "lucide-react";
import { useKasir, useCreateKasir, useUpdateKasir, useDeleteKasir } from "@/hooks/useKasir";
import { useToast } from "@/hooks/use-toast";
import NewNavbar from "@/components/NewNavbar";
import NewProtectedRoute from "@/components/NewProtectedRoute";

const KasirManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingKasir, setEditingKasir] = useState<any>(null);
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    telepon: "",
    status: "aktif",
    shift: ""
  });

  const { data: kasirData, isLoading } = useKasir();
  const createKasir = useCreateKasir();
  const updateKasir = useUpdateKasir();
  const deleteKasir = useDeleteKasir();
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      nama: "",
      email: "",
      telepon: "",
      status: "aktif",
      shift: ""
    });
    setEditingKasir(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nama.trim()) {
      toast({
        title: "Error",
        description: "Nama kasir harus diisi",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (editingKasir) {
        await updateKasir.mutateAsync({
          id: editingKasir.id,
          updates: formData
        });
        toast({
          title: "Berhasil",
          description: "Data kasir berhasil diupdate",
        });
      } else {
        await createKasir.mutateAsync(formData);
        toast({
          title: "Berhasil",
          description: "Kasir baru berhasil ditambahkan",
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving kasir:', error);
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan saat menyimpan data",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (kasir: any) => {
    setEditingKasir(kasir);
    setFormData({
      nama: kasir.nama || "",
      email: kasir.email || "",
      telepon: kasir.telepon || "",
      status: kasir.status || "aktif",
      shift: kasir.shift || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string, nama: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus kasir "${nama}"?`)) {
      try {
        await deleteKasir.mutateAsync(id);
        toast({
          title: "Berhasil",
          description: "Kasir berhasil dihapus",
        });
      } catch (error: any) {
        console.error('Error deleting kasir:', error);
        toast({
          title: "Error",
          description: error.message || "Terjadi kesalahan saat menghapus kasir",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aktif':
        return 'default';
      case 'nonaktif':
        return 'destructive';
      case 'libur':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const KasirCard = ({ kasir }: { kasir: any }) => (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold">{kasir.nama}</h3>
            <p className="text-sm text-gray-500">{kasir.email || 'No email'}</p>
            <p className="text-sm text-gray-500">{kasir.telepon || 'No phone'}</p>
          </div>
          <Badge variant={getStatusColor(kasir.status) as any}>
            {kasir.status}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-gray-500" />
          <span>Shift: {kasir.shift || 'Belum ditentukan'}</span>
        </div>
        
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleEdit(kasir)} className="flex-1">
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleDelete(kasir.id, kasir.nama)}
            className="flex-1 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Hapus
          </Button>
        </div>
      </div>
    </Card>
  );

  if (isLoading) {
    return (
      <NewProtectedRoute requiredRole="admin">
        <div className="min-h-screen bg-gray-50">
          <NewNavbar />
          <div className="p-6">
            <div className="mx-auto max-w-7xl">
              <p>Loading...</p>
            </div>
          </div>
        </div>
      </NewProtectedRoute>
    );
  }

  return (
    <NewProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        <NewNavbar />
        <div className="p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manajemen Kasir</h1>
                <p className="text-gray-600">Kelola data kasir dan jadwal kerja</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Kasir
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingKasir ? 'Edit Kasir' : 'Tambah Kasir Baru'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingKasir ? 'Edit informasi kasir' : 'Isi formulir untuk menambahkan kasir baru'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="nama">Nama Lengkap *</Label>
                      <Input
                        id="nama"
                        value={formData.nama}
                        onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                        required
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Masukkan email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="telepon">Nomor Telepon</Label>
                      <Input
                        id="telepon"
                        value={formData.telepon}
                        onChange={(e) => setFormData(prev => ({ ...prev, telepon: e.target.value }))}
                        placeholder="Masukkan nomor telepon"
                      />
                    </div>
                    <div>
                      <Label htmlFor="shift">Shift</Label>
                      <Select 
                        value={formData.shift} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, shift: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih shift" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pagi">Pagi (06:00 - 14:00)</SelectItem>
                          <SelectItem value="siang">Siang (14:00 - 22:00)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aktif">Aktif</SelectItem>
                          <SelectItem value="nonaktif">Non Aktif</SelectItem>
                          <SelectItem value="libur">Libur</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button 
                        type="submit" 
                        className="flex-1"
                        disabled={createKasir.isPending || updateKasir.isPending}
                      >
                        {editingKasir ? 'Update Kasir' : 'Tambah Kasir'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsDialogOpen(false)}
                        className="flex-1"
                      >
                        Batal
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Kasir</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kasirData?.length || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Kasir Aktif</CardTitle>
                  <Users className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {kasirData?.filter(k => k.status === 'aktif').length || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Shift Pagi</CardTitle>
                  <Calendar className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {kasirData?.filter(k => k.shift === 'pagi').length || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Kasir List */}
            <Card>
              <CardHeader>
                <CardTitle>Daftar Kasir</CardTitle>
                <CardDescription>
                  Kelola informasi kasir dan jadwal kerja
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {kasirData?.map((kasir) => (
                    <KasirCard key={kasir.id} kasir={kasir} />
                  ))}
                </div>
                {(!kasirData || kasirData.length === 0) && (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Belum ada kasir</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Tambahkan kasir pertama Anda untuk memulai.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </NewProtectedRoute>
  );
};

export default KasirManagement;
