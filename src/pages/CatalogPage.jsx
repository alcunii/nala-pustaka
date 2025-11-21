import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, ExternalLink, Pin, Loader2 } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { manuscriptService } from '../lib/supabase';
import { MANUSCRIPT_DATA } from '../data/manuscripts';

export default function CatalogPage() {
  const [manuscripts, setManuscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchManuscripts = async () => {
      try {
        const data = await manuscriptService.getAll();
        if (data && data.length > 0) {
          setManuscripts(data);
        } else {
          setManuscripts(Object.values(MANUSCRIPT_DATA));
        }
      } catch (error) {
        console.error('Error fetching manuscripts:', error);
        setManuscripts(Object.values(MANUSCRIPT_DATA));
      } finally {
        setLoading(false);
      }
    };

    fetchManuscripts();
  }, []);

  const filteredManuscripts = manuscripts.filter(m =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.description && m.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-800">
      <Helmet>
        <title>Katalog Naskah - Nala Pustaka</title>
        <meta name="description" content="Daftar lengkap koleksi naskah kuno Jawa yang telah terindeks dan dapat dianalisis menggunakan AI di Nala Pustaka." />
      </Helmet>

      <Navbar />

      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-10 border-b border-gray-200 pb-6">
            <h1 className="text-3xl font-serif font-bold text-primary-900 mb-2">Katalog Naskah Digital</h1>
            <p className="text-gray-600">
              Indeks lengkap koleksi naskah yang tersedia untuk analisis dan penelitian.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-xl">
              <input
                type="text"
                placeholder="Cari judul, pengarang, atau kata kunci..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-shadow shadow-sm"
              />
              <div className="absolute left-4 top-3.5 text-gray-400">
                <Search className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" />
                <p className="text-gray-500">Memuat data katalog...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-primary-50 border-b border-primary-100 text-primary-900">
                      <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider w-1/4">Judul Naskah</th>
                      <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider w-1/5">Pengarang</th>
                      <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider">Deskripsi Singkat</th>
                      <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider w-24 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredManuscripts.length > 0 ? (
                      filteredManuscripts.map((manuscript) => (
                        <tr key={manuscript.id} className="hover:bg-gray-50 transition-colors group">
                          <td className="px-6 py-4 align-top">
                            <div className="font-bold text-primary-900 group-hover:text-accent-700 transition-colors">
                              {manuscript.title}
                            </div>
                            {manuscript.is_pinned && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                                <Pin className="w-3 h-3" />
                                Unggulan
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 align-top text-gray-700 font-medium">
                            {manuscript.author}
                          </td>
                          <td className="px-6 py-4 align-top text-gray-600 text-sm leading-relaxed">
                            {manuscript.description}
                          </td>
                          <td className="px-6 py-4 align-top text-center">
                            <Link
                              to="/app"
                              state={{ selectedManuscriptId: manuscript.id }}
                              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 border border-transparent text-xs font-bold rounded text-accent-700 bg-accent-100 hover:bg-accent-200 transition-colors"
                            >
                              Buka
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                          Tidak ada naskah yang ditemukan dengan kata kunci "{searchTerm}".
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="mt-6 text-right text-sm text-gray-500">
            Menampilkan {filteredManuscripts.length} dari {manuscripts.length} naskah
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}