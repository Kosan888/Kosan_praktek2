import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DateStep = ({ bookingData, updateBookingData }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(
    bookingData.checkInDate ? new Date(bookingData.checkInDate) : null
  );

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateSelect = (day) => {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selected >= today) {
      setSelectedDate(selected);
      updateBookingData({
        checkInDate: selected.toISOString().split('T')[0]
      });
    }
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Pilih Tanggal Check-in</h3>
      <p className="text-gray-600 mb-6">Tentukan tanggal kedatangan Anda</p>

      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          <h4 className="text-lg font-bold text-gray-900">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h4>
          
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {[...Array(startingDayOfWeek)].map((_, index) => (
            <div key={`empty-${index}`} />
          ))}
          
          {[...Array(daysInMonth)].map((_, index) => {
            const day = index + 1;
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
            const isPast = date < today;

            return (
              <button
                key={day}
                onClick={() => handleDateSelect(day)}
                disabled={isPast}
                className={`
                  aspect-square rounded-lg font-medium transition-all
                  ${isPast ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'}
                  ${isToday ? 'border-2 border-black' : ''}
                  ${isSelected ? 'bg-black text-white hover:bg-gray-800' : 'text-gray-900'}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default DateStep;
