import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | { id: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        if (!isSupabaseConfigured) {
          if (isMounted) {
            setUser({ id: 'guest-demo-user' });
            setLoading(false);
          }
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          if (isMounted) setUser(session.user);
        } else {
          const { data, error } = await supabase.auth.signInAnonymously();
          if (error) {
            console.warn('Supabase auth warning, using guest session:', error.message);
            if (isMounted) setUser({ id: 'guest-demo-user' });
          } else if (data?.user) {
            if (isMounted) setUser(data.user);
          }
        }
      } catch (err) {
        console.warn('Auth initialization fallback:', err);
        if (isMounted) setUser({ id: 'guest-demo-user' });
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (isMounted) {
          setUser(session?.user ?? { id: 'guest-demo-user' });
          setLoading(false);
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  return { user, loading };
}