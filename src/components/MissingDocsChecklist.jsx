import React, { useRef } from 'react';
import { FileCheck, CheckSquare, Square, ScanLine, Upload } from 'lucide-react';

export default function MissingDocsChecklist({ schemeResults, onUpdateDocsHeld, onUploadDocVision, documentsHeld = [], t, currentLang }) {
  const fileInputRef = useRef(null);

  // Collect missing docs across eligible schemes
  const eligibleSchemes = schemeResults.filter(s => s.is_eligible);
  if (eligibleSchemes.length === 0) return null;

  const isHindi = currentLang === 'hi-IN';
  const isTamil = currentLang === 'ta-IN';

  const handleToggleDoc = (docName) => {
    const exists = documentsHeld.includes(docName);
    let updated = [];
    if (exists) {
      updated = documentsHeld.filter(d => d !== docName);
    } else {
      updated = [...documentsHeld, docName];
    }
    onUpdateDocsHeld(updated);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onUploadDocVision) {
      onUploadDocVision(file);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm mb-6">
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              {t.docChecklistTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.docChecklistSubtitle}
            </p>
          </div>
        </div>

        {/* Sarvam Vision Scan Button */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,.pdf"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-xs"
            title="Scan document with Sarvam Vision"
          >
            <ScanLine className="w-3.5 h-3.5" />
            <span>
              {isHindi ? 'सर्वं विज़न स्कैन' : isTamil ? 'சர்வம் விஷன் ஸ்கேன்' : 'Sarvam Vision Scan'}
            </span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {eligibleSchemes.map((scheme) => {
          const schemeName = isHindi ? (scheme.scheme_name_hi || scheme.scheme_name)
            : isTamil ? (scheme.scheme_name_ta || scheme.scheme_name)
            : scheme.scheme_name;

          const allDocs = isHindi ? (scheme.required_documents_hi || scheme.required_documents)
            : isTamil ? (scheme.required_documents_ta || scheme.required_documents)
            : scheme.required_documents;

          return (
            <div key={scheme.scheme_id} className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700/80">
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">
                {schemeName}
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {allDocs.map((doc, idx) => {
                  const isChecked = documentsHeld.some(d => d.toLowerCase() === doc.toLowerCase() || doc.toLowerCase().includes(d.toLowerCase()));
                  return (
                    <label
                      key={idx}
                      onClick={() => handleToggleDoc(doc)}
                      className={`p-2.5 rounded border text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
                        isChecked
                          ? 'bg-white dark:bg-slate-800 border-slate-400 dark:border-slate-600 text-slate-900 dark:text-slate-100'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <span className="truncate pr-2">{doc}</span>
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-slate-900 dark:text-slate-100 flex-shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

