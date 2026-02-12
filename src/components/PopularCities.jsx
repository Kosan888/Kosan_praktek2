import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

const cities = [
  { name: 'Jakarta', properties: '500+ Properti' },
  { name: 'Bandung', properties: '350+ Properti' },
  { name: 'Surabaya', properties: '400+ Properti' },
  { name: 'Yogyakarta', properties: '300+ Properti' },
  { name: 'Semarang', properties: '250+ Properti' },
  { name: 'Malang', properties: '200+ Properti' },
  { name: 'Denpasar', properties: '180+ Properti' },
  { name: 'Medan', properties: '220+ Properti' }
];

const PopularCities = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Kota Populer</h2>
          <p className="text-gray-600 text-lg">Temukan hunian di kota-kota besar Indonesia</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {cities.map((city, index) => (
            <motion.div
              key={city.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all cursor-pointer border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-black p-2 rounded-lg">
                  <MapPin className="text-white" size={20} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{city.name}</h3>
              </div>
              <p className="text-gray-600 text-sm">{city.properties}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularCities;