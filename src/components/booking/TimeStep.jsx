import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

const TimeStep = ({ bookingData, updateBookingData }) => {
  const [selectedTime, setSelectedTime] = useState(bookingData.checkInTime || '');

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    updateBookingData({ checkInTime: time });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Pilih Waktu Check-in</h3>
      <p className="text-gray-600 mb-6">Tentukan waktu kedatangan Anda</p>

      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Waktu Check-in
          </label>
          <div className="relative">
            <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => handleTimeSelect(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900 text-lg"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <p className="text-sm font-semibold text-gray-700 mb-4">Atau pilih waktu populer:</p>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'].map((time) => (
              <button
                key={time}
                onClick={() => handleTimeSelect(time)}
                className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                  selectedTime === time
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {selectedTime && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4"
          >
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Waktu check-in yang dipilih:</span> {selectedTime}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default TimeStep;