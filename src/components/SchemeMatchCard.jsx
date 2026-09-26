import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp, FileText, ArrowRight, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SchemeMatchCard({ schemeResult, onSelectForDraft, t, currentLang }) {
  const [showCitations, setShowCitations] = useState(false);

  // Dynamic Language Selection
  const isHindi = currentLang === 'hi-IN';
  const isTamil = currentLang === 'ta-IN';

  const schemeName = isHindi ? (schemeResult.scheme_name_hi || schemeResult.scheme_name)
    : isTamil ? (schemeResult.scheme_name_ta || schemeResult.scheme_name)
    : schemeResult.scheme_name;

  const schemeDesc = isHindi ? (schemeResult.description_hi || schemeResult.description)
    : isTamil ? (schemeResult.description_ta || schemeResult.description)
    : schemeResult.description;

  const benefitText = isHindi ? (schemeResult.benefit_amount_or_type_hi || schemeResult.benefit_amount_or_type)
    : isTamil ? (schemeResult.benefit_amount_or_type_ta || schemeResult.benefit_amount_or_type)
    : schemeResult.benefit_amount_or_type;

  const {
    level,
    state,
    is_eligible,
    has_conflict,
    fail_reason,
    criteria_evaluations,
    missing_documents
  } = schemeResult;

  // Minimal Status Pill Config
  let statusBadge = {
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    label: t.eligibleTag,
    icon: CheckCircle2,
  };

  if (has_conflict) {
    statusBadge = {
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800',
      label: t.conflictTag,
      icon: AlertTriangle,
    };
  } else if (!is_eligible) {
    statusBadge = {
      bg: 'bg-rose-50 dark:bg-rose-950/60',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-200 dark:border-rose-800',
      label: t.ineligibleTag,
      icon: XCircle,
    };
  } else if (missing_documents && missing_documents.length > 0) {
    statusBadge = {
      bg: 'bg-sky-50 dark:bg-sky-950/60',
      text: 'text-sky-700 dark:text-sky-300',
      border: 'border-sky-200 dark:border-sky-800',
      label: t.missingDocsTag,
      icon: FileText,
    };
  }

  const StatusIcon = statusBadge.icon;

  const failReasonText = isHindi ? (schemeResult.fail_reason_hi || schemeResult.fail_reason)
    : isTamil ? (schemeResult.fail_reason_ta || schemeResult.fail_reason)
    : schemeResult.fail_reason;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div>
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 mb-1 border border-slate-200 dark:border-slate-700">
            {level === 'central' ? t.centralSchemeLabel : `${t.stateSchemeLabel} (${state})`}
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
            {schemeName}
          </h3>
        </div>

        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          <span>{statusBadge.label}</span>
        </div>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
        {schemeDesc}
      </p>

      {/* Financial Benefit Display */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/80 mb-4 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-500 dark:text-slate-400">
          {t.entitlementBenefitLabel}
        </span>
        <span className="font-bold text-slate-900 dark:text-slate-100">
          {benefitText}
        </span>
      </div>

      {/* Failure reason callout if ineligible */}
      {!is_eligible && failReasonText && (
        <div className="p-3 mb-4 rounded-lg bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
          <span className="font-semibold">{t.reasonLabel} </span>
          {failReasonText}
        </div>
      )}

      {/* Expand/Collapse Statutory Citations */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
        <button
          onClick={() => setShowCitations(!showCitations)}
          className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 py-1"
        >
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>{t.sourceClauseHeader} ({criteria_evaluations.length} {t.rulesLabel})</span>
          </div>
          {showCitations ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <AnimatePresence>
          {showCitations && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mt-2 space-y-2"
            >
              {criteria_evaluations.map((crit, idx) => {
                const sourceClause = isHindi ? (crit.source_clause_hi || crit.source_clause)
                  : isTamil ? (crit.source_clause_ta || crit.source_clause)
                  : crit.source_clause;

                return (
                  <div 
                    key={idx}
                    className={`p-3 rounded-lg border-l-2 text-xs ${
                      crit.passed 
                        ? 'border-l-emerald-500 bg-slate-50 dark:bg-slate-800/40' 
                        : 'border-l-rose-500 bg-rose-50/30 dark:bg-rose-950/20'
                    }`}
                  >
                    <div className="flex items-center justify-between font-medium mb-1">
                      <span className="text-slate-800 dark:text-slate-200 capitalize">
                        {crit.field} ({crit.operator} {String(crit.expected)})
                      </span>
                      <span className={crit.passed ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-rose-600 font-semibold'}>
                        {crit.passed ? t.passedLabel : t.notMetLabel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                      "{sourceClause}"
                    </p>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action: Generate Draft Application */}
      {is_eligible && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => onSelectForDraft(schemeResult)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
          >
            <span>{t.actionSelect}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
}
