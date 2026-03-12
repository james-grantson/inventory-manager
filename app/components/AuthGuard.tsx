'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { useOrganization } from '@/contexts/OrganizationContext';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { organizations, loading: orgLoading } = useOrganization();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
      } else {
        // Wait for organizations to load before deciding
        if (!orgLoading) {
          if (organizations.length === 0) {
            router.push('/setup');
          } else {
            setLoading(false);
          }
        }
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login');
      }
    });

    return () => listener?.subscription.unsubscribe();
  }, [router, organizations, orgLoading]);

  // Show loading while checking auth or organizations
  if (loading || orgLoading) {
    return (
      <div className="min-h-screen bg-gradient-light dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
}