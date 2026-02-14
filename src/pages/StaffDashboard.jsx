import React, { useState, useEffect } from 'react';
import { 
  LogOut, User, MapPin, Search, Bell, 
  DoorOpen, Lock, Unlock, CheckCircle, XCircle, 
  Loader2, MoreVertical, Key 
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient'; 
import { useAuth } from '@/contexts/SupabaseAuthContext'; 
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

export default function StaffDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [loading, setLoading] = useState(true);
  const [staffInfo, setStaffInfo] = useState(null);
  const [property, setProperty] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [filter, setFilter] = useState('all'); // all, available, occupied, dirty

  // Fetch Data Staff & Lokasi
  useEffect(() => {
    if (user) fetchStaffData();
  }, [user]);

  const fetchStaffData = async () => {
    setLoading(true);
    try {
      // 1. Cari info staff ini jaga di properti mana
      const { data: staffData, error: staffError } = await supabase
        .from('property_staff')
        .select('*, properties(*)')
        .eq('user_id', user.id)
        .single();

      if (staffError || !staffData) {
        toast({ title: "Akses Ditolak", description: "Anda tidak terdaftar sebagai staff.", variant: "destructive" });
        return;
      }

      setStaffInfo(staffData);
      setProperty(staffData.properties);

      // 2. Ambil data kamar di properti tersebut
      fetchRooms(staffData.property_id);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async (propId) => {
    const { data } = await supabase
      .from('rooms')
      .select('*')
      .eq('property_id', propId)
      .order('room_number', { ascending: true });
    setRooms(data || []);
  };

  // --- ACTIONS ---

  const handleUpdateStatus = async (roomId, newStatus) => {
    // newStatus: 'available', 'occupied', 'dirty', 'maintenance'
    const { error } = await supabase
      .from('rooms')
      .update({ status: newStatus })
      .eq('id', roomId);

    if (!error) {
      toast({ title: "Status Diperbarui", description: `Kamar sekarang ${newStatus}` });
      fetchRooms(property.id); // Refresh
    }
  };

  const handleOpenDoor = async (room) => {
    if (!room.ttlock_id) {
        toast({ title: "Gagal", description: "Kamar ini belum terhubung TTLock", variant: "destructive" });
        return;
    }
    
    // Simulasi Buka Pintu
    toast({ title: "Memproses...", description: "Mengirim sinyal ke Smart Lock..." });
    setTimeout(() => {
        toast({ title: "Pintu Terbuka!", description: `Akses diberikan ke kamar ${room.room_number}` });
    }, 2000);
  };

  // Filter Logic
  const filteredRooms = rooms.filter(r => filter === 'all' ? true : r.status === filter);

  // Statistik Cepat
  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'available').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    dirty: rooms.filter(r => r.status === 'dirty').length,
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-gray-100 pb-20 font-sans text-gray-900">
      
      {/* HEADER STAFF */}
      <div className="bg-black text-white px-6 py-6 rounded-b-[30px] shadow-lg sticky top-0 z-20">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Staff Dashboard</p>
            <h1 className="text-2xl font-bold">{property?.name}</h1>
            <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
              <MapPin size={12}/> {property?.address}
            </div>
          </div>
          <div className="bg-white/10 p-2 rounded-full">
            <User className="text-white" size={24}/>
          </div>
        </div>

        {/* STATUS BAR (Quick Stats) */}
        <div className="grid grid-cols-4 gap-2">
            <StatCard label="Total" count={stats.total} active={filter === 'all'} onClick={() => setFilter('all')} />
            <StatCard label="Kosong" count={stats.available} color="bg-green-500" active={filter === 'available'} onClick={() => setFilter('available')} />
            <StatCard label="Isi" count={stats.occupied} color="bg-blue-500" active={filter === 'occupied'} onClick={() => setFilter('occupied')} />
            <StatCard label="Kotor" count={stats.dirty} color="bg-orange-500" active={filter === 'dirty'} onClick={() => setFilter('dirty')} />
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="px-6 -mt-5 relative z-30">
        <div className="bg-white rounded-xl shadow-sm p-3 flex items-center gap-3 border border-gray-100">
            <Search className="text-gray-400" size={20}/>
            <input 
                placeholder="Cari nomor kamar..." 
                className="flex-1 outline-none text-sm font-medium"
            />
        </div>
      </div>

      {/* ROOM LIST */}
      <div className="p-6 space-y-4">
        {filteredRooms.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">Tidak ada kamar dengan status ini.</div>
        ) : (
            filteredRooms.map((room) => (
                <RoomCard 
                    key={room.id} 
                    room={room} 
                    onStatusChange={handleUpdateStatus}
                    onOpenDoor={() => handleOpenDoor(room)}
                />
            ))
        )}
      </div>

      {/* FLOAT BUTTON LOGOUT */}
      <button 
        onClick={signOut}
        className="fixed top-4 right-4 bg-red-500/90 text-white p-2 rounded-full shadow-lg z-50 hover:bg-red-600 transition"
      >
        <LogOut size={16}/>
      </button>

    </div>
  );
}

// --- SUB COMPONENTS ---

const StatCard = ({ label, count, color = 'bg-gray-700', active, onClick }) => (
    <button 
        onClick={onClick}
        className={`rounded-xl p-2 text-center transition-all ${active ? 'bg-white text-black transform scale-105 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}
    >
        <div className={`text-lg font-bold leading-none ${active ? 'text-black' : 'text-white'}`}>{count}</div>
        <div className={`text-[9px] uppercase font-bold mt-1 ${active ? 'text-gray-500' : 'text-gray-400'}`}>{label}</div>
        {active && <div className={`h-1 w-4 mx-auto mt-1 rounded-full ${color}`}></div>}
    </button>
);

const RoomCard = ({ room, onStatusChange, onOpenDoor }) => {
    // Tentukan warna border & badge berdasarkan status
    const statusConfig = {
        available: { color: 'border-green-500', bg: 'bg-green-50 text-green-700', label: 'KOSONG' },
        occupied: { color: 'border-blue-500', bg: 'bg-blue-50 text-blue-700', label: 'TERISI' },
        dirty: { color: 'border-orange-500', bg: 'bg-orange-50 text-orange-700', label: 'KOTOR' },
        maintenance: { color: 'border-red-500', bg: 'bg-red-50 text-red-700', label: 'RUSAK' },
    };
    
    const config = statusConfig[room.status] || statusConfig.available;

    return (
        <div className={`bg-white rounded-2xl p-4 shadow-sm border-l-4 ${config.color} flex flex-col gap-3 relative`}>
            
            {/* Header Card */}
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-2xl font-black text-gray-800">{room.room_number}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${config.bg}`}>
                        {config.label}
                    </span>
                </div>
                
                {/* Tombol TTLock Cepat */}
                <button 
                    onClick={onOpenDoor}
                    className="bg-black text-white p-3 rounded-xl shadow-lg active:scale-95 transition flex flex-col items-center gap-1 min-w-[60px]"
                >
                    <Key size={20}/>
                    <span className="text-[8px] font-bold uppercase">Buka</span>
                </button>
            </div>

            <div className="h-px bg-gray-100 w-full"></div>

            {/* Action Buttons (Ganti Status) */}
            <div className="grid grid-cols-3 gap-2">
                {room.status !== 'available' && (
                    <button onClick={() => onStatusChange(room.id, 'available')} className="py-2 rounded-lg border border-gray-100 text-[10px] font-bold text-gray-600 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition">
                        SET KOSONG
                    </button>
                )}
                {room.status !== 'occupied' && (
                    <button onClick={() => onStatusChange(room.id, 'occupied')} className="py-2 rounded-lg border border-gray-100 text-[10px] font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition">
                        CHECK-IN
                    </button>
                )}
                {room.status !== 'dirty' && (
                    <button onClick={() => onStatusChange(room.id, 'dirty')} className="py-2 rounded-lg border border-gray-100 text-[10px] font-bold text-gray-600 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition">
                        BERSIHKAN
                    </button>
                )}
            </div>
        </div>
    );
};
