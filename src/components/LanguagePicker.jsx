import React from 'react';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'hi-IN', label: 'हिन्दी', short: 'HI' },
  { code: 'ta-IN', label: 'தமிழ்', short: 'TA' },
  { code: 'en-IN', label: 'English', short: 'EN' }
];

export default function LanguagePicker({ currentLang, onLangChange }) {
  return (
    <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="px-1.5 text-slate-400">
        <Globe className="w-3.5 h-3.5" />
      </div>
      <div className="flex items-center gap-1">
        {LANGUAGES.map((lang) => {
          const isActive = currentLang === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => onLangChange(lang.code)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>{lang.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
