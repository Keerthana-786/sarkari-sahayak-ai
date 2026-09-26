import React from 'react';
import { Scale, ArrowRight, AlertCircle } from 'lucide-react';

export default function ConflictWarningCard({ conflicts, onSelectScheme, t, currentLang }) {
  if (!conflicts || conflicts.length === 0) return null;

  const isHindi = currentLang === 'hi-IN';
  const isTamil = currentLang === 'ta-IN';

  return (
    <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/60 p-5 shadow-sm mb-6">
      
      {/* Top Banner */}
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 flex-shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-300 mb-1">
            {t.policyGuardrailBadge}
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {t.conflictWarningTitle}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            {t.conflictWarningDesc}
          </p>
        </div>
      </div>

      {/* Conflicts List */}
      {conflicts.map((conflict, idx) => {
        const schemeAName = isHindi ? (conflict.scheme_a.name_hi || conflict.scheme_a.name)
          : isTamil ? (conflict.scheme_a.name_ta || conflict.scheme_a.name)
          : conflict.scheme_a.name;

        const schemeABenefit = isHindi ? (conflict.scheme_a.benefit_hi || conflict.scheme_a.benefit)
          : isTamil ? (conflict.scheme_a.benefit_ta || conflict.scheme_a.benefit)
          : conflict.scheme_a.benefit;

        const schemeBName = isHindi ? (conflict.scheme_b.name_hi || conflict.scheme_b.name)
          : isTamil ? (conflict.scheme_b.name_ta || conflict.scheme_b.name)
          : conflict.scheme_b.name;

        const schemeBBenefit = isHindi ? (conflict.scheme_b.benefit_hi || conflict.scheme_b.benefit)
          : isTamil ? (conflict.scheme_b.benefit_ta || conflict.scheme_b.benefit)
          : conflict.scheme_b.benefit;

        const conflictReason = isHindi ? (conflict.reason_hi || conflict.reason)
          : isTamil ? (conflict.reason_ta || conflict.reason)
          : conflict.reason;

        return (
          <div key={idx} className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-amber-200 dark:border-amber-900/50 shadow-sm space-y-3">
            
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Scale className="w-3.5 h-3.5 text-slate-500" />
              <span>{conflictReason}</span>
            </div>

            {/* Side-by-Side Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300">
                    <th className="p-2.5 font-semibold">{t.parameterHeader}</th>
                    <th className="p-2.5 font-bold text-slate-900 dark:text-slate-100">
                      {t.schemeAHeader}: {schemeAName}
                    </th>
                    <th className="p-2.5 font-bold text-slate-900 dark:text-slate-100">
                      {t.schemeBHeader}: {schemeBName}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  <tr>
                    <td className="p-2.5 font-medium text-slate-500">{t.benefitLabel}</td>
                    <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">
                      {schemeABenefit}
                    </td>
                    <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">
                      {schemeBBenefit}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-slate-500">{t.docsCountLabel}</td>
                    <td className="p-2.5">{conflict.scheme_a.docs_required} Documents</td>
                    <td className="p-2.5">{conflict.scheme_b.docs_required} Documents</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-slate-500">{t.actionHeader}</td>
                    <td className="p-2.5">
                      <button
                        onClick={() => onSelectScheme(conflict.scheme_a.id)}
                        className="w-full px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded font-semibold transition-all flex items-center justify-center gap-1 text-[11px]"
                      >
                        <span>{t.selectSchemeABtn}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                    <td className="p-2.5">
                      <button
                        onClick={() => onSelectScheme(conflict.scheme_b.id)}
                        className="w-full px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded font-semibold transition-all flex items-center justify-center gap-1 text-[11px]"
                      >
                        <span>{t.selectSchemeBBtn}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        );
      })}

    </div>
  );
}
