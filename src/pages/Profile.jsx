import React, { useEffect, useState } from 'react';
import { 
  User, Phone, Mail, Edit3, Loader2, LogOut, 
  Camera, CheckCircle2, ChevronRight, ShieldCheck, 
  Bell, HelpCircle, Upload, Lock, KeyRound, 
  MessageSquare, Info, Smartphone, Eye, EyeOff,
  ChevronDown, LayoutDashboard
} from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profil');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const countries = [
    { name: 'Indonesia', code: '+62', flag: 'id' },
    { name: 'Malaysia', code: '+60', flag: 'my' },
    { name: 'Singapore', code: '+65', flag: 'sg' },
  ];
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);

  // --- STATE DATA DENGAN STATUS MITRA ---
  const [securityData, setSecurityData] = useState({
    first_name: '', last_name: '', phone: '',
    oldPassword: '', newPassword: '', confirmPassword: '',
    otpCode: '', avatar_url: '', kyc_url: '',
    is_mitra: false // Kolom kunci untuk perubahan tombol
  });
  
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    const getProfile = async () => {
      try {
        if (!user) return;
        // Mengambil data lengkap profil termasuk status is_mitra
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          setSecurityData(prev => ({
            ...prev,
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            phone: data.phone || user.phone || '', 
            avatar_url: data.avatar_url || '',
            kyc_url: data.kyc_url || '',
            is_mitra: data.is_mitra || false // Sinkronisasi status mitra
          }));
        }
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    getProfile();
  }, [user]);

  // --- FUNGSI UPDATE NAMA ---
  const handleUpdateName = async () => {
    setUpdating(true);
    try {
      const { error } = await supabase.from('profiles').update({
        first_name: securityData.first_name,
        last_name: securityData.last_name,
      }).eq('id', user.id);
      if (error) throw error;
      toast({ title: "Berhasil", description: "Nama Anda telah diperbarui." });
    } catch (error) { toast({ variant: "destructive", description: error.message }); }
    finally { setUpdating(false); }
  };

  // --- FUNGSI UPLOAD FOTO PROFIL ---
  const handleAvatarUpload = async (event) => {
    try {
      setUploadingImage(true);
      const file = event.target.files[0];
      if (!file) return;
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;
      await supabase.from('profiles').upsert({ id: user.id, avatar_url: publicUrl, updated_at: new Date() });
      setSecurityData((prev) => ({ ...prev, avatar_url: publicUrl }));
      toast({ title: "Berhasil", description: "Foto profil diperbarui." });
    } catch (error) { toast({ variant: "destructive", description: "Gagal upload." }); }
    finally { setUploadingImage(false); }
  };

  const handleLogout = async () => { await signOut(); navigate('/'); };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-black" /></div>;

  const initial = securityData.first_name && securityData.first_name.length > 0 ? securityData.first_name[0].toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-[#1A1A1A] pb-20 pt-10">
      <div className="container mx-auto px-4 max-w-2xl">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative group">
            <div className="w-24 h-24 rounded-[32px] overflow-hidden bg-black flex items-center justify-center shadow-2xl border-4 border-white transition-transform duration-500 group-hover:scale-105">
              {uploadingImage ? <Loader2 className="animate-spin text-white" /> : securityData.avatar_url ? <img src={securityData.avatar_url} className="w-full h-full object-cover" /> : <span className="text-white text-3xl font-black italic">{initial}</span>}
            </div>
            <label className="absolute -bottom-1 -right-1 bg-white p-2 rounded-xl shadow-lg border border-gray-100 cursor-pointer hover:bg-black hover:text-white transition-all active:scale-90"><Camera size={16} /><input type="file" className="hidden" onChange={handleAvatarUpload} /></label>
          </div>
          <div className="text-center mt-4">
            <h2 className="text-xl font-black italic uppercase tracking-tighter leading-none">{securityData.first_name} {securityData.last_name}</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 italic">{user?.email}</p>
          </div>
        </div>

        {/* --- KARTU KONTEN --- */}
        <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm min-h-[400px] mb-6">
          <AnimatePresence mode="wait">
            
            {activeTab === 'keamanan' && (
              <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                <h3 className="text-lg font-black uppercase tracking-tighter border-b border-gray-100 pb-4 italic">Pengaturan Keamanan</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold text-gray-400 uppercase ml-1">Nama Depan</Label>
                      <Input placeholder="...." value={securityData.first_name} onChange={(e) => setSecurityData({...securityData, first_name: e.target.value})} className="h-12 rounded-xl border-gray-100 bg-white font-medium placeholder:text-gray-200" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold text-gray-400 uppercase ml-1">Nama Belakang</Label>
                      <Input placeholder="...." value={securityData.last_name} onChange={(e) => setSecurityData({...securityData, last_name: e.target.value})} className="h-12 rounded-xl border-gray-100 bg-white font-medium placeholder:text-gray-200" />
                    </div>
                  </div>
                  <Button onClick={handleUpdateName} disabled={updating} className="w-full bg-black text-white rounded-xl h-12 font-bold uppercase text-[11px] tracking-widest shadow-lg active:scale-95 transition-all">Update Nama</Button>
                </div>
                {/* Sisa input keamanan (ponsel/password) tetap sama seperti sebelumnya... */}
              </motion.div>
            )}

            {activeTab === 'profil' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <h3 className="text-lg font-black uppercase border-b border-gray-100 pb-4 italic tracking-tighter">Profil & KYC</h3>
                <div className="p-12 border-2 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center justify-center bg-gray-50 hover:bg-white transition-colors cursor-pointer group shadow-sm active:scale-95 transition-all">
                  <Upload className="text-gray-200 group-hover:text-black mb-2 transition-colors" size={32} />
                  <span className="text-[10px] font-black text-gray-300 group-hover:text-black uppercase tracking-widest italic text-center">Unggah KTP Sesuai Identitas</span>
                </div>

                {/* --- LOGIKA DINAMIS TOMBOL MITRA --- */}
                {securityData.is_mitra ? (
                  <Button 
                    onClick={() => navigate('/dashboard-mitra')} 
                    className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl h-14 font-black uppercase text-[11px] tracking-[0.1em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    <LayoutDashboard size={18} />
                    Masuk Dashboard Mitra
                  </Button>
                ) : (
                  <Button 
                    onClick={() => navigate('/register-mitra')} 
                    className="w-full bg-black text-white rounded-xl h-12 font-bold uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all"
                  >
                    Daftar Jadi Mitra
                  </Button>
                )}
              </motion.div>
            )}

            {activeTab === 'notifikasi' && <div className="flex flex-col items-center justify-center py-24 text-gray-200 font-black uppercase italic tracking-widest text-[11px] gap-2 opacity-30"><Bell size={32} /> No Notifications</div>}
            {activeTab === 'bantuan' && <div className="flex flex-col items-center justify-center py-24 text-gray-200 font-black uppercase italic tracking-widest text-[11px] gap-2 opacity-30"><HelpCircle size={32} /> Help Center</div>}

          </AnimatePresence>
        </div>

        {/* --- MENU PENGATURAN --- */}
        <div className="bg-white rounded-[40px] p-6 border border-gray-100 shadow-sm mb-6">
          <div className="mb-6 px-2"><h2 className="text-2xl font-black italic uppercase tracking-tighter underline decoration-4 underline-offset-8 decoration-gray-50">Pengaturan</h2></div>
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: 'notifikasi', label: 'Notifikasi', icon: Bell },
              { id: 'profil', label: 'Profil & KYC', icon: User },
              { id: 'keamanan', label: 'Keamanan', icon: ShieldCheck },
              { id: 'bantuan', label: 'Bantuan', icon: HelpCircle },
            ].map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center justify-between p-5 rounded-2xl font-bold transition-all active:scale-95 ${activeTab === item.id ? 'bg-black text-white shadow-xl' : 'text-gray-400 hover:bg-gray-50'}`}>
                <div className="flex items-center gap-4"><item.icon size={19} /><span className="text-sm uppercase italic tracking-tighter">{item.label}</span></div>
                <ChevronRight size={18} className={activeTab === item.id ? 'text-white' : 'text-gray-200'} />
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-4 p-5 text-red-500 font-black uppercase italic tracking-widest bg-white rounded-[24px] border border-gray-100 shadow-sm active:scale-95 transition-all hover:bg-red-50">
            <LogOut size={22} /><span className="text-sm">Logout dari Akun</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default Profile;
