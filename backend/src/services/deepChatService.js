/**
 * Deep Chat Service
 * Handles conversational AI with full manuscript context from Pinecone
 */

const logger = require('../utils/logger');

class DeepChatService {
  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.geminiModel = 'gemini-2.0-flash-exp';
    
    if (!this.geminiApiKey) {
      logger.warn('Gemini API key not configured');
    }
  }

  /**
   * Detect language from user query
   */
  detectLanguage(query) {
    const patterns = {
      id: /\b(siapa|apa|bagaimana|mengapa|kapan|dimana|adalah|yang|dan|dari|dengan|untuk)\b/i,
      en: /\b(who|what|how|why|when|where|is|are|was|were|the|and|from|with|for)\b/i,
    };
    
    if (patterns.id.test(query)) return 'id';
    if (patterns.en.test(query)) return 'en';
    return 'id'; // default Indonesian
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
1. Answer ONLY based on the manuscript text provided below
2. If information is NOT in the text, say: "Informasi ini tidak ditemukan dalam ${manuscriptTitle}"
3. NEVER fabricate, guess, or use general knowledge beyond the manuscript
4. Always cite by quoting directly: "Dalam naskah disebutkan: '[exact quote]'"
5. ${languageInstruction[language]}
6. Be conversational but accurate
7. Every claim must be backed by a direct quote from the manuscript

CITATION FORMAT:
- Use direct quotes: "Teks asli: '[kutipan]'"
- Keep quotes in original language from manuscript
- If multiple relevant parts, cite all

MANUSCRIPT: ${manuscriptTitle}

FULL MANUSCRIPT TEXT:
${fullText}

USER QUESTION:
${query}

YOUR ANSWER (must include citations):`;

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
            temperature: 0.3,  // Lower = more factual
            maxOutputTokens: 2048,
            topP: 0.8,
            topK: 40,
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
