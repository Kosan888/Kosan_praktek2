import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, Save, PlusCircle, Home, MapPin, 
  Clock, Calendar, Key, Lock, Unlock, Trash2, 
  DoorOpen, Loader2, LayoutGrid, Edit3, X, 
  Wallet, ArrowUpRight, CreditCard, Banknote
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient'; 
import { useAuth } from '@/contexts/SupabaseAuthContext'; 
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

// --- KONFIGURASI OPSI ---
const HOURLY_OPTIONS = [1, 2, 3, 4, 5, 6, 12, 24];
const MONTHLY_OPTIONS = [1, 2, 3, 4, 5, 6, 12];
const FACILITIES_LIST = ["WiFi", "AC", "Kamar Mandi Dalam", "Water Heater", "Kasur", "Lemari", "Meja", "TV", "Cermin"];

// --- HELPER RUPIAH ---
const formatRupiah = (number) => {
  if (!number) return '0';
  return new Intl.NumberFormat('id-ID').format(number);
};

// =================================================================
// COMPONENT UTAMA: DASHBOARD MITRA
// =================================================================
const DashboardMitra = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State Data
  const [loading, setLoading] = useState(true);
  const [myProperties, setMyProperties] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0 });
  
  // State View & Modal
  const [viewMode, setViewMode] = useState('LIST'); // 'LIST', 'EDIT_PROPERTY', 'MANAGE_ROOMS'
  const [selectedProp, setSelectedProp] = useState(null);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  useEffect(() => {
    if(user) {
        fetchInitialData();
    }
  }, [user]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
        // 1. Ambil Properti
        const { data: props } = await supabase
            .from('properties')
            .select('*')
            .eq('owner_id', user.id)
            .order('created_at', { ascending: false });
        setMyProperties(props || []);

        // 2. Ambil/Buat Wallet (Saldo)
        const { data: walletData } = await supabase
            .from('wallets')
            .select('*')
            .eq('owner_id', user.id)
            .single();
        
        if (walletData) {
            setWallet(walletData);
        } else {
            // Jika belum ada, buat wallet baru balance 0
            const { data: newWallet } = await supabase
                .from('wallets')
                .insert([{ owner_id: user.id, balance: 0 }])
                .select()
                .single();
            setWallet(newWallet || { balance: 0 });
        }
    } catch (err) {
        console.error("Error fetching data:", err);
    } finally {
        setLoading(false);
    }
  };

  // --- HANDLER NAVIGASI ---
  const handleBack = () => {
    if (viewMode === 'LIST') navigate('/profile');
    else {
        setViewMode('LIST');
        setSelectedProp(null);
        fetchInitialData(); 
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans text-gray-900">
       
       {/* 1. HEADER & SALDO SECTION */}
       <div className="bg-white sticky top-0 z-20 shadow-sm border-b border-gray-100">
         <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full transition">
                    <ChevronLeft size={24}/>
                </button>
                <div>
                    <h1 className="text-lg font-bold text-gray-900">
                        {viewMode === 'LIST' ? 'Dashboard Mitra' : selectedProp?.name || 'Properti Baru'}
                    </h1>
                    {viewMode === 'LIST' && <p className="text-xs text-gray-500">Kelola Saldo & Properti</p>}
                </div>
            </div>
         </div>

         {/* CARD SALDO (Hanya muncul di halaman utama list) */}
         {viewMode === 'LIST' && !loading && (
             <div className="px-6 pb-6">
                <div className="bg-black text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wider">Total Pendapatan</p>
                            <h2 className="text-2xl font-bold">Rp {formatRupiah(wallet.balance)}</h2>
                        </div>
                        <button 
                            onClick={() => setIsWithdrawOpen(true)}
                            className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-gray-200 transition"
                        >
                            <ArrowUpRight size={16} /> Tarik Dana
                        </button>
                    </div>
                    {/* Hiasan Background */}
                    <div className="absolute -right-4 -bottom-10 opacity-10">
                        <Wallet size={120} />
                    </div>
                </div>
             </div>
         )}
       </div>

       <div className="max-w-3xl mx-auto p-6">
         
         {/* VIEW: LIST PROPERTI */}
         {viewMode === 'LIST' && (
            loading ? <div className="text-center py-10"><Loader2 className="animate-spin mx-auto"/></div> :
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-gray-700 text-sm uppercase">Daftar Properti Saya</h3>
                    <button 
                        onClick={() => { setSelectedProp({ isNew: true }); setViewMode('EDIT_PROPERTY'); }}
                        className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"
                    >
                        <PlusCircle size={14}/> Tambah Baru
                    </button>
                </div>

                {myProperties.map((prop) => (
                    <div key={prop.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
                        <div className="flex gap-4">
                            <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                <Home className="text-gray-400" size={24}/>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 truncate">{prop.name}</h3>
                                <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
                                    <MapPin size={10} className="shrink-0"/>
                                    <p className="truncate">{prop.address || 'Alamat belum diatur'}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => { setSelectedProp(prop); setViewMode('EDIT_PROPERTY'); }}
                                        className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-xs font-semibold transition"
                                    >
                                        Edit Alamat/Info
                                    </button>
                                    <button 
                                        onClick={() => { setSelectedProp(prop); setViewMode('MANAGE_ROOMS'); }}
                                        className="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-semibold flex items-center gap-2 transition shadow-sm"
                                    >
                                        <DoorOpen size={14}/> Kelola Kamar & Kunci
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                
                {myProperties.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
                        <p className="text-gray-400 text-sm">Belum ada properti.</p>
                    </div>
                )}
            </div>
         )}

         {/* VIEW: EDIT PROPERTY (ALAMAT & NAMA) */}
         {viewMode === 'EDIT_PROPERTY' && (
            <GenericEditor 
                initialData={selectedProp} 
                type="property"
                onSuccess={() => {
                    toast({title: "Berhasil", description: "Data gedung disimpan."});
                    handleBack();
                }} 
            />
         )}

         {/* VIEW: MANAGE ROOMS (HARGA, TTLOCK, DURASI PER PINTU) */}
         {viewMode === 'MANAGE_ROOMS' && (
            <RoomManager propertyId={selectedProp.id} />
         )}

         {/* MODAL WITHDRAW */}
         {isWithdrawOpen && (
             <WithdrawModal 
                balance={wallet.balance} 
                userId={user.id} 
                onClose={() => setIsWithdrawOpen(false)} 
             />
         )}
       </div>
    </div>
  );
};

// =================================================================
// SUB-COMPONENT: ROOM MANAGER (LIST KAMAR)
// =================================================================
const RoomManager = ({ propertyId }) => {
    const [rooms, setRooms] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newRoomNumber, setNewRoomNumber] = useState('');
    const [editingRoom, setEditingRoom] = useState(null);

    useEffect(() => {
        fetchRooms();
    }, [propertyId]);

    const fetchRooms = async () => {
        const { data } = await supabase
            .from('rooms')
            .select('*')
            .eq('property_id', propertyId)
            .order('room_number', { ascending: true });
        setRooms(data || []);
    };

    const handleAddRoom = async (e) => {
        e.preventDefault();
        if (!newRoomNumber) return;

        const { error } = await supabase.from('rooms').insert([{
            property_id: propertyId,
            room_number: newRoomNumber,
            status: 'available',
            // Default kosong, nanti diedit per pintu
            pricing_plan: { hourly: [], monthly: [] },
            facilities: [],
            ttlock_id: ''
        }]);

        if (!error) {
            toast({ title: "Sukses", description: "Kamar ditambahkan. Silakan atur harga & kunci." });
            setNewRoomNumber('');
            setIsAdding(false);
            fetchRooms();
        }
    };

    // JIKA SEDANG EDIT KAMAR SPESIFIK
    if (editingRoom) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                    <button onClick={() => setEditingRoom(null)} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft/></button>
                    <div>
                        <h2 className="font-bold text-lg">Edit Kamar {editingRoom.room_number}</h2>
                        <p className="text-xs text-gray-500">Atur TTLock, Fasilitas & Tarif Pintu Ini</p>
                    </div>
                </div>
                
                {/* PANGGIL EDITOR GENERIC TAPI MODE ROOM */}
                <GenericEditor 
                    initialData={editingRoom} 
                    type="room"
                    onSuccess={() => {
                        toast({title: "Tersimpan", description: `Pengaturan Kamar ${editingRoom.room_number} berhasil diupdate.`});
                        setEditingRoom(null);
                        fetchRooms();
                    }}
                />
            </div>
        );
    }

    // LIST KAMAR
    return (
        <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
                <p className="font-bold flex items-center gap-2"><Key size={16}/> Info Fitur</p>
                <p className="text-xs mt-1">Setiap kamar memiliki pengaturan ID TTLock, Harga, dan Fasilitas yang berbeda-beda. Klik tombol <b>Edit</b> untuk mengatur.</p>
            </div>

            <div className="space-y-3">
                {rooms.map((room) => (
                    <div key={room.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="bg-gray-100 p-2 rounded-lg">
                                    <DoorOpen className="text-gray-600" size={20}/>
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900 text-lg">No. {room.room_number}</h3>
                                    {/* Indikator Status TTLock */}
                                    <div className="flex items-center gap-2 mt-1">
                                        {room.ttlock_id ? (
                                            <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded flex items-center gap-1 font-bold border border-green-100">
                                                <Key size={10}/> ID: {room.ttlock_id}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] bg-red-50 text-red-700 px-2 py-0.5 rounded flex items-center gap-1 font-bold border border-red-100">
                                                <Unlock size={10}/> Belum ada Kunci
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => setEditingRoom(room)}
                                className="px-4 py-2 bg-black text-white rounded-lg text-xs font-bold hover:bg-gray-800 flex items-center gap-2 shadow-sm"
                            >
                                <Edit3 size={14}/> Atur Pintu
                            </button>
                        </div>
                        
                        {/* Ringkasan Fasilitas & Harga */}
                        <div className="pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                             {/* Tampilkan max 3 fasilitas sebagai preview */}
                             {room.facilities?.slice(0, 3).map(f => (
                                 <span key={f} className="text-[10px] bg-gray-50 border border-gray-200 text-gray-600 px-2 py-0.5 rounded">{f}</span>
                             ))}
                             {(room.facilities?.length || 0) > 3 && <span className="text-[10px] text-gray-400">+{room.facilities.length - 3} lainnya</span>}
                        </div>
                    </div>
                ))}

                {isAdding ? (
                    <form onSubmit={handleAddRoom} className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
                        <label className="text-xs font-bold text-gray-500 mb-1 block">Nomor Kamar Baru</label>
                        <div className="flex gap-2">
                            <input 
                                autoFocus
                                value={newRoomNumber}
                                onChange={(e) => setNewRoomNumber(e.target.value)}
                                placeholder="Cth: 205"
                                className="flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-black"
                            />
                            <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-2 text-xs font-bold text-gray-500 hover:bg-gray-200 rounded-lg">Batal</button>
                            <button type="submit" className="px-3 py-2 bg-black text-white text-xs font-bold rounded-lg">Simpan</button>
                        </div>
                    </form>
                ) : (
                    <button onClick={() => setIsAdding(true)} className="w-full py-4 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 font-bold text-sm hover:border-black hover:text-black transition flex flex-col items-center gap-1">
                        <PlusCircle size={20} /> Tambah Kamar
                    </button>
                )}
            </div>
        </div>
    );
};

// =================================================================
// SUB-COMPONENT: EDITOR LENGKAP (PROPERTY & ROOM)
// =================================================================
const GenericEditor = ({ initialData, type, onSuccess }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('hourly'); 
  const [isSaving, setIsSaving] = useState(false);
  
  // Initialize State
  const [formData, setFormData] = useState(() => {
    // Normalisasi struktur harga
    const defaultPricing = {
        hourly: HOURLY_OPTIONS.map(d => ({ duration: d, price: '', isActive: false })),
        monthly: MONTHLY_OPTIONS.map(d => ({ duration: d, price: '', isActive: false }))
    };
    const existingPricing = initialData?.pricing_plan || {};
    const mergePricing = (def, exist) => !exist ? def : def.map(d => {
        const found = exist.find(e => e.duration === d.duration);
        return found ? { ...d, ...found } : d;
    });

    return {
        ...initialData,
        ttlock_id: initialData?.ttlock_id || '',
        facilities: initialData?.facilities || [],
        pricing_plan: {
            hourly: mergePricing(defaultPricing.hourly, existingPricing.hourly),
            monthly: mergePricing(defaultPricing.monthly, existingPricing.monthly),
        }
    };
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleFacility = (fac) => {
    setFormData(prev => {
        const current = prev.facilities || [];
        const updated = current.includes(fac) ? current.filter(f => f !== fac) : [...current, fac];
        return { ...prev, facilities: updated };
    });
  };

  const handlePriceChange = (planType, index, field, value) => {
    setFormData(prev => {
      const newPricing = JSON.parse(JSON.stringify(prev.pricing_plan));
      let finalValue = value;
      if (field === 'price') finalValue = value.replace(/\D/g, ''); 
      newPricing[planType][index] = { ...newPricing[planType][index], [field]: finalValue };
      return { ...prev, pricing_plan: newPricing };
    });
  };

  const saveChanges = async () => {
    setIsSaving(true);
    try {
        const payload = { updated_at: new Date() };

        if (type === 'property') {
            payload.name = formData.name;
            payload.address = formData.address;
            payload.description = formData.description;
            payload.owner_id = user.id;

            if (initialData.isNew) await supabase.from('properties').insert([payload]);
            else await supabase.from('properties').update(payload).eq('id', formData.id);
        } 
        else if (type === 'room') {
            payload.ttlock_id = formData.ttlock_id;
            payload.facilities = formData.facilities;
            payload.pricing_plan = formData.pricing_plan;
            await supabase.from('rooms').update(payload).eq('id', formData.id);
        }
        onSuccess();
    } catch (err) {
        toast({ title: "Gagal", description: err.message, variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
        
        {/* === FORM KHUSUS PROPERTI (ALAMAT) === */}
        {type === 'property' && (
            <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lokasi & Info</h3>
                <div>
                    <label className="text-xs font-bold text-gray-600">Nama Gedung</label>
                    <input name="name" value={formData.name || ''} onChange={handleInputChange} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm font-semibold"/>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-600">Alamat Lengkap</label>
                    <textarea name="address" value={formData.address || ''} onChange={handleInputChange} rows={3} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"/>
                </div>
            </section>
        )}

        {/* === FORM KHUSUS KAMAR (TTLOCK) === */}
        {type === 'room' && (
            <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Key size={14}/> Konfigurasi Smart Lock
                </h3>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="text-xs font-bold text-gray-700 block mb-1">ID TTLock (Lock Alias / Code)</label>
                    <div className="flex gap-2">
                        <input 
                            name="ttlock_id"
                            value={formData.ttlock_id}
                            onChange={handleInputChange}
                            placeholder="Contoh: LOCK-101-XDF"
                            className="flex-1 border rounded-lg px-3 py-2 text-sm font-mono tracking-wide"
                        />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2">
                        *Masukkan ID unik dari aplikasi TTLock Anda agar sistem bisa membuat kunci otomatis saat ada pesanan.
                    </p>
                </div>
            </section>
        )}

        {/* === FASILITAS (BISA UNTUK KAMAR) === */}
        {type === 'room' && (
            <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <LayoutGrid size={14}/> Fasilitas Pintu Ini
                </h3>
                <div className="flex flex-wrap gap-2">
                    {FACILITIES_LIST.map((fac) => {
                        const isSelected = formData.facilities?.includes(fac);
                        return (
                            <button 
                                key={fac} 
                                onClick={() => toggleFacility(fac)} 
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                    isSelected ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                }`}
                            >
                                {fac}
                            </button>
                        );
                    })}
                </div>
            </section>
        )}

        {/* === HARGA (BISA UNTUK KAMAR) === */}
        {type === 'room' && (
            <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tarif Pintu Ini</h3>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button onClick={() => setActiveTab('hourly')} className={`px-3 py-1 text-[10px] font-bold uppercase rounded ${activeTab === 'hourly' ? 'bg-white shadow text-black' : 'text-gray-500'}`}>Transit</button>
                        <button onClick={() => setActiveTab('monthly')} className={`px-3 py-1 text-[10px] font-bold uppercase rounded ${activeTab === 'monthly' ? 'bg-white shadow text-black' : 'text-gray-500'}`}>Bulanan</button>
                    </div>
                </div>
                
                <div className="space-y-2">
                    {(activeTab === 'hourly' ? formData.pricing_plan.hourly : formData.pricing_plan.monthly).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <div className="flex items-center min-w-[100px]">
                                <input 
                                    type="checkbox" 
                                    checked={item.isActive} 
                                    onChange={(e) => handlePriceChange(activeTab, idx, 'isActive', e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black accent-black mr-2"
                                />
                                <span className="text-xs font-bold w-16 text-gray-700">{item.duration} {activeTab === 'hourly' ? 'Jam' : 'Bln'}</span>
                            </div>
                            
                            {item.isActive ? (
                                <div className="flex-1 relative animate-in fade-in slide-in-from-left-2">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">Rp</span>
                                    <input 
                                        type="text" 
                                        inputMode="numeric"
                                        value={formatRupiah(item.price)} 
                                        onChange={(e) => handlePriceChange(activeTab, idx, 'price', e.target.value)}
                                        className="w-full pl-8 pr-3 py-1.5 text-sm font-bold border rounded-lg focus:ring-1 focus:ring-black outline-none"
                                        placeholder="0"
                                    />
                                </div>
                            ) : (
                                <div className="flex-1 text-xs text-gray-300 italic pl-2 border-b border-dashed border-gray-100 py-2">Tidak tersedia</div>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        )}

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex justify-end z-20">
             <button 
                onClick={saveChanges} 
                disabled={isSaving} 
                className="bg-black text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-800 disabled:opacity-50 shadow-lg w-full justify-center md:w-auto"
            >
              {isSaving ? <Loader2 className="animate-spin" size={16}/> : <><Save size={16} /> Simpan Perubahan</>}
            </button>
        </div>
    </div>
  );
};

// =================================================================
// SUB-COMPONENT: MODAL WITHDRAW
// =================================================================
const WithdrawModal = ({ balance, userId, onClose }) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const handleWithdraw = async (e) => {
        e.preventDefault();
        const numAmount = parseInt(amount.replace(/\D/g, ''));
        
        if (numAmount > balance) {
            toast({ title: "Gagal", description: "Saldo tidak mencukupi.", variant: "destructive" });
            return;
        }
        if (numAmount < 10000) {
            toast({ title: "Gagal", description: "Minimal penarikan Rp 10.000.", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            // 1. Catat Request
            const { error } = await supabase.from('payout_requests').insert([{
                owner_id: userId,
                amount: numAmount,
                status: 'pending'
            }]);
            
            if (error) throw error;
            
            // 2. Kurangi Saldo (Opsional: Biasanya saldo berkurang saat admin approve, tapi untuk UX kita kurangi dulu tampilan visualnya saja atau gunakan trigger database)
            // Di sini kita anggap sukses request dulu.
            
            toast({ title: "Permintaan Terkirim", description: "Dana akan diproses dalam 1x24 jam." });
            onClose();
            // Reload halaman untuk refresh saldo (idealnya pakai state lift up)
            window.location.reload(); 
        } catch (err) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl slide-in-from-bottom-10">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg">Tarik Dana</h3>
                    <button onClick={onClose}><X size={20}/></button>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl mb-6">
                    <p className="text-xs text-gray-500 mb-1">Saldo Tersedia</p>
                    <p className="text-xl font-bold">Rp {formatRupiah(balance)}</p>
                </div>

                <form onSubmit={handleWithdraw} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-600 block mb-2">Jumlah Penarikan</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rp</span>
                            <input 
                                value={amount}
                                onChange={(e) => setAmount(formatRupiah(e.target.value.replace(/\D/g, '')))}
                                className="w-full pl-10 pr-4 py-3 bg-white border rounded-xl font-bold text-lg focus:ring-2 focus:ring-black outline-none"
                                placeholder="0"
                                inputMode="numeric"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 border rounded-xl bg-gray-50">
                        <Banknote size={20} className="text-green-600"/>
                        <div className="text-xs text-gray-600">
                            <p className="font-bold">Transfer Bank</p>
                            <p>Proses 1-2 Hari Kerja</p>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-black text-white py-3.5 rounded-xl font-bold text-sm hover:bg-gray-800 disabled:opacity-50 flex justify-center"
                    >
                        {loading ? <Loader2 className="animate-spin"/> : "Konfirmasi Penarikan"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DashboardMitra;
