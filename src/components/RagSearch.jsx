import { useState } from 'react';
import { ragApi } from '../lib/ragApi';

/**
 * Enhanced RAG Search Component - Multi-Manuscript Research
 */
export default function RagSearch({ onResultClick, onDeepChatRequest, onResearchStart }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedManuscripts, setSelectedManuscripts] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Research templates for guided queries
  const researchTemplates = [
    {
      id: 'comparative',
      title: '📊 Analisis Komparatif',
      query: 'Bandingkan konsep kepemimpinan dalam naskah-naskah yang dipilih'
    },
    {
      id: 'evolution',
      title: '🕰️ Evolusi Konsep',
      query: 'Bagaimana konsep etika berkembang dalam naskah-naskah ini?'
    },
    {
      id: 'wisdom',
      title: '💡 Kearifan Lokal',
      query: 'Identifikasi nilai-nilai kearifan lokal yang relevan untuk kehidupan modern'
    },
    {
      id: 'character',
      title: '👤 Studi Tokoh',
      query: 'Analisis karakter tokoh utama dan nilai-nilai yang mereka ajarkan'
    },
    {
      id: 'themes',
      title: '🎯 Tema Bersama',
      query: 'Apa tema-tema universal yang muncul dalam naskah-naskah ini?'
    }
  ];

  // Handle manuscript selection toggle
  const toggleManuscriptSelection = (result) => {
    const manuscriptId = result.metadata.manuscriptId; // This is Pinecone UUID
    
    setSelectedManuscripts(prev => {
      const isSelected = prev.some(m => m.manuscript_id === manuscriptId);
      
      if (isSelected) {
        return prev.filter(m => m.manuscript_id !== manuscriptId);
      } else {
        if (prev.length >= 5) {
          setError('Maksimal 5 naskah dapat dipilih untuk penelitian');
          setTimeout(() => setError(null), 3000);
          return prev;
        }
        return [...prev, {
          id: manuscriptId, // Keep for backwards compatibility
          manuscript_id: manuscriptId, // Pinecone UUID - this is what backend needs!
          title: result.metadata.title,
          author: result.metadata.author,
          year: result.metadata.year
        }];
      }
    });
  };

  // Start multi-manuscript research
  const handleStartResearch = () => {
    if (selectedManuscripts.length < 2) {
      setError('Pilih minimal 2 naskah untuk penelitian komparatif');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (onResearchStart) {
      onResearchStart(selectedManuscripts, query);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Masukkan kata kunci pencarian');
      return;
    }

    setIsSearching(true);
    setError(null);
    setHasSearched(true);
    setSelectedManuscripts([]); // Reset selection on new search

    try {
      const data = await ragApi.search(query, 10, 0.3); // Get more results with lower threshold
      setResults(data.results || []);
      
      if (data.results.length === 0) {
        setError('Tidak ada hasil yang ditemukan. Coba kata kunci lain.');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat mencari');
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const highlightScore = (score) => {
    if (score >= 0.7) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 0.6) return 'bg-blue-100 text-blue-800 border-blue-300';
    return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  };

  return (
    <div className="space-y-6">
      {/* Research Templates */}
      <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl border-2 border-primary-200 p-5">
        <h3 className="text-lg font-bold text-primary-800 mb-3 flex items-center gap-2">
          💡 Template Penelitian
          <span className="text-xs font-normal text-gray-600 bg-white px-2 py-1 rounded-full">Pilih 2-5 naskah</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {researchTemplates.map(template => (
            <button
              key={template.id}
              onClick={() => setQuery(template.query)}
              className="text-left p-3 bg-white rounded-lg border-2 border-primary-200 hover:border-accent-400 hover:shadow-md transition-all group"
            >
              <h4 className="font-semibold text-primary-800 group-hover:text-accent-600 transition-colors">
                {template.title}
              </h4>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{template.query}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-primary-200 p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label htmlFor="rag-search" className="block text-sm font-bold text-primary-700 mb-2">
              🔬 Penelitian Multi-Manuscript dengan AI
            </label>
            <div className="flex gap-3">
              <input
                id="rag-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Contoh: Bandingkan konsep kepemimpinan dalam naskah..."
                className="flex-1 px-4 py-3 border-2 border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                disabled={isSearching}
              />
              <button
                type="submit"
                disabled={isSearching || !query.trim()}
                className="px-8 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-bold rounded-xl hover:from-primary-700 hover:to-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                {isSearching ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Mencari...
                  </span>
                ) : (
                  'Cari'
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Tips: Pilih 2-5 naskah untuk analisis komparatif. Gunakan template penelitian untuk hasil optimal.
            </p>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Results */}
      {hasSearched && !isSearching && results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-primary-800">
              📚 {results.length} naskah ditemukan
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                Dipilih: <span className="font-bold text-accent-600">{selectedManuscripts.length}/5</span>
              </span>
              {selectedManuscripts.length >= 2 && (
                <button
                  onClick={handleStartResearch}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold rounded-lg hover:from-green-700 hover:to-green-600 transition-all shadow-md flex items-center gap-2"
                >
                  🚀 Mulai Penelitian ({selectedManuscripts.length} naskah)
                </button>
              )}
            </div>
          </div>

          <div className="grid gap-4">
            {results.map((result, index) => {
              const isSelected = selectedManuscripts.some(m => m.id === result.metadata.manuscriptId);
              
              return (
                <div
                  key={result.id || index}
                  className={`bg-white rounded-xl border-2 transition-all p-5 ${
                    isSelected 
                      ? 'border-green-400 bg-green-50 shadow-lg' 
                      : 'border-primary-200 hover:border-accent-400 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <div className="mt-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleManuscriptSelection(result)}
                        className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                      />
                    </div>
                    
                    <div className="flex-1 cursor-pointer" onClick={() => onResultClick && onResultClick(result)}>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-primary-800 mb-1">
                      📜 {result.metadata.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <span>👤 {result.metadata.author}</span>
                      <span>📅 {result.metadata.year}</span>
                      <span className={`px-2 py-1 rounded-lg border font-medium text-xs ${highlightScore(result.score)}`}>
                        ⭐ {(result.score * 100).toFixed(1)}% relevan
                      </span>
                    </div>
                  </div>
                </div>

                {/* Excerpt */}
                <div className="bg-primary-50 rounded-lg p-4 mb-3">
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                    {result.metadata.chunkText}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeepChatRequest({
                          manuscriptId: result.metadata.manuscriptId,
                          title: result.metadata.title,
                          author: result.metadata.author,
                          initialQuery: query
                        });
                      }}
                      className="px-3 py-1.5 bg-gradient-to-r from-primary-600 to-accent-500 text-white text-sm font-semibold rounded-lg hover:from-primary-700 hover:to-accent-600 transition-all flex items-center gap-1"
                    >
                      💬 Chat dengan naskah ini
                    </button>
                    <a
                      href={result.metadata.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-accent-600 hover:text-accent-700 font-medium flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Lihat di Sastra.org
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                      </svg>
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      Chunk {result.metadata.chunkIndex} • {result.metadata.tokenCount} tokens
                    </span>
                    {isSelected && (
                      <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        ✓ Terpilih
                      </span>
                    )}
                  </div>
                </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State - Show before first search */}
      {!hasSearched && !isSearching && (
        <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl border-2 border-primary-200 p-8 text-center">
          <div className="inline-flex p-4 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl mb-4">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-primary-800 mb-2">
            Multi-Manuscript Research
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Cari naskah, pilih 2-5 yang relevan, dan dapatkan analisis komparatif mendalam dengan AI.
            Sistem akan mengidentifikasi persamaan, perbedaan, dan insight lintas naskah.
          </p>
        </div>
      )}
    </div>
  );
}
