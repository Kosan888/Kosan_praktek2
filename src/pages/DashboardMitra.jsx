import React, { useState, useEffect } from 'react';
import { ChevronLeft, Save, Check, LayoutGrid, Edit, Loader2, PlusCircle } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient'; 
import { useAuth } from '@/contexts/SupabaseAuthContext'; 
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

// --- KOMPONEN UTAMA DASHBOARD ---
const DashboardMitra = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [myRooms, setMyRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null); // Jika ada ID, tampilkan mode Editor

  // 1. Fetch Kamar Milik Mitra saat halaman dibuka
  useEffect(() => {
    const fetchMyProperties = async () => {
      try {
        if(!user) return;
        
        // A. Cari property milik user ini
        const { data: props, error: propError } = await supabase
            .from('properties')
            .select('id, name')
            .eq('owner_id', user.id);
            
        if (propError) throw propError;

        if (props && props.length > 0) {
            // B. Ambil semua kamar dari properti tersebut
            const propIds = props.map(p => p.id);
            const { data: rooms, error: roomError } = await supabase
                .from('rooms')
                .select('*, properties(name)')
                .in('property_id', propIds)
                .order('room_number');
            
            if (roomError) throw roomError;
            setMyRooms(rooms || []);
        }
      } catch (err) {
        console.error(err);
        toast({ title: "Gagal Memuat Data", description: "Periksa koneksi internet Anda.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMyProperties();
  }, [user]);

  // Jika user memilih kamar, tampilkan Editor (Sub-Component di bawah)
  if (selectedRoomId) {
    return (
        <RoomEditor 
            roomId={selectedRoomId} 
            onBack={() => {
                setSelectedRoomId(null); // Kembali ke list
                // Opsional: Bisa tambahkan logic refresh data di sini
            }} 
        />
    );
  }

  // Tampilan Dashboard Utama (List Kamar)
  return (
    <div className="min-h-screen bg-[#F9F9F9] p-6 pb-24 font-sans">
       <div className="max-w-2xl mx-auto">
         {/* Header Dashboard */}
         <div className="flex items-center gap-4 mb-8 pt-4">
            <button onClick={() => navigate('/profile')} className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-all">
                <ChevronLeft size={20}/>
            </button>
            <div>
                <h1 className="text-xl font-black italic uppercase tracking-tighter leading-none">Dashboard Mitra</h1>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Kelola Unit & Harga Sewa</p>
            </div>
         </div>

         {/* Konten List Kamar */}
         {loading ? (
            <div className="flex flex-col items-center justify-center pt-20 gap-4">
                <Loader2 className="animate-spin text-gray-300" size={32}/>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Memuat Data Unit...</p>
            </div>
         ) : myRooms.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
                {myRooms.map((room) => (
                    <div 
                        key={room.id} 
                        onClick={() => setSelectedRoomId(room.id)} 
                        className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex justify-between items-center cursor-pointer hover:border-black transition-all group active:scale-98"
                    >
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[9px] font-black bg-gray-100 px-2 py-0.5 rounded text-gray-500 uppercase tracking-widest">{room.properties?.name}</span>
                            </div>
                            <h3 className="text-2xl font-black italic uppercase text-black leading-none">Pintu {room.room_number}</h3>
                            <div className="flex gap-2 mt-3">
                                <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wide border ${room.pricing_plan?.hourly ? 'bg-black text-white border-black' : 'bg-white text-gray-300 border-gray-100'}`}>
                                    Transit
                                </span>
                                <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wide border ${room.pricing_plan?.monthly ? 'bg-black text-white border-black' : 'bg-white text-gray-300 border-gray-100'}`}>
                                    Bulanan
                                </span>
                            </div>
                        </div>
                        <div className="w-14 h-14 bg-gray-50 rounded-[20px] flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors shadow-sm">
                            <Edit size={22} />
                        </div>
                    </div>
                ))}
            </div>
         ) : (
             <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-100 mt-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <PlusCircle className="text-gray-300" size={32} />
                </div>
                <p className="text-gray-900 font-bold text-sm uppercase italic">Belum ada kamar</p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest text-center px-6">
                    Pastikan Anda sudah mendaftar sebagai mitra dan menambahkan properti.
                </p>
             </div>
         )}
       </div>
    </div>
  );
};

// --- SUB-COMPONENT: EDITOR KAMAR (Internal) ---
const RoomEditor = ({ roomId, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hourly'); 
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const { data, error } = await supabase.from('rooms').select('*').eq('id', roomId).single();
        if (error) throw error;
        setSelectedRoom(data);
      } catch (err) {
        toast({ title: "Error", description: "Gagal mengambil detail kamar.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    if (roomId) fetchRoomData();
  }, [roomId]);

  const handleUpdatePricing = (dur, value) => {
    const numValue = Number(value);
    const currentPricing = selectedRoom.pricing_plan || { hourly: {}, monthly: {} };
    // Pastikan object hourly/monthly ada sebelum di-spread
    const currentTabPricing = currentPricing[activeTab] || {};

    const updatedTabData = { 
      ...currentTabPricing,
      [dur]: { 
          price: numValue, 
          active: numValue > 0 
      }
    };

    const newPricingPlan = {
        ...currentPricing,
        [activeTab]: updatedTabData
    };

    setSelectedRoom({ ...selectedRoom, pricing_plan: newPricingPlan });
  };

  const toggleAmenity = (amenityName) => {
    const currentAmenities = selectedRoom.amenities || [];
    const updated = currentAmenities.includes(amenityName) 
        ? currentAmenities.filter(a => a !== amenityName) 
        : [...currentAmenities, amenityName];
    setSelectedRoom({ ...selectedRoom, amenities: updated });
  };

  const saveChanges = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from('rooms').update({
          pricing_plan: selectedRoom.pricing_plan,
          amenities: selectedRoom.amenities,
          updated_at: new Date()
        }).eq('id', roomId);

      if (error) throw error;
      toast({ title: "Tersimpan!", description: "Perubahan harga & fasilitas berhasil disimpan." });
    } catch (err) {
      toast({ title: "Gagal Menyimpan", description: err.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="h-screen flex justify-center items-center bg-white"><Loader2 className="animate-spin text-black" size={32}/></div>;

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-20 font-sans">
      <div className="bg-white p-4 flex items-center justify-between sticky top-0 z-50 shadow-sm border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-50 rounded-xl transition-all"><ChevronLeft size={24} /></button>
          <div>
            <h1 className="font-black text-sm text-gray-900 uppercase italic leading-none">Edit Pintu {selectedRoom?.room_number}</h1>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Mode Pengaturan</p>
          </div>
        </div>
        <button 
            onClick={saveChanges} 
            disabled={isSaving} 
            className="bg-black text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg active:scale-95 transition-all"
        >
          {isSaving ? <Loader2 className="animate-spin" size={14}/> : <><Save size={14} /> Simpan</>}
        </button>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6 mt-4">
        {/* SECTION: FASILITAS */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
          <h2 className="text-[10px] font-black text-gray-400 mb-6 tracking-[0.2em] uppercase italic flex items-center gap-2">
            <LayoutGrid size={14}/> Fasilitas Kamar
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {['WiFi', 'AC', 'Smart TV', 'Kamar Mandi Dalam', 'Water Heater', 'Meja Kerja', 'Lemari Pakaian', 'Dispenser'].map((item) => (
              <button 
                key={item} 
                onClick={() => toggleAmenity(item)} 
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                    selectedRoom.amenities?.includes(item) 
                    ? 'border-black bg-black text-white shadow-lg transform scale-[1.02]' 
                    : 'border-gray-100 text-gray-400 hover:border-gray-200 bg-gray-50'
                }`}
              >
                <span className="text-[9px] font-black uppercase tracking-widest">{item}</span>
                {selectedRoom.amenities?.includes(item) && <Check size={14} className="text-green-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* SECTION: HARGA */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
          <h2 className="text-[10px] font-black text-gray-400 mb-6 tracking-[0.2em] uppercase italic">Atur Durasi & Tarif</h2>
          
          {/* Tab Switcher */}
          <div className="flex bg-gray-50 p-1.5 rounded-[20px] mb-8 border border-gray-100">
            <button 
                onClick={() => setActiveTab('hourly')} 
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-[16px] transition-all ${
                    activeTab === 'hourly' ? 'bg-white shadow-md text-black' : 'text-gray-400 hover:text-gray-600'
                }`}
            >
                Transit / Jam
            </button>
            <button 
                onClick={() => setActiveTab('monthly')} 
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-[16px] transition-all ${
                    activeTab === 'monthly' ? 'bg-white shadow-md text-black' : 'text-gray-400 hover:text-gray-600'
                }`}
            >
                Bulanan
            </button>
          </div>

          <div className="space-y-4">
            {(activeTab === 'hourly' ? ['1', '2', '3', '4', '5', '6', '12', '24'] : ['1', '2', '3', '6', '12']).map((dur) => (
              <div key={dur} className="flex items-center gap-4 p-2 pl-6 border border-gray-100 rounded-[24px] focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all bg-gray-50/50">
                <div className="w-16">
                    <span className="text-sm font-black italic block text-gray-900">{dur}</span>
                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">{activeTab === 'hourly' ? 'JAM' : 'BULAN'}</span>
                </div>
                
                <div className="h-8 w-px bg-gray-200"></div>
                
                <div className="relative flex-1">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold pl-2">Rp</span>
                  <input
                    type="number"
                    value={selectedRoom.pricing_plan?.[activeTab]?.[dur]?.price || ''}
                    onChange={(e) => handleUpdatePricing(dur, e.target.value)}
                    className="w-full bg-transparent border-none rounded-lg py-3 pl-8 pr-4 text-sm font-bold text-black placeholder:text-gray-200 focus:ring-0"
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMitra;
