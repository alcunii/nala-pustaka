import { Link } from 'react-router-dom';
import { MapPin, Mail, ChevronRight } from 'lucide-react';
import Logo from '../common/Logo';

export default function Footer() {
  
  return (
    <footer className="bg-primary-900 text-primary-100 border-t-4 border-accent-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
                <Logo location="footer" size="lg" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-accent-100 tracking-wide">Nala Pustaka</h3>
                <p className="text-[10px] uppercase tracking-widest text-primary-300">Digitalisasi Naskah Kuno</p>
              </div>
            </div>
            <p className="text-sm text-primary-200 leading-relaxed">
              Platform digitalisasi dan analisis naskah kuno Jawa dengan teknologi AI dan RAG untuk penelitian filologi modern.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4 border-b border-primary-700 pb-2 inline-block">Tautan Cepat</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-accent-400 transition-colors flex items-center gap-2">
                  <ChevronRight className="w-4 h-4" /> Beranda
                </Link>
              </li>
              <li>
                <Link to="/app" className="hover:text-accent-400 transition-colors flex items-center gap-2">
                  <ChevronRight className="w-4 h-4" /> Aplikasi
                </Link>
              </li>
              <li>
                <Link to="/catalog" className="hover:text-accent-400 transition-colors flex items-center gap-2">
                  <ChevronRight className="w-4 h-4" /> Katalog
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-accent-400 transition-colors flex items-center gap-2">
                  <ChevronRight className="w-4 h-4" /> Tentang
                </Link>
              </li>
            </ul>
          </div>

          {/* Articles / Insights */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4 border-b border-primary-700 pb-2 inline-block">Wawasan</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/articles/digital-silence" className="hover:text-accent-400 transition-colors flex items-center gap-2">
                  <ChevronRight className="w-4 h-4" /> Kebisuan Digital
                </Link>
              </li>
              <li>
                <Link to="/articles/philology-revolution" className="hover:text-accent-400 transition-colors flex items-center gap-2">
                  <ChevronRight className="w-4 h-4" /> Revolusi Filologi
                </Link>
              </li>
              <li>
                <Link to="/articles/gen-z-wisdom" className="hover:text-accent-400 transition-colors flex items-center gap-2">
                  <ChevronRight className="w-4 h-4" /> Gen Z & Budaya
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Academic Info */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4 border-b border-primary-700 pb-2 inline-block">Informasi Akademik</h4>
            <div className="space-y-3 text-sm text-primary-200">
              <p className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent-500 mt-0.5 flex-shrink-0" />
                <span>
                  Nala Pustaka<br />
                  Platform Digitalisasi Naskah Kuno
                </span>
              </p>
              <p className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent-500 flex-shrink-0" />
                <a href="mailto:info@nalapustaka.org" className="hover:text-white transition-colors">info@nalapustaka.org</a>
              </p>
              <p className="text-xs mt-4 italic opacity-70">
                "Melestarikan warisan budaya melalui teknologi modern"
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-800 text-center text-xs text-primary-400">
          <p>&copy; {new Date().getFullYear()} Nala Pustaka. Hak Cipta Dilindungi.</p>
          <p className="mt-1 flex items-center justify-center gap-1">
            Dikembangkan dengan penuh syukur untuk pelestarian budaya
          </p>
        </div>
      </div>
    </footer>
  );
}