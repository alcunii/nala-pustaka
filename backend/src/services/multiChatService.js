const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');
const logger = require('../utils/logger');
const vectorDB = require('./vectorDB');
const embeddingService = require('./embeddingOpenAI');

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

function detectLanguage(query) {
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

async function chatWithMultipleManuscripts(manuscripts, query, conversationHistory = []) {
  try {
    logger.info('Multi-chat: ' + manuscripts.length + ' manuscripts');
    
    const startTime = Date.now();
    
    if (manuscripts.length > 3) throw new Error('Max 3 manuscripts');
    if (manuscripts.length === 0) throw new Error('Min 1 manuscript');

    // 0. Detect language
    const language = detectLanguage(query);
    logger.info(`Detected language: ${language}`);

    // 1. Rewrite query if there is history (Standalone Query) to improve retrieval
    let searchParam = query;
    if (conversationHistory && conversationHistory.length > 0) {
      try {
        // Use a fast model for query rewriting
        const rewriterModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
        
        const historyText = conversationHistory
          .slice(-4) // Take last 4 messages
          .map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${(h.content || '').substring(0, 500)}...`) // Truncate long assistant responses
          .join('\n');
        
        const languageInstruction = language === 'id' ? 'in Indonesian' : 'in English';
        const rewritePrompt = `Given the following conversation history and a follow-up question, rephrase the follow-up question to be a standalone question that captures the full context ${languageInstruction}.
        
Conversation History:
${historyText}

Follow-up Question: "${query}"

Standalone Question (${languageInstruction}):`;

        const rewriteResult = await rewriterModel.generateContent(rewritePrompt);
        const rewrittenQuery = rewriteResult.response.text().trim();
        
        logger.info(`Original Query: "${query}"`);
        logger.info(`Rewritten Query: "${rewrittenQuery}"`);
        
        searchParam = rewrittenQuery;
      } catch (rewriteError) {
        logger.warn('Failed to rewrite query, using original:', rewriteError);
      }
    }
    
    const queryEmbedding = await embeddingService.generateEmbedding(searchParam);
    
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
    const labels = {
      id: {
        notFound: '[Tidak ditemukan informasi relevan]',
        notAvailable: '[Teks chunk tidak tersedia]',
        by: 'oleh'
      },
      en: {
        notFound: '[No relevant information found]',
        notAvailable: '[Chunk text not available]',
        by: 'by'
      }
    };
    
    const l = labels[language];
    
    const contextByManuscript = manuscripts.map(ms => {
      const msChunks = topChunks.filter(c => c.manuscript.id === ms.id);
      
      if (msChunks.length === 0) {
        return '===  ' + ms.title + ' (' + ms.author + ') ===\n' + l.notFound;
      }
      
      const chunksText = msChunks.map((chunk, idx) => {
        const text = chunk.metadata.chunkText || chunk.metadata.text || l.notAvailable;
        return '[CHUNK_' + idx + ']\n' + text;
      }).join('\n\n');
      
      return '===  ' + ms.title + ' (' + ms.author + ') ===\n' + chunksText;
    }).join('\n\n---\n\n');
    
    const historyText = conversationHistory.slice(-4).map(h => (h.role === 'user' ? 'User' : 'Assistant') + ': ' + h.content).join('\n');
    
    const manuscriptList = manuscripts.map((m, i) => (i + 1) + '. ' + m.title + ' (' + l.by + ' ' + m.author + ')').join('\n');
    
    const promptTemplates = {
      id: {
        intro: 'Anda adalah asisten peneliti naskah Jawa kuno yang ahli, ramah, dan edukatif.',
        manuscripts: 'NASKAH YANG TERSEDIA:',
        context: 'KONTEKS DARI NASKAH:',
        history: 'RIWAYAT PERCAKAPAN:',
        question: 'PERTANYAAN USER:',
        instructions: 'INSTRUKSI PENTING:',
        answerLength: '**Panjang Jawaban**: Berikan jawaban yang SANGAT DETAIL dan LENGKAP (minimal 500-1500 kata). JANGAN singkat!',
        structure: `**Struktur Jawaban**: Susun jawaban dengan struktur yang jelas:
   - Pembukaan singkat
   - Penjelasan detail per naskah (dengan sub-heading)
   - Analisis perbandingan (jika relevan)
   - Kesimpulan/rangkuman`,
        citation: `**Sitasi**: SELALU sebutkan dari naskah mana info berasal dengan format:
   - "Menurut **[Nama Naskah]** karya [Penulis], ..."
   - "Dalam **[Nama Naskah]** dijelaskan bahwa..."
   - Gunakan > untuk kutipan langsung`,
        honesty: '**Kejujuran**: Jika naskah TIDAK membahas topik tertentu, katakan dengan jelas dan jangan mengarang.',
        language: '**Bahasa**: Gunakan bahasa Indonesia yang formal namun mudah dipahami orang awam.',
        example: `CONTOH FORMAT YANG DIHARAPKAN:
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
Dari ketiga naskah tersebut, dapat disimpulkan...`,
        finalInstruction: 'Sekarang jawab pertanyaan user dengan format di atas:'
      },
      en: {
        intro: 'You are an expert, friendly, and educational assistant for Javanese ancient manuscript research.',
        manuscripts: 'AVAILABLE MANUSCRIPTS:',
        context: 'CONTEXT FROM MANUSCRIPTS:',
        history: 'CONVERSATION HISTORY:',
        question: 'USER QUESTION:',
        instructions: 'IMPORTANT INSTRUCTIONS:',
        answerLength: '**Answer Length**: Provide VERY DETAILED and COMPREHENSIVE answers (minimum 500-1500 words). Do NOT be brief!',
        structure: `**Answer Structure**: Structure your answer clearly:
   - Brief introduction
   - Detailed explanation per manuscript (with sub-headings)
   - Comparative analysis (if relevant)
   - Conclusion/summary`,
        citation: `**Citations**: ALWAYS mention which manuscript information comes from with format:
   - "According to **[Manuscript Name]** by [Author], ..."
   - "In **[Manuscript Name]** it is explained that..."
   - Use > for direct quotes`,
        honesty: '**Honesty**: If a manuscript does NOT discuss a particular topic, state it clearly and do not fabricate.',
        language: '**Language**: Use clear and natural English that is easy for general readers to understand.',
        example: `EXPECTED FORMAT EXAMPLE:
## Main Discussion

### From the First Manuscript
According to **Babad X** by **Author Y**, it is explained that...

The **main characters** mentioned are...

- First point about...
- Second point about...

> "Direct quote from the manuscript if available"

### Comparison Across Manuscripts
When comparing the three manuscripts, it is found that...

---

## Conclusion
From these three manuscripts, it can be concluded that...`,
        finalInstruction: 'Now answer the user question with the format above:'
      }
    };
    
    const p = promptTemplates[language];
    
    const prompt = `${p.intro}

${p.manuscripts}
${manuscriptList}

${p.context}
${contextByManuscript}

${historyText ? p.history + '\n' + historyText + '\n\n' : ''}${p.question} "${query}"

${p.instructions}
1. ${p.answerLength}
2. **Format Markdown**: Use clear and readable markdown formatting:
   - Use **bold** for important terms, character names, places
   - Use *italic* for light emphasis
   - Use ## for section headings
   - Use ### for sub-headings
   - Use bullet points (-, ) or numbered lists
   - Use > for quotes from manuscripts
   - Use paragraphs separated by blank lines
   - Use --- for section separators if needed

3. ${p.structure}

4. ${p.citation}

5. ${p.honesty}

6. ${p.language}

${p.example}

${p.finalInstruction}`;

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
      const notAvailableText = language === 'id' ? '[Teks tidak tersedia]' : '[Text not available]';
      const chunkText = chunk.metadata.chunkText || chunk.metadata.text || notAvailableText;
      const excerpt = chunkText.length > 200 ? chunkText.substring(0, 200) + '...' : chunkText;
      
      return {
        manuscriptId: chunk.manuscript.id,
        manuscriptTitle: chunk.manuscript.title,
        excerpt: excerpt,
        relevance: chunk.score,
        url: chunk.metadata.url
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
