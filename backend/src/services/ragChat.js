const embeddingService = require('./embeddingOpenAI');
const vectorDB = require('./vectorDB');
const logger = require('../utils/logger');

class RagChatService {
  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    // User verified 'gemini-2.5-flash-lite' exists (Current Date: Nov 2025)
    // Reverting to the specific high-performance model.
    this.geminiModel = 'gemini-2.5-flash-lite'; 
  }

  formatContextForAI(searchResults) {
    let context = 'KONTEKS DARI NASKAH KUNO JAWA (Diterjemahkan/Asli):\n\n';
    searchResults.forEach((result, index) => {
      // Fallback for text content: try chunkText, text, or content
      const textContent = result.metadata.chunkText || result.metadata.text || result.metadata.content || '[Teks tidak tersedia]';
      
      context += `[Sumber ${index + 1}] JUDUL: ${result.metadata.title}\n`;
      context += `Penulis: ${result.metadata.author} | Tahun: ${result.metadata.year || 'N/A'}\n`;
      context += `Relevansi: ${(result.score * 100).toFixed(1)}%\n`;
      context += `Isi Naskah:\n${textContent}\n\n---\n\n`;
    });
    return context;
  }

  buildPrompt(query, context, conversationHistory = []) {
    const systemPrompt = `
Anda adalah Nala Pustaka AI, asisten peneliti ahli naskah kuno Jawa. 
Tugas Anda adalah menjawab pertanyaan pengguna berdasarkan KONTEKS yang diberikan.

PENTING:
1. Konteks mungkin berisi teks Bahasa Jawa Kuno, Kawi, atau terjemahan kasar.
2. Analisis makna tersirat (filosofis) dari teks, bukan hanya kata demi kata.
3. Jika pertanyaan tentang "kepemimpinan", cari konsep seperti "Astabrata", "Pamong", "Ratu", "Niti", "Wulang".
4. Jawab dengan Bahasa Indonesia yang akademis namun mudah dimengerti.
5. SELALU cantumkan referensi [Sumber X] setiap kali Anda mengutip atau menyimpulkan sesuatu dari konteks.
6. Jika konteks tidak cukup, katakan dengan jujur, tapi cobalah hubungkan potongan informasi yang ada.

KONTEKS:
${context}

PERTANYAAN: ${query}
JAWABAN:`;
    return systemPrompt;
  }

  async callGemini(prompt) {
    if (!this.geminiApiKey) throw new Error('Gemini API key not configured');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 8192 }
        })
      });
      
      if (!response.ok) {
        const errText = await response.text();
        console.error('Gemini API Error Details:', errText);
        throw new Error(`Gemini API Error: ${response.status}`);
      }
      
      const result = await response.json();
      if (!result.candidates || result.candidates.length === 0) return "Maaf, saya tidak dapat menghasilkan jawaban saat ini.";
      
      return result.candidates[0].content.parts[0].text;
    } catch (error) {
      logger.error('Call Gemini Error:', error);
      throw error;
    }
  }

  async expandQuery(query) {
    // Simple expansion mapping for common topics to save latency
    // For complex queries, we could call LLM, but hardcoded expansion is faster and cheaper for common terms
    const keywords = {
      'kepemimpinan': 'kepemimpinan astabrata pamong praja ratu narendra niti wulang',
      'pemimpin': 'pemimpin ratu raja narendra bupati',
      'etika': 'etika krama susila budi pekerti',
      'moral': 'moral nitiprana nitisruti wulangreh wedhatama',
      'pendidikan': 'pendidikan wulang piwulang sasmita',
      'wanita': 'wanita putri estri dyah',
      'perang': 'perang yuda bratayuda',
      'sejarah': 'sejarah babad',
      'islam': 'islam santri',
      'hindu': 'hindu dewa',
      'budha': 'budha',
    };

    let expanded = query.toLowerCase();
    for (const [key, val] of Object.entries(keywords)) {
      if (expanded.includes(key)) {
        expanded += ` ${val}`;
      }
    }
    
    // If no specific keywords found, maybe just return original or add generic context
    // But we stick to simple expansion for now
    logger.info(`Query Expanded: "${query}" -> "${expanded}"`);
    return expanded;
  }

  async chat(query, conversationHistory = []) {
    try {
      logger.info(`RAG Chat Request: "${query}"`);
      
      // 1. Expand Query for better semantic search
      const searchTerms = await this.expandQuery(query);
      
      // 2. Generate Embedding for search terms
      const queryEmbedding = await embeddingService.generateEmbedding(searchTerms);
      
      // 3. Query Vector DB with relaxed parameters
      // Increase topK to gather more context (chunks are small)
      // Lower minScore to catch semantically related but not exact matches
      const searchResults = await vectorDB.query(queryEmbedding, { 
        topK: 15, 
        minScore: 0.35 
      });

      if (!searchResults || searchResults.length === 0) {
        return { 
          answer: 'Mohon maaf, saya belum menemukan informasi yang spesifik mengenai hal tersebut dalam basis data naskah kami. Cobalah menggunakan kata kunci yang lebih umum atau sinonim dalam Bahasa Jawa.', 
          sources: [] 
        };
      }

      // 4. Build Context and Prompt
      const context = this.formatContextForAI(searchResults);
      const prompt = this.buildPrompt(query, context, conversationHistory); // Use original query for the answer generation
      
      // 5. Get AI Answer
      const aiAnswer = await this.callGemini(prompt);
      
      return {
        answer: aiAnswer,
        sources: searchResults.slice(0, 5).map(r => ({ // Return top 5 sources to UI
          title: r.metadata.title,
          author: r.metadata.author,
          score: r.score,
          url: r.metadata.url
        })),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('RAG Chat error:', error);
      throw error;
    }
  }
}

const ragChatService = new RagChatService();
module.exports = ragChatService;
