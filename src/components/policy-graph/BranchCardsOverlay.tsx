'use client';

import React from 'react';
import { CategoryBranch } from './types';
import { CATEGORY_BRANCHES } from './mock-data';
import { Briefcase, Calendar, Scale, Shield, FileText } from 'lucide-react';

interface BranchCardsOverlayProps {
  selectedBranch: CategoryBranch;
  onSelectBranch: (branch: CategoryBranch) => void;
  visible: boolean;
}

export default function BranchCardsOverlay({
  selectedBranch,
  onSelectBranch,
  visible,
}: BranchCardsOverlayProps) {
  if (!visible) return null;

  const getBranchIcon = (icon: CategoryBranch['icon']) => {
    switch (icon) {
      case 'services':
        return <Briefcase className="w-4 h-4 text-cyan-400" />;
      case 'entities':
        return <Calendar className="w-4 h-4 text-purple-400" />;
      case 'laws':
        return <Scale className="w-4 h-4 text-amber-400" />;
      case 'kpis':
        return <Shield className="w-4 h-4 text-emerald-400" />;
      case 'regulations':
        return <FileText className="w-4 h-4 text-blue-400" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="absolute left-[24%] md:left-[28%] top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3.5 select-none pointer-events-auto animate-in fade-in zoom-in-95 duration-300">
      {CATEGORY_BRANCHES.map((branch) => {
        const isSelected = branch.id === selectedBranch.id;
        return (
          <button
            key={branch.id}
            onClick={() => onSelectBranch(branch)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl backdrop-blur-xl transition-all duration-300 shadow-xl group text-left min-w-[210px] ${
              isSelected
                ? 'bg-slate-900/90 border-2 border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.25)] scale-105'
                : 'bg-slate-950/60 border border-white/10 hover:border-white/25 hover:bg-slate-900/70'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                isSelected
                  ? 'bg-amber-400/20 shadow-inner'
                  : 'bg-white/5 group-hover:bg-white/10'
              }`}
            >
              {getBranchIcon(branch.icon)}
            </div>

            <div className="flex items-baseline gap-2">
              <span className={`text-base font-black ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                {branch.count}
              </span>
              <span className={`text-xs font-semibold ${isSelected ? 'text-slate-100' : 'text-slate-400 group-hover:text-slate-300'}`}>
                {branch.label}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
