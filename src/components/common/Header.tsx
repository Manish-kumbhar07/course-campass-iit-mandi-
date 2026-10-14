import React from 'react';
import { AppArea, PublicTab, StudentTab } from '../../types';
import { Compass, GraduationCap, ArrowRight } from 'lucide-react';

interface HeaderProps {
  currentArea: AppArea;
  publicTab: PublicTab;
  studentTab: StudentTab;
  onNavigatePublic: (tab: PublicTab) => void;
  onNavigateStudent: (tab: StudentTab) => void;
  onSwitchArea: (area: AppArea) => void;
  onOpenAuthModal: () => void;
  studentName?: string;
  courseCode?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentArea,
  publicTab,
  studentTab,
  onNavigatePublic,
  onNavigateStudent,
  onSwitchArea,
  onOpenAuthModal,
  studentName = 'Ananya Sharma',
  courseCode = 'CS 204'
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#F8F7EF]/95 backdrop-blur-md border-b border-[#E1E4D8]">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element in display face) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSwitchArea('public')}
            className="flex items-center gap-2.5 text-left group transition-transform active:scale-[0.98]"
          >
            <div className="w-8 h-8 rounded-lg bg-[#263F2B] text-[#F8F7EF] flex items-center justify-center shadow-xs">
              <Compass className="w-5 h-5 text-[#DCE5CE]" />
            </div>
            <span className="font-serif-display text-xl font-bold tracking-tight text-[#263F2B] whitespace-nowrap">
              CourseCompass
            </span>
          </button>

          {currentArea === 'student' && (
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[#E1E4D8] text-xs text-[#5D655B]">
              <span className="font-medium text-[#17241B]">{courseCode}</span>
              <span className="text-[#A8B594]">/</span>
              <span className="text-[#697650] font-sans-body truncate max-w-[160px]">Recursion & Graphs</span>
            </div>
          )}
        </div>

        {/* Zone 2: Navigation Links (4-5 single-line clean text links) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          {currentArea === 'public' ? (
            <>
              <button
                onClick={() => onNavigatePublic('home')}
                className={`whitespace-nowrap transition-colors ${
                  publicTab === 'home'
                    ? 'text-[#263F2B] font-semibold underline decoration-[#263F2B] decoration-2 underline-offset-8'
                    : 'text-[#5D655B] hover:text-[#17241B]'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => onNavigatePublic('how-it-works')}
                className={`whitespace-nowrap transition-colors ${
                  publicTab === 'how-it-works'
                    ? 'text-[#263F2B] font-semibold underline decoration-[#263F2B] decoration-2 underline-offset-8'
                    : 'text-[#5D655B] hover:text-[#17241B]'
                }`}
              >
                How It Works
              </button>
              <button
                onClick={() => onNavigatePublic('features')}
                className={`whitespace-nowrap transition-colors ${
                  publicTab === 'features'
                    ? 'text-[#263F2B] font-semibold underline decoration-[#263F2B] decoration-2 underline-offset-8'
                    : 'text-[#5D655B] hover:text-[#17241B]'
                }`}
              >
                Pedagogy & Features
              </button>
              <button
                onClick={() => onNavigatePublic('security')}
                className={`whitespace-nowrap transition-colors ${
                  publicTab === 'security'
                    ? 'text-[#263F2B] font-semibold underline decoration-[#263F2B] decoration-2 underline-offset-8'
                    : 'text-[#5D655B] hover:text-[#17241B]'
                }`}
              >
                Security & Trust
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigateStudent('overview')}
                className={`whitespace-nowrap transition-colors ${
                  studentTab === 'overview'
                    ? 'text-[#263F2B] font-semibold underline decoration-[#263F2B] decoration-2 underline-offset-8'
                    : 'text-[#5D655B] hover:text-[#17241B]'
                }`}
              >
                Study Plan
              </button>
              <button
                onClick={() => onNavigateStudent('knowledge-map')}
                className={`whitespace-nowrap transition-colors ${
                  studentTab === 'knowledge-map'
                    ? 'text-[#263F2B] font-semibold underline decoration-[#263F2B] decoration-2 underline-offset-8'
                    : 'text-[#5D655B] hover:text-[#17241B]'
                }`}
              >
                Knowledge Map
              </button>
              <button
                onClick={() => onNavigateStudent('tutor')}
                className={`whitespace-nowrap transition-colors ${
                  studentTab === 'tutor'
                    ? 'text-[#263F2B] font-semibold underline decoration-[#263F2B] decoration-2 underline-offset-8'
                    : 'text-[#5D655B] hover:text-[#17241B]'
                }`}
              >
                AI Tutor
              </button>
              <button
                onClick={() => onNavigateStudent('quiz')}
                className={`whitespace-nowrap transition-colors ${
                  studentTab === 'quiz'
                    ? 'text-[#263F2B] font-semibold underline decoration-[#263F2B] decoration-2 underline-offset-8'
                    : 'text-[#5D655B] hover:text-[#17241B]'
                }`}
              >
                Adaptive Quiz
              </button>
              <button
                onClick={() => onNavigateStudent('materials')}
                className={`whitespace-nowrap transition-colors ${
                  studentTab === 'materials'
                    ? 'text-[#263F2B] font-semibold underline decoration-[#263F2B] decoration-2 underline-offset-8'
                    : 'text-[#5D655B] hover:text-[#17241B]'
                }`}
              >
                Course Materials
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {currentArea === 'public' ? (
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenAuthModal}
                className="hidden sm:inline-flex text-xs font-medium text-[#263F2B] hover:text-[#17241B] py-2 px-3 hover:bg-[#E1E4D8]/50 rounded-md transition-colors whitespace-nowrap"
              >
                Sign In
              </button>
              <button
                onClick={() => onSwitchArea('student')}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#D71935] hover:bg-[#b0142b] rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-xs"
              >
                <span>Enter Demo Student App</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-[#F1F2E6] border border-[#E1E4D8] text-xs text-[#263F2B]">
                <GraduationCap className="w-3.5 h-3.5 text-[#697650]" />
                <span className="font-medium">{studentName}</span>
              </div>
              <button
                onClick={() => onSwitchArea('public')}
                className="px-3 py-1.5 text-xs font-medium text-[#263F2B] bg-[#DCE5CE]/80 hover:bg-[#DCE5CE] border border-[#A8B594]/50 rounded-lg transition-colors whitespace-nowrap"
              >
                Public Website
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
