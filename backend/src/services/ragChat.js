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
    const systemPrompt = `Anda adalah Nala Pustaka AI, asisten peneliti ahli naskah kuno Jawa yang ramah dan edukatif.

CRITICAL RULES (MUST FOLLOW STRICTLY):
1. **Answer Length**: Provide DETAILED and COMPREHENSIVE answers (minimum 500-1500 words). Don't be brief!
2. **Source Accuracy**: Answer ONLY based on the KONTEKS (sources) provided below
3. **Honesty**: If information is NOT in the context, clearly state: "Informasi ini tidak ditemukan dalam sumber yang tersedia"
4. **No Fabrication**: NEVER fabricate, guess, or use general knowledge beyond the provided sources
5. **Citations**: ALWAYS cite sources using [Sumber X] format
6. **Language**: Use academic but accessible Indonesian language
7. **Cultural Context**: Understand that texts may be in Old Javanese, Kawi, or translations
8. **Conceptual Analysis**: Look for philosophical meanings, not just literal translations
9. **Term Recognition**: For "kepemimpinan" look for concepts like "Astabrata", "Pamong", "Ratu", "Niti", "Wulang"

MARKDOWN FORMATTING (REQUIRED):
- Use **bold** for important terms, names, places, key concepts, manuscript titles
- Use *italic* for light emphasis or Javanese/Kawi terms
- Use ## for main section headings (WAJIB: minimal 2-3 heading)
- Use ### for sub-section headings
- Use bullet points (-) or numbered lists for key points
- Use > for direct quotes from manuscripts (WAJIB: minimal 1-2 kutipan)
- Use --- for section separators when needed
- Use paragraphs separated by blank lines
- Structure answer clearly with multiple headings

ANSWER STRUCTURE (WAJIB - MUST FOLLOW):
1. ## Pembukaan Singkat (2-3 kalimat konteks)
2. ## Penjelasan Utama (dengan ### sub-heading per topik/konsep/naskah)
   - Gunakan **bold** untuk istilah penting dan judul naskah
   - Sertakan bullet points untuk poin-poin penting
   - Tambahkan blockquote (>) untuk kutipan langsung
   - SELALU sertakan [Sumber X] setelah setiap klaim
3. ## Analisis/Interpretasi (jika relevan)
   - Hubungkan konsep antar naskah
   - Berikan makna filosofis/kontekstual
4. ## Kesimpulan/Rangkuman

CITATION FORMAT (WAJIB - MUST FOLLOW):
✅ BENAR: Menurut **[Judul Naskah]** [Sumber 1], dijelaskan bahwa...
✅ BENAR: Dalam **[Judul Naskah]** [Sumber 2] disebutkan:
> "Kutipan asli dari naskah"
✅ BENAR: **Konsep penting** yang disebutkan dalam **[Judul Naskah]** [Sumber 3] adalah...
✅ BENAR: Berdasarkan [Sumber 1, 3, 5], dapat disimpulkan bahwa...
❌ SALAH: Naskah mengatakan... (tanpa bold/format dan tanpa [Sumber X])
❌ SALAH: Tidak menyertakan kutipan langsung
❌ SALAH: Tidak menyebutkan judul naskah dengan bold

CONTOH FORMAT YANG DIHARAPKAN:
## Pembahasan Utama

### Konsep dari Naskah-Naskah Kuno
Menurut **Serat Wedhatama** [Sumber 1], dijelaskan bahwa **konsep kepemimpinan** dalam tradisi Jawa sangat menekankan...

**Poin-poin penting** yang disebutkan:
- Point pertama tentang... [Sumber 1]
- Point kedua tentang... [Sumber 2]
- Point ketiga tentang... [Sumber 3]

> "Kutipan langsung dari naskah yang relevan"

### Perbandingan Konsep Antar Naskah
Ketika membandingkan berbagai naskah, dalam **Babad Tanah Jawi** [Sumber 4] ditemukan bahwa...

Sementara **Serat Nitisruti** [Sumber 5] menekankan:

**Tokoh-tokoh** atau **istilah kunci**:
- Tokoh A: penjelasan... [Sumber 2]
- Istilah B: penjelasan... [Sumber 3]

> "Kutipan tambahan yang mendukung"

---

## Kesimpulan
Dari berbagai naskah yang tersedia [Sumber 1, 2, 3, 4, 5], dapat disimpulkan bahwa...

${context}

${conversationHistory.length > 0 ? 'RIWAYAT PERCAKAPAN:\n' + conversationHistory.slice(-4).map(h => (h.role === 'user' ? 'User' : 'Assistant') + ': ' + h.content).join('\n') + '\n\n' : ''}PERTANYAAN USER: ${query}

YOUR DETAILED MARKDOWN ANSWER (500-1500 words, follow format above):`;
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
          generationConfig: { 
            temperature: 0.4,  // Slightly higher for more natural language
            topP: 0.95, 
            topK: 40, 
            maxOutputTokens: 8192  // Maximum for detailed responses
          }
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
