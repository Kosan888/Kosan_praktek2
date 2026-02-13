import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, Save, PlusCircle, Home, MapPin, 
  Clock, Calendar, Key, Lock, Unlock, Trash2, 
  DoorOpen, Loader2, LayoutGrid, AlertCircle 
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient'; 
import { useAuth } from '@/contexts/SupabaseAuthContext'; 
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

// --- HELPER FORMAT RUPIAH ---
const formatRupiah = (number) => {
  if (!number) return '';
  return new Intl.NumberFormat('id-ID').format(number);
};

// --- MAIN COMPONENT ---
const DashboardMitra = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [myProperties, setMyProperties] = useState([]);
  
  // State Navigasi
  const [viewMode, setViewMode] = useState('LIST'); // 'LIST', 'EDIT_PROPERTY', 'MANAGE_ROOMS'
  const [selectedProp, setSelectedProp] = useState(null);

  // 1. Fetch Properti
  useEffect(() => {
    fetchProperties();
  }, [user]);

  const fetchProperties = async () => {
    if(!user) return;
    setLoading(true);
    const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
    
    if (!error) setMyProperties(data || []);
    setLoading(false);
  };

  // Handler Navigasi
  const openPropertyEditor = (prop) => {
    setSelectedProp(prop);
    setViewMode('EDIT_PROPERTY');
  };

  const openRoomManager = (prop) => {
    setSelectedProp(prop);
    setViewMode('MANAGE_ROOMS');
  };

  const handleBack = () => {
    if (viewMode === 'LIST') navigate('/profile');
    else {
        setViewMode('LIST');
        setSelectedProp(null);
        fetchProperties(); // Refresh data saat kembali
    }
  };

  // --- RENDER UTAMA ---
  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans text-gray-900">
       {/* Header Global */}
       <div className="bg-white sticky top-0 z-20 border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
         <div className="flex items-center gap-3">
            <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full transition">
                <ChevronLeft size={24}/>
            </button>
            <div>
                <h1 className="text-lg font-bold text-gray-900">
                    {viewMode === 'LIST' ? 'Dashboard Mitra' : selectedProp?.name || 'Properti Baru'}
                </h1>
                <p className="text-xs text-gray-500">
                    {viewMode === 'LIST' ? 'Kelola Gedung & Unit' : viewMode === 'EDIT_PROPERTY' ? 'Edit Informasi & Harga' : 'Kelola Daftar Kamar & Kunci'}
                </p>
            </div>
         </div>
         
         {viewMode === 'LIST' && (
             <button 
                onClick={() => openPropertyEditor({ isNew: true, name: '', address: '', facilities: [], pricing_plan: { hourly: [], monthly: [] } })}
                className="bg-black text-white px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 hover:bg-gray-800"
             >
                <PlusCircle size={16} /> Tambah Gedung
             </button>
         )}
       </div>

       {/* KONTEN BERDASARKAN VIEW MODE */}
       <div className="max-w-3xl mx-auto p-6">
         
         {/* VIEW 1: LIST PROPERTI */}
         {viewMode === 'LIST' && (
            loading ? <div className="text-center py-10"><Loader2 className="animate-spin mx-auto"/></div> :
            <div className="grid grid-cols-1 gap-4">
                {myProperties.map((prop) => (
                    <div key={prop.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition">
                        <div className="flex justify-between items-start">
                            <div className="flex gap-4">
                                <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Home className="text-gray-400" size={24}/>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{prop.name}</h3>
                                    <p className="text-xs text-gray-500 mb-2">{prop.address}</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => openPropertyEditor(prop)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-semibold transition">
                                            Edit Info & Harga
                                        </button>
                                        <button onClick={() => openRoomManager(prop)} className="px-3 py-1.5 bg-black text-white hover:bg-gray-800 rounded text-xs font-semibold flex items-center gap-2 transition">
                                            <DoorOpen size={14}/> Kelola Kamar & Kunci
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {myProperties.length === 0 && (
                    <div className="text-center py-10 text-gray-400 text-sm">Belum ada properti. Tambahkan gedung pertama Anda.</div>
                )}
            </div>
         )}

         {/* VIEW 2: EDIT PROPERTI (Component Terpisah di Bawah) */}
         {viewMode === 'EDIT_PROPERTY' && (
            <PropertyEditor 
                property={selectedProp} 
                onSuccess={() => {
                    toast({title: "Berhasil", description: "Data properti disimpan."});
                    handleBack();
                }} 
                isNew={selectedProp.isNew}
            />
         )}

         {/* VIEW 3: MANAJEMEN KAMAR & TTLOCK (Component Terpisah di Bawah) */}
         {viewMode === 'MANAGE_ROOMS' && (
            <RoomManager propertyId={selectedProp.id} propertyName={selectedProp.name} />
         )}

       </div>
    </div>
  );
};

// =================================================================
// SUB-COMPONENT: ROOM MANAGER (KELOLA KAMAR & TTLOCK)
// =================================================================
const RoomManager = ({ propertyId, propertyName }) => {
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    
    // State Form Tambah Kamar
    const [newRoomNumber, setNewRoomNumber] = useState('');
    
    // State Modal TTLock
    const [pairingRoom, setPairingRoom] = useState(null); // Kamar yang sedang dipairing
    const [lockAlias, setLockAlias] = useState('');

    useEffect(() => {
        fetchRooms();
    }, [propertyId]);

    const fetchRooms = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('rooms')
            .select('*')
            .eq('property_id', propertyId)
            .order('room_number', { ascending: true });
        
        if (!error) setRooms(data || []);
        setIsLoading(false);
    };

    const handleAddRoom = async (e) => {
        e.preventDefault();
        if (!newRoomNumber) return;

        const { error } = await supabase.from('rooms').insert([{
            property_id: propertyId,
            room_number: newRoomNumber,
            status: 'available'
        }]);

        if (error) {
            toast({ title: "Gagal", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Sukses", description: `Kamar ${newRoomNumber} ditambahkan.` });
            setNewRoomNumber('');
            setIsAdding(false);
            fetchRooms();
        }
    };

    const handleSimulatePairLock = async () => {
        // INI ADALAH SIMULASI KONEKSI KE TTLOCK
        // Di aplikasi nyata, ini akan memanggil SDK Bluetooth / API TTLock
        if (!pairingRoom) return;

        const fakeLockData = {
            lockId: "123456",
            lockMac: "XX:XX:XX:XX:XX",
            battery: 100,
            alias: lockAlias || `Lock ${pairingRoom.room_number}`
        };

        const { error } = await supabase.from('rooms').update({
            ttlock_data: fakeLockData,
            is_lock_paired: true
        }).eq('id', pairingRoom.id);

        if (!error) {
            toast({ title: "Smart Lock Terhubung!", description: "Kunci berhasil dipairing ke kamar ini." });
            setPairingRoom(null);
            fetchRooms();
        }
    };

    const handleUnpairLock = async (roomId) => {
        if (!confirm("Hapus koneksi Smart Lock dari kamar ini?")) return;
        
        const { error } = await supabase.from('rooms').update({
            ttlock_data: {},
            is_lock_paired: false
        }).eq('id', roomId);

        if (!error) fetchRooms();
    };

    return (
        <div className="space-y-6">
            {/* Header Mini */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                <AlertCircle className="text-blue-600 shrink-0" size={20} />
                <div className="text-sm text-blue-800">
                    <p className="font-bold">Manajemen Kunci Pintar (TTLock)</p>
                    <p className="text-xs mt-1">Tambahkan kamar dan hubungkan Smart Lock untuk memberikan akses otomatis kepada penyewa.</p>
                </div>
            </div>

            {/* List Kamar */}
            <div className="space-y-3">
                {rooms.map((room) => (
                    <div key={room.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-black text-gray-900">Kamar {room.room_number}</h3>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${room.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {room.status}
                                </span>
                            </div>
                            
                            {/* Status Lock */}
                            <div className="mt-2 flex items-center gap-2">
                                {room.is_lock_paired ? (
                                    <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                                        <Lock size={12} /> Terhubung: {room.ttlock_data?.alias}
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-xs font-semibold text-gray-400">
                                        <Unlock size={12} /> Belum ada Smart Lock
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Action Button */}
                        <div>
                            {room.is_lock_paired ? (
                                <button onClick={() => handleUnpairLock(room.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                                    <Trash2 size={18} />
                                </button>
                            ) : (
                                <button 
                                    onClick={() => { setPairingRoom(room); setLockAlias(`Lock ${room.room_number}`); }}
                                    className="px-3 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
                                >
                                    <Key size={14} /> Hubungkan
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {/* Tombol Tambah Kamar */}
                {isAdding ? (
                    <form onSubmit={handleAddRoom} className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300 animate-in fade-in">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Nomor Kamar</label>
                        <div className="flex gap-2">
                            <input 
                                autoFocus
                                value={newRoomNumber}
                                onChange={(e) => setNewRoomNumber(e.target.value)}
                                placeholder="Contoh: 101"
                                className="flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-black"
                            />
                            <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-2 text-xs font-bold text-gray-500 hover:bg-gray-200 rounded-lg">Batal</button>
                            <button type="submit" className="px-3 py-2 bg-black text-white text-xs font-bold rounded-lg">Simpan</button>
                        </div>
                    </form>
                ) : (
                    <button onClick={() => setIsAdding(true)} className="w-full py-4 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 font-bold text-sm hover:border-black hover:text-black transition flex flex-col items-center gap-1">
                        <PlusCircle size={20} />
                        Tambah Kamar Baru
                    </button>
                )}
            </div>

            {/* MODAL SIMULASI PAIRING TTLOCK */}
            {pairingRoom && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                                <Key className="text-blue-600" size={32} />
                            </div>
                        </div>
                        <h3 className="text-center font-bold text-lg mb-1">Hubungkan TTLock</h3>
                        <p className="text-center text-xs text-gray-500 mb-6">Mencari perangkat bluetooth di dekat Anda...</p>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-gray-500">Nama Perangkat (Alias)</label>
                                <input 
                                    value={lockAlias}
                                    onChange={(e) => setLockAlias(e.target.value)}
                                    className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg border text-xs text-gray-600">
                                <strong>ID Simulasi:</strong> 123456<br/>
                                <strong>Mac:</strong> XX:XX:XX:XX
                            </div>
                            <button onClick={handleSimulatePairLock} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition">
                                Konfirmasi Pairing
                            </button>
                            <button onClick={() => setPairingRoom(null)} className="w-full py-3 text-xs font-bold text-gray-400">
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// =================================================================
// SUB-COMPONENT: PROPERTY EDITOR (FORM LAMA YG DIPERBAIKI)
// =================================================================
const PropertyEditor = ({ property, onSuccess, isNew }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
      ...property,
      pricing_plan: property?.pricing_plan || {
          hourly: [1, 2, 3, 4, 5, 6, 12, 24].map(d => ({ duration: d, price: '', isActive: false })),
          monthly: [1, 2, 3, 4, 5, 6, 12].map(d => ({ duration: d, price: '', isActive: false }))
      }
  });
  const [activeTab, setActiveTab] = useState('hourly'); 
  const [isSaving, setIsSaving] = useState(false);

  // ... (Gunakan LOGIC LAMA untuk handleInputChange, toggleFacility, handlePriceChange) ...
  // Saya singkat di sini supaya tidak terlalu panjang, tapi kamu bisa copy paste logic dari file sebelumnya 
  // untuk handlePriceChange (yg ada formatRupiah), toggleFacility, dll.

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (type, index, field, value) => {
    setFormData(prev => {
      const newPricing = JSON.parse(JSON.stringify(prev.pricing_plan));
      let finalValue = value;
      if (field === 'price') finalValue = value.replace(/\D/g, ''); 
      newPricing[type][index] = { ...newPricing[type][index], [field]: finalValue };
      return { ...prev, pricing_plan: newPricing };
    });
  };

  const saveChanges = async () => {
    setIsSaving(true);
    try {
        const payload = {
            owner_id: user.id,
            name: formData.name,
            address: formData.address,
            description: formData.description,
            facilities: formData.facilities || [],
            pricing_plan: formData.pricing_plan,
            updated_at: new Date()
        };

        if (isNew) {
            const { error } = await supabase.from('properties').insert([payload]);
            if(error) throw error;
        } else {
            const { error } = await supabase.from('properties').update(payload).eq('id', formData.id);
            if(error) throw error;
        }
        onSuccess();
    } catch (err) {
        toast({ title: "Gagal", description: err.message, variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
        <div className="flex justify-end">
             <button 
                onClick={saveChanges} 
                disabled={isSaving} 
                className="bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-800 disabled:opacity-50 shadow-lg"
            >
              {isSaving ? <Loader2 className="animate-spin" size={16}/> : <><Save size={16} /> Simpan Perubahan</>}
            </button>
        </div>

        {/* Form Input Dasar */}
        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Informasi Gedung</h3>
            <div>
                <label className="text-xs font-bold text-gray-600">Nama Gedung</label>
                <input name="name" value={formData.name || ''} onChange={handleInputChange} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm font-semibold"/>
            </div>
            <div>
                <label className="text-xs font-bold text-gray-600">Alamat</label>
                <textarea name="address" value={formData.address || ''} onChange={handleInputChange} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"/>
            </div>
        </section>

        {/* Section Harga (Copy dari kode sebelumnya) */}
        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
             <div className="flex items-center justify-between">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Harga Sewa Standar</h3>
                 <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button onClick={() => setActiveTab('hourly')} className={`px-3 py-1 text-[10px] font-bold uppercase rounded ${activeTab === 'hourly' ? 'bg-white shadow text-black' : 'text-gray-500'}`}>Transit</button>
                    <button onClick={() => setActiveTab('monthly')} className={`px-3 py-1 text-[10px] font-bold uppercase rounded ${activeTab === 'monthly' ? 'bg-white shadow text-black' : 'text-gray-500'}`}>Bulanan</button>
                 </div>
             </div>
             
             <div className="space-y-2">
                {(activeTab === 'hourly' ? formData.pricing_plan.hourly : formData.pricing_plan.monthly).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                         <input 
                            type="checkbox" 
                            checked={item.isActive} 
                            onChange={(e) => handlePriceChange(activeTab, idx, 'isActive', e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                        />
                        <span className="text-xs font-bold w-16">{item.duration} {activeTab === 'hourly' ? 'Jam' : 'Bulan'}</span>
                        {item.isActive && (
                            <div className="flex-1 relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">Rp</span>
                                <input 
                                    type="text" 
                                    inputMode="numeric"
                                    value={formatRupiah(item.price)} 
                                    onChange={(e) => handlePriceChange(activeTab, idx, 'price', e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 text-sm font-bold border rounded-lg"
                                    placeholder="0"
                                />
                            </div>
                        )}
                    </div>
                ))}
             </div>
        </section>
    </div>
  );
};

export default DashboardMitra;
