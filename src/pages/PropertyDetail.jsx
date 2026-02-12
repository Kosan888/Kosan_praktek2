import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { ArrowLeft, MapPin, Star, Wifi, Wind, Tv, Coffee, Share2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const amenityIcons = {
  'WiFi': Wifi, 'AC': Wind, 'TV': Tv, 'Dapur': Coffee,
  'Parkir': MapPin, 'Laundry': Coffee, 'Security': MapPin
};

const PropertyDetail = () => {
  const { id } = useParams(); // Menangkap ID dari URL
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setProperty(data);
      } catch (error) {
        console.error("Error:", error);
        toast({ title: "Gagal", description: "Properti tidak ditemukan", variant: "destructive" });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, navigate, toast]);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!property) return null;

  return (
    <div className="bg-white min-h-screen pb-24 relative">
      {/* Header Gambar */}
      <div className="relative h-[40vh] md:h-[50vh]">
        <img 
          src={property.image_url || "https://images.unsplash.com/photo-1595872018818-97555653a011"} 
          alt={property.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4 z-10">
          <button onClick={() => navigate(-1)} className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow hover:bg-white transition">
            <ArrowLeft size={20} className="text-black" />
          </button>
        </div>
      </div>

      {/* Konten Detail */}
      <div className="px-5 py-6 -mt-6 bg-white rounded-t-3xl relative z-0 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.name}</h1>
          <div className="flex items-center gap-4 text-sm">
             <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                <Star className="fill-orange-400 text-orange-400" size={14} />
                <span className="font-semibold">{property.rating}</span>
             </div>
             <span className="text-gray-500">({property.reviews} ulasan)</span>
             <span className="text-gray-300">•</span>
             <div className="flex items-center gap-1 text-gray-600">
                <MapPin size={14} />
                <span>{property.location}</span>
             </div>
          </div>
        </div>

        <hr className="border-gray-100 mb-6" />

        <div className="mb-6">
          <h3 className="text-lg font-bold mb-3">Fasilitas Utama</h3>
          <div className="grid grid-cols-2 gap-3">
            {property.amenities?.map((item) => {
               const Icon = amenityIcons[item] || Wifi;
               return (
                 <div key={item} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <Icon size={18} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">{item}</span>
                 </div>
               )
            })}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">Tentang Properti</h3>
          <p className="text-gray-600 leading-relaxed text-sm text-justify">
            {property.description || "Belum ada deskripsi untuk properti ini."}
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
        <div className="container mx-auto max-w-3xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Harga per bulan</p>
            <p className="text-xl font-bold text-black">{formatRupiah(property.price)}</p>
          </div>
          <Button className="bg-black text-white px-8 rounded-xl h-12 font-semibold hover:bg-gray-800">
            Ajukan Sewa
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
