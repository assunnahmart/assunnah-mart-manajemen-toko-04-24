
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface POSHeaderProps {
  totalAmount: number;
  cartItemsCount: number;
  userName?: string;
  userFullName?: string;
  showDashboardAccess: boolean;
}

const POSHeader = ({ 
  totalAmount, 
  cartItemsCount, 
  userName, 
  userFullName, 
  showDashboardAccess 
}: POSHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-40 bg-gray-50 pb-4">
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="bg-gradient-to-r from-yellow-600 via-yellow-700 to-yellow-800 rounded-xl p-6 shadow-lg border-2 border-yellow-500">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-yellow-100 text-xl font-bold mb-2">Assunnah Mart</p>
                <p className="font-bold text-white drop-shadow-md text-6xl">
                  Rp {totalAmount.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="text-lg px-4 py-2 bg-red-500 text-white border-red-400 shadow-lg">
                <ShoppingCart className="h-4 w-4 mr-2" />
                {cartItemsCount} Item{cartItemsCount !== 1 ? 's' : ''}
              </Badge>
              
              <div className="text-yellow-100 text-xs mt-1">
                <Badge variant="outline" className="border-yellow-300 text-yellow-200 bg-transparent mr-2">
                  Kasir: {userFullName}
                </Badge>
                <Badge variant="outline" className="border-yellow-300 text-yellow-200 bg-transparent">
                  {new Date().toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Badge>
                {showDashboardAccess && (
                  <Button 
                    onClick={() => navigate('/dashboard')} 
                    variant="outline" 
                    size="sm" 
                    className="ml-2 border-yellow-300 hover:bg-yellow-200 text-cyan-950"
                  >
                    Dashboard
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSHeader;
