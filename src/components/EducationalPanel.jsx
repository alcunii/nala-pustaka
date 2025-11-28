import { useState, useEffect } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import {
  BookOpen,
  Lightbulb, 
  Users, 
  Star, 
  Target, 
  Sparkles, 
  GraduationCap, 
  Loader2, 
  ChevronDown, 
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Logo from './common/Logo';

// Configure marked for better rendering
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: false,
  mangle: false
});

/**
 * Educational Panel Component - Phase 1
 * Displays 4 educational cards: Summary, Wisdom, Characters, Significance
 * Plus quiz section
 */

function EducationalPanel({ manuscript }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  
  const apiUrl = import.meta.env.VITE_RAG_API_URL || 'http://localhost:3001';

  // Generate educational content
  const generateContent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${apiUrl}/api/educational/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manuscript })
      });
      
      if (!response.ok) {
        throw new Error('Gagal generate konten edukatif');
      }
      
      const data = await response.json();
      setContent(data.content);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load cached content on mount
  useEffect(() => {
    loadCachedContent();
  }, [manuscript.id]);

  const loadCachedContent = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/educational/${manuscript.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setContent(data.content);
      }
      // If 404, content not cached - user needs to click generate button
    } catch (err) {
      console.error('Failed to load cached content:', err);
    }
  };

  const toggleCard = (cardName) => {
    setExpandedCard(expandedCard === cardName ? null : cardName);
  };

  const handleQuizAnswer = (questionIndex, optionIndex) => {
    setQuizAnswers({ ...quizAnswers, [questionIndex]: optionIndex });
  };

  const submitQuiz = () => {
    setQuizSubmitted(true);
  };

  const calculateScore = () => {
    if (!content?.quiz) return 0;
    let correct = 0;
    content.quiz.forEach((q, i) => {
      if (quizAnswers[i] === q.correct) correct++;
    });
    return Math.round((correct / content.quiz.length) * 100);
  };

  // Card component with enhanced styling
  const EducationalCard = ({ icon, title, children, cardName, gradient = "from-primary-500 to-accent-500" }) => {
    const isExpanded = expandedCard === cardName;
    
    return (
      <div className="bg-white rounded-2xl shadow-lg border-2 border-primary-200 overflow-hidden hover:shadow-xl transition-all animate-fadeIn notranslate" translate="no">
        <button
          onClick={() => toggleCard(cardName)}
          className="w-full px-5 py-4 flex items-center justify-between bg-gradient-to-r from-primary-50 to-accent-50 hover:from-primary-100 hover:to-accent-100 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
              {icon}
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-primary-900">{title}</h3>
          </div>
          <ChevronDown
            className={`w-6 h-6 text-primary-600 transition-transform ${isExpanded ? 'rotate-180' : ''} group-hover:text-accent-600`}
          />
        </button>
        
        {isExpanded && (
          <div className="px-5 py-5 bg-gradient-to-b from-white to-gray-50 animate-fadeIn">
            {children}
          </div>
        )}
      </div>
    );
  };

  if (!content && !loading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 sm:p-12 text-center border-2 border-primary-200 shadow-xl">
        <div className="mb-6 animate-bounce">
          <div className="inline-flex p-5 bg-gradient-to-br from-accent-500 to-primary-600 rounded-full shadow-2xl">
            <Logo location="educational" size="lg" />
          </div>
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 flex items-center justify-center gap-2">
          <GraduationCap className="w-8 h-8 text-primary-700" />
          Mode Belajar Interaktif
        </h3>
        <p className="text-gray-600 mb-2 text-lg">
          Generate konten edukatif untuk memahami naskah ini dengan mudah!
        </p>
        <p className="text-sm text-gray-500 mb-8 flex items-center justify-center gap-3 flex-wrap">
          <span className="flex items-center gap-1"><Sparkles className="w-4 h-4" /> Ringkasan</span>
          <span className="flex items-center gap-1"><Lightbulb className="w-4 h-4" /> Kearifan Lokal</span>
          <span className="flex items-center gap-1"><Users className="w-4 h-4" /> Tokoh</span>
          <span className="flex items-center gap-1"><Star className="w-4 h-4" /> Kenapa Keren</span>
          <span className="flex items-center gap-1"><Target className="w-4 h-4" /> Quiz</span>
        </p>
        <button
          onClick={generateContent}
          className="px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl font-bold hover:from-primary-700 hover:to-accent-600 transition-all shadow-lg hover:shadow-xl text-lg flex items-center gap-2 mx-auto"
        >
          <GraduationCap className="w-6 h-6" />
          Generate Konten Edukatif
        </button>
        <p className="text-xs text-gray-500 mt-4 flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3" />
          AI akan menganalisis naskah (~10 detik)
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-12 text-center border-2 border-primary-200 shadow-lg">
        <p className="text-gray-800 font-bold text-xl mb-2 flex items-center justify-center gap-2">
          <GraduationCap className="w-6 h-6" />
          AI Sedang Bekerja...
        </p>
        <p className="text-gray-600 mb-4">Generating konten edukatif untuk Anda</p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-accent-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Biasanya memakan waktu ~10 detik
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
        <p className="text-red-800 font-semibold mb-2">Error</p>
        <p className="text-red-600">{error}</p>
        <button
          onClick={generateContent}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 mx-auto"
        >
          <Loader2 className="w-4 h-4" />
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 notranslate" translate="no">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-500 rounded-2xl px-6 py-5 text-white shadow-lg notranslate" translate="no">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">
              Mode Belajar Interaktif
            </h2>
            <p className="text-sm text-white/90 mb-2">
              {manuscript.title} • {manuscript.author}
            </p>
            <p className="text-xs text-white/80 flex items-center gap-1">
              <Lightbulb className="w-3 h-3" />
              Konten edukatif khusus untuk memudahkan pemahaman naskah kuno Jawa
            </p>
          </div>
        </div>
      </div>

      {/* 4 Educational Cards with Different Gradients */}
      <div className="flex flex-col gap-6">
        {/* Card 1: Ringkasan */}
        <EducationalCard icon={<BookOpen className="w-7 h-7" />} title="Ringkasan Mudah" cardName="summary" gradient="from-blue-500 to-cyan-500">
          <div 
            className="prose prose-base max-w-none
              prose-headings:text-primary-900 prose-headings:font-bold
              prose-h1:text-3xl prose-h1:mb-4 prose-h1:mt-6
              prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b-2 prose-h2:border-blue-200 prose-h2:pb-2
              prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-blue-800
              prose-h4:text-lg prose-h4:font-semibold prose-h4:mt-4 prose-h4:mb-2
              prose-p:text-gray-800 prose-p:leading-relaxed prose-p:my-4 prose-p:text-base
              prose-strong:text-primary-900 prose-strong:font-bold
              prose-em:text-blue-700 prose-em:italic
              prose-ul:list-disc prose-ul:ml-6 prose-ul:my-4 prose-ul:space-y-2
              prose-ol:list-decimal prose-ol:ml-6 prose-ol:my-4 prose-ol:space-y-2
              prose-li:text-gray-800 prose-li:leading-relaxed
              prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-700 prose-blockquote:bg-blue-50 prose-blockquote:py-3 prose-blockquote:my-4 prose-blockquote:rounded-r
              prose-code:bg-blue-100 prose-code:text-blue-900 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
              markdown-content
            "
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(content.summary || '')) }}
          />
        </EducationalCard>

        {/* Card 2: Kearifan Lokal */}
        <EducationalCard icon={<Lightbulb className="w-7 h-7" />} title="Kearifan Lokal (Relate with You)" cardName="wisdom" gradient="from-amber-500 to-orange-500">
          <div className="space-y-4">
            {content.wisdom && content.wisdom.length > 0 ? (
              content.wisdom.map((item, index) => (
                <div key={`wisdom-${index}-${item.nilai}`} className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border-l-4 border-amber-500 shadow-sm hover:shadow-md transition-shadow notranslate" translate="no">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-md">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-primary-900 text-lg mb-2">{item.nilai}</h4>
                      {item.quote && (
                        <blockquote className="text-sm italic text-gray-700 mb-3 pl-4 border-l-2 border-amber-400 bg-amber-100/50 py-2 rounded-r">
                          "{item.quote}"
                        </blockquote>
                      )}
                      <div
                        className="prose prose-sm max-w-none
                          prose-p:text-gray-800 prose-p:leading-relaxed prose-p:my-2
                          prose-strong:text-amber-900 prose-strong:font-bold
                          prose-em:text-amber-700 prose-em:italic
                          prose-ul:list-disc prose-ul:ml-5 prose-ul:my-2
                          prose-li:text-gray-800
                        "
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(item.relevansi || '')) }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 italic text-center py-4">Tidak ada kearifan lokal spesifik dalam naskah ini.</p>
            )}
          </div>
        </EducationalCard>

        {/* Card 3: Tokoh & Cerita */}
        <EducationalCard icon={<Users className="w-7 h-7" />} title="Tokoh & Cerita (Character Check)" cardName="characters" gradient="from-purple-500 to-pink-500">
          <div className="space-y-4">
            {content.characters && content.characters.length > 0 ? (
              content.characters.map((char, index) => (
                <div key={`char-${index}-${char.nama}`} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow notranslate" translate="no">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-md">
                      {char.nama.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-primary-900 text-lg mb-1">{char.nama}</h4>
                      <p className="text-xs text-purple-600 font-bold mb-3 uppercase tracking-wider bg-purple-100 inline-block px-2 py-1 rounded">{char.peran}</p>
                      <div
                        className="prose prose-sm max-w-none
                          prose-p:text-gray-800 prose-p:leading-relaxed prose-p:my-2
                          prose-strong:text-purple-900 prose-strong:font-bold
                          prose-em:text-purple-700 prose-em:italic
                          prose-ul:list-disc prose-ul:ml-5 prose-ul:my-2
                          prose-li:text-gray-800
                          prose-blockquote:border-l-2 prose-blockquote:border-purple-400 prose-blockquote:pl-3 prose-blockquote:italic prose-blockquote:bg-purple-50
                        "
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(char.deskripsi || '')) }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 italic text-center py-4">Naskah ini bersifat filosofis tanpa tokoh naratif spesifik.</p>
            )}
          </div>
        </EducationalCard>

        {/* Card 4: Mengapa Penting */}
        <EducationalCard icon={<Star className="w-7 h-7" />} title="Kenapa Naskah Ini Keren? (Significance)" cardName="significance" gradient="from-emerald-500 to-teal-500">
          <div
            className="prose prose-base max-w-none
              prose-headings:text-primary-900 prose-headings:font-bold
              prose-h1:text-3xl prose-h1:mb-4 prose-h1:mt-6
              prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b-2 prose-h2:border-emerald-200 prose-h2:pb-2
              prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-emerald-800
              prose-h4:text-lg prose-h4:font-semibold prose-h4:mt-4 prose-h4:mb-2
              prose-p:text-gray-800 prose-p:leading-relaxed prose-p:my-4 prose-p:text-base
              prose-strong:text-primary-900 prose-strong:font-bold
              prose-em:text-emerald-700 prose-em:italic
              prose-ul:list-disc prose-ul:ml-6 prose-ul:my-4 prose-ul:space-y-2
              prose-ol:list-decimal prose-ol:ml-6 prose-ol:my-4 prose-ol:space-y-2
              prose-li:text-gray-800 prose-li:leading-relaxed
              prose-blockquote:border-l-4 prose-blockquote:border-emerald-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-700 prose-blockquote:bg-emerald-50 prose-blockquote:py-3 prose-blockquote:my-4 prose-blockquote:rounded-r
              prose-code:bg-emerald-100 prose-code:text-emerald-900 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
              markdown-content
            "
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(content.significance || '')) }}
          />
        </EducationalCard>
      </div>

      {/* Quiz Section - Enhanced */}
      {content.quiz && content.quiz.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-primary-200 overflow-hidden animate-fadeIn notranslate" translate="no">
          <div className="bg-gradient-to-r from-accent-500 to-yellow-500 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md">
                <Target className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Quiz Pemahaman</h3>
                <p className="text-xs text-white/90">Test seberapa paham kamu dengan naskah ini!</p>
              </div>
            </div>
            {!showQuiz && (
              <button
                onClick={() => setShowQuiz(true)}
                className="px-6 py-3 bg-white text-accent-600 rounded-xl hover:bg-gray-50 font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Target className="w-5 h-5" />
                Mulai Quiz
              </button>
            )}
          </div>

          {showQuiz && (
            <div className="px-5 py-5 space-y-6">
              {content.quiz.map((question, qIndex) => (
                <div key={qIndex} className="pb-6 border-b last:border-b-0 border-gray-200">
                  <p className="font-semibold text-gray-900 mb-3">
                    {qIndex + 1}. {question.question}
                  </p>
                  <div className="space-y-2">
                    {question.options.map((option, oIndex) => {
                      const isSelected = quizAnswers[qIndex] === oIndex;
                      const isCorrect = question.correct === oIndex;
                      const showResult = quizSubmitted;
                      
                      let className = "px-4 py-3 rounded-lg border-2 cursor-pointer transition-all ";
                      if (!showResult) {
                        className += isSelected
                          ? "bg-primary-100 border-primary-500"
                          : "bg-gray-50 border-gray-300 hover:border-primary-400";
                      } else {
                        if (isCorrect) {
                          className += "bg-green-100 border-green-500";
                        } else if (isSelected && !isCorrect) {
                          className += "bg-red-100 border-red-500";
                        } else {
                          className += "bg-gray-50 border-gray-300";
                        }
                      }
                      
                      return (
                        <div
                          key={oIndex}
                          onClick={() => !quizSubmitted && handleQuizAnswer(qIndex, oIndex)}
                          className={className}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={isSelected}
                              readOnly
                              className="w-4 h-4"
                            />
                            <span className="text-gray-800">{option}</span>
                            {showResult && isCorrect && <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />}
                            {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600 ml-auto" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {quizSubmitted && question.explanation && (
                    <div className="mt-3 bg-blue-50 border-l-4 border-blue-500 px-4 py-3 rounded flex gap-2">
                      <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-900">
                        <strong>Penjelasan:</strong> {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {!quizSubmitted ? (
                <button
                  onClick={submitQuiz}
                  disabled={Object.keys(quizAnswers).length !== content.quiz.length}
                  className="w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl font-bold hover:from-primary-700 hover:to-accent-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-6 h-6" />
                  Submit Jawaban
                </button>
              ) : (
                <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl px-6 py-6 text-center border-2 border-primary-300 shadow-md">
                  <div className="mb-4">
                    <div className="inline-flex p-4 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full shadow-lg mb-3">
                      {calculateScore() === 100 && <Star className="w-10 h-10 text-white" />}
                      {calculateScore() >= 60 && calculateScore() < 100 && <Target className="w-10 h-10 text-white" />}
                      {calculateScore() < 60 && <GraduationCap className="w-10 h-10 text-white" />}
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-primary-900 mb-2">
                    Skor: {calculateScore()}%
                  </p>
                  <p className="text-base text-gray-700 font-medium flex items-center justify-center gap-2">
                    {calculateScore() === 100 && <><Star className="w-5 h-5 text-yellow-500" /> Sempurna! Anda memahami naskah dengan baik!</>}
                    {calculateScore() >= 60 && calculateScore() < 100 && <><Target className="w-5 h-5 text-green-500" /> Bagus! Terus belajar!</>}
                    {calculateScore() < 60 && <><GraduationCap className="w-5 h-5 text-blue-500" /> Terus semangat! Baca lagi untuk pemahaman lebih baik.</>}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EducationalPanel;