import React from 'react';
import { ShieldCheck, Moon, Sun, RotateCcw, Building2 } from 'lucide-react';
import LanguagePicker from './LanguagePicker';

export default function Header({ 
  currentLang, 
  onLangChange, 
  darkMode, 
  onToggleDarkMode, 
  t,
  onReset 
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900 font-bold shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {t.appName}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{t.trustBadge}</span>
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Controls: Language Selector + Reset + Theme */}
          <div className="flex items-center gap-2.5 self-end md:self-auto">
            <LanguagePicker currentLang={currentLang} onLangChange={onLangChange} />

            <button
              onClick={onReset}
              className="p-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors text-xs font-semibold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
              title={t.navReset}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.navReset}</span>
            </button>

            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
