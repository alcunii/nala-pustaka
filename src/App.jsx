import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

// Data Mockup Naskah
const MANUSCRIPT_DATA = {
  'wulangreh': {
    id: 'wulangreh',
    title: 'Serat Wulangreh',
    author: 'Pakubuwana IV',
    description: 'Ajaran moral dan etika kepemimpinan Jawa.',
    fullText: `PUPUH I: DHANDHANGGULA

1. Pamedhare wasitaning ati, lumantarèna ing paSmon sinom, mring putrâ-sun kang anom, lanang wadon kang padha nèng kene, rasanen rèh kang kocap, mrih bisaa anganggo, ing wêkasan dadi uwong.

2. Aja nganti kabanjur ing lair, rèhning kabeh iku nora langgeng, pasthi bakal ilang kabèh, kang tinemu mung gawe bae, gawe becik lawan ala, kang ala den owal, kang becik den anggoa.

3. Wong urip iku kudu eling lan waspada, aja nganti keblinger lan kesasar, lakune kudu diawasi, supaya aja salah dalan, nuju marang kautaman, marga kang bener, mrih antuk kasampurnan.

4. Samubarang kang tinemu, aja sanalika dipercaya, dipikir dhisik kanthi tenang, dirumangsaa ing batin, sabab akeh perkara, kang nyleneh saka, kang sejatine iku.

5. Manungsa iku kudu tansah ngudi kamulyan, kanthi tatakrama kang becik, sopan santun kang lumrah, tindak tanduke kudu dijaga, supaya ketaman ing nugraha, saka Gusti Ingkang Maha Kuwaos.`
  },
  'centhini': {
    id: 'centhini',
    title: 'Serat Centhini',
    author: 'Tim Penulis Istana',
    description: 'Ensiklopedia kebudayaan Jawa yang komprehensif.',
    fullText: `SERAT CENTHINI - Perjalanan Sèh Amongraga

Kacarita ing nagari Giri, wonten santri prigel lan wicaksana, asmane Sèh Amongraga. Piyambakipun putra dalem kanjeng susuhunan ing Giri. Sareng sampun dewasa, Sèh Amongraga lumampah sowan dhateng para wali lan ulama ing tanah Jawi, kanthi maksud ngudi ngelmu tuwin kawruh.

Ing salebeting lampah, panjenenganipun tepang kaliyan santri-santri sanes, inggih punika Sèh Amongrasa lan Nyi Tembangraras. Sedaya mau lajeng nglampahi lelana sesarengan, ngudi kasampurnan ngelmu.

Sadangunipun lelana, Sèh Amongraga maringi piwulang bab macem-macem kawruh: babagan tembang lan karawitan, babagan tetanen lan pranatan alam, babagan tata upacara adat Jawi, babagan kasusastran lan filsafat, ugi babagan keprigelan lan kasantenan.

Serat punika ngandhut kathah sanget kawruh bab kabudayan Jawi ingkang sampun kadadosan ing jaman rumiyin. Dados tiyang saged sinau saking serat punika bab adat istiadat, tata upacara, panggenan-panggenan ingkang kramat, lan sapanunggalanipun.

Kabudayan Jawi ingkang kacritakaken ing Serat Centhini punika nyakup sanget wiyar, saking urusan padintenan ngantos bab kebatinan ingkang jero. Mila serat punika dipun wastani minangka ensiklopedia kabudayan Jawi.`
  },
  'kalatidha': {
    id: 'kalatidha',
    title: 'Serat Kalatidha',
    author: 'Ranggawarsita',
    description: 'Refleksi atas zaman yang penuh ketidakpastian.',
    fullText: `SERAT KALATIDHA - Ranggawarsita

PUPUH SINOM

Mangkya darajating praja, kawuryan wus sunyaruri, rurah pangrehing ukara, karana tanpa palupi, atilar silastuti, sujana sarjana kelu, kalulun kalatidha, tidhem tandhaning dumadi, ardayengrat dening karoban rubeda.

Ratune ratu utama, patihe patih linuwih, pra nayaka tyas raharja, panekare becik-becik, parandene tan dadi, paliyasing kalabendu, malah sangsayeng ndadra, rubeda kang ngreribedi, luwih-luwih para kawula alit.

Pedah apa aneng ngayun, sumelang ing karsa Allah, mugiya pinaringana, pra samya wilujeng sami, padhang ayuning bawana, tegese golong gilig, ginelung aeng-aeng ngumbara, temah lali ring ngaurip, eling-eling kang yekti lamun den eling.

Amenangi jaman edan, ewuh aya ing pambudi, melu edan nora tahan, yen tan melu anglakoni, boya kena kadumuk, kaliren wekasanipun, dilalah kerenane, beda lamun nora nglakoni, uger-uger kang dadi panggegepira.

Wong anom anggone kelakon, angayuh kasektene, ing wekasan samya kesed, sarehne tanpa pambiyantu, saking kadang lan mitra, temah pra anom saiki, padha kemba kasepen.`
  }
};

// Komponen Header
function Header() {
  return (
    <header className="bg-gradient-to-r from-primary-700 via-primary-600 to-accent-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-6">
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
      <div className="text-center max-w-3xl px-8">
        {/* Icon dengan gradien */}
        <div className="mb-8">
          <div className="inline-flex p-6 bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl shadow-xl">
            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
          </div>
        </div>

        {/* Heading dengan gradien text */}
        <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary-700 to-accent-600 bg-clip-text text-transparent">
          Selamat Datang di Nala Pustaka
        </h2>
        
        {/* Description */}
        <p className="text-lg text-gray-700 mb-10 leading-relaxed">
          Jelajahi naskah kuno Jawa dengan bantuan AI. Gunakan <strong className="text-primary-700">RAG (Retrieval-Augmented Generation)</strong> untuk memahami warisan budaya Nusantara.
        </p>

        {/* Features dengan background gradient */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-primary-200 hover:border-accent-400 hover:shadow-xl transition-all">
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

          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-primary-200 hover:border-accent-400 hover:shadow-xl transition-all">
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
        <div className="bg-gradient-to-r from-primary-600 to-accent-500 rounded-2xl p-6 shadow-xl">
          <p className="text-white font-semibold text-lg">
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
  const apiKey = 'AIzaSyDXBrD8jTS4zfekoaaQ5c44sJvmAsqgm_w';

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
    const combinedUserQuery = `
KONTEKS NASKAH (${manuscriptData.title}):
"""
${manuscriptData.fullText}
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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
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
      <div className="px-6 py-4 bg-gradient-to-r from-primary-100 to-accent-100 border-b-2 border-primary-300">
        <h3 className="text-xl font-bold text-primary-900 flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          Chat dengan AI
        </h3>
        <p className="text-sm text-primary-700">Tentang {manuscript.title}</p>
      </div>

      {/* Messages Container - Colorful */}
      <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-amber-50 to-orange-50 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-5 py-4 shadow-md ${
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
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
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
      <div className="border-t-2 border-primary-300 p-5 bg-gradient-to-r from-primary-50 to-accent-50">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanyakan sesuatu tentang naskah ini..."
            className="flex-1 px-5 py-3 rounded-xl border-2 border-primary-300 focus:outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-200 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="px-8 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-accent-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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

  // Data Knowledge Graph berdasarkan naskah
  const getKnowledgeGraphData = (manuscriptId) => {
    const graphData = {
      'wulangreh': {
        nodes: [
          { id: 'wulangreh', label: 'Serat Wulangreh', type: 'Karya' },
          { id: 'pb4', label: 'Pakubuwana IV', type: 'Tokoh' },
          { id: 'ajaran_moral', label: 'Ajaran Moral', type: 'Konsep' },
          { id: 'kepemimpinan', label: 'Kepemimpinan', type: 'Konsep' },
          { id: 'dhandhanggula', label: 'Pupuh Dhandhanggula', type: 'Struktur' },
          { id: 'etika', label: 'Etika', type: 'Konsep' },
          { id: 'kebijaksanaan', label: 'Kebijaksanaan', type: 'Konsep' }
        ],
        links: [
          { source: 'pb4', target: 'wulangreh', label: 'Pengarang' },
          { source: 'wulangreh', target: 'ajaran_moral', label: 'Berisi' },
          { source: 'wulangreh', target: 'kepemimpinan', label: 'Membahas' },
          { source: 'wulangreh', target: 'dhandhanggula', label: 'Dimulai dengan' },
          { source: 'ajaran_moral', target: 'etika', label: 'Terkait' },
          { source: 'kepemimpinan', target: 'kebijaksanaan', label: 'Memerlukan' }
        ]
      },
      'centhini': {
        nodes: [
          { id: 'centhini', label: 'Serat Centhini', type: 'Karya' },
          { id: 'tim_penulis', label: 'Tim Penulis Istana', type: 'Tokoh' },
          { id: 'amongraga', label: 'Sèh Amongraga', type: 'Tokoh' },
          { id: 'kabudayan', label: 'Kebudayaan Jawa', type: 'Konsep' },
          { id: 'lelana', label: 'Perjalanan', type: 'Konsep' },
          { id: 'ngelmu', label: 'Ilmu Pengetahuan', type: 'Konsep' }
        ],
        links: [
          { source: 'tim_penulis', target: 'centhini', label: 'Penulis' },
          { source: 'centhini', target: 'amongraga', label: 'Tokoh Utama' },
          { source: 'centhini', target: 'kabudayan', label: 'Ensiklopedia' },
          { source: 'amongraga', target: 'lelana', label: 'Menjalani' },
          { source: 'lelana', target: 'ngelmu', label: 'Mencari' }
        ]
      },
      'kalatidha': {
        nodes: [
          { id: 'kalatidha', label: 'Serat Kalatidha', type: 'Karya' },
          { id: 'ranggawarsita', label: 'Ranggawarsita', type: 'Tokoh' },
          { id: 'jaman_edan', label: 'Jaman Edan', type: 'Konsep' },
          { id: 'kalabendu', label: 'Kalabendu', type: 'Konsep' },
          { id: 'refleksi', label: 'Refleksi', type: 'Konsep' },
          { id: 'sinom', label: 'Pupuh Sinom', type: 'Struktur' }
        ],
        links: [
          { source: 'ranggawarsita', target: 'kalatidha', label: 'Pengarang' },
          { source: 'kalatidha', target: 'jaman_edan', label: 'Membahas' },
          { source: 'kalatidha', target: 'refleksi', label: 'Berisi' },
          { source: 'jaman_edan', target: 'kalabendu', label: 'Akibat' },
          { source: 'kalatidha', target: 'sinom', label: 'Menggunakan' }
        ]
      }
    };

    return graphData[manuscriptId] || graphData['wulangreh'];
  };

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous graph

    const kgData = getKnowledgeGraphData(manuscript.id);
    
    // Setup dimensions
    const containerWidth = svgRef.current?.parentElement?.clientWidth || 800;
    const width = containerWidth;
    const height = 600;
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
      <div className="px-6 py-4 bg-gradient-to-r from-primary-100 to-accent-100 border-b-2 border-primary-300">
        <h3 className="text-xl font-bold text-primary-900 flex items-center gap-2">
          <span className="text-2xl">🔮</span>
          Knowledge Graph
        </h3>
        <p className="text-sm text-primary-700">Visualisasi {manuscript.title}</p>
      </div>

      {/* Graph Container - Golden */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="bg-white rounded-2xl shadow-xl h-full flex flex-col border-2 border-primary-300">
          {/* Legend - Golden */}
          <div className="p-5 border-b-2 border-primary-200 bg-gradient-to-r from-primary-50 to-accent-50 flex gap-6 flex-wrap">
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
            <p className="text-sm text-gray-700 font-medium">
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
function LeftPanel({ selectedManuscript, onSelectManuscript }) {
  return (
    <div className="bg-gradient-to-b from-primary-50 to-white p-6 overflow-y-auto border-r-2 border-primary-300">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-primary-800 mb-2">Daftar Naskah</h2>
        <div className="h-1 w-16 bg-gradient-to-r from-accent-500 to-primary-600 rounded-full"></div>
      </div>
      
      <div>
        {Object.values(MANUSCRIPT_DATA).map((manuscript) => (
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

// Komponen Right Panel - Modern Golden Theme
function RightPanel({ selectedManuscript, viewMode, setViewMode }) {
  return (
    <div className="bg-white flex flex-col h-full">
      {selectedManuscript && (
        <div className="bg-gradient-to-r from-primary-100 via-accent-50 to-primary-100 px-6 py-5 border-b-2 border-primary-300 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-primary-900">{selectedManuscript.title}</h2>
            <p className="text-sm text-primary-700 font-medium">{selectedManuscript.author}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setViewMode('chat')}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                viewMode === 'chat'
                  ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 border-2 border-primary-300 hover:border-accent-400 hover:shadow-md'
              }`}
            >
              💬 Chat
            </button>
            <button
              onClick={() => setViewMode('kg')}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                viewMode === 'kg'
                  ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-lg scale-105'
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

  const handleSelectManuscript = (manuscript) => {
    setSelectedManuscript(manuscript);
    setViewMode('chat');
  };

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel - Manuscript List */}
        <div className="w-full lg:w-1/3 h-64 lg:h-auto">
          <LeftPanel
            selectedManuscript={selectedManuscript}
            onSelectManuscript={handleSelectManuscript}
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
