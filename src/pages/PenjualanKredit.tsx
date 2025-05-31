
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreditCard, Plus, Users, Building, DollarSign, AlertCircle } from "lucide-react";
import { usePelangganUnit, usePelangganPerorangan, usePelangganKredit, useCreatePelangganUnit, useCreatePelangganPerorangan } from "@/hooks/usePelanggan";
import { useToast } from "@/hooks/use-toast";

const PenjualanKredit = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pelangganType, setPelangganType] = useState<'unit' | 'perorangan'>('unit');
  const [formDataUnit, setFormDataUnit] = useState({
    nama_unit: "",
    alamat: "",
    kontak_person: "",
    telepon: "",
    jenis_pembayaran: "kredit",
    limit_kredit: 0
  });
  const [formDataPerorangan, setFormDataPerorangan] = useState({
    nama: "",
    nik: "",
    jabatan: "",
    departemen: "",
    gaji_pokok: 0,
    batas_potong_gaji: 0,
    telepon: "",
    alamat: ""
  });

  const { data: pelangganUnit } = usePelangganUnit();
  const { data: pelangganPerorangan } = usePelangganPerorangan();
  const { data: pelangganKredit } = usePelangganKredit();
  const createPelangganUnit = useCreatePelangganUnit();
  const createPelangganPerorangan = useCreatePelangganPerorangan();
  const { toast } = useToast();

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const resetForm = () => {
    setFormDataUnit({
      nama_unit: "",
      alamat: "",
      kontak_person: "",
      telepon: "",
      jenis_pembayaran: "kredit",
      limit_kredit: 0
    });
    setFormDataPerorangan({
      nama: "",
      nik: "",
      jabatan: "",
      departemen: "",
      gaji_pokok: 0,
      batas_potong_gaji: 0,
      telepon: "",
      alamat: ""
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (pelangganType === 'unit') {
        await createPelangganUnit.mutateAsync({
          ...formDataUnit,
          limit_kredit: formDataUnit.limit_kredit.toString()
        });
        toast({
          title: "Berhasil",
          description: "Pelanggan unit berhasil ditambahkan",
        });
      } else {
        await createPelangganPerorangan.mutateAsync({
          ...formDataPerorangan,
          gaji_pokok: formDataPerorangan.gaji_pokok.toString(),
          batas_potong_gaji: formDataPerorangan.batas_potong_gaji.toString()
        });
        toast({
          title: "Berhasil",
          description: "Pelanggan perorangan berhasil ditambahkan",
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

  const getStatusBadge = (status: string) => {
    const variants = {
      aktif: "default",
      nonaktif: "secondary",
      menunggak: "destructive"
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const PelangganUnitCard = ({ pelanggan }: { pelanggan: any }) => (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold">{pelanggan.nama_unit}</h3>
            <p className="text-sm text-gray-500">{pelanggan.kontak_person}</p>
            <p className="text-xs text-gray-400">{pelanggan.alamat}</p>
          </div>
          {getStatusBadge(pelanggan.status)}
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Limit Kredit:</span>
            <p className="font-medium">{formatRupiah(pelanggan.limit_kredit || 0)}</p>
          </div>
          <div>
            <span className="text-gray-500">Total Tagihan:</span>
            <p className="font-medium text-red-600">{formatRupiah(pelanggan.total_tagihan || 0)}</p>
          </div>
          <div>
            <span className="text-gray-500">Sisa Limit:</span>
            <p className="font-medium text-green-600">
              {formatRupiah((pelanggan.limit_kredit || 0) - (pelanggan.total_tagihan || 0))}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Telepon:</span>
            <p className="font-medium">{pelanggan.telepon}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            Bayar
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            Detail
          </Button>
        </div>
      </div>
    </Card>
  );

  const PelangganPeroranganCard = ({ pelanggan }: { pelanggan: any }) => (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold">{pelanggan.nama}</h3>
            <p className="text-sm text-gray-500">{pelanggan.jabatan} - {pelanggan.departemen}</p>
            <p className="text-xs text-gray-400">NIK: {pelanggan.nik}</p>
          </div>
          {getStatusBadge(pelanggan.status)}
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Gaji Pokok:</span>
            <p className="font-medium">{formatRupiah(pelanggan.gaji_pokok || 0)}</p>
          </div>
          <div>
            <span className="text-gray-500">Batas Potong:</span>
            <p className="font-medium">{formatRupiah(pelanggan.batas_potong_gaji || 0)}</p>
          </div>
          <div>
            <span className="text-gray-500">Sisa Piutang:</span>
            <p className="font-medium text-red-600">{formatRupiah(pelanggan.sisa_piutang || 0)}</p>
          </div>
          <div>
            <span className="text-gray-500">Telepon:</span>
            <p className="font-medium">{pelanggan.telepon}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            Potong Gaji
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            Detail
          </Button>
        </div>
      </div>
    </Card>
  );

  const totalPiutangUnit = pelangganKredit?.unit.reduce((sum, p) => sum + (p.total_tagihan || 0), 0) || 0;
  const totalPiutangPerorangan = pelangganKredit?.perorangan.reduce((sum, p) => sum + (p.sisa_piutang || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Penjualan Kredit</h1>
            <p className="text-gray-600">Kelola pelanggan unit dan perorangan sistem kredit</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Pelanggan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tambah Pelanggan Kredit</DialogTitle>
                <DialogDescription>
                  Pilih jenis pelanggan dan isi formulir untuk menambahkan pelanggan baru
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label>Jenis Pelanggan</Label>
                  <Select value={pelangganType} onValueChange={(value: 'unit' | 'perorangan') => setPelangganType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unit">Unit (Cash/Kredit)</SelectItem>
                      <SelectItem value="perorangan">Perorangan (Potong Gaji)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {pelangganType === 'unit' ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="nama_unit">Nama Unit</Label>
                          <Input
                            id="nama_unit"
                            value={formDataUnit.nama_unit}
                            onChange={(e) => setFormDataUnit(prev => ({ ...prev, nama_unit: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="kontak_person">Kontak Person</Label>
                          <Input
                            id="kontak_person"
                            value={formDataUnit.kontak_person}
                            onChange={(e) => setFormDataUnit(prev => ({ ...prev, kontak_person: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="alamat_unit">Alamat</Label>
                        <Input
                          id="alamat_unit"
                          value={formDataUnit.alamat}
                          onChange={(e) => setFormDataUnit(prev => ({ ...prev, alamat: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="telepon_unit">Telepon</Label>
                          <Input
                            id="telepon_unit"
                            value={formDataUnit.telepon}
                            onChange={(e) => setFormDataUnit(prev => ({ ...prev, telepon: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="limit_kredit">Limit Kredit</Label>
                          <Input
                            id="limit_kredit"
                            type="number"
                            value={formDataUnit.limit_kredit}
                            onChange={(e) => setFormDataUnit(prev => ({ ...prev, limit_kredit: parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="nama">Nama Lengkap</Label>
                          <Input
                            id="nama"
                            value={formDataPerorangan.nama}
                            onChange={(e) => setFormDataPerorangan(prev => ({ ...prev, nama: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="nik">NIK</Label>
                          <Input
                            id="nik"
                            value={formDataPerorangan.nik}
                            onChange={(e) => setFormDataPerorangan(prev => ({ ...prev, nik: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="jabatan">Jabatan</Label>
                          <Input
                            id="jabatan"
                            value={formDataPerorangan.jabatan}
                            onChange={(e) => setFormDataPerorangan(prev => ({ ...prev, jabatan: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="departemen">Departemen</Label>
                          <Input
                            id="departemen"
                            value={formDataPerorangan.departemen}
                            onChange={(e) => setFormDataPerorangan(prev => ({ ...prev, departemen: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="gaji_pokok">Gaji Pokok</Label>
                          <Input
                            id="gaji_pokok"
                            type="number"
                            value={formDataPerorangan.gaji_pokok}
                            onChange={(e) => setFormDataPerorangan(prev => ({ ...prev, gaji_pokok: parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="batas_potong_gaji">Batas Potong Gaji</Label>
                          <Input
                            id="batas_potong_gaji"
                            type="number"
                            value={formDataPerorangan.batas_potong_gaji}
                            onChange={(e) => setFormDataPerorangan(prev => ({ ...prev, batas_potong_gaji: parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="telepon_perorangan">Telepon</Label>
                          <Input
                            id="telepon_perorangan"
                            value={formDataPerorangan.telepon}
                            onChange={(e) => setFormDataPerorangan(prev => ({ ...prev, telepon: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="alamat_perorangan">Alamat</Label>
                          <Input
                            id="alamat_perorangan"
                            value={formDataPerorangan.alamat}
                            onChange={(e) => setFormDataPerorangan(prev => ({ ...prev, alamat: e.target.value }))}
                          />
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      Tambah Pelanggan
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
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pelanggan Unit</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pelangganUnit?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pelanggan Perorangan</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pelangganPerorangan?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Piutang Unit</CardTitle>
              <DollarSign className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatRupiah(totalPiutangUnit)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Piutang Perorangan</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatRupiah(totalPiutangPerorangan)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="unit" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="unit">Pelanggan Unit</TabsTrigger>
            <TabsTrigger value="perorangan">Pelanggan Perorangan</TabsTrigger>
            <TabsTrigger value="piutang">Yang Berutang</TabsTrigger>
          </TabsList>

          <TabsContent value="unit">
            <Card>
              <CardHeader>
                <CardTitle>Pelanggan Unit (Cash/Kredit)</CardTitle>
                <CardDescription>
                  Kelola pelanggan unit dengan sistem pembayaran cash dan kredit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pelangganUnit?.map((pelanggan) => (
                    <PelangganUnitCard key={pelanggan.id} pelanggan={pelanggan} />
                  ))}
                </div>
                {(!pelangganUnit || pelangganUnit.length === 0) && (
                  <div className="text-center py-8">
                    <Building className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Belum ada pelanggan unit</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Tambahkan pelanggan unit pertama Anda.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="perorangan">
            <Card>
              <CardHeader>
                <CardTitle>Pelanggan Perorangan (Potong Gaji)</CardTitle>
                <CardDescription>
                  Kelola pelanggan perorangan dengan sistem potong gaji
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pelangganPerorangan?.map((pelanggan) => (
                    <PelangganPeroranganCard key={pelanggan.id} pelanggan={pelanggan} />
                  ))}
                </div>
                {(!pelangganPerorangan || pelangganPerorangan.length === 0) && (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Belum ada pelanggan perorangan</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Tambahkan pelanggan perorangan pertama Anda.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="piutang">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Piutang Unit */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Piutang Unit
                  </CardTitle>
                  <CardDescription>
                    Unit yang memiliki tagihan belum dibayar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pelangganKredit?.unit.map((pelanggan) => (
                      <div key={pelanggan.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{pelanggan.nama_unit}</p>
                          <p className="text-sm text-gray-500">{pelanggan.kontak_person}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600">{formatRupiah(pelanggan.total_tagihan || 0)}</p>
                          {getStatusBadge(pelanggan.status)}
                        </div>
                      </div>
                    ))}
                    {(!pelangganKredit?.unit || pelangganKredit.unit.length === 0) && (
                      <p className="text-center text-gray-500 py-4">Tidak ada piutang unit</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Piutang Perorangan */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Piutang Perorangan
                  </CardTitle>
                  <CardDescription>
                    Perorangan yang memiliki piutang potong gaji
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pelangganKredit?.perorangan.map((pelanggan) => (
                      <div key={pelanggan.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{pelanggan.nama}</p>
                          <p className="text-sm text-gray-500">{pelanggan.jabatan} - {pelanggan.departemen}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600">{formatRupiah(pelanggan.sisa_piutang || 0)}</p>
                          {getStatusBadge(pelanggan.status)}
                        </div>
                      </div>
                    ))}
                    {(!pelangganKredit?.perorangan || pelangganKredit.perorangan.length === 0) && (
                      <p className="text-center text-gray-500 py-4">Tidak ada piutang perorangan</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PenjualanKredit;
