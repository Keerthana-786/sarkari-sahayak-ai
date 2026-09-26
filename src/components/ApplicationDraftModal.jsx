import React from 'react';
import { X, Printer, ShieldAlert, FileCheck2, User, FileText, Check, Building2 } from 'lucide-react';

export default function ApplicationDraftModal({ scheme, profile, onClose, t, currentLang }) {
  if (!scheme) return null;

  const isHindi = currentLang === 'hi-IN';
  const isTamil = currentLang === 'ta-IN';

  const schemeName = isHindi ? (scheme.scheme_name_hi || scheme.scheme_name)
    : isTamil ? (scheme.scheme_name_ta || scheme.scheme_name)
    : scheme.scheme_name;

  const benefitText = isHindi ? (scheme.benefit_amount_or_type_hi || scheme.benefit_amount_or_type)
    : isTamil ? (scheme.benefit_amount_or_type_ta || scheme.benefit_amount_or_type)
    : scheme.benefit_amount_or_type;

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-3xl w-full my-8 overflow-hidden relative flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <h3 className="font-semibold text-sm sm:text-base">
              {t.draftModalTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Safety Warning Banner */}
        <div className="bg-amber-50 dark:bg-amber-950/40 p-4 border-b border-amber-200 dark:border-amber-900 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
              {t.draftNoticeTitle} — Citizen Submission Notice
            </h4>
            <p className="text-xs text-amber-800 dark:text-amber-400 mt-0.5 leading-relaxed">
              {t.draftNoticeBody}
            </p>
          </div>
        </div>

        {/* Printable Draft Form Area */}
        <div className="p-6 overflow-y-auto space-y-6 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100" id="printable-draft">
          
          {/* Government Form Letterhead */}
          <div className="text-center pb-4 border-b-2 border-slate-900 dark:border-slate-100">
            <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold tracking-wider uppercase">
              Official Government Welfare Draft Application
            </h2>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              {schemeName}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Reference ID: SS-REF-{Math.floor(100000 + Math.random() * 900000)} • Date: {todayStr}
            </p>
          </div>

          {/* Section 1: Applicant Profile Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              1. Beneficiary Profile Parameters
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">{t.fieldLabels.name}</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{profile.name || 'Not Provided'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">{t.fieldLabels.age} & {t.fieldLabels.gender}</span>
                <span className="font-semibold">{profile.age ? `${profile.age} yrs` : 'N/A'}, {profile.gender || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">{t.fieldLabels.state}</span>
                <span className="font-semibold">{profile.state || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">{t.fieldLabels.occupation}</span>
                <span className="font-semibold capitalize">{profile.occupation || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">{t.fieldLabels.annual_income}</span>
                <span className="font-semibold">₹{Number(profile.annual_income || 0).toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">{t.fieldLabels.land_ownership_acres}</span>
                <span className="font-semibold">{profile.land_ownership_acres || 0} Acres</span>
              </div>
            </div>
          </div>

          {/* Section 2: Scheme & Benefit Selection */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              2. Target Scheme Benefit Details
            </h4>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Scheme Name:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{schemeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jurisdiction Level:</span>
                <span className="font-semibold capitalize">{scheme.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t.entitlementBenefitLabel}</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{benefitText}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Verified Statutory Citations */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              3. Verified Eligibility Criteria
            </h4>
            <div className="space-y-1.5">
              {scheme.criteria_evaluations?.map((crit, idx) => {
                const sourceClause = isHindi ? (crit.source_clause_hi || crit.source_clause)
                  : isTamil ? (crit.source_clause_ta || crit.source_clause)
                  : crit.source_clause;

                return (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{crit.field}: Verified</span>
                      <p className="text-[11px] text-slate-500 italic mt-0.5">"{sourceClause}"</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Citizen Verification Declaration */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-3">
            <h5 className="font-bold uppercase tracking-wide text-slate-800 dark:text-slate-200">
              Citizen Self-Declaration & Signature
            </h5>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
              "I hereby declare that all information provided above is true and accurate to the best of my knowledge. I understand that Sarkari Sahayak has prepared this document for my convenience and that I am solely responsible for verifying and submitting this application to the designated government authority."
            </p>

            <div className="pt-6 flex justify-between items-end">
              <div>
                <p className="text-[11px] text-slate-400">Date: {todayStr}</p>
                <p className="text-[11px] text-slate-400">Place: {profile.state || 'India'}</p>
              </div>
              <div className="text-center">
                <div className="w-40 border-b border-slate-900 dark:border-slate-100 mb-1" />
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Signature of Applicant
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Action Buttons */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {t.closeBtn}
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>{t.printBtn}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
