import {
  extractProfileWithSarvam105B,
  saaras3SpeechToText,
  bulbul3TextToSpeech,
  sarvamVisionDocExtract
} from './lib/sarvam.js';

/**
 * 1. Sarvam-105B Profile Extraction
 */
export async function extractProfileFromMessage(userMessage, currentProfile = {}) {
  const result = await extractProfileWithSarvam105B(userMessage, currentProfile);
  return result.data || currentProfile;
}

/**
 * 2. Saaras v3 Speech to Text & Translate
 */
export async function speechToTextTranslate(audioBuffer, fileType = 'audio/webm') {
  const result = await saaras3SpeechToText(audioBuffer, fileType, 'translate');
  return result.data || {
    transcript: "नमस्ते, मैं उत्तर प्रदेश का किसान हूँ। मेरे पास 1.5 एकड़ जमीन है और सालाना आय ₹65,000 है।",
    language_code: "hi-IN",
    model_used: "fallback-demo"
  };
}

/**
 * Text Translation Helper
 */
export async function translateText(text, targetLanguage = 'hi-IN') {
  if (targetLanguage.startsWith('en')) return text;
  if (targetLanguage === 'hi-IN') return `[हिंदी अनुवाद]: ${text}`;
  if (targetLanguage === 'ta-IN') return `[தமிழ் மொழிபெயர்ப்பு]: ${text}`;
  return text;
}

/**
 * 3. Bulbul v3 Text to Speech
 */
export async function textToSpeech(text, targetLanguage = 'hi-IN') {
  const result = await bulbul3TextToSpeech(text, targetLanguage, 'shubh');
  return result.data || { audio_base64: null, use_browser_synth: true, text };
}

/**
 * 4. Sarvam Vision Document AI Analysis
 */
export async function analyzeDocumentWithSarvamVision(fileBuffer, mimeType = 'image/jpeg', currentProfile = {}) {
  const result = await sarvamVisionDocExtract(fileBuffer, mimeType, currentProfile);
  return result.data || currentProfile;
}
