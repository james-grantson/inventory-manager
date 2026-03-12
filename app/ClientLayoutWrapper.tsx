'use client';

import { UserProvider } from '@/contexts/UserContext';
import { OrganizationProvider } from '@/contexts/OrganizationContext';
import BackendStatus from '@/app/components/BackendStatus';

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <OrganizationProvider>
        {children}
        <BackendStatus />
      </OrganizationProvider>
    </UserProvider>
  );
}