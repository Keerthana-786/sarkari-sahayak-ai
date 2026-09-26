/**
 * Frontend API client to talk to express server backend
 */

export async function fetchSchemes() {
  const res = await fetch('/api/schemes');
  if (!res.ok) throw new Error('Failed to fetch schemes');
  return res.json();
}

export async function fetchPersonas() {
  const res = await fetch('/api/personas');
  if (!res.ok) throw new Error('Failed to fetch personas');
  return res.json();
}

export async function extractProfile(message, currentProfile = {}) {
  const res = await fetch('/api/extract-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, profile: currentProfile })
  });
  if (!res.ok) throw new Error('Profile extraction failed');
  return res.json();
}

export async function evaluateEligibility(profile = {}) {
  const res = await fetch('/api/evaluate-eligibility', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile })
  });
  if (!res.ok) throw new Error('Eligibility evaluation failed');
  return res.json();
}

export async function sendSpeechToText(audioBlob) {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');

  const res = await fetch('/api/stt', {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('Speech to text conversion failed');
  return res.json();
}

export async function requestTranslation(text, targetLanguage) {
  const res = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, targetLanguage })
  });
  if (!res.ok) throw new Error('Translation request failed');
  return res.json();
}

export async function requestTTS(text, targetLanguage) {
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, targetLanguage })
  });
  if (!res.ok) throw new Error('TTS request failed');
  return res.json();
}

export async function uploadDocumentVision(file, currentProfile = {}) {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('profile', JSON.stringify(currentProfile));

  const res = await fetch('/api/vision-document', {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('Document vision scan failed');
  return res.json();
}

