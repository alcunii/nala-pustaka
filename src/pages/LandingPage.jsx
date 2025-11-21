import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-primary-50 font-sans text-gray-800">
      <Helmet>
        <title>Nala Pustaka - Digitalisasi & Analisis Naskah Kuno Jawa</title>
        <meta name="description" content="Platform akademis untuk pelestarian dan analisis naskah kuno Jawa menggunakan teknologi Artificial Intelligence dan Retrieval-Augmented Generation (RAG)." />
      </Helmet>

      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-primary-900 text-white py-24 overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/batik-rambutan.png')]"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 opacity-90"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-accent-400/30 bg-accent-900/30 backdrop-blur-sm">
              <span className="text-accent-300 text-sm font-medium tracking-widest uppercase">Preservasi Digital Berbasis AI</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight mb-6 leading-tight">
              Menghidupkan Kembali <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-200 to-accent-500">
                Khazanah Naskah Nusantara
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-primary-100 mb-10 leading-relaxed font-light">
              Nala Pustaka menggabungkan ketelitian filologi tradisional dengan kecanggihan teknologi <em>Artificial Intelligence</em> untuk membuka tabir pengetahuan masa lampau.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/app"
                className="px-8 py-4 bg-accent-600 text-primary-900 rounded-lg font-bold text-lg hover:bg-accent-500 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Mulai Riset & Eksplorasi
              </Link>
              <Link
                to="/catalog"
                className="px-8 py-4 bg-transparent border-2 border-white/30 text-white rounded-lg font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                Lihat Katalog Naskah
              </Link>
            </div>
          </div>
        </section>

        {/* Academic Value Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-serif font-bold text-primary-900 mb-4">Pendekatan Akademis Modern</h2>
              <div className="w-24 h-1 bg-accent-500 mx-auto rounded-full"></div>
              <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                Kami menyediakan perangkat analisis komprehensif bagi peneliti, mahasiswa, dan pegiat budaya.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Feature 1 */}
              <div className="p-8 bg-primary-50 rounded-xl border border-primary-100 hover:shadow-lg transition-shadow group">
                <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🔍</span>
                </div>
                <h3 className="text-xl font-bold text-primary-900 mb-3">Analisis Semantik (RAG)</h3>
                <p className="text-gray-600 leading-relaxed">
                  Temukan makna kontekstual dalam naskah menggunakan teknologi <em>Retrieval-Augmented Generation</em> yang mampu menjawab pertanyaan kompleks berdasarkan isi naskah.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 bg-primary-50 rounded-xl border border-primary-100 hover:shadow-lg transition-shadow group">
                <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🕸️</span>
                </div>
                <h3 className="text-xl font-bold text-primary-900 mb-3">Knowledge Graph</h3>
                <p className="text-gray-600 leading-relaxed">
                  Visualisasikan hubungan antar tokoh, tempat, dan konsep dalam naskah melalui jejaring pengetahuan interaktif yang memetakan struktur naratif secara mendalam.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 bg-primary-50 rounded-xl border border-primary-100 hover:shadow-lg transition-shadow group">
                <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">📚</span>
                </div>
                <h3 className="text-xl font-bold text-primary-900 mb-3">Katalog Terkurasi</h3>
                <p className="text-gray-600 leading-relaxed">
                  Akses ke database naskah yang telah dikurasi dan didigitalkan dengan standar akademis, lengkap dengan metadata dan transliterasi yang akurat.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Quote Section */}
        <section className="py-16 bg-primary-800 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-accent-500/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-accent-500/10 rounded-full translate-x-1/3 translate-y-1/3"></div>
          
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <span className="text-6xl font-serif text-accent-500/30 absolute top-0 left-0 -translate-x-4 -translate-y-8">"</span>
            <blockquote className="text-2xl md:text-3xl font-serif italic leading-relaxed mb-6">
              Bangsa yang besar adalah bangsa yang menghargai sejarah dan kebudayaannya sendiri. Naskah kuno adalah jembatan emas menuju kebijaksanaan leluhur.
            </blockquote>
            <cite className="text-accent-300 font-medium not-italic tracking-wider uppercase text-sm">
              — Filosofi Nala Pustaka
            </cite>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}