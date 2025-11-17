import { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import { ragApi } from '../lib/ragApi';

export default function RagChatPanel() {
  const [messages, setMessages] = useState([{
    id: Date.now(),
    sender: 'ai',
    text: '👋 Selamat datang di RAG Chat! Tanyakan apa saja tentang 121 naskah kuno Jawa. Saya akan mencari dan menjawab berdasarkan informasi yang relevan.',
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userQuery = input.trim();
    const userMessage = { id: Date.now(), sender: 'user', text: userQuery };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.filter(m => 
        m.text !== messages[0].text
      ).slice(-5);

      const result = await ragApi.ragChat(userQuery, conversationHistory);
      
      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: result.answer,
        sources: result.sources
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: `❌ Maaf, terjadi kesalahan: ${error.message}\n\nPastikan backend server sudah running.`
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-6 py-4 bg-gradient-to-r from-primary-100 to-accent-100 border-b-2 border-primary-300">
        <h3 className="text-xl font-bold text-primary-900 flex items-center gap-2">
          <span className="text-2xl">🔍</span>
          RAG Chat - Cross-Document AI
        </h3>
        <p className="text-sm text-primary-700">Tanya tentang 121 naskah kuno Jawa</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-primary-300">
                  <p className="text-xs font-bold text-primary-700 mb-2">📚 Sumber:</p>
                  {msg.sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-blue-600 hover:underline mb-1"
                    >
                      • {source.title} - {source.author} ({(source.score * 100).toFixed(0)}% relevan)
                    </a>
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
                <span>Mencari dan menganalisis...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t-2 border-primary-200 bg-gradient-to-r from-primary-50 to-accent-50">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanya apa saja... (contoh: Siapa Pangeran Mangkubumi?)"
            className="flex-1 px-4 py-3 border-2 border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-8 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-bold rounded-xl hover:from-primary-700 hover:to-accent-600 disabled:opacity-50 transition-all shadow-md"
          >
            {isLoading ? '...' : 'Kirim'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 Tips: Gunakan pertanyaan natural language untuk hasil terbaik
        </p>
      </form>
    </div>
  );
}
