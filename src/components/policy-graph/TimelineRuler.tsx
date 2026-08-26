'use client';

import React from 'react';
import { TIMELINE_YEARS } from './mock-data';

interface TimelineRulerProps {
  selectedYear: number;
  onSelectYear: (year: number) => void;
}

export default function TimelineRuler({
  selectedYear,
  onSelectYear,
}: TimelineRulerProps) {
  return (
    <aside className="absolute left-6 top-1/2 -translate-y-1/2 z-20 flex items-center gap-3 select-none pointer-events-auto">
      {/* Animated Audio Equalizer Waveform Density Track */}
      <div className="flex flex-col items-end gap-1.5 py-4">
        {TIMELINE_YEARS.map((year) => {
          const isSelected = year === selectedYear;
          // Generate realistic varying bar lengths
          const barCount = 5;
          return (
            <div
              key={`bars-${year}`}
              className="flex items-center gap-0.5 h-7 cursor-pointer group"
              onClick={() => onSelectYear(year)}
            >
              {Array.from({ length: barCount }).map((_, barIdx) => {
                const heightSeed = ((year * 13 + barIdx * 17) % 18) + 4;
                return (
                  <div
                    key={barIdx}
                    style={{
                      height: `${isSelected ? heightSeed * 1.5 : heightSeed}px`,
                    }}
                    className={`w-0.5 rounded-full transition-all duration-300 ${
                      isSelected
                        ? 'bg-amber-400 opacity-90 shadow-sm shadow-amber-400/50'
                        : 'bg-slate-600 opacity-40 group-hover:bg-slate-400 group-hover:opacity-75'
                    }`}
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Vertical Track Line with Year Buttons */}
      <div className="relative flex flex-col items-center gap-3">
        {/* Subtle vertical spine line */}
        <div className="absolute top-2 bottom-2 w-px bg-white/10" />

        {TIMELINE_YEARS.map((year) => {
          const isSelected = year === selectedYear;
          return (
            <button
              key={year}
              onClick={() => onSelectYear(year)}
              className={`relative z-10 transition-all duration-300 flex items-center justify-center font-medium ${
                isSelected
                  ? 'px-3 py-1 rounded-full bg-slate-900/90 text-amber-300 font-bold text-xs border border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-110'
                  : 'text-[11px] text-slate-500 hover:text-slate-300 px-2 py-0.5'
              }`}
            >
              {year}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
