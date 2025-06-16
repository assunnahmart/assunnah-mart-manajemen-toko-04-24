
import { useState } from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import StockOpnameLogin from '@/components/StockOpnameLogin';
import StockOpname from '@/components/stock/StockOpname';
import Layout from '@/components/Layout';

const StockOpnamePage = () => {
  const { user, isAuthenticated } = useSimpleAuth();
  const [showStockOpname, setShowStockOpname] = useState(false);

  const handleLoginSuccess = () => {
    setShowStockOpname(true);
  };

  if (!isAuthenticated || !user || !showStockOpname) {
    return <StockOpnameLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Stok Opname</h1>
            <p className="text-gray-600">Sistem input dan monitoring stok opname - {user.full_name}</p>
          </div>
          
          <StockOpname />
        </div>
      </div>
    </Layout>
  );
};

export default StockOpnamePage;
