import React, { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { getUserProfile, UserProfile } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  role: 'customer' | 'staff' | 'admin';
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Fetch current user role from database
async function fetchUserRole(): Promise<'customer' | 'staff' | 'admin'> {
  try {
    const { data, error } = await supabase.rpc('get_current_user_role', {});
    if (!error && data) return data as 'customer' | 'staff' | 'admin';
  } catch { /* fallback below */ }
  return 'customer'; // default
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<'customer' | 'staff' | 'admin'>('customer');
  const [loading, setLoading] = useState(true);

  // Refs to hold latest callback values — avoids recreating effects
  const profileRef = useRef<(userId: string) => void>(() => {});
  const roleRef = useRef<() => void>(() => {});

  // Set up initial defaults
  profileRef.current = async (userId: string) => {
    try {
      const userProfile = await getUserProfile(userId);
      setProfile(userProfile);
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  roleRef.current = async () => {
    try {
      const newRole = await fetchUserRole();
      setRole(newRole);
    } catch {
      setRole('customer');
    }
  };

  // Stable refresh functions that always use the latest refs
  const refreshProfile = useCallback(async () => {
    if (user) {
      profileRef.current(user.id);
    } else {
      setProfile(null);
    }
  }, [user]);

  // Single effect: runs ONCE — no callback deps, avoids re-render loops
  useEffect(() => {
    let cancelled = false;

    const applyAuthState = async (sess: Session | null) => {
      setSession(sess);
      setUser(sess?.user ?? null);

      if (sess?.user) {
        await profileRef.current(sess.user.id);
        await roleRef.current();
      } else {
        setProfile(null);
        setRole('customer');
      }

      if (!cancelled) setLoading(false);
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!cancelled) applyAuthState(initialSession);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, sess) => {
        if (!cancelled) applyAuthState(sess);
      }
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []); // Runs ONCE — no callback deps

  const signUp = async (email: string, password: string, fullName?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) throw error;

      if (data.user && data.session) {
        setSession(data.session);
        setUser(data.user);
        await profileRef.current(data.user.id);
        await roleRef.current();
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      setUser(data.user);
      setSession(data.session);
      await profileRef.current(data.user.id);
      await roleRef.current();
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
      setSession(null);
      setRole('customer');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    session,
    role,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
