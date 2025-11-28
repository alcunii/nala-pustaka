import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher({ isMobile = false }) {
  const [currentLang, setCurrentLang] = useState('id');

  // Detect current language from cookie on mount
  useEffect(() => {
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('googtrans='));
    
    if (cookie) {
      const lang = cookie.split('=')[1].split('/')[2];
      if (lang) setCurrentLang(lang);
    }
  }, []);

  const changeLanguage = (langCode) => {
    if (langCode === currentLang) return;

    // Set Google Translate cookie
    // Format: googtrans=/from/to
    const cookieValue = `/id/${langCode}`;
    
    // Clear existing cookies first
    document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    document.cookie = 'googtrans=; path=/; domain=' + window.location.hostname + '; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    
    // Set new cookie with proper format
    document.cookie = `googtrans=${cookieValue}; path=/;`;
    
    // Try to set with domain as well (for localhost compatibility)
    try {
      document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}`;
    } catch (e) {
      console.log('Domain cookie not set:', e);
    }

    // Update state
    setCurrentLang(langCode);

    // Force reload to apply translation
    // Small delay to ensure cookie is set
    setTimeout(() => {
      window.location.reload(true); // true = force reload from server
    }, 200);
  };

  const languages = [
    { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'jw', name: 'Javanese', flag: '🇮🇩' }
  ];

  const currentLanguage = languages.find(lang => lang.code === currentLang);

  if (isMobile) {
    return (
      <div className="px-3 py-4">
        <div className="space-y-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition-all ${
                currentLang === lang.code
                  ? 'bg-primary-700 text-white'
                  : 'bg-primary-600 text-primary-100 hover:bg-primary-700'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
              {currentLang === lang.code && <span className="ml-auto">✓</span>}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-2 text-sm uppercase tracking-wider text-white hover:text-accent-200 transition-colors duration-200"
        title="Change Language"
      >
        <Globe className="w-4 h-4" />
        <span>{currentLanguage?.flag} {currentLanguage?.code.toUpperCase()}</span>
        <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      <div className="absolute right-0 mt-2 w-48 bg-primary-800 rounded-lg shadow-xl border-2 border-primary-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                currentLang === lang.code
                  ? 'bg-primary-700 text-accent-400 font-bold'
                  : 'text-white hover:bg-primary-700 hover:text-accent-200'
              }`}
            >
              <span className="text-xl">{lang.flag}</span>
              <span className="flex-1">{lang.name}</span>
              {currentLang === lang.code && <span className="text-accent-400">✓</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}