import React, { useState, useEffect } from 'react';
import { Search, ClipboardList, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext'; // Import Context Auth

const BottomNav = ({ onAccountClick }) => { 
  const { user } = useAuth(); // Ambil data user
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('beranda');

  // Efek agar icon menyala sesuai halaman aktif
  useEffect(() => {
    if (location.pathname === '/') {
      setActiveTab('beranda');
    } else if (location.pathname === '/profile') {
      setActiveTab('akun');
    }
  }, [location.pathname]);

  const handleNavigation = (tab) => {
    setActiveTab(tab);

    if (tab === 'beranda') {
       if (location.pathname !== '/') {
         navigate('/');
       } else {
         window.scrollTo({ top: 0, behavior: 'smooth' });
       }
    } else if (tab === 'akun') {
      // LOGIKA BARU:
      if (user) {
        // Jika sudah login, pergi ke halaman profil
        navigate('/profile');
      } else {
        // Jika belum login, buka popup modal login
        if (onAccountClick) {
          onAccountClick();
        } else {
          navigate('/login'); 
        }
      }
    } else if (tab === 'pesanan') {
       toast({
        title: "Fitur Segera Hadir",
        description: "Halaman pesanan belum tersedia.",
      });
    } else {
       toast({
        title: "Fitur Segera Hadir",
        description: "Fitur ini belum tersedia.",
      });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-3 md:hidden z-40 flex justify-around items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <button 
        onClick={() => handleNavigation('beranda')}
        className={`flex flex-col items-center gap-1 min-w-[64px] transition-colors ${activeTab === 'beranda' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
      >
        <Search size={24} strokeWidth={activeTab === 'beranda' ? 2.5 : 2} />
        <span className="text-[10px] font-medium">Beranda</span>
      </button>
      
      <button 
        onClick={() => handleNavigation('pesanan')}
        className={`flex flex-col items-center gap-1 min-w-[64px] transition-colors ${activeTab === 'pesanan' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
      >
        <ClipboardList size={24} strokeWidth={activeTab === 'pesanan' ? 2.5 : 2} />
        <span className="text-[10px] font-medium">Pesanan</span>
      </button>
      
      <button 
        onClick={() => handleNavigation('akun')}
        className={`flex flex-col items-center gap-1 min-w-[64px] transition-colors ${activeTab === 'akun' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
      >
        <User size={24} strokeWidth={activeTab === 'akun' ? 2.5 : 2} />
        {/* Teks berubah dinamis tergantung login/belum */}
        <span className="text-[10px] font-medium">{user ? 'Profil' : 'Akun'}</span>
      </button>
    </div>
  );
};

export default BottomNav;
