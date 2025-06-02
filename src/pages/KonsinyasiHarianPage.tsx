
import NewProtectedRoute from '@/components/NewProtectedRoute';
import NewNavbar from '@/components/NewNavbar';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import KonsinyasiHarianForm from '@/components/konsinyasi/KonsinyasiHarianForm';
import KonsinyasiHarianHistory from '@/components/konsinyasi/KonsinyasiHarianHistory';

const KonsinyasiHarianPage = () => {
  return (
    <NewProtectedRoute>
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <NewNavbar />
          
          <div className="container mx-auto p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Konsinyasi Harian
              </h1>
              <p className="text-gray-600">
                Kelola data konsinyasi harian untuk setiap supplier dan produk
              </p>
            </div>

            <Tabs defaultValue="form" className="space-y-6">
              <TabsList>
                <TabsTrigger value="form">Input Konsinyasi</TabsTrigger>
                <TabsTrigger value="history">Riwayat</TabsTrigger>
              </TabsList>

              <TabsContent value="form">
                <KonsinyasiHarianForm />
              </TabsContent>

              <TabsContent value="history">
                <KonsinyasiHarianHistory />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Layout>
    </NewProtectedRoute>
  );
};

export default KonsinyasiHarianPage;
