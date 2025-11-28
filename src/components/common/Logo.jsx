/**
 * Logo Component - Location-Based Logo System for Nala Pustaka
 * 
 * SISTEM BARU: Setiap lokasi punya file logo sendiri!
 * 
 * Usage:
 * <Logo location="navbar" size="md" />
 * <Logo location="footer" size="md" />
 * <Logo location="admin" size="lg" />
 * 
 * Manual Edit Instructions (PER LOKASI):
 * 1. Buka folder: public/assets/logo/
 * 2. Replace file sesuai lokasi yang ingin diubah:
 *    - logo-navbar.png    → Logo di Header (Navbar)
 *    - logo-footer.png    → Logo di Footer
 *    - logo-admin.png     → Logo di Halaman Admin Login
 *    - logo-welcome.png   → Logo di Welcome Screen (halaman utama)
 *    - logo-educational.png → Logo di Educational Panel
 *    - logo-chat.png      → Logo di RAG Chat Panel
 *    - logo-modal.png     → Logo di Deep Chat Modal
 * 3. Pastikan nama file TETAP SAMA
 * 4. Refresh browser (Ctrl+F5)
 * 5. ✅ Selesai! Logo di lokasi tersebut berubah
 */

// LOCATION-BASED LOGO PATHS
// Setiap lokasi punya file sendiri - ganti satu tidak mempengaruhi yang lain!
const LOGO_PATHS = {
  navbar: '/assets/logo/logo-navbar.png',         // Header navigation
  footer: '/assets/logo/logo-footer.png',         // Footer section
  admin: '/assets/logo/logo-admin.png',           // Admin login page
  welcome: '/assets/logo/logo-welcome.png',       // Welcome screen
  educational: '/assets/logo/logo-educational.png', // Educational panel
  chat: '/assets/logo/logo-chat.png',             // RAG chat panel
  modal: '/assets/logo/logo-modal.png',           // Deep chat modal
  
  // Fallback (jika location tidak diisi)
  default: '/assets/logo/logo-light.png',
};

const SIZE_CLASSES = {
  sm: 'w-4 h-4',      // 16px - for badges
  md: 'w-6 h-6',      // 24px - default
  lg: 'w-12 h-12',    // 48px - for navbar/footer/hero sections
  xl: 'w-16 h-16',    // 64px - for large sections
  '2xl': 'w-24 h-24', // 96px - for large welcome screens
  '3xl': 'w-48 h-48', // 192px - for hero/main welcome (super large)
};

export default function Logo({ 
  location = 'default',  // Lokasi spesifik: navbar, footer, admin, welcome, educational, chat, modal
  size = 'md',           // 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  className = '',        // Additional CSS classes
  alt = 'Nala Pustaka Logo'
}) {
  // Get logo path based on location
  const logoPath = LOGO_PATHS[location] || LOGO_PATHS.default;

  // Get size class
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  return (
    <img
      src={logoPath}
      alt={alt}
      className={`${sizeClass} object-contain ${className}`}
      loading="lazy"
    />
  );
}
