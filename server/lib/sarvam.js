import fetch from 'node-fetch';
import FormData from 'form-data';

const SARVAM_BASE_URL = 'https://api.sarvam.ai';

/**
 * Helper to get configured Sarvam API Key
 */
function getApiKey() {
  const key = process.env.SARVAM_API_KEY;
  if (!key || key === 'sk_xxx_your_key_here' || key === 'your_key_here' || key.trim() === '') {
    return null;
  }
  return key.trim();
}

/**
 * Utility delay function for backoff
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Core Sarvam HTTP Request wrapper with retry & exponential backoff for rate-limits (429)
 */
async function sarvamFetch(endpoint, options = {}, maxRetries = 2) {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { ok: false, data: null, error: 'SARVAM_API_KEY is not configured' };
  }

  const url = endpoint.startsWith('http') ? endpoint : `${SARVAM_BASE_URL}${endpoint}`;
  
  const headers = {
    'api-subscription-key': apiKey,
    ...(options.headers || {})
  };

  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (response.status === 429) {
        // Rate limited — backoff retry
        attempt++;
        if (attempt <= maxRetries) {
          console.warn(`[Sarvam API] 429 Rate limited. Retrying attempt ${attempt}/${maxRetries} in ${1000 * attempt}ms...`);
          await delay(1000 * attempt);
          continue;
        }
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        return { ok: false, data: null, error: `HTTP ${response.status}: ${errorText}` };
      }

      const data = await response.json();
      return { ok: true, data, error: null };
    } catch (err) {
      attempt++;
      if (attempt <= maxRetries) {
        await delay(1000 * attempt);
        continue;
      }
      return { ok: false, data: null, error: err.message };
    }
  }

  return { ok: false, data: null, error: 'Max retries exceeded' };
}

/**
 * 1. SARVAM-105B: Conversational Chat & Profile Extraction
 * Model: "sarvam-105b-conversations" (32K context, fast intake) or "sarvam-105b" (128K context)
 */
export async function sarvam105BChat(messages, options = {}) {
  const isReasoningHeavy = options.isReasoningHeavy || false;
  const model = options.model || (isReasoningHeavy ? 'sarvam-105b' : 'sarvam-105b-conversations');

  // Trim conversation history if it exceeds 10 turns to conserve context
  const trimmedMessages = messages.length > 10 ? messages.slice(-10) : messages;

  const payload = {
    model: model,
    messages: trimmedMessages,
    temperature: options.temperature ?? 0.2,
    max_tokens: options.max_tokens || 1000,
    reasoning_effort: null // Disable thinking mode for deterministic fast execution
  };

  // Try v1 chat completions endpoint first, fallback to root endpoint
  let result = await sarvamFetch('/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!result.ok) {
    result = await sarvamFetch('/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  return result;
}

/**
 * Sarvam-105B Profile Field Extractor with automatic JSON parse retry
 */
export async function extractProfileWithSarvam105B(userMessage, currentProfile = {}) {
  const systemPrompt = `You are Sarvam Profile Extraction Engine for Indian Government Benefits.
Extract citizen profile attributes from the user input and return ONLY a valid JSON object matching this schema:
{
  "name": string or null,
  "age": number or null,
  "gender": "male" | "female" | "other" | null,
  "occupation": "farmer" | "student" | "gig_worker" | "unemployed" | "other" | null,
  "annual_income": number (in INR per year) or null,
  "state": string (e.g. "Uttar Pradesh", "Tamil Nadu", "Maharashtra") or null,
  "land_ownership_acres": number or null,
  "family_size": number or null,
  "pucca_house_owned": boolean or null,
  "government_employee": boolean or null,
  "existing_benefits": array of strings or [],
  "documents_held": array of strings or []
}
Existing Profile state to update: ${JSON.stringify(currentProfile)}
Return ONLY valid JSON matching this schema, no prose.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ];

  // Attempt 1
  let chatRes = await sarvam105BChat(messages, { model: 'sarvam-105b-conversations' });
  
  if (chatRes.ok && chatRes.data?.choices?.[0]?.message?.content) {
    try {
      const content = chatRes.data.choices[0].message.content.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(content);
      return { ok: true, data: { ...currentProfile, ...filterNulls(parsed) }, error: null };
    } catch (parseErr) {
      console.warn('[Sarvam-105B] JSON parse failed on attempt 1, retrying once...');
      
      // Retry Attempt 2 with explicit JSON reminder
      const retryMessages = [
        ...messages,
        { role: 'assistant', content: chatRes.data.choices[0].message.content },
        { role: 'user', content: 'Your previous response was not valid raw JSON. Return strictly ONLY raw valid JSON.' }
      ];

      const retryRes = await sarvam105BChat(retryMessages, { model: 'sarvam-105b-conversations' });
      if (retryRes.ok && retryRes.data?.choices?.[0]?.message?.content) {
        try {
          const retryContent = retryRes.data.choices[0].message.content.replace(/```json|```/g, '').trim();
          const parsedRetry = JSON.parse(retryContent);
          return { ok: true, data: { ...currentProfile, ...filterNulls(parsedRetry) }, error: null };
        } catch (e) {
          console.warn('[Sarvam-105B] Retry JSON parse failed.');
        }
      }
    }
  }

  // Fallback to rule-based local extraction
  const fallbackProfile = ruleBasedExtract(userMessage, currentProfile);
  return { ok: false, data: fallbackProfile, error: chatRes.error || 'JSON extraction failed, used rule fallback' };
}

/**
 * 2. SAARAS v3: Voice Input Speech-To-Text
 * POST /speech-to-text (multipart/form-data)
 */
export async function saaras3SpeechToText(audioBuffer, fileType = 'audio/webm', mode = 'translate') {
  if (!audioBuffer) {
    return { ok: false, data: null, error: 'No audio buffer provided' };
  }

  try {
    const form = new FormData();
    form.append('file', audioBuffer, { filename: 'voice_intake.webm', contentType: fileType });
    form.append('model', 'saaras:v3');
    form.append('mode', mode); // "translate" or "transcribe"

    const apiKey = getApiKey();
    if (!apiKey) {
      return { ok: false, data: getMockSTTResult(), error: 'SARVAM_API_KEY not set' };
    }

    const response = await fetch(`${SARVAM_BASE_URL}/speech-to-text`, {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
        ...form.getHeaders()
      },
      body: form
    });

    if (response.ok) {
      const data = await response.json();
      return {
        ok: true,
        data: {
          transcript: data.transcript || '',
          language_code: data.language_code || 'hi-IN',
          language_probability: data.language_probability || 1.0,
          request_id: data.request_id || null
        },
        error: null
      };
    } else {
      const errorText = await response.text();
      console.warn('[Saaras v3] STT call non-OK:', response.status, errorText);
    }
  } catch (err) {
    console.warn('[Saaras v3] STT call failed:', err.message);
  }

  // Demo fallback
  return { ok: false, data: getMockSTTResult(), error: 'Saaras API unavailable, using demo voice fallback' };
}

/**
 * 3. BULBUL v3: Text-To-Speech
 * POST /text-to-speech
 */
export async function bulbul3TextToSpeech(text, targetLanguage = 'hi-IN', speaker = 'shubh') {
  if (!text || text.trim() === '') {
    return { ok: false, data: null, error: 'Text is empty' };
  }

  // Chunk text into <= 2500 character slices if necessary
  const textChunk = text.slice(0, 2400);

  const payload = {
    inputs: [textChunk],
    target_language_code: targetLanguage,
    speaker: speaker || 'shubh',
    pitch: 0,
    pace: 1.0,
    loudness: 1.5,
    speech_sample_rate: 16000,
    enable_preprocessing: true,
    model: 'bulbul:v3'
  };

  const result = await sarvamFetch('/text-to-speech', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (result.ok && result.data?.audios?.[0]) {
    const audioBase64 = result.data.audios[0];
    const dataUri = `data:audio/wav;base64,${audioBase64}`;
    return {
      ok: true,
      data: {
        audio_base64: audioBase64,
        audio_url: dataUri,
        model: 'bulbul:v3'
      },
      error: null
    };
  }

  return {
    ok: false,
    data: { use_browser_synth: true, text },
    error: result.error || 'Bulbul TTS failed, falling back to browser synthesis'
  };
}

/**
 * 4. SARVAM VISION: Document AI Extract
 * POST /doc-ai/v1/job/extract (async job creation + polling)
 */
export async function sarvamVisionDocExtract(fileBuffer, mimeType = 'image/jpeg', currentProfile = {}) {
  const apiKey = getApiKey();
  if (!apiKey || !fileBuffer) {
    return { ok: false, data: getMockVisionResult(currentProfile), error: 'API key or file missing' };
  }

  try {
    // Step 1: Create extraction job
    const form = new FormData();
    form.append('file', fileBuffer, { filename: 'document.jpg', contentType: mimeType });
    form.append('schema', JSON.stringify({
      fields: ['name', 'age', 'annual_income', 'state', 'document_type', 'document_number']
    }));

    const createRes = await fetch(`${SARVAM_BASE_URL}/doc-ai/v1/job/extract`, {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
        ...form.getHeaders()
      },
      body: form
    });

    if (createRes.ok) {
      const jobData = await createRes.json();
      const jobId = jobData.job_id || jobData.id;

      if (jobId) {
        // Step 2: Poll job status every 2s for max 20 seconds
        let attempts = 0;
        const maxAttempts = 10; // 10 * 2s = 20s

        while (attempts < maxAttempts) {
          await delay(2000);
          attempts++;

          const statusRes = await sarvamFetch(`/doc-ai/v1/job/${jobId}/status`);
          if (statusRes.ok && statusRes.data) {
            const status = statusRes.data.status;

            if (status === 'Completed' || status === 'COMPLETED') {
              // Step 3: Download extracted files / results
              const downloadRes = await sarvamFetch(`/doc-ai/v1/job/${jobId}/download-files`);
              const extractedData = downloadRes.ok ? downloadRes.data : statusRes.data.result || {};

              let docs = currentProfile.documents_held || [];
              if (extractedData.document_type && !docs.includes(extractedData.document_type)) {
                docs = [...docs, extractedData.document_type];
              }

              return {
                ok: true,
                data: {
                  ...currentProfile,
                  ...filterNulls(extractedData),
                  documents_held: docs,
                  ocr_verified: true
                },
                error: null
              };
            } else if (status === 'Failed' || status === 'FAILED') {
              break;
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('[Sarvam Vision Doc AI] Job processing failed:', err.message);
  }

  // Fallback demo mock verification
  return { ok: false, data: getMockVisionResult(currentProfile), error: 'Document AI job timed out or unavailable' };
}

// Helpers & Rule Fallbacks
function filterNulls(obj) {
  const res = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== null && v !== undefined && v !== 'null') {
      res[k] = v;
    }
  }
  return res;
}

function getMockSTTResult() {
  return {
    transcript: "नमस्ते, मैं उत्तर प्रदेश का किसान हूँ। मेरे पास 1.5 एकड़ जमीन है और सालाना आय ₹65,000 है।",
    language_code: "hi-IN",
    language_probability: 0.98,
    request_id: "demo_stt_req_123"
  };
}

function getMockVisionResult(currentProfile) {
  const updatedDocs = Array.from(new Set([...(currentProfile.documents_held || []), 'Aadhaar Card', 'Income Certificate']));
  return {
    ...currentProfile,
    documents_held: updatedDocs,
    ocr_verified: true,
    vision_status: 'demo_verified'
  };
}

function ruleBasedExtract(text, currentProfile) {
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
