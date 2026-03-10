import AuthGuard from './components/AuthGuard';
import DashboardSwitcher from './dashboard-switcher';

export default function HomePage() {
  return (
    <AuthGuard>
      <DashboardSwitcher />
    </AuthGuard>
  );
}