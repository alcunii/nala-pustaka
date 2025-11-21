import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import commonID from './locales/id/common.json';
import commonEN from './locales/en/common.json';
import landingID from './locales/id/landing.json';
import landingEN from './locales/en/landing.json';
import appID from './locales/id/app.json';
import appEN from './locales/en/app.json';
import catalogID from './locales/id/catalog.json';
import catalogEN from './locales/en/catalog.json';
import aboutID from './locales/id/about.json';
import aboutEN from './locales/en/about.json';
import donationID from './locales/id/donation.json';
import donationEN from './locales/en/donation.json';
import adminID from './locales/id/admin.json';
import adminEN from './locales/en/admin.json';

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Init i18next
  .init({
    resources: {
      id: {
        common: commonID,
        landing: landingID,
        app: appID,
        catalog: catalogID,
        about: aboutID,
        donation: donationID,
        admin: adminID,
      },
      en: {
        common: commonEN,
        landing: landingEN,
        app: appEN,
        catalog: catalogEN,
        about: aboutEN,
        donation: donationEN,
        admin: adminEN,
      },
    },
    lng: 'id', // Default language
    fallbackLng: 'id', // Fallback language
    ns: ['common', 'landing', 'app', 'catalog', 'about', 'donation', 'admin'], // Namespaces
    defaultNS: 'common', // Default namespace
    
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    
    detection: {
      // Order of language detection methods
      order: ['localStorage', 'navigator'],
      // Keys to lookup language from
      lookupLocalStorage: 'i18nextLng',
      // Cache user language
      caches: ['localStorage'],
    },
    
    react: {
      useSuspense: false, // Disable suspense for now
    },
  });

export default i18n;
