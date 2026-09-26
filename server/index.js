import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

import { evaluateEligibility } from './rulesEngine.js';
import {
  extractProfileFromMessage,
  speechToTextTranslate,
  translateText,
  textToSpeech,
  analyzeDocumentWithSarvamVision
} from './sarvamService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Setup Multer memory storage for uploads (audio & documents)
const upload = multer({ storage: multer.memoryStorage() });

// Load hardcoded schemes and personas data
const schemesPath = path.join(__dirname, 'schemes.json');
const personasPath = path.join(__dirname, 'personas.json');

let schemes = [];
let personas = [];

try {
  schemes = JSON.parse(fs.readFileSync(schemesPath, 'utf8'));
  personas = JSON.parse(fs.readFileSync(personasPath, 'utf8'));
} catch (err) {
  console.error('Error reading data files:', err.message);
}

// --- API ENDPOINTS ---

// 1. Get All Schemes
app.get('/api/schemes', (req, res) => {
  res.json({ success: true, count: schemes.length, schemes });
});

// 2. Get All Demo Personas
app.get('/api/personas', (req, res) => {
  res.json({ success: true, count: personas.length, personas });
});

// 3. Conversational Extraction + Live Eligibility Evaluation (Sarvam-105B)
app.post('/api/extract-profile', async (req, res) => {
  try {
    const { message, profile = {} } = req.body;
    
    // Extract updated profile fields via Sarvam LLM / Rules Fallback
    const updatedProfile = await extractProfileFromMessage(message, profile);
    
    // Run Deterministic Rules Engine
    const eligibilityResult = evaluateEligibility(updatedProfile, schemes);

    res.json({
      success: true,
      profile: updatedProfile,
      eligibility: eligibilityResult
    });
  } catch (err) {
    console.error('Extract Profile Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Standalone Deterministic Eligibility Evaluation
app.post('/api/evaluate-eligibility', (req, res) => {
  try {
    const { profile = {} } = req.body;
    const eligibilityResult = evaluateEligibility(profile, schemes);
    res.json({
      success: true,
      eligibility: eligibilityResult
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Saaras Speech To Text Translate
app.post('/api/stt', upload.single('audio'), async (req, res) => {
  try {
    const audioBuffer = req.file ? req.file.buffer : null;
    const mimeType = req.file ? req.file.mimetype : 'audio/webm';
    
    const result = await speechToTextTranslate(audioBuffer, mimeType);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Text Translation
app.post('/api/translate', async (req, res) => {
  try {
    const { text, targetLanguage = 'hi-IN' } = req.body;
    const translatedText = await translateText(text, targetLanguage);
    res.json({ success: true, translatedText, targetLanguage });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Bulbul Text To Speech
app.post('/api/tts', async (req, res) => {
  try {
    const { text, targetLanguage = 'hi-IN' } = req.body;
    const result = await textToSpeech(text, targetLanguage);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Sarvam Vision Document Analysis & OCR
app.post('/api/vision-document', upload.single('document'), async (req, res) => {
  try {
    const fileBuffer = req.file ? req.file.buffer : null;
    const mimeType = req.file ? req.file.mimetype : 'image/jpeg';
    let currentProfile = {};
    if (req.body.profile) {
      try {
        currentProfile = JSON.parse(req.body.profile);
      } catch (e) {
        currentProfile = {};
      }
    }

    const updatedProfile = await analyzeDocumentWithSarvamVision(fileBuffer, mimeType, currentProfile);
    const eligibilityResult = evaluateEligibility(updatedProfile, schemes);

    res.json({
      success: true,
      profile: updatedProfile,
      eligibility: eligibilityResult
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Sarkari Sahayak AI Engine',
    has_sarvam_key: Boolean(process.env.SARVAM_API_KEY && process.env.SARVAM_API_KEY !== 'your_key_here'),
    models: ['Sarvam-105B', 'Saaras', 'Bulbul', 'Sarvam Vision']
  });
});

app.listen(PORT, () => {
  console.log(`🇮🇳 Sarkari Sahayak AI Backend running on port ${PORT}`);
});
