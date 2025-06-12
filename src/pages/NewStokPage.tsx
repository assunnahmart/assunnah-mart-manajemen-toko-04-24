import NewProtectedRoute from '@/components/NewProtectedRoute';
import NewNavbar from '@/components/NewNavbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package2, BarChart3, AlertTriangle, TrendingUp, Calculator, FileSpreadsheet } from 'lucide-react';
import NewStokDashboard from '@/components/newstok/NewStokDashboard';
import NewStokOpnameInput from '@/components/newstok/NewStokOpnameInput';
import NewStokSelisihAnalysis from '@/components/newstok/NewStokSelisihAnalysis';
import NewStokRekapTerpadu from '@/components/newstok/NewStokRekapTerpadu';
import NewStokReporting from '@/components/newstok/NewStokReporting';
import NewStokAuditTrail from '@/components/newstok/NewStokAuditTrail';
const NewStokPage = () => {
  return <NewProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <NewNavbar />
        
        <div className="container mx-auto p-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">New Stok - Sistem Manajemen Stok</h1>
            <p className="text-gray-600">
              Sistem perhitungan selisih stok sistem vs stok real dengan multiple user input untuk barang yang sama
            </p>
          </div>
          
          <Tabs defaultValue="dashboard" className="space-y-4">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="opname-input" className="flex items-center gap-2">
                <Package2 className="h-4 w-4" />
                Input Opname
              </TabsTrigger>
              <TabsTrigger value="selisih-analysis" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Analisis Selisih
              </TabsTrigger>
              <TabsTrigger value="rekap-terpadu" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Rekap Terpadu
              </TabsTrigger>
              <TabsTrigger value="reporting" className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Laporan
              </TabsTrigger>
              <TabsTrigger value="audit-trail" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Audit Trail
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <NewStokDashboard />
            </TabsContent>

            <TabsContent value="opname-input">
              <NewStokOpnameInput />
            </TabsContent>

            <TabsContent value="selisih-analysis">
              <NewStokSelisihAnalysis />
            </TabsContent>

            <TabsContent value="rekap-terpadu">
              <NewStokRekapTerpadu />
            </TabsContent>

            <TabsContent value="reporting">
              <NewStokReporting />
            </TabsContent>

            <TabsContent value="audit-trail">
              <NewStokAuditTrail />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </NewProtectedRoute>;
};
export default NewStokPage;