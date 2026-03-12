'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { getAuthToken } from '@/lib/auth';

interface UserProfile {
  id: string;
  userId: string;
  email?: string;
  role: 'admin' | 'manager' | 'cashier';
  fullName?: string;
  isSuperAdmin?: boolean; // 👈 added for super admin check
}

interface UserContextType {
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  profile: null,
  loading: true,
  refreshProfile: async () => {}
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile); // profile now includes isSuperAdmin from backend
      } else {
        console.error('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ profile, loading, refreshProfile: fetchProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);