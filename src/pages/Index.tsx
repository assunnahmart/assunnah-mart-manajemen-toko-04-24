
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NewLoginForm from '@/components/NewLoginForm';

const Index = () => {
  const { user, isAuthenticated, loading } = useSimpleAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      console.log('Index: User authenticated, redirecting to POS system for all users');
      // Always redirect to POS system - it's the main interface
      navigate('/pos', { replace: true });
    }
  }, [user, isAuthenticated, loading, navigate]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login form
  return <NewLoginForm />;
};

export default Index;
