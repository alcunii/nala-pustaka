# Changelog - Nala Pustaka

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.0] - 2025-11-12

### 🎉 Initial Release

#### Added
- **Core Application Structure**
  - React app with Vite build system
  - Tailwind CSS with custom cultural theme
  - Responsive layout (desktop & mobile)

- **Pustaka Digital (Manuscript Library)**
  - 3 classical Javanese manuscripts:
    - Serat Wulangreh (Pakubuwana IV)
    - Serat Centhini (Tim Penulis Istana)
    - Serat Kalatidha (Ranggawarsita)
  - Interactive manuscript cards
  - Active state highlighting
  - Manuscript metadata display

- **Pustakawan AI (RAG Chatbot)**
  - Google Gemini API integration
  - RAG (Retrieval-Augmented Generation) implementation
  - System prompt for grounded responses
  - Anti-hallucination measures
  - Real-time chat interface
  - Auto-scroll to latest messages
  - Loading states with animations
  - Comprehensive error handling
  - Welcome message for each manuscript
  - Citation from original text

- **Knowledge Graph Panel**
  - D3.js force-directed graph visualization
  - 3 complete graph datasets (one per manuscript)
  - Interactive features:
    - Drag & drop nodes
    - Zoom in/out
    - Pan canvas
    - Hover effects
  - Color-coded node types:
    - Karya (Amber)
    - Tokoh (Blue)
    - Konsep (Green)
    - Struktur (Purple)
  - Directed edges with labels
  - Legend for node types
  - Usage instructions

- **Enhanced Welcome Screen**
  - Professional landing page
  - Feature showcase
  - Clear call-to-action
  - Etymology explanation
  - Tech stack badges

- **Tab System**
  - Toggle between Chat and Graph modes
  - Active tab highlighting
  - Auto-reset to Chat when selecting new manuscript
  - Smooth transitions

- **Design System**
  - Cultural color palette (cream, stone, amber)
  - Consistent spacing and typography
  - Smooth animations (200ms transitions)
  - Responsive breakpoints
  - Custom Tailwind theme

- **Documentation**
  - README.md - Project overview
  - README_API.md - API setup guide
  - USER_GUIDE.md - End-user manual
  - TECHNICAL_DOC.md - Developer documentation
  - PROJECT_SUMMARY.md - Project completion summary
  - CHANGELOG.md - This file

### Technical Details

#### Dependencies Added
- `react@19.2.0` - UI framework
- `react-dom@19.2.0` - React DOM rendering
- `d3@7.9.0` - Data visualization
- `tailwindcss@4.1.17` - Utility-first CSS
- `@tailwindcss/postcss@...` - Tailwind PostCSS plugin
- `autoprefixer@10.4.22` - CSS vendor prefixing
- `vite@rolldown-vite@7.2.2` - Build tool

#### Configuration
- Tailwind config with custom colors
- PostCSS config for Tailwind processing
- Vite config with React plugin
- ESLint config for code quality

#### Code Structure
- Single-file component architecture (App.jsx)
- Functional components with hooks
- 8 main components:
  - Header
  - ManuscriptCard
  - WelcomeScreen
  - ChatPanel
  - KnowledgeGraphPanel
  - LeftPanel
  - RightPanel
  - App (main)

#### API Integration
- Google Gemini 2.0 Flash Experimental
- REST API with fetch
- Error handling and validation
- Response parsing
- Generation config:
  - temperature: 0.3
  - topP: 0.8
  - topK: 40
  - maxOutputTokens: 1024

#### D3.js Features
- Force simulation with multiple forces
- Drag behavior implementation
- Zoom & pan behavior
- SVG rendering
- Dynamic data updates
- Cleanup on unmount

### Known Issues
- API key requires manual configuration (not environment-based yet)
- Chat history not persisted across refreshes
- Graph layout may overlap on very small screens
- Tailwind PostCSS warning (cosmetic only)

### Notes
- Project completed on November 12, 2025
- Total development time: ~1 session
- Lines of code: ~790 (App.jsx)
- Documentation files: 6

---

## [Unreleased]

### Planned for v1.1.0
- [ ] Environment variable support for API key
- [ ] Chat history persistence (localStorage)
- [ ] Export chat to PDF/TXT
- [ ] Dark mode toggle
- [ ] Graph layout optimization for mobile

### Planned for v2.0.0
- [ ] Vector database integration
- [ ] Semantic search across manuscripts
- [ ] User authentication
- [ ] Personal notes & bookmarks
- [ ] More manuscripts (expand collection)
- [ ] Multi-language support (Javanese, English)
- [ ] Audio narration (TTS)

### Planned for v3.0.0
- [ ] Collaborative features
- [ ] Community translations
- [ ] Mobile app (React Native)
- [ ] Offline mode (PWA)
- [ ] Advanced analytics
- [ ] Integration with external APIs (sastra.org)

---

## Version History

| Version | Date | Highlights |
|---------|------|------------|
| 1.0.0 | 2025-11-12 | Initial release with Chat, Graph, and 3 manuscripts |

---

## Contributors

- Initial development and architecture
- RAG implementation
- D3.js visualization
- Documentation

---

## License

This project is created for educational and cultural preservation purposes.

---

*For detailed changes, see git commit history.*
