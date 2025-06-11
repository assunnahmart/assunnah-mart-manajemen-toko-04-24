
import { useState, useEffect, useCallback } from 'react';

interface UserProfile {
  username: string;
  full_name: string;
  role: 'admin' | 'kasir';
  kasir_id?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  loading: boolean;
}

// Demo users data with kasir_id
const DEMO_USERS = [
  { username: 'Ginanjar', password: 'admin', full_name: 'Ginanjar', role: 'admin' as const, kasir_id: 'admin-001' },
  { username: 'Jamhur', password: 'admin1', full_name: 'Jamhur', role: 'admin' as const, kasir_id: 'admin-002' },
  { username: 'Jamhur2', password: 'kasir1', full_name: 'Jamhur2', role: 'kasir' as const, kasir_id: 'kasir-001' },
  { username: 'Agus', password: 'kasir4', full_name: 'Agus', role: 'kasir' as const, kasir_id: 'kasir-002' },
  { username: 'Yadi', password: 'kasir7', full_name: 'Yadi', role: 'kasir' as const, kasir_id: 'kasir-003' },
  { username: 'Nurohman', password: 'kasir12', full_name: 'Nurohman', role: 'kasir' as const, kasir_id: 'kasir-004' }
];

// Global state to prevent multiple auth instances
let globalAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true
};

let authListeners: ((state: AuthState) => void)[] = [];

const notifyListeners = (newState: AuthState) => {
  globalAuthState = newState;
  authListeners.forEach(listener => listener(newState));
};

export const useSimpleAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(globalAuthState);

  useEffect(() => {
    console.log('useSimpleAuth: Registering auth listener');
    
    // Add this component as a listener
    authListeners.push(setAuthState);
    
    // Initialize auth state check only once
    if (globalAuthState.loading) {
      console.log('useSimpleAuth: Initializing auth state check');
      
      const initializeAuth = () => {
        const savedUser = localStorage.getItem('assunnah_auth_user');
        if (savedUser) {
          try {
            const user = JSON.parse(savedUser);
            console.log('useSimpleAuth: Found saved user:', user);
            notifyListeners({
              isAuthenticated: true,
              user,
              loading: false
            });
          } catch (error) {
            console.error('useSimpleAuth: Error parsing saved user:', error);
            localStorage.removeItem('assunnah_auth_user');
            notifyListeners({
              isAuthenticated: false,
              user: null,
              loading: false
            });
          }
        } else {
          console.log('useSimpleAuth: No saved user found');
          notifyListeners({
            isAuthenticated: false,
            user: null,
            loading: false
          });
        }
      };

      initializeAuth();
    }

    // Cleanup listener on unmount
    return () => {
      authListeners = authListeners.filter(listener => listener !== setAuthState);
    };
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    try {
      console.log('useSimpleAuth: Attempting login with:', { username, password: '***' });
      
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();
      
      const user = DEMO_USERS.find(u => u.username === trimmedUsername && u.password === trimmedPassword);
      
      if (!user) {
        console.log('useSimpleAuth: User not found or password incorrect');
        return false;
      }

      const userProfile: UserProfile = {
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        kasir_id: user.kasir_id
      };

      console.log('useSimpleAuth: Login successful, saving user:', userProfile);
      
      // Save to localStorage
      localStorage.setItem('assunnah_auth_user', JSON.stringify(userProfile));
      
      // Update global state and notify all listeners
      notifyListeners({
        isAuthenticated: true,
        user: userProfile,
        loading: false
      });

      console.log('useSimpleAuth: Auth state updated successfully');
      return true;
    } catch (error) {
      console.error('useSimpleAuth: Login error:', error);
      return false;
    }
  }, []);

  const signOut = useCallback(async () => {
    console.log('useSimpleAuth: Signing out user');
    localStorage.removeItem('assunnah_auth_user');
    notifyListeners({
      isAuthenticated: false,
      user: null,
      loading: false
    });
    return { error: null };
  }, []);

  console.log('useSimpleAuth: Current auth state:', authState);

  return {
    user: authState.user,
    profile: authState.user,
    loading: authState.loading,
    signIn,
    signOut,
    isAuthenticated: authState.isAuthenticated,
    isAdmin: authState.user?.role === 'admin',
    isKasir: authState.user?.role === 'kasir'
  };
};
