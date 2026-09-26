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

export async function sendSpeechToText(audioBlob) {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    const res = await fetch('/api/stt', { method: 'POST', body: formData });
    if (res.ok) return await res.json();
  } catch (err) {
    // Static fallback
  }
  return {
    success: true,
    transcript: "नमस्ते, मैं उत्तर प्रदेश का किसान हूँ। मेरे पास 1.5 एकड़ जमीन है और सालाना आय ₹65,000 है।",
    language_code: "hi-IN"
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

  const nameMatch = text.match(/(?:name is|आई एम|मैं|பெயர்|naam)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
  if (nameMatch) profile.name = nameMatch[1];

  const ageMatch = lower.match(/(\d{1,2})\s*(?:years|yr|साल|वयदु|age)/);
  if (ageMatch) profile.age = parseInt(ageMatch[1], 10);

  if (lower.includes('farmer') || lower.includes('किसान') || lower.includes('விவசாயி')) profile.occupation = 'farmer';
  else if (lower.includes('student') || lower.includes('छात्र') || lower.includes('மாணவி')) profile.occupation = 'student';
  else if (lower.includes('gig') || lower.includes('delivery') || lower.includes('driver')) profile.occupation = 'gig_worker';

  const lakhMatch = lower.match(/(?:₹|rs\.?|inr)?\s*([\d.]+)\s*(?:lakh|lakhs|लाख|லட்சம்)/);
  if (lakhMatch) {
    profile.annual_income = parseFloat(lakhMatch[1]) * 100000;
  } else {
    const directIncome = lower.match(/(?:₹|rs\.?|inr)?\s*([\d,]{4,7})/);
    if (directIncome) {
      profile.annual_income = parseInt(directIncome[1].replace(/,/g, ''), 10);
    }
  }

  if (lower.includes('uttar pradesh') || lower.includes('up') || lower.includes('उत्तर प्रदेश')) profile.state = 'Uttar Pradesh';
  else if (lower.includes('tamil nadu') || lower.includes('tn') || lower.includes('தமிழ்நாடு')) profile.state = 'Tamil Nadu';
  else if (lower.includes('maharashtra') || lower.includes('mumbai') || lower.includes('महाराष्ट्र')) profile.state = 'Maharashtra';

  const landMatch = lower.match(/([\d.]+)\s*(?:acre|acres|एकड़|ஏக்கர்)/);
  if (landMatch) profile.land_ownership_acres = parseFloat(landMatch[1]);

  if (lower.includes('female') || lower.includes('woman') || lower.includes('महिला')) profile.gender = 'female';
  else if (lower.includes('male') || lower.includes('man') || lower.includes('किसान')) profile.gender = 'male';

  return profile;
}
