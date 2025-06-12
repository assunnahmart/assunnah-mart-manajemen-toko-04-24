
import NewProtectedRoute from '@/components/NewProtectedRoute';
import NewNavbar from '@/components/NewNavbar';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import GeneralJournal from '@/components/admin/GeneralJournal';
import { useAutoJournalEntries } from '@/hooks/useAutoJournalEntries';

const JurnalUmumPage = () => {
  // Initialize automatic journal entry creation
  useAutoJournalEntries();

  return (
    <NewProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <NewNavbar />
            
            <div className="container mx-auto p-4">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Jurnal Umum</h1>
                <p className="text-gray-600">
                  Sistem jurnal umum otomatis yang terintegrasi dengan semua transaksi
                </p>
              </div>
              
              <GeneralJournal />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </NewProtectedRoute>
  );
};

export default JurnalUmumPage;
