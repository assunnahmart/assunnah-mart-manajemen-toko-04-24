
import NewProtectedRoute from '@/components/NewProtectedRoute';
import NewNavbar from '@/components/NewNavbar';
import AdminDashboard from '@/components/admin/AdminDashboard';

const AdminPanel = () => {
  return (
    <NewProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        <NewNavbar />
        
        <div className="container mx-auto p-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel Administrator</h1>
            <p className="text-gray-600">
              Dashboard khusus admin untuk mengelola data pelanggan, piutang, supplier, kas umum, dan laporan laba rugi
            </p>
          </div>
          
          <AdminDashboard />
        </div>
      </div>
    </NewProtectedRoute>
  );
};

export default AdminPanel;
