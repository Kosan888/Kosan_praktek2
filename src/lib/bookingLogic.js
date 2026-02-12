/**
 * KONFIGURASI DURASI (Sesuai Request MVP)
 * Transit: 1 - 6 Jam, 12 Jam
 * Harian: 24 Jam
 * Bulanan: 30 Hari
 */
export const DURATION_OPTIONS = [
  // Transit (Hourly)
  { label: '1 Jam', value: 1, type: 'hourly', key: '1_hour' },
  { label: '2 Jam', value: 2, type: 'hourly', key: '2_hours' },
  { label: '3 Jam', value: 3, type: 'hourly', key: '3_hours' },
  { label: '4 Jam', value: 4, type: 'hourly', key: '4_hours' },
  { label: '5 Jam', value: 5, type: 'hourly', key: '5_hours' },
  { label: '6 Jam', value: 6, type: 'hourly', key: '6_hours' },
  { label: '12 Jam', value: 12, type: 'hourly', key: '12_hours' },
  
  // Harian (Daily)
  { label: 'Harian (1 Hari)', value: 24, type: 'daily', key: 'daily' },
  
  // Bulanan (Monthly)
  { label: 'Bulanan (30 Hari)', value: 720, type: 'monthly', key: 'monthly' }, // 24 jam * 30 hari = 720 jam
];

/**
 * FUNGSI UTAMA: MENGHITUNG DETAIL BOOKING
 * * @param {string} startTime - Waktu check-in (ISO String)
 * @param {object} selectedDuration - Object dari DURATION_OPTIONS di atas
 * @param {object} priceList - Pricing Matrix dari Database Mitra
 * * @returns {object} Detail kalkulasi (endTime, totalPrice, isValid)
 */
export function calculateBookingDetails(startTime, selectedDuration, priceList) {
  if (!startTime || !selectedDuration || !priceList) {
    return { error: 'Data tidak lengkap' };
  }

  const checkInDate = new Date(startTime);
  const checkOutDate = new Date(checkInDate);

  // 1. Hitung Waktu Check-out
  // Jika tipe bulanan, tambah hari. Jika jam/harian, tambah jam.
  if (selectedDuration.type === 'monthly') {
    checkOutDate.setDate(checkOutDate.getDate() + 30);
  } else {
    checkOutDate.setHours(checkOutDate.getHours() + selectedDuration.value);
  }

  // 2. Ambil Harga dari Pricing Matrix Mitra
  // Contoh priceList: { "1_hour": 30000, "daily": 150000, "monthly": 2000000 }
  const price = priceList[selectedDuration.key];

  // 3. Validasi Harga (Cek apakah Mitra mengaktifkan durasi ini)
  if (price === undefined || price === null || price === 0) {
    return {
      isValid: false,
      error: `Durasi ${selectedDuration.label} tidak tersedia untuk properti ini.`
    };
  }

  return {
    isValid: true,
    checkInTime: checkInDate.toISOString(),
    checkOutTime: checkOutDate.toISOString(),
    durationLabel: selectedDuration.label,
    totalPrice: price,
    
    // Data untuk Backend/Midtrans nanti
    durationType: selectedDuration.type,
    durationValue: selectedDuration.value
  };
}
