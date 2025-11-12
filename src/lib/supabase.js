import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create dummy client if credentials not found (allow app to run without Supabase)
let supabase;
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found. Admin panel will not work.');
  console.warn('Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env file');
  console.warn('Main website will work with hardcoded data.');
  
  // Create a dummy client that won't throw errors
  supabase = {
    from: () => ({ select: () => Promise.resolve({ data: [], error: null }) }),
    auth: {
      signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      signOut: () => Promise.resolve({ error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    }
  };
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

// Helper functions untuk manuscripts
export const manuscriptService = {
  // Get semua naskah (public)
  async getAll() {
    const { data, error } = await supabase
      .from('manuscripts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get satu naskah by slug
  async getBySlug(slug) {
    const { data, error } = await supabase
      .from('manuscripts')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create naskah baru (require auth)
  async create(manuscript) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('manuscripts')
      .insert([
        {
          ...manuscript,
          created_by: user?.id,
        },
      ])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update naskah (require auth)
  async update(id, updates) {
    const { data, error } = await supabase
      .from('manuscripts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete naskah (require auth)
  async delete(id) {
    const { error } = await supabase
      .from('manuscripts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Helper functions untuk auth
export const authService = {
  // Login
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  // Logout
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Check if user is authenticated
  async isAuthenticated() {
    const user = await this.getCurrentUser();
    return !!user;
  },
};
