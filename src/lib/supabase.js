// --- BACKEND API URL ---
const BACKEND_API_URL = import.meta.env.VITE_RAG_API_URL || 'http://localhost:3001';

// Helper to get auth headers
const getAuthHeaders = () => {
  const sess = localStorage.getItem('nalapustaka_admin_session');
  if (!sess) return {};
  const data = JSON.parse(sess);
  return {
    'Authorization': `Bearer ${data.session.access_token}`,
    'Content-Type': 'application/json'
  };
};

// Helper functions untuk manuscripts (Refactored to use Backend API)
export const manuscriptService = {
  // OPTIMIZED: Get semua naskah WITHOUT full_text (untuk list view)
  // Saves 95%+ network transfer!
  async getAll() {
    const response = await fetch(`${BACKEND_API_URL}/api/manuscripts`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch manuscripts');
    }
    return response.json();
  },

  // OPTIMIZED: Get satu naskah by slug WITH full_text (untuk detail view)
  // Only fetched when user actually opens a manuscript
  async getBySlug(slug) {
    const response = await fetch(`${BACKEND_API_URL}/api/manuscripts/${slug}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch manuscript');
    }
    return response.json();
  },

  // Create naskah baru (require auth)
  async create(manuscript) {
    const response = await fetch(`${BACKEND_API_URL}/api/manuscripts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(manuscript),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create manuscript');
    }
    return response.json();
  },

  // Update naskah (require auth)
  async update(id, updates) {
    const response = await fetch(`${BACKEND_API_URL}/api/manuscripts/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update manuscript');
    }
    return response.json();
  },

  // Delete naskah (require auth)
  async delete(id) {
    const response = await fetch(`${BACKEND_API_URL}/api/manuscripts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete manuscript');
    }
  },

  // Reorder manuscripts
  async reorder(manuscriptId1, manuscriptId2) {
    const response = await fetch(`${BACKEND_API_URL}/api/manuscripts/reorder`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id1: manuscriptId1, id2: manuscriptId2 }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to reorder manuscripts');
    }
    return response.json();
  },

  // Toggle pin status
  async togglePin(manuscriptId) {
    const response = await fetch(`${BACKEND_API_URL}/api/manuscripts/${manuscriptId}/toggle-pin`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to toggle pin');
    }
    return response.json();
  },

  // Get pinned manuscripts count
  async getPinnedCount() {
    const manuscripts = await this.getAll();
    return manuscripts.filter(m => m.is_pinned).length;
  },
};

// Helper functions untuk auth (SECURE BACKEND VERSION)
export const authService = {
  // Login
  async signIn(email, password) {
    const response = await fetch(`${BACKEND_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login gagal');
    }

    const data = await response.json();
    
    // Store session with token
    const sessionData = {
      user: data.user,
      session: data.session,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    
    localStorage.setItem('nalapustaka_admin_session', JSON.stringify(sessionData));
    return data;
  },

  // Logout
  async signOut() {
    localStorage.removeItem('nalapustaka_admin_session');
  },

  // Get current user
  async getCurrentUser() {
    try {
      const sess = localStorage.getItem('nalapustaka_admin_session');
      if (!sess) return null;
      
      const data = JSON.parse(sess);
      if (Date.now() > data.expiresAt) {
        this.signOut();
        return null;
      }
      return data.user;
    } catch (e) {
      return null;
    }
  },
  
  // Helper to get full session/user object
  async getCurrentUserSession() {
      const user = await this.getCurrentUser();
      return { data: { user } };
  },

  // Check if user is authenticated
  async isAuthenticated() {
    const user = await this.getCurrentUser();
    return !!user;
  },
};
