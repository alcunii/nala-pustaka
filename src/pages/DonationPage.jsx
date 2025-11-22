import React from 'react';
import { Helmet } from 'react-helmet-async';

const DonationPage = () => {
  return (
    <div className="min-h-screen bg-primary-50 py-12 px-4 sm:px-6 lg:px-8 font-serif">
      <Helmet>
        <title>Dukung Kami - Nala Pustaka</title>
        <meta name="description" content="Dukung pelestarian naskah kuno Jawa melalui donasi untuk pengembangan teknologi AI dan infrastruktur Nala Pustaka." />
        <link rel="canonical" href="https://nalapustaka.com/donation" />

        {/* Open Graph */}
        <meta property="og:title" content="Dukung Kami - Nala Pustaka" />
        <meta property="og:description" content="Dukung pelestarian naskah kuno Jawa melalui donasi untuk pengembangan teknologi AI dan infrastruktur Nala Pustaka." />
        <meta property="og:url" content="https://nalapustaka.com/donation" />
        <meta property="og:type" content="website" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Dukung Kami - Nala Pustaka" />
        <meta name="twitter:description" content="Dukung pelestarian naskah kuno Jawa melalui donasi untuk pengembangan teknologi AI dan infrastruktur Nala Pustaka." />
      </Helmet>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-primary-900 mb-4">
            Dukung Nala Pustaka
          </h1>
          <p className="text-lg text-primary-800/80 leading-relaxed">
            Bantu kami menjaga warisan budaya Jawa tetap hidup dan dapat diakses oleh semua orang.
            Kontribusi Anda mendukung biaya server, pengembangan AI, dan pelestarian naskah.
          </p>
        </div>

        {/* Donation Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Trakteer Card */}
          <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-6 hover:shadow-md transition-shadow duration-300 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#be1e2d]/10 rounded-full flex items-center justify-center mb-4">
              <img src="https://cdn.trakteer.id/images/embed/trbtn-icon.png" alt="Trakteer" className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-primary-900 mb-2">Trakteer</h3>
            <p className="text-primary-800/70 mb-6 text-sm">
              Dukungan melalui QRIS, GoPay, OVO, Dana, dan Transfer Bank (Indonesia).
            </p>
            <a
              href="https://trakteer.id/damar_abhinawa"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-6 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <span>Traktir Cendol</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>

          {/* Ko-fi Card */}
          <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-6 hover:shadow-md transition-shadow duration-300 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#29abe0]/10 rounded-full flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#29abe0]" fill="currentColor">
                <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 3.722-2.271 3.722-2.271l2.708-4.562s.751.362.22 2.201zm-6.536 2.826H5.332V6.029h12.013v5.745zm1.649-2.921h-1.649V6.59h1.649v2.263z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-primary-900 mb-2">Ko-fi</h3>
            <p className="text-primary-800/70 mb-6 text-sm">
              Support via PayPal atau Kartu Kredit untuk donatur internasional.
            </p>
            <a
              href="https://ko-fi.com/G2G61OQQ0O"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-6 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <span>Support on Ko-fi</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
        </div>

        {/* Transparency Section */}
        <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-8">
          <h2 className="text-2xl font-bold text-primary-900 mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            Transparansi Dana
          </h2>
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            <div className="p-4 bg-primary-50 rounded-lg">
              <div className="text-3xl font-bold text-primary-600 mb-1">50%</div>
              <div className="text-sm text-primary-800 font-medium">Server & Database</div>
            </div>
            <div className="p-4 bg-primary-50 rounded-lg">
              <div className="text-3xl font-bold text-primary-600 mb-1">30%</div>
              <div className="text-sm text-primary-800 font-medium">AI API Costs</div>
            </div>
            <div className="p-4 bg-primary-50 rounded-lg">
              <div className="text-3xl font-bold text-primary-600 mb-1">20%</div>
              <div className="text-sm text-primary-800 font-medium">Pengembangan</div>
            </div>
          </div>
          <p className="mt-6 text-center text-primary-800/70 italic text-sm">
            "Setiap kontribusi, sekecil apapun, membantu kami melestarikan pengetahuan leluhur."
          </p>
        </div>
      </div>
    </div>
  );
};

export default DonationPage;
