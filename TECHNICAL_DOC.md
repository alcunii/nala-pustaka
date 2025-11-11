# 🔧 Technical Documentation - Nala Pustaka

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Nala Pustaka                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐         ┌──────────────────────────┐    │
│  │              │         │                          │    │
│  │   Header     │         │     Main Container       │    │
│  │              │         │                          │    │
│  └──────────────┘         └──────────────────────────┘    │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                      │  │
│  │  ┌─────────────┐    ┌──────────────────────────┐  │  │
│  │  │             │    │                          │  │  │
│  │  │  Left Panel │    │     Right Panel          │  │  │
│  │  │             │    │                          │  │  │
│  │  │  Manuscript │    │  ┌────────────────────┐ │  │  │
│  │  │    List     │    │  │   Tab Buttons      │ │  │  │
│  │  │             │    │  └────────────────────┘ │  │  │
│  │  │  - Wulangreh│    │                          │  │  │
│  │  │  - Centhini │    │  ┌────────────────────┐ │  │  │
│  │  │  - Kalatidha│    │  │  Welcome Screen    │ │  │  │
│  │  │             │    │  │       OR           │ │  │  │
│  │  └─────────────┘    │  │  ChatPanel         │ │  │  │
│  │                     │  │       OR           │ │  │  │
│  │                     │  │  KnowledgeGraph    │ │  │  │
│  │                     │  └────────────────────┘ │  │  │
│  │                     │                          │  │  │
│  │                     └──────────────────────────┘  │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App
├── Header
└── Main
    ├── LeftPanel
    │   └── ManuscriptCard[]
    └── RightPanel
        ├── TabButtons (conditional)
        └── Content (conditional)
            ├── WelcomeScreen
            ├── ChatPanel
            │   ├── ChatHeader
            │   ├── MessagesContainer
            │   │   └── Message[]
            │   └── InputForm
            └── KnowledgeGraphPanel
                ├── GraphHeader
                ├── Legend
                ├── SVGCanvas
                │   ├── Links[]
                │   ├── Nodes[]
                │   └── Labels[]
                └── Instructions
```

## State Management

### App Level State
```javascript
const [selectedManuscript, setSelectedManuscript] = useState(null);
const [viewMode, setViewMode] = useState('welcome'); // 'welcome' | 'chat' | 'kg'
```

### ChatPanel State
```javascript
const [messages, setMessages] = useState([]);
const [input, setInput] = useState('');
const [isLoading, setIsLoading] = useState(false);
const messagesEndRef = useRef(null);
```

### KnowledgeGraphPanel State
```javascript
const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
const svgRef = useRef();
```

## Data Flow

### 1. Manuscript Selection Flow
```
User clicks manuscript card
    ↓
handleSelectManuscript(manuscript)
    ↓
setSelectedManuscript(manuscript)
setViewMode('chat')
    ↓
RightPanel re-renders
    ↓
ChatPanel mounted with manuscript prop
    ↓
Welcome message displayed
```

### 2. Chat Flow (RAG)
```
User types message → setInput(text)
    ↓
User submits → handleSend(e)
    ↓
Add user message to messages[]
    ↓
setIsLoading(true)
    ↓
getGroundedAiResponse(userQuery, manuscript)
    ↓
Construct RAG prompt:
  - System instruction
  - Manuscript context (fullText)
  - User query
    ↓
fetch() to Gemini API
    ↓
Parse response
    ↓
Add AI message to messages[]
    ↓
setIsLoading(false)
    ↓
Auto-scroll to bottom
```

### 3. Knowledge Graph Flow
```
User switches to Graph tab → setViewMode('kg')
    ↓
KnowledgeGraphPanel mounted
    ↓
useEffect triggered
    ↓
getKnowledgeGraphData(manuscript.id)
    ↓
Setup D3:
  - Select SVG ref
  - Clear previous
  - Create simulation
  - Setup forces
  - Render nodes & links
    ↓
User interactions:
  - Drag → update node position
  - Zoom → transform SVG
  - Hover → scale node
```

## API Integration

### Gemini API Call
```javascript
// Endpoint
const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

// Payload Structure
{
  contents: [
    { parts: [{ text: combinedUserQuery }] }
  ],
  systemInstruction: {
    parts: [{ text: systemPrompt }]
  },
  generationConfig: {
    temperature: 0.3,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 1024
  }
}

// Response Structure
{
  candidates: [
    {
      content: {
        parts: [
          { text: "AI response here..." }
        ]
      }
    }
  ]
}
```

### RAG Prompt Construction
```javascript
const systemPrompt = `
Anda adalah "Nala Pustaka", Pustakawan AI ahli filologi...
- Jawab HANYA berdasarkan konteks
- JANGAN halusinasi
- Beri sitasi
- Bahasa Indonesia
`;

const combinedUserQuery = `
KONTEKS NASKAH (${manuscript.title}):
"""
${manuscript.fullText}
"""

PERTANYAAN PENGGUNA:
"""
${userQuery}
"""

INSTRUKSI: Jawab HANYA berdasarkan KONTEKS NASKAH.
`;
```

## D3.js Implementation

### Force Simulation Setup
```javascript
const simulation = d3.forceSimulation(nodes)
  .force('link', d3.forceLink(links)
    .id(d => d.id)
    .distance(120))
  .force('charge', d3.forceManyBody()
    .strength(-300))
  .force('center', d3.forceCenter(width/2, height/2))
  .force('collision', d3.forceCollide()
    .radius(50));
```

### Drag Behavior
```javascript
const drag = d3.drag()
  .on('start', (event) => {
    simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  })
  .on('drag', (event) => {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  })
  .on('end', (event) => {
    simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  });
```

### Zoom Behavior
```javascript
const zoom = d3.zoom()
  .scaleExtent([0.5, 3])
  .on('zoom', (event) => {
    g.attr('transform', event.transform);
  });

svg.call(zoom);
```

## Data Models

### Manuscript Data Model
```typescript
interface Manuscript {
  id: string;           // 'wulangreh' | 'centhini' | 'kalatidha'
  title: string;        // "Serat Wulangreh"
  author: string;       // "Pakubuwana IV"
  description: string;  // Brief description
  fullText: string;     // Complete text content (RAG context)
}
```

### Knowledge Graph Data Model
```typescript
interface Node {
  id: string;          // Unique identifier
  label: string;       // Display name
  type: 'Karya' | 'Tokoh' | 'Konsep' | 'Struktur';
  x?: number;          // D3 computed
  y?: number;          // D3 computed
  fx?: number;         // Fixed x (drag)
  fy?: number;         // Fixed y (drag)
}

interface Link {
  source: string | Node;  // Source node id
  target: string | Node;  // Target node id
  label: string;          // Relationship label
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}
```

### Chat Message Model
```typescript
interface Message {
  id: number;                    // Date.now()
  sender: 'user' | 'ai';        // Message origin
  text: string;                  // Message content
}
```

## Styling System

### Tailwind CSS Classes

**Color Palette:**
```javascript
// Custom colors in tailwind.config.js
colors: {
  cream: {
    50: '#fefdfb',
    100: '#fdf8f0',
    200: '#faf1e0',
    300: '#f5e6cc',
  },
  stone: {
    800: '#292524',
    900: '#1c1917',
  },
  amber: {
    600: '#d97706',
    700: '#b45309',
  },
}
```

**Common Patterns:**
```css
/* Card */
.card {
  @apply p-4 rounded-lg border-2 transition-all;
}

/* Active Card */
.card-active {
  @apply bg-amber-50 border-amber-600 shadow-md;
}

/* Button Primary */
.btn-primary {
  @apply px-4 py-2 bg-amber-600 text-white rounded-lg;
  @apply hover:bg-amber-700 transition-colors;
}

/* Button Secondary */
.btn-secondary {
  @apply bg-white text-stone-700 border border-stone-300;
  @apply hover:border-amber-600;
}
```

## Performance Optimizations

### 1. React Optimizations
```javascript
// useEffect dependencies
useEffect(() => {
  // Chat: auto-scroll
}, [messages]);

useEffect(() => {
  // Chat: welcome message
}, [manuscript.id]);

useEffect(() => {
  // Graph: D3 render
  return () => simulation.stop(); // Cleanup!
}, [manuscript.id]);
```

### 2. D3 Optimizations
```javascript
// Remove previous elements before re-render
svg.selectAll('*').remove();

// Stop simulation on unmount
return () => {
  simulation.stop();
};
```

### 3. API Call Optimizations
```javascript
// Prevent multiple concurrent requests
if (isLoading) return;

// Error handling
try {
  const response = await fetch(...);
} catch (error) {
  // Display user-friendly error
} finally {
  setIsLoading(false);
}
```

## Error Handling

### 1. API Errors
```javascript
try {
  if (!apiKey) {
    throw new Error('API Key belum diisi...');
  }
  
  const response = await fetch(...);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`API Error: ${errorData.error?.message}`);
  }
  
  // Parse and validate response
  if (!result.candidates || result.candidates.length === 0) {
    throw new Error('Tidak ada respons dari AI');
  }
  
} catch (error) {
  // Add error message to chat
  setMessages(prev => [...prev, {
    id: Date.now(),
    sender: 'ai',
    text: `Maaf, terjadi kesalahan: ${error.message}`
  }]);
}
```

### 2. D3 Errors
```javascript
// Safe ref access
const svg = d3.select(svgRef.current);
if (!svgRef.current) return;

// Container width fallback
const containerWidth = svgRef.current?.parentElement?.clientWidth || 800;
```

## Testing Guidelines

### Manual Testing Checklist

**Manuscript Selection:**
- [ ] Click each manuscript card
- [ ] Verify highlight on active card
- [ ] Verify panel switch to chat
- [ ] Verify welcome message appears

**Chat Panel:**
- [ ] Send message with empty input (should be disabled)
- [ ] Send valid message
- [ ] Verify loading state
- [ ] Verify AI response
- [ ] Verify auto-scroll
- [ ] Switch manuscripts (verify reset)

**Knowledge Graph:**
- [ ] Switch to graph tab
- [ ] Verify graph renders
- [ ] Drag nodes
- [ ] Zoom in/out
- [ ] Pan canvas
- [ ] Hover nodes
- [ ] Switch manuscripts (verify update)

**Tab Switching:**
- [ ] Toggle between Chat and Graph
- [ ] Verify active button highlight
- [ ] Verify content updates

**Responsive:**
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)

## Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
```env
# .env.production
VITE_GEMINI_API_KEY=your_api_key_here
```

### Update Code for Env Vars
```javascript
// In ChatPanel component
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
```

### Security Considerations
1. **Never commit API keys** to repository
2. Use environment variables in production
3. Add `.env` to `.gitignore`
4. Consider backend proxy for API calls (advanced)
5. Implement rate limiting if needed

## Future Enhancements

### Phase 2 Features
- [ ] Vector database for advanced RAG
- [ ] Semantic search across multiple manuscripts
- [ ] Multi-language support (Jawa, English)
- [ ] Audio narration
- [ ] Export chat history
- [ ] Share conversation links

### Phase 3 Features
- [ ] User authentication
- [ ] Personal notes/annotations
- [ ] Collaborative features
- [ ] More manuscripts (10+ collection)
- [ ] Advanced graph filtering
- [ ] Timeline visualization

## Dependencies

```json
{
  "dependencies": {
    "d3": "^7.9.0",           // Graph visualization
    "react": "^19.2.0",       // UI framework
    "react-dom": "^19.2.0"    // React DOM
  },
  "devDependencies": {
    "@tailwindcss/postcss": "...",  // Tailwind PostCSS
    "autoprefixer": "...",          // CSS autoprefixer
    "tailwindcss": "^4.1.17",       // Styling
    "vite": "rolldown-vite@7.2.2"   // Build tool
  }
}
```

## File Structure

```
nala-pustaka/
├── src/
│   ├── App.jsx              # Main app (all components)
│   ├── index.css            # Tailwind imports
│   └── main.jsx             # Entry point
├── public/                  # Static assets
├── README.md                # Project overview
├── README_API.md            # API setup guide
├── USER_GUIDE.md            # End-user documentation
├── TECHNICAL_DOC.md         # This file
├── tailwind.config.js       # Tailwind config
├── postcss.config.js        # PostCSS config
├── vite.config.js           # Vite config
└── package.json             # Dependencies
```

## Contributing

### Code Style
- Use functional components
- Use hooks (useState, useEffect, useRef)
- Follow naming conventions:
  - Components: PascalCase
  - Functions: camelCase
  - Constants: UPPER_SNAKE_CASE
- Add comments for complex logic
- Keep components focused (single responsibility)

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-manuscript

# Make changes and commit
git add .
git commit -m "feat: add Serat Bharatayuddha"

# Push and create PR
git push origin feature/new-manuscript
```

### Commit Message Convention
```
feat: new feature
fix: bug fix
docs: documentation
style: formatting
refactor: code restructuring
test: adding tests
chore: maintenance
```

---

**Built with ❤️ for preserving Javanese cultural heritage**

*Last updated: November 12, 2025*
