
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

        // Create demo user profiles first (without auth users)
        const demoUsers = [
          { username: 'Ginanjar', full_name: 'Ginanjar', role: 'admin', password: 'admin1' },
          { username: 'Jamhur', full_name: 'Jamhur', role: 'admin', password: 'admin2' },
          { username: 'Jamhur2', full_name: 'Jamhur2', role: 'kasir', password: 'kasir11' },
          { username: 'Agus', full_name: 'Agus Setiawan', role: 'kasir', password: 'kasir44' },
          { username: 'Yadi', full_name: 'Yadi Rahman', role: 'kasir', password: 'kasir77' }
        ];

        for (const user of demoUsers) {
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

          // Create user profile without user_id (will be updated on first login)
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: null,
              username: user.username,
              full_name: user.full_name,
              role: user.role,
              kasir_id: kasir_id
            });

          if (profileError) {
            console.error('Error creating profile:', profileError);
          } else {
            console.log(`Created demo user profile: ${user.username}`);
          }
        }
      } catch (error) {
        console.error('Error initializing demo users:', error);
      }
    };

    initializeDemoUsers();
  }, []);
};
