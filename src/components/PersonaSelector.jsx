import React from 'react';
import { UserCheck, Sprout, GraduationCap, Bike, Users } from 'lucide-react';

const ICON_MAP = {
  'sprout': Sprout,
  'graduation-cap': GraduationCap,
  'bike': Bike
};

export default function PersonaSelector({ personas, onSelectPersona, activePersonaId, t }) {
  if (!personas || personas.length === 0) return null;

  return (
    <div className="bg-slate-100/60 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            {t.personaSectionTitle}
          </h3>
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">
          {t.personaSectionSubtitle}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {personas.map((p) => {
          const isSelected = activePersonaId === p.id;
          const IconComponent = ICON_MAP[p.icon] || Users;

          return (
            <button
              key={p.id}
              onClick={() => onSelectPersona(p)}
              className={`p-3.5 rounded-lg border text-left transition-all ${
                isSelected
                  ? 'bg-white dark:bg-slate-800 border-slate-900 dark:border-slate-100 shadow-sm ring-1 ring-slate-900/10'
                  : 'bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {p.name}
                    </h4>
                    {isSelected && (
                      <UserCheck className="w-4 h-4 text-slate-900 dark:text-slate-100" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {p.title} • {p.location.split(',')[0]}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
