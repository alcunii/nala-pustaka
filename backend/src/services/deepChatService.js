/**
 * Deep Chat Service
 * Handles conversational AI with full manuscript context from Pinecone
 */

const logger = require('../utils/logger');

class DeepChatService {
  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.geminiModel = 'gemini-2.5-flash-lite';
    
    if (!this.geminiApiKey) {
      logger.warn('Gemini API key not configured');
    }
  }

  /**
   * Detect language from user query
   */
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

  /**
   * Build anti-hallucination prompt
   */
  buildPrompt(fullText, manuscriptTitle, query, language) {
    const languageInstruction = {
      id: 'Jawab dalam Bahasa Indonesia yang mudah dipahami dan natural.',
      en: 'Answer in clear and natural English.'
    };

    const systemPrompt = `You are Nala Pustaka AI, an expert assistant for Javanese historical manuscripts.

CRITICAL RULES (MUST FOLLOW STRICTLY):
1. **Answer Length**: Provide DETAILED and COMPREHENSIVE answers (minimum 500-1500 words). Don't be brief!
2. **Source Accuracy**: Answer ONLY based on the manuscript text provided below
3. **Honesty**: If information is NOT in the text, clearly state: "Informasi ini tidak ditemukan dalam $${manuscriptTitle}"
4. **No Fabrication**: NEVER fabricate, guess, or use general knowledge beyond the manuscript
5. **Citations**: Always cite by quoting directly with proper formatting
6. **Language**: $${languageInstruction[language]}
7. **Verification**: Every claim must be backed by direct quotes from the manuscript

MARKDOWN FORMATTING (REQUIRED):
- Use **bold** for important terms, names, places, key concepts
- Use *italic* for light emphasis or Javanese terms
- Use ## for main section headings (WAJIB: minimal 2-3 heading)
- Use ### for sub-section headings
- Use bullet points (-) or numbered lists
- Use > for direct quotes from manuscript (WAJIB: minimal 1-2 kutipan)
- Use --- for section separators when needed
- Use paragraphs separated by blank lines
- Structure answer clearly with multiple headings

ANSWER STRUCTURE (WAJIB - MUST FOLLOW):
1. ## Pembukaan Singkat (2-3 kalimat konteks)
2. ## Penjelasan Utama (dengan ### sub-heading per topik/konsep)
   - Gunakan **bold** untuk istilah penting
   - Sertakan bullet points untuk poin-poin penting
   - Tambahkan blockquote (>) untuk kutipan langsung
3. ## Analisis/Interpretasi (jika relevan)
4. ## Kesimpulan/Rangkuman

CITATION FORMAT (WAJIB - MUST FOLLOW):
✅ BENAR: Menurut **$${manuscriptTitle}**, dijelaskan bahwa...
✅ BENAR: Dalam **$${manuscriptTitle}** disebutkan:
> "Kutipan asli dari naskah"
✅ BENAR: **Tokoh utama** yang disebutkan dalam **$${manuscriptTitle}** adalah...
❌ SALAH: Naskah mengatakan... (tanpa bold/format)
❌ SALAH: Tidak menyertakan kutipan langsung

CONTOH FORMAT YANG DIHARAPKAN:
## Pembahasan Utama

### Penjelasan Konsep dari Naskah
Menurut **$${manuscriptTitle}**, dijelaskan bahwa...

**Poin-poin penting** yang disebutkan:
- Point pertama tentang...
- Point kedua tentang...
- Point ketiga tentang...

> "Kutipan langsung dari naskah yang relevan"

### Analisis Lebih Lanjut
Ketika menganalisis lebih dalam **konsep penting** dalam **$${manuscriptTitle}**, ditemukan bahwa...

**Tokoh-tokoh** atau **istilah kunci** yang muncul:
- Tokoh A: penjelasan...
- Tokoh B: penjelasan...

> "Kutipan tambahan yang mendukung"

---

## Kesimpulan
Dari **$${manuscriptTitle}**, dapat disimpulkan bahwa...

MANUSCRIPT: $${manuscriptTitle}

FULL MANUSCRIPT TEXT:
$${fullText}

USER QUESTION:
$${query}

YOUR DETAILED MARKDOWN ANSWER (500-1500 words, follow format above):`;

    return systemPrompt;
  }

  /**
   * Call Gemini API
   */
  async callGemini(prompt) {
    if (!this.geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
            temperature: 0.4,  // Balanced for natural language
            maxOutputTokens: 8192,  // Increased for detailed responses
            topP: 0.95,  // Higher variety
            topK: 40
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
          ]
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API Error: ${errorData.error?.message || response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.candidates || result.candidates.length === 0) {
        throw new Error('No response from AI');
      }
      
      return result.candidates[0].content.parts[0].text;
    } catch (error) {
      logger.error('Gemini API call failed:', error);
      throw error;
    }
  }

  /**
   * Extract citations from AI response
   */
  extractCitations(answer) {
    // Extract text within quotes
    const quotesRegex = /"([^"]{20,})"/g;
    const citations = [];
    let match;
    
    while ((match = quotesRegex.exec(answer)) !== null) {
      citations.push(match[1]);
    }
    
    return citations.slice(0, 5); // Max 5 citations
  }

  /**
   * Main chat method
   */
  async chat(manuscriptId, fullText, manuscriptTitle, query, conversationHistory = []) {
    try {
      logger.info(`Deep Chat - Manuscript: ${manuscriptTitle}, Query: "${query}"`);
      
      // Detect language
      const language = this.detectLanguage(query);
      logger.info(`Detected language: ${language}`);
      
      // Build prompt
      let prompt = this.buildPrompt(fullText, manuscriptTitle, query, language);
      
      // Add conversation history if exists
      if (conversationHistory.length > 0) {
        const recentHistory = conversationHistory.slice(-3); // Last 3 exchanges only
        let historyText = '\n\nPREVIOUS CONVERSATION:\n';
        recentHistory.forEach(msg => {
          if (msg.sender === 'user') historyText += `User: ${msg.text}\n`;
          if (msg.sender === 'ai') historyText += `AI: ${msg.text}\n`;
        });
        prompt += historyText;
        prompt += '\n\nRemember: Answer the new question based on the manuscript above, maintaining context from previous conversation.';
      }
      
      // Call Gemini
      const answer = await this.callGemini(prompt);
      
      // Extract citations
      const citations = this.extractCitations(answer);
      
      logger.info(`Deep Chat response generated. Citations: ${citations.length}`);
      
      return {
        answer,
        citations,
        language,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Deep Chat error:', error);
      throw error;
    }
  }
}

const deepChatService = new DeepChatService();
module.exports = deepChatService;
