import React from 'react';
import { MapPin, Calendar, Clock, Hourglass, Wallet } from 'lucide-react';

const SummaryStep = ({ bookingData, onConfirm, isLoading }) => {
  // SIMULASI HARGA DASAR (Nanti ini diambil dari Database 'rooms' -> pricing_config)
  const BASE_HOURLY_PRICE = 35000; // Contoh: Rp 35.000 per jam
  const BASE_MONTHLY_PRICE = 1500000; // Contoh: Rp 1.500.000 per bulan

  // Logic Hitung Harga Sederhana
  const calculateTotal = () => {
    if (bookingData.package === 'monthly') {
      return bookingData.duration * BASE_MONTHLY_PRICE;
    }
    // Jika hourly, kita asumsi flat rate dikali durasi (bisa disesuaikan logic multiplier nanti)
    return bookingData.duration * BASE_HOURLY_PRICE;
  };

  const totalPrice = calculateTotal();
  
  // Format mata uang IDR
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  // Format tanggal agar mudah dibaca
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('id-ID', options);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Ringkasan Pesanan</h3>
        <p className="text-gray-600">Pastikan detail pesanan sudah benar</p>
      </div>

      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
        {/* Lokasi */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm text-black">
            <MapPin size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase">Lokasi</p>
            <p className="font-medium text-gray-900">{bookingData.propertyName || 'Nama Kosan'}</p>
            <p className="text-sm text-gray-500">{bookingData.location}</p>
          </div>
        </div>

        <div className="h-px bg-gray-200 my-2"></div>

        {/* Waktu Check-in */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm text-black">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">Tanggal</p>
              <p className="font-medium text-gray-900 text-sm">{formatDate(bookingData.checkInDate)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm text-black">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">Jam Masuk</p>
              <p className="font-medium text-gray-900 text-sm">{bookingData.checkInTime} WIB</p>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-200 my-2"></div>

        {/* Durasi */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm text-black">
            <Hourglass size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase">Durasi Sewa</p>
            <p className="font-medium text-gray-900">
              {bookingData.duration} {bookingData.package === 'hourly' ? 'Jam' : 'Bulan'}
            </p>
            <p className="text-sm text-green-600 font-medium bg-green-50 inline-block px-2 py-0.5 rounded mt-1">
              {bookingData.package === 'hourly' ? 'Transit / Harian' : 'Jangka Panjang'}
            </p>
          </div>
        </div>
      </div>

      {/* Total Harga */}
      <div className="mt-auto pt-6 border-t border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-gray-600">
            <Wallet size={20} />
            <span className="font-medium">Total Pembayaran</span>
          </div>
          <div className="text-2xl font-bold text-black">
            {formatRupiah(totalPrice)}
          </div>
        </div>

        {/* Tombol Pay ada di BookingFlow, tapi Summary menampilkan detailnya */}
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm text-yellow-800 text-center">
          Klik "Konfirmasi & Bayar" untuk melanjutkan ke pembayaran.
        </div>
      </div>
    </div>
  );
};

export default SummaryStep;
