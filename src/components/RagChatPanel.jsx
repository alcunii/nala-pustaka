import { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import { MessageCircle, Send, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ragApi } from '../lib/ragApi';
import Logo from './common/Logo';

export default function RagChatPanel() {
  const { t } = useTranslation('app');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const isMountedRef = useRef(true);

  // Initialize greeting message on mount
  useEffect(() => {
    isMountedRef.current = true;
    
    // Set initial greeting message
    setMessages([{
      id: Date.now(),
      sender: 'ai',
      text: t('ragChat.greeting'),
    }]);

    return () => {
      isMountedRef.current = false;
    };
  }, [t]);

  // Preserve scroll position when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      // Restore previous scroll position
      chatContainerRef.current.scrollTop = scrollPositionRef.current;
    }
  }, [messages]);

  const saveScrollPosition = () => {
    if (chatContainerRef.current) {
      scrollPositionRef.current = chatContainerRef.current.scrollTop;
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Save current scroll position before adding new message
    saveScrollPosition();

    const userQuery = input.trim();
    const userMessage = { id: Date.now(), sender: 'user', text: userQuery };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Format conversation history untuk backend (role: 'user'|'assistant', content: string)
      const conversationHistory = messages
        .filter(m => m.text !== messages[0].text) // Exclude welcome message
        .slice(-5) // Keep last 5 exchanges
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        }));

      const result = await ragApi.ragChat(userQuery, conversationHistory);
      
      // Only update state if component is still mounted
      if (!isMountedRef.current) return;
      
      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: result.answer,
        sources: result.sources
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      // Only update state if component is still mounted
      if (!isMountedRef.current) return;
      
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: `❌ Maaf, terjadi kesalahan: ${error.message}\n\nPastikan backend server sudah running.`
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl overflow-hidden notranslate" translate="no">
      {/* Enhanced Header with Bold Gradient */}
      <div className="px-6 py-5 bg-gradient-to-r from-primary-600 to-accent-500 text-white flex-shrink-0">
        <h3 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <MessageCircle className="w-8 h-8" />
          {t('ragChat.title')}
        </h3>
        <p className="text-sm text-white/90">
          💡 {t('ragChat.description')}
        </p>
      </div>

      {/* Chat Messages Area */}
      <div 
        ref={chatContainerRef}
        onScroll={saveScrollPosition}
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white"
        style={{ overflowAnchor: 'none' }}
      >
        {messages.length === 1 && messages[0].sender === 'ai' && (
          <div className="text-center py-12">
            <div className="mb-4 animate-bounce flex justify-center">
              <Logo location="chat" size="xl" className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              {t('ragChat.welcomeTitle')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('ragChat.welcomeDesc')}
            </p>
            <div className="max-w-md mx-auto space-y-3 text-left">
              <div className="bg-white p-4 rounded-xl border-2 border-primary-200 shadow-sm">
                <div className="font-bold text-primary-700 mb-2">📚 {t('ragChat.exampleQuestions')}</div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-accent-500 flex-shrink-0">•</span>
                    <span>{t('ragChat.examples.ex1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-500 flex-shrink-0">•</span>
                    <span>{t('ragChat.examples.ex2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-500 flex-shrink-0">•</span>
                    <span>{t('ragChat.examples.ex3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-500 flex-shrink-0">•</span>
                    <span>{t('ragChat.examples.ex4')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-500 flex-shrink-0">•</span>
                    <span>{t('ragChat.examples.ex5')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
            {msg.sender === 'ai' && (
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
                className="prose prose-base max-w-none prose-headings:text-primary-800 prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-6 prose-h2:mb-4 prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-4 prose-h3:mb-3 prose-strong:text-primary-700 prose-strong:font-bold prose-em:text-accent-700 prose-blockquote:bg-amber-50 prose-blockquote:border-l-4 prose-blockquote:border-amber-400 prose-blockquote:py-3 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:italic prose-blockquote:text-gray-800 prose-blockquote:not-italic prose-ul:list-disc prose-ul:ml-6 prose-ol:list-decimal prose-ol:ml-6 prose-li:my-1 prose-p:my-3 prose-p:leading-relaxed prose-hr:my-6 prose-hr:border-gray-300 markdown-content"
                dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }}
              />
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <details className="cursor-pointer group">
                    <summary className="text-sm font-semibold text-primary-700 hover:text-accent-600 transition-colors select-none">
                      📚 {t('ragChat.viewSources')} ({msg.sources.length} {t('ragChat.manuscripts')})
                    </summary>
                    <div className="mt-3 space-y-2">
                      {msg.sources.map((source, idx) => (
                        source.url ? (
                          <a
                            key={idx}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-accent-50 p-3 rounded-lg border border-accent-200 hover:bg-accent-100 hover:border-accent-300 transition-all cursor-pointer group/card"
                            title="Klik untuk melihat sumber asli di Sastra.org"
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex items-center gap-1.5">
                                <strong className="text-sm text-primary-800 group-hover/card:text-accent-700 transition-colors">
                                  {source.title}
                                </strong>
                                <svg className="w-3 h-3 text-accent-400 group-hover/card:text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </div>
                              <span className="text-xs bg-accent-200 px-2 py-0.5 rounded-full text-accent-800">
                                {(source.score * 100).toFixed(0)}%
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">{source.author}</p>
                          </a>
                        ) : (
                          <div key={idx} className="bg-accent-50 p-3 rounded-lg border border-accent-200">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <strong className="text-sm text-primary-800">{source.title}</strong>
                              <span className="text-xs bg-accent-200 px-2 py-0.5 rounded-full text-accent-800">
                                {(source.score * 100).toFixed(0)}%
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">{source.author}</p>
                          </div>
                        )
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
          <div className="flex justify-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold mr-3 shadow-md">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div className="bg-white border-2 border-primary-200 rounded-2xl p-4 shadow-md">
              <span className="text-gray-600 text-sm">
                {t('multiChat.analyzing', { count: 'all' })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="border-t-2 border-gray-200 p-4 bg-gray-50 flex-shrink-0">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('ragChat.placeholder')}
            className="flex-1 px-4 py-3 border-2 border-primary-300 rounded-xl focus:outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-200 transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-bold rounded-xl hover:from-primary-700 hover:to-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none flex items-center gap-2"
          >
            {!isLoading && <Send className="w-5 h-5" />}
            {isLoading ? 'Loading...' : t('ragChat.send')}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          💡 {t('ragChat.tips')}
        </p>
      </form>
    </div>
  );
}