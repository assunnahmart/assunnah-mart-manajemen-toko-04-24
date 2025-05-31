
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
  { username: 'Ginanjar', password: 'admin1', full_name: 'Ginanjar', role: 'admin' as const },
  { username: 'Jamhur', password: 'admin2', full_name: 'Jamhur', role: 'admin' as const },
  { username: 'Jamhur2', password: 'kasir11', full_name: 'Jamhur2', role: 'kasir' as const },
  { username: 'Agus', password: 'kasir44', full_name: 'Agus Setiawan', role: 'kasir' as const },
  { username: 'Yadi', password: 'kasir77', full_name: 'Yadi Rahman', role: 'kasir' as const }
];

export const useSimpleAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true
  });

  useEffect(() => {
    // Check for existing session in localStorage
    const savedUser = localStorage.getItem('assunnah_auth_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setAuthState({
          isAuthenticated: true,
          user,
          loading: false
        });
      } catch (error) {
        localStorage.removeItem('assunnah_auth_user');
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false
        });
      }
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      const user = DEMO_USERS.find(u => u.username === username && u.password === password);
      
      if (!user) {
        return { error: { message: 'Username atau password salah' } };
      }

      const userProfile: UserProfile = {
        username: user.username,
        full_name: user.full_name,
        role: user.role
      };

      // Save to localStorage
      localStorage.setItem('assunnah_auth_user', JSON.stringify(userProfile));
      
      setAuthState({
        isAuthenticated: true,
        user: userProfile,
        loading: false
      });

      return { data: userProfile, error: null };
    } catch (error) {
      return { error: { message: 'Terjadi kesalahan saat login' } };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('assunnah_auth_user');
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false
    });
    return { error: null };
  };

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
