import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path ? 'text-accent-500 font-bold' : 'text-white hover:text-accent-200';
  };

  const navLinks = [
    { path: '/', label: 'Beranda' },
    { path: '/app', label: 'Aplikasi Utama' },
    { path: '/catalog', label: 'Katalog Naskah' },
    { path: '/about', label: 'Tentang Kami' },
  ];

  return (
    <nav className="bg-primary-900 text-white shadow-lg sticky top-0 z-50 border-b-4 border-accent-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all">
                <span className="text-2xl">📜</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl font-bold tracking-wide text-accent-100 group-hover:text-white transition-colors">
                  NALA PUSTAKA
                </span>
                <span className="text-[10px] uppercase tracking-widest text-primary-200">
                  Digitalisasi Naskah Kuno
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm uppercase tracking-wider transition-colors duration-200 ${isActive(link.path)}`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/donation"
              className="px-4 py-2 bg-accent-600 text-primary-900 rounded-md font-bold text-sm hover:bg-accent-500 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Dukung Kami 💝
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-primary-200 hover:text-white hover:bg-primary-800 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
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
            <Link
              to="/donation"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 mt-4 text-center bg-accent-600 text-primary-900 rounded-md font-bold hover:bg-accent-500"
            >
              Dukung Kami 💝
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}