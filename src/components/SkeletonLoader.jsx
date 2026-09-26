import React from 'react';

export default function SkeletonLoader() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    </div>
  );
}
