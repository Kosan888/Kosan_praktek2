import React, { useState } from 'react';
import { Clock, Calendar, Check } from 'lucide-react';

const DurationStep = ({ bookingData, updateBookingData }) => {
  // Default tab aktif: Jika user sebelumnya pilih bulanan, set ke 'monthly', jika tidak set 'hourly'
  const [activeTab, setActiveTab] = useState(
    bookingData.package === 'monthly' ? 'monthly' : 'hourly'
  );

  // DAFTAR OPSI JAM (Sesuai Permintaan: 1, 2, 3, 4, 5, 6, 12, 24 Jam)
  const hourlyOptions = [
    { value: 1, label: '1 Jam', priceMultiplier: 1 }, // priceMultiplier nanti untuk logika harga
    { value: 2, label: '2 Jam', priceMultiplier: 1.8 },
    { value: 3, label: '3 Jam', priceMultiplier: 2.5 },
    { value: 4, label: '4 Jam', priceMultiplier: 3.2 },
    { value: 5, label: '5 Jam', priceMultiplier: 3.8 },
    { value: 6, label: '6 Jam', priceMultiplier: 4.4 },
    { value: 12, label: '12 Jam (Half Day)', priceMultiplier: 7 },
    { value: 24, label: '24 Jam (Full Day)', priceMultiplier: 10 },
  ];

  // DAFTAR OPSI BULANAN (Tahunan sudah dihapus)
  const monthlyOptions = [
    { value: 1, label: '1 Bulan' },
    { value: 3, label: '3 Bulan' },
    { value: 6, label: '6 Bulan' },
  ];

  const handleSelect = (duration, type) => {
    // Simpan data ke state utama di BookingFlow
    updateBookingData({
      duration: duration,
      package: type, // 'hourly' atau 'monthly'
      // Catatan: Logika perhitungan harga total nanti kita masukkan di SummaryStep
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold mb-2">Berapa lama Anda akan menginap?</h3>
        <p className="text-gray-500">Pilih durasi sewa sesuai kebutuhan Anda</p>
      </div>

      {/* Tab Switcher (Harian/Jam vs Bulanan) */}
      <div className="flex p-1 bg-gray-100 rounded-xl mb-6 mx-auto w-full max-w-md">
        <button
          onClick={() => setActiveTab('hourly')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            activeTab === 'hourly'
              ? 'bg-white text-black shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Clock size={16} />
          Sewa Per Jam
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            activeTab === 'monthly'
              ? 'bg-white text-black shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar size={16} />
          Sewa Bulanan
        </button>
      </div>

      {/* Grid Pilihan Durasi */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto pb-4 px-1">
        {activeTab === 'hourly' ? (
          // RENDER OPSI JAM
          hourlyOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value, 'hourly')}
              className={`relative p-4 rounded-xl border-2 text-left transition-all hover:border-black ${
                bookingData.duration === option.value && bookingData.package === 'hourly'
                  ? 'border-black bg-black text-white'
                  : 'border-gray-100 bg-white text-gray-900'
              }`}
            >
              <div className="font-bold text-lg">{option.label}</div>
              <div className={`text-xs mt-1 ${
                bookingData.duration === option.value && bookingData.package === 'hourly' 
                ? 'text-gray-300' 
                : 'text-gray-500'
              }`}>
                Transit & Istirahat
              </div>
              
              {bookingData.duration === option.value && bookingData.package === 'hourly' && (
                <div className="absolute top-3 right-3">
                  <Check size={16} />
                </div>
              )}
            </button>
          ))
        ) : (
          // RENDER OPSI BULANAN
          monthlyOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value, 'monthly')}
              className={`relative p-4 rounded-xl border-2 text-left transition-all hover:border-black ${
                bookingData.duration === option.value && bookingData.package === 'monthly'
                  ? 'border-black bg-black text-white'
                  : 'border-gray-100 bg-white text-gray-900'
              }`}
            >
              <div className="font-bold text-lg">{option.label}</div>
              <div className={`text-xs mt-1 ${
                 bookingData.duration === option.value && bookingData.package === 'monthly'
                 ? 'text-gray-300' 
                 : 'text-gray-500'
              }`}>
                Jangka Panjang
              </div>

              {bookingData.duration === option.value && bookingData.package === 'monthly' && (
                <div className="absolute top-3 right-3">
                  <Check size={16} />
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default DurationStep;
