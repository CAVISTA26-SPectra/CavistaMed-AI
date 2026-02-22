import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Login from "./pages/Login";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import NewConsultation from "./pages/doctor/NewConsultation";
import ConsultationHistory from "./pages/doctor/ConsultationHistory";
import AIInsights from "./pages/doctor/AIInsights";
import PatientDashboard from "./pages/patient/PatientDashboard";
import MedicineInfo from "./pages/patient/MedicineInfo";
import NotFound from "./pages/NotFound";
import ScrollToTop from "@/components/shared/ScrollToTop";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== allowedRole) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={`/${user.role}`} replace /> : <Login />} />

      <Route path="/doctor" element={<ProtectedRoute allowedRole="doctor"><DoctorDashboard /></ProtectedRoute>} />
      <Route path="/doctor/consultation" element={<ProtectedRoute allowedRole="doctor"><NewConsultation /></ProtectedRoute>} />
      <Route path="/doctor/patients" element={<ProtectedRoute allowedRole="doctor"><DoctorDashboard /></ProtectedRoute>} />
      <Route path="/doctor/history" element={<ProtectedRoute allowedRole="doctor"><ConsultationHistory /></ProtectedRoute>} />
      <Route path="/doctor/insights" element={<ProtectedRoute allowedRole="doctor"><AIInsights /></ProtectedRoute>} />
      <Route path="/doctor/settings" element={<ProtectedRoute allowedRole="doctor"><DoctorDashboard /></ProtectedRoute>} />


      <Route path="/patient" element={<ProtectedRoute allowedRole="patient"><PatientDashboard /></ProtectedRoute>} />
      <Route path="/patient/medicine-info" element={<ProtectedRoute allowedRole="patient"><MedicineInfo /></ProtectedRoute>} />
      <Route path="/patient/*" element={<ProtectedRoute allowedRole="patient"><PatientDashboard /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <ScrollToTop />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
