# 🇮🇳 Sarkari Sahayak AI — Multilingual Voice-First Government Benefits Navigator

> **Tagline:** *"From 1000+ schemes to YOUR schemes."*

Sarkari Sahayak AI is a full-stack web application designed for Indian citizens to naturally discover government welfare schemes using voice or text in their native language (Hindi, Tamil, English). 

The platform features a **deterministic rules engine** for 100% trustworthy eligibility checking, **legal statutory citations**, **mutual scheme conflict detection**, an **interactive document checklist with Sarvam Vision Document AI**, and **printable application draft generation**.

---

## 🌟 Key Features

1. **Multilingual Voice & Text Intake:** Powered by Sarvam AI (`sarvam-105b-conversations`, `saaras:v3`, `bulbul:v3`, `doc-ai`) with Web Audio API recording & animated waveform.
2. **Deterministic Rules Engine:** Eligibility decisions are calculated programmatically in Node.js (`server/rulesEngine.js`) rather than LLM guessing. Prominently badged as *"Verified by rules engine, not AI guesswork."*
3. **Statutory Clause Citations:** Every eligibility match quotes the exact `source_clause` from scheme regulations as a legal footnote citation.
4. **Mutual Exclusion Conflict Detection:** Automatically flags when a citizen is eligible for two conflicting schemes (e.g. state education stipend vs. state housing grant) and provides a side-by-side comparison table to let the citizen choose.
5. **Real-time Live Profile Builder:** Profile card animates attributes as they get extracted during conversation.
6. **Sarvam Vision Document AI Scanning:** Scans photos of government documents (Aadhaar, Ration Cards, Income Certificates) to auto-verify citizen parameters.
7. **Printable Application Drafts:** Generates official pre-filled application forms with citizen self-declaration. Explicitly enforces *"Review & Download — you must verify and submit yourself. NEVER auto-submits."*
8. **Offline / Demo Mode:** Seamless fallbacks ensure the app works 100% reliably even without active Sarvam API keys.

---

## 🛠️ Tech Stack & Sarvam Model Suite

- **Frontend:** React 18, Vite 5, Tailwind CSS v3, Framer Motion, Lucide Icons
- **Backend:** Node.js, Express, Multer, Node-Fetch, Dotenv
- **Sarvam AI API Suite (`https://api.sarvam.ai`):**
  - **Sarvam-105B:** `POST /v1/chat/completions` (`model: "sarvam-105b-conversations"` for fast 32K intake chat, `model: "sarvam-105b"` for 128K reasoning explanations).
  - **Saaras v3:** `POST /speech-to-text` (`model: "saaras:v3"`, `mode: "translate"`) — Converts Indic speech into English text for profile extraction.
  - **Bulbul v3:** `POST /text-to-speech` (`model: "bulbul:v3"`, `speaker: "shubh"`) — Generates natural Indic voice output from translated text.
  - **Sarvam Vision Document AI:** `POST /doc-ai/v1/job/extract` — Asynchronous schema-based document extraction for instant document verification.

---

## 🚀 Quick Start & Installation

### 1. Clone & Install Dependencies
```bash
# In the root workspace directory:
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` and insert your Sarvam AI API Key:
```env
SARVAM_API_KEY=sk_xxx_your_sarvam_api_key_here
PORT=3001
```
*(Note: If `SARVAM_API_KEY` is not provided, the application automatically operates in local fallback mode with zero crashes).*

### 3. Start Development Server
Run the concurrent dev server (starts both Express backend on port 3001 and Vite frontend on port 5173):
```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

---

## 📂 Project Structure

```
sahayank ai/
├── .env.example
├── package.json
├── vite.config.js
├── tailwind.config.js
├── DEMO_SCRIPT.md
├── README.md
├── server/
│   ├── index.js             # Express API server & routes
│   ├── rulesEngine.js       # Deterministic criteria & conflict matching engine
│   ├── sarvamService.js     # Sarvam service proxy layer
│   ├── lib/
│   │   └── sarvam.js        # Sarvam API Client (105B, Saaras v3, Bulbul v3, Doc AI)
│   ├── schemes.json         # 4 Government schemes with rules & citations
│   └── personas.json        # 3 Demo personas (Farmer, Student, Gig Worker)
└── src/
    ├── main.jsx             # React entry point
    ├── App.jsx              # Main application shell & state orchestration
    ├── index.css            # Custom CSS, glassmorphism & keyframes
    ├── i18n/
    │   └── translations.js  # English, Hindi, Tamil UI translation dictionary
    ├── components/
    │   ├── Header.jsx                # Top bar with tagline & trust badge
    │   ├── LanguagePicker.jsx        # Hindi/Tamil/English language selector
    │   ├── PersonaSelector.jsx       # 3 Demo persona quick cards
    │   ├── ChatInterface.jsx         # Conversational intake & audio visualizer
    │   ├── LiveProfileCard.jsx       # Real-time pop-in profile drawer
    │   ├── SchemeMatchCard.jsx       # Traffic-light scheme card & legal citations
    │   ├── ConflictWarningCard.jsx   # Mutual exclusion comparison table
    │   ├── MissingDocsChecklist.jsx  # Interactive document verification checklist
    │   ├── ApplicationDraftModal.jsx # Official printable application draft
    │   ├── AudioVisualizer.jsx       # Recording waveform animation
    │   └── SkeletonLoader.jsx        # Skeleton screen loading states
    └── services/
        └── api.js                    # HTTP client for backend endpoints
```

---

## 📝 Assumptions & Simplifications

1. **Deterministic Rule Engine over Pure LLM:** For high-stakes government benefits, relying solely on LLMs can produce hallucinations. We assumed rules logic must be 100% deterministic code in `server/rulesEngine.js`.
2. **Schemes Data Scope:** `server/schemes.json` includes 4 representative schemes (PM-KISAN, Ayushman Bharat, Tamil Nadu State Higher Education Grant, Kalaignar Kanavu Illam State Rural Housing Grant) with mutual conflicts defined between the state education grant and state housing grant.
3. **No Direct Government Portal API Integration:** Government portals require Aadhaar biometric OTP authentication; we hardcoded government forms into clean printable application drafts for citizen self-submission.
4. **Fallback API Handling:** Integrated intelligent local extraction and Web Speech API fallbacks to guarantee 100% demo availability even if remote Sarvam AI API rate limits or network issues occur during judging.
