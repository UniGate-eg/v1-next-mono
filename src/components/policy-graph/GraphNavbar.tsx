'use client';

import React from 'react';
import { ViewMode } from './types';
import { Network, GitFork, Plus, Minus, Filter, ArrowUpDown, Sparkles, Moon, Search, Menu } from 'lucide-react';

interface GraphNavbarProps {
  viewMode: ViewMode;
  onToggleViewMode: (mode: ViewMode) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onOpenSimulation: () => void;
}

export default function GraphNavbar({
  viewMode,
  onToggleViewMode,
  onZoomIn,
  onZoomOut,
  onResetView,
  onOpenSimulation,
}: GraphNavbarProps) {
  return (
    <header className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
      {/* Left: Menu + Brand Logo */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <button
          className="p-2 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-all shadow-lg shadow-black/40"
          title="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          onClick={onResetView}
          className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/10 text-white cursor-pointer hover:border-amber-400/30 transition-all shadow-lg shadow-black/40 group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-200 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-slate-950 fill-slate-950" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-tight">
              <span className="font-bold tracking-wide text-sm text-slate-100">Control</span>
              <span className="text-xs font-semibold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">AI</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Policy Platform</span>
          </div>
        </div>
      </div>

      {/* Center: Graph/Tree Switcher & Canvas Controls */}
      <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/70 backdrop-blur-md border border-white/10 p-1 rounded-2xl shadow-xl shadow-black/50">
        {/* Network Graph vs Tree Toggle */}
        <div className="flex items-center bg-slate-950/60 rounded-xl p-0.5 border border-white/5">
          <button
            onClick={() => onToggleViewMode('constellation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'constellation'
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-400/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Constellation Network View"
          >
            <Network className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleViewMode('drilldown')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'drilldown'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Hierarchical Tree View"
          >
            <GitFork className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={onZoomIn}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={onZoomOut}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Filter & Sort */}
        <button
          className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          title="Filter Legislation"
        >
          <Filter className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-[10px] font-bold text-slate-950 rounded-full flex items-center justify-center border border-slate-900">
            5
          </span>
        </button>

        <button
          className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          title="Sort Decrees"
        >
          <ArrowUpDown className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-[10px] font-bold text-slate-950 rounded-full flex items-center justify-center border border-slate-900">
            2
          </span>
        </button>

        <button
          className="p-2 rounded-lg text-amber-300 hover:text-amber-200 hover:bg-amber-400/10 transition-colors"
          title="AI Policy Insights"
        >
          <Sparkles className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Simulation Action + Tools + Profile */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <button
          onClick={onOpenSimulation}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 backdrop-blur-md border border-white/15 text-slate-200 hover:text-white text-xs font-semibold tracking-wide transition-all shadow-lg hover:border-amber-400/40 active:scale-98"
        >
          <Plus className="w-3.5 h-3.5 text-amber-400" />
          <span>New Simulation</span>
        </button>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-lg shadow-black/40">
          <button className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors">
            <Moon className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors">
            <Search className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/20 ml-1">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="User profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
