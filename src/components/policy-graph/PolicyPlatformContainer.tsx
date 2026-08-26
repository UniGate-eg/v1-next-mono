'use client';

import React, { useState } from 'react';
import { ViewMode, DomainNode, SubLawItem, CategoryBranch } from './types';
import { DOMAIN_NODES, CATEGORY_BRANCHES, SUB_LAWS_LIST, KPI_YEAR_DATA } from './mock-data';
import PolicyGraphEngine from './PolicyGraphEngine';
import GraphNavbar from './GraphNavbar';
import TimelineRuler from './TimelineRuler';
import GraphLegend from './GraphLegend';
import AiPromptBar from './AiPromptBar';
import InspectorDrawer from './InspectorDrawer';
import BranchCardsOverlay from './BranchCardsOverlay';

export default function PolicyPlatformContainer() {
  const [viewMode, setViewMode] = useState<ViewMode>('constellation');
  const [selectedDomain, setSelectedDomain] = useState<DomainNode | null>(DOMAIN_NODES[5]); // Healthcare
  const [selectedBranch, setSelectedBranch] = useState<CategoryBranch>(CATEGORY_BRANCHES[2]); // Related Federal Laws
  const [selectedSubLaw, setSelectedSubLaw] = useState<SubLawItem | null>(SUB_LAWS_LIST[0]); // Decree-Law 42
  const [selectedYear, setSelectedYear] = useState<number>(2020);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(true);
  const [simulationModalOpen, setSimulationModalOpen] = useState<boolean>(false);

  // Dynamic KPI stats based on selected year
  const currentKPIs = KPI_YEAR_DATA[selectedYear] || KPI_YEAR_DATA[2020];

  const handleSelectDomain = (domain: DomainNode) => {
    setSelectedDomain(domain);
    setViewMode('drilldown');
    setIsInspectorOpen(true);
  };

  const handleSelectSubLaw = (subLaw: SubLawItem) => {
    setSelectedSubLaw(subLaw);
    setIsInspectorOpen(true);
  };

  const handleTriggerAnalysis = (targetLawId?: string) => {
    if (targetLawId) {
      const found = SUB_LAWS_LIST.find((s) => s.id === targetLawId);
      if (found) setSelectedSubLaw(found);
    }
    setViewMode('drilldown');
    setIsInspectorOpen(true);
  };

  const handleResetView = () => {
    setViewMode('constellation');
    setZoomLevel(1.0);
  };

  return (
    <div className="relative w-full h-screen bg-[#04080b] text-slate-100 overflow-hidden font-sans select-none">
      {/* 1. Top Glass Navigation Bar */}
      <GraphNavbar
        viewMode={viewMode}
        onToggleViewMode={(mode) => setViewMode(mode)}
        onZoomIn={() => setZoomLevel((z) => Math.min(1.8, +(z + 0.15).toFixed(2)))}
        onZoomOut={() => setZoomLevel((z) => Math.max(0.6, +(z - 0.15).toFixed(2)))}
        onResetView={handleResetView}
        onOpenSimulation={() => setSimulationModalOpen(true)}
      />

      {/* 2. Interactive Canvas 2D Engine (Particles, Beams, Orbs, Bezier curves, Photons) */}
      <div className="absolute inset-0 z-0">
        <PolicyGraphEngine
          viewMode={viewMode}
          selectedDomain={selectedDomain}
          selectedBranch={selectedBranch}
          selectedSubLaw={selectedSubLaw}
          onSelectDomain={handleSelectDomain}
          onSelectSubLaw={handleSelectSubLaw}
          onSelectBranch={setSelectedBranch}
          zoomLevel={zoomLevel}
        />
      </div>

      {/* 3. Left Timeline Ruler with Animated Equalizer Waveforms */}
      <TimelineRuler
        selectedYear={selectedYear}
        onSelectYear={(yr) => setSelectedYear(yr)}
      />

      {/* 4. First-Tier Category Cards in Drill-down Mode */}
      <BranchCardsOverlay
        selectedBranch={selectedBranch}
        onSelectBranch={setSelectedBranch}
        visible={viewMode === 'drilldown'}
      />

      {/* 5. Bottom Left Taxonomy Legend */}
      <GraphLegend />

      {/* 6. Bottom AI Copilot Prompt Bar + Live KPIs */}
      <AiPromptBar
        kpiMetrics={currentKPIs}
        onTriggerAnalysis={handleTriggerAnalysis}
        onSearchQuery={(q) => {
          if (q.toLowerCase().includes('42') || q.toLowerCase().includes('mental')) {
            setViewMode('drilldown');
          }
        }}
      />

      {/* 7. Right Dossier Inspector Drawer */}
      {isInspectorOpen && viewMode === 'drilldown' && (
        <InspectorDrawer
          subLaw={selectedSubLaw}
          onClose={() => setIsInspectorOpen(false)}
          onExploreDetails={(item) => {
            alert(`Opening in-depth policy documentation for: ${item.title}`);
          }}
        />
      )}

      {/* Simulation Modal (Demo Dialog) */}
      {simulationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-white mb-2">New Policy Impact Simulation</h3>
            <p className="text-xs text-slate-400 mb-4">
              Simulate legislative deregulation, compliance risk models, or sector-wide impact forecasting.
            </p>
            <div className="space-y-3 mb-5">
              <label className="block text-xs font-semibold text-slate-300">Target Legislative Domain</label>
              <select className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white">
                <option>Federal Decree-Law No. (42) of 2022</option>
                <option>Healthcare Compliance Standards 2024</option>
                <option>Digital Banking & Escrow Regulations</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSimulationModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setSimulationModalOpen(false);
                  setViewMode('drilldown');
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-xs font-bold text-slate-950 hover:brightness-110"
              >
                Run Simulation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
