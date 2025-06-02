
import NewProtectedRoute from '@/components/NewProtectedRoute';
import NewNavbar from '@/components/NewNavbar';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import KasirKasForm from '@/components/kas/KasirKasForm';
import KasirKasHistory from '@/components/kas/KasirKasHistory';

const KasirKasPage = () => {
  return (
    <NewProtectedRoute>
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <NewNavbar />
          
          <div className="container mx-auto p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Kas Kasir
              </h1>
              <p className="text-gray-600">
                Kelola transaksi kas harian kasir yang tersinkronisasi dengan kas umum
              </p>
            </div>

            <Tabs defaultValue="form" className="space-y-6">
              <TabsList>
                <TabsTrigger value="form">Input Transaksi</TabsTrigger>
                <TabsTrigger value="history">Riwayat</TabsTrigger>
              </TabsList>

              <TabsContent value="form">
                <KasirKasForm />
              </TabsContent>

              <TabsContent value="history">
                <KasirKasHistory />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Layout>
    </NewProtectedRoute>
  );
};

export default KasirKasPage;
