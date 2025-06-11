
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NewLoginForm from '@/components/NewLoginForm';

const Index = () => {
  const { user, isAuthenticated, loading } = useSimpleAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Index: Auth state check:', { isAuthenticated, user: user?.username, loading });
    
    if (!loading && isAuthenticated && user) {
      console.log('Index: User authenticated, redirecting to POS system');
      // Use setTimeout to ensure the state is fully updated before navigation
      setTimeout(() => {
        navigate('/pos', { replace: true });
      }, 100);
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
