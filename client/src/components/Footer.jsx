import React, { useState } from 'react';
import { Recycle, RotateCcw, Award, CheckCircle2, Heart } from 'lucide-react';

export default function Footer({ onResetData }) {
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = async () => {
    if (!window.confirm("Reset all 45 listings back to original seed data? Any new listings and claim changes will be restored to initial state.")) {
      return;
    }
    setResetting(true);
    try {
      const res = await fetch('/api/seed/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setResetSuccess(true);
        if (onResetData) onResetData();
        setTimeout(() => setResetSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to reset:", err);
    } finally {
      setResetting(false);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-16 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
                <Recycle className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Circular Packaging & Materials Exchange
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
              A high-efficiency B2B exchange turning industrial surplus packaging into reusable raw material. Connecting manufacturers, recyclers, and retailers across 10 major Indian industrial corridors to prevent landfill waste and lower embodied carbon emissions.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              <span className="bg-slate-800 text-emerald-400 font-semibold px-2.5 py-1 rounded border border-slate-700">
                🌱 100% Circular Ecosystem
              </span>
              <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-700">
                ⚡ Haversine Smart Matching
              </span>
              <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-700">
                📊 Live GHG Abatement Dashboard
              </span>
            </div>
          </div>

          {/* Hackathon Credentials */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" /> HackOut '26
            </h4>
            <div className="text-xs text-slate-400 space-y-1">
              <p><strong className="text-slate-200">Theme:</strong> Circular Carbon Ecosystem</p>
              <p><strong className="text-slate-200">Team:</strong> SYNTAX TERROR</p>
              <div className="pt-1 text-[11px] text-slate-400">
                <p>• Tirth Vyas (Team Leader)</p>
                <p>• Bhavinkumar Gohel</p>
                <p>• Saurabh Prajapati</p>
                <p>• Mihir Pathakji</p>
              </div>
            </div>
          </div>

          {/* Demo Control Center */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Demo Controls
            </h4>
            <p className="text-xs text-slate-400">
              Reset marketplace to the original 45 sample listings anytime during judge walkthroughs.
            </p>
            <button
              onClick={handleReset}
              disabled={resetting}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 px-3 rounded-lg border border-slate-600 transition-colors disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
              {resetting ? 'Resetting Data...' : 'Reset Seed Data (45 items)'}
            </button>
            {resetSuccess && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/80 px-2.5 py-1.5 rounded border border-emerald-800">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Restored 45 seed listings!</span>
              </div>
            )}
          </div>

        </div>

        {/* Bottom credits */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© 2026 Circular Packaging & Materials Exchange. Built for HackOut '26.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> by Team SYNTAX TERROR
          </p>
        </div>

      </div>
    </footer>
  );
}
