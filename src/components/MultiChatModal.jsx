import { useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { MessageCircle, X, Send, Loader2, FileText, User, BookMarked } from 'lucide-react';

// Configure marked for better rendering
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: false,
  mangle: false
});

export default function MultiChatModal({ manuscripts, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_RAG_API_URL || 'http://localhost:3001';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Format conversation history untuk backend (role: 'user'/'assistant', content: string)
      // Keep last 5 exchanges for context
      const conversationHistory = messages.slice(-5);

      const response = await fetch(apiUrl + '/api/chat/multi-manuscript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manuscripts,
          query: userMessage,
          conversationHistory
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal mendapatkan respons');
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer,
        sources: data.sources
      }]);
    } catch (err) {
      console.error('Chat error:', err);
      setError(err.message);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Maaf, terjadi kesalahan: ' + err.message
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl notranslate" translate="no">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-accent-500 p-5 rounded-t-2xl text-white flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <MessageCircle className="w-7 h-7" />
                Chat dengan {manuscripts.length} Naskah
              </h2>
              <div className="flex gap-2 flex-wrap mb-2">
                {manuscripts.map((m, i) => (
                  <span key={i} className="bg-white/20 px-3 py-1 rounded-lg text-sm backdrop-blur-sm flex items-center gap-1">
                    <BookMarked className="w-4 h-4" />
                    {m.title}
                  </span>
                ))}
              </div>
              <p className="text-sm text-white/90">
                💡 Tanyakan apapun tentang naskah-naskah ini. Jawaban akan merujuk sumber aslinya.
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white/20 rounded-lg transition-colors ml-4"
              title="Tutup"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="mb-4 animate-bounce">
                <MessageCircle className="w-16 h-16 text-primary-600 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                Mulai Percakapan
              </h3>
              <p className="text-gray-600 mb-6">
                Ajukan pertanyaan tentang naskah-naskah yang dipilih
              </p>
              <div className="max-w-md mx-auto space-y-3 text-left">
                <div className="bg-white p-4 rounded-xl border-2 border-primary-200 shadow-sm">
                  <div className="font-bold text-primary-700 mb-2">📚 Contoh Pertanyaan:</div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-accent-500 flex-shrink-0">•</span>
                      <span>Siapa raja pertama Kerajaan Mataram?</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-500 flex-shrink-0">•</span>
                      <span>Bagaimana proses penobatan raja dijelaskan?</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-500 flex-shrink-0">•</span>
                      <span>Apa perbedaan versi sejarah antar naskah?</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-500 flex-shrink-0">•</span>
                      <span>Bagaimana perang dijelaskan dalam naskah-naskah ini?</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            >
              {msg.role === 'assistant' && (
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold mr-3 shadow-md">
                  <MessageCircle className="w-6 h-6" />
                </div>
              )}
              
              <div className={`max-w-3xl ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-lg' 
                  : 'bg-white border-2 border-primary-200 shadow-md'
              } rounded-2xl p-4`}>
                {msg.role === 'assistant' ? (
                  <div className="prose prose-base max-w-none prose-headings:text-primary-800 prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-6 prose-h2:mb-4 prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-4 prose-h3:mb-3 prose-strong:text-primary-700 prose-strong:font-bold prose-em:text-accent-700 prose-blockquote:bg-amber-50 prose-blockquote:border-l-4 prose-blockquote:border-amber-400 prose-blockquote:py-3 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:italic prose-blockquote:text-gray-800 prose-blockquote:not-italic prose-ul:list-disc prose-ul:ml-6 prose-ol:list-decimal prose-ol:ml-6 prose-li:my-1 prose-p:my-3 prose-p:leading-relaxed prose-hr:my-6 prose-hr:border-gray-300">
                    <div
                      className="text-gray-800 leading-relaxed markdown-content"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(msg.content || '')) }}
                    />
                    
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <details className="cursor-pointer group">
                          <summary className="text-sm font-semibold text-primary-700 hover:text-accent-600 transition-colors select-none">
                            📚 Lihat Sumber ({msg.sources.length} kutipan)
                          </summary>
                          <div className="mt-3 space-y-2">
                            {msg.sources.map((src, i) => (
                              src.url ? (
                                <a
                                  key={i}
                                  href={src.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block bg-accent-50 p-3 rounded-lg border border-accent-200 hover:bg-accent-100 hover:border-accent-300 transition-all cursor-pointer group/card"
                                  title="Klik untuk melihat sumber asli di Sastra.org"
                                >
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <div className="flex items-center gap-1.5">
                                      <strong className="text-sm text-primary-800 group-hover/card:text-accent-700 transition-colors">
                                        {src.manuscriptTitle}
                                      </strong>
                                      <svg className="w-3 h-3 text-accent-400 group-hover/card:text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                      </svg>
                                    </div>
                                    <span className="text-xs bg-accent-200 px-2 py-0.5 rounded-full text-accent-800">
                                      {(src.relevance * 100).toFixed(0)}%
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-700 leading-relaxed">{src.excerpt}</p>
                                </a>
                              ) : (
                                <div key={i} className="bg-accent-50 p-3 rounded-lg border border-accent-200">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <strong className="text-sm text-primary-800">{src.manuscriptTitle}</strong>
                                    <span className="text-xs bg-accent-200 px-2 py-0.5 rounded-full text-accent-800">
                                      {(src.relevance * 100).toFixed(0)}%
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-700 leading-relaxed">{src.excerpt}</p>
                                </div>
                              )
                            ))}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-white leading-relaxed">{msg.content}</p>
                )}
              </div>
              
              {msg.role === 'user' && (
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold ml-3 shadow-md">
                  <User className="w-6 h-6" />
                </div>
              )}
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start animate-fadeIn">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold mr-3 shadow-md">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div className="bg-white border-2 border-primary-200 rounded-2xl p-4 shadow-md">
                <span className="text-gray-600 text-sm">
                  Mencari informasi di {manuscripts.length} naskah...
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Input Box */}
        <div className="border-t-2 border-gray-200 p-4 bg-gray-50 rounded-b-2xl flex-shrink-0">
          {error && (
            <div className="mb-3 bg-red-50 border-2 border-red-200 rounded-lg p-3 text-sm text-red-800">
              ⚠️ {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanyakan tentang naskah-naskah ini..."
              className="flex-1 px-4 py-3 border-2 border-primary-300 rounded-xl focus:outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-200 transition-all"
              disabled={loading}
              autoFocus
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-bold rounded-xl hover:from-primary-700 hover:to-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none flex items-center gap-2"
            >
              {!loading && <Send className="w-5 h-5" />}
              {loading ? 'Loading...' : 'Kirim'}
            </button>
          </form>
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            💡 Tip: Ajukan pertanyaan spesifik untuk jawaban lebih detail dan lengkap
          </p>
        </div>
      </div>
    </div>
  );
}
