import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, manuscriptService } from '../lib/supabase';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [manuscripts, setManuscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    author: '',
    description: '',
    full_text: '',
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
      description: '',
      full_text: '',
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
      const dataToSubmit = {
        ...formData,
        slug: formData.slug || generateSlug(formData.title),
      };

      if (editingId) {
        // Update existing
        await manuscriptService.update(editingId, dataToSubmit);
        setFormSuccess('✅ Naskah berhasil diupdate!');
      } else {
        // Create new
        await manuscriptService.create(dataToSubmit);
        setFormSuccess('✅ Naskah berhasil ditambahkan!');
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
    setFormData({
      slug: manuscript.slug,
      title: manuscript.title,
      author: manuscript.author,
      description: manuscript.description || '',
      full_text: manuscript.full_text,
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
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleFormChange}
                  placeholder="Ranggawarsita"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-primary-300 focus:outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-200"
                />
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            📚 Daftar Naskah ({manuscripts.length})
          </h2>

          {manuscripts.length === 0 ? (
            <div className="text-center py-12">
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
            </div>
          ) : (
            <div className="space-y-4">
              {manuscripts.map((manuscript) => (
                <div
                  key={manuscript.id}
                  className="border-2 border-primary-200 rounded-xl p-4 hover:border-accent-400 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {manuscript.title}
                      </h3>
                      <p className="text-sm text-primary-600 font-medium mb-2">
                        {manuscript.author}
                      </p>
                      {manuscript.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {manuscript.description}
                        </p>
                      )}
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>ID: {manuscript.slug}</span>
                        <span>
                          {new Date(manuscript.created_at).toLocaleDateString('id-ID')}
                        </span>
                        <span>
                          {manuscript.full_text.length} karakter
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
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
