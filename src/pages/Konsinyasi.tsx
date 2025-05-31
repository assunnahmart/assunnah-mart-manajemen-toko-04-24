
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Package, Plus, AlertTriangle, TrendingDown, Calendar } from "lucide-react";
import { useBarangKonsinyasi, useBarangStokRendah, useCreateBarangKonsinyasi, useUpdateBarangKonsinyasi } from "@/hooks/useBarangKonsinyasi";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";

const Konsinyasi = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [jenisKonsinyasi, setJenisKonsinyasi] = useState<'harian' | 'mingguan'>('harian');
  const [formData, setFormData] = useState({
    nama: "",
    barcode: "",
    jenis_konsinyasi: "harian",
    stok_saat_ini: 0,
    stok_minimal: 0,
    harga_beli: 0,
    harga_jual: 0,
    satuan: "pcs"
  });

  const { data: barangHarian } = useBarangKonsinyasi('harian');
  const { data: barangMingguan } = useBarangKonsinyasi('mingguan');
  const { data: barangStokRendah } = useBarangStokRendah();
  const createBarang = useCreateBarangKonsinyasi();
  const updateBarang = useUpdateBarangKonsinyasi();
  const { toast } = useToast();

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const resetForm = () => {
    setFormData({
      nama: "",
      barcode: "",
      jenis_konsinyasi: jenisKonsinyasi,
      stok_saat_ini: 0,
      stok_minimal: 0,
      harga_beli: 0,
      harga_jual: 0,
      satuan: "pcs"
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createBarang.mutateAsync({
        ...formData,
        harga_beli: Number(formData.harga_beli),
        harga_jual: Number(formData.harga_jual)
      });
      
      toast({
        title: "Berhasil",
        description: "Barang konsinyasi berhasil ditambahkan",
      });
      
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

  const getStokStatus = (stokSaatIni: number, stokMinimal: number) => {
    if (stokSaatIni <= stokMinimal) {
      return { variant: "destructive" as const, text: "Stok Habis" };
    } else if (stokSaatIni <= stokMinimal * 1.5) {
      return { variant: "outline" as const, text: "Stok Rendah" };
    }
    return { variant: "default" as const, text: "Stok Aman" };
  };

  const BarangCard = ({ barang }: { barang: any }) => {
    const stokStatus = getStokStatus(barang.stok_saat_ini, barang.stok_minimal);
    
    return (
      <Card key={barang.id} className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold">{barang.nama}</h3>
              <p className="text-sm text-gray-500">
                {barang.kategori_barang?.nama} • {barang.supplier?.nama}
              </p>
              <p className="text-xs text-gray-400">Barcode: {barang.barcode}</p>
            </div>
            <Badge variant={stokStatus.variant} className="text-xs">
              {stokStatus.text}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Stok:</span>
              <p className="font-medium">{barang.stok_saat_ini} {barang.satuan}</p>
            </div>
            <div>
              <span className="text-gray-500">Min. Stok:</span>
              <p className="font-medium">{barang.stok_minimal} {barang.satuan}</p>
            </div>
            <div>
              <span className="text-gray-500">Beli:</span>
              <p className="font-medium">{formatRupiah(Number(barang.harga_beli))}</p>
            </div>
            <div>
              <span className="text-gray-500">Jual:</span>
              <p className="font-medium">{formatRupiah(Number(barang.harga_jual))}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1">
              Edit
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              Stok
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manajemen Konsinyasi</h1>
                <p className="text-gray-600">Kelola barang konsinyasi harian dan mingguan</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Barang
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tambah Barang Konsinyasi</DialogTitle>
                    <DialogDescription>
                      Isi formulir untuk menambahkan barang konsinyasi baru
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="nama">Nama Barang</Label>
                      <Input
                        id="nama"
                        value={formData.nama}
                        onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="barcode">Barcode</Label>
                      <Input
                        id="barcode"
                        value={formData.barcode}
                        onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="jenis">Jenis Konsinyasi</Label>
                      <Select 
                        value={formData.jenis_konsinyasi} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, jenis_konsinyasi: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="harian">Harian</SelectItem>
                          <SelectItem value="mingguan">Mingguan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="stok_saat_ini">Stok Awal</Label>
                        <Input
                          id="stok_saat_ini"
                          type="number"
                          value={formData.stok_saat_ini}
                          onChange={(e) => setFormData(prev => ({ ...prev, stok_saat_ini: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="stok_minimal">Stok Minimal</Label>
                        <Input
                          id="stok_minimal"
                          type="number"
                          value={formData.stok_minimal}
                          onChange={(e) => setFormData(prev => ({ ...prev, stok_minimal: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="harga_beli">Harga Beli</Label>
                        <Input
                          id="harga_beli"
                          type="number"
                          value={formData.harga_beli}
                          onChange={(e) => setFormData(prev => ({ ...prev, harga_beli: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="harga_jual">Harga Jual</Label>
                        <Input
                          id="harga_jual"
                          type="number"
                          value={formData.harga_jual}
                          onChange={(e) => setFormData(prev => ({ ...prev, harga_jual: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="satuan">Satuan</Label>
                      <Input
                        id="satuan"
                        value={formData.satuan}
                        onChange={(e) => setFormData(prev => ({ ...prev, satuan: e.target.value }))}
                        placeholder="pcs, kg, liter, dll"
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">
                        Tambah Barang
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
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Konsinyasi Harian</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{barangHarian?.length || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Konsinyasi Mingguan</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{barangMingguan?.length || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Stok Rendah</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{barangStokRendah?.length || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(barangHarian?.length || 0) + (barangMingguan?.length || 0)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="harian" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="harian">Konsinyasi Harian</TabsTrigger>
                <TabsTrigger value="mingguan">Konsinyasi Mingguan</TabsTrigger>
                <TabsTrigger value="stok-rendah">Stok Rendah</TabsTrigger>
              </TabsList>

              <TabsContent value="harian">
                <Card>
                  <CardHeader>
                    <CardTitle>Barang Konsinyasi Harian</CardTitle>
                    <CardDescription>
                      Barang yang diambil dan dikembalikan setiap hari
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {barangHarian?.map((barang) => (
                        <BarangCard key={barang.id} barang={barang} />
                      ))}
                    </div>
                    {(!barangHarian || barangHarian.length === 0) && (
                      <div className="text-center py-8">
                        <Package className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">Belum ada barang harian</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Tambahkan barang konsinyasi harian pertama Anda.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="mingguan">
                <Card>
                  <CardHeader>
                    <CardTitle>Barang Konsinyasi Mingguan</CardTitle>
                    <CardDescription>
                      Barang yang diambil dan dikembalikan setiap minggu
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {barangMingguan?.map((barang) => (
                        <BarangCard key={barang.id} barang={barang} />
                      ))}
                    </div>
                    {(!barangMingguan || barangMingguan.length === 0) && (
                      <div className="text-center py-8">
                        <Package className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">Belum ada barang mingguan</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Tambahkan barang konsinyasi mingguan pertama Anda.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="stok-rendah">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      Barang Stok Rendah
                    </CardTitle>
                    <CardDescription>
                      Barang yang stoknya di bawah batas minimal
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {barangStokRendah?.map((barang) => (
                        <BarangCard key={barang.id} barang={barang} />
                      ))}
                    </div>
                    {(!barangStokRendah || barangStokRendah.length === 0) && (
                      <div className="text-center py-8">
                        <AlertTriangle className="mx-auto h-12 w-12 text-green-400" />
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">Semua stok aman!</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Tidak ada barang dengan stok di bawah batas minimal.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Konsinyasi;
