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

  detectLanguage(query) {
    const patterns = {
      // Indonesian keywords - expanded
      id: /\b(siapa|apa|apakah|bagaimana|mengapa|kenapa|kapan|dimana|mana|adalah|ialah|yang|dan|atau|dari|dengan|untuk|pada|dalam|oleh|tentang|terhadap|naskah|jawa|kuno|kepemimpinan|ceritakan|jelaskan|beritahu|tolong)\b/i,
      // English keywords - significantly expanded
      en: /\b(who|what|where|when|why|which|whose|whom|how|is|are|was|were|be|been|being|am|has|have|had|do|does|did|will|would|could|should|can|may|might|must|the|a|an|this|that|these|those|and|or|but|from|with|for|about|by|in|on|at|to|of|tell|me|you|i|we|they|he|she|it|explain|describe|show|give|please|leadership|manuscript|example|concept)\b/i,
    };
    
    // Count matches for each language
    const idMatches = (query.match(patterns.id) || []).length;
    const enMatches = (query.match(patterns.en) || []).length;
    
    // If English has more matches, return 'en'
    if (enMatches > idMatches) return 'en';
    // If Indonesian has more matches, return 'id'
    if (idMatches > enMatches) return 'id';
    
    // If equal or no matches, check for character patterns
    // Indonesian often uses 'ng', 'ny', 'dh', 'th' combinations
    const hasIndonesianPattern = /\b\w*(ng|ny|dh|th)\w*\b/i.test(query);
    if (hasIndonesianPattern) return 'id';
    
    // Default to English if uncertain (better for international audience)
    return 'en';
  }

  formatContextForAI(searchResults, language = 'id') {
    const labels = {
      id: {
        header: 'KONTEKS DARI NASKAH KUNO JAWA (Diterjemahkan/Asli):',
        source: 'Sumber',
        title: 'JUDUL:',
        author: 'Penulis:',
        year: 'Tahun:',
        relevance: 'Relevansi:',
        content: 'Isi Naskah:',
        notAvailable: '[Teks tidak tersedia]'
      },
      en: {
        header: 'CONTEXT FROM JAVANESE ANCIENT MANUSCRIPTS (Translated/Original):',
        source: 'Source',
        title: 'TITLE:',
        author: 'Author:',
        year: 'Year:',
        relevance: 'Relevance:',
        content: 'Manuscript Content:',
        notAvailable: '[Text not available]'
      }
    };
    
    const l = labels[language];
    let context = `${l.header}\n\n`;
    
    searchResults.forEach((result, index) => {
      const textContent = result.metadata.chunkText || result.metadata.text || result.metadata.content || l.notAvailable;
      
      context += `[${l.source} ${index + 1}] ${l.title} ${result.metadata.title}\n`;
      context += `${l.author} ${result.metadata.author} | ${l.year} ${result.metadata.year || 'N/A'}\n`;
      context += `${l.relevance} ${(result.score * 100).toFixed(1)}%\n`;
      context += `${l.content}\n${textContent}\n\n---\n\n`;
    });
    return context;
  }

  buildPrompt(query, context, conversationHistory = [], language = 'id') {
    const prompts = {
      id: {
        intro: 'Anda adalah Nala Pustaka AI, asisten peneliti ahli naskah kuno Jawa yang ramah dan edukatif.',
        notFound: 'Informasi ini tidak ditemukan dalam sumber yang tersedia',
        languageRule: 'Use academic but accessible Indonesian language',
        termRecognition: 'For "kepemimpinan" look for concepts like "Astabrata", "Pamong", "Ratu", "Niti", "Wulang"'
      },
      en: {
        intro: 'You are Nala Pustaka AI, a friendly and educational expert assistant for Javanese ancient manuscripts research.',
        notFound: 'This information is not found in the available sources',
        languageRule: 'Answer in clear and natural English',
        termRecognition: 'For "leadership" look for concepts like "Astabrata", "Pamong", "Ratu", "Niti", "Wulang"'
      }
    };
    
    const p = prompts[language];
    
    const systemPrompt = `${p.intro}

CRITICAL RULES (MUST FOLLOW STRICTLY):
1. **Answer Length**: Provide DETAILED and COMPREHENSIVE answers (minimum 500-1500 words). Don't be brief!
2. **Source Accuracy**: Answer ONLY based on the KONTEKS (sources) provided below
3. **Honesty**: If information is NOT in the context, clearly state: "${p.notFound}"
4. **No Fabrication**: NEVER fabricate, guess, or use general knowledge beyond the provided sources
5. **Citations**: ALWAYS cite sources using [Sumber X] or [Source X] format
6. **Language**: ${p.languageRule}
7. **Cultural Context**: Understand that texts may be in Old Javanese, Kawi, or translations
8. **Conceptual Analysis**: Look for philosophical meanings, not just literal translations
9. **Term Recognition**: ${p.termRecognition}

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

ANSWER STRUCTURE (MUST FOLLOW):
${language === 'id' ? `1. ## Pembukaan Singkat (2-3 kalimat konteks)
2. ## Penjelasan Utama (dengan ### sub-heading per topik/konsep/naskah)
   - Gunakan **bold** untuk istilah penting dan judul naskah
   - Sertakan bullet points untuk poin-poin penting
   - Tambahkan blockquote (>) untuk kutipan langsung
   - SELALU sertakan [Sumber X] setelah setiap klaim
3. ## Analisis/Interpretasi (jika relevan)
   - Hubungkan konsep antar naskah
   - Berikan makna filosofis/kontekstual
4. ## Kesimpulan/Rangkuman` : `1. ## Brief Introduction (2-3 sentences of context)
2. ## Main Explanation (with ### sub-headings per topic/concept/manuscript)
   - Use **bold** for important terms and manuscript titles
   - Include bullet points for key information
   - Add blockquotes (>) for direct quotes
   - ALWAYS include [Source X] after each claim
3. ## Analysis/Interpretation (if relevant)
   - Connect concepts across manuscripts
   - Provide philosophical/contextual meanings
4. ## Conclusion/Summary`}

CITATION FORMAT (MUST FOLLOW):
${language === 'id' ? `✅ BENAR: Menurut **[Judul Naskah]** [Sumber 1], dijelaskan bahwa...
✅ BENAR: Dalam **[Judul Naskah]** [Sumber 2] disebutkan:
> "Kutipan asli dari naskah"
✅ BENAR: **Konsep penting** yang disebutkan dalam **[Judul Naskah]** [Sumber 3] adalah...
✅ BENAR: Berdasarkan [Sumber 1, 3, 5], dapat disimpulkan bahwa...
❌ SALAH: Naskah mengatakan... (tanpa bold/format dan tanpa [Sumber X])
❌ SALAH: Tidak menyertakan kutipan langsung
❌ SALAH: Tidak menyebutkan judul naskah dengan bold` : `✅ CORRECT: According to **[Manuscript Title]** [Source 1], it is explained that...
✅ CORRECT: In **[Manuscript Title]** [Source 2], it is mentioned:
> "Direct quote from the manuscript"
✅ CORRECT: The **important concept** mentioned in **[Manuscript Title]** [Source 3] is...
✅ CORRECT: Based on [Source 1, 3, 5], it can be concluded that...
❌ WRONG: The manuscript says... (without bold/format and without [Source X])
❌ WRONG: Not including direct quotes
❌ WRONG: Not mentioning manuscript title in bold`}

EXAMPLE FORMAT EXPECTED:
${language === 'id' ? `## Pembahasan Utama

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
Dari berbagai naskah yang tersedia [Sumber 1, 2, 3, 4, 5], dapat disimpulkan bahwa...` : `## Main Discussion

### Concepts from Ancient Manuscripts
According to **Serat Wedhatama** [Source 1], it is explained that the **concept of leadership** in Javanese tradition emphasizes...

**Key points** mentioned:
- First point about... [Source 1]
- Second point about... [Source 2]
- Third point about... [Source 3]

> "Direct quote from the relevant manuscript"

### Comparison of Concepts Across Manuscripts
When comparing various manuscripts, in **Babad Tanah Jawi** [Source 4] it is found that...

Meanwhile **Serat Nitisruti** [Source 5] emphasizes:

**Key figures** or **key terms**:
- Figure A: explanation... [Source 2]
- Term B: explanation... [Source 3]

> "Additional supporting quote"

---

## Conclusion
From the available manuscripts [Source 1, 2, 3, 4, 5], it can be concluded that...`}

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

      // 0. Detect language
      const language = this.detectLanguage(query);
      logger.info(`Detected language: ${language}`);

      // 1. Rewrite query if there is history (Standalone Query) to improve retrieval
      let searchParam = query;
      if (conversationHistory && conversationHistory.length > 0) {
        try {
          const historyText = conversationHistory
            .slice(-4) // Take last 4 messages
            .map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content.substring(0, 500)}...`) // Truncate long assistant responses
            .join('\n');
          
          const languageInstruction = language === 'id' ? 'in Indonesian' : 'in English';
          const rewritePrompt = `Given the following conversation history and a follow-up question, rephrase the follow-up question to be a standalone question that captures the full context ${languageInstruction}.
          
Conversation History:
${historyText}

Follow-up Question: "${query}"

Standalone Question (${languageInstruction}):`;

          // Use the existing callGemini method for rewriting
          // We temporarily switch model if needed, but using the default configured model is fine for now
          // or we can just use the same method since it's a simple task
          const rewrittenQuery = await this.callGemini(rewritePrompt);
          
          if (rewrittenQuery && !rewrittenQuery.includes("Maaf, saya tidak dapat")) {
             const cleanRewritten = rewrittenQuery.trim();
             logger.info(`Original Query: "${query}"`);
             logger.info(`Rewritten Query: "${cleanRewritten}"`);
             searchParam = cleanRewritten;
          }
        } catch (rewriteError) {
          logger.warn('Failed to rewrite query, using original:', rewriteError);
        }
      }
      
      // 2. Expand Query for better semantic search
      const searchTerms = await this.expandQuery(searchParam);
      
      // 3. Generate Embedding for search terms
      const queryEmbedding = await embeddingService.generateEmbedding(searchTerms);
      
      // 4. Query Vector DB with relaxed parameters
      // Increase topK to gather more context (chunks are small)
      // Lower minScore to catch semantically related but not exact matches
      const searchResults = await vectorDB.query(queryEmbedding, { 
        topK: 15, 
        minScore: 0.35 
      });

      if (!searchResults || searchResults.length === 0) {
        const noResultsMessage = {
          id: 'Mohon maaf, saya belum menemukan informasi yang spesifik mengenai hal tersebut dalam basis data naskah kami. Cobalah menggunakan kata kunci yang lebih umum atau sinonim dalam Bahasa Jawa.',
          en: 'I apologize, I have not found specific information about this in our manuscript database. Please try using more general keywords or Javanese synonyms.'
        };
        
        return { 
          answer: noResultsMessage[language], 
          sources: [] 
        };
      }

      // 5. Build Context and Prompt
      const context = this.formatContextForAI(searchResults, language);
      const prompt = this.buildPrompt(query, context, conversationHistory, language); // Use original query for the answer generation
      
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
