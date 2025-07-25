import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function getUser() {
      try {
        if (process.env.NODE_ENV === 'development') {
          // Mock data for development
          setUser({
            id: '123',
            name: 'Test User',
            email: 'test@example.com'
          });
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) throw error;

          setUser({
            id: user.id,
            name: profile.name || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            avatar_url: profile.avatar_url
          });
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    getUser();
  }, []);

  return { user, loading, error };
}
