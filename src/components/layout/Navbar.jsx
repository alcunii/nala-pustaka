import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, Heart } from 'lucide-react';
import Logo from '../common/Logo';
import LanguageSwitcher from '../common/LanguageSwitcher';

export default function Navbar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path ? 'text-accent-500 font-bold' : 'text-white hover:text-accent-200';
  };

  const navLinks = [
    { path: '/', label: 'Beranda' },
    { path: '/app', label: 'Aplikasi' },
    { path: '/catalog', label: 'Katalog' },
    { path: '/about', label: 'Tentang' },
  ];

  return (
    <nav className="bg-primary-900 text-white shadow-lg sticky top-0 z-50 border-b-4 border-accent-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
              <div className="w-14 h-14 bg-white/10 rounded-lg flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all">
                <Logo location="navbar" size="lg" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl font-bold tracking-wide text-accent-100 group-hover:text-white transition-colors">
                  Nala Pustaka
                </span>
                <span className="text-[10px] uppercase tracking-widest text-primary-200">
                  Digitalisasi Naskah Kuno
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm uppercase tracking-wider transition-colors duration-200 ${isActive(link.path)}`}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            <Link
              to="/donation"
              className="px-4 py-2 bg-accent-600 text-primary-900 rounded-md font-bold text-sm hover:bg-accent-500 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Heart className="w-4 h-4" fill="currentColor" />
              Dukung Kami
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-primary-200 hover:text-white hover:bg-primary-800 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-primary-800 border-t border-primary-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === link.path
                    ? 'bg-primary-900 text-accent-500'
                    : 'text-primary-100 hover:bg-primary-700 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Language Switcher Mobile */}
            <LanguageSwitcher isMobile={true} />
            
            <Link
              to="/donation"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-3 py-2 mx-3 text-center bg-accent-600 text-primary-900 rounded-md font-bold hover:bg-accent-500"
            >
              <Heart className="w-4 h-4" fill="currentColor" />
              Dukung Kami
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}