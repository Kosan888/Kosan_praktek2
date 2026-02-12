import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Andi Setiawan',
    location: 'Jakarta',
    rating: 5,
    comment: 'Proses booking sangat mudah dan cepat. Kosan yang saya dapat sesuai dengan foto dan deskripsi. Sangat puas dengan pelayanannya!',
    avatar: 'Professional man in business casual'
  },
  {
    id: 2,
    name: 'Sarah Putri',
    location: 'Bandung',
    rating: 5,
    comment: 'Fasilitasnya lengkap dan harga sangat terjangkau untuk mahasiswa seperti saya. Recommended banget!',
    avatar: 'Young woman student smiling'
  },
  {
    id: 3,
    name: 'Budi Santoso',
    location: 'Surabaya',
    rating: 5,
    comment: 'Platform yang sangat membantu untuk mencari hunian. Sistemnya transparan dan terpercaya. Terima kasih Kosan!',
    avatar: 'Middle-aged professional man'
  }
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-16 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Testimoni Pelanggan</h2>
          <p className="text-gray-300 text-lg">Apa kata mereka tentang Kosan</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow relative"
            >
              <Quote className="absolute top-6 right-6 text-gray-400" size={40} />
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                  <img alt={testimonial.name} className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1649399045831-40bfde3ef21d" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{testimonial.name}</h3>
                  <p className="text-sm text-gray-600">{testimonial.location}</p>
                </div>
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="text-black fill-black" size={16} />
                ))}
              </div>

              <p className="text-gray-700 leading-relaxed italic">"{testimonial.comment}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;