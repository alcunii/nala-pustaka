/**
 * RAG Backend API Service
 * Connects to backend server for semantic search
 */

const API_BASE_URL = import.meta.env.VITE_RAG_API_URL || 'http://localhost:3001';

class RagApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Check backend health status
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('RAG Backend health check failed:', error);
      throw error;
    }
  }

  /**
   * Search manuscripts using semantic search
   * @param {string} query - Search query
   * @param {number} topK - Number of results to return (default: 5)
   * @param {number} minScore - Minimum similarity score (default: 0.5)
   */
  async search(query, topK = 5, minScore = 0.5) {
    try {
      if (!query || query.trim().length === 0) {
        throw new Error('Query cannot be empty');
      }

      const response = await fetch(`${this.baseUrl}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          topK,
          minScore,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Search failed: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('RAG Search error:', error);
      throw error;
    }
  }


  /**
   * RAG Chat - Conversational AI with cross-document retrieval
   */
  async ragChat(query, conversationHistory = []) {
    try {
      if (!query || query.trim().length === 0) {
        throw new Error('Query cannot be empty');
      }

      const response = await fetch(`${this.baseUrl}/api/rag-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), conversationHistory }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `RAG Chat failed`);
      }

      return await response.json();
    } catch (error) {
      console.error('RAG Chat error:', error);
      throw error;
    }
  }


  /**
   * Get full manuscript from Pinecone chunks
   */
  async getFullManuscript(manuscriptId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/get-full-manuscript`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manuscriptId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get manuscript');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get full manuscript error:', error);
      throw error;
    }
  }

  /**
   * Deep chat with full manuscript context
   */
  async deepChat(manuscriptId, fullText, manuscriptTitle, query, conversationHistory = []) {
    try {
      const response = await fetch(`${this.baseUrl}/api/deep-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manuscriptId,
          fullText,
          manuscriptTitle,
          query,
          conversationHistory
        })
      });
      
      if (!response.ok) {
        throw new Error('Deep chat failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Deep chat error:', error);
      throw error;
    }
  }

  /**
   * Test if backend is available
   */
  async isAvailable() {
    try {
      await this.checkHealth();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const ragApi = new RagApiService();
export default ragApi;


