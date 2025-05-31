
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import NewLoginForm from './NewLoginForm';

interface NewProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'kasir';
}

const NewProtectedRoute = ({ children, requiredRole }: NewProtectedRouteProps) => {
  const { isAuthenticated, user, loading } = useSimpleAuth();

  console.log('ProtectedRoute check:', { isAuthenticated, user, loading, requiredRole });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    console.log('User not authenticated, showing login form');
    return <NewLoginForm />;
  }

  if (requiredRole && user.role !== requiredRole) {
    console.log('User role mismatch:', { userRole: user.role, requiredRole });
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Akses Ditolak</h2>
          <p>Anda tidak memiliki akses ke halaman ini.</p>
        </div>
      </div>
    );
  }

  console.log('Access granted, showing protected content');
  return <>{children}</>;
};

export default NewProtectedRoute;
