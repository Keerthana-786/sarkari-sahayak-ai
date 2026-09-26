# Sarkari Sahayak — 90-Second Walkthrough Script

> **Tagline:** *"From 1000+ schemes to your schemes."*  
> **Core Value:** Deterministic Rules Engine + Multilingual Sarvam AI Voice Navigation + Conflict Detection & Legal Statutory Citations.

---

## ⏱️ Timeline & Beat-by-Beat Walkthrough

### **[0:00 - 0:15] Beat 1: Landing & Multilingual Toggle**
* **Presenter:**  
  *"Millions of Indian citizens qualify for welfare benefits but can't access them because discovering schemes requires searching fragmented portals. **Sarkari Sahayak** flips this: citizens speak naturally in their native language, and our deterministic rules engine matches them to exact schemes with legal statutory citations."*
* **Visual Action:**  
  * Highlight top header tagline: `"From 1000+ schemes to your schemes."`  
  * Point to trust badge: `"Verified by Rules Engine"`.  
  * Click the **Language Picker** to switch between **Hindi (हिन्दी)**, **Tamil (தமிழ்)**, and **English**, demonstrating 100% full-UI translation.

---

### **[0:15 - 0:35] Beat 2: Persona 1 — Farmer Ramesh (Voice & Profile Extract)**
* **Presenter:**  
  *"Let's select Ramesh Kumar, a smallholder farmer in Gorakhpur, Uttar Pradesh."*
* **Visual Action:**  
  * Click **"Ramesh Kumar (Smallholder Farmer)"**.  
  * Show the voice mic button with animated waveform recording status.  
  * Show the **Citizen Profile** panel on the right side as fields (`Occupation: Farmer`, `Land: 1.5 Acres`, `Income: ₹65,000`) populate with staggered animations.  
  * Expand the statutory citation on **PM-KISAN** to view the exact official rule quoted:  
    `"Clause 3.2: Cultivable landholding size must not exceed 5.0 acres..."`

---

### **[0:35 - 0:55] Beat 3: Persona 3 — Gig Worker Vikram (Missing Documents)**
* **Presenter:**  
  *"Now let's select Vikram, a 28-year-old delivery driver in Mumbai who currently holds only an Aadhaar card."*
* **Visual Action:**  
  * Click **"Vikram Singh (Gig Worker)"**.  
  * Observe **Ayushman Bharat** displaying a `Pending Documents` badge.  
  * Open the **Document Verification Checklist** and check off *"Income Certificate"*.  
  * Watch the status badge instantly re-evaluate and flip to `Eligible` in real time.

---

### **[0:55 - 1:25] Beat 4: Persona 2 — Student Priya (Mutual Exclusion Conflict Detection)**
* **Presenter:**  
  *"Now for our primary innovation: **Mutual Exclusion Policy Detection**. Let's select Priya Sundaram, a college student in Tamil Nadu."*
* **Visual Action:**  
  * Click **"Priya Sundaram (College Student)"**.  
  * Point to the prominent Policy Guardrail card that appears:  
    `"Mutual Exclusion Policy Detected"`  
  * Explain: Priya satisfies eligibility for both **Tamil Nadu Higher Education Grant** (₹12,000/yr) and **Kalaignar Kanavu Illam Housing Grant** (₹3,50,000), but state regulations forbid claiming both in the same financial year.  
  * Show the **Side-by-Side Scheme Comparison Table** comparing benefits and document requirements so the citizen retains full decision control.

---

### **[0:90 - 1:30] Beat 5: Official Application Draft & Verification Promise**
* **Presenter:**  
  *"Priya selects the Housing Grant. We click 'Select Scheme A' to generate her official printable Application Draft. Notice the bold notice: **Review & Verification Required — No data is ever auto-submitted.** Thank you!"*
* **Visual Action:**  
  * Click **"Select Scheme A"** → Open pre-filled printable Application Draft → Click **"Print / Save PDF Application"**.

---

## 🏆 Key Audit Summary
1. **Deterministic Execution:** Rules engine code (`server/rulesEngine.js`) decides eligibility, NOT LLM guesswork.
2. **Statutory Footnote Citations:** Every match quotes the exact `source_clause` as legal evidence.
3. **Mutual Conflict Detection:** Flags conflicting schemes with a side-by-side comparison table.
4. **Zero Auto-Submit:** Citizens retain 100% control over submission.
