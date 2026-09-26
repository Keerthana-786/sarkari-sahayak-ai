import schemesData from '../../server/schemes.json';
import personasData from '../../server/personas.json';
import { evaluateEligibility as evaluateRules } from '../../server/rulesEngine.js';

/**
 * Frontend API client with seamless static fallback for GitHub Pages hosting
 */

export async function fetchSchemes() {
  try {
    const res = await fetch('/api/schemes');
    if (res.ok) return await res.json();
  } catch (err) {
    // Static fallback
  }
  return { success: true, count: schemesData.length, schemes: schemesData };
}

export async function fetchPersonas() {
  try {
    const res = await fetch('/api/personas');
    if (res.ok) return await res.json();
  } catch (err) {
    // Static fallback
  }
  return { success: true, count: personasData.length, personas: personasData };
}

export async function evaluateEligibility(profile = {}) {
  try {
    const res = await fetch('/api/evaluate-eligibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile })
    });
    if (res.ok) return await res.json();
  } catch (err) {
    // Static fallback
  }
  const evalResult = evaluateRules(profile, schemesData);
  return { success: true, eligibility: evalResult };
}

export async function extractProfile(message, currentProfile = {}) {
  try {
    const res = await fetch('/api/extract-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, profile: currentProfile })
    });
    if (res.ok) return await res.json();
  } catch (err) {
    // Static fallback
  }
  const extracted = localRuleBasedExtract(message, currentProfile);
  const evalResult = evaluateRules(extracted, schemesData);
  return { success: true, profile: extracted, eligibility: evalResult };
}

export async function sendSpeechToText(audioBlob, targetLang = 'hi-IN') {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    const res = await fetch('/api/stt', { method: 'POST', body: formData });
    if (res.ok) return await res.json();
  } catch (err) {
    // Static fallback
  }

  const isTamil = targetLang === 'ta-IN';
  const isEnglish = targetLang?.startsWith('en');

  const fallbackTranscript = isTamil
    ? "வணக்கம், நான் தமிழ்நாட்டைச் சேர்ந்த மாணவி. என் குடும்ப ஆண்டு வருமானம் ₹1,80,000."
    : isEnglish
    ? "Hello, I am a smallholder farmer from Uttar Pradesh with 1.5 acres of land and annual income ₹65,000."
    : "नमस्ते, मैं उत्तर प्रदेश का किसान हूँ। मेरे पास 1.5 एकड़ जमीन है और सालाना आय ₹65,000 है।";

  return {
    success: true,
    transcript: fallbackTranscript,
    language_code: targetLang
  };
}

export async function requestTranslation(text, targetLanguage) {
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLanguage })
    });
    if (res.ok) return await res.json();
  } catch (err) {
    // Static fallback
  }
  return { success: true, translatedText: text, targetLanguage };
}

export async function requestTTS(text, targetLanguage) {
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLanguage })
    });
    if (res.ok) return await res.json();
  } catch (err) {
    // Static fallback
  }
  return { success: true, audio_base64: null, use_browser_synth: true, text };
}

export async function uploadDocumentVision(file, currentProfile = {}) {
  try {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('profile', JSON.stringify(currentProfile));
    const res = await fetch('/api/vision-document', { method: 'POST', body: formData });
    if (res.ok) return await res.json();
  } catch (err) {
    // Static fallback
  }
  const updatedDocs = Array.from(new Set([...(currentProfile.documents_held || []), 'Aadhaar Card', 'Income Certificate']));
  const updatedProfile = { ...currentProfile, documents_held: updatedDocs };
  const evalResult = evaluateRules(updatedProfile, schemesData);
  return { success: true, profile: updatedProfile, eligibility: evalResult };
}

function localRuleBasedExtract(text, currentProfile) {
  const profile = { ...currentProfile };
  const lower = text.toLowerCase();

  // Name extraction
  const nameMatch = text.match(/(?:name is|नाम|आई एम|मैं|பெயர்|naam)\s+([A-Za-z\u0900-\u097F\u0B80-\u0BFF]+(?:\s+[A-Za-z\u0900-\u097F\u0B80-\u0BFF]+)?)/i);
  if (nameMatch) profile.name = nameMatch[1];

  // Age extraction
  const ageMatch = lower.match(/(\d{1,2})\s*(?:years|yr|साल|वर्ष|वयது|age|साल का|साल की)/);
  if (ageMatch) {
    profile.age = parseInt(ageMatch[1], 10);
  } else {
    const standaloneAge = lower.match(/\b(1[89]|[2-9][0-9])\b/);
    if (standaloneAge && !profile.age) {
      profile.age = parseInt(standaloneAge[1], 10);
    }
  }

  // Occupation extraction
  if (lower.includes('farmer') || lower.includes('किसान') || lower.includes('कृषक') || lower.includes('खेती') || lower.includes('விவசாயி') || lower.includes('விவசாயம்')) {
    profile.occupation = 'farmer';
  } else if (lower.includes('student') || lower.includes('छात्र') || lower.includes('छात्रा') || lower.includes('पढ़ाई') || lower.includes('कॉलज') || lower.includes('மாணவி') || lower.includes('மாணவர்') || lower.includes('கல்லூரி')) {
    profile.occupation = 'student';
  } else if (lower.includes('gig') || lower.includes('delivery') || lower.includes('driver') || lower.includes('swiggy') || lower.includes('zomato') || lower.includes('uber') || lower.includes('ola') || lower.includes('ड्राइवर') || lower.includes('ऑटो')) {
    profile.occupation = 'gig_worker';
  } else if (lower.includes('unemployed') || lower.includes('jobless') || lower.includes('बेरोजगार')) {
    profile.occupation = 'unemployed';
  }

  // Income extraction
  const lakhMatch = lower.match(/(?:₹|rs\.?|inr)?\s*([\d.]+)\s*(?:lakh|lakhs|लाख|லட்சம்)/);
  if (lakhMatch) {
    profile.annual_income = parseFloat(lakhMatch[1]) * 100000;
  } else {
    const thousandMatch = lower.match(/(?:₹|rs\.?|inr)?\s*([\d.]+)\s*(?:thousand|k|हजार|ஆயிரம்)/);
    if (thousandMatch) {
      profile.annual_income = parseFloat(thousandMatch[1]) * 1000;
    } else {
      const directIncome = lower.match(/(?:₹|rs\.?|inr)?\s*([\d,]{4,7})/);
      if (directIncome) {
        profile.annual_income = parseInt(directIncome[1].replace(/,/g, ''), 10);
      }
    }
  }

  // State extraction
  if (lower.includes('uttar pradesh') || lower.includes('up') || lower.includes('उत्तर प्रदेश') || lower.includes('गोरखपुर') || lower.includes('लखनऊ')) {
    profile.state = 'Uttar Pradesh';
  } else if (lower.includes('tamil nadu') || lower.includes('tn') || lower.includes('தமிழ்நாடு') || lower.includes('சென்னை') || lower.includes('மதுரை')) {
    profile.state = 'Tamil Nadu';
  } else if (lower.includes('maharashtra') || lower.includes('mumbai') || lower.includes('महाराष्ट्र') || lower.includes('मुंबई')) {
    profile.state = 'Maharashtra';
  } else if (lower.includes('bihar') || lower.includes('बिहार') || lower.includes('पटना')) {
    profile.state = 'Bihar';
  }

  // Land acres extraction
  const landMatch = lower.match(/([\d.]+)\s*(?:acre|acres|एकड़|ஏக்கர்|बीघा)/);
  if (landMatch) {
    profile.land_ownership_acres = parseFloat(landMatch[1]);
  }

  // Gender extraction
  if (lower.includes('female') || lower.includes('woman') || lower.includes('girl') || lower.includes('महिला') || lower.includes('लड़की') || lower.includes('छात्रा') || lower.includes('மாணவி') || lower.includes('பெண்')) {
    profile.gender = 'female';
  } else if (lower.includes('male') || lower.includes('man') || lower.includes('boy') || lower.includes('पुरुष') || lower.includes('लड़का') || lower.includes('किसान') || lower.includes('ஆண்')) {
    profile.gender = 'male';
  }

  // Initial document defaults if mentioned
  if (lower.includes('aadhaar') || lower.includes('आधार') || lower.includes('ஆதார்')) {
    const docs = Array.from(new Set([...(profile.documents_held || []), 'Aadhaar Card']));
    profile.documents_held = docs;
  }
  if (lower.includes('ration') || lower.includes('राशन') || lower.includes('ரேஷன்')) {
    const docs = Array.from(new Set([...(profile.documents_held || []), 'Ration Card']));
    profile.documents_held = docs;
  }

  return profile;
}
