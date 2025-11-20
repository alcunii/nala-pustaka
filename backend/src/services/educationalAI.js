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
      summary: `## RINGKASAN NARATIF

**Sebuah Karya Penting dalam Khazanah Sastra Nusantara**

Naskah **${manuscript.title}** adalah salah satu karya penting dalam khazanah sastra Nusantara. ${manuscript.description || 'Naskah ini memiliki nilai sejarah dan budaya yang tinggi.'}

### Tentang Naskah Ini

${manuscript.author ? `Karya ini ditulis oleh **${manuscript.author}**` : 'Naskah ini'} mencerminkan pemikiran dan nilai-nilai pada masanya. Melalui narasi dan ajaran yang terkandung di dalamnya, kita dapat mempelajari banyak hal tentang kehidupan, budaya, dan filosofi masyarakat Jawa.

### Nilai dan Pembelajaran

Naskah ini mengajarkan berbagai nilai luhur yang masih relevan hingga kini, termasuk:
- **Kebijaksanaan** dalam menghadapi tantangan hidup
- **Kepemimpinan** yang berintegritas dan adil  
- **Kesetiaan** terhadap nilai-nilai kebaikan

**📝 Catatan:** Konten edukatif lengkap sedang dalam proses regenerasi. Silakan coba lagi nanti untuk mendapatkan analisis yang lebih mendalam.`,
      
      wisdom: [
        {
          nilai: 'Pelestarian Budaya',
          quote: 'Setiap naskah adalah jendela ke masa lalu',
          relevansi: `**Relevansi Modern:**\n\nNaskah **"${manuscript.title}"** mengingatkan kita akan pentingnya melestarikan warisan budaya. Di era digital ini, kita memiliki tanggung jawab untuk menjaga dan menyebarkan pengetahuan tentang karya-karya klasik Nusantara.\n\nPelestarian bukan hanya tentang menyimpan, tetapi juga **memahami** dan **mengaplikasikan** nilai-nilai luhur dalam kehidupan sehari-hari.`
        }
      ],
      
      characters: [],
      
      significance: `## SIGNIFIKANSI NASKAH

### Nilai Historis

Naskah **"${manuscript.title}"** merupakan bagian penting dari sejarah literatur Nusantara. ${manuscript.year ? `Ditulis sekitar tahun ${manuscript.year},` : ''} naskah ini mencerminkan pemikiran dan nilai-nilai pada masanya.

Sebagai dokumen historis, naskah ini memberikan wawasan berharga tentang:
- **Kehidupan sosial** masyarakat Jawa pada masanya
- **Sistem nilai** dan norma yang berlaku
- **Tradisi literasi** dan penyampaian pengetahuan

### Keunikan

Keunikan naskah ini terletak pada cara penyampaian yang khas, penggunaan bahasa yang indah, dan pesan-pesan universal yang terkandung di dalamnya.

### Urgensi Pelestarian

Setiap naskah kuno adalah **warisan tak ternilai** yang perlu dijaga. Dengan mempelajari dan memahami naskah-naskah seperti ini, kita dapat lebih menghargai kekayaan budaya Indonesia dan mengambil pembelajaran untuk kehidupan modern.

**📝 Catatan:** Analisis lengkap sedang dalam proses regenerasi.`,
      
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
          explanation: `**Penjelasan:**\n\nMelestarikan naskah kuno sangat penting untuk **menjaga warisan budaya** dan **pengetahuan leluhur**. Naskah-naskah ini mengandung nilai-nilai, sejarah, dan pemikiran yang dapat memberikan pembelajaran bagi generasi sekarang dan masa depan.\n\nPelestarian bukan sekadar penyimpanan fisik, tetapi juga _pemahaman_ dan _penyebaran_ ilmu yang terkandung di dalamnya.`
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
    // Limit to 10,000 characters to keep prompt reasonable
    const manuscriptText = manuscript.full_text || manuscript.fullText || manuscript.description || '';
    const textExcerpt = manuscriptText.substring(0, 10000); 

    return `Analisis naskah kuno Jawa berikut dan buat konten edukatif yang informatif dan terstruktur dengan baik.

NASKAH: "${manuscript.title}"
Penulis: ${manuscript.author || 'Tidak diketahui'}
${manuscript.year ? `Tahun: ${manuscript.year}` : ''}

TEKS NASKAH:
"""
${textExcerpt}
"""

TUGAS: Buat konten edukatif dalam format JSON berikut. Gunakan Markdown untuk formatting dan struktur yang mudah dibaca.

{
  "summary": "## RINGKASAN NARATIF

**Sebuah Potret [Tema Utama Naskah]**

Naskah **${manuscript.title}**... [mulai dengan pembuka yang engaging, jelaskan tema utama dan daya tarik naskah]

[Paragraf pembuka harus menarik perhatian dan memberikan preview tentang apa yang akan dibahas]

### Konteks Sejarah dan Budaya

Pada [masa/era], [konteks sejarah]... [jelaskan latar belakang waktu dan tempat penulisan naskah]

[Berikan konteks yang membantu pembaca memahami mengapa naskah ini penting]

### Narasi Utama

Cerita dimulai dengan... [jelaskan setting, tokoh utama, dan situasi awal]

[Perkembangan plot]: [jelaskan konflik, perkembangan cerita, dan momen-momen penting]

[Klimaks dan resolusi]: [jelaskan puncak konflik dan bagaimana cerita berakhir]

### Tema dan Pesan

Tema utama yang menonjol adalah **[tema 1]**, **[tema 2]**, dan **[tema 3]**. [Elaborasi tentang pesan moral/filosofis]

[Jelaskan bagaimana tema-tema ini disampaikan melalui cerita]

### Relevansi Modern

Naskah ${manuscript.title} menawarkan pelajaran berharga tentang... [jelaskan nilai-nilai yang masih relevan]

[Tutup dengan refleksi tentang mengapa naskah ini penting untuk dipelajari hari ini]

**FORMAT PENTING:**
- Gunakan heading ## dan ### untuk struktur
- Gunakan **bold** untuk istilah/konsep penting
- Gunakan _italic_ untuk emphasis
- 6-8 paragraf (800-1200 kata)
- Bahasa yang mengalir, informatif, engaging",

  "wisdom": [
    {
      "nilai": "Nama Nilai atau Pelajaran (gunakan title case)",
      "quote": "Kutipan dari naskah dalam bahasa asli (Jawa) jika ada, atau parafrase yang bermakna",
      "relevansi": "**Relevansi Modern:**\n\nJelaskan nilai ini dalam konteks naskah dengan **bold** untuk konsep penting (2-3 kalimat).\n\nBagaimana nilai ini relevan di kehidupan modern dengan contoh _konkret_ dan aplikatif (2-3 kalimat). Gunakan **bold** untuk kata kunci dan _italic_ untuk emphasis."
    }
    // 4-5 items nilai penting dengan markdown formatting
  ],

  "characters": [
    {
      "nama": "Nama Lengkap Tokoh",
      "peran": "Role dalam cerita (contoh: Penulis/Narator, Figur Otoritas, Tokoh Spiritual, Tokoh Sentral, dll)",
      "deskripsi": "**Deskripsi Karakter:**\n\n[Jelaskan latar belakang tokoh dengan detail yang menarik]. Gunakan **bold** untuk konsep penting seperti jabatan, sifat khas, atau peran kunci.\n\n[Jelaskan kepribadian, motivasi, dan kontribusi tokoh]. Gunakan _italic_ untuk emphasis pada karakteristik unik.\n\n[Jelaskan mengapa tokoh ini penting dalam naskah]. Total 4-6 kalimat dengan markdown formatting."
    }
    // 3-5 tokoh utama dengan markdown formatting, atau [] jika naskah non-naratif
  ],

  "significance": "## SIGNIFIKANSI NASKAH

### Nilai Historis

Naskah **${manuscript.title}** merupakan... [jelaskan konteks sejarah penulisan dan bagaimana naskah ini menjadi saksi zamannya]

[Berikan detail tentang periode penulisan, kondisi sosial-politik saat itu, dan mengapa naskah ini penting secara historis]

### Keunikan

Keunikan naskah ini terletak pada... [jelaskan aspek-aspek unik]

Apa yang membuat berbeda dari karya lain:
- **[Aspek 1]**: [Penjelasan]
- **[Aspek 2]**: [Penjelasan]  
- **[Aspek 3]**: [Penjelasan]

### Pengaruh dan Dampak

Sebagai bagian dari tradisi [genre/jenis sastra], naskah ini berkontribusi pada... [jelaskan pengaruhnya]

[Jelaskan dampak terhadap sastra, budaya, dan pemikiran Jawa]

### Urgensi Pelestarian

Pelestarian naskah ini sangat penting untuk... [jelaskan alasan pelestarian]

[Jelaskan nilai-nilai yang perlu diwariskan, koneksi dengan generasi muda, dan pembelajaran yang dapat diambil]

**FORMAT PENTING:**
- Gunakan heading ### untuk setiap bagian
- Gunakan **bold** untuk istilah kunci
- Gunakan bullets (-) untuk lists
- 400-600 kata total
- Faktual, informatif, inspiring",

  "quiz": [
    {
      "question": "Pertanyaan yang menguji pemahaman (bukan hafalan). Pertanyaan yang memerlukan analisis dan pemahaman konteks.",
      "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
      "correct": 0,
      "explanation": "**Penjelasan:**\n\nJelaskan mengapa jawaban benar (2-3 kalimat). Berikan konteks yang membantu pemahaman."
    }
    // 5-7 questions dengan variasi tingkat kesulitan
  ]
}

PEDOMAN PENULISAN:
1. **PANJANG MODERAT**: Summary 800-1200 kata, Significance 400-600 kata, total ~2500-3000 kata
2. **MARKDOWN**: Gunakan heading (##), bold (**text**), italic (_text_) untuk struktur
3. **INFORMATIF**: Setiap kalimat harus memberikan informasi atau insight baru
4. **CLARITY**: Mudah dipahami, tidak bertele-tele, tidak terlalu panjang
5. **BALANCED**: Cukup detail tapi tetap ringkas dan fokus

CRITICAL OUTPUT FORMAT:
- Return PURE JSON only, starting with { and ending with }
- DO NOT wrap with markdown code blocks (no \`\`\`json or \`\`\`)
- DO NOT add any text before or after the JSON
- Properly escape special characters in strings (especially quotes and newlines)
- Markdown formatting INSIDE the JSON strings is OK (use \\n for newlines)
- Keep response under 5000 tokens to avoid truncation

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
        temperature: 0.4,
        maxOutputTokens: 5500, // Balanced for quality content without truncation
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
   * Auto-invalidates cache older than 12 hours
   */
  async getCachedContent(manuscriptId) {
    try {
      const CACHE_TTL_HOURS = 12;
      
      const query = `
        SELECT content_data, generated_at 
        FROM educational_content 
        WHERE manuscript_id = $1
      `;
      const { rows } = await db.query(query, [manuscriptId]);

      if (!rows || rows.length === 0) {
        return null; // No cache found
      }

      // Check cache age
      const generatedAt = new Date(rows[0].generated_at);
      const now = new Date();
      const ageInHours = (now - generatedAt) / (1000 * 60 * 60);

      if (ageInHours > CACHE_TTL_HOURS) {
        logger.info(`Cache expired for ${manuscriptId} (age: ${ageInHours.toFixed(1)}h, TTL: ${CACHE_TTL_HOURS}h)`);
        return null; // Cache expired, will regenerate
      }

      logger.info(`Using cached content for ${manuscriptId} (age: ${ageInHours.toFixed(1)}h)`);
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