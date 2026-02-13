import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Home from '@/pages/Home';
import Profile from '@/pages/Profile'; 
import PropertyDetail from '@/pages/PropertyDetail';
import PartnerRegistration from '@/pages/PartnerRegistration'; 
// --- TAMBAHAN BARU: Import DashboardMitra ---
import DashboardMitra from '@/pages/DashboardMitra'; 
// --------------------------------------------
import ForgotPassword from '@/pages/ForgotPassword';
import UpdatePassword from '@/pages/UpdatePassword';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Helmet>
          <title>Kosan - Temukan Hunian Nyaman & Modern di Indonesia</title>
          <meta name="description" content="Platform pemesanan kos dan apartemen dengan standar kualitas tinggi, aman, dan transparan di seluruh Indonesia." />
        </Helmet>
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/register-mitra" element={<PartnerRegistration />} />
          
          {/* --- TAMBAHAN BARU: Daftarkan Rute Dashboard --- */}
          {/* Pastikan path ini sesuai dengan link di tombol Profile kamu */}
          <Route path="/dashboard-mitra" element={<DashboardMitra />} /> 
          {/* ------------------------------------------------ */}
          
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          
          {/* Catch-all route (Penjaga gawang terakhir) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
