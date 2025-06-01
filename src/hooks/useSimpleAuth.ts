import { useState, useEffect } from 'react';

interface UserProfile {
  username: string;
  full_name: string;
  role: 'admin' | 'kasir';
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  loading: boolean;
}

// Demo users data
const DEMO_USERS = [
  { username: 'Ginanjar', password: 'admin', full_name: 'Ginanjar', role: 'admin' as const },
  { username: 'Jamhur', password: 'admin1', full_name: 'Jamhur', role: 'admin' as const },
  { username: 'Jamhur2', password: 'kasir1', full_name: 'Jamhur2', role: 'kasir' as const },
  { username: 'Agus', password: 'kasir4', full_name: 'Agus', role: 'kasir' as const },
  { username: 'Yadi', password: 'kasir7', full_name: 'Yadi', role: 'kasir' as const },
  { username: 'Nurohman', password: 'kasir12', full_name: 'Nurohman', role: 'kasir' as const }
];

export const useSimpleAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true
  });

  useEffect(() => {
    console.log('useSimpleAuth: Initializing auth state check');
    
    // Check for existing session in localStorage
    const savedUser = localStorage.getItem('assunnah_auth_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        console.log('useSimpleAuth: Found saved user:', user);
        setAuthState({
          isAuthenticated: true,
          user,
          loading: false
        });
      } catch (error) {
        console.error('useSimpleAuth: Error parsing saved user:', error);
        localStorage.removeItem('assunnah_auth_user');
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false
        });
      }
    } else {
      console.log('useSimpleAuth: No saved user found');
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      console.log('useSimpleAuth: Attempting login with:', { username, password: '***' });
      
      // Trim whitespace and ensure case-sensitive matching
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();
      
      const user = DEMO_USERS.find(u => u.username === trimmedUsername && u.password === trimmedPassword);
      
      if (!user) {
        console.log('useSimpleAuth: User not found or password incorrect');
        return { error: { message: 'Username atau password salah' } };
      }

      const userProfile: UserProfile = {
        username: user.username,
        full_name: user.full_name,
        role: user.role
      };

      console.log('useSimpleAuth: Login successful, saving user:', userProfile);
      
      // Save to localStorage
      localStorage.setItem('assunnah_auth_user', JSON.stringify(userProfile));
      
      // Update state immediately with forced re-render
      setAuthState({
        isAuthenticated: true,
        user: userProfile,
        loading: false
      });

      // Force a small delay to ensure state is updated before redirect
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('useSimpleAuth: Auth state updated successfully');
      return { data: userProfile, error: null };
    } catch (error) {
      console.error('useSimpleAuth: Login error:', error);
      return { error: { message: 'Terjadi kesalahan saat login' } };
    }
  };

  const signOut = async () => {
    console.log('useSimpleAuth: Signing out user');
    localStorage.removeItem('assunnah_auth_user');
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false
    });
    return { error: null };
  };

  console.log('useSimpleAuth: Current auth state:', authState);

  return {
    user: authState.user,
    profile: authState.user, // For compatibility with existing components
    loading: authState.loading,
    signIn,
    signOut,
    isAuthenticated: authState.isAuthenticated,
    isAdmin: authState.user?.role === 'admin',
    isKasir: authState.user?.role === 'kasir'
  };
};
