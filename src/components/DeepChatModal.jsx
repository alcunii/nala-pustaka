import { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import { ragApi } from '../lib/ragApi';

export default function DeepChatModal({ manuscript, initialQuery, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fullContext, setFullContext] = useState(null);
  const [loadingContext, setLoadingContext] = useState(true);
  const chatEndRef = useRef(null);

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
      const conversationHistory = messages.filter(m => 
        !m.text.includes('Saya sudah memuat')
      );

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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col">
        <div className="bg-gradient-to-r from-primary-600 to-accent-500 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              💬 Deep Chat: {manuscript.title}
            </h2>
            <p className="text-sm text-white/90">
              {manuscript.author} • {fullContext ? `${fullContext.chunkCount} chunks loaded` : 'Loading...'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loadingContext ? (
            <div className="text-center py-10">
              <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat naskah lengkap...</p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-accent-500 to-primary-600 text-white'
                      : 'bg-primary-50 text-gray-800 border-2 border-primary-200'
                  }`}>
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }}
                    />
                    
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-primary-300">
                        <p className="text-xs font-bold text-primary-700 mb-1">📖 Kutipan:</p>
                        {msg.citations.map((citation, idx) => (
                          <p key={idx} className="text-xs text-gray-700 italic mb-1">
                            "{citation}"
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-primary-50 border-2 border-primary-200 rounded-2xl px-5 py-3">
                    <div className="flex items-center gap-2 text-primary-700">
                      <div className="animate-spin h-4 w-4 border-2 border-primary-600 border-t-transparent rounded-full"></div>
                      <span>AI sedang membaca naskah...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </>
          )}
        </div>

        <form onSubmit={handleSend} className="p-4 border-t-2 border-primary-200 bg-gradient-to-r from-primary-50 to-accent-50">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya tentang naskah ini..."
              className="flex-1 px-4 py-3 border-2 border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500"
              disabled={isLoading || loadingContext}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading || loadingContext}
              className="px-8 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-bold rounded-xl hover:from-primary-700 hover:to-accent-600 disabled:opacity-50 transition-all shadow-md"
            >
              {isLoading ? '...' : 'Kirim'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Pertanyaan dijawab berdasarkan seluruh isi {manuscript.title}
          </p>
        </form>
      </div>
    </div>
  );
}
