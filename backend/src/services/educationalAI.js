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

    return `Analisis naskah kuno Jawa berikut dan buat konten edukatif yang mendalam, panjang, dan terstruktur dengan baik.

NASKAH: "${manuscript.title}"
Penulis: ${manuscript.author || 'Tidak diketahui'}
${manuscript.year ? `Tahun: ${manuscript.year}` : ''}

TEKS NASKAH:
"""
${textExcerpt}
"""

TUGAS: Buat konten edukatif dalam format JSON berikut. Gunakan Markdown untuk formatting dan struktur yang mudah dibaca.

{
  "summary": "**RINGKASAN NARATIF PANJANG (MINIMUM 12-15 PARAGRAF)**

Gunakan Markdown untuk struktur:
- Gunakan **bold** untuk istilah penting
- Gunakan _italic_ untuk emphasis
- Pisahkan dengan paragraf yang jelas (dua line break)

STRUKTUR WAJIB:

**Paragraf 1-2 (Pembuka & Hook):**
Mulai dengan opening yang menarik. Jelaskan dalam 2 paragraf mengapa naskah ini menarik untuk dibaca dan apa yang membuatnya istimewa. Berikan gambaran besar tentang tema utama.

**Paragraf 3-4 (Latar Belakang Historis):**
Jelaskan konteks sejarah dan budaya pada masa naskah ini ditulis. Apa yang sedang terjadi di Jawa? Siapa penulisnya? Mengapa naskah ini ditulis? Berikan detail yang cukup agar pembaca bisa membayangkan suasana zamannya.

**Paragraf 5-10 (Isi Cerita Detail):**
Ceritakan isi naskah secara kronologis dengan detail yang kaya:
- Jelaskan setting, tokoh utama, dan konflik awal
- Ceritakan perkembangan plot dengan detail penting
- Jelaskan turning point dan klimaks cerita
- Berikan dialog atau kutipan penting (jika ada)
- Jelaskan resolusi atau akhir cerita
- Setiap paragraf minimal 4-5 kalimat

**Paragraf 11-12 (Tema & Makna):**
Analisis tema-tema utama dalam naskah. Apa pesan moral atau filosofis yang ingin disampaikan? Bagaimana tema ini tercermin dalam cerita?

**Paragraf 13-15 (Penutup & Relevansi):**
Rangkum keseluruhan cerita dan jelaskan mengapa naskah ini masih relevan hari ini. Apa yang bisa kita pelajari? Mengapa cerita ini perlu diingat?

PENTING: 
- MINIMUM 12 paragraf, target 15 paragraf
- Setiap paragraf minimal 4-5 kalimat
- Total minimal 2500 kata
- Gunakan bahasa yang mengalir dan enak dibaca
- Buat seperti artikel feature magazine yang panjang dan detail",

  "wisdom": [
    {
      "nilai": "Nama nilai atau pelajaran (contoh: 'Kepemimpinan Bijaksana', 'Kesetiaan dalam Persahabatan', 'Kebijaksanaan Menghadapi Konflik')",
      "quote": "Kutipan langsung dari naskah (jika ada) atau parafrase penting",
      "relevansi": "**Jelaskan relevansi dengan kehidupan modern (MINIMAL 4-6 KALIMAT):**\n\nParagraf 1: Jelaskan nilai ini dalam konteks naskah.\n\nParagraf 2: Bagaimana nilai ini masih relevan di kehidupan modern? Berikan contoh situasi konkret di era sekarang dimana nilai ini penting. Buat pembaca bisa relate dengan pengalaman mereka sendiri.\n\nGunakan markdown untuk struktur yang jelas."
    }
    // WAJIB 6-8 items
  ],

  "characters": [
    {
      "nama": "Nama lengkap tokoh",
      "peran": "Role (Protagonist/Antagonist/Supporting Character/Mentor/etc)",
      "deskripsi": "**DESKRIPSI KARAKTER DETAIL (MINIMAL 5-7 KALIMAT):**\n\n**Latar Belakang:** Jelaskan asal-usul dan latar belakang tokoh.\n\n**Karakteristik:** Apa ciri khas kepribadian tokoh ini? Apa kekuatan dan kelemahannya?\n\n**Motivasi:** Apa yang mendorong tokoh ini dalam cerita? Apa tujuan atau ambisinya?\n\n**Perkembangan:** Bagaimana tokoh ini berubah atau berkembang sepanjang cerita?\n\n**Peran:** Apa kontribusi tokoh ini terhadap keseluruhan plot?\n\nGunakan markdown untuk memudahkan pembacaan."
    }
    // 6-10 tokoh penting, atau [] jika naskah non-naratif
  ],

  "significance": "**SIGNIFIKANSI NASKAH (MINIMUM 6-8 PARAGRAF)**

Gunakan struktur markdown dengan heading:

**## Nilai Historis**
(2 paragraf) Jelaskan kapan dan mengapa naskah ini ditulis. Apa konteks sejarah yang melatarbelakanginya? Bagaimana naskah ini menjadi saksi sejarah zamannya?

**## Keunikan & Inovasi**
(2 paragraf) Apa yang membuat naskah ini berbeda dari karya lain pada masanya? Apa aspek unik dari gaya penulisan, tema, atau pendekatan yang digunakan?

**## Pengaruh & Legacy**
(2 paragraf) Bagaimana naskah ini mempengaruhi karya-karya selanjutnya? Apa dampaknya terhadap sastra dan budaya Jawa? Siapa saja yang terinspirasi dari naskah ini?

**## Urgensi Pelestarian**
(2 paragraf) Mengapa naskah ini perlu dilestarikan? Apa yang akan hilang jika naskah ini tidak dijaga? Apa pesan atau nilai yang perlu diwariskan ke generasi mendatang?

PENTING:
- MINIMUM 6 paragraf, target 8 paragraf
- Setiap paragraf minimal 4-5 kalimat
- Total minimal 1500 kata
- Gunakan markdown heading dan formatting
- Buat persuasif namun tetap faktual dan akademis",

  "quiz": [
    {
      "question": "Pertanyaan yang menguji pemahaman mendalam (bukan hafalan fakta sederhana). Buat pertanyaan yang memerlukan analisis dan pemahaman konteks.",
      "options": ["Opsi A (detailed)", "Opsi B (detailed)", "Opsi C (detailed)", "Opsi D (detailed)"],
      "correct": 0,
      "explanation": "**PENJELASAN LENGKAP (MINIMAL 3-4 KALIMAT):**\n\nJelaskan mengapa jawaban yang benar adalah benar. Berikan konteks tambahan yang membantu pembaca memahami konsep lebih dalam. Jika ada jawaban yang salah, jelaskan mengapa opsi tersebut salah dan apa kesalahpahaman yang umum terjadi."
    }
    // WAJIB 7-10 questions dengan variasi tingkat kesulitan
  ]
}

PEDOMAN PENULISAN KETAT:
1. **PANJANG WAJIB**: Summary minimal 2500 kata, Significance minimal 1500 kata
2. **MARKDOWN**: Gunakan heading (##), bold (**text**), italic (_text_), dan paragraf terstruktur
3. **DETAIL**: Setiap paragraf harus substantif dengan minimal 4-5 kalimat
4. **GAYA**: Santai tapi berkelas, seperti artikel feature magazine berkualitas
5. **NO FLUFF**: Setiap kalimat harus memberikan informasi atau insight baru
6. **STRUKTUR**: Gunakan sub-heading dan formatting untuk memudahkan pembacaan
7. **DEPTH**: Jangan permukaan, gali tema dan makna yang lebih dalam
8. **CLARITY**: Meski panjang, tetap mudah dipahami dan tidak bertele-tele

Return HANYA valid JSON (escape markdown dengan benar).`;
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