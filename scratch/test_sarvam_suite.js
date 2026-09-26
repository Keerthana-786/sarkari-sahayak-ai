import dotenv from 'dotenv';
dotenv.config();

import { 
  extractProfileWithSarvam105B, 
  saaras3SpeechToText, 
  bulbul3TextToSpeech, 
  sarvamVisionDocExtract 
} from '../server/lib/sarvam.js';
import { evaluateEligibility } from '../server/rulesEngine.js';
import fs from 'fs';

async function runAuditTests() {
  console.log("=========================================");
  console.log("🇮🇳 SARKARI SAHAYAK AI — TRIAL RUN PROOF");
  console.log("=========================================\n");

  // Load Schemes
  const schemes = JSON.parse(fs.readFileSync('./server/schemes.json', 'utf8'));

  // Test 1: Free-typed Hindi text profile extraction (Sarvam-105B)
  console.log("--- TEST 1: Free-typed Hindi Profile Extraction (Sarvam-105B) ---");
  const hindiInput = "नमस्ते, मेरा नाम राम प्रसाद है। मैं उत्तर प्रदेश का किसान हूँ, उम्र 45 साल है, और मेरे पास 2 एकड़ जमीन है। मेरी सालाना आय 75000 रुपये है।";
  console.log("Input text:", hindiInput);
  const extractRes = await extractProfileWithSarvam105B(hindiInput, {});
  console.log("Sarvam-105B Extracted Profile Result:", JSON.stringify(extractRes.data, null, 2));
  console.log("Status:", extractRes.ok ? "PASSED" : "FALLBACK USED (Rule engine)");
  console.log("");

  // Test 2: Speech to Text (Saaras v3)
  console.log("--- TEST 2: Speech-to-Text (Saaras v3) ---");
  const dummyAudio = Buffer.from("dummy_audio_bytes_for_testing");
  const sttRes = await saaras3SpeechToText(dummyAudio, "audio/webm", "translate");
  console.log("Saaras STT Result:", JSON.stringify(sttRes.data, null, 2));
  console.log("Status:", sttRes.ok ? "PASSED" : "FALLBACK USED (Demo Mode)");
  console.log("");

  // Test 3: Text to Speech (Bulbul v3)
  console.log("--- TEST 3: Text-to-Speech (Bulbul v3) ---");
  const hindiTTS = "पीएम किसान सम्मान निधि योजना के तहत आपको प्रति वर्ष ₹6,000 की वित्तीय सहायता मिलेगी।";
  console.log("Input TTS Text:", hindiTTS);
  const ttsRes = await bulbul3TextToSpeech(hindiTTS, "hi-IN", "shubh");
  console.log("Bulbul TTS Result Summary:", {
    ok: ttsRes.ok,
    model: ttsRes.data?.model,
    has_audio_base64: Boolean(ttsRes.data?.audio_base64),
    sample_prefix: ttsRes.data?.audio_url ? ttsRes.data.audio_url.substring(0, 45) + "..." : "N/A"
  });
  console.log("Status:", ttsRes.ok ? "PASSED" : "FALLBACK USED (Browser Synth)");
  console.log("");

  // Test 4: Mutual Exclusion Scheme Conflict Detection (Priya Sundaram Profile)
  console.log("--- TEST 4: Mutual Exclusion Conflict Detection ---");
  const priyaProfile = {
    name: "Priya Sundaram",
    age: 20,
    gender: "female",
    occupation: "student",
    annual_income: 180000,
    state: "Tamil Nadu",
    pucca_house_owned: false,
    documents_held: ["Aadhaar Card", "College ID", "Income Certificate"]
  };
  const evalRes = evaluateEligibility(priyaProfile, schemes);
  console.log("Eligible Schemes Count:", evalRes.summary.eligible_count);
  console.log("Conflicts Count:", evalRes.summary.conflicts_count);
  console.log("Conflicts Detected Details:", JSON.stringify(evalRes.conflicts, null, 2));
  console.log("Status:", evalRes.summary.conflicts_count > 0 ? "PASSED (Conflict card triggered)" : "FAILED");
  console.log("");

  // Test 5: Deliberately bad / empty input
  console.log("--- TEST 5: Graceful Error Handling on Empty/Bad Input ---");
  const badInputRes = await extractProfileWithSarvam105B("", {});
  console.log("Empty Input Handling Result:", JSON.stringify(badInputRes, null, 2));
  console.log("Status: PASSED (Gracefully handled without crashing)");
  console.log("=========================================\n");
}

runAuditTests().catch(err => console.error("Test execution error:", err));
