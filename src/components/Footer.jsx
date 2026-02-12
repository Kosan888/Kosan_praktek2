import React from 'react';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';
const Footer = () => {
  return <footer className="bg-white text-gray-900 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <img src="https://horizons-cdn.hostinger.com/fe0ceffa-a268-4ed7-9517-b00266208690/82f0ec3177ec7c28e1cd03e5f4aac30f.jpg" alt="Kosan Logo" className="h-10 w-auto mb-4" />
            <p className="text-gray-600 text-sm leading-relaxed">Platform pemesanan kos dan apartemen terpercaya di Indonesia dengan standar kualitas bersih, aman dan transparan di seluruh Indonesia.</p>
          </div>

          <div>
            <span className="font-bold text-lg mb-4 block">Tautan Cepat</span>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-black transition-colors">Tentang Kami</a></li>
              <li><a href="#" className="text-gray-600 hover:text-black transition-colors">Cara Kerja</a></li>
              <li><a href="#" className="text-gray-600 hover:text-black transition-colors">Syarat & Ketentuan</a></li>
              <li><a href="#" className="text-gray-600 hover:text-black transition-colors">Kebijakan Privasi</a></li>
            </ul>
          </div>

          <div>
            <span className="font-bold text-lg mb-4 block">Bantuan</span>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-black transition-colors">FAQ</a></li>
              <li><a href="#" className="text-gray-600 hover:text-black transition-colors">Hubungi Kami</a></li>
              <li><a href="#" className="text-gray-600 hover:text-black transition-colors">Panduan Booking</a></li>
              <li><a href="#" className="text-gray-600 hover:text-black transition-colors">Daftarkan Properti</a></li>
            </ul>
          </div>

          <div>
            <span className="font-bold text-lg mb-4 block">Kontak</span>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-600">
                <MapPin size={16} />
                <span className="text-sm">Jakarta, Indonesia</span>
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <Phone size={16} />
                <span className="text-sm">+62 818-1888-8321</span>
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <Mail size={16} />
                <span className="text-sm">info@kosan.id</span>
              </li>
            </ul>

            <div className="flex gap-4 mt-6">
              <a href="#" className="bg-gray-100 text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="bg-gray-100 text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="bg-gray-100 text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 text-center">
          <p className="text-gray-600 text-sm">
            © 2025 Kosan. All rights reserved.
          </p>
        </div>
      </div>
    </footer>;
};
export default Footer;