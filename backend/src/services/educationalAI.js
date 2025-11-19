/**
 * Educational AI Service - Generate pedagogical content for manuscripts
 * Token-optimized: All 4 cards generated in 1 API call
 */

const logger = require('../utils/logger');
const db = require('../config/database');

class EducationalAIService {
  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.geminiModel = 'gemini-2.5-flash-lite'; // Fast & cheap
  }


  /**
   * Generate all educational content in ONE API call (token-efficient)
   * Returns: { summary, wisdom, characters, significance, quiz }
   */
  async generateAllEducationalContent(manuscript) {
    try {
      logger.info(`Generating educational content for: ${manuscript.title}`);

      // Check cache first
      const cached = await this.getCachedContent(manuscript.id);
      if (cached) {
        logger.info(`Using cached educational content for: ${manuscript.id}`);
        return cached;
      }

      // Generate new content with AI
      const prompt = this.buildAllInOnePrompt(manuscript);
      const aiResponse = await this.callGemini(prompt);

      // Parse JSON response
      let contentData;
      try {
        // Extract JSON from markdown code block if present
        const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) ||
          aiResponse.match(/```\n([\s\S]*?)\n```/);
        const jsonStr = jsonMatch ? jsonMatch[1] : aiResponse;
        contentData = JSON.parse(jsonStr);
      } catch (parseError) {
        logger.error('Failed to parse AI response as JSON:', parseError);
        throw new Error('AI returned invalid JSON format');
      }

      // Estimate tokens (rough calculation)
      const tokenCount = Math.ceil((prompt.length + aiResponse.length) / 4);

      // Cache in database
      await this.cacheContent(manuscript.id, contentData, tokenCount);

      logger.info(`Successfully generated and cached content for: ${manuscript.id} (${tokenCount} tokens)`);
      return contentData;
    } catch (error) {
      logger.error('Educational AI generation error:', error);
      throw error;
    }
  }

  /**
   * Build comprehensive prompt for all educational cards + quiz
   */
  buildAllInOnePrompt(manuscript) {
    // Use full_text if available, fallback to excerpt
    // INCREASED LIMIT: We now use up to 15,000 characters (~4000 tokens) to give more context to the AI
    // for generating deeper, longer summaries.
    const manuscriptText = manuscript.full_text || manuscript.fullText || manuscript.description || '';
    const textExcerpt = manuscriptText.substring(0, 15000); 

    return `Analisis naskah kuno Jawa berikut dan buat konten edukatif yang mendalam dengan pendekatan storytelling yang menarik dan mudah dipahami.

NASKAH: "${manuscript.title}"
Penulis: ${manuscript.author || 'Tidak diketahui'}
${manuscript.year ? `Tahun: ${manuscript.year}` : ''}

TEKS:
"""
${textExcerpt}
"""

TUGAS: Buat konten edukatif dalam format JSON berikut. Gunakan bahasa Indonesia yang santai tapi tetap berkelas, mudah dipahami, dan menarik untuk dibaca.

{
  "summary": "Ringkasan naratif yang komprehensif (8-10 paragraf):\n- PEMBUKA: Mulai dengan kalimat yang menarik perhatian dan memberi gambaran mengapa naskah ini penting atau menarik.\n- ISI: Jelaskan isi naskah secara kronologis dengan gaya bercerita yang mengalir. Fokus pada tokoh, konflik, dan perkembangan alur.\n- KONTEKS: Berikan konteks historis dan budaya yang membantu pembaca memahami latar belakang cerita.\n- PENUTUP: Ringkas dengan kesimpulan yang memberikan insight atau makna dari naskah ini.\n- GAYA: Gunakan bahasa yang natural dan mudah dicerna, seperti menjelaskan cerita menarik kepada teman.",
  
  "wisdom": [
    {
      "nilai": "Nama nilai atau pelajaran (gunakan istilah yang jelas, misal: 'Kepemimpinan', 'Kesetiaan', 'Kebijaksanaan')",
      "quote": "Kutipan asli dari naskah (jika ada)",
      "relevansi": "Jelaskan bagaimana nilai ini masih relevan di kehidupan modern. Hubungkan dengan situasi konkret yang mudah dipahami pembaca masa kini. Panjang: 3-5 kalimat."
    }
    // 5-7 items
  ],
  
  "characters": [
    {
      "nama": "Nama tokoh",
      "peran": "Role (Protagonist/Antagonist/Support)",
      "deskripsi": "Jelaskan karakter tokoh ini: latar belakang, motivasi, perkembangan karakter, dan perannya dalam cerita. Buat pembaca bisa memahami siapa tokoh ini dan mengapa ia penting."
    }
    // 5-8 tokoh utama, atau [] jika naskah non-naratif
  ],
  
  "significance": "Penjelasan mendalam (4-6 paragraf) tentang mengapa naskah ini penting:\n- Apa kontribusinya terhadap sejarah dan budaya Jawa?\n- Apa yang membuat naskah ini unik atau istimewa?\n- Bagaimana pengaruhnya terhadap karya-karya lain atau pemikiran pada masanya?\n- Apa yang akan hilang jika naskah ini tidak dilestarikan?\n- Jelaskan dengan gaya yang persuasif namun tetap faktual.",
  
  "quiz": [
    {
      "question": "Pertanyaan yang menguji pemahaman isi dan konteks (bukan sekadar hafalan)",
      "options": ["A", "B", "C", "D"],
      "correct": 0,
      "explanation": "Penjelasan jawaban yang jelas dan membantu pembaca memahami konsep lebih dalam"
    }
    // 5-10 questions
  ]
}

PEDOMAN PENULISAN:
- Hindari bahasa yang terlalu formal dan kaku seperti buku teks.
- Hindari juga bahasa slang atau istilah yang terlalu kasual yang bisa cepat ketinggalan zaman.
- Fokus pada clarity: setiap kalimat harus mudah dipahami dan memberikan informasi berguna.
- Gunakan analogi atau perbandingan modern ketika membantu pemahaman.
- Prioritaskan substansi: setiap paragraf harus memberi insight bermakna.
- Return HANYA valid JSON tanpa tambahan teks lain.`;
  }

  /**
   * Call Gemini API with structured output
   */
  async callGemini(prompt) {
    if (!this.geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4, // Slightly lower for more coherent long-form text
        maxOutputTokens: 8192, // MAXED OUT for long content
        topP: 0.95,
        topK: 40
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
    }

    const result = await response.json();

    if (!result.candidates || result.candidates.length === 0) {
      throw new Error('No response from Gemini API');
    }

    return result.candidates[0].content.parts[0].text;
  }

  /**
   * Get cached educational content from PostgreSQL
   */
  async getCachedContent(manuscriptId) {
    try {
      const query = `
        SELECT content_data 
        FROM educational_content 
        WHERE manuscript_id = $1
      `;
      const { rows } = await db.query(query, [manuscriptId]);

      if (!rows || rows.length === 0) {
        return null; // No cache found
      }

      return rows[0].content_data || null;
    } catch (error) {
      logger.warn(`Cache lookup failed for ${manuscriptId}:`, error.message);
      return null; // Fail gracefully, generate fresh content
    }
  }


  /**
   * Cache educational content in PostgreSQL
   */
  async cacheContent(manuscriptId, contentData, tokenCount) {
    try {
      const query = `
        INSERT INTO educational_content 
        (manuscript_id, content_data, token_count, generated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (manuscript_id) 
        DO UPDATE SET 
          content_data = EXCLUDED.content_data,
          token_count = EXCLUDED.token_count,
          generated_at = EXCLUDED.generated_at,
          updated_at = NOW()
      `;
      await db.query(query, [manuscriptId, JSON.stringify(contentData), tokenCount]);
    } catch (error) {
      logger.error(`Failed to cache content for ${manuscriptId}:`, error);
      // Don't throw - caching failure shouldn't break generation
    }
  }


  /**
   * Get educational content by manuscript ID (cache or generate)
   */
  async getEducationalContent(manuscriptId, manuscriptData) {
    // Try cache first
    const cached = await this.getCachedContent(manuscriptId);
    if (cached) {
      return cached;
    }

    // Generate if not cached
    if (!manuscriptData) {
      throw new Error('Manuscript data required for generation');
    }

    return await this.generateAllEducationalContent(manuscriptData);
  }

  /**
   * Batch generate for multiple manuscripts (for pre-population)
   */
  async batchGenerate(manuscripts, options = {}) {
    const { dryRun = false, delay = 1000 } = options;
    const results = [];

    for (const manuscript of manuscripts) {
      try {
        logger.info(`[${results.length + 1}/${manuscripts.length}] Processing: ${manuscript.title}`);

        if (dryRun) {
          logger.info('DRY RUN - Skipping actual generation');
          results.push({ id: manuscript.id, status: 'skipped' });
          continue;
        }

        const content = await this.generateAllEducationalContent(manuscript);
        results.push({ id: manuscript.id, status: 'success', content });

        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, delay));
      } catch (error) {
        logger.error(`Failed to generate for ${manuscript.id}:`, error);
        results.push({ id: manuscript.id, status: 'error', error: error.message });
      }
    }

    return results;
  }
}

// Singleton instance
const educationalAIService = new EducationalAIService();
module.exports = educationalAIService;