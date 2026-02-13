import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Home from '@/pages/Home';
import Profile from '@/pages/Profile'; 
import PropertyDetail from '@/pages/PropertyDetail';
import BookingPage from '@/pages/BookingPage';
import PartnerRegistration from '@/pages/PartnerRegistration'; 
import DashboardMitra from '@/pages/DashboardMitra'; 
import ForgotPassword from '@/pages/ForgotPassword';
import UpdatePassword from '@/pages/UpdatePassword';

import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Helmet>
          <title>Kosan - Hunian Nyaman & Modern</title>
        </Helmet>
        
        <Routes>
          {/* Halaman Utama */}
          <Route path="/" element={<Home />} />
          
          {/* Halaman Akun & Mitra */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/register-mitra" element={<PartnerRegistration />} /> 
          <Route path="/dashboard-mitra" element={<DashboardMitra />} />
          
          {/* Halaman Booking */}
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/booking/:id" element={<BookingPage />} />

          {/* Halaman Auth */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
