import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient'; // Pastikan path ini sesuai dengan AuthModal.jsx Anda
import AuthModal from './AuthModal';

const Header = () => {
  const navigate = useNavigate();
  
  // State untuk modal & data user
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  // 1. Cek Status Login User (Realtime)
  useEffect(() => {
    // Cek session awal saat halaman dimuat
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getSession();

    // Pasang 'telinga' untuk mendengar perubahan login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Fungsi Tombol Profil dengan Logika Cerdas
  const handleProfileClick = () => {
    if (user) {
      // JIKA SUDAH LOGIN: Arahkan ke halaman profil
      navigate('/profile');
    } else {
      // JIKA BELUM LOGIN: Buka popup login/daftar
      setIsAuthModalOpen(true);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white z-40 border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-center relative">
          
          {/* Logo */}
          <div 
            className="cursor-pointer transition-transform hover:scale-105" 
            onClick={() => navigate('/')}
          >
            <img 
              src="https://horizons-cdn.hostinger.com/fe0ceffa-a268-4ed7-9517-b00266208690/82f0ec3177ec7c28e1cd03e5f4aac30f.jpg" 
              alt="Kosan Logo" 
              className="h-[60px] w-auto object-contain" 
            />
          </div>

          {/* TOMBOL PROFIL (Desktop Only) */}
          <div className="absolute right-4 hidden md:flex items-center">
            <button 
              onClick={handleProfileClick}
              className={`p-2 rounded-full transition-all duration-200 ${
                user 
                  ? "text-black bg-gray-100 hover:bg-gray-200" // Style jika sudah login (lebih bold)
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50" // Style jika tamu
              }`}
              title={user ? "Ke Profil Saya" : "Masuk / Daftar"}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-7 w-7" 
                fill={user ? "currentColor" : "none"} // Icon terisi jika login
                viewBox="0 0 24 24" 
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" 
                />
              </svg>
            </button>
          </div>

        </div>
      </header>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
};

export default Header;
