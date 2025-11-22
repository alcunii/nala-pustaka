import { Helmet } from 'react-helmet-async';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function AboutUsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-primary-50 font-sans text-gray-800">
      <Helmet>
        <title>Tentang Kami - Nala Pustaka</title>
        <meta name="description" content="Mengenal lebih dekat Nala Pustaka, inisiatif pelestarian budaya Jawa melalui digitalisasi naskah kuno dan kecerdasan buatan." />
        <link rel="canonical" href="https://nalapustaka.com/about" />

        {/* Open Graph */}
        <meta property="og:title" content="Tentang Kami - Nala Pustaka" />
        <meta property="og:description" content="Mengenal lebih dekat Nala Pustaka, inisiatif pelestarian budaya Jawa melalui digitalisasi naskah kuno dan kecerdasan buatan." />
        <meta property="og:url" content="https://nalapustaka.com/about" />
        <meta property="og:type" content="website" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Tentang Kami - Nala Pustaka" />
        <meta name="twitter:description" content="Mengenal lebih dekat Nala Pustaka, inisiatif pelestarian budaya Jawa melalui digitalisasi naskah kuno dan kecerdasan buatan." />
      </Helmet>

      <Navbar />

      <main className="flex-1 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-serif font-bold text-primary-900 mb-6">Tentang Nala Pustaka</h1>
            <div className="w-24 h-1 bg-accent-500 mx-auto rounded-full mb-8"></div>
            <p className="text-xl text-gray-600 leading-relaxed">
              Sebuah inisiatif digital untuk menjembatani kearifan masa lalu dengan teknologi masa depan.
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-16">
            {/* Visi & Misi */}
            <section className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-primary-100">
              <div className="grid md:grid-cols-2 gap-10">
                <div>
                  <h2 className="text-2xl font-bold text-primary-800 mb-4 flex items-center gap-3">
                    <span className="text-3xl">👁️</span> Visi
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    Menjadi platform rujukan utama dalam pelestarian dan kajian naskah kuno Nusantara yang mudah diakses, dipahami, dan relevan bagi generasi digital.
                  </p>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-primary-800 mb-4 flex items-center gap-3">
                    <span className="text-3xl">🚀</span> Misi
                  </h2>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-accent-500 mt-1">✓</span>
                      <span>Mendigitalisasi naskah kuno dengan standar akademis tinggi.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-500 mt-1">✓</span>
                      <span>Mengembangkan teknologi AI untuk membantu analisis filologi.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-500 mt-1">✓</span>
                      <span>Menyebarluaskan pengetahuan budaya Jawa ke khalayak luas.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Latar Belakang */}
            <section>
              <h2 className="text-3xl font-serif font-bold text-primary-900 mb-6">Latar Belakang</h2>
              <div className="prose prose-lg text-gray-700 max-w-none">
                <p>
                  Nusantara menyimpan jutaan naskah kuno yang berisi kekayaan intelektual tak ternilai, mulai dari pengobatan, tata negara, sastra, hingga filosofi hidup. Namun, banyak dari naskah ini terancam rusak dimakan usia atau tersimpan di tempat yang sulit diakses oleh publik.
                </p>
                <p>
                  Tantangan lainnya adalah bahasa dan aksara yang digunakan seringkali sudah tidak dipahami oleh generasi muda. Kesenjangan ini membuat warisan leluhur seolah menjadi benda mati di museum, bukan sumber pengetahuan yang hidup.
                </p>
                <p>
                  <strong>Nala Pustaka</strong> hadir sebagai solusi. Dengan memanfaatkan teknologi <em>Large Language Models (LLM)</em> dan <em>Knowledge Graph</em>, kami tidak hanya menyimpan gambar naskah, tetapi juga "membaca" dan "memahami" isinya, sehingga pengguna dapat berinteraksi dengan naskah layaknya bertanya kepada seorang ahli.
                </p>
              </div>
            </section>

            {/* Teknologi Kami */}
            <section className="bg-primary-900 text-white p-8 md:p-12 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/10 rounded-full translate-x-1/3 -translate-y-1/3"></div>
              
              <h2 className="text-3xl font-serif font-bold text-accent-100 mb-8 relative z-10">Teknologi Kami</h2>
              
              <div className="grid md:grid-cols-3 gap-8 relative z-10">
                <div className="text-center">
                  <div className="text-4xl mb-4">🤖</div>
                  <h3 className="font-bold text-lg mb-2">AI & LLM</h3>
                  <p className="text-sm text-primary-200">
                    Model bahasa canggih untuk memahami konteks dan semantik teks Jawa Kuno.
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-4">🕸️</div>
                  <h3 className="font-bold text-lg mb-2">Knowledge Graph</h3>
                  <p className="text-sm text-primary-200">
                    Pemetaan relasi antar entitas untuk visualisasi struktur pengetahuan.
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="font-bold text-lg mb-2">RAG System</h3>
                  <p className="text-sm text-primary-200">
                    Pencarian berbasis vektor untuk akurasi jawaban yang tinggi.
                  </p>
                </div>
              </div>
            </section>

            {/* Tim Nala Pustaka */}
            <section className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-primary-100">
              <h2 className="text-3xl font-serif font-bold text-primary-900 mb-8 text-center">Tim Nala Pustaka</h2>
              
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <h3 className="font-bold text-lg text-primary-800 mb-3">Developer</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>Damar Abhinawa</li>
                    <li>Viga Laksa Hardjanto</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-bold text-lg text-primary-800 mb-3">Filolog</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>Aliffia Marsha Nadhira</li>
                    <li>Amabilita Celessya Shafaswara</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-bold text-lg text-primary-800 mb-3">Desain Visual</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>Wigyasri Titiswari</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* BudayaGo! Participation */}
            <section className="text-center py-8">
              <p className="text-gray-600 mb-6 italic">
                Dibuat dalam rangka mengikuti lomba BudayaGo! oleh Kementerian Kebudayaan Republik Indonesia
              </p>
              <div className="flex justify-center items-center gap-8 flex-wrap">
                <img
                  src="/assets/partners/logo-kemenbud.png"
                  alt="Logo Kementerian Kebudayaan"
                  className="h-16 md:h-20 object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
                <img
                  src="/assets/partners/logo-budayago.png"
                  alt="Logo BudayaGo!"
                  className="h-16 md:h-20 object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}