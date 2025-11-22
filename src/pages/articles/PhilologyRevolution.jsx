import { Helmet } from 'react-helmet-async';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

export default function PhilologyRevolution() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-800">
      <Helmet>
        <title>Revolusi Riset Filologi: Dari Bulan ke Menit dengan Nala Pustaka - Nala Pustaka</title>
        <meta name="description" content="Bagaimana Nala Pustaka mempercepat riset filologi dari hitungan bulan menjadi menit menggunakan teknologi AI, Multi-Chat, dan Global Search." />
        <meta name="keywords" content="riset filologi, analisis naskah kuno, teknologi RAG, studi banding naskah, efisiensi riset, Nala Pustaka, AI researcher" />
        <link rel="canonical" href="https://nalapustaka.com/articles/philology-revolution" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Revolusi Riset Filologi: Dari Bulan ke Menit dengan Nala Pustaka" />
        <meta property="og:description" content="Apa yang dulunya menjadi bahan disertasi 3 tahun, kini data awalnya bisa didapat dalam 3 jam. Simak revolusi riset filologi ini." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://nalapustaka.com/articles/philology-revolution" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Revolusi Riset Filologi: Dari Bulan ke Menit dengan Nala Pustaka" />
        <meta name="twitter:description" content="Apa yang dulunya menjadi bahan disertasi 3 tahun, kini data awalnya bisa didapat dalam 3 jam. Simak revolusi riset filologi ini." />
      </Helmet>

      <Navbar />

      <main className="flex-1 py-16">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="mb-10 text-center">
            <div className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider text-accent-600 uppercase bg-accent-100 rounded-full">
              Riset & Akademik
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary-900 mb-6 leading-tight">
              Revolusi Riset Filologi: Dari Bulan ke Menit dengan Nala Pustaka
            </h1>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <span>Oleh Tim Nala Pustaka</span>
              <span>•</span>
              <span>6 Menit Baca</span>
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-lg prose-primary mx-auto text-gray-700">
            <p className="lead text-xl text-gray-600 mb-8">
              Bagi seorang filolog atau peneliti sejarah, menelusuri satu konsep spesifik di ribuan halaman naskah kuno adalah pekerjaan yang memakan waktu tahunan. Namun, teknologi AI kini mengubah paradigma tersebut secara drastis.
            </p>

            <h2 className="text-2xl font-bold text-primary-800 mt-10 mb-4">Tantangan Riset Konvensional</h2>
            <p>
              Bayangkan seorang peneliti ingin menelusuri konsep "Etika Pemerintahan" di era Mataram. Secara tradisional, ia harus:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mengumpulkan ratusan file PDF naskah (Serat Centhini, Babad Tanah Jawi, dll).</li>
              <li>Membaca manual satu per satu (text mining manual).</li>
              <li>Mencatat temuan secara terpisah.</li>
            </ul>
            <p>
              Proses ini sangat tidak efisien dan rentan terhadap <em>human error</em>. Waktu riset habis untuk pencarian data, bukan analisis kritis.
            </p>

            <h2 className="text-2xl font-bold text-primary-800 mt-10 mb-4">Nala Pustaka sebagai "Super Research Assistant"</h2>
            <p>
              Nala Pustaka hadir dengan fitur-fitur yang dirancang khusus untuk mengakselerasi penemuan ilmiah:
            </p>

            <h3 className="text-xl font-bold text-primary-700 mt-6 mb-2">1. Global RAG Search (Semantic Discovery)</h3>
            <p>
              Fitur ini memungkinkan peneliti mengajukan satu pertanyaan, dan sistem akan memindai <em>vector database</em> yang berisi 4.500+ naskah dalam hitungan detik.
            </p>
            <p>
              Contoh: Peneliti bertanya <em>"Apa pandangan tentang kepemimpinan dalam naskah-naskah Mataram?"</em>. AI akan menyintesiskan jawaban komprehensif beserta sumber naskah yang relevan.
            </p>

            <h3 className="text-xl font-bold text-primary-700 mt-6 mb-2">2. Studi Banding (Multi-Chat)</h3>
            <p>
              Fitur komparasi simultan untuk analisis filologi perbandingan. Pengguna dapat memilih 2 hingga 3 naskah berbeda, lalu mengajukan prompt yang sama. Layar akan terbagi (split screen), menampilkan respon dari masing-masing naskah secara paralel.
            </p>
            <p>
              Ini sangat berguna untuk membandingkan versi cerita, misalnya Ramayana versi Jawa Kuno vs Jawa Baru, atau variasi pupuh antar naskah.
            </p>

            <h3 className="text-xl font-bold text-primary-700 mt-6 mb-2">3. Knowledge Graph</h3>
            <p>
              Visualisasi jejaring pengetahuan yang memetakan hubungan antar tokoh, tempat, dan konsep secara otomatis. Ini memungkinkan penemuan tak terduga (<em>serendipity</em>) yang seringkali terlewat dalam pembacaan linear.
            </p>

            <div className="bg-accent-50 p-6 rounded-xl border-l-4 border-accent-500 my-8">
              <p className="font-bold text-accent-900 m-0">
                Dampak Nyata: Apa yang dulunya menjadi bahan disertasi 3 tahun, kini data awalnya bisa didapat dalam 3 jam.
              </p>
            </div>

            <p>
              Dengan Nala Pustaka, peneliti dapat melewati fase "pencarian data" yang melelahkan dan langsung masuk ke fase "analisis kritis" yang bernilai tinggi. Ini bukan tentang menggantikan peran peneliti, melainkan memberdayakan mereka dengan alat yang lebih canggih.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-16 p-8 bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl text-white text-center shadow-xl">
            <h3 className="text-2xl font-bold mb-4">Mulai Riset Anda Sekarang</h3>
            <p className="mb-6 text-primary-100">Gunakan fitur Multi-Chat untuk perbandingan naskah secara instan.</p>
            <a 
              href="/app" 
              className="inline-block px-8 py-3 bg-white text-primary-700 font-bold rounded-full hover:bg-gray-100 transition-colors shadow-md"
            >
              Coba Multi-Chat
            </a>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}