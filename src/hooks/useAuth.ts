
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { Tables } from '@/integrations/supabase/types';

type UserProfile = Tables<'user_profiles'>;

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          
          setProfile(profileData);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()
          .then(({ data }) => {
            setProfile(data);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      // First, find the user profile by username
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (profileError || !profileData) {
        return { error: { message: 'Username tidak ditemukan' } };
      }

      // Create a temporary email for sign in
      const tempEmail = `${username}@assunnahmart.local`;
      
      // Try to sign in with the temporary email
      const { data, error } = await supabase.auth.signInWithPassword({
        email: tempEmail,
        password: password,
      });

      if (error) {
        // If user doesn't exist, create it automatically
        if (error.message.includes('Invalid login credentials')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: tempEmail,
            password: password,
            options: {
              emailRedirectTo: undefined,
              data: {
                username: username,
                full_name: profileData.full_name,
                role: profileData.role
              }
            }
          });

          if (signUpError) {
            return { error: signUpError };
          }

          // Update the user profile with the new auth user ID
          if (signUpData.user) {
            await supabase
              .from('user_profiles')
              .update({ user_id: signUpData.user.id })
              .eq('username', username);
          }

          return { data: signUpData, error: null };
        }
        return { error };
      }

      return { data, error: null };
    } catch (error) {
      return { error: { message: 'Terjadi kesalahan saat login' } };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
      setProfile(null);
    }
    return { error };
  };

  return {
    user,
    session,
    profile,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
    isKasir: profile?.role === 'kasir'
  };
};
