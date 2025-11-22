import './lib/googleTranslateSafety'; // Import crash fix before anything else
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import './i18n/config' // Keep for components that still use useTranslation
import App from './App.jsx'
import LandingPage from './pages/LandingPage.jsx'
import CatalogPage from './pages/CatalogPage.jsx'
import AboutUsPage from './pages/AboutUsPage.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import DonationPage from './pages/DonationPage.jsx'
import DigitalSilence from './pages/articles/DigitalSilence.jsx'
import PhilologyRevolution from './pages/articles/PhilologyRevolution.jsx'
import GenZWisdom from './pages/articles/GenZWisdom.jsx'

// Wrapper component untuk handle routing
function AppRouter() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<App />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/donation" element={<DonationPage />} />
          
          {/* Articles */}
          <Route path="/articles/digital-silence" element={<DigitalSilence />} />
          <Route path="/articles/philology-revolution" element={<PhilologyRevolution />} />
          <Route path="/articles/gen-z-wisdom" element={<GenZWisdom />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
)
