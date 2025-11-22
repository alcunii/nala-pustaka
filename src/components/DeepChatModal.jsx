import { useState, useEffect } from 'react';
import { marked } from 'marked';
import { MessageCircle, X, Send, Loader2, FileText, User } from 'lucide-react';
import Logo from './common/Logo';
// Configure marked for better rendering
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: false,
  mangle: false
});
import { ragApi } from '../lib/ragApi';

export default function DeepChatModal({ manuscript, initialQuery, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fullContext, setFullContext] = useState(null);
  const [loadingContext, setLoadingContext] = useState(true);

  // Load full manuscript on mount
  useEffect(() => {
    loadFullManuscript();
  }, [manuscript.manuscriptId]);

  // Auto-send initial query after context loaded
  useEffect(() => {
    if (fullContext && initialQuery && messages.length === 1) {
      setTimeout(() => {
        handleSend(null, initialQuery);
      }, 500);
    }
  }, [fullContext]);

  const loadFullManuscript = async () => {
    try {
      setLoadingContext(true);
      const data = await ragApi.getFullManuscript(manuscript.manuscriptId);
      setFullContext(data);
      
      setMessages([{
        id: Date.now(),
        sender: 'ai',
        text: `Hai! Saya sudah memuat **${data.chunkCount} bagian** dari ${manuscript.title}. Silakan tanyakan apa saja!`
      }]);
    } catch (error) {
      setMessages([{
        id: Date.now(),
        sender: 'ai',
        text: `❌ Gagal memuat naskah: ${error.message}`
      }]);
    } finally {
      setLoadingContext(false);
    }
  };

  const handleSend = async (e, queryOverride = null) => {
    e?.preventDefault();
    const userQuery = queryOverride || input.trim();
    if (!userQuery || isLoading || !fullContext) return;

    const userMessage = { 
      id: Date.now(), 
      sender: 'user', 
      text: userQuery 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Format conversation history untuk backend (sender: 'user'/'ai', text: string)
      // Keep last 5 exchanges for context
      const conversationHistory = messages
        .filter(m => !m.text.includes('Saya sudah memuat')) // Exclude welcome message
        .slice(-5); // Keep last 5 exchanges

      const result = await ragApi.deepChat(
        manuscript.manuscriptId,
        fullContext.fullText,
        fullContext.title,
        userQuery,
        conversationHistory
      );
      
      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: result.answer,
        citations: result.citations
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: `❌ Error: ${error.message}`
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col notranslate" translate="no">
        {/* Header with enhanced styling */}
        <div className="bg-gradient-to-r from-primary-600 to-accent-500 p-5 rounded-t-2xl text-white flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <MessageCircle className="w-7 h-7" />
                Deep Chat: {manuscript.title}
              </h2>
              <div className="flex gap-2 flex-wrap mb-2">
                <span className="bg-white/20 px-3 py-1 rounded-lg text-sm backdrop-blur-sm flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {manuscript.author}
                </span>
                {fullContext && (
                  <span className="bg-white/20 px-3 py-1 rounded-lg text-sm backdrop-blur-sm flex items-center gap-1">
                    <Logo location="modal" size="sm" />
                    {fullContext.chunkCount} bagian dimuat
                  </span>
                )}
              </div>
              <p className="text-sm text-white/90">
                💡 Tanyakan apa saja tentang naskah ini secara mendalam. AI membaca seluruh isi naskah.
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
          {loadingContext ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg font-semibold">Memuat naskah lengkap...</p>
              <p className="text-gray-500 text-sm mt-2">Harap tunggu sebentar</p>
            </div>
          ) : (
            <>
              {messages.length === 1 && messages[0].text.includes('Saya sudah memuat') && (
                <div className="text-center py-12">
                  <div className="mb-4 animate-bounce">
                    <MessageCircle className="w-16 h-16 text-primary-600 mx-auto" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">
                    Mulai Percakapan Deep Chat
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Ajukan pertanyaan mendalam tentang {manuscript.title}
                  </p>
                  <div className="max-w-md mx-auto space-y-3 text-left">
                    <div className="bg-white p-4 rounded-xl border-2 border-primary-200 shadow-sm">
                      <div className="font-bold text-primary-700 mb-2">📚 Contoh Pertanyaan:</div>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-accent-500 flex-shrink-0">•</span>
                          <span>Apa tema utama yang dibahas dalam naskah ini?</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-accent-500 flex-shrink-0">•</span>
                          <span>Siapa tokoh-tokoh penting yang disebutkan?</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-accent-500 flex-shrink-0">•</span>
                          <span>Bagaimana konteks historis naskah ini?</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-accent-500 flex-shrink-0">•</span>
                          <span>Apa nilai-nilai yang terkandung di dalamnya?</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                  {msg.sender === 'assistant' && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold mr-3 shadow-md">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                  )}
                  
                  <div className={`max-w-3xl ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-lg'
                      : 'bg-white border-2 border-primary-200 shadow-md'
                  } rounded-2xl p-4`}>
                    <div
                      className="prose prose-base max-w-none prose-headings:text-primary-800 prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-6 prose-h2:mb-4 prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-4 prose-h3:mb-3 prose-strong:text-primary-700 prose-strong:font-bold prose-em:text-accent-700 prose-blockquote:border-l-4 prose-blockquote:border-accent-400 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-700 prose-ul:list-disc prose-ul:ml-6 prose-ol:list-decimal prose-ol:ml-6 prose-li:my-1 prose-p:my-3 prose-p:leading-relaxed prose-hr:my-6 prose-hr:border-gray-300 markdown-content"
                      dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }}
                    />
                    
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <details className="cursor-pointer group">
                          <summary className="text-sm font-semibold text-primary-700 hover:text-accent-600 transition-colors select-none">
                            📖 Lihat Kutipan ({msg.citations.length})
                          </summary>
                          <div className="mt-3 space-y-2">
                            {msg.citations.map((citation, idx) => (
                              <div key={idx} className="bg-accent-50 p-3 rounded-lg border border-accent-200">
                                <p className="text-xs text-gray-700 italic leading-relaxed">"{citation}"</p>
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>

                  {msg.sender === 'user' && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold ml-3 shadow-md">
                      <User className="w-6 h-6" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold mr-3 shadow-md">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div className="bg-white border-2 border-primary-200 rounded-2xl p-4 shadow-md">
                    <span className="text-gray-600 text-sm">
                      AI sedang membaca naskah secara mendalam...
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Input Box */}
        <form onSubmit={handleSend} className="border-t-2 border-gray-200 p-4 bg-gray-50 rounded-b-2xl flex-shrink-0">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya tentang naskah ini..."
              className="flex-1 px-4 py-3 border-2 border-primary-300 rounded-xl focus:outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-200 transition-all"
              disabled={isLoading || loadingContext}
              autoFocus
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading || loadingContext}
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-bold rounded-xl hover:from-primary-700 hover:to-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none flex items-center gap-2"
            >
              {!isLoading && <Send className="w-5 h-5" />}
              {isLoading ? 'Loading...' : 'Kirim'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            💡 Pertanyaan dijawab berdasarkan analisis mendalam seluruh isi {manuscript.title}
          </p>
        </form>
      </div>
    </div>
  );
}
