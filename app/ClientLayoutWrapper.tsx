'use client';

import { UserProvider } from '@/contexts/UserContext';
import BackendStatus from '@/app/components/BackendStatus';

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      {children}
      <BackendStatus />
    </UserProvider>
  );
}