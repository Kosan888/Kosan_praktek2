import React, { useState } from 'react';
import { MapPin, Calendar, Search } from 'lucide-react'; // Ganti icon Search
import { motion } from 'framer-motion';

const Hero = ({ onSearch }) => { // Terima prop onSearch
  const [location, setLocation] = useState('');
  const [checkInDate, setCheckInDate] = useState('');

  const handleSearchClick = () => {
    // Kirim lokasi ke Home (meskipun kosong, agar bisa reset)
    if (onSearch) {
      onSearch(location);
    }
    
    // Scroll otomatis ke bagian daftar kosan
    const element = document.getElementById('properties');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white py-20 overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-60"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }} 
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Temukan Tempat istirahat sementara</h1>
          <p className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-gray-400">Nyaman & Modern.</span>
          </p>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Platform pemesanan kos dan apartemen dengan standar kualitas bersih, aman, dan transparan di seluruh Indonesia.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.2 }} 
          className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-4xl mx-auto"
        >
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">LOKASI</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Mau cari kos dimana? (misal: Bandung)" 
                  value={location} 
                  onChange={e => setLocation(e.target.value)} 
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900" 
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">TANGGAL MASUK</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="date" 
                  value={checkInDate} 
                  onChange={e => setCheckInDate(e.target.value)} 
                  min={new Date().toISOString().split('T')[0]} 
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900" 
                />
              </div>
            </div>
          </div>

          <button 
            onClick={handleSearchClick} 
            className="w-full bg-black text-white py-4 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <Search size={20} />
            Cari Kos
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.6, delay: 0.4 }} 
          className="text-center mt-12"
        >
          <p className="text-sm text-gray-400 uppercase tracking-wider mb-4">DIPERCAYA OLEH 2,000+ PENGGUNA DI INDONESIA</p>
        </motion.div>
      </div>
    </section>
  );
};
export default Hero;
