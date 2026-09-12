import React from 'react';

export default function StatusBadge({ status, className = "" }) {
  const normalized = (status || "").toLowerCase();

  if (normalized === "available") {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm ${className}`}>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        Available
      </span>
    );
  }

  if (normalized === "reserved") {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 shadow-sm ${className}`}>
        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
        Reserved
      </span>
    );
  }

  if (normalized === "sold") {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-700 border border-slate-300 ${className}`}>
        <span className="w-2 h-2 rounded-full bg-slate-500"></span>
        Sold / Diverted
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 ${className}`}>
      {status}
    </span>
  );
}
