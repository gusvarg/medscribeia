import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Patients from "./pages/Patients";
import Consultations from "./pages/Consultations";
import Transcriptions from "./pages/Transcriptions";
import Calendar from "./pages/Calendar";
import AITools from "./pages/AITools";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Analytics from "./pages/admin/Analytics";
import Users from "./pages/admin/Users";
import Payments from "./pages/admin/Payments";
import Plans from "./pages/admin/Plans";
import PaymentMethods from "./pages/admin/PaymentMethods";
import AIConfigs from "./pages/admin/AIConfigs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/consultations" element={<Consultations />} />
              <Route path="/transcriptions" element={<Transcriptions />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/ai-tools" element={<AITools />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin/analytics" element={<Analytics />} />
              <Route path="/admin/users" element={<Users />} />
              <Route path="/admin/plans" element={<Plans />} />
              <Route path="/admin/payment-methods" element={<PaymentMethods />} />
              <Route path="/admin/ai-configs" element={<AIConfigs />} />
              <Route path="/admin/payments" element={<Payments />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
