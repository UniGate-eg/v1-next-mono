'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { ViewMode, DomainNode, SubLawItem, CategoryBranch } from './types';
import { CONSTITUTION_NODE, DOMAIN_NODES, CATEGORY_BRANCHES, SUB_LAWS_LIST } from './mock-data';

interface PolicyGraphEngineProps {
  viewMode: ViewMode;
  selectedDomain: DomainNode | null;
  selectedBranch: CategoryBranch | null;
  selectedSubLaw: SubLawItem | null;
  onSelectDomain: (domain: DomainNode) => void;
  onSelectSubLaw: (subLaw: SubLawItem) => void;
  onSelectBranch: (branch: CategoryBranch) => void;
  zoomLevel: number;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  speed: number;
  phase: number;
}

interface Photon {
  pathIndex: number;
  progress: number;
  speed: number;
  color: string;
}

export default function PolicyGraphEngine({
  viewMode,
  selectedDomain,
  selectedBranch,
  selectedSubLaw,
  onSelectDomain,
  onSelectSubLaw,
  onSelectBranch,
  zoomLevel,
}: PolicyGraphEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Camera state for smooth pan/zoom interpolation
  const cameraRef = useRef({
    x: 0,
    y: 0,
    zoom: 1,
    targetX: 0,
    targetY: 0,
    targetZoom: 1,
  });

  const mouseRef = useRef({
    x: 0,
    y: 0,
    isHoveringNode: false,
    hoveredNodeId: null as string | null,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
  });

  const particlesRef = useRef<Particle[]>([]);
  const photonsRef = useRef<Photon[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  // Initialize particle starfield
  useEffect(() => {
    const particles: Particle[] = [];
    for (let i = 0; i < 160; i++) {
      particles.push({
        x: Math.random() * 2000 - 1000,
        y: Math.random() * 2000 - 1000,
        size: Math.random() * 2 + 0.6,
        baseAlpha: Math.random() * 0.6 + 0.2,
        alpha: Math.random() * 0.6 + 0.2,
        speed: Math.random() * 0.02 + 0.005,
        phase: Math.random() * Math.PI * 2,
      });
    }
    particlesRef.current = particles;

    // Initialize traveling photons for the fiber-optic arc
    const photons: Photon[] = [];
    for (let i = 0; i < 28; i++) {
      photons.push({
        pathIndex: Math.floor(Math.random() * SUB_LAWS_LIST.length),
        progress: Math.random(),
        speed: 0.004 + Math.random() * 0.006,
        color: ['#fbbf24', '#38bdf8', '#34d399', '#f472b6', '#e879f9'][i % 5],
      });
    }
    photonsRef.current = photons;
  }, []);

  // Update target camera based on viewMode & zoomLevel
  useEffect(() => {
    if (viewMode === 'constellation') {
      cameraRef.current.targetX = 0;
      cameraRef.current.targetY = 0;
      cameraRef.current.targetZoom = zoomLevel;
    } else if (viewMode === 'drilldown') {
      // Offset slightly to the left to make room for inspector drawer on the right
      cameraRef.current.targetX = -120;
      cameraRef.current.targetY = 0;
      cameraRef.current.targetZoom = zoomLevel * 1.05;
    } else {
      cameraRef.current.targetX = 0;
      cameraRef.current.targetY = 0;
      cameraRef.current.targetZoom = zoomLevel;
    }
  }, [viewMode, zoomLevel, selectedDomain]);

  // Main rendering loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    timeRef.current += 0.016;
    const time = timeRef.current;

    // Smooth camera interpolation (lerp)
    const cam = cameraRef.current;
    cam.x += (cam.targetX - cam.x) * 0.08;
    cam.y += (cam.targetY - cam.y) * 0.08;
    cam.zoom += (cam.targetZoom - cam.zoom) * 0.08;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2 + cam.x;
    const centerY = height / 2 + cam.y;
    const scale = (Math.min(width, height) / 950) * cam.zoom;

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Deep Space Gradient
    const bgGrad = ctx.createRadialGradient(
      centerX, centerY, 50 * scale,
      centerX, centerY, Math.max(width, height) * 0.85
    );
    bgGrad.addColorStop(0, '#0d222b');
    bgGrad.addColorStop(0.35, '#07161c');
    bgGrad.addColorStop(0.7, '#040b0e');
    bgGrad.addColorStop(1, '#020507');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Twinkling Particle Starfield
    particlesRef.current.forEach((p) => {
      p.phase += p.speed;
      const alpha = p.baseAlpha + Math.sin(p.phase) * 0.25;
      const px = centerX + p.x * scale;
      const py = centerY + p.y * scale;

      if (px >= 0 && px <= width && py >= 0 && py <= height) {
        ctx.beginPath();
        ctx.arc(px, py, p.size * Math.max(0.8, scale * 0.7), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 230, 255, ${Math.max(0, Math.min(1, alpha))})`;
        ctx.fill();
      }
    });

    // ─────────────────────────────────────────────────────────────
    // MODE 1: COSMIC CONSTELLATION VIEW
    // ─────────────────────────────────────────────────────────────
    if (viewMode === 'constellation' || viewMode === 'tree') {
      const constX = centerX;
      const constY = centerY;

      // Draw Volumetric Rays from Center Star to Domain Nodes
      DOMAIN_NODES.forEach((node) => {
        const nx = centerX + node.x * 550 * scale;
        const ny = centerY + node.y * 480 * scale;

        // Radiating light cone / beam
        const beamGrad = ctx.createLinearGradient(constX, constY, nx, ny);
        beamGrad.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
        beamGrad.addColorStop(0.4, 'rgba(245, 158, 11, 0.18)');
        beamGrad.addColorStop(0.85, `${node.glowColor.replace(/[\d.]+\)$/, '0.22)')}`);
        beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        // Draw luminous beam
        ctx.beginPath();
        ctx.moveTo(constX, constY);
        ctx.lineTo(nx + Math.sin(time + node.x) * 4, ny + Math.cos(time + node.y) * 4);
        ctx.lineWidth = 3.5 * scale;
        ctx.strokeStyle = beamGrad;
        ctx.stroke();

        // Pulsing light traveling along the beam
        const pulseProgress = (time * 0.4 + Math.abs(node.x) * 3) % 1;
        const pulseX = constX + (nx - constX) * pulseProgress;
        const pulseY = constY + (ny - constY) * pulseProgress;

        const pulseGlow = ctx.createRadialGradient(pulseX, pulseY, 0, pulseX, pulseY, 14 * scale);
        pulseGlow.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        pulseGlow.addColorStop(0.4, node.color);
        pulseGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(pulseX, pulseY, 14 * scale, 0, Math.PI * 2);
        ctx.fillStyle = pulseGlow;
        ctx.fill();

        // Secondary satellite lines
        node.subNodes.forEach((sub) => {
          const subDist = sub.distance * 1.6 * scale;
          const subAngle = Math.atan2(ny - constY, nx - constX) + sub.angleOffset;
          const sx = nx + Math.cos(subAngle) * subDist;
          const sy = ny + Math.sin(subAngle) * subDist;

          ctx.beginPath();
          ctx.setLineDash([3, 4]);
          ctx.moveTo(nx, ny);
          ctx.lineTo(sx, sy);
          ctx.lineWidth = 1.2 * scale;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
          ctx.stroke();
          ctx.setLineDash([]);

          // Satellite mini orb
          ctx.beginPath();
          ctx.arc(sx, sy, 8 * scale, 0, Math.PI * 2);
          ctx.fillStyle = sub.color;
          ctx.fill();

          // Satellite count badge text
          ctx.font = `${Math.max(9, 10 * scale)}px Inter, system-ui, sans-serif`;
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(sub.count.toString(), sx, sy);
        });

        // 3D Glass Domain Orb
        const isHovered = mouseRef.current.hoveredNodeId === node.id;
        const orbRadius = (node.radius + (isHovered ? 4 : 0)) * scale;

        // Outer Aura Ring
        ctx.beginPath();
        ctx.arc(nx, ny, orbRadius * 1.7, 0, Math.PI * 2);
        ctx.fillStyle = node.glowColor;
        ctx.fill();

        // Multi-ring frequency ring
        ctx.beginPath();
        ctx.arc(nx, ny, orbRadius * 1.3, 0, Math.PI * 2);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.25 + Math.sin(time * 2 + node.percentage) * 0.15})`;
        ctx.stroke();

        // 3D Spherical Sphere
        const orbGrad = ctx.createRadialGradient(
          nx - orbRadius * 0.35, ny - orbRadius * 0.35, orbRadius * 0.1,
          nx, ny, orbRadius
        );
        orbGrad.addColorStop(0, '#ffffff');
        orbGrad.addColorStop(0.3, node.color);
        orbGrad.addColorStop(0.85, '#1e102f');
        orbGrad.addColorStop(1, '#080511');

        ctx.beginPath();
        ctx.arc(nx, ny, orbRadius, 0, Math.PI * 2);
        ctx.fillStyle = orbGrad;
        ctx.fill();

        // Specular highlight rim
        ctx.beginPath();
        ctx.arc(nx, ny, orbRadius, 0, Math.PI * 2);
        ctx.lineWidth = 1.8 * scale;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.stroke();

        // Node Title & Percentage
        ctx.font = `600 ${Math.max(11, 12 * scale)}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, nx, ny + orbRadius + 16 * scale);

        // Percentage badge pill
        ctx.font = `500 ${Math.max(9, 10 * scale)}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText(`${node.percentage}%`, nx, ny + orbRadius + 30 * scale);
      });

      // Draw Center Sun ("Constitution")
      const constRadius = CONSTITUTION_NODE.radius * scale;

      // Volumetric Corona Waves
      for (let r = 3; r >= 1; r--) {
        const coronaGrad = ctx.createRadialGradient(
          constX, constY, constRadius * 0.5,
          constX, constY, constRadius * (2.8 + r * 0.6 + Math.sin(time * 2 + r) * 0.2)
        );
        coronaGrad.addColorStop(0, 'rgba(251, 191, 36, 0.6)');
        coronaGrad.addColorStop(0.4, 'rgba(245, 158, 11, 0.25)');
        coronaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(constX, constY, constRadius * (2.8 + r * 0.6), 0, Math.PI * 2);
        ctx.fillStyle = coronaGrad;
        ctx.fill();
      }

      // Radiating sun spikes
      ctx.save();
      ctx.translate(constX, constY);
      ctx.rotate(time * 0.05);
      const spikes = 28;
      for (let i = 0; i < spikes; i++) {
        const angle = (i / spikes) * Math.PI * 2;
        const spikeLen = constRadius * (1.6 + Math.sin(i * 3 + time * 3) * 0.25);
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * constRadius, Math.sin(angle) * constRadius);
        ctx.lineTo(Math.cos(angle) * spikeLen, Math.sin(angle) * spikeLen);
        ctx.lineWidth = 1.5 * scale;
        ctx.strokeStyle = 'rgba(253, 230, 138, 0.4)';
        ctx.stroke();
      }
      ctx.restore();

      // Central Orb Sphere
      const sunGrad = ctx.createRadialGradient(
        constX - constRadius * 0.3, constY - constRadius * 0.3, constRadius * 0.1,
        constX, constY, constRadius
      );
      sunGrad.addColorStop(0, '#fffbeb');
      sunGrad.addColorStop(0.2, '#fde68a');
      sunGrad.addColorStop(0.6, '#f59e0b');
      sunGrad.addColorStop(1, '#92400e');

      ctx.beginPath();
      ctx.arc(constX, constY, constRadius, 0, Math.PI * 2);
      ctx.fillStyle = sunGrad;
      ctx.fill();

      // Sun Outer Ring
      ctx.beginPath();
      ctx.arc(constX, constY, constRadius, 0, Math.PI * 2);
      ctx.lineWidth = 2 * scale;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.stroke();

      // Constitution Label
      ctx.font = `700 ${Math.max(13, 14 * scale)}px Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('Constitution', constX, constY + constRadius + 18 * scale);

      ctx.font = `500 ${Math.max(10, 11 * scale)}px Inter, system-ui, sans-serif`;
      ctx.fillStyle = 'rgba(253, 230, 138, 0.9)';
      ctx.fillText('47%', constX, constY + constRadius + 32 * scale);
    }

    // ─────────────────────────────────────────────────────────────
    // MODE 2: DRILL-DOWN RADIAL FAN-OUT VIEW
    // ─────────────────────────────────────────────────────────────
    if (viewMode === 'drilldown') {
      const orbX = centerX - 320 * scale;
      const orbY = centerY;
      const orbRadius = 38 * scale;

      // 1. Oscillating Sonic Frequency Waveform Ring around focused orb
      const wavePoints = 72;
      ctx.beginPath();
      for (let i = 0; i <= wavePoints; i++) {
        const angle = (i / wavePoints) * Math.PI * 2;
        const waveFreq = Math.sin(angle * 8 + time * 6) * Math.cos(angle * 4 - time * 3);
        const waveAmp = 9 * scale * waveFreq;
        const r = orbRadius * 1.55 + waveAmp;
        const wx = orbX + Math.cos(angle) * r;
        const wy = orbY + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      }
      ctx.closePath();
      ctx.lineWidth = 2 * scale;
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.7)';
      ctx.stroke();

      // Outer second frequency ring
      ctx.beginPath();
      for (let i = 0; i <= wavePoints; i++) {
        const angle = (i / wavePoints) * Math.PI * 2;
        const waveFreq = Math.sin(angle * 6 - time * 4) * Math.cos(angle * 3 + time * 5);
        const waveAmp = 14 * scale * waveFreq;
        const r = orbRadius * 1.95 + waveAmp;
        const wx = orbX + Math.cos(angle) * r;
        const wy = orbY + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      }
      ctx.closePath();
      ctx.lineWidth = 1.5 * scale;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.stroke();

      // Focused Law Orb (3D Sphere)
      const lawOrbGrad = ctx.createRadialGradient(
        orbX - orbRadius * 0.35, orbY - orbRadius * 0.35, orbRadius * 0.1,
        orbX, orbY, orbRadius
      );
      lawOrbGrad.addColorStop(0, '#ffffff');
      lawOrbGrad.addColorStop(0.3, '#c084fc');
      lawOrbGrad.addColorStop(0.7, '#6b21a8');
      lawOrbGrad.addColorStop(1, '#2e1065');

      ctx.beginPath();
      ctx.arc(orbX, orbY, orbRadius, 0, Math.PI * 2);
      ctx.fillStyle = lawOrbGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(orbX, orbY, orbRadius, 0, Math.PI * 2);
      ctx.lineWidth = 2 * scale;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.stroke();

      // Law Title above orb
      ctx.font = `600 ${Math.max(13, 14 * scale)}px Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('Federal Decree-Law', orbX, orbY - orbRadius - 38 * scale);

      ctx.font = `500 ${Math.max(11, 12 * scale)}px Inter, system-ui, sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText('No. 45 of 2021', orbX, orbY - orbRadius - 20 * scale);

      // GAPS badge below orb
      ctx.font = `600 ${Math.max(10, 11 * scale)}px Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('GAPS 12', orbX, orbY + orbRadius + 24 * scale);

      // 2. First-Tier Branch Connectors (Bezier cables from Orb to 5 Category Cards)
      const branchStartX = orbX + orbRadius + 10 * scale;
      const branchCardsX = orbX + 160 * scale;
      const cardHeight = 44 * scale;
      const cardSpacing = 16 * scale;
      const totalBranchHeight = CATEGORY_BRANCHES.length * cardHeight + (CATEGORY_BRANCHES.length - 1) * cardSpacing;
      const startBranchY = orbY - totalBranchHeight / 2 + cardHeight / 2;

      CATEGORY_BRANCHES.forEach((branch, idx) => {
        const cardY = startBranchY + idx * (cardHeight + cardSpacing);
        const isActive = branch.id === (selectedBranch?.id || 'laws');

        // Draw Bezier cable from Orb to Category Card
        ctx.beginPath();
        ctx.moveTo(branchStartX, orbY);
        ctx.bezierCurveTo(
          branchStartX + 70 * scale, orbY,
          branchCardsX - 60 * scale, cardY,
          branchCardsX, cardY
        );
        ctx.lineWidth = (isActive ? 2.5 : 1.2) * scale;
        ctx.strokeStyle = isActive ? 'rgba(251, 191, 36, 0.75)' : 'rgba(255, 255, 255, 0.2)';
        ctx.stroke();

        // 3. If Active Branch ("24 Related Federal Laws"), Fan out to Sub-Law Arc!
        if (isActive) {
          const fanOriginX = branchCardsX + 160 * scale;
          const fanOriginY = cardY;
          const arcTargetX = centerX + 180 * scale;
          const arcSpreadY = 460 * scale;

          // Draw Glowing Luminous Fiber-Optic Arc Cables
          SUB_LAWS_LIST.forEach((subLaw, subIdx) => {
            const normalizedY = (subIdx / (SUB_LAWS_LIST.length - 1) - 0.5);
            const targetY = centerY + normalizedY * arcSpreadY;
            // Radial parabolic arc curve
            const curvePullX = fanOriginX + 180 * scale + (1 - Math.abs(normalizedY * 2)) * 60 * scale;

            const isSubSelected = subLaw.id === (selectedSubLaw?.id || 'law-42');

            // Fiber optic bezier path
            ctx.beginPath();
            ctx.moveTo(fanOriginX, fanOriginY);
            ctx.bezierCurveTo(
              fanOriginX + 90 * scale, fanOriginY,
              curvePullX, targetY,
              arcTargetX, targetY
            );
            ctx.lineWidth = (isSubSelected ? 2.8 : 1.4) * scale;

            // Gradient stroke for fiber optic look
            const fiberGrad = ctx.createLinearGradient(fanOriginX, fanOriginY, arcTargetX, targetY);
            fiberGrad.addColorStop(0, 'rgba(251, 191, 36, 0.85)');
            fiberGrad.addColorStop(0.35, isSubSelected ? 'rgba(56, 189, 248, 0.85)' : 'rgba(52, 211, 153, 0.45)');
            fiberGrad.addColorStop(1, isSubSelected ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.25)');
            ctx.strokeStyle = fiberGrad;
            ctx.stroke();

            // Terminal End Node Orb
            const endNodeRadius = (isSubSelected ? 7 : 4.5) * scale;
            ctx.beginPath();
            ctx.arc(arcTargetX, targetY, endNodeRadius, 0, Math.PI * 2);
            ctx.fillStyle = isSubSelected ? '#fbbf24' : '#38bdf8';
            ctx.fill();

            // Outer terminal glow
            if (isSubSelected) {
              ctx.beginPath();
              ctx.arc(arcTargetX, targetY, endNodeRadius * 2.2, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
              ctx.fill();
            }

            // Sub-Law text labels beside terminal node
            ctx.font = `${isSubSelected ? '600' : '400'} ${Math.max(10, 11 * scale)}px Inter, system-ui, sans-serif`;
            ctx.fillStyle = isSubSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.7)';
            ctx.textAlign = 'left';
            const shortTitle = subLaw.title.length > 28 ? subLaw.title.slice(0, 26) + '...' : subLaw.title;
            ctx.fillText(shortTitle, arcTargetX + 12 * scale, targetY + 3 * scale);

            // GAPS Tag
            ctx.font = `500 ${Math.max(8, 9 * scale)}px Inter, system-ui, sans-serif`;
            ctx.fillStyle = subLaw.gaps > 15 ? '#ef4444' : subLaw.gaps > 10 ? '#f59e0b' : '#10b981';
            ctx.fillText(`GAPS ${subLaw.gaps}%`, arcTargetX + 12 * scale, targetY + 15 * scale);
          });

          // Draw Traveling Photons along the Fiber-Optic Arcs
          photonsRef.current.forEach((photon) => {
            photon.progress = (photon.progress + photon.speed) % 1;
            const subIdx = photon.pathIndex % SUB_LAWS_LIST.length;
            const normalizedY = (subIdx / (SUB_LAWS_LIST.length - 1) - 0.5);
            const targetY = centerY + normalizedY * arcSpreadY;
            const curvePullX = fanOriginX + 180 * scale + (1 - Math.abs(normalizedY * 2)) * 60 * scale;

            // Cubic Bezier interpolation: B(t) = (1-t)^3 P0 + 3(1-t)^2 t P1 + 3(1-t) t^2 P2 + t^3 P3
            const t = photon.progress;
            const t2 = t * t;
            const t3 = t2 * t;
            const mt = 1 - t;
            const mt2 = mt * mt;
            const mt3 = mt2 * mt;

            const p0x = fanOriginX, p0y = fanOriginY;
            const p1x = fanOriginX + 90 * scale, p1y = fanOriginY;
            const p2x = curvePullX, p2y = targetY;
            const p3x = arcTargetX, p3y = targetY;

            const photonX = mt3 * p0x + 3 * mt2 * t * p1x + 3 * mt * t2 * p2x + t3 * p3x;
            const photonY = mt3 * p0y + 3 * mt2 * t * p1y + 3 * mt * t2 * p2y + t3 * p3y;

            // Draw glowing photon bullet
            const pGrad = ctx.createRadialGradient(photonX, photonY, 0, photonX, photonY, 6 * scale);
            pGrad.addColorStop(0, '#ffffff');
            pGrad.addColorStop(0.4, photon.color);
            pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.beginPath();
            ctx.arc(photonX, photonY, 6 * scale, 0, Math.PI * 2);
            ctx.fillStyle = pGrad;
            ctx.fill();
          });
        }
      });
    }

    animFrameRef.current = requestAnimationFrame(render);
  }, [viewMode, selectedDomain, selectedBranch, selectedSubLaw]);

  // Handle Canvas Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [render]);

  // Handle Mouse Interactions
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const mouseX = (e.clientX - rect.left) * dpr;
    const mouseY = (e.clientY - rect.top) * dpr;

    mouseRef.current.x = mouseX;
    mouseRef.current.y = mouseY;

    const cam = cameraRef.current;
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2 + cam.x;
    const centerY = height / 2 + cam.y;
    const scale = (Math.min(width, height) / 950) * cam.zoom;

    if (viewMode === 'constellation') {
      let hoveredId: string | null = null;
      DOMAIN_NODES.forEach((node) => {
        const nx = centerX + node.x * 550 * scale;
        const ny = centerY + node.y * 480 * scale;
        const dist = Math.hypot(mouseX - nx, mouseY - ny);
        if (dist < (node.radius + 10) * scale) {
          hoveredId = node.id;
        }
      });
      mouseRef.current.hoveredNodeId = hoveredId;
      canvas.style.cursor = hoveredId ? 'pointer' : 'default';
    } else if (viewMode === 'drilldown') {
      // Check hover on sub-laws arc
      const arcTargetX = centerX + 180 * scale;
      const arcSpreadY = 460 * scale;
      let hoveredSub: SubLawItem | null = null;

      SUB_LAWS_LIST.forEach((subLaw, subIdx) => {
        const normalizedY = (subIdx / (SUB_LAWS_LIST.length - 1) - 0.5);
        const targetY = centerY + normalizedY * arcSpreadY;
        const dist = Math.hypot(mouseX - arcTargetX, mouseY - targetY);
        if (dist < 22 * scale || (mouseX >= arcTargetX && mouseX <= arcTargetX + 220 * scale && Math.abs(mouseY - targetY) < 14 * scale)) {
          hoveredSub = subLaw;
        }
      });
      canvas.style.cursor = hoveredSub ? 'pointer' : 'default';
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const mouseX = (e.clientX - rect.left) * dpr;
    const mouseY = (e.clientY - rect.top) * dpr;

    const cam = cameraRef.current;
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2 + cam.x;
    const centerY = height / 2 + cam.y;
    const scale = (Math.min(width, height) / 950) * cam.zoom;

    if (viewMode === 'constellation') {
      DOMAIN_NODES.forEach((node) => {
        const nx = centerX + node.x * 550 * scale;
        const ny = centerY + node.y * 480 * scale;
        const dist = Math.hypot(mouseX - nx, mouseY - ny);
        if (dist < (node.radius + 12) * scale) {
          onSelectDomain(node);
        }
      });
    } else if (viewMode === 'drilldown') {
      const arcTargetX = centerX + 180 * scale;
      const arcSpreadY = 460 * scale;

      SUB_LAWS_LIST.forEach((subLaw, subIdx) => {
        const normalizedY = (subIdx / (SUB_LAWS_LIST.length - 1) - 0.5);
        const targetY = centerY + normalizedY * arcSpreadY;
        const dist = Math.hypot(mouseX - arcTargetX, mouseY - targetY);
        if (dist < 25 * scale || (mouseX >= arcTargetX && mouseX <= arcTargetX + 240 * scale && Math.abs(mouseY - targetY) < 16 * scale)) {
          onSelectSubLaw(subLaw);
        }
      });
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full block touch-none"
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      />
    </div>
  );
}
