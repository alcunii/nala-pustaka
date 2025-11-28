import { Helmet } from 'react-helmet-async';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

export default function DigitalSilence() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-800">
      <Helmet>
        <title>Mengatasi 'Kebisuan Digital' Naskah Kuno dengan AI - Nala Pustaka</title>
        <meta name="description" content="Bagaimana Nala Pustaka menggunakan AI dan RAG untuk memecahkan masalah 'Kebisuan Digital' dan 'Kuburan Data' pada ribuan naskah kuno Jawa yang terdigitalisasi namun sulit diakses." />
        <meta name="keywords" content="kebisuan digital, digitalisasi naskah kuno, data silos, pelestarian budaya, AI budaya, Nala Pustaka, RAG" />
        <link rel="canonical" href="https://nalapustaka.com/articles/digital-silence" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Mengatasi 'Kebisuan Digital' Naskah Kuno dengan AI" />
        <meta property="og:description" content="Ribuan naskah kuno tersimpan sebagai file digital yang 'bisu'. Simak bagaimana AI Nala Pustaka membunyikannya kembali." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://nalapustaka.com/articles/digital-silence" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Mengatasi 'Kebisuan Digital' Naskah Kuno dengan AI" />
        <meta name="twitter:description" content="Ribuan naskah kuno tersimpan sebagai file digital yang 'bisu'. Simak bagaimana AI Nala Pustaka membunyikannya kembali." />
      </Helmet>

      <Navbar />

      <main className="flex-1 py-16">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="mb-10 text-center">
            <div className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider text-accent-600 uppercase bg-accent-100 rounded-full">
              Teknologi & Budaya
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary-900 mb-6 leading-tight">
              Mengatasi "Kebisuan Digital": Ketika Ribuan Naskah Kuno Hanya Menjadi Kuburan Data
            </h1>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <span>Oleh Tim Nala Pustaka</span>
              <span>•</span>
              <span>5 Menit Baca</span>
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-lg prose-primary mx-auto text-gray-700">
            <p className="lead text-xl text-gray-600 mb-8">
              Indonesia, khususnya tanah Jawa, mewarisi ribuan naskah kuno yang memuat rekaman peradaban. Namun, upaya digitalisasi fisik yang masif justru melahirkan tantangan baru yang kami sebut sebagai paradoks <strong>"Kebisuan Digital"</strong>.
            </p>

            <h2 className="text-2xl font-bold text-primary-800 mt-10 mb-4">Paradoks Digitalisasi</h2>
            <p>
              Institusi seperti Perpustakaan Nasional dan British Library telah melakukan pekerjaan heroik dalam mendigitalisasi naskah fisik menjadi file digital. Namun, data lapangan menunjukkan realitas yang ironis. Ribuan file PDF dan gambar naskah tersebut tersimpan di server sebagai <em>Data Silos</em> atau "Kuburan Data".
            </p>
            <p>
              Mereka ada, namun sulit diakses. Tersimpan, namun tidak terpahamkan. Konservasi fisik telah berhasil, namun <strong>konservasi makna (intellectual conservation)</strong> masih tertinggal jauh.
            </p>

            <h2 className="text-2xl font-bold text-primary-800 mt-10 mb-4">Tiga Hambatan Utama (The Triple Barrier)</h2>
            <p>
              Mengapa naskah-naskah ini tetap "bisu" meskipun sudah didigitalisasi? Kami mengidentifikasi tiga masalah fundamental:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Hambatan Bahasa & Aksara:</strong> Mayoritas naskah ditulis dalam aksara Jawa/Pegon dan bahasa Kawi yang tidak lagi dikuasai oleh 99% penduduk modern.
              </li>
              <li>
                <strong>Fragmentasi Pengetahuan:</strong> Peneliti harus membuka ratusan file PDF satu per satu untuk mencari satu topik spesifik. Tidak ada indeks terpusat.
              </li>
              <li>
                <strong>Absennya Analisis Semantik:</strong> Mesin pencari biasa gagal memahami konteks. Mencari kata "Raja" mungkin melewatkan "Narendra" atau "Bupati".
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-primary-800 mt-10 mb-4">Solusi Nala Pustaka: Membunyikan Kembali Naskah</h2>
            <p>
              <strong>Nala Pustaka</strong> hadir sebagai solusi pionir untuk memecahkan kebuntuan ini. Kami mengembangkan ekosistem berbasis <em>Artificial Intelligence</em> yang mentransformasi arsip statis menjadi pustaka cerdas.
            </p>
            <p>
              Menggunakan teknologi <strong>Retrieval-Augmented Generation (RAG)</strong> dengan model Gemini 2.5 Flash Lite, kami telah mengindeks lebih dari 4.500 naskah kuno. Teknologi ini memungkinkan:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li><strong>Pencarian Semantik:</strong> Menemukan naskah berdasarkan makna, bukan hanya kata kunci.</li>
              <li><strong>Chat Interaktif:</strong> Bertanya langsung pada naskah layaknya berdialog dengan penulisnya.</li>
              <li><strong>Anti-Halusinasi:</strong> Sistem kami menjamin jawaban AI selalu berdasarkan data naskah asli, bukan karangan.</li>
            </ol>

            <div className="bg-primary-50 p-6 rounded-xl border-l-4 border-primary-500 my-8">
              <p className="italic text-primary-800 m-0">
                "Nala adalah jembatan kognitif yang menghubungkan kebijaksanaan masa lalu dengan tantangan masa depan."
              </p>
            </div>

            <p>
              Dengan Nala Pustaka, warisan leluhur tidak lagi menjadi objek pasif di museum digital, melainkan subjek aktif yang siap memberikan wawasan bagi permasalahan modern.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-16 p-8 bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl text-white text-center shadow-xl">
            <h3 className="text-2xl font-bold mb-4">Siap Menjelajahi Naskah Kuno?</h3>
            <p className="mb-6 text-primary-100">Coba fitur Chat AI kami sekarang dan temukan kearifan yang tersembunyi.</p>
            <a 
              href="/app" 
              className="inline-block px-8 py-3 bg-white text-primary-700 font-bold rounded-full hover:bg-gray-100 transition-colors shadow-md"
            >
              Mulai Chat Sekarang
            </a>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}