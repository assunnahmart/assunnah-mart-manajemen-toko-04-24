
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Edit, Trash2, Calendar, Clock } from "lucide-react";
import { useKasir, useCreateKasir, useUpdateKasir, useDeleteKasir } from "@/hooks/useKasir";
import { useToast } from "@/hooks/use-toast";

const KasirManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingKasir, setEditingKasir] = useState(null);
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    telepon: "",
    status: "aktif",
    shift: "pagi"
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
      shift: "pagi"
    });
    setEditingKasir(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menyimpan data",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (kasir: any) => {
    setEditingKasir(kasir);
    setFormData({
      nama: kasir.nama,
      email: kasir.email || "",
      telepon: kasir.telepon || "",
      status: kasir.status,
      shift: kasir.shift || "pagi"
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Yakin ingin menghapus kasir ini?")) {
      try {
        await deleteKasir.mutateAsync(id);
        toast({
          title: "Berhasil",
          description: "Kasir berhasil dihapus",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Terjadi kesalahan saat menghapus kasir",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      aktif: "default",
      nonaktif: "secondary",
      libur: "outline"
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getShiftBadge = (shift: string) => {
    const colors = {
      pagi: "bg-yellow-100 text-yellow-800",
      siang: "bg-blue-100 text-blue-800"
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[shift] || "bg-gray-100 text-gray-800"}`}>
        {shift}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manajemen Kasir</h1>
            <p className="text-gray-600">Kelola data kasir dan jadwal shift</p>
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
                  Isi formulir untuk {editingKasir ? 'mengupdate' : 'menambahkan'} data kasir
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nama">Nama Lengkap</Label>
                  <Input
                    id="nama"
                    value={formData.nama}
                    onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="telepon">Telepon</Label>
                  <Input
                    id="telepon"
                    value={formData.telepon}
                    onChange={(e) => setFormData(prev => ({ ...prev, telepon: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="shift">Shift</Label>
                  <Select value={formData.shift} onValueChange={(value) => setFormData(prev => ({ ...prev, shift: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pagi">Pagi</SelectItem>
                      <SelectItem value="siang">Siang</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aktif">Aktif</SelectItem>
                      <SelectItem value="nonaktif">Non-aktif</SelectItem>
                      <SelectItem value="libur">Libur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingKasir ? 'Update' : 'Tambah'}
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
              <Clock className="h-4 w-4 text-yellow-500" />
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
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Daftar Kasir
            </CardTitle>
            <CardDescription>
              Kelola informasi kasir dan jadwal shift mereka
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {kasirData?.map((kasir) => (
                <Card key={kasir.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{kasir.nama}</h3>
                        <p className="text-sm text-gray-500">{kasir.email}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(kasir)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(kasir.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Status:</span>
                        {getStatusBadge(kasir.status)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Shift:</span>
                        {getShiftBadge(kasir.shift)}
                      </div>
                      {kasir.telepon && (
                        <div className="flex justify-between">
                          <span className="text-sm">Telepon:</span>
                          <span className="text-sm">{kasir.telepon}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            {(!kasirData || kasirData.length === 0) && (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">Belum ada kasir</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Mulai dengan menambahkan kasir pertama Anda.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KasirManagement;
