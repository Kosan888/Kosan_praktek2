import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Save, 
  Check, 
  LayoutGrid, 
  Edit, 
  Loader2, 
  PlusCircle, 
  Home, 
  MapPin, 
  Clock, 
  Calendar 
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient'; 
import { useAuth } from '@/contexts/SupabaseAuthContext'; 
import { toast } from '@/components/ui/use-toast';
import { useNavigate, Link } from 'react-router-dom';

// --- KONFIGURASI DURASI (Tetap Sesuai Request Awal) ---
const HOURLY_OPTIONS = [1, 2, 3, 4, 5, 6, 12, 24];
const MONTHLY_OPTIONS = [1, 2, 3, 4, 5, 6, 12];

const FACILITIES_LIST = ["WiFi", "AC", "Kamar Mandi Dalam", "Parkir Motor", "Parkir Mobil", "Kasur", "Lemari", "Meja Belajar"];

// --- KOMPONEN UTAMA DASHBOARD ---
const DashboardMitra = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [myProperties, setMyProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null); // Mode Edit Property

  // Fetch Data Properti Milik Mitra
  useEffect(() => {
    const fetchMyProperties = async () => {
      try {
        if(!user) return;
        
        // Ambil data properti user
        const { data: props, error } = await supabase
            .from('properties')
            .select('*')
            .eq('owner_id', user.id)
            .order('created_at', { ascending: false });
            
        if (error) throw error;

        // Normalisasi data harga jika masih kosong/format lama
        const normalizedProps = props?.map(p => ({
            ...p,
            facilities: p.facilities || [],
            // Pastikan struktur pricing_plan ada
            pricing_plan: p.pricing_plan || {
                hourly: HOURLY_OPTIONS.map(d => ({ duration: d, price: '', isActive: false })),
                monthly: MONTHLY_OPTIONS.map(d => ({ duration: d, price: '', isActive: false })),
            }
        })) || [];

        setMyProperties(normalizedProps);
      } catch (err) {
        console.error(err);
        toast({ title: "Gagal Memuat Data", description: "Periksa koneksi internet Anda.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMyProperties();
  }, [user]);

  // Jika user memilih properti untuk diedit, tampilkan Editor
  if (selectedProperty) {
    return (
        <PropertyEditor 
            property={selectedProperty} 
            onBack={() => setSelectedProperty(null)}
            onSaveSuccess={(updatedProp) => {
                // Update state lokal setelah save berhasil
                setMyProperties(prev => prev.map(p => p.id === updatedProp.id ? updatedProp : p));
                setSelectedProperty(null);
            }}
            isNew={selectedProperty.isNew}
        />
    );
  }

  // --- TAMPILAN DASHBOARD UTAMA (LIST PROPERTI) ---
  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans text-gray-900">
       
       {/* Header */}
       <div className="bg-white sticky top-0 z-10 border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
         <div className="flex items-center gap-3">
            <button onClick={() => navigate('/profile')} className="p-2 hover:bg-gray-100 rounded-full transition">
                <ChevronLeft size={24}/>
            </button>
            <div>
                <h1 className="text-lg font-bold text-gray-900">Dashboard Mitra</h1>
                <p className="text-xs text-gray-500">Kelola Unit & Harga Sewa</p>
            </div>
         </div>
         <button 
            onClick={() => setSelectedProperty({ 
                isNew: true, 
                name: '', 
                address: '', 
                facilities: [], 
                pricing_plan: {
                    hourly: HOURLY_OPTIONS.map(d => ({ duration: d, price: '', isActive: false })),
                    monthly: MONTHLY_OPTIONS.map(d => ({ duration: d, price: '', isActive: false })),
                }
            })}
            className="bg-black text-white px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 hover:bg-gray-800 transition"
         >
            <PlusCircle size={16} /> Tambah
         </button>
       </div>

       {/* Konten List */}
       <div className="max-w-3xl mx-auto p-6">
         {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-gray-400" size={32}/>
                <p className="text-xs font-medium text-gray-400">Memuat Data Properti...</p>
            </div>
         ) : myProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myProperties.map((prop) => (
                    <div 
                        key={prop.id} 
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition cursor-pointer group"
                        onClick={() => setSelectedProperty(prop)}
                    >
                        {/* Placeholder Gambar (Bisa diganti Real Image nanti) */}
                        <div className="h-32 bg-gray-100 flex items-center justify-center relative">
                            <Home className="text-gray-300" size={32} />
                            <div className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm">
                                <Edit size={14} className="text-gray-700"/>
                            </div>
                        </div>
                        
                        <div className="p-4">
                            <h3 className="font-bold text-gray-900 truncate">{prop.name}</h3>
                            <div className="flex items-start gap-1.5 mt-1 mb-3">
                                <MapPin size={12} className="text-gray-400 mt-0.5 flex-shrink-0"/>
                                <p className="text-xs text-gray-500 line-clamp-2">{prop.address}</p>
                            </div>
                            
                            {/* Tags Fasilitas & Harga */}
                            <div className="flex flex-wrap gap-1.5">
                                {prop.pricing_plan?.hourly?.some(p => p.isActive) && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1">
                                        <Clock size={10}/> Transit
                                    </span>
                                )}
                                {prop.pricing_plan?.monthly?.some(p => p.isActive) && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-green-50 text-green-600 border border-green-100 flex items-center gap-1">
                                        <Calendar size={10}/> Bulanan
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
         ) : (
             <div className="text-center py-16 px-6 bg-white rounded-2xl border border-dashed border-gray-300">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <PlusCircle className="text-gray-400" size={24} />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Belum ada properti</h3>
                <p className="text-xs text-gray-500 mt-1 mb-4">Mulai sewakan kos/apartemen Anda sekarang.</p>
                <button 
                    onClick={() => setSelectedProperty({ 
                        isNew: true, 
                        name: '', 
                        address: '', 
                        facilities: [], 
                        pricing_plan: {
                            hourly: HOURLY_OPTIONS.map(d => ({ duration: d, price: '', isActive: false })),
                            monthly: MONTHLY_OPTIONS.map(d => ({ duration: d, price: '', isActive: false })),
                        }
                    })}
                    className="text-xs font-semibold text-black underline hover:text-gray-600"
                >
                    Tambah Properti Pertama
                </button>
             </div>
         )}
       </div>
    </div>
  );
};

// --- SUB-COMPONENT: EDITOR PROPERTY (Form Input & Harga) ---
const PropertyEditor = ({ property, onBack, onSaveSuccess, isNew }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(property);
  const [activeTab, setActiveTab] = useState('hourly'); 
  const [isSaving, setIsSaving] = useState(false);

  // Handle Perubahan Text Biasa
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Toggle Fasilitas
  const toggleFacility = (fac) => {
    setFormData(prev => {
        const current = prev.facilities || [];
        const updated = current.includes(fac) 
            ? current.filter(f => f !== fac) 
            : [...current, fac];
        return { ...prev, facilities: updated };
    });
  };

  // Handle Update Harga & Toggle Aktif/Nonaktif
  const handlePriceChange = (type, index, field, value) => {
    setFormData(prev => {
      // Deep copy pricing plan
      const newPricing = JSON.parse(JSON.stringify(prev.pricing_plan || { hourly: [], monthly: [] }));
      
      // Pastikan array tujuan ada
      if (!newPricing[type]) newPricing[type] = [];
      
      // Update item spesifik
      newPricing[type][index] = { 
          ...newPricing[type][index], 
          [field]: value 
      };
      
      return { ...prev, pricing_plan: newPricing };
    });
  };

  // Simpan ke Supabase
  const saveChanges = async () => {
    if(!formData.name || !formData.address) {
        toast({ title: "Data Tidak Lengkap", description: "Nama dan Alamat wajib diisi.", variant: "destructive" });
        return;
    }

    setIsSaving(true);
    try {
      let result;
      
      if (isNew) {
        // INSERT Baru
        const { data, error } = await supabase.from('properties').insert([{
            owner_id: user.id,
            name: formData.name,
            address: formData.address,
            description: formData.description,
            facilities: formData.facilities,
            pricing_plan: formData.pricing_plan
        }]).select().single();
        if(error) throw error;
        result = data;
        toast({ title: "Berhasil", description: "Properti baru berhasil ditambahkan." });
      } else {
        // UPDATE Existing
        const { data, error } = await supabase.from('properties').update({
            name: formData.name,
            address: formData.address,
            description: formData.description,
            facilities: formData.facilities,
            pricing_plan: formData.pricing_plan,
            updated_at: new Date()
        }).eq('id', formData.id).select().single();
        if(error) throw error;
        result = data;
        toast({ title: "Tersimpan", description: "Perubahan berhasil disimpan." });
      }

      onSaveSuccess(result);
      
    } catch (err) {
      console.error(err);
      toast({ title: "Gagal Menyimpan", description: err.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20 font-sans text-gray-900">
      {/* Navbar Editor */}
      <div className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition"><ChevronLeft size={20} /></button>
          <div>
            <h1 className="font-bold text-sm text-gray-900">{isNew ? 'Tambah Properti' : 'Edit Properti'}</h1>
          </div>
        </div>
        <button 
            onClick={saveChanges} 
            disabled={isSaving} 
            className="bg-black text-white px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-gray-800 disabled:opacity-50 transition"
        >
          {isSaving ? <Loader2 className="animate-spin" size={14}/> : <><Save size={14} /> Simpan</>}
        </button>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-8">
        
        {/* SECTION 1: INFO UTAMA */}
        <section className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Informasi Dasar</h3>
            <div className="space-y-3">
                <div>
                    <label className="block text-xs font-medium mb-1.5 text-gray-600">Nama Kos / Apartemen</label>
                    <input 
                        name="name" 
                        value={formData.name} 
                        onChange={handleInputChange} 
                        placeholder="Contoh: Kost Executive Kebon Jeruk"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-1 focus:ring-black focus:border-black outline-none transition"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium mb-1.5 text-gray-600">Alamat Lengkap</label>
                    <textarea 
                        name="address" 
                        value={formData.address} 
                        onChange={handleInputChange} 
                        placeholder="Masukkan alamat lengkap..."
                        rows={2}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-1 focus:ring-black focus:border-black outline-none transition resize-none"
                    />
                </div>
            </div>
        </section>

        {/* SECTION 2: FASILITAS */}
        <section className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <LayoutGrid size={14}/> Fasilitas
            </h3>
            <div className="flex flex-wrap gap-2">
                {FACILITIES_LIST.map((fac) => {
                    const isSelected = formData.facilities?.includes(fac);
                    return (
                        <button 
                            key={fac} 
                            onClick={() => toggleFacility(fac)} 
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                isSelected 
                                ? 'bg-black text-white border-black' 
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                            }`}
                        >
                            {fac}
                        </button>
                    );
                })}
            </div>
        </section>

        {/* SECTION 3: HARGA & DURASI (CORE FEATURE) */}
        <section className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Atur Harga Sewa</h3>
             
             {/* Tab Switcher */}
             <div className="flex bg-white p-1 rounded-lg border shadow-sm">
                <button 
                    onClick={() => setActiveTab('hourly')} 
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition ${
                        activeTab === 'hourly' ? 'bg-gray-100 text-black' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    Transit
                </button>
                <div className="w-px bg-gray-200 my-1 mx-1"></div>
                <button 
                    onClick={() => setActiveTab('monthly')} 
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition ${
                        activeTab === 'monthly' ? 'bg-gray-100 text-black' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    Bulanan
                </button>
             </div>
          </div>

          <div className="space-y-3">
            {/* List Harga Berdasarkan Tab */}
            {(activeTab === 'hourly' ? formData.pricing_plan.hourly : formData.pricing_plan.monthly).map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    
                    {/* Toggle Switch */}
                    <div className="flex items-center min-w-[100px]">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={item.isActive}
                                onChange={(e) => handlePriceChange(activeTab, idx, 'isActive', e.target.checked)}
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                        <span className="ml-3 text-xs font-bold text-gray-700 w-12">
                            {item.duration} {activeTab === 'hourly' ? 'Jam' : 'Bln'}
                        </span>
                    </div>

                    {/* Input Harga (Hanya muncul jika aktif) */}
                    {item.isActive ? (
                        <div className="flex-1 relative animate-in fade-in slide-in-from-left-2 duration-300">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">Rp</span>
                            <input
                                type="number"
                                value={item.price}
                                onChange={(e) => handlePriceChange(activeTab, idx, 'price', e.target.value)}
                                className="w-full pl-8 pr-3 py-2 text-sm font-semibold border-none bg-gray-50 rounded-lg focus:ring-1 focus:ring-black placeholder:text-gray-300"
                                placeholder="0"
                            />
                        </div>
                    ) : (
                        <div className="flex-1 text-xs text-gray-300 italic pl-2">Tidak aktif</div>
                    )}
                </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default DashboardMitra;
