
import { useState } from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

const NewLoginForm = () => {
  const { signIn } = useSimpleAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('NewLoginForm: Form submitted with:', { username });
    
    if (!username || !password) {
      setError('Username dan password harus diisi');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await signIn(username, password);
      console.log('NewLoginForm: Sign in result:', result);
      
      if (result.error) {
        console.log('NewLoginForm: Login failed:', result.error.message);
        setError(result.error.message || 'Login gagal. Periksa username dan password Anda.');
      } else {
        console.log('NewLoginForm: Login successful, auth state should update automatically');
        // Reset form
        setUsername('');
        setPassword('');
        // Login berhasil, komponen akan otomatis redirect karena isAuthenticated berubah
      }
    } catch (error) {
      console.error('NewLoginForm: Unexpected error during login:', error);
      setError('Terjadi kesalahan yang tidak terduga');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-assunnah p-4">
      <Card className="w-full max-w-md shadow-assunnah border-0">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-6">
            <img 
              src="/lovable-uploads/a2af9547-58f3-45de-b565-8283573a9b0e.png" 
              alt="Assunnah Mart Logo" 
              className="h-32 w-auto sm:h-36 md:h-40"
            />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">Assunnah Mart</CardTitle>
          <CardDescription className="text-base text-gray-600 mobile-optimized">
            Silakan masuk dengan akun Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription className="mobile-optimized">{error}</AlertDescription>
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
              className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? 'Masuk...' : 'Masuk'}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-yellow-50 rounded-lg border border-blue-100">
            <p className="text-sm font-semibold text-gray-700 mb-3">Akun Demo:</p>
            <div className="text-xs space-y-2 mobile-optimized">
              <div className="bg-white p-2 rounded border border-gray-200">
                <p className="font-medium text-red-600">Admin:</p>
                <p>Ginanjar / admin1, Jamhur / admin2</p>
              </div>
              <div className="bg-white p-2 rounded border border-gray-200">
                <p className="font-medium text-blue-600">Kasir:</p>
                <p>Jamhur2 / kasir11, Agus / kasir44, Yadi / kasir77</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewLoginForm;
