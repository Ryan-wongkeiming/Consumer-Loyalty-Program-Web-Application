import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img
                src="https://www.blackmores.com.au/-/media/project/blackmores-group/au/logo/logo-blackmores-white2.svg?h=18&iar=0&w=145&hash=CDA11738510A630CA0827551B2FF4E21"
                alt="Blackmores"
                className="h-8 w-auto"
              />
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Australia's leading natural health company, committed to improving people's health and wellbeing through quality natural health products.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Instagram className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Youtube className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Products</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/?category=Vitamins" className="text-gray-300 hover:text-white transition-colors">Vitamin</a></li>
              <li><a href="/?category=Fish Oil" className="text-gray-300 hover:text-white transition-colors">Dầu cá</a></li>
              <li><a href="/?category=Multivitamins" className="text-gray-300 hover:text-white transition-colors">Vitamin tổng hợp</a></li>
              <li><a href="/?category=Minerals" className="text-gray-300 hover:text-white transition-colors">Khoáng chất</a></li>
              <li><a href="/?category=Herbs" className="text-gray-300 hover:text-white transition-colors">Thảo dược</a></li>
              <li><a href="/?category=Probiotics" className="text-gray-300 hover:text-white transition-colors">Men vi sinh</a></li>
              <li><a href="/?category=Infant Formula" className="text-gray-300 hover:text-white transition-colors">Sữa công thức</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Pháp lý</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/privacy-policy" className="text-gray-300 hover:text-white transition-colors">Chính sách bảo mật</a></li>
              <li><a href="/editorial-policy" className="text-gray-300 hover:text-white transition-colors">Chính sách biên tập</a></li>
              <li><a href="/terms-of-use" className="text-gray-300 hover:text-white transition-colors">Điều khoản sử dụng</a></li>
              <li><a href="/cookies" className="text-gray-300 hover:text-white transition-colors">Cookies</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-blackmores-teal" />
                <span className="text-gray-300">1800 803 760</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-blackmores-teal" />
                <span className="text-gray-300">info@blackmores.com.au</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-blackmores-teal mt-1" />
                <span className="text-gray-300">
                  20 Jubilee Ave<br />
                  Warriewood NSW 2102
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2024 Blackmores Limited. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Help Centre</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a>
              <a href="/womens-health" className="text-gray-400 hover:text-white transition-colors">Health Hub</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;