import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  FileText,
  Video,
  Presentation,
  Youtube,
  Bot,
  HelpCircle,
  TrendingUp,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export type HeroSelectorType =
  | 'organize'
  | 'understand'
  | 'prepare'
  | 'practice';

interface OrbitNode {
  id: string;
  name: string;
  category: 'source' | 'ai' | 'assessment' | 'progress';
  icon: any;
  angle: number; // in degrees
  distance: number; // radius in px
  detail: string;
  status: string;
  accent: string;
  bgLight: string;
}

const ORBIT_NODES: OrbitNode[] = [
  {
    id: 'pdf',
    name: 'Textbook PDF',
    category: 'source',
    icon: FileText,
    angle: 0,
    distance: 175,
    detail: 'Indexed down to page numbers and theorems.',
    status: 'Verified Source',
    accent: '#263F2B',
    bgLight: '#DCE5CE'
  },
  {
    id: 'video',
    name: 'Lecture Video',
    category: 'source',
    icon: Video,
    angle: 51,
    distance: 185,
    detail: 'Synchronized audio transcripts & millisecond timestamps.',
    status: 'Timestamped',
    accent: '#4338CA',
    bgLight: '#E0E7FF'
  },
  {
    id: 'slides',
    name: 'Slide Deck',
    category: 'source',
    icon: Presentation,
    angle: 103,
    distance: 170,
    detail: 'Visual diagram OCR & slide index mapping.',
    status: 'Indexed Slides',
    accent: '#B45309',
    bgLight: '#FEF3C7'
  },
  {
    id: 'youtube',
    name: 'YouTube Lesson',
    category: 'source',
    icon: Youtube,
    angle: 154,
    distance: 180,
    detail: 'Public lecture notes, flashcards & structured sections.',
    status: 'Summarized',
    accent: '#D71935',
    bgLight: '#F8E2E3'
  },
  {
    id: 'tutor',
    name: 'AI Tutor',
    category: 'ai',
    icon: Bot,
    angle: 205,
    distance: 190,
    detail: 'Answers grounded strictly in your uploaded materials.',
    status: 'Evidence-Grounded',
    accent: '#047857',
    bgLight: '#D1FAE5'
  },
  {
    id: 'quiz',
    name: 'Adaptive Quiz',
    category: 'assessment',
    icon: HelpCircle,
    angle: 257,
    distance: 175,
    detail: 'Active recall drills diagnosing exact misconceptions.',
    status: 'Diagnostic',
    accent: '#6D28D9',
    bgLight: '#EDE9FE'
  },
  {
    id: 'mastery',
    name: 'Mastery Tracker',
    category: 'progress',
    icon: TrendingUp,
    angle: 308,
    distance: 185,
    detail: 'Deterministic skill progression & prerequisite DAG.',
    status: 'Prerequisite Graph',
    accent: '#15803D',
    bgLight: '#DCFCE7'
  }
];

interface CourseCompassOrbit3DProps {
  activeSelector: HeroSelectorType;
  onSelectNode?: (nodeId: string) => void;
  onExploreWorkspace?: () => void;
}

export const CourseCompassOrbit3D: React.FC<CourseCompassOrbit3DProps> = ({
  activeSelector,
  onSelectNode,
  onExploreWorkspace
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('tutor');
  const [rotation, setRotation] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [manualMotionDisabled, setManualMotionDisabled] = useState(false);

  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Check system prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const motionActive = !prefersReducedMotion && !manualMotionDisabled && !isPaused;

  // Sync active node with hero selector
  useEffect(() => {
    switch (activeSelector) {
      case 'organize':
        setSelectedNodeId('pdf');
        break;
      case 'understand':
        setSelectedNodeId('tutor');
        break;
      case 'prepare':
        setSelectedNodeId('quiz');
        break;
      case 'practice':
        setSelectedNodeId('mastery');
        break;
    }
  }, [activeSelector]);

  // Gentle, smooth orbit rotation loop (approx 1 revolution per 45s)
  useEffect(() => {
    if (!motionActive) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    const animate = (time: number) => {
      if (lastTimeRef.current !== null) {
        const delta = time - lastTimeRef.current;
        // ~8 degrees per second = 360 degrees in 45s
        setRotation((prev) => (prev + (delta * 0.008)) % 360);
      }
      lastTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      lastTimeRef.current = null;
    };
  }, [motionActive]);

  const activeNode = ORBIT_NODES.find((n) => n.id === selectedNodeId) || ORBIT_NODES[0];

  const handleNodeClick = (node: OrbitNode) => {
    setSelectedNodeId(node.id);
    if (onSelectNode) onSelectNode(node.id);
  };

  return (
    <div
      className="relative w-full max-w-[560px] h-[500px] flex items-center justify-center select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="CourseCompass Interactive 3D Learning Orbit"
    >
      {/* Motion Accessibility Controls */}
      <div className="absolute top-2 right-2 z-30">
        <button
          type="button"
          onClick={() => setManualMotionDisabled(!manualMotionDisabled)}
          className="px-2.5 py-1 rounded-full bg-white/90 border border-[#E1E4D8] text-[11px] font-medium text-[#5D655B] hover:text-[#17241B] flex items-center gap-1.5 shadow-2xs backdrop-blur-xs transition-colors cursor-pointer"
          title={manualMotionDisabled ? 'Enable Orbit Motion' : 'Disable Orbit Motion'}
          aria-pressed={manualMotionDisabled}
        >
          {manualMotionDisabled ? (
            <>
              <Eye className="w-3.5 h-3.5 text-[#263F2B]" />
              <span>Enable motion</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5 text-[#777E70]" />
              <span>Disable motion</span>
            </>
          )}
        </button>
      </div>

      {/* SVG Background Orbital Tracks & Connectors */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 560 500"
      >
        <defs>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#DCE5CE" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#F1F2E6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FAF7EE" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Center Glow */}
        <circle cx="280" cy="250" r="220" fill="url(#centerGlow)" />

        {/* Primary Dotted Orbit Rings */}
        <circle
          cx="280"
          cy="250"
          r="175"
          fill="none"
          stroke="#C8D6B8"
          strokeWidth="1.25"
          strokeDasharray="4 6"
          opacity="0.8"
        />
        <circle
          cx="280"
          cy="250"
          r="120"
          fill="none"
          stroke="#D8E4D5"
          strokeWidth="1"
          strokeDasharray="2 4"
          opacity="0.5"
        />

        {/* Radial subtle spokes connecting to active node */}
        {ORBIT_NODES.map((node) => {
          const currentAngle = (node.angle + (manualMotionDisabled || prefersReducedMotion ? 0 : rotation)) * (Math.PI / 180);
          const x = 280 + Math.cos(currentAngle) * node.distance;
          const y = 250 + Math.sin(currentAngle) * (node.distance * 0.78);
          const isSelected = node.id === selectedNodeId;

          return (
            <line
              key={`spoke-${node.id}`}
              x1="280"
              y1="250"
              x2={x}
              y2={y}
              stroke={isSelected ? '#697650' : '#E1E4D8'}
              strokeWidth={isSelected ? '1.5' : '0.75'}
              strokeDasharray={isSelected ? 'none' : '2 3'}
              opacity={isSelected ? 0.9 : 0.35}
              className="transition-all duration-300"
            />
          );
        })}
      </svg>

      {/* 3D Scene Container */}
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{
          perspective: '1000px',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* ============================================================ */}
        {/* CENTRAL BEACON: 3D CourseCompass Object                      */}
        {/* ============================================================ */}
        <div
          className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-[#263F2B] via-[#1D3222] to-[#122015] border-2 border-[#DCE5CE] shadow-xl flex flex-col items-center justify-center text-white text-center cursor-pointer transition-transform duration-300 hover:scale-105"
          style={{
            transform: `rotateY(${manualMotionDisabled ? 0 : -rotation * 0.5}deg) translateZ(20px)`,
            boxShadow: '0 12px 36px -6px rgba(38, 63, 43, 0.35), inset 0 2px 6px rgba(255,255,255,0.2)'
          }}
          onClick={() => {
            if (onExploreWorkspace) onExploreWorkspace();
          }}
        >
          <Compass className="w-8 h-8 text-[#DCE5CE] animate-pulse" />
          <span className="font-serif-display font-bold text-[11px] tracking-tight mt-0.5 text-[#F8F7EF]">
            CourseCompass
          </span>
          <span className="text-[9px] text-[#A8B594] font-medium">Core Engine</span>
        </div>

        {/* ============================================================ */}
        {/* ORBITING 3D NODES                                            */}
        {/* ============================================================ */}
        {ORBIT_NODES.map((node) => {
          const effectiveAngle = manualMotionDisabled || prefersReducedMotion
            ? node.angle
            : (node.angle + rotation) % 360;
          const rad = effectiveAngle * (Math.PI / 180);

          // Elliptical 3D depth calculations
          const x = Math.cos(rad) * node.distance;
          const y = Math.sin(rad) * (node.distance * 0.76);
          const z = Math.sin(rad) * 40; // Simulated z-depth
          const scale = 0.88 + (Math.sin(rad) + 1) * 0.12; // Scales larger as it comes forward
          const isSelected = node.id === selectedNodeId;

          const NodeIcon = node.icon;

          return (
            <div
              key={node.id}
              onClick={() => handleNodeClick(node)}
              className="absolute cursor-pointer transition-transform duration-150 group"
              style={{
                transform: `translate3d(${x}px, ${y}px, ${z}px) scale(${scale})`,
                zIndex: Math.round(z + 50)
              }}
              role="button"
              tabIndex={0}
              aria-label={`${node.name}: ${node.status}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleNodeClick(node);
                }
              }}
            >
              <div
                className={`relative px-3 py-2 rounded-xl flex items-center gap-2 border transition-all duration-200 shadow-md ${
                  isSelected
                    ? 'bg-white border-[#263F2B] ring-2 ring-[#263F2B]/20 shadow-lg scale-110'
                    : 'bg-white/95 hover:bg-white border-[#E1E4D8] hover:border-[#697650]'
                }`}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: node.bgLight,
                    color: node.accent
                  }}
                >
                  <NodeIcon className="w-4 h-4" />
                </div>

                <div className="text-left whitespace-nowrap">
                  <div className="font-semibold text-xs text-[#17241B] flex items-center gap-1">
                    <span>{node.name}</span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D71935]" />
                    )}
                  </div>
                  <div className="text-[10px] text-[#697650] font-medium leading-none">
                    {node.status}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* FLOATING CONTEXT PANEL: Details on Active Selected Node      */}
      {/* ============================================================ */}
      <div className="absolute bottom-2 left-4 right-4 z-20 bg-white/95 backdrop-blur-md border border-[#E1E4D8] rounded-xl p-3 shadow-md flex items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{
              backgroundColor: activeNode.bgLight,
              color: activeNode.accent
            }}
          >
            {React.createElement(activeNode.icon, { className: 'w-4 h-4' })}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-[#17241B]">
                {activeNode.name}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#F1F2E6] text-[#263F2B] border border-[#E1E4D8]">
                {activeNode.status}
              </span>
            </div>
            <p className="text-[11px] text-[#5D655B] line-clamp-1 mt-0.5">
              {activeNode.detail}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (onExploreWorkspace) onExploreWorkspace();
          }}
          className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#263F2B] hover:bg-[#1b2f1f] text-white text-[11px] font-semibold transition-colors shrink-0 cursor-pointer"
        >
          <span>Explore</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

