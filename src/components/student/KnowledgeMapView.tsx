import React, { useState } from 'react';
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
  HelpCircle
} from 'lucide-react';

interface KnowledgeMapViewProps {
  concepts: ConceptNode[];
  onSelectConceptToQuiz: (conceptId: string) => void;
  onSelectConceptToTutor: (concept: ConceptNode) => void;
  onInspectCitation: (citation: SourceCitation) => void;
}

export const KnowledgeMapView: React.FC<KnowledgeMapViewProps> = ({
  concepts,
  onSelectConceptToQuiz,
  onSelectConceptToTutor,
  onInspectCitation
}) => {
  const [selectedConceptId, setSelectedConceptId] = useState<string>('c-base-cases');
  const [filter, setFilter] = useState<'all' | 'attention' | 'mastered'>('all');

  const selectedConcept = concepts.find((c) => c.id === selectedConceptId) || concepts[0];

  const filteredConcepts = concepts.filter((c) => {
    if (filter === 'attention') return c.status === 'attention';
    if (filter === 'mastered') return c.status === 'mastered';
    return true;
  });

  // Helper to find prerequisite names
  const getPrerequisiteNames = (prereqIds: string[]) => {
    return prereqIds.map((id) => concepts.find((c) => c.id === id)?.name || id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header and Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E1E4D8] rounded-xl p-5 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#697650] font-semibold uppercase tracking-wider">
            <Network className="w-4 h-4 text-[#263F2B]" />
            <span>Curriculum Dependency Graph</span>
          </div>
          <h2 className="text-xl font-bold font-serif-display text-[#263F2B]">
            Prerequisite Knowledge Map
          </h2>
          <p className="text-xs text-[#5D655B]">
            Interactive map tracing how foundational memory models enable advanced graph traversal algorithms.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F1F2E6] border border-[#E1E4D8] rounded-lg shrink-0">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filter === 'all'
                ? 'bg-white text-[#263F2B] shadow-xs'
                : 'text-[#5D655B] hover:text-[#17241B]'
            }`}
          >
            All Concepts ({concepts.length})
          </button>
          <button
            onClick={() => setFilter('attention')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filter === 'attention'
                ? 'bg-white text-[#D71935] shadow-xs font-semibold'
                : 'text-[#5D655B] hover:text-[#17241B]'
            }`}
          >
            Needs Attention (3)
          </button>
          <button
            onClick={() => setFilter('mastered')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filter === 'mastered'
                ? 'bg-white text-[#263F2B] shadow-xs font-semibold'
                : 'text-[#5D655B] hover:text-[#17241B]'
            }`}
          >
            Mastered (2)
          </button>
        </div>
      </div>

      {/* Main Grid: Visual Map Stage (Left) & Deep-Dive Concept Drawer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Visual Map Stage */}
        <div className="lg:col-span-7 bg-white border border-[#E1E4D8] rounded-xl p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between text-xs text-[#5D655B] pb-3 border-b border-[#E1E4D8]">
            <span className="font-medium text-[#17241B]">Prerequisite Pathways</span>
            <span className="text-[11px] text-[#777E70]">Click any node to inspect dependencies</span>
          </div>

          {/* Node Visual Cluster */}
          <div className="space-y-4">
            {filteredConcepts.map((node) => {
              const isSelected = node.id === selectedConceptId;
              const prereqNames = getPrerequisiteNames(node.prerequisiteIds);

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
                        {node.status === 'locked' && (
                          <span className="text-[#777E70] flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Locked
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-semibold text-[#17241B]">
                        {node.name}
                      </h3>

                      {prereqNames.length > 0 && (
                        <p className="text-[11px] text-[#5D655B]">
                          Prerequisites: <span className="font-medium text-[#263F2B]">{prereqNames.join(', ')}</span>
                        </p>
                      )}
                    </div>

                    {/* Mastery Bar & Badge */}
                    <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0">
                      <span className="font-mono-code font-bold text-xs text-[#263F2B]">
                        {node.masteryPercent}% Mastery
                      </span>
                      <div className="w-24 h-2 bg-[#E1E4D8] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            node.status === 'attention'
                              ? 'bg-[#D71935]'
                              : node.status === 'mastered'
                              ? 'bg-[#263F2B]'
                              : 'bg-[#A8B594]'
                          }`}
                          style={{ width: `${node.masteryPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dependency legend */}
          <div className="pt-4 border-t border-[#E1E4D8] flex flex-wrap items-center gap-4 text-xs text-[#5D655B]">
            <span className="font-medium text-[#17241B]">Legend:</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#263F2B]"></span> Mastered (≥ 75%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A8B594]"></span> In Progress (50–74%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D71935]"></span> Needs Attention (&lt; 50%)
            </span>
          </div>
        </div>

        {/* Right Drawer: Concept Deep-Dive Inspector */}
        <div className="lg:col-span-5 bg-white border border-[#E1E4D8] rounded-xl p-6 shadow-2xs space-y-6 sticky top-24">
          <div className="pb-3 border-b border-[#E1E4D8] space-y-1">
            <div className="flex items-center justify-between text-xs text-[#697650]">
              <span className="font-semibold text-[#263F2B]">{selectedConcept.topic}</span>
              <span className="font-mono-code">{selectedConcept.difficulty}</span>
            </div>
            <h3 className="font-serif-display text-xl font-bold text-[#17241B]">
              {selectedConcept.name}
            </h3>
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-[#697650] uppercase tracking-wider">
              Concept Synthesis
            </h4>
            <p className="text-xs text-[#5D655B] leading-relaxed">
              {selectedConcept.summary}
            </p>
          </div>

          {/* Common Misconception Alert */}
          <div className="p-3.5 rounded-lg bg-[#FFF8F8] border border-[#F8E2E3] space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#D71935]">
              <AlertTriangle className="w-4 h-4" />
              <span>Common Student Misconception</span>
            </div>
            <p className="text-xs text-[#5D655B] leading-relaxed">
              {selectedConcept.primaryMisconception}
            </p>
          </div>

          {/* Prerequisites Status */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-[#697650] uppercase tracking-wider">
              Required Prerequisites
            </h4>
            {selectedConcept.prerequisiteIds.length === 0 ? (
              <p className="text-xs text-[#777E70] italic">
                Foundational root concept (No prerequisites required).
              </p>
            ) : (
              <div className="space-y-1.5">
                {selectedConcept.prerequisiteIds.map((pId) => {
                  const prereq = concepts.find((c) => c.id === pId);
                  if (!prereq) return null;
                  return (
                    <div
                      key={pId}
                      className="p-2.5 rounded-md bg-[#F8F7EF] border border-[#E1E4D8] flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-[#17241B]">{prereq.name}</span>
                      <span
                        className={`font-mono-code font-semibold ${
                          prereq.masteryPercent >= 60 ? 'text-emerald-700' : 'text-[#D71935]'
                        }`}
                      >
                        {prereq.masteryPercent}% Mastery
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Citations Grounding */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-[#697650] uppercase tracking-wider">
              Indexed Courseware Sources
            </h4>
            <div className="space-y-2">
              {selectedConcept.citations.map((cite) => (
                <div
                  key={cite.id}
                  className="p-3 rounded-lg bg-[#F1F2E6]/60 border border-[#E1E4D8] space-y-1 text-xs"
                >
                  <div className="flex justify-between items-center font-medium">
                    <span className="text-[#263F2B] truncate max-w-[200px]">
                      {cite.sourceTitle}
                    </span>
                    <button
                      onClick={() => onInspectCitation(cite)}
                      className="text-[#D71935] hover:underline font-mono-code text-[11px] shrink-0 flex items-center gap-1"
                    >
                      {cite.locationLabel} <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <p className="text-[#5D655B] text-[11px] line-clamp-2 italic">
                    "{cite.excerpt}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => onSelectConceptToQuiz(selectedConcept.id)}
              className="w-full py-2.5 px-4 bg-[#D71935] hover:bg-[#b0142b] text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Practice Diagnostic Quiz for This Concept</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSelectConceptToTutor(selectedConcept)}
              className="w-full py-2.5 px-4 bg-[#F8F7EF] hover:bg-[#E1E4D8] text-[#263F2B] border border-[#E1E4D8] rounded-lg text-xs font-semibold transition-colors"
            >
              Ask AI Tutor About {selectedConcept.name}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
