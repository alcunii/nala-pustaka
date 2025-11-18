/**
 * Educational AI Service - Generate pedagogical content for manuscripts
 * Token-optimized: All 4 cards generated in 1 API call
 */

const logger = require('../utils/logger');
const { createClient } = require('@supabase/supabase-js');

class EducationalAIService {
  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.geminiModel = 'gemini-2.0-flash-exp'; // Fast & cheap
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
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
    const manuscriptText = manuscript.full_text || manuscript.fullText || manuscript.description || '';
    const textExcerpt = manuscriptText.substring(0, 3000); // Limit to ~750 tokens

    return `Analisis naskah kuno Jawa berikut dan buat konten edukatif untuk anak muda usia 15-25 tahun.

📚 NASKAH: "${manuscript.title}"
Penulis: ${manuscript.author || 'Tidak diketahui'}
${manuscript.year ? `Tahun: ${manuscript.year}` : ''}

📖 TEKS:
"""
${textExcerpt}
"""

TUGAS: Buat konten pedagogis dalam format JSON berikut:

{
  "summary": "Ringkasan 3-5 kalimat untuk awam. Bahasa Indonesia modern, tanpa istilah teknis. Buat menarik dan relatable.",
  
  "wisdom": [
    {
      "nilai": "Nama nilai kearifan lokal/filosofi",
      "quote": "Quote relevan dari naskah (jika ada)",
      "relevansi": "Penjelasan singkat relevansi dengan kehidupan modern anak muda"
    }
    // 3-5 items
  ],
  
  "characters": [
    {
      "nama": "Nama tokoh",
      "peran": "Peran dalam cerita",
      "deskripsi": "Deskripsi singkat 1-2 kalimat"
    }
    // 3-5 tokoh utama, atau [] jika non-naratif
  ],
  
  "significance": "Penjelasan 3-5 kalimat: konteks historis + pengaruh budaya + relevansi masa kini",
  
  "quiz": [
    {
      "question": "Pertanyaan tentang naskah",
      "options": ["A", "B", "C", "D"],
      "correct": 0,
      "explanation": "Penjelasan jawaban yang benar"
    }
    // 5 questions
  ]
}

PENTING:
- Gunakan emoji untuk membuat engaging (📖💡🎭🌟)
- Bahasa santai tapi tetap informatif
- Jangan buat informasi di luar teks yang diberikan
- Jika tidak ada tokoh (teks filosofis), isi characters dengan array kosong
- Quiz harus berdasarkan konten naskah, bukan pengetahuan umum
- Return HANYA valid JSON, tanpa teks tambahan`;
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
        temperature: 0.5, // Balanced creativity
        maxOutputTokens: 2048, // Allow longer response for all content
        topP: 0.9,
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
   * Get cached educational content from Supabase
   */
  async getCachedContent(manuscriptId) {
    try {
      const { data, error } = await this.supabase
        .from('educational_content')
        .select('content_data')
        .eq('manuscript_id', manuscriptId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found - not an error, just no cache
          return null;
        }
        throw error;
      }

      return data?.content_data || null;
    } catch (error) {
      logger.warn(`Cache lookup failed for ${manuscriptId}:`, error.message);
      return null; // Fail gracefully, generate fresh content
    }
  }

  /**
   * Cache educational content in Supabase
   */
  async cacheContent(manuscriptId, contentData, tokenCount) {
    try {
      const { error } = await this.supabase
        .from('educational_content')
        .upsert({
          manuscript_id: manuscriptId,
          content_data: contentData,
          token_count: tokenCount,
          generated_at: new Date().toISOString()
        }, {
          onConflict: 'manuscript_id' // Update if exists
        });

      if (error) throw error;
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