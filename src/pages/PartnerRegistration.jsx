import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Home, MapPin, Camera, Loader2, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const PartnerRegistration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    kosName: '',
    address: '',
    photo_url: '',
  });

  // --- LOGIKA AKTIF: UNGGAH FOTO PROPERTI ---
  const handlePhotoUpload = async (event) => {
    try {
      setLoading(true);
      const file = event.target.files[0];
      if (!file) return;

      // Jalur penyimpanan unik berdasarkan ID user dan waktu
      const filePath = `properties/${user.id}/${Date.now()}`;
      
      // Mengunggah ke bucket 'property-images'
      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Ambil URL publik hasil unggahan
      const { data: urlData } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, photo_url: urlData.publicUrl }));
      toast({ title: "Berhasil!", description: "Foto properti tersimpan di server." });
    } catch (error) { 
      console.error(error);
      toast({ variant: "destructive", title: "Gagal unggah foto!", description: "Pastikan bucket 'property-images' sudah dibuat." }); 
    } finally { setLoading(false); }
  };

  // --- LOGIKA AKTIF: SUBMIT PENDAFTARAN MITRA ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.photo_url) return toast({ variant: "destructive", description: "Harap unggah foto properti terlebih dahulu." });

    setLoading(true);
    try {
      // Sinkronisasi data ke tabel profiles
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_mitra: true, 
          role: 'mitra',
          first_name: formData.kosName, // Menyimpan nama kos sebagai identitas nama awal
          property_photo_url: formData.photo_url // Kolom baru yang harus ada di SQL
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({ title: "Pendaftaran Berhasil!", description: "Selamat! Akun Anda kini resmi menjadi Mitra Kosan." });
      navigate('/profile');
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Gagal Mendaftar", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-[#1A1A1A] pb-10">
      {/* --- HEADER NAVIGASI --- */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50 px-4 py-4">
        <div className="container mx-auto max-w-2xl flex items-center gap-4">
          <button 
            onClick={() => navigate('/profile')} 
            className="p-2 hover:bg-gray-50 rounded-xl transition-all active:scale-90"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-black uppercase italic tracking-tighter">Pendaftaran Mitra Pemilik</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-2xl mt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm"
        >
          {/* --- IDENTITAS PROPERTI --- */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-black text-white rounded-[20px] flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Home size={32} />
            </div>
            <h2 className="text-xl font-black uppercase italic tracking-tight leading-none">Informasi Properti</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Lengkapi data kos/apartemen Anda</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input Nama Properti */}
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-gray-500 uppercase ml-1 tracking-wider">Nama Kos / Properti</Label>
              <div className="relative">
                <Home className="absolute left-4 top-3.5 text-gray-300" size={18} />
                <Input 
                  placeholder="Contoh: Kosan Haurgeulis" 
                  className="h-12 pl-12 rounded-xl border-gray-100 bg-white font-medium placeholder:text-gray-200 focus:ring-1 focus:ring-black" 
                  required 
                  value={formData.kosName} 
                  onChange={(e) => setFormData({...formData, kosName: e.target.value})} 
                />
              </div>
            </div>

            {/* Input Alamat Properti */}
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-gray-500 uppercase ml-1 tracking-wider">Alamat Lengkap Properti</Label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 text-gray-300" size={18} />
                <Input 
                  placeholder="Jalan, No, RT/RW, Kecamatan..." 
                  className="h-12 pl-12 rounded-xl border-gray-100 bg-white font-medium placeholder:text-gray-200 focus:ring-1 focus:ring-black" 
                  required 
                  value={formData.address} 
                  onChange={(e) => setFormData({...formData, address: e.target.value})} 
                />
              </div>
            </div>

            {/* Area Unggah Foto */}
            <div className="relative p-10 border-2 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center justify-center bg-gray-50 hover:bg-white transition-all cursor-pointer group overflow-hidden">
              {formData.photo_url ? (
                <div className="flex flex-col items-center">
                  <CheckCircle2 className="text-green-500 mb-2 animate-bounce" size={32} />
                  <span className="text-[10px] font-black text-green-600 uppercase italic">Foto Properti Terlampir</span>
                  <p className="text-[8px] text-gray-400 mt-1 uppercase">Ketuk untuk mengganti</p>
                </div>
              ) : (
                <>
                  <Camera className="text-gray-200 group-hover:text-black mb-2 transition-colors" size={32} />
                  <span className="text-[10px] font-black text-gray-300 group-hover:text-black uppercase tracking-widest italic transition-colors">Unggah Foto Properti</span>
                </>
              )}
              <input 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={handlePhotoUpload} 
                disabled={loading}
              />
            </div>

            {/* Tombol Kirim */}
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-black text-white rounded-xl h-14 font-black text-[12px] tracking-[0.2em] uppercase mt-4 shadow-xl active:scale-95 transition-all"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Kirim Pendaftaran'}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default PartnerRegistration;
