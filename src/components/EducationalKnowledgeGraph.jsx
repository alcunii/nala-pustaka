import { useState, useEffect } from 'react';

/**
 * Educational Knowledge Graph Component - Text-based
 * Displays relationships between manuscripts for educational exploration
 */

function EducationalKnowledgeGraph({ manuscript }) {
  const [relationships, setRelationships] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const apiUrl = import.meta.env.VITE_RAG_API_URL || 'http://localhost:3001';

  useEffect(() => {
    loadRelationships();
  }, [manuscript.id]);

  const loadRelationships = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${apiUrl}/api/knowledge-graph`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manuscriptId: manuscript.id,
          manuscriptData: manuscript
        })
      });
      
      if (!response.ok) {
        throw new Error('Gagal load knowledge graph');
      }
      
      const data = await response.json();
      
      // Check if backend returned error in relationships
      if (data.relationships?.error) {
        setError(data.relationships.error);
      } else {
        setRelationships(data.relationships);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading knowledge graph...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 text-center">
        <p className="text-yellow-800 font-semibold mb-2">⚠️ Knowledge Graph Tidak Tersedia</p>
        <p className="text-yellow-700 text-sm mb-3">Belum ada data relasi untuk naskah ini.</p>
        <p className="text-xs text-gray-600">
          Knowledge graph akan tersedia setelah lebih banyak naskah ter-analisis.
        </p>
      </div>
    );
  }

  // Render related manuscripts
  const renderRelatedManuscripts = () => {
    if (!relationships?.relatedManuscripts || relationships.relatedManuscripts.length === 0) {
      return (
        <div className="bg-gray-50 rounded-lg p-4 text-center border-2 border-gray-200">
          <p className="text-gray-600 font-medium mb-1">📚 Belum ada naskah terkait</p>
          <p className="text-sm text-gray-500">
            Sistem akan otomatis menemukan relasi setelah lebih banyak naskah dianalisis.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {relationships.relatedManuscripts.map((rel, index) => (
          <div key={index} className="bg-white rounded-lg p-4 border-2 border-primary-200 hover:border-primary-400 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-primary-900">{rel.title}</h4>
                <p className="text-sm text-primary-600 mb-1">{rel.author}</p>
                <p className="text-xs text-gray-600">{rel.reason}</p>
                {rel.similarity_score && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-accent-500 to-primary-600 h-2 rounded-full"
                          style={{ width: `${Math.round(rel.similarity_score * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-semibold text-gray-700">
                        {Math.round(rel.similarity_score * 100)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render shared characters (if available)
  const renderSharedCharacters = () => {
    if (!relationships?.sharedCharacters || relationships.sharedCharacters.length === 0) {
      return null;
    }

    return (
      <div className="space-y-2">
        {relationships.sharedCharacters.map((char, index) => (
          <div key={index} className="bg-primary-50 rounded-lg px-4 py-3 border-l-4 border-primary-500">
            <p className="font-semibold text-primary-900">{char.name}</p>
            <p className="text-sm text-gray-700">Muncul di {char.manuscripts.length} naskah</p>
          </div>
        ))}
      </div>
    );
  };

  // Render similar themes
  const renderSimilarThemes = () => {
    if (!relationships?.similarThemes || relationships.similarThemes.length === 0) {
      return null;
    }

    return (
      <div className="flex flex-wrap gap-2">
        {relationships.similarThemes.map((theme, index) => (
          <span
            key={index}
            className="px-3 py-1.5 bg-accent-100 text-accent-800 rounded-full text-sm font-semibold border border-accent-300"
          >
            {theme}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent-600 to-primary-500 rounded-xl px-5 py-4 text-white">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>🔗</span>
          Jelajahi Hubungan Naskah
        </h2>
        <p className="text-sm text-white/90 mt-1">
          Temukan naskah terkait dan perluas pemahamanmu
        </p>
      </div>

      {/* Related Manuscripts */}
      <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-5 border-2 border-primary-200">
        <h3 className="text-lg font-bold text-primary-900 mb-4 flex items-center gap-2">
          📚 Naskah Terkait
        </h3>
        {renderRelatedManuscripts()}
      </div>

      {/* Shared Characters (if any) */}
      {relationships?.sharedCharacters && relationships.sharedCharacters.length > 0 && (
        <div className="bg-white rounded-xl p-5 border-2 border-primary-200">
          <h3 className="text-lg font-bold text-primary-900 mb-4 flex items-center gap-2">
            🎭 Tokoh yang Juga Muncul
          </h3>
          {renderSharedCharacters()}
        </div>
      )}

      {/* Similar Themes */}
      {relationships?.similarThemes && relationships.similarThemes.length > 0 && (
        <div className="bg-white rounded-xl p-5 border-2 border-primary-200">
          <h3 className="text-lg font-bold text-primary-900 mb-4 flex items-center gap-2">
            💡 Tema Serupa
          </h3>
          {renderSimilarThemes()}
        </div>
      )}

      {/* Timeline Period */}
      {relationships?.timelinePeriod && (
        <div className="bg-accent-50 rounded-xl p-5 border-2 border-accent-200">
          <h3 className="text-lg font-bold text-accent-900 mb-2 flex items-center gap-2">
            ⏱️ Periode Sejarah
          </h3>
          <p className="text-gray-800 font-medium">{relationships.timelinePeriod}</p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200">
        <p className="text-sm text-gray-700 leading-relaxed">
          <strong className="text-blue-900">💡 Tips:</strong> Jelajahi naskah terkait untuk memahami konteks lebih luas. 
          Hubungan antar naskah membantu melihat bagaimana cerita, tokoh, dan ide saling terhubung dalam literatur Jawa.
        </p>
      </div>
    </div>
  );
}

export default EducationalKnowledgeGraph;