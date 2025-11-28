const fetch = require('node-fetch');
const config = require('../config');
const logger = require('../utils/logger');

class GeminiChatService {
  constructor() {
    this.apiKey = config.gemini.apiKey;
    this.model = config.gemini.model || 'gemini-2.5-flash-lite';
  }

  detectLanguage(query) {
    const patterns = {
      id: /\b(siapa|apa|apakah|bagaimana|mengapa|kenapa|kapan|dimana|mana|adalah|ialah|yang|dan|atau|dari|dengan|untuk|pada|dalam|oleh|tentang|terhadap|naskah|jawa|kuno|kepemimpinan|ceritakan|jelaskan|beritahu|tolong)\b/i,
      en: /\b(who|what|where|when|why|which|whose|whom|how|is|are|was|were|be|been|being|am|has|have|had|do|does|did|will|would|could|should|can|may|might|must|the|a|an|this|that|these|those|and|or|but|from|with|for|about|by|in|on|at|to|of|tell|me|you|i|we|they|he|she|it|explain|describe|show|give|please|leadership|manuscript|example|concept)\b/i,
    };
    
    const idMatches = (query.match(patterns.id) || []).length;
    const enMatches = (query.match(patterns.en) || []).length;
    
    if (enMatches > idMatches) return 'en';
    if (idMatches > enMatches) return 'id';
    
    const hasIndonesianPattern = /\b\w*(ng|ny|dh|th)\w*\b/i.test(query);
    if (hasIndonesianPattern) return 'id';
    
    return 'en';
  }

  async chatGrounded(userQuery, manuscriptData, conversationHistory = []) {
    if (!this.apiKey) {
      throw new Error('Gemini API Key not configured on backend');
    }

    const language = this.detectLanguage(userQuery);
    logger.info(`GeminiChat detected language: ${language} for query: "${userQuery}"`);

    // System Instruction for grounded AI - Bilingual
    const systemPrompts = {
      id: `Anda adalah "Nala Pustaka", Pustakawan AI ahli filologi yang berfokus pada naskah kuno Jawa. Anda sopan, akurat, dan grounded pada data.
Tugas Anda adalah menjawab pertanyaan pengguna HANYA berdasarkan konteks naskah yang disediakan.
JANGAN PERNAH berhalusinasi atau mengarang informasi di luar konteks.
Jika jawaban tidak ada dalam konteks, katakan dengan sopan bahwa informasi tersebut tidak ditemukan dalam naskah ini.
Semua jawaban harus dalam Bahasa Indonesia.
Anda HARUS memberi sitasi (menyebutkan bagian) dari mana Anda mengambil jawaban jika memungkinkan.
Anda dapat merujuk ke pertanyaan sebelumnya jika relevan untuk memberikan jawaban yang koheren.`,
      en: `You are "Nala Pustaka", an AI librarian expert in philology focusing on ancient Javanese manuscripts. You are polite, accurate, and grounded in data.
Your task is to answer user questions ONLY based on the manuscript context provided.
NEVER hallucinate or fabricate information outside the context.
If the answer is not in the context, politely state that the information is not found in this manuscript.
All answers must be in English.
You MUST provide citations (mention the part) from where you derived the answer if possible.
You can refer to previous questions if relevant to provide coherent answers.`
    };

    const systemPrompt = systemPrompts[language];

    // Support both fullText (hardcoded) and full_text (from database)
    const manuscriptText = manuscriptData.full_text || manuscriptData.fullText || '';

    // Build conversation context (last 5 messages, excluding welcome)
    const contextMessages = conversationHistory
      .filter(msg => !msg.text.includes('Pustakawan AI') && !msg.text.includes('AI librarian'))
      .slice(-5); // Last 5 messages only

    const labels = {
      id: {
        historyTitle: 'RIWAYAT PERCAKAPAN SEBELUMNYA:',
        contextTitle: 'KONTEKS NASKAH',
        questionTitle: 'PERTANYAAN PENGGUNA',
        latestQuestion: 'TERBARU',
        instruction: 'Jawab pertanyaan pengguna HANYA berdasarkan KONTEKS NASKAH di atas.',
        referInstruction: ' Anda dapat merujuk ke jawaban sebelumnya jika relevan untuk memberikan jawaban yang koheren.'
      },
      en: {
        historyTitle: 'PREVIOUS CONVERSATION HISTORY:',
        contextTitle: 'MANUSCRIPT CONTEXT',
        questionTitle: 'USER QUESTION',
        latestQuestion: 'LATEST',
        instruction: 'Answer the user question ONLY based on the MANUSCRIPT CONTEXT above.',
        referInstruction: ' You can refer to previous answers if relevant to provide coherent answers.'
      }
    };

    const l = labels[language];

    let conversationContext = '';
    if (contextMessages.length > 0) {
      conversationContext = `\n\n${l.historyTitle}\n`;
      contextMessages.forEach(msg => {
        conversationContext += `${msg.sender === 'user' ? 'USER' : 'AI'}: ${msg.text}\n`;
      });
    }

    // ALWAYS include manuscript text in EVERY query
    const combinedUserQuery = `${l.contextTitle} (${manuscriptData.title}):
"""
${manuscriptText}
"""
${conversationContext}

${l.questionTitle} ${contextMessages.length > 0 ? l.latestQuestion : ''}:
"""
${userQuery}
"""

${language === 'id' ? 'INSTRUKSI' : 'INSTRUCTION'}: ${l.instruction}${contextMessages.length > 0 ? l.referInstruction : ''}`;

    // Payload for Gemini API
    const payload = {
      contents: [
        {
          parts: [{ text: combinedUserQuery }]
        }
      ],
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        temperature: 0.3,  // Low for more factual responses
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      }
    };

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API Error: ${errorData.error?.message || response.statusText}`);
    }

    const result = await response.json();

    // Parse response from Gemini
    if (!result.candidates || result.candidates.length === 0) {
      throw new Error('No response from AI');
    }

    const aiText = result.candidates[0].content.parts[0].text;

    if (!aiText) {
      throw new Error('Empty AI response');
    }

    return aiText;
  }
}

module.exports = new GeminiChatService();