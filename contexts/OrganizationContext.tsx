'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from './UserContext';
import { getAuthToken } from '@/lib/auth';

interface Organization {
  id: string;
  name: string;
  role?: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface OrganizationContextType {
  organizations: Organization[];
  currentOrganization: Organization | null;
  setCurrentOrganization: (org: Organization) => Promise<void>;
  loading: boolean;
  error: string | null;
  refreshOrganizations: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType>({
  organizations: [],
  currentOrganization: null,
  setCurrentOrganization: async () => {},
  loading: true,
  error: null,
  refreshOrganizations: async () => {},
});

export const OrganizationProvider = ({ children }: { children: React.ReactNode }) => {
  const { profile } = useUser();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizations = async () => {
    try {
      setError(null);
      const token = await getAuthToken();
      if (!token) {
        setOrganizations([]);
        setCurrentOrganization(null);
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/organizations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        if (res.status === 401) {
          // Token expired – handle logout or refresh
          return;
        }
        throw new Error('Failed to fetch organizations');
      }
      const data = await res.json();
      setOrganizations(data);

      // Load saved org from localStorage or default to first
      const savedId = localStorage.getItem('currentOrganizationId');
      const savedOrg = data.find((o: Organization) => o.id === savedId);
      if (savedOrg) {
        setCurrentOrganization(savedOrg);
      } else if (data.length > 0) {
        setCurrentOrganization(data[0]);
        localStorage.setItem('currentOrganizationId', data[0].id);
      } else {
        setCurrentOrganization(null);
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch orgs when user profile is available
  useEffect(() => {
    if (profile) {
      fetchOrganizations();
    } else {
      setLoading(false);
      setOrganizations([]);
      setCurrentOrganization(null);
    }
  }, [profile]);

  const handleSetCurrentOrganization = async (org: Organization) => {
    setCurrentOrganization(org);
    localStorage.setItem('currentOrganizationId', org.id);
    // Optionally refresh data – you can trigger a page reload or let components react
    // For now, we'll just update the state. Components using this context will re-render.
  };

  const refreshOrganizations = async () => {
    await fetchOrganizations();
  };

  return (
    <OrganizationContext.Provider value={{
      organizations,
      currentOrganization,
      setCurrentOrganization: handleSetCurrentOrganization,
      loading,
      error,
      refreshOrganizations
    }}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => useContext(OrganizationContext);