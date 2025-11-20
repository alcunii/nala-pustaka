const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');
const logger = require('../utils/logger');
const vectorDB = require('./vectorDB');
const embeddingService = require('./embeddingOpenAI');

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

async function chatWithMultipleManuscripts(manuscripts, query, conversationHistory = []) {
  try {
    logger.info('Multi-chat: ' + manuscripts.length + ' manuscripts');
    
    const startTime = Date.now();
    
    if (manuscripts.length > 3) throw new Error('Max 3 manuscripts');
    if (manuscripts.length === 0) throw new Error('Min 1 manuscript');
    
    const queryEmbedding = await embeddingService.generateEmbedding(query);
    
    // Build Pinecone filter to only get chunks from selected manuscripts
    // Use manuscript_id (Pinecone UUID) instead of id (Database ID)
    const manuscriptIds = manuscripts.map(m => m.manuscript_id || m.id);
    const filter = {
      manuscriptId: { $in: manuscriptIds }
    };
    
    logger.debug('Querying with filter for Pinecone manuscriptIds: ' + manuscriptIds.join(', '));
    
    const allResults = await vectorDB.query(queryEmbedding, {
      topK: 15, // OPTIMIZED: Reduced from 30 to save ~3000 tokens per request (50% reduction)
      includeMetadata: true,
      filter: filter
    });
    
    logger.debug('Retrieved ' + allResults.length + ' chunks from filtered manuscripts');
    
    // DEBUG: Log manuscripts received from frontend
    logger.info('=== DEBUG: Manuscripts received from frontend ===');
    manuscripts.forEach(m => {
      logger.info('  Title: ' + m.title);
      logger.info('    Database ID: ' + m.id);
      logger.info('    Pinecone UUID (manuscript_id): ' + (m.manuscript_id || 'MISSING - WILL FAIL!'));
    });
    
    // DEBUG: Log sample Pinecone chunks
    if (allResults.length > 0) {
      logger.info('=== DEBUG: Sample Pinecone chunks ===');
      allResults.slice(0, 3).forEach(chunk => {
        logger.info('  Title: ' + chunk.metadata.title + ' (Pinecone UUID: ' + chunk.metadata.manuscriptId + ')');
      });
    }
    
    // Map chunks to their manuscripts (all results are already filtered by Pinecone)
    const relevantChunks = allResults.map(chunk => {
      // Find manuscript by matching Pinecone manuscript_id
      const matchedMs = manuscripts.find(m => {
        const pineconeId = m.manuscript_id || m.id;
        return pineconeId === chunk.metadata.manuscriptId;
      });
      
      return {
        ...chunk,
        manuscript: { 
          id: matchedMs.id, 
          manuscript_id: matchedMs.manuscript_id || matchedMs.id,
          title: matchedMs.title, 
          author: matchedMs.author 
        }
      };
    });
    
    logger.debug('Filtered to ' + relevantChunks.length + ' chunks from selected manuscripts');
    
    const topChunks = relevantChunks.sort((a, b) => b.score - a.score).slice(0, 8); // OPTIMIZED: Reduced from 9 to 8
    
    logger.debug('Using top ' + topChunks.length + ' chunks');
    logger.info(` Token optimization: Using ${topChunks.length} chunks (down from 30 retrieved)`);
    
    // Build context
    const contextByManuscript = manuscripts.map(ms => {
      const msChunks = topChunks.filter(c => c.manuscript.id === ms.id);
      
      if (msChunks.length === 0) {
        return '===  ' + ms.title + ' (' + ms.author + ') ===\n[Tidak ditemukan informasi relevan]';
      }
      
      const chunksText = msChunks.map((chunk, idx) => {
        const text = chunk.metadata.chunkText || chunk.metadata.text || '[Teks chunk tidak tersedia]';
        return '[CHUNK_' + idx + ']\n' + text;
      }).join('\n\n');
      
      return '===  ' + ms.title + ' (' + ms.author + ') ===\n' + chunksText;
    }).join('\n\n---\n\n');
    
    const historyText = conversationHistory.slice(-4).map(h => (h.role === 'user' ? 'User' : 'Assistant') + ': ' + h.content).join('\n');
    
    const manuscriptList = manuscripts.map((m, i) => (i + 1) + '. ' + m.title + ' (oleh ' + m.author + ')').join('\n');
    
    const prompt = `Anda adalah asisten peneliti naskah Jawa kuno yang ahli, ramah, dan edukatif.

NASKAH YANG TERSEDIA:
${manuscriptList}

KONTEKS DARI NASKAH:
${contextByManuscript}

${historyText ? 'RIWAYAT PERCAKAPAN:\n' + historyText + '\n\n' : ''}PERTANYAAN USER: "${query}"

INSTRUKSI PENTING:
1. **Panjang Jawaban**: Berikan jawaban yang SANGAT DETAIL dan LENGKAP (minimal 500-1500 kata). JANGAN singkat!
2. **Format Markdown**: Gunakan format markdown yang rapi dan mudah dibaca:
   - Gunakan **bold** untuk istilah penting, nama tokoh, tempat
   - Gunakan *italic* untuk penekanan ringan
   - Gunakan ## untuk judul bagian
   - Gunakan ### untuk sub-judul
   - Gunakan bullet points (-, ) atau numbered list untuk daftar
   - Gunakan > untuk quotes dari naskah
   - Gunakan paragraf terpisah dengan baris kosong
   - Gunakan --- untuk pemisah section jika perlu

3. **Struktur Jawaban**: Susun jawaban dengan struktur yang jelas:
   - Pembukaan singkat
   - Penjelasan detail per naskah (dengan sub-heading)
   - Analisis perbandingan (jika relevan)
   - Kesimpulan/rangkuman

4. **Sitasi**: SELALU sebutkan dari naskah mana info berasal dengan format:
   - "Menurut **[Nama Naskah]** karya [Penulis], ..."
   - "Dalam **[Nama Naskah]** dijelaskan bahwa..."
   - Gunakan > untuk kutipan langsung

5. **Kejujuran**: Jika naskah TIDAK membahas topik tertentu, katakan dengan jelas dan jangan mengarang.

6. **Bahasa**: Gunakan bahasa Indonesia yang formal namun mudah dipahami orang awam.

CONTOH FORMAT YANG DIHARAPKAN:
## Pembahasan Utama

### Dari Naskah Pertama
Menurut **Babad X** karya **Penulis Y**, dijelaskan bahwa...

**Tokoh utama** yang disebutkan adalah...

- Point pertama tentang...
- Point kedua tentang...

> "Kutipan langsung dari naskah jika ada"

### Perbandingan Antar Naskah
Ketika membandingkan ketiga naskah, ditemukan bahwa...

---

## Kesimpulan
Dari ketiga naskah tersebut, dapat disimpulkan...

Sekarang jawab pertanyaan user dengan format di atas:`;

    const model = genAI.getGenerativeModel({ 
      model: config.gemini.model,
      generationConfig: { 
        temperature: 0.4,  // Slightly higher for more natural language
        topP: 0.95, 
        topK: 40, 
        maxOutputTokens: 8192  // Maximum for detailed responses (no token saving!)
      }
    });
    
    const result = await model.generateContent(prompt);
    const answer = result.response.text();
    
    const duration = (Date.now() - startTime) / 1000;
    logger.info('Multi-chat completed in ' + duration.toFixed(2) + 's');
    
    const sources = topChunks.map(chunk => {
      const chunkText = chunk.metadata.chunkText || chunk.metadata.text || '[Teks tidak tersedia]';
      const excerpt = chunkText.length > 200 ? chunkText.substring(0, 200) + '...' : chunkText;
      
      return {
        manuscriptId: chunk.manuscript.id,
        manuscriptTitle: chunk.manuscript.title,
        excerpt: excerpt,
        relevance: chunk.score
      };
    });
    
    return {
      success: true,
      answer: answer,
      sources: sources,
      metadata: {
        manuscriptCount: manuscripts.length,
        chunksUsed: topChunks.length,
        processingTimeSeconds: duration,
        timestamp: new Date().toISOString()
      }
    };
    
  } catch (error) {
    logger.error('Multi-chat error:', error);
    throw error;
  }
}

module.exports = { chatWithMultipleManuscripts };
