import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star } from 'lucide-react';

const availableLocations = [
  {
    id: 1,
    name: 'Kosan Modern Jakarta Pusat',
    address: 'Jl. Sudirman No. 123, Jakarta Pusat',
    city: 'Jakarta',
    rating: 4.8,
    price: 'Rp 50.000',
    image: 'Modern boarding house in Jakarta city center'
  },
  {
    id: 2,
    name: 'Apartemen Studio Bandung',
    address: 'Jl. Dago No. 45, Bandung',
    city: 'Bandung',
    rating: 4.9,
    price: 'Rp 75.000',
    image: 'Studio apartment in Bandung'
  },
  {
    id: 3,
    name: 'Kosan Eksklusif Surabaya',
    address: 'Jl. Pemuda No. 78, Surabaya',
    city: 'Surabaya',
    rating: 4.7,
    price: 'Rp 60.000',
    image: 'Exclusive boarding house in Surabaya'
  },
  {
    id: 4,
    name: 'Kosan Dekat Kampus Yogyakarta',
    address: 'Jl. Kaliurang KM 5, Sleman',
    city: 'Yogyakarta',
    rating: 4.6,
    price: 'Rp 45.000',
    image: 'Student accommodation near campus in Yogyakarta'
  }
];

const LocationStep = ({ bookingData, updateBookingData }) => {
  const handleSelectLocation = (location) => {
    updateBookingData({
      location: location.city,
      propertyName: location.name,
      propertyAddress: location.address,
      basePrice: parseInt(location.price.replace(/[^0-9]/g, ''))
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Pilih Lokasi</h3>
      <p className="text-gray-600 mb-6">Pilih hunian yang sesuai dengan kebutuhan Anda</p>

      <div className="grid md:grid-cols-2 gap-4">
        {availableLocations.map((location) => {
          const isSelected = bookingData.propertyName === location.name;
          
          return (
            <motion.div
              key={location.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectLocation(location)}
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                isSelected 
                  ? 'border-black bg-gray-50' 
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                  <img alt={location.name} className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1595872018818-97555653a011" />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-1">{location.name}</h4>
                  <div className="flex items-center gap-1 text-gray-600 text-sm mb-2">
                    <MapPin size={14} className="text-black" />
                    <span>{location.address}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="text-black fill-black" size={14} />
                      <span className="text-sm font-semibold text-gray-900">{location.rating}</span>
                    </div>
                  </div>
                  <p className="text-black font-bold">{location.price}<span className="text-xs text-gray-600">/jam</span></p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default LocationStep;