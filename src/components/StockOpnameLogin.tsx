
import { useState } from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package, Scan } from 'lucide-react';

interface StockOpnameLoginProps {
  onLoginSuccess: () => void;
}

const StockOpnameLogin = ({ onLoginSuccess }: StockOpnameLoginProps) => {
  const { signIn } = useSimpleAuth();
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
        setUsername('');
        setPassword('');
        setLoading(false);
        onLoginSuccess();
      }
    } catch (error) {
      console.error('Stock opname login error:', error);
      setError('Terjadi kesalahan saat login');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-6">
            <img 
              src="/lovable-uploads/63181b78-99d7-4d69-be72-332dd429807c.png" 
              alt="Assunnah Mart Logo" 
              className="h-20 w-auto object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <Package className="h-6 w-6 text-blue-600" />
            Stok Opname
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            Login khusus untuk input stok opname
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
              className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Scan className="h-4 w-4 mr-2" />
              {loading ? 'Memproses...' : 'Masuk ke Stok Opname'}
            </Button>
          </form>
          
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600 mb-2">
              Akses khusus untuk petugas stok opname
            </p>
            <p className="text-xs text-gray-500">
              Copyright © 2025 Program by Junaedi Abu Mughiroh
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockOpnameLogin;
