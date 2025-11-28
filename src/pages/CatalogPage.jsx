import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, ExternalLink, Pin, Loader2, Filter, SortAsc, SortDesc, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Check, ChevronDown, X } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { manuscriptService } from '../lib/supabase';
import { MANUSCRIPT_DATA } from '../data/manuscripts';

export default function CatalogPage() {
  const [manuscripts, setManuscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter & Sort States
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [sortOption, setSortOption] = useState('newest'); // newest, oldest, az, za

  // Applied Filters (for actual filtering)
  const [appliedFilters, setAppliedFilters] = useState({
    category: 'all',
    tags: [],
    search: ''
  });
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    const fetchManuscripts = async () => {
      try {
        const data = await manuscriptService.getAll();
        console.log('[DEBUG] Manuscripts received:', data);
        if (data && data.length > 0) {
          console.log('[DEBUG] First manuscript sample:', data[0]);
          setManuscripts(data);
        } else {
          console.warn('[DEBUG] No manuscripts found from API, using fallback data');
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

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(manuscripts.map(m => m.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [manuscripts]);

  // 1. Base Filter (Search + Category) - Used for calculating available tags based on CURRENT SELECTION (not applied yet)
  // This ensures the tag list updates dynamically as the user selects categories/types in search
  const baseFilteredManuscripts = useMemo(() => {
    let result = [...manuscripts];

    // Search
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(m =>
        m.title.toLowerCase().includes(lowerTerm) ||
        m.author.toLowerCase().includes(lowerTerm) ||
        (m.description && m.description.toLowerCase().includes(lowerTerm))
      );
    }

    // Filter by Category
    if (selectedCategory !== 'all') {
      result = result.filter(m => m.category === selectedCategory);
    }

    return result;
  }, [manuscripts, searchTerm, selectedCategory]);

  // 2. Extract unique tags with counts based on filtered manuscripts
  const availableTags = useMemo(() => {
    const tagCounts = {};
    let hasOther = false;

    baseFilteredManuscripts.forEach(m => {
      if (m.tags && Array.isArray(m.tags) && m.tags.length > 0) {
        m.tags.forEach(t => {
          const normalizedTag = t.toLowerCase().trim();
          tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1;
        });
      } else {
        hasOther = true;
      }
    });

    // Sort tags by count (descending)
    const sortedTags = Object.entries(tagCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .map(([tag, count]) => ({ tag, count }));

    // Add 'other' if needed
    if (hasOther) {
      const otherCount = baseFilteredManuscripts.filter(m => !m.tags || m.tags.length === 0).length;
      sortedTags.push({ tag: 'other', count: otherCount });
    }

    return sortedTags;
  }, [baseFilteredManuscripts]);

  // 3. Final Filter (Tags + Sort)
  const processedManuscripts = useMemo(() => {
    // Start from ALL manuscripts, not the baseFilteredManuscripts (which is for pending UI)
    let result = [...manuscripts];

    // Apply APPLIED filters
    
    // Search
    if (appliedFilters.search) {
      const lowerTerm = appliedFilters.search.toLowerCase();
      result = result.filter(m =>
        m.title.toLowerCase().includes(lowerTerm) ||
        m.author.toLowerCase().includes(lowerTerm) ||
        (m.description && m.description.toLowerCase().includes(lowerTerm))
      );
    }

    // Filter by Category
    if (appliedFilters.category !== 'all') {
      result = result.filter(m => m.category === appliedFilters.category);
    }

    // Filter by Tags (Multi-select OR logic)
    if (appliedFilters.tags.length > 0) {
      result = result.filter(m => {
        // Check if 'other' is selected and matches
        const matchesOther = appliedFilters.tags.includes('other') && (!m.tags || m.tags.length === 0);
        
        // Check if any normal tag matches
        const matchesTag = m.tags && m.tags.some(t => appliedFilters.tags.includes(t.toLowerCase().trim()));
        
        return matchesOther || matchesTag;
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case 'az':
          return a.title.localeCompare(b.title);
        case 'za':
          return b.title.localeCompare(a.title);
        case 'newest':
          // Assuming newer items are added later or have a date field (fallback to ID or index if no date)
          // For now, we'll use ID comparison as a proxy if no date exists, or just keep original order reversed
          return (b.created_at || b.id) > (a.created_at || a.id) ? 1 : -1;
        case 'oldest':
          return (a.created_at || a.id) > (b.created_at || b.id) ? 1 : -1;
        default:
          return 0;
      }
    });

    return result;
  }, [manuscripts, appliedFilters, sortOption]);

  // Pagination Logic
  const totalPages = Math.ceil(processedManuscripts.length / itemsPerPage);
  const paginatedManuscripts = processedManuscripts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when APPLIED filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilters, sortOption]);

  // Handle Apply Filter
  const handleApplyFilter = () => {
    setAppliedFilters({
      category: selectedCategory,
      tags: selectedTags,
      search: searchTerm
    });
  };

  // Initialize applied filters on load
  useEffect(() => {
    if (manuscripts.length > 0 && appliedFilters.category === 'all' && appliedFilters.tags.length === 0 && !appliedFilters.search) {
       // Initial load - do nothing or set defaults if needed
    }
  }, [manuscripts]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-800">
      <Helmet>
        <title>Katalog Naskah - Nala Pustaka</title>
        <meta name="description" content="Daftar lengkap koleksi naskah kuno Jawa yang telah terindeks dan dapat dianalisis menggunakan AI di Nala Pustaka." />
        <link rel="canonical" href="https://nalapustaka.com/catalog" />

        {/* Open Graph */}
        <meta property="og:title" content="Katalog Naskah - Nala Pustaka" />
        <meta property="og:description" content="Daftar lengkap koleksi naskah kuno Jawa yang telah terindeks dan dapat dianalisis menggunakan AI di Nala Pustaka." />
        <meta property="og:url" content="https://nalapustaka.com/catalog" />
        <meta property="og:type" content="website" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Katalog Naskah - Nala Pustaka" />
        <meta name="twitter:description" content="Daftar lengkap koleksi naskah kuno Jawa yang telah terindeks dan dapat dianalisis menggunakan AI di Nala Pustaka." />
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

          {/* Controls Section: Search, Filter, Sort */}
          <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search Bar */}
            <div className="relative w-full md:max-w-md">
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

            {/* Filters & Sort */}
            <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
              {/* Category Filter */}
              <div className="relative w-full md:w-auto">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                  <Filter className="w-4 h-4" />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full md:w-auto pl-9 pr-8 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500 appearance-none cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <option value="all">Semua Kategori</option>
                  {categories.filter(c => c !== 'all').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Tag Filter (Multi-select Checkbox) */}
              <div className="relative w-full md:w-auto">
                <button
                  onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                  className="w-full md:w-auto flex items-center gap-2 pl-3 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors min-w-[200px] justify-between"
                >
                  <div className="flex items-center gap-2 text-gray-700">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="truncate max-w-[150px]">
                      {selectedTags.length === 0
                        ? 'Semua Tag'
                        : `${selectedTags.length} Tag Terpilih`}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isTagDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isTagDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsTagDropdownOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-1 w-full md:w-64 max-h-80 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-2">
                      {availableTags.length > 0 ? (
                        <div className="space-y-1">
                          {availableTags.map(({ tag, count }) => {
                            const isSelected = selectedTags.includes(tag);
                            return (
                              <label
                                key={tag}
                                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                                  isSelected ? 'bg-accent-50 text-accent-900' : 'hover:bg-gray-50 text-gray-700'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                    isSelected ? 'bg-accent-500 border-accent-500' : 'border-gray-300 bg-white'
                                  }`}>
                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                  </div>
                                  <span className="text-sm font-medium capitalize">{tag === 'other' ? 'Lainnya' : tag}</span>
                                </div>
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                  {count}
                                </span>
                                <input
                                  type="checkbox"
                                  className="hidden"
                                  checked={isSelected}
                                  onChange={() => {
                                    setSelectedTags(prev =>
                                      prev.includes(tag)
                                        ? prev.filter(t => t !== tag)
                                        : [...prev, tag]
                                    );
                                  }}
                                />
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-sm text-gray-500">
                          Tidak ada tag tersedia
                        </div>
                      )}
                      
                      {selectedTags.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <button
                            onClick={() => setSelectedTags([])}
                            className="w-full py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            Reset Filter Tag
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Apply Filter Button */}
              <button
                onClick={handleApplyFilter}
                className="w-full md:w-auto justify-center px-4 py-2.5 bg-accent-600 text-white rounded-lg text-sm font-semibold hover:bg-accent-700 transition-colors shadow-sm flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Terapkan Filter
              </button>

              {/* Sort Dropdown */}
              <div className="relative w-full md:w-auto">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                  {sortOption === 'az' || sortOption === 'za' ? (
                    <SortAsc className="w-4 h-4" />
                  ) : (
                    <SortDesc className="w-4 h-4" />
                  )}
                </div>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full md:w-auto pl-9 pr-8 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500 appearance-none cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <option value="newest">Terbaru</option>
                  <option value="oldest">Terlama</option>
                  <option value="az">Judul (A-Z)</option>
                  <option value="za">Judul (Z-A)</option>
                </select>
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
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-primary-50 border-b border-primary-100 text-primary-900">
                      <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider w-1/4">Judul Naskah</th>
                      <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider w-1/6">Kategori</th>
                      <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider w-1/5">Pengarang</th>
                      <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider">Deskripsi Singkat</th>
                      <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider w-24 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedManuscripts.length > 0 ? (
                      paginatedManuscripts.map((manuscript) => (
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
                          <td className="px-6 py-4 align-top">
                            {manuscript.category ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {manuscript.category}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs italic">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 align-top text-gray-700 font-medium">
                            {manuscript.author}
                          </td>
                          <td className="px-6 py-4 align-top text-gray-600 text-sm leading-relaxed">
                            <div className="mb-2">{manuscript.description}</div>
                            {manuscript.tags && manuscript.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {manuscript.tags.map((tag, idx) => (
                                  <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
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
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                          Tidak ada naskah yang ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden divide-y divide-gray-100">
                    {paginatedManuscripts.length > 0 ? (
                      paginatedManuscripts.map((manuscript) => (
                        <div key={manuscript.id} className="p-4 space-y-3">
                          {/* Header: Title & Pin */}
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-bold text-primary-900 text-lg leading-tight">
                              {manuscript.title}
                            </h3>
                            {manuscript.is_pinned && (
                              <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Pin className="w-3 h-3" />
                              </span>
                            )}
                          </div>

                          {/* Meta: Category & Author */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                            {manuscript.category && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {manuscript.category}
                              </span>
                            )}
                            <span className="text-gray-700 font-medium flex items-center gap-1">
                              <span className="text-gray-400">Oleh:</span> {manuscript.author}
                            </span>
                          </div>

                          {/* Description */}
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                            {manuscript.description}
                          </p>

                          {/* Tags */}
                          {manuscript.tags && manuscript.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {manuscript.tags.map((tag, idx) => (
                                <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Action */}
                          <div className="pt-2">
                            <Link
                              to="/app"
                              state={{ selectedManuscriptId: manuscript.id }}
                              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-bold rounded-lg text-accent-700 bg-accent-100 hover:bg-accent-200 transition-colors"
                            >
                              Buka Naskah
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        Tidak ada naskah yang ditemukan.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          
          {/* Pagination & Stats */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500">
              Menampilkan {paginatedManuscripts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, processedManuscripts.length)} dari {processedManuscripts.length} naskah
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hidden sm:block"
                  aria-label="First Page"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-1">
                  {(() => {
                    const maxVisible = 5;
                    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

                    if (endPage - startPage + 1 < maxVisible) {
                      startPage = Math.max(1, endPage - maxVisible + 1);
                    }

                    const pages = [];
                    if (startPage > 1) {
                      pages.push(1);
                      if (startPage > 2) pages.push('...');
                    }

                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(i);
                    }

                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) pages.push('...');
                      pages.push(totalPages);
                    }

                    return pages.map((page, idx) => (
                      <button
                        key={typeof page === 'number' ? page : `ellipsis-${idx}`}
                        onClick={() => typeof page === 'number' && setCurrentPage(page)}
                        disabled={typeof page !== 'number'}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          page === currentPage
                            ? 'bg-primary-600 text-white'
                            : typeof page !== 'number'
                            ? 'text-gray-400 cursor-default'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ));
                  })()}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hidden sm:block"
                  aria-label="Last Page"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}