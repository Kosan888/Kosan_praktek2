import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
// ... import komponen step lainnya (Location, Date, Time, Duration) ...
import LocationStep from '@/components/booking/LocationStep'; // Pastikan path benar
import DateStep from '@/components/booking/DateStep';
import TimeStep from '@/components/booking/TimeStep';
import DurationStep from '@/components/booking/DurationStep';
import SummaryStep from '@/components/booking/SummaryStep';

// IMPORT SUPABASE CLIENT ANDA DI SINI
import { supabase } from '@/lib/customSupabaseClient'; // Sesuaikan path

const BookingFlow = ({ initialData, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false); // State loading saat submit
  const [bookingData, setBookingData] = useState({
    // ... data state Anda ...
    location: initialData?.location || '',
    propertyName: initialData?.propertyName || '',
    roomId: initialData?.roomId || null, // PENTING: Kita butuh ID kamar
    checkInDate: initialData?.checkInDate || '',
    checkInTime: '',
    duration: null,
    package: null,
    totalPrice: 0
  });

  // ... (Function nextStep, prevStep, canProceed sama seperti sebelumnya) ...
  const totalSteps = 5;

  const updateBookingData = (data) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // === LOGIC BARU: SUBMIT BOOKING KE SUPABASE ===
  const handleBookingSubmit = async () => {
    setIsLoading(true);
    try {
      // 1. Konstruksi Tanggal & Waktu Lengkap (Start Time)
      // Format: YYYY-MM-DD HH:mm
      const startDateTimeStr = `${bookingData.checkInDate}T${bookingData.checkInTime}:00`;
      const startTime = new Date(startDateTimeStr);
      
      // 2. Hitung Waktu Keluar (End Time)
      const endTime = new Date(startTime);
      if (bookingData.package === 'hourly') {
        endTime.setHours(endTime.getHours() + parseInt(bookingData.duration));
      } else {
        // Monthly
        endTime.setMonth(endTime.getMonth() + parseInt(bookingData.duration));
      }

      // 3. Validasi Availability (Panggil Fungsi SQL Database)
      // Pastikan bookingData.roomId ada (misal di-pass dari halaman detail properti)
      // Untuk testing, bisa hardcode UUID kamar dari tabel 'rooms'
      const roomIdToUse = bookingData.roomId || 'masukkan-uuid-kamar-disini-untuk-tes'; 

      const { data: isAvailable, error: checkError } = await supabase
        .rpc('check_room_availability', {
          p_room_id: roomIdToUse,
          p_start_time: startTime.toISOString(),
          p_end_time: endTime.toISOString()
        });

      if (checkError) throw checkError;

      if (!isAvailable) {
        alert("Maaf, kamar tidak tersedia pada jam tersebut. Silakan pilih waktu lain.");
        setIsLoading(false);
        return;
      }

      // 4. Insert ke Tabel Bookings
      // Hitung harga (Logic sederhana dulu atau ambil dari props)
      const estimatedPrice = bookingData.package === 'monthly' 
        ? bookingData.duration * 1500000 
        : bookingData.duration * 35000;

      const { data: bookingResult, error: bookingError } = await supabase
        .from('bookings')
        .insert([
          {
            user_id: (await supabase.auth.getUser()).data.user?.id, // Ambil user login
            room_id: roomIdToUse,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            duration_type: bookingData.package, // 'hourly' atau 'monthly'
            total_price: estimatedPrice,
            status: 'pending' // Status awal pending payment
          }
        ])
        .select();

      if (bookingError) throw bookingError;

      // Sukses
      alert("Booking Berhasil Dibuat! Silakan lanjut ke pembayaran.");
      onClose(); // Tutup modal

    } catch (error) {
      console.error("Booking Error:", error);
      alert("Terjadi kesalahan: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <motion.div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* ... Header Component ... */}
        
        {/* ... Step Indicator ... */}

        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
             {/* ... Step 1, 2, 3, 4 Sama ... */}
             {currentStep === 1 && <LocationStep key="location" bookingData={bookingData} updateBookingData={updateBookingData} />}
             {currentStep === 2 && <DateStep key="date" bookingData={bookingData} updateBookingData={updateBookingData} />}
             {currentStep === 3 && <TimeStep key="time" bookingData={bookingData} updateBookingData={updateBookingData} />}
             {currentStep === 4 && <DurationStep key="duration" bookingData={bookingData} updateBookingData={updateBookingData} />}
             
             {/* STEP 5: SUMMARY */}
             {currentStep === 5 && (
              <SummaryStep 
                key="summary"
                bookingData={bookingData}
              />
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1 || isLoading}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            <ChevronLeft size={20} /> Kembali
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors bg-black text-white hover:bg-gray-800"
            >
              Lanjut <ChevronRight size={20} />
            </button>
          ) : (
            // TOMBOL FINAL: KONFIRMASI & BAYAR
            <button
              onClick={handleBookingSubmit}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors bg-black text-white hover:bg-gray-800 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> Memproses...
                </>
              ) : (
                <>Konfirmasi & Bayar</>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default BookingFlow;
