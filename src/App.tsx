import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import Landing from "./pages/Landing";
import PatientIntake from "./pages/PatientIntake";
import Dashboard from "./pages/Dashboard";
import BedManagement from "./pages/BedManagement";
import Discharge from "./pages/Discharge";
import Analytics from "./pages/Analytics";
import PredictivePlanning from "./pages/PredictivePlanning";
import DoctorMonitoring from "./pages/DoctorMonitoring";
import VoiceOrders from "./pages/VoiceOrders";
import AIS140Monitoring from "./pages/AIS140Monitoring";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route element={<MainLayout />}>
            <Route path="/patient-intake" element={<PatientIntake />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/bed-management" element={<BedManagement />} />
            <Route path="/discharge" element={<Discharge />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/predictive-planning" element={<PredictivePlanning />} />
            <Route path="/doctor-monitoring" element={<DoctorMonitoring />} />
            <Route path="/voice-orders" element={<VoiceOrders />} />
            <Route path="/ais140-monitoring" element={<AIS140Monitoring />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;