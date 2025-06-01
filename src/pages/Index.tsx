
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';

const Index = () => {
  const { user, isAuthenticated, loading } = useSimpleAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      // Redirect based on user role
      if (user.role === 'kasir') {
        navigate('/pos', { replace: true });
      } else if (user.role === 'admin') {
        navigate('/dashboard', { replace: true });
      }
      // If already on correct page, stay here
    }
  }, [user, isAuthenticated, loading, navigate]);

  // If not authenticated or still loading, show dashboard (which will handle auth)
  return <Dashboard />;
};

export default Index;
