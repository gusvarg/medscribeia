
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ThemeProvider } from "next-themes";

// Import all pages
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Patients from '@/pages/Patients';
import PatientDetail from '@/pages/PatientDetail';
import Consultations from '@/pages/Consultations';
import Consultorios from '@/pages/Consultorios';
import Calendar from '@/pages/Calendar';
import AITools from '@/pages/AITools';
import Transcriptions from '@/pages/Transcriptions';
import Settings from '@/pages/Settings';
import Profile from '@/pages/Profile';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';

// Admin pages
import Users from '@/pages/admin/Users';
import Analytics from '@/pages/admin/Analytics';
import Plans from '@/pages/admin/Plans';
import Payments from '@/pages/admin/Payments';
import PaymentMethods from '@/pages/admin/PaymentMethods';
import AIConfigs from '@/pages/admin/AIConfigs';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <SidebarProvider>
            <Router>
              <div className="min-h-screen bg-background">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  
                  {/* Protected routes */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/patients" element={<Patients />} />
                  <Route path="/patients/:id" element={<PatientDetail />} />
                  <Route path="/consultations" element={<Consultations />} />
                  <Route path="/consultorios" element={<Consultorios />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/ai-tools" element={<AITools />} />
                  <Route path="/transcriptions" element={<Transcriptions />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />
                  
                  {/* Admin routes */}
                  <Route path="/admin/users" element={<Users />} />
                  <Route path="/admin/analytics" element={<Analytics />} />
                  <Route path="/admin/plans" element={<Plans />} />
                  <Route path="/admin/payments" element={<Payments />} />
                  <Route path="/admin/payment-methods" element={<PaymentMethods />} />
                  <Route path="/admin/ai-configs" element={<AIConfigs />} />
                  
                  {/* Catch all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <Toaster />
            </Router>
          </SidebarProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
