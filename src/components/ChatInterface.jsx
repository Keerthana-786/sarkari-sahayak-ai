import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, MessageSquare, Bot, User, Volume2, Loader2 } from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';

export default function ChatInterface({ 
  messages, 
  onSendMessage, 
  onSendVoice, 
  isExtracting, 
  t,
  onPlayTTS,
  isPlayingTTS,
  currentLang
}) {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isExtracting]);

  // Handle Voice Recording via Web Audio API / MediaRecorder
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await onSendVoice(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 29) {
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.warn("Microphone permission denied or unavailable:", err.message);
      // Fallback spoken sample text for demo
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        onSendMessage(t.speakingText || "I am a small farmer in UP with 1.5 acres of land.");
      }, 2500);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isExtracting) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="flex flex-col h-[520px] bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      
      {/* Chat Header */}
      <div className="px-4 py-3 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-slate-400" />
          <h2 className="font-semibold text-sm tracking-wide">
            {t.chatHeader}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPlayTTS(messages.map(m => m.text).join('. '), currentLang)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-md transition-colors border border-slate-700"
          >
            <Volume2 className={`w-3.5 h-3.5 ${isPlayingTTS ? 'animate-bounce text-slate-100' : ''}`} />
            <span>{t.listenResults}</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
        {messages.map((msg, index) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={index}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center text-xs flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[82%] rounded-xl p-3.5 text-sm leading-relaxed ${
                isUser
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-br-none'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-sm'
              }`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
                
                {msg.extractedFieldsCount > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {t.updatedProfileText}: {msg.extractedFieldsCount}
                  </div>
                )}
                
                <span className={`text-[10px] block mt-1 ${isUser ? 'text-slate-300 dark:text-slate-500 text-right' : 'text-slate-400'}`}>
                  {msg.timestamp || t.justNow}
                </span>
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isExtracting && (
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 w-max">
            <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
            <span>{t.processingText}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Recording Status Bar with Waveform Animation */}
      {isRecording && (
        <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20 flex items-center justify-between text-red-600 dark:text-red-400">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            <span>{t.speakingText} ({recordingTime}s)</span>
          </div>
          <AudioVisualizer isRecording={isRecording} />
        </div>
      )}

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className={`p-2.5 rounded-lg transition-all flex items-center justify-center ${
            isRecording
              ? 'bg-red-600 text-white animate-pulse'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
          }`}
          title={isRecording ? t.stopRecording : "Voice Intake"}
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-slate-700 dark:text-slate-300" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t.chatPlaceholder}
          className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-transparent focus:border-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isExtracting}
          className="p-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-lg font-semibold shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
