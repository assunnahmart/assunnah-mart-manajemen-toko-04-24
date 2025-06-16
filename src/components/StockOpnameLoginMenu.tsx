
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package, Scan, ArrowLeft } from 'lucide-react';

const StockOpnameLoginMenu = () => {
  const { signIn } = useSimpleAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Username dan password harus diisi');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await signIn(username, password);
      
      if (!success) {
        setError('Username atau password salah untuk akses stok opname');
        setLoading(false);
      } else {
        // Redirect to stock opname page after successful login
        navigate('/stok-opname');
      }
    } catch (error) {
      console.error('Stock opname login error:', error);
      setError('Terjadi kesalahan saat login');
      setLoading(false);
    }
  };

  const handleBackToMain = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-6">
            <img 
              src="/lovable-uploads/d8973707-35cf-4652-8170-03093cb0c2f4.png" 
              alt="Assunnah Mart Logo" 
              className="h-20 w-auto object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <Package className="h-6 w-6 text-green-600" />
            Menu Login Stok Opname
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            Masuk ke sistem stok opname untuk melakukan pengecekan inventori
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username" className="text-base font-medium">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                required
                className="h-12 text-base"
                disabled={loading}
                autoComplete="username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                required
                className="h-12 text-base"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full h-12 text-base font-semibold bg-green-600 hover:bg-green-700 text-white"
            >
              <Scan className="h-4 w-4 mr-2" />
              {loading ? 'Memproses...' : 'Masuk ke Stok Opname'}
            </Button>
          </form>
          
          <div className="space-y-4">
            <Button 
              onClick={handleBackToMain}
              variant="outline"
              className="w-full h-12 text-base font-semibold"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Menu Utama
            </Button>
          </div>
          
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600 mb-2">
              Akses khusus untuk petugas stok opname
            </p>
            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
              <p className="font-medium mb-1">Petunjuk Penggunaan:</p>
              <ul className="text-left list-disc list-inside space-y-1">
                <li>Gunakan username dan password yang telah diberikan</li>
                <li>Setelah login, Anda dapat melakukan scan barcode</li>
                <li>Input stok fisik sesuai dengan kondisi di lapangan</li>
              </ul>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Copyright © 2025 Program by Junaedi Abu Mughiroh
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockOpnameLoginMenu;
