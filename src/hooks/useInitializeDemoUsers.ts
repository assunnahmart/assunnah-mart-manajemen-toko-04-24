
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useInitializeDemoUsers = () => {
  useEffect(() => {
    const initializeDemoUsers = async () => {
      try {
        // Check if demo users already exist
        const { data: existingProfiles } = await supabase
          .from('user_profiles')
          .select('username')
          .in('username', ['Ginanjar', 'Jamhur', 'Jamhur2', 'Agus', 'Yadi']);

        if (existingProfiles && existingProfiles.length > 0) {
          console.log('Demo users already exist');
          return;
        }

        // Create demo users
        const demoUsers = [
          { email: 'Ginanjar@assunnahmart.com', password: 'admin1', username: 'Ginanjar', full_name: 'Ginanjar', role: 'admin' },
          { email: 'Jamhur@assunnahmart.com', password: 'admin2', username: 'Jamhur', full_name: 'Jamhur', role: 'admin' },
          { email: 'Jamhur2@assunnahmart.com', password: 'kasir11', username: 'Jamhur2', full_name: 'Jamhur2', role: 'kasir' },
          { email: 'Agus@assunnahmart.com', password: 'kasir44', username: 'Agus', full_name: 'Agus Setiawan', role: 'kasir' },
          { email: 'Yadi@assunnahmart.com', password: 'kasir77', username: 'Yadi', full_name: 'Yadi Rahman', role: 'kasir' }
        ];

        for (const user of demoUsers) {
          // Sign up the user
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: user.email,
            password: user.password,
          });

          if (authError) {
            console.error('Error creating user:', authError);
            continue;
          }

          if (authData.user) {
            // Get kasir_id for kasir users
            let kasir_id = null;
            if (user.role === 'kasir') {
              const { data: kasirData } = await supabase
                .from('kasir')
                .select('id')
                .eq('nama', user.full_name)
                .single();
              
              kasir_id = kasirData?.id || null;
            }

            // Create user profile
            const { error: profileError } = await supabase
              .from('user_profiles')
              .insert({
                user_id: authData.user.id,
                username: user.username,
                full_name: user.full_name,
                role: user.role,
                kasir_id: kasir_id
              });

            if (profileError) {
              console.error('Error creating profile:', profileError);
            } else {
              console.log(`Created demo user: ${user.username}`);
            }
          }
        }
      } catch (error) {
        console.error('Error initializing demo users:', error);
      }
    };

    initializeDemoUsers();
  }, []);
};
