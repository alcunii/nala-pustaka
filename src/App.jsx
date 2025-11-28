import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as d3 from 'd3';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { MANUSCRIPT_DATA } from './data/manuscripts';
import { manuscriptService } from './lib/supabase';
import RagChatPanel from './components/RagChatPanel';
import DeepChatModal from './components/DeepChatModal';
import EducationalPanel from './components/EducationalPanel';
import EducationalKnowledgeGraph from './components/EducationalKnowledgeGraph';
import MultiChatModal from './components/MultiChatModal';
import Navbar from './components/layout/Navbar';
import Logo from './components/common/Logo';
import ErrorBoundary from './components/ErrorBoundary';

// Configure marked for better Markdown rendering
marked.setOptions({
  breaks: true,  // Support line breaks
  gfm: true,     // GitHub Flavored Markdown
});

// Data naskah sekarang di-fetch dari PostgreSQL database via Backend API
// Gunakan admin panel di /admin untuk menambah naskah baru
// Fallback ke data hardcoded jika Backend API gagal

// Komponen Manuscript Card - Modern Golden Style with Mobile Optimization
function ManuscriptCard({ manuscript, isSelected, onClick, selectionMode, isSelectedForResearch, onToggleSelection, disableSelection }) {
  const { t } = useTranslation('app');
  
  const handleClick = (e) => {
    if (selectionMode) {
      e.stopPropagation();
      if (!disableSelection) {
        onToggleSelection(manuscript);
      }
    } else {
      onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-3 sm:p-4 mb-2 sm:mb-3 rounded-xl cursor-pointer transition-all duration-300 border-2 ${isSelectedForResearch
        ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-500 shadow-lg scale-[1.02]'
        : isSelected
          ? 'bg-gradient-to-br from-primary-100 to-accent-100 border-accent-500 shadow-lg scale-[1.02]'
          : 'bg-white border-primary-200 hover:border-primary-400 hover:shadow-md hover:scale-[1.01]'
        } ${disableSelection ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        {/* Checkbox for selection mode */}
        {selectionMode && (
          <div className="flex items-center pt-1">
            <input
              type="checkbox"
              checked={isSelectedForResearch}
              onChange={() => !disableSelection && onToggleSelection(manuscript)}
              disabled={disableSelection}
              className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-green-500 cursor-pointer disabled:cursor-not-allowed"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        <div className={`w-1 h-14 sm:h-16 rounded-full flex-shrink-0 ${isSelectedForResearch ? 'bg-gradient-to-b from-green-500 to-emerald-600' : isSelected ? 'bg-gradient-to-b from-accent-500 to-primary-600' : 'bg-primary-300'}`}></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className={`font-bold text-sm sm:text-lg leading-tight flex-1 ${isSelectedForResearch ? 'text-green-800' : isSelected ? 'text-primary-800' : 'text-gray-900'}`}>
              {manuscript.title}
            </h3>
            {manuscript.is_pinned && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-yellow-200 to-amber-200 text-yellow-800 border border-yellow-400 flex-shrink-0">
                📌
              </span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1.5">
            <p className="text-xs sm:text-sm text-primary-600 font-medium truncate">{manuscript.author}</p>
            {manuscript.content_quality && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold w-fit ${
                manuscript.content_quality === 'rich' ? 'bg-green-100 text-green-700 border border-green-300' :
                manuscript.content_quality === 'medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
                manuscript.content_quality === 'short' ? 'bg-orange-100 text-orange-700 border border-orange-300' :
                manuscript.content_quality === 'very_short' ? 'bg-orange-100 text-orange-700 border border-orange-300' :
                'bg-red-100 text-red-700 border border-red-300'
              }`}>
                {manuscript.content_quality === 'rich' ? t('manuscript.quality.rich') :
                 manuscript.content_quality === 'medium' ? t('manuscript.quality.medium') :
                 manuscript.content_quality === 'short' ? t('manuscript.quality.short') :
                 manuscript.content_quality === 'very_short' ? t('manuscript.quality.very_short') :
                 t('manuscript.quality.empty')}
              </span>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-gray-600 line-clamp-2 leading-relaxed">{manuscript.description}</p>
        </div>
      </div>
    </div>
  );
}

// Komponen Welcome Screen - Modern Landing Page
function WelcomeScreen() {
  const { t } = useTranslation('app');
  
  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-primary-50 via-amber-50 to-accent-50">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-8 flex justify-center">
            <Logo location="welcome" size="3xl" className="drop-shadow-2xl" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-primary-700 to-accent-600 bg-clip-text text-transparent pb-2">
            {t('welcome.title')}
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-700 mb-6 leading-relaxed max-w-2xl mx-auto" dangerouslySetInnerHTML={{ __html: t('welcome.subtitle') }} />
          
          <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md border-2 border-primary-200">
            <span className="text-2xl">📚</span>
            <p className="text-primary-800 font-semibold">{t('welcome.selectPrompt')}</p>
          </div>
        </div>

        {/* How to Use Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-primary-800 mb-8">
            {t('welcome.howToUse')}
          </h2>
          
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-primary-500">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-500 text-white rounded-xl flex items-center justify-center font-bold text-xl">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('welcome.steps.step1.title')}</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {t('welcome.steps.step1.description')}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-accent-500">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-accent-500 text-white rounded-xl flex items-center justify-center font-bold text-xl">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('welcome.steps.step2.title')}</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    {t('welcome.steps.step2.description')}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-primary-600">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-xl flex items-center justify-center font-bold text-xl">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('welcome.steps.step3.title')}</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {t('welcome.steps.step3.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-primary-800 mb-8">
            {t('welcome.features')}
          </h2>
          
          <div className="space-y-8">
            {/* Feature 1: Chat AI */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-primary-200">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">🤖 Chat dengan AI</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Ajukan pertanyaan tentang isi, makna, dan konteks naskah yang dipilih. AI akan menjawab berdasarkan <strong>isi asli naskah</strong>, bukan dari pengetahuan umum.
                  </p>
                  <div className="bg-primary-50 rounded-xl p-4 border-l-4 border-primary-500">
                    <p className="text-sm font-semibold text-primary-800 mb-2">Contoh Pertanyaan:</p>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• Apa tema utama yang dibahas dalam naskah ini?</li>
                      <li>• Siapa tokoh-tokoh penting yang disebutkan?</li>
                      <li>• Bagaimana konteks historis naskah ini?</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: Knowledge Graph */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-accent-200">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-accent-500 to-primary-600 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">🔮 Knowledge Graph</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Visualisasi interaktif yang menampilkan <strong>hubungan antar tokoh, konsep, dan tema</strong> dalam naskah. Geser, zoom, dan klik untuk eksplorasi lebih dalam.
                  </p>
                  <div className="bg-accent-50 rounded-xl p-4 border-l-4 border-accent-500">
                    <p className="text-sm font-semibold text-accent-800 mb-2">Cara Menggunakan:</p>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• Geser node untuk mengatur posisi</li>
                      <li>• Scroll untuk zoom in/out</li>
                      <li>• Drag background untuk menggeser canvas</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: Educational Panel */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-green-200">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-2xl">
                  📚
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">📚 Mode Edukatif</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Dapatkan <strong>penjelasan edukatif yang terstruktur</strong> tentang naskah, lengkap dengan analisis mendalam, konteks historis, dan nilai-nilai yang terkandung di dalamnya.
                  </p>
                  <div className="bg-green-50 rounded-xl p-4 border-l-4 border-green-500">
                    <p className="text-sm font-semibold text-green-800 mb-2">Apa yang Anda Dapatkan:</p>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• Ringkasan isi naskah</li>
                      <li>• Analisis tema dan makna</li>
                      <li>• Konteks sejarah dan budaya</li>
                      <li>• Nilai-nilai yang bisa dipelajari</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 4: RAG Chat All */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-purple-200">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-2xl">
                  🔍
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">🔍 Chat Semua Naskah</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Ajukan pertanyaan tentang <strong>seluruh koleksi naskah sekaligus</strong>. AI akan mencari informasi relevan dari semua naskah untuk menjawab pertanyaan Anda.
                  </p>
                  <div className="bg-purple-50 rounded-xl p-4 border-l-4 border-purple-500">
                    <p className="text-sm font-semibold text-purple-800 mb-2">Kapan Menggunakannya:</p>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• Mencari tema yang muncul di berbagai naskah</li>
                      <li>• Membandingkan tokoh atau konsep antar naskah</li>
                      <li>• Eksplorasi topik spesifik lintas koleksi</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-primary-600 to-accent-500 rounded-2xl p-8 shadow-xl text-white">
          <h2 className="text-2xl font-bold mb-4 text-center">💡 Tips Penggunaan</h2>
          <div className="space-y-3 text-sm sm:text-base">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0">✓</span>
              <p>Ajukan pertanyaan yang spesifik untuk mendapatkan jawaban yang lebih detail</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0">✓</span>
              <p>Gunakan Mode Edukatif untuk mendapatkan overview komprehensif sebelum bertanya</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0">✓</span>
              <p>Eksplorasi Knowledge Graph untuk memahami struktur dan hubungan dalam naskah</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0">✓</span>
              <p>Gunakan Chat Semua Naskah untuk perbandingan antar naskah</p>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-12 pb-8">
          <p className="text-gray-600 text-lg mb-4">Siap untuk mulai menjelajah?</p>
          <div className="inline-flex items-center gap-2 bg-white px-8 py-4 rounded-2xl shadow-lg border-2 border-primary-300">
            <span className="text-3xl">📚</span>
            <p className="text-primary-800 font-bold text-lg">Pilih naskah untuk memulai</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Komponen Chat Panel dengan RAG menggunakan Gemini API
function ChatPanel({ manuscript }) {
  const { t } = useTranslation('app');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false); // NEW: History modal state
  const messagesEndRef = useRef(null);
  const isMountedRef = useRef(true);

  // TODO: Isi dengan API Key Anda dari https://aistudio.google.com/app/apikey
  // JANGAN commit API key ke GitHub! Gunakan environment variable
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

  // NEW: Chat History localStorage key
  const getChatHistoryKey = (manuscriptId) => `nala-chat-history-${manuscriptId}`;

  // NEW: Save chat history to localStorage
  const saveChatHistory = (manuscriptId, messages) => {
    try {
      localStorage.setItem(getChatHistoryKey(manuscriptId), JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  // NEW: Clear chat history
  const clearChatHistory = () => {
    const confirmed = window.confirm('Yakin ingin menghapus riwayat chat untuk naskah ini? / Are you sure you want to clear the chat history for this manuscript?');
    if (confirmed) {
      localStorage.removeItem(getChatHistoryKey(manuscript.id));
      const welcomeMessage = {
        id: Date.now(),
        sender: 'ai',
        text: t('chat.greeting', { title: manuscript.title })
      };
      setMessages([welcomeMessage]);
    }
  };

  // Auto-scroll ke bawah saat ada pesan baru (DINONAKTIFKAN)
  // const scrollToBottom = () => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // };

  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

  // NEW: Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(manuscript.id, messages);
    }
  }, [messages, manuscript.id]);

  // FIXED: Reset chat when switching manuscripts (session management)
  useEffect(() => {
    isMountedRef.current = true;
    
    // Always start fresh session when switching manuscripts
    // Chat history is still preserved in localStorage (accessible via History button)
    const welcomeMessage = {
      id: Date.now(),
      sender: 'ai',
      text: t('chat.greeting', { title: manuscript.title })
    };
    setMessages([welcomeMessage]);

    return () => {
      isMountedRef.current = false;
    };
  }, [manuscript.id, t]);

  // Detect language from query
  const detectLanguage = (query) => {
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
  };

  // Fungsi RAG: Memanggil Gemini API dengan grounded context + conversational history
  const getGroundedAiResponse = async (userQuery, manuscriptData, conversationHistory = []) => {
    if (!apiKey) {
      throw new Error('API Key belum diisi. Silakan isi apiKey di komponen ChatPanel.');
    }

    // Detect language from user query
    const language = detectLanguage(userQuery);
    console.log(`ChatPanel detected language: ${language} for query: "${userQuery}"`);

    // System Instruction untuk grounded AI - Bilingual
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

    // NEW: Build conversation context (last 5 messages, excluding welcome)
    // const welcomeGreeting = t('chat.greeting', { title: manuscriptData.title });
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

    // FIXED: ALWAYS include manuscript text in EVERY query
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

    // Payload untuk Gemini API
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
        temperature: 0.3,  // Rendah untuk lebih faktual
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      }
    };

    // Panggil Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
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
      throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
    }

    const result = await response.json();

    // Parse respons dari Gemini
    if (!result.candidates || result.candidates.length === 0) {
      throw new Error('Tidak ada respons dari AI');
    }

    const aiText = result.candidates[0].content.parts[0].text;

    if (!aiText) {
      throw new Error('Respons AI kosong');
    }

    return aiText;
  };

  // Fungsi untuk mengirim pesan dengan RAG + conversational context
  const handleSend = async (e) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    const userQuery = input.trim();

    // Tambahkan pesan user
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: userQuery
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // NEW: Pass conversation history for context
      const aiText = await getGroundedAiResponse(userQuery, manuscript, messages);

      // Only update state if component is still mounted
      if (!isMountedRef.current) return;

      // Tambahkan respons AI
      const aiMessage = {
        id: Date.now(),
        sender: 'ai',
        text: aiText
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling Gemini API:', error);

      // Only update state if component is still mounted
      if (!isMountedRef.current) return;

      // Tambahkan pesan error
      const errorMessage = {
        id: Date.now(),
        sender: 'ai',
        text: `Maaf, terjadi kesalahan: ${error.message}\n\n${!apiKey
          ? '⚠️ Silakan isi API Key Gemini terlebih dahulu di file App.jsx (komponen ChatPanel).\nDapatkan API Key gratis di: https://aistudio.google.com/app/apikey'
          : 'Silakan coba lagi dalam beberapa saat.'
          }`
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header Chat - Bold Gradient Theme with History Button */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-r from-primary-600 to-accent-500 text-white flex-shrink-0">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-xl sm:text-2xl font-bold mb-2 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl">🤖</span>
              {t('chat.title')}
            </h3>
            <div className="flex gap-2 flex-wrap mb-2">
              <span className="bg-white/20 px-3 py-1 rounded-lg text-xs sm:text-sm backdrop-blur-sm">
                📜 {manuscript.title}
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-lg text-xs sm:text-sm backdrop-blur-sm">
                ✍️ {manuscript.author}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white/90">
              💡 {t('chat.askAnything')}
            </p>
          </div>

          {/* History & Clear Buttons */}
          <div className="flex gap-2 ml-4">
            <button
              type="button"
              onClick={() => setShowHistoryModal(true)}
              className="px-3 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 backdrop-blur-sm font-semibold text-xs sm:text-sm transition-all"
              title={t('chat.history')}
            >
              📜 {t('chat.history')}
            </button>
            <button
              type="button"
              onClick={clearChatHistory}
              className="px-3 py-2 bg-red-500/80 text-white rounded-lg hover:bg-red-600 backdrop-blur-sm font-semibold text-xs sm:text-sm transition-all"
              title={t('chat.clearHistory')}
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container - With Welcome Screen and Avatar Bubbles */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-b from-gray-50 to-white space-y-4">
        {messages.length === 1 && messages[0].sender === 'ai' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 animate-bounce">💭</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              {t('chat.title')}
            </h3>
            <p className="text-gray-600 mb-6">
              {manuscript.title}
            </p>
            <div className="max-w-md mx-auto space-y-3 text-left">
              <div className="bg-white p-4 rounded-xl border-2 border-primary-200 shadow-sm">
                <div className="font-bold text-primary-700 mb-2">📚 {t('chat.exampleQuestions')}</div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-accent-500 flex-shrink-0">•</span>
                    <span>{t('chat.examples.theme')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-500 flex-shrink-0">•</span>
                    <span>{t('chat.examples.characters')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-500 flex-shrink-0">•</span>
                    <span>{t('chat.examples.context')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-500 flex-shrink-0">•</span>
                    <span>{t('chat.examples.values')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
          >
            {message.sender === 'ai' && (
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold mr-3 shadow-md">
                🤖
              </div>
            )}

            <div
              className={`max-w-full sm:max-w-3xl rounded-2xl px-4 sm:px-5 py-3 sm:py-4 ${message.sender === 'user'
                ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-lg'
                : 'bg-white border-2 border-primary-200 text-gray-900 shadow-md'
                }`}
            >

              {/* Render Markdown untuk AI, plain text untuk user */}
              {message.sender === 'ai' ? (
                <div
                  className="prose prose-base max-w-none
                    prose-headings:text-primary-900 prose-headings:font-bold
                    prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-6 prose-h2:mb-4
                    prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-4 prose-h3:mb-3
                    prose-p:text-gray-800 prose-p:leading-relaxed prose-p:my-3
                    prose-strong:text-primary-800 prose-strong:font-bold
                    prose-em:text-primary-700 prose-em:italic
                    prose-ul:list-disc prose-ul:pl-5 prose-ul:my-2 prose-ul:space-y-1
                    prose-ol:list-decimal prose-ol:pl-5 prose-ol:my-2 prose-ol:space-y-1
                    prose-li:text-gray-800 prose-li:leading-relaxed
                    prose-code:bg-primary-100 prose-code:text-primary-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
                    prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:border-2 prose-pre:border-primary-300 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto
                    prose-pre>code:bg-transparent prose-pre>code:text-gray-100 prose-pre>code:p-0
                    prose-blockquote:border-l-4 prose-blockquote:border-accent-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-700 prose-blockquote:bg-accent-50 prose-blockquote:py-2 prose-blockquote:rounded-r
                    prose-a:text-accent-600 prose-a:underline prose-a:font-medium hover:prose-a:text-accent-700
                    prose-table:border-2 prose-table:border-primary-300 prose-table:rounded-lg prose-table:overflow-hidden
                    prose-thead:bg-primary-100 prose-thead:text-primary-900 prose-thead:font-bold
                    prose-th:border prose-th:border-primary-300 prose-th:p-2 prose-th:text-left
                    prose-td:border prose-td:border-primary-200 prose-td:p-2
                    prose-tr:even:bg-primary-50
                    markdown-content
                  "
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(message.text)) }}
                />
              ) : (
                <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>
              )}
            </div>

            {message.sender === 'user' && (
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold ml-3 shadow-md">
                👤
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator with Avatar */}
        {isLoading && (
          <div className="flex justify-start animate-fadeIn">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold mr-3 shadow-md">
              🤖
            </div>
            <div className="bg-white border-2 border-primary-200 rounded-2xl p-4 shadow-md">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                <span className="text-gray-600 text-sm">
                  {t('chat.analyzing')}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t-2 border-gray-200 p-4 bg-gray-50 flex-shrink-0">
        <form onSubmit={handleSend} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('chat.placeholder')}
            className="flex-1 px-4 py-3 border-2 border-primary-300 rounded-xl focus:outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-200 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 placeholder-gray-500"
            disabled={isLoading}
            autoFocus
          />
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-bold rounded-xl hover:from-primary-700 hover:to-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? '⏳' : '📤'} {t('chat.send')}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2 text-center">
          💡 {t('chat.tips')}
        </p>
      </div>

      {/* History Modal (NEW) */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary-600 to-accent-500 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                📜 Riwayat Chat
              </h3>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="text-white hover:text-gray-200 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Naskah: <strong className="text-primary-700">{manuscript.title}</strong>
                </p>
                <p className="text-xs text-gray-500">
                  Total pesan: {messages.length}
                </p>
              </div>

              {messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Belum ada riwayat chat
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${message.sender === 'user'
                        ? 'bg-primary-50 border-l-4 border-primary-500'
                        : 'bg-gray-50 border-l-4 border-accent-500'
                        }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-700">
                          {message.sender === 'user' ? '👤 User' : '🤖 AI'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                        {message.text.length > 300
                          ? message.text.substring(0, 300) + '...'
                          : message.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
              <button
                type="button"
                onClick={clearChatHistory}
                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-semibold text-sm"
              >
                🗑️ Hapus Riwayat
              </button>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold text-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Komponen Knowledge Graph Panel dengan D3.js
function KnowledgeGraphPanel({ manuscript }) {
  const { t } = useTranslation('app');
  const svgRef = useRef();
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const apiUrl = import.meta.env.VITE_RAG_API_URL || 'http://localhost:3001';

  // Fetch Knowledge Graph data from API
  useEffect(() => {
    const fetchGraphData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🔮 OLD KG: Fetching graph for manuscript:', manuscript.id, manuscript.title);
        
        const response = await fetch(`${apiUrl}/api/knowledge-graph/${manuscript.id}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch knowledge graph');
        }
        
        const data = await response.json();
        
        console.log('✅ OLD KG: Received data:', data.nodes?.length, 'nodes,', data.links?.length, 'links');
        
        if (!data.nodes || data.nodes.length === 0) {
          setError('No knowledge graph data available for this manuscript');
          setGraphData(null);
        } else {
          // Transform API format to D3.js format
          // IMPORTANT: Keep nodes array structure intact to preserve index mapping
          const transformedData = {
            nodes: data.nodes.map((n, index) => ({
              ...n, // Keep original structure including ID
              label: n.label,
              type: mapTypeToOldFormat(n.type),
              originalIndex: index // Add for debugging
            })),
            links: data.links.map(l => {
              // Backend sends source/target as indices
              // Create proper link objects with index references
              return {
                source: typeof l.source === 'number' ? l.source : parseInt(l.source),
                target: typeof l.target === 'number' ? l.target : parseInt(l.target),
                label: l.label || l.description?.substring(0, 20) || 'terkait'
              };
            })
          };
          
          // Validate links indices
          const maxIndex = transformedData.nodes.length - 1;
          const validLinks = transformedData.links.filter(l => {
            const sourceValid = l.source >= 0 && l.source <= maxIndex;
            const targetValid = l.target >= 0 && l.target <= maxIndex;
            if (!sourceValid || !targetValid) {
              console.warn('⚠️ Invalid link:', l, 'Max index:', maxIndex);
            }
            return sourceValid && targetValid;
          });
          
          transformedData.links = validLinks;
          
          console.log('🔧 Transformed data:', {
            nodesCount: transformedData.nodes.length,
            linksCount: transformedData.links.length,
            sampleNode: transformedData.nodes[0],
            sampleLink: transformedData.links[0]
          });
          
          setGraphData(transformedData);
        }
      } catch (err) {
        console.error('❌ OLD KG: Error fetching graph:', err);
        setError(err.message);
        setGraphData(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGraphData();
  }, [manuscript.id, apiUrl]);

  // Map new type format to old format for colors
  const mapTypeToOldFormat = (type) => {
    const typeMap = {
      'VALUE': 'Konsep',
      'PERSON': 'Tokoh',
      'LOCATION': 'Konsep',
      'CONCEPT': 'Konsep',
      'ARTIFACT': 'Karya',
      'EVENT': 'Konsep'
    };
    return typeMap[type] || 'Konsep';
  };

  // D3.js visualization
  useEffect(() => {
    if (!graphData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous graph

    const kgData = graphData;

    // Setup dimensions
    const containerWidth = svgRef.current?.parentElement?.clientWidth || 800;
    const isSmallScreen = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
    const width = containerWidth;
    const height = isSmallScreen ? 420 : 600;

    // Color scale Golden/Brown - Modern & Vibrant
    const colorScale = {
      'Karya': '#B7966B',      // Golden brown - untuk karya/naskah
      'Tokoh': '#E6B800',      // Bright gold - untuk tokoh
      'Konsep': '#6B5744',     // Rich brown - untuk konsep
      'Struktur': '#C9A87B'    // Light golden - untuk struktur
    };

    // Setup SVG
    const g = svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .append('g');

    // Setup zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Setup force simulation
    const simulation = d3.forceSimulation(kgData.nodes)
      .force('link', d3.forceLink(kgData.links)
        // Don't use .id() - let D3 use array indices (default behavior)
        .distance(120))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    // Create arrow markers - Golden
    svg.append('defs').selectAll('marker')
      .data(['end'])
      .enter().append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#B7966B');

    // Create links - Golden
    const link = g.append('g')
      .selectAll('line')
      .data(kgData.links)
      .enter().append('line')
      .attr('stroke', '#DBC6A8')
      .attr('stroke-opacity', 0.8)
      .attr('stroke-width', 2.5)
      .attr('marker-end', 'url(#arrow)');

    // Create link labels - Golden (DISABLED - labels removed for cleaner visualization)
    // const linkLabel = g.append('g')
    //   .selectAll('text')
    //   .data(kgData.links)
    //   .enter().append('text')
    //   .attr('font-size', 11)
    //   .attr('font-weight', '600')
    //   .attr('fill', '#6B5744')
    //   .attr('text-anchor', 'middle')
    //   .text(d => d.label);

    // Create node groups
    const node = g.append('g')
      .selectAll('g')
      .data(kgData.nodes)
      .enter().append('g')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add circles to nodes - Golden with shadow
    node.append('circle')
      .attr('r', 22)
      .attr('fill', d => colorScale[d.type] || '#B7966B')
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .style('cursor', 'pointer')
      .style('filter', 'drop-shadow(0 4px 6px rgba(183, 150, 107, 0.3))')
      .on('mouseover', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 28)
          .style('filter', 'drop-shadow(0 6px 12px rgba(230, 184, 0, 0.5))');
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 22)
          .style('filter', 'drop-shadow(0 4px 6px rgba(183, 150, 107, 0.3))');
      });

    // Add labels to nodes - Golden
    node.append('text')
      .attr('dy', 38)
      .attr('text-anchor', 'middle')
      .attr('font-size', 13)
      .attr('font-weight', 'bold')
      .attr('fill', '#5A4833')
      .text(d => d.label)
      .style('pointer-events', 'none');

    // Add type labels - Golden
    node.append('text')
      .attr('dy', 51)
      .attr('text-anchor', 'middle')
      .attr('font-size', 10)
      .attr('font-weight', '600')
      .attr('fill', '#B7966B')
      .text(d => d.type)
      .style('pointer-events', 'none');

    // Update positions on each tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      // linkLabel position update (DISABLED)
      // linkLabel
      //   .attr('x', d => (d.source.x + d.target.x) / 2)
      //   .attr('y', d => (d.source.y + d.target.y) / 2);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [manuscript.id, graphData]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-primary-100 to-accent-100 border-b-2 border-primary-300">
          <h3 className="text-lg sm:text-xl font-bold text-primary-900 flex items-center gap-2">
            <span className="text-xl sm:text-2xl">🔮</span>
            {t('knowledgeGraph.title')}
          </h3>
          <p className="text-sm text-primary-700">{t('knowledgeGraph.visualizing', { title: manuscript.title })}</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">{t('knowledgeGraph.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-primary-100 to-accent-100 border-b-2 border-primary-300">
          <h3 className="text-lg sm:text-xl font-bold text-primary-900 flex items-center gap-2">
            <span className="text-xl sm:text-2xl">🔮</span>
            {t('knowledgeGraph.title')}
          </h3>
          <p className="text-sm text-primary-700">{t('knowledgeGraph.visualizing', { title: manuscript.title })}</p>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 max-w-md text-center">
            <p className="text-yellow-800 font-semibold mb-2">⚠️ {t('knowledgeGraph.noData')}</p>
            <p className="text-yellow-700 text-sm mb-3">{t('knowledgeGraph.noDataDesc')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-primary-50 to-accent-50">
      {/* Header - Golden Theme */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-primary-100 to-accent-100 border-b-2 border-primary-300">
        <h3 className="text-lg sm:text-xl font-bold text-primary-900 flex items-center gap-2">
          <span className="text-xl sm:text-2xl">🔮</span>
          {t('knowledgeGraph.title')}
        </h3>
        <p className="text-sm text-primary-700">{t('knowledgeGraph.visualizing', { title: manuscript.title })}</p>
      </div>

      {/* Graph Container - Golden */}
      <div className="flex-1 overflow-hidden p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow-xl h-full flex flex-col border-2 border-primary-300">
          {/* Legend - Golden */}
          <div className="p-4 sm:p-5 border-b-2 border-primary-200 bg-gradient-to-r from-primary-50 to-accent-50 flex gap-4 sm:gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#B7966B] shadow-md"></div>
              <span className="text-sm font-semibold text-gray-700">{t('knowledgeGraph.legend.work')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#E6B800] shadow-md"></div>
              <span className="text-sm font-semibold text-gray-700">{t('knowledgeGraph.legend.character')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#6B5744] shadow-md"></div>
              <span className="text-sm font-semibold text-gray-700">{t('knowledgeGraph.legend.concept')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#C9A87B] shadow-md"></div>
              <span className="text-sm font-semibold text-gray-700">{t('knowledgeGraph.legend.structure')}</span>
            </div>
          </div>

          {/* SVG Canvas */}
          <div className="flex-1 overflow-hidden bg-gradient-to-br from-amber-50/30 to-white">
            <svg ref={svgRef} className="w-full h-full"></svg>
          </div>

          {/* Instructions - Golden */}
          <div className="p-4 border-t-2 border-primary-200 bg-gradient-to-r from-accent-50 to-primary-50">
            <p className="text-xs sm:text-sm text-gray-700 font-medium text-center sm:text-left">
              💡 {t('knowledgeGraph.tips')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Komponen Left Panel (Daftar Naskah)
// Komponen Left Panel - Modern Golden Sidebar
// Komponen Left Panel - Manuscript List (Desktop)
function LeftPanel({ selectedManuscript, onSelectManuscript, manuscripts, onResearchStart, setViewMode }) {
  const { t } = useTranslation('app');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [itemsPerPage, setItemsPerPage] = useState(20); // Items per page (Increased default)
  const [selectionMode, setSelectionMode] = useState(false); // Multi-selection mode
  const [selectedManuscripts, setSelectedManuscripts] = useState([]); // Selected for research
  const [qualityFilter, setQualityFilter] = useState('all'); // NEW: Quality filter

  // Filter manuscripts based on search query AND quality filter
  const filteredManuscripts = manuscripts.filter((manuscript) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (
      manuscript.title.toLowerCase().includes(query) ||
      manuscript.author.toLowerCase().includes(query) ||
      (manuscript.description && manuscript.description.toLowerCase().includes(query))
    );
    
    // Quality filter logic
    const matchesQuality = qualityFilter === 'all' || 
      (qualityFilter === 'rich' && manuscript.content_quality === 'rich') ||
      (qualityFilter === 'medium' && manuscript.content_quality === 'medium') ||
      (qualityFilter === 'short' && (manuscript.content_quality === 'short' || manuscript.content_quality === 'very_short'));
    
    return matchesSearch && matchesQuality;
  });

  // Separate pinned and non-pinned manuscripts
  const pinnedManuscripts = filteredManuscripts.filter(m => m.is_pinned === true);
  const nonPinnedManuscripts = filteredManuscripts.filter(m => m.is_pinned !== true);

  // Pagination Logic
  // We combine pinned and non-pinned for pagination to make it cleaner
  const allDisplayManuscripts = [...pinnedManuscripts, ...nonPinnedManuscripts];
  
  const totalPages = Math.ceil(allDisplayManuscripts.length / itemsPerPage);
  const paginatedManuscripts = allDisplayManuscripts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, qualityFilter]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of list container
    const listContainer = document.getElementById('manuscript-list-container');
    if (listContainer) listContainer.scrollTop = 0;
  };

  // Selection handlers
  const handleToggleSelection = (manuscript) => {
    setSelectedManuscripts(prev => {
      const isSelected = prev.some(m => m.id === manuscript.id);
      if (isSelected) {
        return prev.filter(m => m.id !== manuscript.id);
      } else {
        if (prev.length >= 5) return prev; // Max 5
        return [...prev, manuscript];
      }
    });
  };

  const handleStartResearch = () => {
    if (selectedManuscripts.length >= 2) {
      onResearchStart(selectedManuscripts, '');
      setSelectionMode(false);
      setSelectedManuscripts([]);
    }
  };

  const handleToggleMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedManuscripts([]);
  };

  return (
    <div id="manuscript-list-container" className="bg-gradient-to-b from-primary-50 to-white p-6 overflow-y-auto h-full border-r-2 border-primary-300 flex flex-col">
      <div className="mb-6 shrink-0">
        <h2 className="text-xl font-bold text-primary-800 mb-2">{t('manuscript.list')}</h2>
        <div className="h-1 w-16 bg-gradient-to-r from-accent-500 to-primary-600 rounded-full"></div>
      </div>

      {/* Chat Semua Naskah Button */}
      <div className="mb-4 shrink-0">
        <button
          type="button"
          onClick={() => setViewMode('ragchat')}
          className="w-full px-4 py-3 rounded-xl font-semibold transition-all shadow-md bg-gradient-to-r from-accent-600 to-primary-500 text-white hover:from-accent-700 hover:to-primary-600"
          title={t('ragChat.description')}
        >
          🔍 {t('ragChat.title')}
        </button>
      </div>

      {/* Multi-Selection Toggle */}
      <div className="mb-4 shrink-0">
        <button
          type="button"
          onClick={handleToggleMode}
          className={`w-full px-4 py-3 rounded-xl font-semibold transition-all shadow-md ${selectionMode
            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
            : 'bg-gradient-to-r from-primary-600 to-accent-500 text-white hover:from-primary-700 hover:to-accent-600'
            }`}
        >
          {selectionMode ? `❌ ${t('multiChat.cancelSelect')}` : `💬 ${t('multiChat.selectMode')}`}
        </button>

        {selectionMode && (
          <div className="mt-3 p-3 bg-accent-50 border-2 border-accent-300 rounded-xl">
            <p className="text-sm text-gray-700">
              <strong className="text-accent-700">
                {selectedManuscripts.length === 0 && 'Pilih 2-3 naskah untuk chat multi-naskah'}
                {selectedManuscripts.length === 1 && '1 naskah dipilih (perlu 1 lagi, max: 3)'}
                {selectedManuscripts.length >= 2 && selectedManuscripts.length < 3 && `${selectedManuscripts.length} naskah dipilih (siap chat!)`}
                {selectedManuscripts.length === 3 && '3 naskah dipilih (maksimum tercapai)'}
              </strong>
            </p>
          </div>
        )}
      </div>

      {/* Multi-Chat Button - Shows when 2-3 selected */}
      {selectionMode && selectedManuscripts.length >= 2 && selectedManuscripts.length <= 3 && (
        <div className="mb-4 shrink-0">
          <button
            type="button"
            onClick={handleStartResearch}
            className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
          >
            💬 Chat dengan {selectedManuscripts.length} Naskah
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-4 shrink-0">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('manuscript.search')}
            className="w-full px-4 py-3 pl-11 rounded-xl border-2 border-primary-300 focus:outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-200 bg-white"
          />
          <svg
            className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
        {(searchQuery || qualityFilter !== 'all') && (
          <p className="text-xs text-gray-500 mt-2">
            {filteredManuscripts.length} {t('manuscript.found')}
          </p>
        )}
      </div>

      {/* Quality Filter Buttons - NEW */}
      <div className="mb-4 shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-primary-700">{t('manuscript.filterQuality')}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setQualityFilter('all')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              qualityFilter === 'all'
                ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-primary-400'
            }`}
          >
            {t('manuscript.filterAll')}
          </button>
          <button
            type="button"
            onClick={() => setQualityFilter('rich')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              qualityFilter === 'rich'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-green-700 border border-green-300 hover:border-green-400'
            }`}
          >
            {t('manuscript.filterRich')}
          </button>
          <button
            type="button"
            onClick={() => setQualityFilter('medium')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              qualityFilter === 'medium'
                ? 'bg-yellow-600 text-white shadow-md'
                : 'bg-white text-yellow-700 border border-yellow-300 hover:border-yellow-400'
            }`}
          >
            {t('manuscript.filterMedium')}
          </button>
          <button
            type="button"
            onClick={() => setQualityFilter('short')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              qualityFilter === 'short'
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-white text-orange-700 border border-orange-300 hover:border-orange-400'
            }`}
          >
            {t('manuscript.filterShort')}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pr-2 space-y-3">
        {paginatedManuscripts.length > 0 ? (
          paginatedManuscripts.map((manuscript) => {
            const isSelectedForResearch = selectedManuscripts.some(m => m.id === manuscript.id);
            const disableSelection = !isSelectedForResearch && selectedManuscripts.length >= 3;

            return (
              <ManuscriptCard
                key={manuscript.id}
                manuscript={manuscript}
                isSelected={selectedManuscript?.id === manuscript.id}
                onClick={() => onSelectManuscript(manuscript)}
                selectionMode={selectionMode}
                isSelectedForResearch={isSelectedForResearch}
                onToggleSelection={handleToggleSelection}
                disableSelection={disableSelection}
              />
            );
          })
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              Tidak ada naskah yang cocok.
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-2 text-xs text-primary-600 hover:underline"
            >
              Hapus pencarian
            </button>
          </div>
        )}
      </div>

      {/* Pagination Controls - Mobile Optimized */}
      {totalPages > 1 && (
        <div className="mt-4 pt-4 border-t border-primary-200 shrink-0">
          <div className="flex flex-col gap-3">
            {/* Page Info & Items Per Page */}
            <div className="flex justify-between items-center text-[10px] sm:text-xs text-gray-600">
              <span>
                {t('manuscript.pagination.page')} <strong className="text-primary-700">{currentPage}</strong> / <strong className="text-primary-700">{totalPages}</strong>
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="text-[10px] sm:text-xs bg-transparent border-b border-gray-300 focus:outline-none focus:border-primary-500 font-semibold text-primary-600"
              >
                <option value={5}>5 {t('manuscript.pagination.perPage')}</option>
                <option value={10}>10 {t('manuscript.pagination.perPage')}</option>
                <option value={20}>20 {t('manuscript.pagination.perPage')}</option>
              </select>
            </div>

            {/* Navigation Buttons - Responsive */}
            <div className="flex justify-between items-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg border-2 border-primary-300 hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold text-primary-700 text-xs sm:text-sm"
                title="Halaman sebelumnya"
              >
                ◀
              </button>

              {/* Page Indicator - Mobile Friendly */}
              <div className="flex-1 flex items-center justify-center gap-2">
                {/* Show compact page numbers on mobile, full on desktop */}
                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        type="button"
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-md'
                            : 'bg-white border border-primary-300 text-primary-700 hover:border-primary-500'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <span className="text-gray-400 px-1">...</span>
                  )}
                </div>
                
                {/* Mobile: Dropdown for page selection */}
                <div className="sm:hidden relative flex-1">
                  <select
                    value={currentPage}
                    onChange={(e) => handlePageChange(Number(e.target.value))}
                    className="w-full appearance-none pl-3 pr-8 py-2 bg-white border-2 border-primary-300 rounded-lg text-xs font-bold text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer text-center"
                  >
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <option key={page} value={page}>
                        Hal {page} / {totalPages}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-primary-500">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg border-2 border-primary-300 hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold text-primary-700 text-xs sm:text-sm"
                title="Halaman selanjutnya"
              >
                ▶
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-gradient-to-br from-accent-50 to-primary-50 rounded-xl border border-accent-200 shrink-0">
        <p className="text-[10px] text-gray-600 leading-relaxed">
          {t('manuscript.pagination.info', { count: allDisplayManuscripts.length })}
        </p>
      </div>
    </div>
  );
}

// Komponen Mobile Selector - Horizontal scroll untuk layar kecil
function MobileManuscriptSelector({ selectedManuscript, onSelectManuscript, manuscripts, onResearchStart, setViewMode }) {
  // State for search and pagination in mobile view
  const [mobileSearch, setMobileSearch] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [mobileQualityFilter, setMobileQualityFilter] = useState('all'); // Mobile quality filter
  const [selectionMode, setSelectionMode] = useState(false); // Multi-selection mode
  const [selectedManuscripts, setSelectedManuscripts] = useState([]); // Selected for research
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const itemsPerPage = 20; // Fixed 20 items per page for mobile

  const filteredManuscripts = manuscripts.filter(m => {
    const matchesSearch = (
      m.title.toLowerCase().includes(mobileSearch.toLowerCase()) ||
      m.author.toLowerCase().includes(mobileSearch.toLowerCase())
    );
    
    const matchesQuality = mobileQualityFilter === 'all' ||
      (mobileQualityFilter === 'rich' && m.content_quality === 'rich') ||
      (mobileQualityFilter === 'medium' && m.content_quality === 'medium') ||
      (mobileQualityFilter === 'short' && (m.content_quality === 'short' || m.content_quality === 'very_short'));
    
    return matchesSearch && matchesQuality;
  });

  // Sort: Pinned first
  const sortedManuscripts = [...filteredManuscripts].sort((a, b) => {
    if (a.is_pinned === b.is_pinned) return 0;
    return a.is_pinned ? -1 : 1;
  });

  // Pagination Logic
  const totalPages = Math.ceil(sortedManuscripts.length / itemsPerPage);
  const paginatedManuscripts = sortedManuscripts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [mobileSearch, mobileQualityFilter]);

  // Selection handlers
  const handleToggleSelection = (manuscript) => {
    setSelectedManuscripts(prev => {
      const isSelected = prev.some(m => m.id === manuscript.id);
      if (isSelected) {
        return prev.filter(m => m.id !== manuscript.id);
      } else {
        if (prev.length >= 3) return prev; // Max 3
        return [...prev, manuscript];
      }
    });
  };

  const handleStartResearch = () => {
    if (selectedManuscripts.length >= 2) {
      onResearchStart(selectedManuscripts);
      setSelectionMode(false);
      setSelectedManuscripts([]);
    }
  };

  const handleToggleMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedManuscripts([]);
  };

  return (
    <div className="lg:hidden bg-gradient-to-br from-primary-50 via-amber-50 to-accent-50 border-b border-primary-200 shadow-md sticky top-0 z-30">
      {/* Mobile Header & Controls */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-primary-900 flex items-center gap-2">
            📚 Koleksi Naskah
            <span className="text-xs font-normal text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full">
              {filteredManuscripts.length}
            </span>
          </h2>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary-600 text-sm font-semibold flex items-center gap-1"
          >
            {isExpanded ? 'Tutup ▲' : 'Cari & Filter ▼'}
          </button>
        </div>

        {/* Action Buttons - Chat Semua & Multi-selection */}
        <div className="space-y-2 mb-3">
          <button
            type="button"
            onClick={() => setViewMode('ragchat')}
            className="w-full px-4 py-2.5 rounded-xl font-semibold transition-all shadow-md bg-gradient-to-r from-accent-600 to-primary-500 text-white hover:from-accent-700 hover:to-primary-600 text-sm"
          >
            🔍 Chat Semua Naskah
          </button>
          
          <button
            type="button"
            onClick={handleToggleMode}
            className={`w-full px-4 py-2.5 rounded-xl font-semibold transition-all shadow-md text-sm ${selectionMode
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
              : 'bg-gradient-to-r from-primary-600 to-accent-500 text-white hover:from-primary-700 hover:to-accent-600'
            }`}
          >
            {selectionMode ? '❌ Batal Pilih' : '💬 Pilih untuk Chat (Max 3)'}
          </button>

          {selectionMode && (
            <div className="p-2.5 bg-accent-50 border-2 border-accent-300 rounded-xl">
              <p className="text-xs text-gray-700 text-center">
                <strong className="text-accent-700">
                  {selectedManuscripts.length === 0 && 'Pilih 2-3 naskah untuk chat multi-naskah'}
                  {selectedManuscripts.length === 1 && '1 naskah dipilih (perlu 1 lagi, max: 3)'}
                  {selectedManuscripts.length >= 2 && selectedManuscripts.length < 3 && `${selectedManuscripts.length} naskah dipilih (siap chat!)`}
                  {selectedManuscripts.length === 3 && '3 naskah dipilih (maksimum tercapai)'}
                </strong>
              </p>
            </div>
          )}
        </div>

        {/* Multi-Chat Button - Shows when 2-3 selected */}
        {selectionMode && selectedManuscripts.length >= 2 && selectedManuscripts.length <= 3 && (
          <div className="mb-3">
            <button
              type="button"
              onClick={handleStartResearch}
              className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg text-sm"
            >
              💬 Chat dengan {selectedManuscripts.length} Naskah
            </button>
          </div>
        )}

        {/* Expandable Search & Filter Area */}
        {isExpanded && (
          <div className="space-y-3 mb-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={mobileSearch}
                onChange={(e) => setMobileSearch(e.target.value)}
                placeholder="Cari judul atau pengarang..."
                className="w-full px-4 py-2 pl-10 rounded-xl border border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
              <svg
                className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Quality Filter Buttons */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-primary-700">🎯 Filter Kualitas:</span>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setMobileQualityFilter('all')}
                  className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    mobileQualityFilter === 'all'
                      ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  📚 Semua
                </button>
                <button
                  type="button"
                  onClick={() => setMobileQualityFilter('rich')}
                  className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    mobileQualityFilter === 'rich'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-white text-green-700 border border-green-300'
                  }`}
                >
                  🟢
                </button>
                <button
                  type="button"
                  onClick={() => setMobileQualityFilter('medium')}
                  className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    mobileQualityFilter === 'medium'
                      ? 'bg-yellow-600 text-white shadow-md'
                      : 'bg-white text-yellow-700 border border-yellow-300'
                  }`}
                >
                  🟡
                </button>
                <button
                  type="button"
                  onClick={() => setMobileQualityFilter('short')}
                  className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    mobileQualityFilter === 'short'
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'bg-white text-orange-700 border border-orange-300'
                  }`}
                >
                  🟠
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Horizontal Scroll List */}
      <div
        className="flex gap-3 overflow-x-auto pb-4 px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {paginatedManuscripts.map((manuscript) => {
          const isActive = selectedManuscript?.id === manuscript.id;
          const isSelectedForResearch = selectedManuscripts.some(m => m.id === manuscript.id);
          const disableSelection = !isSelectedForResearch && selectedManuscripts.length >= 3;
          
          return (
            <button
              key={manuscript.id}
              type="button"
              onClick={() => selectionMode ? (!disableSelection && handleToggleSelection(manuscript)) : onSelectManuscript(manuscript)}
              className={`flex-shrink-0 w-[260px] rounded-xl border px-4 py-3 text-left transition-all duration-200 shadow-sm relative overflow-hidden ${
                isSelectedForResearch 
                  ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-500 shadow-lg'
                  : isActive
                    ? 'bg-gradient-to-br from-primary-600 to-accent-600 text-white border-transparent shadow-lg'
                    : 'bg-white border-primary-200 text-gray-900 hover:border-primary-400'
              } ${disableSelection && selectionMode ? 'opacity-60' : ''}`}
              disabled={selectionMode && disableSelection}
            >
              {/* Selection Checkbox - Shows in selection mode */}
              {selectionMode && (
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={isSelectedForResearch}
                    onChange={(e) => {
                      e.stopPropagation();
                      if (!disableSelection) handleToggleSelection(manuscript);
                    }}
                    disabled={disableSelection}
                    className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-green-500 cursor-pointer disabled:cursor-not-allowed"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
              
              {/* Active Indicator */}
              {!selectionMode && isActive && (
                <div className="absolute top-0 right-0 bg-white/20 p-1 rounded-bl-lg">
                  <span className="text-xs">✓</span>
                </div>
              )}
              
              {/* Selected Indicator */}
              {selectionMode && isSelectedForResearch && (
                <div className="absolute top-0 right-0 bg-green-500 p-1 rounded-bl-lg">
                  <span className="text-xs text-white">✓</span>
                </div>
              )}
              
              <div className={`flex items-center gap-2 mb-2 ${selectionMode ? 'mt-6' : ''}`}>
                {manuscript.is_pinned && (
                  <span className={`text-[10px] px-1.5 rounded ${
                    isSelectedForResearch 
                      ? 'bg-green-200 text-green-800 border border-green-400'
                      : isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                  }`}>
                    📌 Pin
                  </span>
                )}
                <p className={`text-[10px] uppercase tracking-wide font-bold truncate ${
                  isSelectedForResearch 
                    ? 'text-green-700'
                    : isActive 
                      ? 'text-primary-100' 
                      : 'text-primary-600'
                }`}>
                  {manuscript.author}
                </p>
              </div>
              
              <h3 className={`text-sm font-bold leading-snug mb-1 line-clamp-2 h-10 ${
                isSelectedForResearch 
                  ? 'text-green-900'
                  : isActive 
                    ? 'text-white' 
                    : 'text-gray-900'
              }`}>
                {manuscript.title}
              </h3>
              
              <p className={`text-[10px] line-clamp-2 ${
                isSelectedForResearch 
                  ? 'text-green-700'
                  : isActive 
                    ? 'text-primary-100' 
                    : 'text-gray-500'
              }`}>
                {manuscript.description}
              </p>
            </button>
          );
        })}
        
        {sortedManuscripts.length === 0 && (
          <div className="w-full text-center py-4 text-gray-500 text-sm">
            Tidak ada naskah ditemukan.
          </div>
        )}
      </div>

      {/* Mobile Pagination Controls */}
      {totalPages > 1 && (
        <div className="px-4 pb-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg border border-primary-300 bg-white text-primary-700 text-xs font-bold disabled:opacity-50"
          >
            ◀ Prev
          </button>
          
          <span className="text-xs text-gray-600 font-medium">
            Hal {currentPage} / {totalPages}
          </span>
          
          <button
            type="button"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg border border-primary-300 bg-white text-primary-700 text-xs font-bold disabled:opacity-50"
          >
            Next ▶
          </button>
        </div>
      )}
    </div>
  );
}

// Komponen Right Panel - Modern Golden Theme
function RightPanel({ selectedManuscript, viewMode, setViewMode }) {
  const { t } = useTranslation('app');
  
  return (
    <div className="bg-white flex flex-col h-full">
      {selectedManuscript && (
        <div className="bg-gradient-to-r from-primary-100 via-accent-50 to-primary-100 px-4 sm:px-6 py-4 sm:py-5 border-b-2 border-primary-300 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-primary-900">{selectedManuscript.title}</h2>
            <p className="text-sm text-primary-700 font-medium">{selectedManuscript.author}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            {selectedManuscript.source_url && (
              <button
                type="button"
                onClick={() => window.open(selectedManuscript.source_url, '_blank')}
                className="px-4 py-2.5 sm:px-5 rounded-xl font-semibold transition-all duration-200 bg-white text-blue-600 border-2 border-blue-300 hover:border-blue-400 hover:shadow-md"
              >
                🔗 Sumber
              </button>
            )}
            <button
              type="button"
              onClick={() => setViewMode('chat')}
              className={`px-4 py-2.5 sm:px-5 rounded-xl font-semibold transition-all duration-200 ${viewMode === 'chat'
                ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-lg sm:scale-105'
                : 'bg-white text-gray-700 border-2 border-primary-300 hover:border-accent-400 hover:shadow-md'
                }`}
            >
              💬 {t('tabs.chatAI')}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kg')}
              className={`px-4 py-2.5 sm:px-5 rounded-xl font-semibold transition-all duration-200 ${viewMode === 'kg'
                ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-lg sm:scale-105'
                : 'bg-white text-gray-700 border-2 border-primary-300 hover:border-accent-400 hover:shadow-md'
                }`}
            >
              🔮 {t('tabs.knowledgeGraph')}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('educational')}
              className={`px-4 py-2.5 sm:px-5 rounded-xl font-semibold transition-all duration-200 ${viewMode === 'educational'
                ? 'bg-gradient-to-r from-accent-600 to-yellow-500 text-white shadow-lg sm:scale-105'
                : 'bg-white text-gray-700 border-2 border-accent-300 hover:border-accent-400 hover:shadow-md'
                }`}
            >
              🎓 {t('tabs.educational')}
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        {viewMode === 'welcome' && <WelcomeScreen />}
        {viewMode === 'chat' && selectedManuscript && (
          <ChatPanel manuscript={selectedManuscript} />
        )}
        {viewMode === 'ragchat' && (
          <ErrorBoundary>
            <RagChatPanel />
          </ErrorBoundary>
        )}
        {viewMode === 'kg' && selectedManuscript && (
          <KnowledgeGraphPanel manuscript={selectedManuscript} />
        )}
        {viewMode === 'educational' && selectedManuscript && (
          <div className="h-full overflow-y-auto p-4 sm:p-6 bg-gradient-to-br from-amber-50 to-orange-50">
            {console.log('🎓 EDUCATIONAL MODE ACTIVE - Manuscript:', selectedManuscript.id)}
            <ErrorBoundary>
              <EducationalPanel manuscript={selectedManuscript} />
            </ErrorBoundary>
            <div className="mt-6">
              {console.log('🔮 ABOUT TO RENDER EducationalKnowledgeGraph')}
              <ErrorBoundary>
                <EducationalKnowledgeGraph 
                  key={selectedManuscript.id} 
                  manuscript={selectedManuscript} 
                />
              </ErrorBoundary>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Komponen App Utama
function App() {
  const { i18n } = useTranslation('app');
  const location = useLocation();
  const [selectedManuscript, setSelectedManuscript] = useState(null);
  const [viewMode, setViewMode] = useState('welcome');
  const [manuscripts, setManuscripts] = useState([]); // State untuk data dari Supabase
  const [loading, setLoading] = useState(true);
  const [deepChatOpen, setDeepChatOpen] = useState(false); // State untuk Deep Chat modal
  const [deepChatManuscript, setDeepChatManuscript] = useState(null);
  const [deepChatInitialQuery, setDeepChatInitialQuery] = useState('');
  const [multiChatOpen, setMultiChatOpen] = useState(false); // State untuk Multi-Chat
  const [multiChatManuscripts, setMultiChatManuscripts] = useState([]);

  // Fetch manuscripts dari Supabase saat component mount
  useEffect(() => {
    loadManuscripts();
  }, []);

  // Handle navigation from Catalog Page
  useEffect(() => {
    if (location.state?.selectedManuscriptId && manuscripts.length > 0) {
      const manuscript = manuscripts.find(m => m.id === location.state.selectedManuscriptId);
      if (manuscript) {
        setSelectedManuscript(manuscript);
        setViewMode('chat');
        // Clear state to prevent reopening on refresh (optional, but good UX)
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, manuscripts]);

  // Handler untuk start research dari multi-manuscript selection
  const handleStartResearch = (manuscripts) => {
    if (manuscripts.length > 3) {
      alert('Maksimal 3 naskah untuk multi-chat!');
      return;
    }
    setMultiChatManuscripts(manuscripts);
    setMultiChatOpen(true);
  };

  const loadManuscripts = async () => {
    try {
      // Coba fetch dari Backend API
      const data = await manuscriptService.getAll();

      if (data && data.length > 0) {
        // Jika ada data di database, gunakan itu
        setManuscripts(data);
      } else {
        // Jika database kosong, gunakan hardcoded data sebagai fallback
        console.log('📚 Database kosong, menggunakan data hardcoded');
        setManuscripts(Object.values(MANUSCRIPT_DATA));
      }
    } catch (error) {
      // Jika Backend API error, fallback ke hardcoded data
      console.warn('⚠️ Gagal fetch dari Backend API, menggunakan data hardcoded:', error);
      setManuscripts(Object.values(MANUSCRIPT_DATA));
    } finally {
      setLoading(false);
    }
  };

  // OPTIMIZED: Lazy load full_text when manuscript is selected
  const handleSelectManuscript = async (manuscript) => {
    setViewMode('chat');
    
    // If manuscript already has full_text, use it
    if (manuscript.full_text) {
      setSelectedManuscript(manuscript);
      return;
    }
    
    // Otherwise, fetch full manuscript data with full_text
    try {
      const fullManuscript = await manuscriptService.getBySlug(manuscript.slug);
      setSelectedManuscript(fullManuscript);
    } catch (error) {
      console.error('Failed to load manuscript detail:', error);
      // Fallback to manuscript without full_text
      setSelectedManuscript(manuscript);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat naskah...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50 flex flex-col">
      <Helmet>
        <title>Aplikasi Utama - Nala Pustaka</title>
        <meta name="description" content="Aplikasi analisis naskah kuno dengan fitur Chat AI, Knowledge Graph, dan Mode Edukatif." />
        <link rel="canonical" href="https://nalapustaka.com/app" />

        {/* Open Graph */}
        <meta property="og:title" content="Aplikasi Utama - Nala Pustaka" />
        <meta property="og:description" content="Aplikasi analisis naskah kuno dengan fitur Chat AI, Knowledge Graph, dan Mode Edukatif." />
        <meta property="og:url" content="https://nalapustaka.com/app" />
        <meta property="og:type" content="website" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Aplikasi Utama - Nala Pustaka" />
        <meta name="twitter:description" content="Aplikasi analisis naskah kuno dengan fitur Chat AI, Knowledge Graph, dan Mode Edukatif." />
      </Helmet>
      
      <Navbar />

      {/* Deep Chat Modal */}
      {deepChatOpen && deepChatManuscript && (
        <ErrorBoundary>
          <DeepChatModal
            manuscript={deepChatManuscript}
            initialQuery={deepChatInitialQuery}
            onClose={() => {
              setDeepChatOpen(false);
              setDeepChatManuscript(null);
              setDeepChatInitialQuery('');
            }}
          />
        </ErrorBoundary>
      )}

      {/* Multi-Chat Modal */}
      {multiChatOpen && multiChatManuscripts.length >= 2 && multiChatManuscripts.length <= 3 && (
        <ErrorBoundary>
          <MultiChatModal
            manuscripts={multiChatManuscripts}
            onClose={() => {
              setMultiChatOpen(false);
              setMultiChatManuscripts([]);
            }}
          />
        </ErrorBoundary>
      )}

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Mobile Selector */}
        <div className="lg:hidden">
          <MobileManuscriptSelector
            key={`mobile-selector-${i18n.language}`} // Force remount on language change to prevent DOM mismatch
            selectedManuscript={selectedManuscript}
            onSelectManuscript={handleSelectManuscript}
            manuscripts={manuscripts}
            onResearchStart={handleStartResearch}
            setViewMode={setViewMode}
          />
        </div>

        {/* Left Panel - Manuscript List (Desktop) */}
        <div className="hidden lg:block w-full lg:w-1/3 h-full max-h-full">
          <LeftPanel
            key={`desktop-panel-${i18n.language}`} // Force remount on language change
            selectedManuscript={selectedManuscript}
            onSelectManuscript={handleSelectManuscript}
            manuscripts={manuscripts}
            onResearchStart={handleStartResearch}
            setViewMode={setViewMode}
          />
        </div>


        {/* Right Panel - Content */}
        <div className="flex-1 h-full">
          <RightPanel
            selectedManuscript={selectedManuscript}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
