import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { marked } from 'marked';
import { MANUSCRIPT_DATA, KNOWLEDGE_GRAPH_DATA } from './data/manuscripts';
import { manuscriptService } from './lib/supabase';

// Configure marked for better Markdown rendering
marked.setOptions({
  breaks: true,  // Support line breaks
  gfm: true,     // GitHub Flavored Markdown
});

// Data naskah sekarang di-fetch dari Supabase (database)
// Gunakan admin panel di /admin untuk menambah naskah baru
// Fallback ke data hardcoded jika Supabase gagal

// Komponen Header
function Header() {
  return (
    <header className="bg-gradient-to-r from-primary-700 via-primary-600 to-accent-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nala Pustaka</h1>
            <p className="text-primary-100">AI untuk Digitalisasi Naskah Kuno Jawa</p>
          </div>
        </div>
      </div>
    </header>
  );
}

// Komponen Manuscript Card - Modern Golden Style
function ManuscriptCard({ manuscript, isSelected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`p-4 mb-3 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
        isSelected
          ? 'bg-gradient-to-br from-primary-100 to-accent-100 border-accent-500 shadow-lg scale-[1.02]'
          : 'bg-white border-primary-200 hover:border-primary-400 hover:shadow-md hover:scale-[1.01]'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-1 h-16 rounded-full ${isSelected ? 'bg-gradient-to-b from-accent-500 to-primary-600' : 'bg-primary-300'}`}></div>
        <div className="flex-1">
          <h3 className={`font-bold text-lg mb-1 ${isSelected ? 'text-primary-800' : 'text-gray-900'}`}>
            {manuscript.title}
          </h3>
          <p className="text-sm text-primary-600 font-medium mb-2">{manuscript.author}</p>
          <p className="text-xs text-gray-600 line-clamp-2">{manuscript.description}</p>
        </div>
      </div>
    </div>
  );
}

// Komponen Welcome Screen - Modern Golden Theme
function WelcomeScreen() {
  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary-50 via-amber-50 to-accent-50">
      <div className="text-center max-w-3xl px-6 sm:px-8 py-8">
        {/* Icon dengan gradien */}
        <div className="mb-8">
          <div className="inline-flex p-6 bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl shadow-xl">
            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
          </div>
        </div>

        {/* Heading dengan gradien text */}
        <h2 className="text-3xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-700 to-accent-600 bg-clip-text text-transparent">
          Selamat Datang di Nala Pustaka
        </h2>
        
        {/* Description */}
        <p className="text-base sm:text-lg text-gray-700 mb-10 leading-relaxed">
          Jelajahi naskah kuno Jawa dengan bantuan AI. Gunakan <strong className="text-primary-700">RAG (Retrieval-Augmented Generation)</strong> untuk memahami warisan budaya Nusantara.
        </p>

        {/* Features dengan background gradient */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-8 text-left">
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg border-2 border-primary-200 hover:border-accent-400 hover:shadow-xl transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-bold text-xl text-gray-900">Chat AI</h3>
            </div>
            <p className="text-sm text-gray-600 text-left">
              Ajukan pertanyaan tentang isi, makna, dan konteks naskah. AI menjawab berdasarkan sumber asli.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg border-2 border-primary-200 hover:border-accent-400 hover:shadow-xl transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-primary-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="font-bold text-xl text-gray-900">Knowledge Graph</h3>
            </div>
            <p className="text-sm text-gray-600 text-left">
              Visualisasi interaktif hubungan tokoh, konsep, dan tema dalam naskah.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-primary-600 to-accent-500 rounded-2xl p-5 sm:p-6 shadow-xl">
          <p className="text-white font-semibold text-base sm:text-lg">
            👈 Pilih naskah di sebelah kiri untuk mulai menjelajah
          </p>
        </div>
      </div>
    </div>
  );
}

// Komponen Chat Panel dengan RAG menggunakan Gemini API
function ChatPanel({ manuscript }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // TODO: Isi dengan API Key Anda dari https://aistudio.google.com/app/apikey
  // JANGAN commit API key ke GitHub! Gunakan environment variable
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

  // Auto-scroll ke bawah saat ada pesan baru
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Pesan sambutan pertama kali
  useEffect(() => {
    const welcomeMessage = {
      id: Date.now(),
      sender: 'ai',
      text: `Salam. Saya Pustakawan AI Nala Pustaka. Silakan ajukan pertanyaan Anda tentang ${manuscript.title}.`
    };
    setMessages([welcomeMessage]);
  }, [manuscript.id]);

  // Fungsi RAG: Memanggil Gemini API dengan grounded context
  const getGroundedAiResponse = async (userQuery, manuscriptData) => {
    if (!apiKey) {
      throw new Error('API Key belum diisi. Silakan isi apiKey di komponen ChatPanel.');
    }

    // System Instruction untuk grounded AI
    const systemPrompt = `Anda adalah "Nala Pustaka", Pustakawan AI ahli filologi yang berfokus pada naskah kuno Jawa. Anda sopan, akurat, dan grounded pada data.
Tugas Anda adalah menjawab pertanyaan pengguna HANYA berdasarkan konteks naskah yang disediakan.
JANGAN PERNAH berhalusinasi atau mengarang informasi di luar konteks.
Jika jawaban tidak ada dalam konteks, katakan dengan sopan bahwa informasi tersebut tidak ditemukan dalam naskah ini.
Semua jawaban harus dalam Bahasa Indonesia.
Anda HARUS memberi sitasi (menyebutkan bagian) dari mana Anda mengambil jawaban jika memungkinkan.`;

    // Konstruksi query dengan konteks (RAG)
    // Support both fullText (hardcoded) and full_text (from database)
    const manuscriptText = manuscriptData.full_text || manuscriptData.fullText || '';
    
    const combinedUserQuery = `
KONTEKS NASKAH (${manuscriptData.title}):
"""
${manuscriptText}
"""

PERTANYAAN PENGGUNA:
"""
${userQuery}
"""

INSTRUKSI: Jawab pertanyaan pengguna HANYA berdasarkan KONTEKS NASKAH di atas.`;

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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-thinking-exp-1219:generateContent?key=${apiKey}`,
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

  // Fungsi untuk mengirim pesan dengan RAG
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
      // Panggil Gemini API dengan RAG
      const aiText = await getGroundedAiResponse(userQuery, manuscript);
      
      // Tambahkan respons AI
      const aiMessage = {
        id: Date.now(),
        sender: 'ai',
        text: aiText
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      
      // Tambahkan pesan error
      const errorMessage = {
        id: Date.now(),
        sender: 'ai',
        text: `Maaf, terjadi kesalahan: ${error.message}\n\n${
          !apiKey 
            ? '⚠️ Silakan isi API Key Gemini terlebih dahulu di file App.jsx (komponen ChatPanel).\nDapatkan API Key gratis di: https://aistudio.google.com/app/apikey'
            : 'Silakan coba lagi dalam beberapa saat.'
        }`
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header Chat - Golden Theme */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-primary-100 to-accent-100 border-b-2 border-primary-300">
        <h3 className="text-lg sm:text-xl font-bold text-primary-900 flex items-center gap-2">
          <span className="text-xl sm:text-2xl">🤖</span>
          Chat dengan AI
        </h3>
        <p className="text-sm text-primary-700">Tentang {manuscript.title}</p>
      </div>

      {/* Messages Container - Colorful */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-br from-amber-50 to-orange-50 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-full sm:max-w-[70%] rounded-2xl px-4 sm:px-5 py-3 sm:py-4 shadow-md ${
                message.sender === 'user'
                  ? 'bg-gradient-to-br from-primary-600 to-accent-500 text-white'
                  : 'bg-white border-2 border-primary-200 text-gray-900'
              }`}
            >
              {message.sender === 'ai' && (
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-primary-200">
                  <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">AI</span>
                  </div>
                  <span className="font-semibold text-sm text-primary-700">Assistant</span>
                </div>
              )}
              
              {/* Render Markdown untuk AI, plain text untuk user */}
              {message.sender === 'ai' ? (
                <div 
                  className="prose prose-sm max-w-none
                    prose-headings:text-primary-900 prose-headings:font-bold
                    prose-p:text-gray-800 prose-p:leading-relaxed prose-p:my-2
                    prose-strong:text-primary-800 prose-strong:font-bold
                    prose-em:text-primary-700 prose-em:italic
                    prose-ul:list-disc prose-ul:pl-5 prose-ul:my-2 prose-ul:space-y-1
                    prose-ol:list-decimal prose-ol:pl-5 prose-ol:my-2 prose-ol:space-y-1
                    prose-li:text-gray-800 prose-li:leading-relaxed
                    prose-code:bg-primary-100 prose-code:text-primary-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                    prose-pre:bg-primary-50 prose-pre:border-2 prose-pre:border-primary-300 prose-pre:rounded-lg prose-pre:p-3
                    prose-blockquote:border-l-4 prose-blockquote:border-accent-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-700
                    prose-a:text-accent-600 prose-a:underline prose-a:font-medium
                  "
                  dangerouslySetInnerHTML={{ __html: marked(message.text) }}
                />
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
              )}
            </div>
          </div>
        ))}
        
        {/* Loading indicator - Golden */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border-2 border-primary-300 rounded-2xl px-5 py-4 shadow-md">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2.5 h-2.5 bg-primary-600 rounded-full animate-bounce"></div>
                  <div className="w-2.5 h-2.5 bg-accent-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2.5 h-2.5 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form - Golden Theme */}
      <div className="border-t-2 border-primary-300 p-4 sm:p-5 bg-gradient-to-r from-primary-50 to-accent-50">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanyakan sesuatu tentang naskah ini..."
            className="flex-1 px-4 sm:px-5 py-3 rounded-xl border-2 border-primary-300 focus:outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-200 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-accent-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? '⏳' : '📤'} {isLoading ? 'Mengirim...' : 'Kirim'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Komponen Knowledge Graph Panel dengan D3.js
function KnowledgeGraphPanel({ manuscript }) {
  const svgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Data Knowledge Graph diambil dari manuscript object atau fallback ke hardcoded
  const getKnowledgeGraphData = (manuscriptObj) => {
    // Priority: database > hardcoded
    if (manuscriptObj.knowledge_graph && manuscriptObj.knowledge_graph.nodes) {
      return manuscriptObj.knowledge_graph;
    }
    
    // Fallback ke hardcoded data
    return KNOWLEDGE_GRAPH_DATA[manuscriptObj.id] || KNOWLEDGE_GRAPH_DATA['wulangreh'];
  };

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous graph

    const kgData = getKnowledgeGraphData(manuscript);

    // Setup dimensions
    const containerWidth = svgRef.current?.parentElement?.clientWidth || 800;
    const isSmallScreen = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
    const width = containerWidth;
    const height = isSmallScreen ? 420 : 600;
    setDimensions({ width, height });

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
        .id(d => d.id)
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

    // Create link labels - Golden
    const linkLabel = g.append('g')
      .selectAll('text')
      .data(kgData.links)
      .enter().append('text')
      .attr('font-size', 11)
      .attr('font-weight', '600')
      .attr('fill', '#6B5744')
      .attr('text-anchor', 'middle')
      .text(d => d.label);

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
      .on('mouseover', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 28)
          .style('filter', 'drop-shadow(0 6px 12px rgba(230, 184, 0, 0.5))');
      })
      .on('mouseout', function() {
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

      linkLabel
        .attr('x', d => (d.source.x + d.target.x) / 2)
        .attr('y', d => (d.source.y + d.target.y) / 2);

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
  }, [manuscript.id]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-primary-50 to-accent-50">
      {/* Header - Golden Theme */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-primary-100 to-accent-100 border-b-2 border-primary-300">
        <h3 className="text-lg sm:text-xl font-bold text-primary-900 flex items-center gap-2">
          <span className="text-xl sm:text-2xl">🔮</span>
          Knowledge Graph
        </h3>
        <p className="text-sm text-primary-700">Visualisasi {manuscript.title}</p>
      </div>

      {/* Graph Container - Golden */}
      <div className="flex-1 overflow-hidden p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow-xl h-full flex flex-col border-2 border-primary-300">
          {/* Legend - Golden */}
          <div className="p-4 sm:p-5 border-b-2 border-primary-200 bg-gradient-to-r from-primary-50 to-accent-50 flex gap-4 sm:gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#B7966B] shadow-md"></div>
              <span className="text-sm font-semibold text-gray-700">Karya</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#E6B800] shadow-md"></div>
              <span className="text-sm font-semibold text-gray-700">Tokoh</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#6B5744] shadow-md"></div>
              <span className="text-sm font-semibold text-gray-700">Konsep</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#C9A87B] shadow-md"></div>
              <span className="text-sm font-semibold text-gray-700">Struktur</span>
            </div>
          </div>

          {/* SVG Canvas */}
          <div className="flex-1 overflow-hidden bg-gradient-to-br from-amber-50/30 to-white">
            <svg ref={svgRef} className="w-full h-full"></svg>
          </div>

          {/* Instructions - Golden */}
          <div className="p-4 border-t-2 border-primary-200 bg-gradient-to-r from-accent-50 to-primary-50">
            <p className="text-xs sm:text-sm text-gray-700 font-medium text-center sm:text-left">
              💡 <strong className="text-primary-800">Tips:</strong> Geser node • Scroll untuk zoom • Drag background untuk pan
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Komponen Left Panel (Daftar Naskah)
// Komponen Left Panel - Modern Golden Sidebar
function LeftPanel({ selectedManuscript, onSelectManuscript, manuscripts }) {
  return (
    <div className="bg-gradient-to-b from-primary-50 to-white p-6 overflow-y-auto border-r-2 border-primary-300">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-primary-800 mb-2">Daftar Naskah</h2>
        <div className="h-1 w-16 bg-gradient-to-r from-accent-500 to-primary-600 rounded-full"></div>
      </div>
      
      <div>
        {manuscripts.map((manuscript) => (
          <ManuscriptCard
            key={manuscript.id}
            manuscript={manuscript}
            isSelected={selectedManuscript?.id === manuscript.id}
            onClick={() => onSelectManuscript(manuscript)}
          />
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-gradient-to-br from-accent-50 to-primary-50 rounded-xl border-2 border-accent-200">
        <p className="text-xs text-gray-700 leading-relaxed">
          <strong className="text-primary-700">Sumber:</strong> Data naskah dari sastra.org dan berbagai sumber naskah kuno Jawa yang telah didigitalisasi.
        </p>
      </div>
    </div>
  );
}

// Komponen Mobile Selector - Horizontal scroll untuk layar kecil
function MobileManuscriptSelector({ selectedManuscript, onSelectManuscript, manuscripts }) {
  return (
    <div className="lg:hidden bg-gradient-to-br from-primary-50 via-amber-50 to-accent-50 px-4 py-5 border-b border-primary-200 shadow-inner">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-primary-600 font-semibold">Pilih Naskah</p>
          <h2 className="text-lg font-bold text-primary-900">Eksplorasi Koleksi</h2>
        </div>
      </div>
      <div
        className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {manuscripts.map((manuscript) => {
          const isActive = selectedManuscript?.id === manuscript.id;
          return (
            <button
              key={manuscript.id}
              type="button"
              onClick={() => onSelectManuscript(manuscript)}
              className={`min-w-[220px] rounded-2xl border-2 px-4 py-4 text-left transition-all duration-200 shadow-sm ${
                isActive
                  ? 'bg-gradient-to-br from-primary-500 to-accent-500 text-white border-white/40 shadow-lg scale-[1.02]'
                  : 'bg-white/90 border-primary-200 text-gray-900 hover:border-primary-400 hover:shadow-md'
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
                {manuscript.author}
              </p>
              <h3 className="text-lg font-bold leading-snug mt-1 mb-2">
                {manuscript.title}
              </h3>
              <p className={`text-xs leading-relaxed ${isActive ? 'text-white/80' : 'text-gray-600'}`}>
                {manuscript.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Komponen Right Panel - Modern Golden Theme
function RightPanel({ selectedManuscript, viewMode, setViewMode }) {
  return (
    <div className="bg-white flex flex-col h-full">
      {selectedManuscript && (
        <div className="bg-gradient-to-r from-primary-100 via-accent-50 to-primary-100 px-4 sm:px-6 py-4 sm:py-5 border-b-2 border-primary-300 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-primary-900">{selectedManuscript.title}</h2>
            <p className="text-sm text-primary-700 font-medium">{selectedManuscript.author}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => setViewMode('chat')}
              className={`px-4 py-2.5 sm:px-5 rounded-xl font-semibold transition-all duration-200 ${
                viewMode === 'chat'
                  ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-lg sm:scale-105'
                  : 'bg-white text-gray-700 border-2 border-primary-300 hover:border-accent-400 hover:shadow-md'
              }`}
            >
              💬 Chat
            </button>
            <button
              onClick={() => setViewMode('kg')}
              className={`px-4 py-2.5 sm:px-5 rounded-xl font-semibold transition-all duration-200 ${
                viewMode === 'kg'
                  ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-lg sm:scale-105'
                  : 'bg-white text-gray-700 border-2 border-primary-300 hover:border-accent-400 hover:shadow-md'
              }`}
            >
              🔮 Graph
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        {viewMode === 'welcome' && <WelcomeScreen />}
        {viewMode === 'chat' && selectedManuscript && (
          <ChatPanel manuscript={selectedManuscript} />
        )}
        {viewMode === 'kg' && selectedManuscript && (
          <KnowledgeGraphPanel manuscript={selectedManuscript} />
        )}
      </div>
    </div>
  );
}

// Komponen App Utama
function App() {
  const [selectedManuscript, setSelectedManuscript] = useState(null);
  const [viewMode, setViewMode] = useState('welcome');
  const [manuscripts, setManuscripts] = useState([]); // State untuk data dari Supabase
  const [loading, setLoading] = useState(true);

  // Fetch manuscripts dari Supabase saat component mount
  useEffect(() => {
    loadManuscripts();
  }, []);

  const loadManuscripts = async () => {
    try {
      // Coba fetch dari Supabase
      const data = await manuscriptService.getAll();
      
      if (data && data.length > 0) {
        // Jika ada data di Supabase, gunakan itu
        setManuscripts(data);
      } else {
        // Jika database kosong, gunakan hardcoded data sebagai fallback
        console.log('📚 Database kosong, menggunakan data hardcoded');
        setManuscripts(Object.values(MANUSCRIPT_DATA));
      }
    } catch (error) {
      // Jika Supabase error, fallback ke hardcoded data
      console.warn('⚠️ Gagal fetch dari Supabase, menggunakan data hardcoded:', error);
      setManuscripts(Object.values(MANUSCRIPT_DATA));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectManuscript = (manuscript) => {
    setSelectedManuscript(manuscript);
    setViewMode('chat');
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
      <Header />
      
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Mobile Selector */}
        <div className="lg:hidden">
          <MobileManuscriptSelector
            selectedManuscript={selectedManuscript}
            onSelectManuscript={handleSelectManuscript}
            manuscripts={manuscripts}
          />
        </div>
        
        {/* Left Panel - Manuscript List (Desktop) */}
        <div className="hidden lg:block w-full lg:w-1/3 h-full max-h-full">
          <LeftPanel
            selectedManuscript={selectedManuscript}
            onSelectManuscript={handleSelectManuscript}
            manuscripts={manuscripts}
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
