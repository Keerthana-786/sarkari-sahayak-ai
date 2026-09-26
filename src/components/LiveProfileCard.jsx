import React from 'react';
import { User, Check, FileText, MapPin, IndianRupee, Briefcase, LandPlot, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LiveProfileCard({ profile, t }) {
  const fields = [
    { key: 'name', label: t.fieldLabels.name, icon: User, format: (v) => v },
    { key: 'age', label: t.fieldLabels.age, icon: User, format: (v) => `${v} yrs` },
    { key: 'occupation', label: t.fieldLabels.occupation, icon: Briefcase, format: (v) => String(v).replace('_', ' ').toUpperCase() },
    { key: 'annual_income', label: t.fieldLabels.annual_income, icon: IndianRupee, format: (v) => `₹${Number(v).toLocaleString('en-IN')}/yr` },
    { key: 'state', label: t.fieldLabels.state, icon: MapPin, format: (v) => v },
    { key: 'land_ownership_acres', label: t.fieldLabels.land_ownership_acres, icon: LandPlot, format: (v) => `${v} Acres` },
    { key: 'family_size', label: t.fieldLabels.family_size, icon: Users, format: (v) => `${v} members` },
    { key: 'gender', label: t.fieldLabels.gender, icon: User, format: (v) => v }
  ];

  // Calculate completeness percentage
  const filledCount = fields.filter(f => profile[f.key] !== undefined && profile[f.key] !== null).length;
  const percentage = Math.round((filledCount / fields.length) * 100);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              {t.profileTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.profileSubtitle}
            </p>
          </div>
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
            {percentage}% {t.completeLabel}
          </span>
        </div>
      </div>

      {/* Completeness Bar */}
      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-5">
        <div 
          className="h-full bg-slate-900 dark:bg-slate-100 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Staggered Grid of Profile Attributes */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-2.5 mb-5"
      >
        {fields.map((field) => {
          const hasValue = profile[field.key] !== undefined && profile[field.key] !== null;
          const Icon = field.icon;
          return (
            <motion.div
              key={field.key}
              variants={itemVariants}
              className={`p-3 rounded-lg border transition-all ${
                hasValue
                  ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-dashed border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                <span className="truncate flex items-center gap-1">
                  <Icon className="w-3 h-3 text-slate-400" />
                  {field.label}
                </span>
                {hasValue ? (
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                ) : (
                  <span className="text-[10px] text-slate-400">{t.waitingLabel}</span>
                )}
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {hasValue ? field.format(profile[field.key]) : '—'}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Documents Badge */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          <span>{t.fieldLabels.documents_held} ({profile.documents_held?.length || 0})</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {profile.documents_held && profile.documents_held.length > 0 ? (
            profile.documents_held.map((doc, idx) => (
              <span 
                key={idx}
                className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 flex items-center gap-1"
              >
                <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                {doc}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400 italic">{t.noDocsLabel}</span>
          )}
        </div>
      </div>

    </div>
  );
}
