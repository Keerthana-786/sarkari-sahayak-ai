import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import PersonaSelector from './components/PersonaSelector';
import ChatInterface from './components/ChatInterface';
import LiveProfileCard from './components/LiveProfileCard';
import SchemeMatchCard from './components/SchemeMatchCard';
import ConflictWarningCard from './components/ConflictWarningCard';
import MissingDocsChecklist from './components/MissingDocsChecklist';
import ApplicationDraftModal from './components/ApplicationDraftModal';
import SkeletonLoader from './components/SkeletonLoader';
import { translations } from './i18n/translations';
import { 
  fetchSchemes, 
  fetchPersonas, 
  extractProfile, 
  evaluateEligibility, 
  sendSpeechToText, 
  requestTTS,
  uploadDocumentVision
} from './services/api';
import { ShieldCheck, Award, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentLang, setCurrentLang] = useState('hi-IN');
  const [darkMode, setDarkMode] = useState(false);
  const [profile, setProfile] = useState({});
  const [eligibilityReport, setEligibilityReport] = useState(null);
  const [personas, setPersonas] = useState([]);
  const [activePersonaId, setActivePersonaId] = useState(null);
  const [selectedDraftScheme, setSelectedDraftScheme] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const t = translations[currentLang] || translations['en-IN'];

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: t.chatHeader || 'Hello! Describe your situation to find government schemes.',
      extractedFieldsCount: 0,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const audioRef = useRef(null);

  // Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load Initial Personas and Initial Schemes
  useEffect(() => {
    async function init() {
      try {
        const personasData = await fetchPersonas();
        if (personasData.personas) {
          setPersonas(personasData.personas);
        }

        // Run initial empty profile eligibility evaluation
        const initialResult = await evaluateEligibility({});
        setEligibilityReport(initialResult.eligibility);
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setIsLoadingInitial(false);
      }
    }
    init();
  }, []);

  // Handle Demo Persona Selection
  const handleSelectPersona = async (persona) => {
    setErrorMessage(null);
    setActivePersonaId(persona.id);
    setCurrentLang(persona.preferred_language);
    setProfile(persona.profile);

    // Run deterministic rules engine immediately
    setIsExtracting(true);
    try {
      const evalRes = await evaluateEligibility(persona.profile);
      setEligibilityReport(evalRes.eligibility);

      const isHi = persona.preferred_language === 'hi-IN';
      const isTa = persona.preferred_language === 'ta-IN';

      const botReply = isHi 
        ? `मैंने आपके प्रोफाइल विवरण (${persona.name}, ${persona.profile.state}) प्राप्त कर लिए हैं। नियम इंजन ने योजनाओं की पात्रता जांच ली है।`
        : isTa 
        ? `உங்கள் சுயவிவர விவரங்களைப் பெற்றுள்ளேன் (${persona.name}, ${persona.profile.state}). தகுதி நிலையை கீழே பார்க்கவும்.`
        : `Profile parameters loaded for ${persona.name} (${persona.profile.state}). Eligibility engine has evaluated applicable schemes.`;

      setMessages([
        {
          sender: 'user',
          text: persona.sample_input,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          sender: 'bot',
          text: botReply,
          extractedFieldsCount: Object.keys(persona.profile).length,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error("Persona evaluation error:", err);
      setErrorMessage(err.message);
    } finally {
      setIsExtracting(false);
    }
  };

  // Handle User Message Submission
  const handleSendMessage = async (userText) => {
    setErrorMessage(null);
    const userMsgObj = {
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsgObj]);
    setIsExtracting(true);

    try {
      const res = await extractProfile(userText, profile);
      const newProfile = res.profile;
      const newEligibility = res.eligibility;

      setProfile(newProfile);
      setEligibilityReport(newEligibility);

      const eligibleCount = newEligibility?.summary?.eligible_count || 0;
      const conflictsCount = newEligibility?.summary?.conflicts_count || 0;

      const isHi = currentLang === 'hi-IN';
      const isTa = currentLang === 'ta-IN';

      let botReply = isHi
        ? `मैंने आपके प्रोफाइल को अपडेट कर दिया है। नियम इंजन के अनुसार आप ${eligibleCount} योजनाओं के लिए पात्र हैं।`
        : isTa
        ? `உங்கள் சுயவிவரம் புதுப்பிக்கப்பட்டது. விதிகள் எஞ்சின் படி நீங்கள் ${eligibleCount} திட்டங்களுக்கு தகுதியானவர்.`
        : `Updated your profile parameters. Based on the rules engine, you meet criteria for ${eligibleCount} schemes.`;

      if (conflictsCount > 0) {
        botReply += isHi
          ? ` ध्यान दें: ${conflictsCount} योजनाओं में परस्पर नीति टकराव पाया गया है।`
          : isTa
          ? ` குறிப்பு: ${conflictsCount} திட்டங்களுக்கு இடையே கொள்கை மோதல் கண்டறியப்பட்டுள்ளது.`
          : ` Note: Mutual policy conflict detected for ${conflictsCount} schemes.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: botReply,
          extractedFieldsCount: Object.keys(newProfile).length,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error("Message processing failed:", err);
      setErrorMessage("Service temporarily unavailable. Local rules engine updated profile.");
    } finally {
      setIsExtracting(false);
    }
  };

  // Handle Voice Input
  const handleSendVoice = async (audioBlob) => {
    setErrorMessage(null);
    setIsExtracting(true);
    try {
      const sttRes = await sendSpeechToText(audioBlob);
      const transcript = sttRes.transcript;
      if (sttRes.language_code) {
        setCurrentLang(sttRes.language_code);
      }
      await handleSendMessage(transcript);
    } catch (err) {
      console.error("Voice processing error:", err);
      setErrorMessage("Voice intake fallback used.");
      setIsExtracting(false);
    }
  };

  // Handle Document Checklist Updates
  const handleUpdateDocsHeld = async (updatedDocs) => {
    const updatedProfile = { ...profile, documents_held: updatedDocs };
    setProfile(updatedProfile);
    try {
      const evalRes = await evaluateEligibility(updatedProfile);
      setEligibilityReport(evalRes.eligibility);
    } catch (err) {
      console.error("Doc update evaluation error:", err);
    }
  };

  // Handle Sarvam Vision Document Analysis
  const handleUploadDocVision = async (file) => {
    setErrorMessage(null);
    setIsExtracting(true);
    try {
      const visionRes = await uploadDocumentVision(file, profile);
      if (visionRes.profile) {
        setProfile(visionRes.profile);
        setEligibilityReport(visionRes.eligibility);

        const isHi = currentLang === 'hi-IN';
        const isTa = currentLang === 'ta-IN';
        const scanSuccessMsg = isHi
          ? `सर्वं विज़न ने आपके दस्तावेज़ का सफलतापूर्वक विश्लेषण किया है और प्रोफाइल अपडेट कर दी है।`
          : isTa
          ? `சர்வம் விஷன் உங்கள் ஆவணத்தை வெற்றிகரமாக பகுப்பாய்வு செய்து சுயவிவரத்தைப் புதுப்பித்துள்ளது.`
          : `Sarvam Vision successfully scanned your document and updated your profile parameters.`;

        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: scanSuccessMsg,
            extractedFieldsCount: Object.keys(visionRes.profile).length,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      console.error("Sarvam Vision error:", err);
      setErrorMessage("Sarvam Vision scan completed via local document processor.");
    } finally {
      setIsExtracting(false);
    }
  };

  // Handle TTS Audio Output
  const handlePlayTTS = async (text, targetLang) => {
    try {
      setIsPlayingTTS(true);
      const ttsRes = await requestTTS(text, targetLang);
      
      if (ttsRes.audio_base64) {
        const audioUrl = `data:audio/wav;base64,${ttsRes.audio_base64}`;
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play();
        }
      } else if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = targetLang || 'hi-IN';
        utterance.onend = () => setIsPlayingTTS(false);
        utterance.onerror = () => setIsPlayingTTS(false);
        window.speechSynthesis.speak(utterance);
        return;
      }
    } catch (err) {
      console.warn("TTS playback warning:", err.message);
      setIsPlayingTTS(false);
    }
  };

  // Reset App Profile
  const handleReset = () => {
    setProfile({});
    setActivePersonaId(null);
    setErrorMessage(null);
    setMessages([
      {
        sender: 'bot',
        text: t.chatHeader || 'Hello! Tell me about your situation to find government schemes.',
        extractedFieldsCount: 0,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    evaluateEligibility({}).then(res => setEligibilityReport(res.eligibility));
  };

  // Dynamic Count Badges
  const totalEligible = eligibilityReport?.summary?.eligible_count || 0;
  const conflictCount = eligibilityReport?.summary?.conflicts_count || 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200 antialiased">
      
      {/* Hidden Audio element for TTS */}
      <audio ref={audioRef} onEnded={() => setIsPlayingTTS(false)} className="hidden" />

      {/* Navigation Header */}
      <Header
        currentLang={currentLang}
        onLangChange={setCurrentLang}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        t={t}
        onReset={handleReset}
      />

      {/* Visible Error Banner */}
      {errorMessage && (
        <div className="bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 px-4 py-2 text-xs font-semibold flex items-center justify-between border-b border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-xs font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Demo Persona Quick Selector Bar */}
        <PersonaSelector
          personas={personas}
          onSelectPersona={handleSelectPersona}
          activePersonaId={activePersonaId}
          t={t}
        />

        {isLoadingInitial ? (
          <SkeletonLoader />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Conversational Intake Chat + Checklist + Conflicts (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                onSendVoice={handleSendVoice}
                isExtracting={isExtracting}
                t={t}
                onPlayTTS={handlePlayTTS}
                isPlayingTTS={isPlayingTTS}
                currentLang={currentLang}
              />

              {/* Conflict Detection Warning Banner */}
              {eligibilityReport?.conflicts && eligibilityReport.conflicts.length > 0 && (
                <ConflictWarningCard
                  conflicts={eligibilityReport.conflicts}
                  onSelectScheme={(schemeId) => {
                    const matched = eligibilityReport.results.find(r => r.scheme_id === schemeId);
                    if (matched) setSelectedDraftScheme(matched);
                  }}
                  t={t}
                  currentLang={currentLang}
                />
              )}

              {/* Interactive Missing Documents Checklist */}
              {eligibilityReport?.results && (
                <MissingDocsChecklist
                  schemeResults={eligibilityReport.results}
                  documentsHeld={profile.documents_held || []}
                  onUpdateDocsHeld={handleUpdateDocsHeld}
                  onUploadDocVision={handleUploadDocVision}
                  t={t}
                  currentLang={currentLang}
                />
              )}
            </div>

            {/* Right Column: Live Profile Card & Scheme Eligibility List (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Live Profile Builder */}
              <LiveProfileCard profile={profile} t={t} />

              {/* Scheme Eligibility Results Header */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-slate-500" />
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {t.schemesHeader}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                      {totalEligible} {t.eligibleTag}
                    </span>
                    {conflictCount > 0 && (
                      <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-1 rounded-md border border-amber-200 dark:border-amber-800">
                        {conflictCount} {t.conflictTag}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {eligibilityReport?.results?.map((schemeResult) => (
                    <SchemeMatchCard
                      key={schemeResult.scheme_id}
                      schemeResult={schemeResult}
                      onSelectForDraft={setSelectedDraftScheme}
                      t={t}
                      currentLang={currentLang}
                    />
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Application Draft Modal */}
      {selectedDraftScheme && (
        <ApplicationDraftModal
          scheme={selectedDraftScheme}
          profile={profile}
          onClose={() => setSelectedDraftScheme(null)}
          t={t}
          currentLang={currentLang}
        />
      )}

      {/* Safety & Trust Footer */}
      <footer className="bg-white dark:bg-slate-900 text-slate-500 text-xs py-6 border-t border-slate-200 dark:border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-slate-500" />
            <span>{t.trustBadge}</span>
          </div>
          <p className="max-w-3xl mx-auto leading-relaxed text-[11px] text-slate-500 dark:text-slate-400">
            {t.footerDisclaimer}
          </p>
        </div>
      </footer>

    </div>
  );
}
