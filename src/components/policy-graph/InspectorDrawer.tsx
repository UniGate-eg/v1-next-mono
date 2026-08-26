'use client';

import React from 'react';
import { SubLawItem } from './types';
import { Shield, FileText, CheckCircle2, ChevronRight, Activity, Layers, X, Sparkles, Building2 } from 'lucide-react';

interface InspectorDrawerProps {
  subLaw: SubLawItem | null;
  onClose: () => void;
  onExploreDetails: (subLaw: SubLawItem) => void;
}

export default function InspectorDrawer({
  subLaw,
  onClose,
  onExploreDetails,
}: InspectorDrawerProps) {
  if (!subLaw) return null;

  // Sentiment bar chart heights
  const equalizerBars = [12, 18, 24, 16, 28, 38, 52, 64, 48, 70, 85, 92, 78, 60, 45, 55, 68, 74, 58, 42, 30, 20];

  return (
    <aside className="absolute top-20 right-6 bottom-28 w-[380px] z-30 flex flex-col bg-slate-950/80 backdrop-blur-2xl border border-white/15 rounded-3xl p-5 shadow-2xl shadow-black/80 overflow-y-auto custom-dark-scrollbar select-none pointer-events-auto animate-in fade-in slide-in-from-right-6 duration-300">
      {/* Top Category Badge & Close Button */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Activity className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            {subLaw.category}
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Close Inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Law Title */}
      <h2 className="text-base font-bold text-slate-100 leading-snug mb-3.5">
        {subLaw.title}
      </h2>

      {/* Status & Last Update Card */}
      <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-3.5 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wide">
            Active
          </span>
          <button
            onClick={() => onExploreDetails(subLaw)}
            className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline transition-all"
          >
            <span>Explore details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-[11px] text-slate-400">
          The last update on this law was listed on{' '}
          <strong className="text-slate-200">{subLaw.lastUpdated}</strong>
        </p>
      </div>

      {/* Sentiment Rate Card with Live Equalizer */}
      <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 font-medium">Sentiment Rate</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-amber-400/30">
            Moderate
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-black text-white tracking-tight">{subLaw.sentiment}%</span>
          <span className="text-[11px] text-rose-400 font-semibold flex items-center">
            -4% <span className="text-slate-400 font-normal ml-1">Last month</span>
          </span>
        </div>

        {/* Equalizer Waveform Bars */}
        <div className="flex items-end gap-1 h-12 w-full px-1">
          {equalizerBars.map((val, idx) => {
            const isHighlight = idx >= 10 && idx <= 14;
            return (
              <div
                key={idx}
                style={{ height: `${val}%` }}
                className={`flex-1 rounded-t-sm transition-all duration-300 ${
                  isHighlight
                    ? 'bg-gradient-to-t from-amber-500 to-amber-300 shadow-sm shadow-amber-400/50'
                    : 'bg-slate-700/60 hover:bg-slate-500'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* 2x2 KPI Grid */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        {/* 1. Public Complaints */}
        <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-3">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-lg font-black text-white">{subLaw.complaintsCount}</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">Public Complains & Recommendations</p>
        </div>

        {/* 2. Related Regulations */}
        <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-3">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-lg font-black text-white">{subLaw.regulationsCount}</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">Related Regulations</p>
        </div>

        {/* 3. Services */}
        <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-3">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-lg font-black text-white">{subLaw.servicesCount}</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">Active Services</p>
        </div>

        {/* 4. Entities Involved */}
        <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-3">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-lg font-black text-white">{subLaw.entitiesCount}</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">Entities Involved</p>
        </div>
      </div>

      {/* RI Analysis Insight Card */}
      <div className="bg-gradient-to-br from-cyan-950/40 via-slate-900/60 to-slate-950/80 border border-cyan-500/20 rounded-2xl p-3.5 mt-auto">
        <div className="flex items-center gap-1.5 text-cyan-300 text-xs font-bold mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>RI Analysis</span>
        </div>
        <h4 className="text-xs font-semibold text-white mb-1">Propose De-regulation</h4>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          {subLaw.description}
        </p>
      </div>
    </aside>
  );
}
