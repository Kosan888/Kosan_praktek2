import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Save, Image as ImageIcon, Check, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

// --- KONFIGURASI DURASI (Sesuai Request) ---
const HOURLY_OPTIONS = [1, 2, 3, 4, 5, 6, 12, 24];
const MONTHLY_OPTIONS = [1, 2, 3, 4, 5, 6, 12];

const INITIAL_FORM_STATE = {
  id: null,
  name: '',
  address: '',
  description: '',
  facilities: [],
  photos: [],
  // Struktur harga dinamis
  prices: {
    hourly: HOURLY_OPTIONS.map(d => ({ duration: d, price: '', isActive: false })),
    monthly: MONTHLY_OPTIONS.map(d => ({ duration: d, price: '', isActive: false })),
  }
};

const FACILITIES_LIST = ["WiFi", "AC", "Kamar Mandi Dalam", "Parkir Motor", "Parkir Mobil", "Kasur", "Lemari", "Meja Belajar"];

export default function DashboardMitra() {
  const [properties, setProperties] = useState([]); // Nanti ini di-fetch dari Supabase
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [activeTab, setActiveTab] = useState('hourly'); // 'hourly' or 'monthly'

  // --- HANDLERS ---

  const handleOpenModal = (property = null) => {
    if (property) {
      setFormData(property); // Mode Edit
    } else {
      setFormData(INITIAL_FORM_STATE); // Mode Tambah Baru
    }
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFacilityToggle = (facility) => {
    setFormData(prev => {
      const exists = prev.facilities.includes(facility);
      return {
        ...prev,
        facilities: exists 
          ? prev.facilities.filter(f => f !== facility)
          : [...prev.facilities, facility]
      };
    });
  };

  // Logic Khusus untuk Update Harga & Toggle Aktif/Nonaktif
  const handlePriceChange = (type, index, field, value) => {
    setFormData(prev => {
      const newPrices = { ...prev.prices };
      const list = [...newPrices[type]];
      list[index] = { ...list[index], [field]: value };
      newPrices[type] = list;
      return { ...prev, prices: newPrices };
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Di sini nanti logika save ke SUPABASE
    // Contoh simulasi lokal:
    if (formData.id) {
      setProperties(prev => prev.map(p => p.id === formData.id ? formData : p));
    } else {
      setProperties(prev => [...prev, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (confirm('Yakin ingin menghapus properti ini?')) {
      setProperties(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Dashboard */}
      <div className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Dashboard Mitra</h1>
          <p className="text-sm text-gray-500">Kelola unit & harga sewa</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-800 transition"
        >
          <Plus size={16} /> Tambah Properti
        </button>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        {/* EMPTY STATE (Jika belum ada properti) */}
        {properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Home className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Belum Ada Properti</h3>
            <p className="text-gray-500 mb-6 text-center max-w-sm">
              Mulai hasilkan pendapatan dengan mendaftarkan kos atau apartemen Anda sekarang.
            </p>
            <button 
              onClick={() => handleOpenModal()}
              className="bg-black text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
            >
              + Tambah Properti Pertama
            </button>
          </div>
        ) : (
          /* LIST PROPERTI (Grid) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((prop) => (
              <div key={prop.id} className="bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition">
                <div className="h-48 bg-gray-200 flex items-center justify-center relative">
                   {prop.photos.length > 0 ? (
                     <img src={prop.photos[0]} alt={prop.name} className="w-full h-full object-cover" />
                   ) : (
                     <ImageIcon className="text-gray-400" size={48} />
                   )}
                   <div className="absolute top-2 right-2 flex gap-1">
                     <button onClick={() => handleOpenModal(prop)} className="bg-white/90 p-2 rounded-full hover:text-blue-600"><Edit size={16}/></button>
                     <button onClick={() => handleDelete(prop.id)} className="bg-white/90 p-2 rounded-full hover:text-red-600"><Trash2 size={16}/></button>
                   </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg">{prop.name}</h3>
                  <p className="text-gray-500 text-sm truncate">{prop.address}</p>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    {/* Tampilkan badge harga aktif */}
                    {prop.prices.hourly.some(p => p.isActive) && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Transit Tersedia</span>}
                    {prop.prices.monthly.some(p => p.isActive) && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Bulanan Tersedia</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODAL FORM (ADD / EDIT) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-lg font-bold">{formData.id ? 'Edit Properti' : 'Tambah Properti Baru'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-8">
              {/* 1. INFORMASI DASAR */}
              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Informasi Dasar</h3>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nama Kos / Apartemen</label>
                    <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-black outline-none" placeholder="Contoh: Kosan Haurgeulis Indah" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Alamat Lengkap</label>
                    <textarea required name="address" value={formData.address} onChange={handleInputChange} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-black outline-none" placeholder="Alamat lengkap properti..." rows="2" />
                  </div>
                </div>
              </section>

              {/* 2. FASILITAS */}
              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Fasilitas</h3>
                <div className="flex flex-wrap gap-2">
                  {FACILITIES_LIST.map(fac => (
                    <button
                      key={fac}
                      type="button"
                      onClick={() => handleFacilityToggle(fac)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition ${formData.facilities.includes(fac) ? 'bg-black text-white border-black' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                      {fac}
                    </button>
                  ))}
                </div>
              </section>

              {/* 3. SETTING HARGA (Sesuai Request) */}
              <section className="space-y-4">
                <div className="flex justify-between items-end">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Tarif & Durasi</h3>
                  {/* Tab Switcher */}
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button type="button" onClick={() => setActiveTab('hourly')} className={`px-4 py-1.5 text-xs font-medium rounded-md transition ${activeTab === 'hourly' ? 'bg-white shadow text-black' : 'text-gray-500'}`}>Jam (Transit)</button>
                    <button type="button" onClick={() => setActiveTab('monthly')} className={`px-4 py-1.5 text-xs font-medium rounded-md transition ${activeTab === 'monthly' ? 'bg-white shadow text-black' : 'text-gray-500'}`}>Bulanan</button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border">
                  {/* RENDER LIST HARGA BERDASARKAN TAB */}
                  {(activeTab === 'hourly' ? formData.prices.hourly : formData.prices.monthly).map((priceItem, idx) => (
                    <div key={idx} className="flex items-center gap-4 mb-3 last:mb-0">
                      
                      {/* Toggle Switch */}
                      <label className="flex items-center cursor-pointer min-w-[120px]">
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            className="sr-only" 
                            checked={priceItem.isActive}
                            onChange={(e) => handlePriceChange(activeTab, idx, 'isActive', e.target.checked)}
                          />
                          <div className={`block w-10 h-6 rounded-full transition ${priceItem.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${priceItem.isActive ? 'translate-x-4' : ''}`}></div>
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-700">
                          {priceItem.duration} {activeTab === 'hourly' ? 'Jam' : 'Bulan'}
                        </span>
                      </label>

                      {/* Input Harga (Hanya muncul jika toggle ON) */}
                      {priceItem.isActive && (
                        <div className="flex-1 relative animate-in fade-in slide-in-from-left-2 duration-200">
                          <span className="absolute left-3 top-2 text-gray-500 text-sm">Rp</span>
                          <input 
                            type="number" 
                            placeholder="0"
                            value={priceItem.price}
                            onChange={(e) => handlePriceChange(activeTab, idx, 'price', e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 text-sm border rounded-md focus:ring-1 focus:ring-black outline-none"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* FOOTER MODAL */}
              <div className="pt-4 border-t flex justify-end gap-3 sticky bottom-0 bg-white pb-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg border text-sm font-medium hover:bg-gray-50">Batal</button>
                <button type="submit" className="px-5 py-2.5 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 flex items-center gap-2">
                  <Save size={16} /> Simpan Properti
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
