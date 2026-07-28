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

        // 2-second timeout guard to prevent infinite loading if Supabase auth hangs
        const authTimeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth timeout')), 2000)
        );

        const authPromise = (async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) return session.user;

          const { data, error } = await supabase.auth.signInAnonymously();
          if (error || !data?.user) {
            return { id: 'guest-demo-user' };
          }
          return data.user;
        })();

        const resolvedUser = (await Promise.race([authPromise, authTimeout])) as User | { id: string };
        if (isMounted) setUser(resolvedUser);
      } catch (err) {
        console.warn('Auth initialization fallback triggered:', err);
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