import { useState, useEffect } from 'react';

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

  // Card component
  const EducationalCard = ({ icon, title, children, cardName }) => {
    const isExpanded = expandedCard === cardName;
    
    return (
      <div className="bg-white rounded-xl shadow-md border-2 border-primary-200 overflow-hidden hover:shadow-lg transition-all">
        <button
          onClick={() => toggleCard(cardName)}
          className="w-full px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between bg-gradient-to-r from-primary-50 to-accent-50 hover:from-primary-100 hover:to-accent-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <h3 className="text-lg font-bold text-primary-900">{title}</h3>
          </div>
          <svg
            className={`w-5 h-5 text-primary-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isExpanded && (
          <div className="px-4 sm:px-5 py-4 sm:py-5 bg-white">
            {children}
          </div>
        )}
      </div>
    );
  };

  if (!content && !loading) {
    return (
      <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-6 sm:p-8 text-center border-2 border-primary-300">
        <div className="mb-4">
          <div className="inline-flex p-4 bg-gradient-to-br from-accent-400 to-primary-500 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
          </div>
        </div>
        <h3 className="text-xl font-bold text-primary-900 mb-2">📚 Mode Belajar</h3>
        <p className="text-gray-700 mb-6">
          Generate konten edukatif untuk memahami naskah ini dengan mudah!
        </p>
        <button
          onClick={generateContent}
          className="px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-accent-600 transition-all shadow-lg"
        >
          🎓 Generate Konten Edukatif
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Generating konten edukatif...</p>
        <p className="text-sm text-gray-500 mt-2">AI sedang menganalisis naskah (~10 detik)</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 text-center">
        <p className="text-red-800 font-semibold mb-2">⚠️ Error</p>
        <p className="text-red-600">{error}</p>
        <button
          onClick={generateContent}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-500 rounded-xl px-5 py-4 text-white">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>🎓</span>
          Mode Belajar: {manuscript.title}
        </h2>
        <p className="text-sm text-white/90 mt-1">
          Konten edukatif khusus untuk memudahkan pemahaman
        </p>
      </div>

      {/* 4 Educational Cards */}
      <div className="flex flex-col gap-6">
        {/* Card 1: Ringkasan */}
        <EducationalCard icon="📖" title="Ringkasan Mudah" cardName="summary">
          <p className="text-gray-800 leading-relaxed whitespace-pre-line">{content.summary}</p>
        </EducationalCard>

        {/* Card 2: Kearifan Lokal */}
        <EducationalCard icon="💡" title="Kearifan Lokal (Relate with You)" cardName="wisdom">
          <div className="space-y-4">
            {content.wisdom && content.wisdom.length > 0 ? (
              content.wisdom.map((item, index) => (
                <div key={index} className="bg-accent-50 rounded-lg p-4 border-l-4 border-accent-500">
                  <h4 className="font-bold text-primary-900 mb-1">{item.nilai}</h4>
                  {item.quote && (
                    <p className="text-sm italic text-gray-700 mb-2">"{item.quote}"</p>
                  )}
                  <p className="text-sm text-gray-800">{item.relevansi}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-600 italic">Tidak ada kearifan lokal spesifik dalam naskah ini.</p>
            )}
          </div>
        </EducationalCard>

        {/* Card 3: Tokoh & Cerita */}
        <EducationalCard icon="🎭" title="Tokoh & Cerita (Character Check)" cardName="characters">
          <div className="space-y-3">
            {content.characters && content.characters.length > 0 ? (
              content.characters.map((char, index) => (
                <div key={index} className="bg-primary-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                      {char.nama.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-primary-900">{char.nama}</h4>
                      <p className="text-xs text-primary-600 font-semibold mb-1 uppercase tracking-wide">{char.peran}</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{char.deskripsi}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 italic">Naskah ini bersifat filosofis tanpa tokoh naratif spesifik.</p>
            )}
          </div>
        </EducationalCard>

        {/* Card 4: Mengapa Penting */}
        <EducationalCard icon="🌟" title="Kenapa Naskah Ini Keren? (Significance)" cardName="significance">
          <p className="text-gray-800 leading-relaxed whitespace-pre-line">{content.significance}</p>
        </EducationalCard>
      </div>

      {/* Quiz Section */}
      {content.quiz && content.quiz.length > 0 && (
        <div className="bg-white rounded-xl shadow-md border-2 border-primary-200 overflow-hidden">
          <div className="bg-gradient-to-r from-accent-100 to-primary-100 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <h3 className="text-lg font-bold text-primary-900">Quiz Pemahaman</h3>
            </div>
            {!showQuiz && (
              <button
                onClick={() => setShowQuiz(true)}
                className="px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 font-semibold"
              >
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
                            {showResult && isCorrect && <span className="ml-auto">✅</span>}
                            {showResult && isSelected && !isCorrect && <span className="ml-auto">❌</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {quizSubmitted && question.explanation && (
                    <div className="mt-3 bg-blue-50 border-l-4 border-blue-500 px-4 py-3 rounded">
                      <p className="text-sm text-blue-900">
                        <strong>💡 Penjelasan:</strong> {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {!quizSubmitted ? (
                <button
                  onClick={submitQuiz}
                  disabled={Object.keys(quizAnswers).length !== content.quiz.length}
                  className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-accent-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Jawaban
                </button>
              ) : (
                <div className="bg-gradient-to-r from-primary-100 to-accent-100 rounded-xl px-6 py-4 text-center border-2 border-primary-300">
                  <p className="text-2xl font-bold text-primary-900 mb-1">
                    Skor: {calculateScore()}%
                  </p>
                  <p className="text-sm text-gray-700">
                    {calculateScore() === 100 && "🎉 Sempurna! Anda memahami naskah dengan baik!"}
                    {calculateScore() >= 60 && calculateScore() < 100 && "👍 Bagus! Terus belajar!"}
                    {calculateScore() < 60 && "💪 Terus semangat! Baca lagi untuk pemahaman lebih baik."}
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