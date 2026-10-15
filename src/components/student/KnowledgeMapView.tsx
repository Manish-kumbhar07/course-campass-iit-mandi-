import React, { useState, useEffect } from 'react';
import { ConceptNode, SourceCitation, StudentTab } from '../../types';
import {
  Network,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Filter,
  Sparkles,
  HelpCircle,
  Bot,
  Brain,
  Layers,
  RotateCw,
  Eye,
  Sliders,
  Play
} from 'lucide-react';

interface KnowledgeMapViewProps {
  concepts: ConceptNode[];
  onSelectConceptToQuiz: (conceptId: string) => void;
  onSelectConceptToTutor: (concept: ConceptNode) => void;
  onInspectCitation: (citation: SourceCitation) => void;
  onAddToStudyPlan?: (concept: ConceptNode) => void;
}

export const KnowledgeMapView: React.FC<KnowledgeMapViewProps> = ({
  concepts,
  onSelectConceptToQuiz,
  onSelectConceptToTutor,
  onInspectCitation,
  onAddToStudyPlan
}) => {
  const [selectedConceptId, setSelectedConceptId] = useState<string>(
    concepts[0]?.id || 'c-base-cases'
  );
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [filter, setFilter] = useState<'all' | 'attention' | 'mastered'>('all');
  const [isRotating, setIsRotating] = useState(true);
  const [orbitAngle, setOrbitAngle] = useState(0);

  // Detect user preference for reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setIsRotating(false);
    }
  }, []);

  // Gentle 3D rotation animation when enabled
  useEffect(() => {
    if (!isRotating || viewMode !== '3d') return;
    const interval = setInterval(() => {
      setOrbitAngle((prev) => (prev + 0.5) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, [isRotating, viewMode]);

  if (!concepts || concepts.length === 0) {
    return (
      <div className="max-w-xl mx-auto bg-white border border-[#E1E4D8] rounded-2xl p-10 text-center space-y-4 shadow-2xs">
        <div className="w-12 h-12 rounded-xl bg-[#F8F7EF] border border-[#E1E4D8] text-[#263F2B] flex items-center justify-center mx-auto">
          <Network className="w-6 h-6 text-[#263F2B]" />
        </div>
        <div className="space-y-1">
          <h3 className="font-serif-display text-lg font-bold text-[#17241B]">
            No concepts mapped yet
          </h3>
          <p className="text-xs text-[#5D655B] max-w-sm mx-auto leading-relaxed">
            Upload course materials or lecture slides to automatically extract curriculum concepts and build the prerequisite dependency map.
          </p>
        </div>
      </div>
    );
  }

  const selectedConcept = concepts.find((c) => c.id === selectedConceptId) || concepts[0];
  const attentionCount = concepts.filter((c) => c.status === 'attention').length;
  const masteredCount = concepts.filter((c) => c.status === 'mastered').length;

  const filteredConcepts = concepts.filter((c) => {
    if (filter === 'attention') return c.status === 'attention';
    if (filter === 'mastered') return c.status === 'mastered';
    return true;
  });

  const getPrerequisiteNames = (prereqIds: string[]) => {
    return prereqIds.map((id) => concepts.find((c) => c.id === id)?.name || id);
  };

  // Find concepts that have selectedConcept as a prerequisite
  const dependentConcepts = concepts.filter((c) =>
    c.prerequisiteIds?.includes(selectedConcept.id)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header with Mode Toggle & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E1E4D8] rounded-2xl p-6 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#697650] font-semibold uppercase tracking-wider">
            <Network className="w-4 h-4 text-[#263F2B]" />
            <span>Interactive Prerequisite Architecture</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif-display text-[#263F2B]">
            Course Knowledge Map
          </h2>
          <p className="text-xs text-[#5D655B]">
            Trace prerequisite pathways and examine how foundational topics unlock advanced curriculum concepts.
          </p>
        </div>

        {/* View Mode Toggle & Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 3D vs 2D Toggle */}
          <div className="flex items-center p-1 bg-[#F1F2E6] border border-[#E1E4D8] rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === '3d'
                  ? 'bg-white text-[#263F2B] shadow-xs'
                  : 'text-[#5D655B] hover:text-[#17241B]'
              }`}
            >
              3D Spatial Graph
            </button>
            <button
              onClick={() => setViewMode('2d')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === '2d'
                  ? 'bg-white text-[#263F2B] shadow-xs'
                  : 'text-[#5D655B] hover:text-[#17241B]'
              }`}
            >
              2D Accessible View
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-[#F1F2E6] border border-[#E1E4D8] rounded-xl text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-[#263F2B] font-bold shadow-xs'
                  : 'text-[#5D655B] hover:text-[#17241B]'
              }`}
            >
              All ({concepts.length})
            </button>
            <button
              onClick={() => setFilter('attention')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filter === 'attention'
                  ? 'bg-white text-[#D71935] font-bold shadow-xs'
                  : 'text-[#5D655B] hover:text-[#17241B]'
              }`}
            >
              Attention ({attentionCount})
            </button>
            <button
              onClick={() => setFilter('mastered')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filter === 'mastered'
                  ? 'bg-white text-emerald-800 font-bold shadow-xs'
                  : 'text-[#5D655B] hover:text-[#17241B]'
              }`}
            >
              Mastered ({masteredCount})
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout: Graph Stage (Col 7/8) + Concept Detail Drawer (Col 5/4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* GRAPH STAGE */}
        <div className="lg:col-span-7 bg-white border border-[#E1E4D8] rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E1E4D8] text-xs">
            <span className="font-semibold text-[#17241B]">
              {viewMode === '3d' ? '3D Spatial Knowledge Graph' : 'Hierarchical Concept List'}
            </span>

            {viewMode === '3d' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsRotating(!isRotating)}
                  className="px-2 py-1 rounded bg-[#F1F2E6] hover:bg-[#EAEFE4] text-[#263F2B] font-medium flex items-center gap-1 cursor-pointer"
                  title="Toggle continuous rotation"
                >
                  <RotateCw className={`w-3 h-3 ${isRotating ? 'animate-spin' : ''}`} />
                  <span>{isRotating ? 'Pause rotation' : 'Orbit'}</span>
                </button>
                <button
                  onClick={() => setOrbitAngle((prev) => (prev + 45) % 360)}
                  className="px-2 py-1 rounded bg-[#F1F2E6] hover:bg-[#EAEFE4] text-[#263F2B] font-medium cursor-pointer"
                >
                  +45°
                </button>
              </div>
            )}
          </div>

          {/* 3D SPATIAL GRAPH VIEW */}
          {viewMode === '3d' ? (
            <div className="relative w-full h-[450px] bg-gradient-to-b from-[#FAF9F5] to-[#F1F2E6]/60 rounded-xl border border-[#E1E4D8] overflow-hidden flex items-center justify-center select-none perspective-[900px]">
              {/* Background Spatial Grid Rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                <div className="w-[360px] h-[360px] rounded-full border border-dashed border-[#A8B594] animate-spin-slow" />
                <div className="absolute w-[240px] h-[240px] rounded-full border border-[#DCE5CE]" />
              </div>

              {/* 3D Orbiting Stage */}
              <div
                className="relative w-full h-full flex items-center justify-center transition-transform duration-100 ease-out"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateX(20deg) rotateY(${orbitAngle}deg)`
                }}
              >
                {/* Central Anchor Beacon */}
                <div
                  className="absolute w-12 h-12 rounded-2xl bg-[#263F2B] text-white flex items-center justify-center shadow-lg border-2 border-[#DCE5CE] z-10"
                  style={{ transform: `rotateY(${-orbitAngle}deg)` }}
                >
                  <Network className="w-6 h-6 text-[#DCE5CE]" />
                </div>

                {/* Floating Concept Nodes in 3D */}
                {filteredConcepts.map((node, i) => {
                  const count = filteredConcepts.length;
                  const angle = (i / count) * 2 * Math.PI;
                  const radius = 140;
                  const x = Math.cos(angle) * radius;
                  const z = Math.sin(angle) * radius;
                  const y = (i % 2 === 0 ? -1 : 1) * 35;

                  const isSelected = node.id === selectedConceptId;

                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedConceptId(node.id)}
                      className={`absolute cursor-pointer transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 ${
                        isSelected ? 'z-30 scale-110' : 'z-20 hover:scale-105'
                      }`}
                      style={{
                        transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${-orbitAngle}deg)`
                      }}
                    >
                      <div
                        className={`px-3 py-2 rounded-xl text-xs font-semibold shadow-md flex items-center gap-2 border whitespace-nowrap ${
                          isSelected
                            ? 'bg-[#263F2B] text-white border-white ring-2 ring-[#263F2B]'
                            : node.status === 'mastered'
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                            : node.status === 'attention'
                            ? 'bg-rose-50 text-[#D71935] border-rose-300'
                            : 'bg-white text-[#17241B] border-[#E1E4D8]'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            node.status === 'mastered'
                              ? 'bg-emerald-600'
                              : node.status === 'attention'
                              ? 'bg-[#D71935]'
                              : 'bg-amber-500'
                          }`}
                        />
                        <span className="max-w-[120px] truncate">{node.name}</span>
                        <span className="font-mono text-[10px] opacity-80">{node.masteryPercent}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Instructions Badge */}
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md border border-[#E1E4D8] text-[11px] text-[#5D655B]">
                Click nodes to inspect prerequisite links & launch tutor
              </div>
            </div>
          ) : (
            /* 2D ACCESSIBLE LIST VIEW */
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
              {filteredConcepts.map((node) => {
                const isSelected = node.id === selectedConceptId;
                const prereqNames = getPrerequisiteNames(node.prerequisiteIds || []);

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedConceptId(node.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#263F2B] bg-[#F1F2E6]/80 ring-1 ring-[#263F2B]'
                        : 'border-[#E1E4D8] bg-[#F8F7EF]/50 hover:bg-[#F8F7EF] hover:border-[#A8B594]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[11px] text-[#697650]">
                          <span className="font-semibold text-[#263F2B]">{node.topic}</span>
                          <span>·</span>
                          <span>{node.difficulty}</span>
                          {node.status === 'attention' && (
                            <span className="text-[#D71935] font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Needs Attention
                            </span>
                          )}
                          {node.status === 'mastered' && (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Mastered
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-[#17241B]">{node.name}</h4>
                        <p className="text-xs text-[#5D655B] line-clamp-1">{node.summary}</p>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 sm:border-l sm:border-[#E1E4D8] sm:pl-4">
                        <div className="text-right">
                          <span className="block font-mono-code text-base font-bold text-[#263F2B]">
                            {node.masteryPercent}%
                          </span>
                          <span className="text-[10px] text-[#5D655B] uppercase font-semibold">
                            Mastery
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CONCEPT DETAIL DRAWER (RIGHT) */}
        <div className="lg:col-span-5 bg-white border border-[#E1E4D8] rounded-2xl p-6 shadow-2xs space-y-6">
          <div className="space-y-2 pb-4 border-b border-[#E1E4D8]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#697650]">
                Concept Inspector
              </span>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  selectedConcept.status === 'mastered'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : selectedConcept.status === 'attention'
                    ? 'bg-rose-50 text-[#D71935] border border-rose-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {selectedConcept.status.toUpperCase()} ({selectedConcept.masteryPercent}%)
              </span>
            </div>
            <h3 className="font-serif-display text-xl font-bold text-[#17241B]">
              {selectedConcept.name}
            </h3>
            <p className="text-xs text-[#5D655B] leading-relaxed">
              {selectedConcept.summary}
            </p>
          </div>

          {/* Prerequisite Chains */}
          <div className="space-y-3 text-xs">
            <div>
              <span className="font-bold text-[#17241B] block mb-1.5">
                Prerequisites (Foundational Requirements):
              </span>
              {(selectedConcept.prerequisiteIds || []).length === 0 ? (
                <p className="text-[11px] text-[#697650] italic bg-[#F8F7EF] p-2.5 rounded-lg border border-[#E1E4D8]">
                  None. This is a foundational ground-level concept.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {getPrerequisiteNames(selectedConcept.prerequisiteIds || []).map((name, i) => (
                    <div
                      key={i}
                      className="p-2 bg-[#F8F7EF] border border-[#E1E4D8] rounded-lg flex items-center justify-between text-[11px]"
                    >
                      <span className="font-medium text-[#17241B]">{name}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <span className="font-bold text-[#17241B] block mb-1.5">
                Unlocks (Advanced Topics Enabled):
              </span>
              {dependentConcepts.length === 0 ? (
                <p className="text-[11px] text-[#697650] italic bg-[#F8F7EF] p-2.5 rounded-lg border border-[#E1E4D8]">
                  Terminal capstone topic in current syllabus.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {dependentConcepts.map((dep) => (
                    <div
                      key={dep.id}
                      onClick={() => setSelectedConceptId(dep.id)}
                      className="p-2 bg-[#FAF9F5] hover:bg-[#F1F2E6] border border-[#E1E4D8] rounded-lg flex items-center justify-between text-[11px] cursor-pointer transition-colors"
                    >
                      <span className="font-medium text-[#17241B]">{dep.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#697650]" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedConcept.primaryMisconception && (
              <div className="p-3 rounded-xl bg-[#FFF8F8] border border-[#F8E2E3] space-y-1">
                <span className="font-bold text-[#D71935] flex items-center gap-1.5 text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5" /> Common Misconception
                </span>
                <p className="text-[11px] text-[#D71935]">
                  "{selectedConcept.primaryMisconception}"
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-[#E1E4D8]">
            <button
              onClick={() => onSelectConceptToTutor(selectedConcept)}
              className="w-full py-2.5 bg-[#263F2B] hover:bg-[#1e3222] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Bot className="w-4 h-4 text-[#DCE5CE]" />
              <span>Ask AI Tutor About This Concept</span>
            </button>

            <button
              onClick={() => onSelectConceptToQuiz(selectedConcept.id)}
              className="w-full py-2.5 bg-[#F1F2E6] hover:bg-[#EAEFE4] border border-[#E1E4D8] text-[#263F2B] rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Brain className="w-4 h-4" />
              <span>Practice This Concept (Adaptive Quiz)</span>
            </button>

            {selectedConcept.citations && selectedConcept.citations.length > 0 && (
              <button
                onClick={() => onInspectCitation(selectedConcept.citations[0])}
                className="w-full py-2 bg-white hover:bg-[#F8F7EF] border border-[#E1E4D8] text-[#5D655B] hover:text-[#17241B] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Inspect Source Citation</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
