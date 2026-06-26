import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';

import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

import AdminLayout from '@/components/layout/AdminLayout';
import Dashboard from '@/pages/Dashboard';
import StaffManagement from '@/pages/StaffManagement';
import ResidentManagement from '@/pages/ResidentManagement';
import DonationManagement from '@/pages/DonationManagement';
import DonorManagement from '@/pages/DonorManagement';
import VolunteerManagement from '@/pages/VolunteerManagement';
import EventManagement from '@/pages/EventManagement';
import WishWallManagement from '@/pages/WishWallManagement';
import Reports from '@/pages/Reports';
import Certificates from '@/pages/Certificates';
import QRDonations from '@/pages/QRDonations';
import Analytics from '@/pages/Analytics';
import DischargeManagement from '@/pages/DischargeManagement';
import MessagesManagement from '@/pages/MessagesManagement';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading Jivan Jyot Ashram Admin...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/staff" element={<StaffManagement />} />
          <Route path="/residents" element={<ResidentManagement />} />
          <Route path="/donations" element={<DonationManagement />} />
          <Route path="/donors" element={<DonorManagement />} />
          <Route path="/volunteers" element={<VolunteerManagement />} />
          <Route path="/events" element={<EventManagement />} />
          <Route path="/wish-wall" element={<WishWallManagement />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/qr-donations" element={<QRDonations />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/discharge" element={<DischargeManagement />} />
          <Route path="/messages" element={<MessagesManagement />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App