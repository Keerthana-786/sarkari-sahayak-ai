import React from 'react';

export default function AudioVisualizer({ isRecording }) {
  if (!isRecording) return null;

  return (
    <div className="flex items-center justify-center gap-1 h-6 px-2">
      <div className="w-1 bg-red-500 rounded-full animate-wave-1"></div>
      <div className="w-1 bg-red-500 rounded-full animate-wave-2"></div>
      <div className="w-1 bg-red-500 rounded-full animate-wave-3"></div>
      <div className="w-1 bg-red-500 rounded-full animate-wave-4"></div>
      <div className="w-1 bg-red-500 rounded-full animate-wave-2"></div>
    </div>
  );
}
