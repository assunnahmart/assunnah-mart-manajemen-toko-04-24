
import { useState } from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';

const NewLoginForm = () => {
  const { signIn } = useSimpleAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('NewLoginForm: Form submitted with:', { username, password: '***' });
    
    if (!username || !password) {
      setError('Username dan password harus diisi');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await signIn(username, password);
      console.log('NewLoginForm: Sign in result:', success);
      
      if (!success) {
        console.log('NewLoginForm: Login failed');
        setError('Username atau password salah. Silakan coba lagi.');
        setLoading(false);
      } else {
        console.log('NewLoginForm: Login successful, navigating to POS');
        // Reset form
        setUsername('');
        setPassword('');
        setLoading(false);

        // Navigate immediately after successful login
        navigate('/pos', { replace: true });
      }
    } catch (error) {
      console.error('NewLoginForm: Unexpected error during login:', error);
      setError('Terjadi kesalahan yang tidak terduga');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-assunnah p-4 bg-yellow-200">
      <Card className="w-full max-w-md shadow-assunnah border-0">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-6 bg-transparent">
            <img 
              src="/lovable-uploads/d8973707-35cf-4652-8170-03093cb0c2f4.png" 
              alt="Assunnah Mart Logo" 
              className="h-32 w-auto sm:h-36 md:h-40 object-contain" 
            />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-sky-600">Assunnah Mart</CardTitle>
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
                onChange={e => setUsername(e.target.value)} 
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
                onChange={e => setPassword(e.target.value)} 
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
              className="w-full h-12 text-base font-semibold bg-yellow-600 hover:bg-yellow-500 text-gray-50"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>
          
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Copyright © 2025 Program by Junaedi Abu Mughiroh
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewLoginForm;
