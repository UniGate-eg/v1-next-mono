'use client';

import React from 'react';
import { Landmark, RefreshCw } from 'lucide-react';

export default function GraphLegend() {
  const legendItems = [
    { label: 'Constitution', count: 1, color: '#f59e0b', ring: 'border-amber-400' },
    { label: 'Entities', count: 11, color: '#c084fc', ring: 'border-purple-400' },
    { label: 'Legislation', count: 18, color: '#818cf8', ring: 'border-indigo-400' },
    { label: 'Services', count: 53, color: '#34d399', ring: 'border-emerald-400' },
    { label: 'Regulations', count: 61, color: '#38bdf8', ring: 'border-cyan-400' },
  ];

  return (
    <div className="absolute bottom-6 left-6 z-20 bg-slate-950/70 backdrop-blur-xl border border-white/10 p-3.5 rounded-2xl shadow-2xl shadow-black/60 select-none pointer-events-auto min-w-[155px]">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 px-0.5">
        Legend
      </div>

      <div className="space-y-1.5">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-xs text-slate-300">
            <span
              style={{ backgroundColor: item.color }}
              className="w-4 h-4 rounded-full text-[9px] font-bold text-slate-950 flex items-center justify-center shadow-sm"
            >
              {item.count}
            </span>
            <span className="text-[11px] text-slate-300 font-medium">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="my-2.5 h-px bg-white/10" />

      {/* GAPS & Updates Stats */}
      <div className="space-y-1.5 pt-0.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Landmark className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-medium text-slate-300">GAPS</span>
          </div>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
            32%
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-medium text-slate-300">Updates</span>
          </div>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
            56%
          </span>
        </div>
      </div>
    </div>
  );
}
