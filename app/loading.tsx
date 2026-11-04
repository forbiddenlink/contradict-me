import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-teal-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-teal-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <h2 className="text-xl font-semibold text-slate-700 mb-2">Loading ContradictMe</h2>
        <p className="text-slate-500 text-sm">Preparing to challenge your beliefs...</p>
      </div>
    </div>
  );
}
