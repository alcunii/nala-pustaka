import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../lib/supabase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.signIn(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Login gagal. Periksa email dan password Anda.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-amber-50 to-accent-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl shadow-xl mb-4">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-700 to-accent-600 bg-clip-text text-transparent mb-2">
            Admin Panel
          </h1>
          <p className="text-gray-600">Nala Pustaka</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-primary-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Login</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-sm text-red-600">⚠️ {error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-primary-300 focus:outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-200 text-gray-900"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-primary-300 focus:outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-200 text-gray-900"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-accent-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Logging in...' : '🔐 Login'}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-200">
            <p className="text-xs text-gray-600">
              <strong>Info:</strong> Hanya admin yang memiliki akses ke panel ini. 
              Hubungi administrator jika Anda memerlukan akses.
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-primary-600 hover:text-accent-600 font-semibold text-sm"
          >
            ← Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
}
