
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import NewLoginForm from './NewLoginForm';
import Layout from './Layout';

interface NewProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'kasir';
}

const NewProtectedRoute = ({ children, requiredRole }: NewProtectedRouteProps) => {
  const { isAuthenticated, user, loading } = useSimpleAuth();

  console.log('NewProtectedRoute: Check state:', { isAuthenticated, user: user?.username, loading, requiredRole });

  if (loading) {
    console.log('NewProtectedRoute: Still loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    console.log('NewProtectedRoute: User not authenticated, showing login form');
    return <NewLoginForm />;
  }

  if (requiredRole && user.role !== requiredRole) {
    console.log('NewProtectedRoute: User role mismatch:', { userRole: user.role, requiredRole });
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Akses Ditolak</h2>
            <p>Anda tidak memiliki akses ke halaman ini.</p>
          </div>
        </div>
      </Layout>
    );
  }

  console.log('NewProtectedRoute: Access granted, showing protected content');
  return (
    <Layout>
      {children}
    </Layout>
  );
};

export default NewProtectedRoute;
