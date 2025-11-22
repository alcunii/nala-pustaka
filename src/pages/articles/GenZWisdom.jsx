import { Helmet } from 'react-helmet-async';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

export default function GenZWisdom() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-800">
      <Helmet>
        <title>Menghidupkan Kembali Kearifan Jawa untuk Gen Z melalui Chatbot AI - Nala Pustaka</title>
        <meta name="description" content="Nala Pustaka mengubah persepsi naskah kuno yang 'membosankan' menjadi pengalaman interaktif yang relevan bagi Gen Z melalui Chatbot AI dan gamifikasi." />
        <meta name="keywords" content="belajar naskah kuno, Gen Z budaya Jawa, chatbot sejarah, gamifikasi budaya, Nala Pustaka edukasi, mental health serat wedhatama" />
        <link rel="canonical" href="https://nalapustaka.com/articles/gen-z-wisdom" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Menghidupkan Kembali Kearifan Jawa untuk Gen Z melalui Chatbot AI" />
        <meta property="og:description" content="Naskah kuno itu 'jadul'? Pikir lagi. Lihat bagaimana AI membuat kearifan lokal relevan dengan isu mental health dan kehidupan modern." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://nalapustaka.com/articles/gen-z-wisdom" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Menghidupkan Kembali Kearifan Jawa untuk Gen Z melalui Chatbot AI" />
        <meta name="twitter:description" content="Naskah kuno itu 'jadul'? Pikir lagi. Lihat bagaimana AI membuat kearifan lokal relevan dengan isu mental health dan kehidupan modern." />
      </Helmet>

      <Navbar />

      <main className="flex-1 py-16">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="mb-10 text-center">
            <div className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider text-accent-600 uppercase bg-accent-100 rounded-full">
              Edukasi & Lifestyle
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary-900 mb-6 leading-tight">
              Menghidupkan Kembali Kearifan Jawa untuk Gen Z melalui Chatbot AI
            </h1>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <span>Oleh Tim Nala Pustaka</span>
              <span>•</span>
              <span>4 Menit Baca</span>
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-lg prose-primary mx-auto text-gray-700">
            <p className="lead text-xl text-gray-600 mb-8">
              Bagi sebagian besar Generasi Z, naskah kuno sering dianggap sebagai sesuatu yang membosankan, sulit dipahami, dan "jadul". Namun, di balik aksara yang rumit itu, tersimpan solusi untuk masalah-masalah modern.
            </p>

            <h2 className="text-2xl font-bold text-primary-800 mt-10 mb-4">Masalah Relevansi</h2>
            <p>
              Tantangan terbesar dalam pelestarian budaya bukanlah kerusakan fisik, melainkan <strong>hilangnya relevansi</strong>. Jika generasi muda tidak merasa terhubung dengan warisan leluhurnya, maka budaya tersebut perlahan akan mati.
            </p>
            <p>
              Hambatan bahasa dan penyajian yang kaku membuat kearifan lokal sulit bersaing dengan konten TikTok atau Instagram yang serba cepat dan visual.
            </p>

            <h2 className="text-2xl font-bold text-primary-800 mt-10 mb-4">Pendekatan Nala Pustaka: Edukasi yang Menyenangkan</h2>
            <p>
              Nala Pustaka mengubah cara kita berinteraksi dengan masa lalu. Melalui fitur <strong>Mode Edukasi</strong>, kami menyajikan naskah kuno dengan cara yang "Gen Z banget":
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Chatbot Interaktif:</strong> Alih-alih membaca teks panjang, pengguna bisa "mengobrol" dengan naskah. Tanyakan tentang tips kepemimpinan, asmara, atau bahkan kesehatan mental.
              </li>
              <li>
                <strong>Ringkasan Bahasa Populer:</strong> AI kami dapat menerjemahkan konsep filosofis yang berat menjadi bahasa sehari-hari yang mudah dicerna.
              </li>
              <li>
                <strong>Gamifikasi (Quiz Generator):</strong> Belajar sejarah tidak lagi membosankan dengan kuis interaktif yang dibuat secara otomatis dari isi naskah.
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-primary-800 mt-10 mb-4">Contoh Kasus: Mental Health di Serat Wedhatama</h2>
            <p>
              Salah satu contoh menarik adalah bagaimana AI Nala Pustaka dapat mengaitkan ajaran <em>Serat Wedhatama</em> dengan isu <em>mental health</em>. Konsep "nrima ing pandum" (menerima bagiannya) bisa dijelaskan dalam konteks manajemen stres dan <em>mindfulness</em> modern.
            </p>
            <p>
              Ini membuktikan bahwa naskah kuno bukan hanya benda museum, tapi sumber inspirasi yang relevan untuk kehidupan masa kini.
            </p>

            <div className="bg-green-50 p-6 rounded-xl border-l-4 border-green-500 my-8">
              <p className="font-medium text-green-900 m-0">
                "Kami ingin mengubah persepsi budaya dari beban hafalan menjadi eksplorasi yang menyenangkan."
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 p-8 bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl text-white text-center shadow-xl">
            <h3 className="text-2xl font-bold mb-4">Temukan Kearifan untuk Hidupmu</h3>
            <p className="mb-6 text-primary-100">Coba Mode Edukatif kami dan lihat sisi lain dari naskah kuno.</p>
            <a 
              href="/app" 
              className="inline-block px-8 py-3 bg-white text-primary-700 font-bold rounded-full hover:bg-gray-100 transition-colors shadow-md"
            >
              Mulai Belajar Seru
            </a>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}