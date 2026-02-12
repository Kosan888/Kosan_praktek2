import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Wifi, Coffee, Wind, Tv, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient'; 
import { useNavigate } from 'react-router-dom'; 

const amenityIcons = {
  'WiFi': Wifi, 'AC': Wind, 'TV': Tv, 'Dapur': Coffee,
  'Parkir': MapPin, 'Laundry': Coffee, 'Security': MapPin, 'Gym': Coffee
};

// Menerima prop searchQuery
const FeaturedProperties = ({ onBookNow, searchQuery }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true); // Set loading setiap kali search berubah
      try {
        let query = supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false });

        // LOGIKA PENCARIAN
        if (searchQuery && searchQuery.trim() !== '') {
          // Cari berdasarkan Nama Kosan ATAU Lokasi (Case Insensitive)
          query = query.or(`name.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`);
        }

        const { data, error } = await query;

        if (error) throw error;
        setProperties(data || []);
      } catch (error) {
        console.error("Gagal mengambil data properti:", error);
      } finally {
        setLoading(false);
      }
    };

    // Jalankan ulang setiap kali searchQuery berubah
    fetchProperties();
  }, [searchQuery]);

  const handleBookNow = (e, property) => {
    e.stopPropagation(); 
    onBookNow({
      location: property.location,
      propertyName: property.name,
      checkInDate: new Date().toISOString().split('T')[0]
    });
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  return (
    <section id="properties" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {searchQuery ? `Hasil Pencarian: "${searchQuery}"` : "Properti Pilihan"}
          </h2>
          <p className="text-gray-600 text-lg">Hunian terbaik dengan harga terjangkau</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin text-gray-400 w-10 h-10" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-xl">
            <p className="text-gray-500 text-lg">
              Tidak ditemukan kosan untuk pencarian <b>"{searchQuery}"</b>.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Lihat Semua</Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property, index) => {
              const fasilitas = property.amenities || []; 
              
              return (
                <motion.div
                  key={property.id}
                  onClick={() => navigate(`/property/${property.id}`)}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer border border-gray-100 flex flex-col h-full group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      alt={property.name} 
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" 
                      src={property.image_url || "https://images.unsplash.com/photo-1595872018818-97555653a011"} 
                    />
                    <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Terjangkau
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-1">{property.name}</h3>
                    
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <MapPin size={16} className="text-black shrink-0" />
                      <span className="text-sm line-clamp-1">{property.location}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="text-black fill-black" size={16} />
                        <span className="font-semibold text-gray-900">{property.rating || 4.5}</span>
                      </div>
                      <span className="text-gray-600 text-sm">({property.reviews || 0} ulasan)</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {fasilitas.slice(0, 4).map((amenity) => { 
                        const Icon = amenityIcons[amenity] || Wifi;
                        return (
                          <div key={amenity} className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                            <Icon size={14} className="text-gray-600" />
                            <span className="text-xs text-gray-700">{amenity}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-sm text-gray-600">Mulai dari</p>
                        <p className="text-xl font-bold text-black">{formatRupiah(property.price)}<span className="text-sm text-gray-600 font-normal">/bulan</span></p>
                      </div>
                      <Button 
                        onClick={(e) => handleBookNow(e, property)} 
                        className="bg-black hover:bg-gray-800 text-white rounded-xl"
                      >
                        Pesan
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProperties;
