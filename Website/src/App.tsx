import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import About from "./pages/About";
import Institution from "./pages/Institution";
import Contact from "./pages/Contact";
import Donations from "./pages/Donations";
import Admissions from "./pages/Admissions";
import Alumni from "./pages/Alumni";
import Trustees from "./pages/Trustees";
import Gallery from "./pages/Gallery";
import News from "./pages/News";
import FAQ from "./pages/FAQ";
import Facilities from "./pages/Facilities";
import NotFound from "./pages/NotFound";
import AlumniHome from "./pages/alumni/AlumniHome";
import AlumniRegister from "./pages/alumni/AlumniRegister";
import AlumniLogin from "./pages/alumni/AlumniLogin";
import AlumniPending from "./pages/alumni/AlumniPending";
import AlumniDashboard from "./pages/alumni/AlumniDashboard";
import AlumniDirectory from "./pages/alumni/AlumniDirectory";
import AlumniEvents from "./pages/alumni/AlumniEvents";
import AlumniJobs from "./pages/alumni/AlumniJobs";
import AlumniProfile from "./pages/alumni/AlumniProfile";
import AlumniAdmin from "./pages/alumni/AlumniAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/institutions/:id" element={<Institution />} />
            <Route path="/admissions/:id" element={<Admissions />} />
            <Route path="/alumni" element={<AlumniHome />} />
            <Route path="/alumni/register" element={<AlumniRegister />} />
            <Route path="/alumni/login" element={<AlumniLogin />} />
            <Route path="/alumni/pending" element={<AlumniPending />} />
            <Route path="/alumni/dashboard" element={<AlumniDashboard />} />
            <Route path="/alumni/directory" element={<AlumniDirectory />} />
            <Route path="/alumni/events" element={<AlumniEvents />} />
            <Route path="/alumni/jobs" element={<AlumniJobs />} />
            <Route path="/alumni/profile" element={<AlumniProfile />} />
            <Route path="/alumni/admin" element={<AlumniAdmin />} />
            <Route path="/alumni/:id" element={<Alumni />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/news" element={<News />} />
            <Route path="/donations" element={<Donations />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/facilities" element={<Facilities />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
