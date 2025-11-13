import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, manuscriptService } from '../lib/supabase';

// Fungsi untuk auto-generate knowledge graph menggunakan Gemini API
const generateKnowledgeGraph = async (title, author, fullText) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ Gemini API Key tidak ditemukan. Knowledge graph akan kosong.');
    return { nodes: [], links: [] };
  }

  try {
    // Smart chunking: Use first 5000 characters for analysis
    // This balances accuracy with token limits
    const textSample = fullText.length > 5000 
      ? fullText.substring(0, 5000) + '\n\n[... naskah dilanjutkan ...]'
      : fullText;
    
    const prompt = `Analisis naskah berikut dan ekstrak knowledge graph dalam format JSON.

NASKAH:
Judul: ${title}
Pengarang: ${author}

Teks Lengkap:
${textSample}

INSTRUKSI:
1. Extract maksimal 10-12 nodes penting dari SELURUH teks (tokoh, konsep, struktur, tema)
2. Buat links yang menghubungkan nodes dengan relasi yang jelas
3. Kategorikan nodes: "Karya", "Tokoh", "Konsep", "Struktur"
4. Prioritaskan elemen yang muncul berulang atau penting dalam naskah

FORMAT OUTPUT (JSON strict):
{
  "nodes": [
    {"id": "id-unique-lowercase", "label": "Nama Node", "type": "Karya|Tokoh|Konsep|Struktur"}
  ],
  "links": [
    {"source": "id-source", "target": "id-target", "label": "Relasi"}
  ]
}

CONTOH untuk Serat Wulangreh:
{
  "nodes": [
    {"id": "wulangreh", "label": "Serat Wulangreh", "type": "Karya"},
    {"id": "pakubuwana-iv", "label": "Pakubuwana IV", "type": "Tokoh"},
    {"id": "ajaran-moral", "label": "Ajaran Moral", "type": "Konsep"},
    {"id": "kepemimpinan", "label": "Kepemimpinan", "type": "Konsep"}
  ],
  "links": [
    {"source": "pakubuwana-iv", "target": "wulangreh", "label": "Menulis"},
    {"source": "wulangreh", "target": "ajaran-moral", "label": "Membahas"},
    {"source": "ajaran-moral", "target": "kepemimpinan", "label": "Terkait"}
  ]
}

PENTING: 
- Hanya output JSON, tidak ada teks lain!
- ID harus lowercase, no space, gunakan dash (-)
- Minimal 6 nodes, maksimal 12 nodes`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            topP: 0.8,
            maxOutputTokens: 1024,
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error('Gagal generate knowledge graph');
    }

    const result = await response.json();
    const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI tidak mengembalikan JSON valid');
    }

    const knowledgeGraph = JSON.parse(jsonMatch[0]);
    
    // Validate structure
    if (!knowledgeGraph.nodes || !knowledgeGraph.links) {
      throw new Error('Structure knowledge graph tidak valid');
    }

    return knowledgeGraph;
  } catch (error) {
    console.error('Error generating knowledge graph:', error);
    // Fallback: Return minimal graph dengan info naskah
    return {
      nodes: [
        { id: title.toLowerCase().replace(/\s+/g, '-'), label: title, type: 'Karya' },
        { id: author.toLowerCase().replace(/\s+/g, '-'), label: author, type: 'Tokoh' }
      ],
      links: [
        { source: author.toLowerCase().replace(/\s+/g, '-'), target: title.toLowerCase().replace(/\s+/g, '-'), label: 'Menulis' }
      ]
    };
  }
};

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [manuscripts, setManuscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  // Sort & Filter state (NEW)
  const [sortBy, setSortBy] = useState('display_order'); // 'display_order', 'created_at', 'title', 'author'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const [filterAuthorType, setFilterAuthorType] = useState('all'); // 'all', 'custom', 'unknown', 'multiple'
  const [filterSource, setFilterSource] = useState('all'); // 'all', 'with_source', 'no_source'
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    author: '',
    authorType: 'custom', // 'custom', 'unknown', 'multiple'
    description: '',
    full_text: '',
    source_url: '', // NEW: Source link feature
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
    loadManuscripts();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        navigate('/admin');
        return;
      }
      setUser(currentUser);
    } catch (error) {
      console.error('Auth error:', error);
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  const loadManuscripts = async () => {
    try {
      const data = await manuscriptService.getAll();
      setManuscripts(data || []);
    } catch (error) {
      console.error('Error loading manuscripts:', error);
    }
  };

  // Sort, Filter, and Search logic (NEW)
  const getFilteredAndSortedManuscripts = () => {
    let filtered = [...manuscripts];

    // 1. Apply Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((m) => {
        return (
          m.title.toLowerCase().includes(query) ||
          m.author.toLowerCase().includes(query) ||
          (m.description && m.description.toLowerCase().includes(query)) ||
          m.slug.toLowerCase().includes(query)
        );
      });
    }

    // 2. Apply Author Type Filter
    if (filterAuthorType !== 'all') {
      filtered = filtered.filter((m) => {
        if (filterAuthorType === 'unknown') {
          return m.author === 'Tidak Diketahui';
        } else if (filterAuthorType === 'multiple') {
          return m.author === 'Banyak Penulis';
        } else if (filterAuthorType === 'custom') {
          return m.author !== 'Tidak Diketahui' && m.author !== 'Banyak Penulis';
        }
        return true;
      });
    }

    // 3. Apply Source Filter
    if (filterSource !== 'all') {
      filtered = filtered.filter((m) => {
        if (filterSource === 'with_source') {
          return m.source_url && m.source_url.trim() !== '';
        } else if (filterSource === 'no_source') {
          return !m.source_url || m.source_url.trim() === '';
        }
        return true;
      });
    }

    // 4. Apply Sorting
    filtered.sort((a, b) => {
      let compareA, compareB;

      switch (sortBy) {
        case 'title':
          compareA = a.title.toLowerCase();
          compareB = b.title.toLowerCase();
          break;
        case 'author':
          compareA = a.author.toLowerCase();
          compareB = b.author.toLowerCase();
          break;
        case 'created_at':
          compareA = new Date(a.created_at);
          compareB = new Date(b.created_at);
          break;
        case 'display_order':
        default:
          compareA = a.display_order || 0;
          compareB = b.display_order || 0;
          break;
      }

      if (sortOrder === 'asc') {
        return compareA > compareB ? 1 : compareA < compareB ? -1 : 0;
      } else {
        return compareA < compareB ? 1 : compareA > compareB ? -1 : 0;
      }
    });

    return filtered;
  };

  const filteredManuscripts = getFilteredAndSortedManuscripts();

  const handleReorder = async (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === filteredManuscripts.length - 1) return;

    try {
      // Use filtered list for UI index, but get actual manuscript IDs
      const currentManuscript = filteredManuscripts[index];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const targetManuscript = filteredManuscripts[targetIndex];

      await manuscriptService.reorder(currentManuscript.id, targetManuscript.id);
      await loadManuscripts();
      setFormSuccess('✅ Urutan naskah berhasil diubah!');
      setTimeout(() => setFormSuccess(''), 3000);
    } catch (error) {
      console.error('Reorder error:', error);
      
      // Check if error is about missing column
      if (error.message && error.message.includes('display_order')) {
        setFormError('⚠️ Database belum diupdate! Jalankan SQL migration di guide/PHASE1_DATABASE_MIGRATION.sql terlebih dahulu.');
      } else {
        setFormError(error.message || 'Gagal mengubah urutan');
      }
      
      setTimeout(() => setFormError(''), 5000);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      navigate('/admin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const resetForm = () => {
    setFormData({
      slug: '',
      title: '',
      author: '',
      authorType: 'custom',
      description: '',
      full_text: '',
      source_url: '',
    });
    setEditingId(null);
    setFormError('');
    setFormSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);

    try {
      // Auto-generate slug if empty
      const slug = formData.slug || generateSlug(formData.title);
      
      // Determine final author based on authorType
      let finalAuthor = formData.author;
      if (formData.authorType === 'unknown') {
        finalAuthor = 'Tidak Diketahui';
      } else if (formData.authorType === 'multiple') {
        finalAuthor = 'Banyak Penulis';
      }
      
      // Auto-generate knowledge graph (only for new manuscripts)
      let knowledgeGraph = null;
      if (!editingId) {
        setFormSuccess('🔄 Generating knowledge graph...');
        knowledgeGraph = await generateKnowledgeGraph(
          formData.title,
          finalAuthor,
          formData.full_text
        );
      }

      // Prepare data to submit (exclude authorType - it's UI only)
      const dataToSubmit = {
        slug,
        title: formData.title,
        author: finalAuthor,
        description: formData.description,
        full_text: formData.full_text,
        source_url: formData.source_url,
        ...(knowledgeGraph && { knowledge_graph: knowledgeGraph })
      };

      if (editingId) {
        // Update existing
        await manuscriptService.update(editingId, dataToSubmit);
        setFormSuccess('✅ Naskah berhasil diupdate!');
      } else {
        // Create new
        await manuscriptService.create(dataToSubmit);
        setFormSuccess('✅ Naskah berhasil ditambahkan dengan knowledge graph!');
      }

      // Reload list
      await loadManuscripts();
      
      // Reset form after success
      setTimeout(() => {
        resetForm();
        setShowForm(false);
      }, 2000);
    } catch (error) {
      console.error('Submit error:', error);
      setFormError(error.message || 'Gagal menyimpan naskah');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (manuscript) => {
    // Determine authorType from existing author value
    let authorType = 'custom';
    let authorValue = manuscript.author;
    
    if (manuscript.author === 'Tidak Diketahui') {
      authorType = 'unknown';
      authorValue = '';
    } else if (manuscript.author === 'Banyak Penulis') {
      authorType = 'multiple';
      authorValue = '';
    }
    
    setFormData({
      slug: manuscript.slug,
      title: manuscript.title,
      author: authorValue,
      authorType: authorType,
      description: manuscript.description || '',
      full_text: manuscript.full_text,
      source_url: manuscript.source_url || '',
    });
    setEditingId(manuscript.id);
    setShowForm(true);
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Yakin ingin menghapus "${title}"?`)) return;

    try {
      await manuscriptService.delete(id);
      setFormSuccess('✅ Naskah berhasil dihapus!');
      await loadManuscripts();
      setTimeout(() => setFormSuccess(''), 3000);
    } catch (error) {
      console.error('Delete error:', error);
      setFormError(error.message || 'Gagal menghapus naskah');
    }
  };

  // NEW: Pin/Unpin handler
  const handleTogglePin = async (id, currentPinStatus, title) => {
    try {
      await manuscriptService.togglePin(id);
      const action = currentPinStatus ? 'diunpin' : 'dipin';
      setFormSuccess(`✅ "${title}" berhasil ${action}!`);
      await loadManuscripts();
      setTimeout(() => setFormSuccess(''), 3000);
    } catch (error) {
      console.error('Pin toggle error:', error);
      setFormError(error.message || 'Gagal mengubah status pin');
      setTimeout(() => setFormError(''), 5000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-amber-50 to-accent-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b-2 border-primary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-xs text-gray-600">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-gray-700 hover:text-primary-600 font-semibold text-sm"
            >
              🏠 Beranda
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 font-semibold text-sm"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Global Success/Error */}
        {formSuccess && !showForm && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
            <p className="text-sm text-green-600">{formSuccess}</p>
          </div>
        )}
        {formError && !showForm && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <p className="text-sm text-red-600">⚠️ {formError}</p>
          </div>
        )}

        {/* Add Button */}
        {!showForm && (
          <div className="mb-6">
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-accent-600 transition-all shadow-lg"
            >
              ➕ Tambah Naskah Baru
            </button>
          </div>
        )}

        {/* Form (saat showForm = true) */}
        {showForm && (
          <div className="mb-8 bg-white rounded-2xl shadow-xl border-2 border-primary-300 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? '✏️ Edit Naskah' : '➕ Tambah Naskah Baru'}
              </h2>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="text-gray-500 hover:text-red-600"
              >
                ✖️ Tutup
              </button>
            </div>

            {formSuccess && (
              <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                <p className="text-sm text-green-600">{formSuccess}</p>
              </div>
            )}
            {formError && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <p className="text-sm text-red-600">⚠️ {formError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Judul Naskah <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="Serat Tripama"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-primary-300 focus:outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-200"
                />
              </div>

              {/* Slug (optional, auto-generated) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Slug (ID Unik)
                  <span className="text-gray-500 text-xs ml-2">(Opsional, auto-generated dari judul)</span>
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleFormChange}
                  placeholder="tripama"
                  className="w-full px-4 py-3 rounded-xl border-2 border-primary-300 focus:outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-200"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lowercase, no space. Contoh: tripama, kalatidha, wedhatama
                </p>
              </div>

              {/* Author */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pengarang <span className="text-red-500">*</span>
                </label>
                
                {/* Author Type Dropdown */}
                <select
                  name="authorType"
                  value={formData.authorType}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-primary-300 focus:outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-200 mb-3"
                >
                  <option value="custom">✏️ Custom (Tulis Nama)</option>
                  <option value="unknown">❓ Tidak Diketahui</option>
                  <option value="multiple">👥 Banyak Penulis</option>
                </select>

                {/* Custom Author Input (only show if custom selected) */}
                {formData.authorType === 'custom' && (
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleFormChange}
                    placeholder="Ranggawarsita"
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-primary-300 focus:outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-200"
                  />
                )}
                
                {formData.authorType === 'unknown' && (
                  <div className="px-4 py-3 bg-gray-100 rounded-xl border-2 border-gray-300 text-gray-600">
                    Pengarang: <strong>Tidak Diketahui</strong>
                  </div>
                )}
                
                {formData.authorType === 'multiple' && (
                  <div className="px-4 py-3 bg-gray-100 rounded-xl border-2 border-gray-300 text-gray-600">
                    Pengarang: <strong>Banyak Penulis</strong>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Deskripsi Singkat
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Ajaran kebijaksanaan dan tata pemerintahan yang baik."
                  rows="2"
                  className="w-full px-4 py-3 rounded-xl border-2 border-primary-300 focus:outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-200"
                />
              </div>

              {/* Source URL (NEW) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sumber (Link) <span className="text-gray-500 text-xs">(Opsional)</span>
                </label>
                <input
                  type="url"
                  name="source_url"
                  value={formData.source_url}
                  onChange={handleFormChange}
                  placeholder="https://example.com/naskah-original"
                  className="w-full px-4 py-3 rounded-xl border-2 border-primary-300 focus:outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-200"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Link ke sumber naskah (website, perpustakaan digital, dll). User akan melihat tombol "Sumber" jika diisi.
                </p>
              </div>

              {/* Full Text */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Isi Lengkap Naskah <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="full_text"
                  value={formData.full_text}
                  onChange={handleFormChange}
                  placeholder={`PUPUH I: PANGKUR

1. Mingkar-mingkuring angkara...
2. ...

(Paste isi lengkap naskah di sini)`}
                  rows="15"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-primary-300 focus:outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-200 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste isi lengkap naskah. Maksimal ~10,000 kata untuk performa optimal.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-accent-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? '⏳ Menyimpan...' : (editingId ? '💾 Update Naskah' : '➕ Tambah Naskah')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                >
                  ❌ Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Manuscripts List */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-primary-300 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              📚 Daftar Naskah ({filteredManuscripts.length}/{manuscripts.length})
            </h2>
          </div>

          {/* Sort & Filter Controls (NEW) */}
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Cari naskah (judul, pengarang, deskripsi, slug)..."
                className="w-full px-4 py-3 pl-12 rounded-xl border-2 border-primary-300 focus:outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-200 bg-white"
              />
              <svg
                className="absolute left-4 top-3.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-3 text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort & Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Sort By */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  � Urutkan Berdasarkan
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-primary-300 focus:outline-none focus:border-accent-500 text-sm"
                >
                  <option value="display_order">🔢 Urutan Display</option>
                  <option value="created_at">📅 Tanggal Dibuat</option>
                  <option value="title">🔤 Judul</option>
                  <option value="author">✍️ Pengarang</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  ⬆️⬇️ Urutan
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-primary-300 focus:outline-none focus:border-accent-500 text-sm"
                >
                  <option value="desc">
                    {sortBy === 'title' || sortBy === 'author' ? 'Z → A' : 'Tertinggi → Terendah'}
                  </option>
                  <option value="asc">
                    {sortBy === 'title' || sortBy === 'author' ? 'A → Z' : 'Terendah → Tertinggi'}
                  </option>
                </select>
              </div>

              {/* Filter Author Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  👤 Tipe Pengarang
                </label>
                <select
                  value={filterAuthorType}
                  onChange={(e) => setFilterAuthorType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-primary-300 focus:outline-none focus:border-accent-500 text-sm"
                >
                  <option value="all">📖 Semua Tipe</option>
                  <option value="custom">✏️ Custom (Nama Penulis)</option>
                  <option value="unknown">❓ Tidak Diketahui</option>
                  <option value="multiple">👥 Banyak Penulis</option>
                </select>
              </div>
            </div>

            {/* Filter Source (Secondary Row) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  🔗 Sumber
                </label>
                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-primary-300 focus:outline-none focus:border-accent-500 text-sm"
                >
                  <option value="all">🌐 Semua</option>
                  <option value="with_source">✅ Ada Sumber</option>
                  <option value="no_source">❌ Tanpa Sumber</option>
                </select>
              </div>

              {/* Reset Filters Button */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSortBy('display_order');
                    setSortOrder('desc');
                    setFilterAuthorType('all');
                    setFilterSource('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold text-sm transition-all"
                >
                  🔄 Reset Filter
                </button>
              </div>
            </div>

            {/* Active Filters Summary */}
            {(searchQuery || filterAuthorType !== 'all' || filterSource !== 'all') && (
              <div className="flex items-center gap-2 flex-wrap p-3 bg-accent-50 rounded-lg border border-accent-200">
                <span className="text-xs font-semibold text-gray-700">Filter Aktif:</span>
                {searchQuery && (
                  <span className="px-2 py-1 bg-white rounded-md text-xs border border-primary-300">
                    🔍 "{searchQuery}"
                  </span>
                )}
                {filterAuthorType !== 'all' && (
                  <span className="px-2 py-1 bg-white rounded-md text-xs border border-primary-300">
                    👤 {filterAuthorType === 'custom' ? 'Custom' : filterAuthorType === 'unknown' ? 'Tidak Diketahui' : 'Banyak Penulis'}
                  </span>
                )}
                {filterSource !== 'all' && (
                  <span className="px-2 py-1 bg-white rounded-md text-xs border border-primary-300">
                    🔗 {filterSource === 'with_source' ? 'Ada Sumber' : 'Tanpa Sumber'}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Manuscripts List */}
          {filteredManuscripts.length === 0 ? (
            <div className="text-center py-12">
              {manuscripts.length === 0 ? (
                <>
                  <p className="text-gray-500 mb-4">Belum ada naskah. Tambahkan yang pertama!</p>
                  <button
                    onClick={() => {
                      resetForm();
                      setShowForm(true);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-accent-600 transition-all shadow-lg"
                  >
                    ➕ Tambah Naskah
                  </button>
                </>
              ) : (
                <>
                  <p className="text-gray-500 mb-4">Tidak ada naskah yang cocok dengan filter.</p>
                  <button
                    onClick={() => {
                      setSortBy('display_order');
                      setSortOrder('desc');
                      setFilterAuthorType('all');
                      setFilterSource('all');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 font-semibold text-sm"
                  >
                    🔄 Reset Filter
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredManuscripts.map((manuscript, index) => (
                <div
                  key={manuscript.id}
                  className="border-2 border-primary-200 rounded-xl p-4 hover:border-accent-400 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start gap-4">
                    {/* Ordering Buttons */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleReorder(index, 'up')}
                        disabled={index === 0}
                        className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          index === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                        }`}
                        title="Naikkan urutan"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleReorder(index, 'down')}
                        disabled={index === manuscripts.length - 1}
                        className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          index === manuscripts.length - 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                        }`}
                        title="Turunkan urutan"
                      >
                        ▼
                      </button>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                        {manuscript.title}
                        {manuscript.is_pinned && (
                          <span className="inline-flex items-center px-2 py-1 rounded-lg bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-400 text-xs font-bold text-yellow-700">
                            📌 Pinned
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-primary-600 font-medium mb-2">
                        {manuscript.author}
                      </p>
                      {manuscript.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {manuscript.description}
                        </p>
                      )}
                      <div className="flex gap-4 text-xs text-gray-500 flex-wrap">
                        <span>ID: {manuscript.slug}</span>
                        <span>
                          {new Date(manuscript.created_at).toLocaleDateString('id-ID')}
                        </span>
                        <span>
                          {manuscript.full_text.length} karakter
                        </span>
                        {manuscript.source_url && (
                          <span className="text-blue-600">
                            🔗 Ada sumber
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTogglePin(manuscript.id, manuscript.is_pinned, manuscript.title)}
                        className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                          manuscript.is_pinned
                            ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border-2 border-yellow-400 hover:from-yellow-200 hover:to-amber-200'
                            : 'bg-gray-100 text-gray-600 border-2 border-gray-300 hover:bg-gray-200'
                        }`}
                        title={manuscript.is_pinned ? 'Unpin dari halaman utama' : 'Pin ke halaman utama (max 5)'}
                      >
                        {manuscript.is_pinned ? '📌 Unpin' : '📍 Pin'}
                      </button>
                      <button
                        onClick={() => handleEdit(manuscript)}
                        className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 font-semibold text-sm"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(manuscript.id, manuscript.title)}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-semibold text-sm"
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
