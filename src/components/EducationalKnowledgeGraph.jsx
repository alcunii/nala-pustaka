import { useState, useEffect } from 'react';

/**
 * Educational Knowledge Graph Component - Text-based
 * Displays relationships between manuscripts for educational exploration
 */

// 🔥 TOP LEVEL LOG - This should ALWAYS execute if file is loaded
console.log('🔥🔥🔥 EducationalKnowledgeGraph.jsx FILE LOADED 🔥🔥🔥');

function EducationalKnowledgeGraph({ manuscript }) {
  // 🔥 FUNCTION LEVEL LOG - This should execute when component is called
  console.log('🔥 EducationalKnowledgeGraph FUNCTION CALLED with manuscript:', manuscript?.id, manuscript?.title);
  
  const [relationships, setRelationships] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const apiUrl = import.meta.env.VITE_RAG_API_URL || 'http://localhost:3001';

  useEffect(() => {
    console.log('🎯 EducationalKnowledgeGraph MOUNTED - Code baru ter-load!', manuscript.id);
    loadRelationships();
  }, [manuscript.id]);

  const loadRelationships = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 🔍 DEBUG: Log manuscript ID yang dikirim
      console.log('🔍 Knowledge Graph Request:', {
        manuscriptId: manuscript.id,
        manuscriptTitle: manuscript.title,
        apiUrl: apiUrl
      });
      
      // Use NEW knowledge graph endpoint with cache-busting and no-cache headers
      const response = await fetch(`${apiUrl}/api/knowledge-graph/${manuscript.id}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
      
      if (!response.ok) {
        throw new Error('Gagal load knowledge graph');
      }
      
      const graphData = await response.json();
      
      // 🔍 DEBUG: Log response yang diterima
      console.log('✅ Knowledge Graph Response:', {
        manuscriptId: manuscript.id,
        nodesCount: graphData.nodes?.length || 0,
        linksCount: graphData.links?.length || 0,
        firstNode: graphData.nodes?.[0]?.label || 'N/A'
      });
      
      // Check for errors or empty data
      if (graphData.error) {
        setError(graphData.error);
      } else if (!graphData.nodes || graphData.nodes.length === 0) {
        setError('No knowledge graph data available for this manuscript');
      } else {
        // Transform new graph format to old relationships format
        const transformedData = transformGraphToRelationships(graphData);
        setRelationships(transformedData);
      }
    } catch (err) {
      console.error('❌ Knowledge Graph Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Transform graph data to relationships format
  const transformGraphToRelationships = (graphData) => {
    const { nodes, links } = graphData;
    
    // Group nodes by type
    const valueNodes = nodes.filter(n => n.type === 'VALUE');
    const personNodes = nodes.filter(n => n.type === 'PERSON');
    const locationNodes = nodes.filter(n => n.type === 'LOCATION');
    const conceptNodes = nodes.filter(n => n.type === 'CONCEPT');
    
    return {
      values: valueNodes.map(n => ({
        label: n.label,
        description: n.description,
        importance: n.importance
      })),
      persons: personNodes.map(n => ({
        label: n.label,
        description: n.description
      })),
      locations: locationNodes.map(n => ({
        label: n.label,
        description: n.description
      })),
      concepts: conceptNodes.map(n => ({
        label: n.label,
        description: n.description
      })),
      relationshipsCount: links.length
    };
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

  // Render knowledge values
  const renderValues = () => {
    if (!relationships?.values || relationships.values.length === 0) {
      return null;
    }

    return (
      <div className="mb-6 notranslate" translate="no">
        <h3 className="text-xl font-bold text-primary-900 mb-4 flex items-center gap-2">
          ✨ Kearifan Lokal & Nilai Moral
          <span className="text-sm font-normal text-gray-500">({relationships.values.length})</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {relationships.values.map((value, index) => (
            <div key={`value-${index}-${value.label}`} className={`bg-gradient-to-br ${value.importance === 'high' ? 'from-amber-50 to-yellow-50 border-amber-300' : 'from-gray-50 to-white border-gray-200'} rounded-lg p-4 border-2 notranslate`} translate="no">
              <div className="flex items-start gap-2">
                <span className="text-2xl">💎</span>
                <div className="flex-1">
                  <h4 className="font-bold text-primary-900">{value.label}</h4>
                  {value.description && (
                    <p className="text-sm text-gray-600 mt-1">{value.description}</p>
                  )}
                  {value.importance === 'high' && (
                    <span className="inline-block mt-2 px-2 py-1 bg-amber-200 text-amber-900 text-xs font-semibold rounded">
                      Nilai Utama
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render persons
  const renderPersons = () => {
    if (!relationships?.persons || relationships.persons.length === 0) {
      return null;
    }

    return (
      <div className="mb-6 notranslate" translate="no">
        <h3 className="text-xl font-bold text-primary-900 mb-4 flex items-center gap-2">
          👤 Tokoh
          <span className="text-sm font-normal text-gray-500">({relationships.persons.length})</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {relationships.persons.map((person, index) => (
            <div key={`person-${index}-${person.label}`} className="bg-blue-50 rounded-lg p-3 border-2 border-blue-200 notranslate" translate="no">
              <p className="font-semibold text-blue-900">{person.label}</p>
              {person.description && (
                <p className="text-xs text-blue-700 mt-1">{person.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render locations & concepts
  const renderOtherNodes = () => {
    const hasLocations = relationships?.locations && relationships.locations.length > 0;
    const hasConcepts = relationships?.concepts && relationships.concepts.length > 0;
    
    if (!hasLocations && !hasConcepts) {
      return null;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hasLocations && (
          <div>
            <h3 className="text-lg font-bold text-primary-900 mb-3 flex items-center gap-2">
              📍 Lokasi
            </h3>
            <div className="space-y-2">
              {relationships.locations.map((loc, index) => (
                <div key={`location-${index}-${loc.label}`} className="bg-green-50 rounded-lg p-3 border border-green-200 notranslate" translate="no">
                  <p className="font-semibold text-green-900">{loc.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {hasConcepts && (
          <div>
            <h3 className="text-lg font-bold text-primary-900 mb-3 flex items-center gap-2">
              💡 Konsep Budaya
            </h3>
            <div className="space-y-2">
              {relationships.concepts.map((concept, index) => (
                <div key={`concept-${index}-${concept.label}`} className="bg-purple-50 rounded-lg p-3 border border-purple-200 notranslate" translate="no">
                  <p className="font-semibold text-purple-900">{concept.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render related manuscripts (keep for compatibility)
  const renderRelatedManuscripts = () => {
    if (!relationships?.relatedManuscripts || relationships.relatedManuscripts.length === 0) {
      return null;
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
    <div className="space-y-6 notranslate" translate="no">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl px-5 py-4 text-white notranslate" translate="no">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>🔮</span>
          Knowledge Graph
        </h2>
        <p className="text-sm text-white/90 mt-1">
          Kearifan lokal, tokoh, dan konsep dalam naskah ini
          {relationships?.relationshipsCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs font-semibold">
              {relationships.relationshipsCount} relasi
            </span>
          )}
        </p>
      </div>

      {/* Values Section - Priority display */}
      {renderValues()}

      {/* Persons Section */}
      {renderPersons()}

      {/* Other Nodes (Locations & Concepts) */}
      {renderOtherNodes()}

      {/* Related Manuscripts (if any) */}
      {relationships?.relatedManuscripts && relationships.relatedManuscripts.length > 0 && (
        <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-5 border-2 border-primary-200">
          <h3 className="text-lg font-bold text-primary-900 mb-4 flex items-center gap-2">
            📚 Naskah Terkait
          </h3>
          {renderRelatedManuscripts()}
        </div>
      )}

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