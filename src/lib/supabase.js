// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- BACKEND API URL ---
const BACKEND_API_URL = import.meta.env.VITE_RAG_API_URL || 'http://localhost:3001';

// --- LOCAL AUTH REPLACEMENT (Supabase Free) ---
const MOCK_ADMIN = {
  id: '00000000-0000-0000-0000-000000000001', // Valid UUID format
  email: 'abinawa007@gmail.com',
  role: 'admin'
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
    const user = await authService.getCurrentUser();
    
    const payload = {
      ...manuscript,
      created_by: user?.id,
    };

    const response = await fetch(`${BACKEND_API_URL}/api/manuscripts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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

// Helper functions untuk auth (LOCAL VERSION - No Supabase)
export const authService = {
  // Login
  async signIn(email, password) {
    // Hardcoded credential check
    // Anda bisa mengganti password ini sesuai keinginan
    if (email === 'abinawa007@gmail.com' && password === 'Bismillah001!') {
      const sessionData = {
        user: MOCK_ADMIN,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };
      localStorage.setItem('nalapustaka_admin_session', JSON.stringify(sessionData));
      return { user: MOCK_ADMIN };
    }
    
    throw new Error('Email atau password salah.');
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
