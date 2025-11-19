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
  async generateAllEducationalContent(manuscript, retryCount = 0) {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 2000; // 2 seconds

    try {
      logger.info(`Generating educational content for: ${manuscript.title} (attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);

      // Check cache first
      const cached = await this.getCachedContent(manuscript.id);
      if (cached) {
        logger.info(`Using cached educational content for: ${manuscript.id}`);
        return cached;
      }

      // Generate new content with AI
      const prompt = this.buildAllInOnePrompt(manuscript);
      const aiResponse = await this.callGemini(prompt);

      // Parse JSON response with advanced error handling
      const contentData = await this.parseAIResponse(aiResponse, manuscript.title);

      // Validate required fields
      this.validateContentData(contentData);

      // Estimate tokens (rough calculation)
      const tokenCount = Math.ceil((prompt.length + aiResponse.length) / 4);

      // Cache in database
      await this.cacheContent(manuscript.id, contentData, tokenCount);

      logger.info(`Successfully generated and cached content for: ${manuscript.id} (${tokenCount} tokens)`);
      return contentData;
    } catch (error) {
      logger.error(`Educational AI generation error (attempt ${retryCount + 1}):`, error.message);

      // Retry logic
      if (retryCount < MAX_RETRIES) {
        logger.info(`Retrying in ${RETRY_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return this.generateAllEducationalContent(manuscript, retryCount + 1);
      }

      // After all retries failed, return fallback content
      logger.warn(`All retries exhausted for ${manuscript.id}, returning fallback content`);
      return this.generateFallbackContent(manuscript);
    }
  }

  /**
   * Advanced JSON parsing with multiple strategies
   */
  async parseAIResponse(aiResponse, manuscriptTitle) {
    if (!aiResponse || aiResponse.trim().length === 0) {
      throw new Error('Empty AI response');
    }

    const strategies = [
      // Strategy 1: Direct JSON parse
      (str) => JSON.parse(str.trim()),

      // Strategy 2: Extract from markdown code blocks
      (str) => {
        const patterns = [
          /```json\s*([\s\S]*?)\s*```/,
          /```\s*([\s\S]*?)\s*```/,
          /^```json\s*([\s\S]*?)$/m,
          /^```\s*([\s\S]*?)$/m,
        ];

        for (const pattern of patterns) {
          const match = str.match(pattern);
          if (match && match[1]) {
            return JSON.parse(match[1].trim());
          }
        }
        throw new Error('No JSON found in markdown blocks');
      },

      // Strategy 3: Find JSON object boundaries
      (str) => {
        const firstBrace = str.indexOf('{');
        const lastBrace = str.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const jsonStr = str.substring(firstBrace, lastBrace + 1);
          return JSON.parse(jsonStr);
        }
        throw new Error('No JSON boundaries found');
      },

      // Strategy 4: Clean and parse
      (str) => {
        let cleaned = str
          .replace(/^```json\s*/gm, '')
          .replace(/^```\s*/gm, '')
          .replace(/\s*```$/gm, '')
          .replace(/^\s*[\r\n]/gm, '')
          .trim();
        
        // Remove any text before first { and after last }
        const firstBrace = cleaned.indexOf('{');
        const lastBrace = cleaned.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          cleaned = cleaned.substring(firstBrace, lastBrace + 1);
        }
        
        return JSON.parse(cleaned);
      },

      // Strategy 5: Fix common JSON errors
      (str) => {
        let fixed = str
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
          .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
          .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
          .trim();

        const firstBrace = fixed.indexOf('{');
        const lastBrace = fixed.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          fixed = fixed.substring(firstBrace, lastBrace + 1);
        }

        return JSON.parse(fixed);
      }
    ];

    // Try each strategy
    for (let i = 0; i < strategies.length; i++) {
      try {
        const result = strategies[i](aiResponse);
        if (result && typeof result === 'object') {
          logger.info(`Successfully parsed JSON using strategy ${i + 1}`);
          return result;
        }
      } catch (err) {
        logger.debug(`Strategy ${i + 1} failed: ${err.message}`);
        continue;
      }
    }

    // All strategies failed - log full response for debugging
    logger.error('Failed to parse AI response with all strategies');
    logger.error('Full response length:', aiResponse.length);
    logger.error('Response preview (first 1000 chars):', aiResponse.substring(0, 1000));
    logger.error('Response preview (last 1000 chars):', aiResponse.substring(Math.max(0, aiResponse.length - 1000)));
    
    throw new Error('AI returned invalid JSON format - all parsing strategies failed');
  }

  /**
   * Validate that parsed content has required fields
   */
  validateContentData(data) {
    const requiredFields = ['summary', 'wisdom', 'characters', 'significance', 'quiz'];
    const missingFields = requiredFields.filter(field => !data.hasOwnProperty(field));

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate array fields
    if (!Array.isArray(data.wisdom) || data.wisdom.length === 0) {
      throw new Error('wisdom must be a non-empty array');
    }
    if (!Array.isArray(data.characters)) {
      throw new Error('characters must be an array');
    }
    if (!Array.isArray(data.quiz) || data.quiz.length === 0) {
      throw new Error('quiz must be a non-empty array');
    }

    // Validate string fields
    if (typeof data.summary !== 'string' || data.summary.length < 100) {
      throw new Error('summary must be a substantial string');
    }
    if (typeof data.significance !== 'string' || data.significance.length < 100) {
      throw new Error('significance must be a substantial string');
    }

    logger.info('Content validation passed');
  }

  /**
   * Generate fallback content when AI fails
   */
  generateFallbackContent(manuscript) {
    logger.warn(`Generating fallback content for: ${manuscript.title}`);
    
    return {
      summary: `**${manuscript.title}**\n\nNaskah ini adalah salah satu karya penting dalam khazanah sastra Nusantara. ${manuscript.description || 'Naskah ini memiliki nilai sejarah dan budaya yang tinggi.'}\n\n**Catatan:** Konten edukatif lengkap sedang dalam proses regenerasi. Silakan coba lagi nanti untuk mendapatkan analisis yang lebih mendalam.`,
      
      wisdom: [
        {
          nilai: 'Pelestarian Budaya',
          quote: 'Setiap naskah adalah jendela ke masa lalu',
          relevansi: `**Relevansi Modern:**\n\nNaskah "${manuscript.title}" mengingatkan kita akan pentingnya melestarikan warisan budaya. Di era digital ini, kita memiliki tanggung jawab untuk menjaga dan menyebarkan pengetahuan tentang karya-karya klasik Nusantara.\n\nPelestarian bukan hanya tentang menyimpan, tetapi juga memahami dan mengaplikasikan nilai-nilai luhur dalam kehidupan sehari-hari.`
        }
      ],
      
      characters: [],
      
      significance: `**## Nilai Historis**\n\nNaskah "${manuscript.title}" merupakan bagian penting dari sejarah literatur Nusantara. ${manuscript.year ? `Ditulis sekitar tahun ${manuscript.year}` : 'Naskah ini'} mencerminkan pemikiran dan nilai-nilai pada masanya.\n\n**## Urgensi Pelestarian**\n\nSetiap naskah kuno adalah warisan tak ternilai yang perlu dijaga. Dengan mempelajari dan memahami naskah-naskah seperti ini, kita dapat lebih menghargai kekayaan budaya Indonesia.\n\n**Catatan:** Analisis lengkap sedang dalam proses regenerasi.`,
      
      quiz: [
        {
          question: `Mengapa penting untuk melestarikan naskah seperti "${manuscript.title}"?`,
          options: [
            'Untuk menjaga warisan budaya dan pengetahuan leluhur',
            'Hanya untuk keperluan museum',
            'Untuk dijual ke kolektor',
            'Tidak ada alasan khusus'
          ],
          correct: 0,
          explanation: `**Penjelasan:**\n\nMelestarikan naskah kuno sangat penting untuk menjaga warisan budaya dan pengetahuan leluhur. Naskah-naskah ini mengandung nilai-nilai, sejarah, dan pemikiran yang dapat memberikan pembelajaran bagi generasi sekarang dan masa depan.\n\nPelestarian bukan sekadar penyimpanan fisik, tetapi juga pemahaman dan penyebaran ilmu yang terkandung di dalamnya.`
        }
      ],
      
      _fallback: true
    };
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

CRITICAL OUTPUT FORMAT:
- Return PURE JSON only, starting with { and ending with }
- DO NOT wrap with markdown code blocks (no \`\`\`json or \`\`\`)
- DO NOT add any text before or after the JSON
- Properly escape special characters in strings (especially quotes and newlines)
- Markdown formatting INSIDE the JSON strings is OK (use \\n for newlines)

Response must start with { and end with }`;
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