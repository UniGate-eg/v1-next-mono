'use client';

import React, { useState } from 'react';
import { GraphKPIMetrics, RIConcern } from './types';
import { RI_CONCERNS } from './mock-data';
import { Send, Sparkles, TrendingUp, BookOpen, Users, ThumbsUp, History, ChevronDown, ArrowUpRight, X } from 'lucide-react';

interface AiPromptBarProps {
  kpiMetrics: GraphKPIMetrics;
  onTriggerAnalysis: (targetLawId?: string) => void;
  onSearchQuery: (query: string) => void;
}

export default function AiPromptBar({
  kpiMetrics,
  onTriggerAnalysis,
  onSearchQuery,
}: AiPromptBarProps) {
  const [inputValue, setInputValue] = useState('');
  const [isRiModalOpen, setIsRiModalOpen] = useState(false);

  const handleSelectConcern = (concern: RIConcern) => {
    setInputValue(`Analyze ${concern.lawName}`);
    setIsRiModalOpen(false);
    onTriggerAnalysis(concern.targetLawId);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onSearchQuery(inputValue);
    // If user queries decree 42 or civil code, trigger drilldown
    if (inputValue.toLowerCase().includes('42') || inputValue.toLowerCase().includes('civil') || inputValue.toLowerCase().includes('decree')) {
      onTriggerAnalysis('law-42');
    }
  };

  return (
    <div className="absolute bottom-6 right-6 left-52 md:left-auto md:w-[740px] z-30 flex flex-col gap-2 select-none pointer-events-auto">
      {/* ─────────────────────────────────────────────────────────────
          EXPANDING AI INSIGHTS CARD (RI ANALYSIS)
          ───────────────────────────────────────────────────────────── */}
      {isRiModalOpen && (
        <div className="w-full bg-slate-950/85 backdrop-blur-2xl border border-cyan-500/30 rounded-3xl p-5 shadow-2xl shadow-cyan-950/50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                RI Analysis Recommendations
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/20">
                +3 Insights
              </span>
              <button
                onClick={() => setIsRiModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {RI_CONCERNS.map((concern) => {
              const isCritical = concern.type === 'critical';
              return (
                <div
                  key={concern.id}
                  onClick={() => handleSelectConcern(concern)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer group ${
                    isCritical
                      ? 'bg-gradient-to-r from-red-950/30 to-slate-900/40 border-red-500/30 hover:border-red-400/60 hover:bg-red-950/40'
                      : 'bg-gradient-to-r from-cyan-950/30 to-slate-900/40 border-cyan-500/30 hover:border-cyan-400/60 hover:bg-cyan-950/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          isCritical
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}
                      >
                        [ {concern.title} ]
                      </span>
                      <span className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                        {concern.lawName}
                      </span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                    {concern.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MAIN AI COPILOT & STATS CAPSULE
          ───────────────────────────────────────────────────────────── */}
      <div className="w-full bg-slate-950/80 backdrop-blur-2xl border border-white/15 rounded-3xl p-3 shadow-2xl shadow-black/80 flex flex-col gap-2.5">
        {/* Top Tier: Live 4-Column KPI Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-2 py-1 border-b border-white/10 text-xs">
          {/* 1. Compliance Rate */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400">Compliance Rate</span>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-white text-xs">{kpiMetrics.complianceRate}%</span>
                <span className="text-[9px] text-emerald-400 font-medium">↑</span>
              </div>
            </div>
          </div>

          {/* 2. Total Laws */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400">Total Laws</span>
              <span className="font-bold text-white text-xs">{kpiMetrics.totalLaws}</span>
            </div>
          </div>

          {/* 3. Public Engagement */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Users className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400">Public Engagement</span>
              <span className="font-bold text-white text-xs">{kpiMetrics.publicEngagement}</span>
            </div>
          </div>

          {/* 4. Implementation Rate */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ThumbsUp className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400">Implementation Rate</span>
              <span className="font-bold text-white text-xs">{kpiMetrics.implementationRate}%</span>
            </div>
          </div>
        </div>

        {/* Bottom Tier: Search Input + Agent Selector + RI Analysis */}
        <form onSubmit={handleSend} className="flex flex-col sm:flex-row items-center gap-2">
          {/* Input Box */}
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a question or analyze legislation..."
              className="w-full bg-slate-900/90 text-slate-100 text-xs px-4 py-2.5 rounded-2xl border border-white/10 placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30 transition-all pr-10 shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Actions & Agent Toggle */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 text-xs font-medium hover:border-white/20 transition-colors"
            >
              <span className="text-cyan-400 font-bold">+</span>
              <span>My agent</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            <button
              type="button"
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-slate-400 hover:text-slate-200 text-xs transition-colors"
              title="Recent queries"
            >
              <History className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold">+3</span>
            </button>

            {/* Glowing RI Analysis Button */}
            <button
              type="button"
              onClick={() => setIsRiModalOpen(!isRiModalOpen)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all shadow-md active:scale-95 ${
                isRiModalOpen
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-cyan-500/40 border border-white/40'
                  : 'bg-slate-900/90 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 hover:bg-cyan-950/40 shadow-cyan-950/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 fill-cyan-300/30" />
              <span>RI Analysis</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
