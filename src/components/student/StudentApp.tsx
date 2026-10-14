import React, { useState } from 'react';
import {
  StudentTab,
  StudentProfile,
  ConceptNode,
  CourseMaterial,
  TutorMessage,
  QuizQuestion,
  Flashcard,
  StudyPlanDay,
  SourceCitation
} from '../../types';
import { OverviewView } from './OverviewView';
import { KnowledgeMapView } from './KnowledgeMapView';
import { TutorChatView } from './TutorChatView';
import { AdaptiveQuizView } from './AdaptiveQuizView';
import { FlashcardsView } from './FlashcardsView';
import { MaterialsView } from './MaterialsView';
import { OnboardingModal } from './OnboardingModal';
import {
  Calendar,
  Network,
  Bot,
  HelpCircle,
  Layers,
  UploadCloud,
  ChevronDown,
  LayoutDashboard
} from 'lucide-react';

interface StudentAppProps {
  profile: StudentProfile;
  concepts: ConceptNode[];
  materials: CourseMaterial[];
  messages: TutorMessage[];
  quizQuestions: QuizQuestion[];
  flashcards: Flashcard[];
  studyPlan: StudyPlanDay[];
  currentTab: StudentTab;
  onNavigateTab: (tab: StudentTab) => void;
  onInspectCitation: (citation: SourceCitation) => void;
  onSendMessage: (text: string) => void;
  onToggleTask: (dayIndex: number, taskId: string) => void;
  onCompleteQuiz: (score: number) => void;
  onAddMaterial: (mat: CourseMaterial) => void;
  onUpdateProfile: (profile: Partial<StudentProfile>) => void;
}

export const StudentApp: React.FC<StudentAppProps> = ({
  profile,
  concepts,
  materials,
  messages,
  quizQuestions,
  flashcards,
  studyPlan,
  currentTab,
  onNavigateTab,
  onInspectCitation,
  onSendMessage,
  onToggleTask,
  onCompleteQuiz,
  onAddMaterial,
  onUpdateProfile
}) => {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // When clicking on a concept to quiz from Knowledge Map
  const handleSelectConceptToQuiz = (conceptId: string) => {
    onNavigateTab('quiz');
  };

  // When clicking to tutor about a concept
  const handleSelectConceptToTutor = (concept: ConceptNode) => {
    onSendMessage(`Could you explain the key concept of "${concept.name}" and why students struggle with "${concept.primaryMisconception}"?`);
    onNavigateTab('tutor');
  };

  const handleInspectCitationByAnchor = (anchor: string) => {
    const foundCitation = Object.values(materials).flatMap((m) =>
      concepts.flatMap((c) => c.citations)
    ).find((cite) => cite.locationLabel.toLowerCase().includes(anchor.toLowerCase()) || anchor.toLowerCase().includes(cite.locationLabel.toLowerCase()));

    if (foundCitation) {
      onInspectCitation(foundCitation);
    } else {
      // Fallback first citation
      onInspectCitation(concepts[0].citations[0]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7EF] text-[#17241B] pb-20">
      {/* Course Context & Secondary Tab Bar */}
      <div className="border-b border-[#E1E4D8] bg-[#F1F2E6]/60">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-3 border-b border-[#E1E4D8]/60">
            <div className="flex items-center gap-3 text-xs">
              <span className="font-semibold text-[#263F2B] bg-[#DCE5CE] px-2 py-0.5 rounded">
                Active Enrolled Course
              </span>
              <span className="font-bold text-[#17241B]">{profile.currentCourse}</span>
              <span className="text-[#697650] font-mono-code">({profile.courseCode})</span>
            </div>

            <div className="flex items-center gap-4 text-xs text-[#5D655B]">
              <span>Exam: <strong className="text-[#D71935]">{profile.examCountdownDays} Days Remaining</strong></span>
              <span>·</span>
              <button
                onClick={() => setIsOnboardingOpen(true)}
                className="text-[#263F2B] hover:underline font-medium"
              >
                Settings ({profile.dailyStudyMinutes}m/day)
              </button>
            </div>
          </div>

          {/* Student Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 text-xs font-medium no-scrollbar">
            <button
              onClick={() => onNavigateTab('overview')}
              className={`px-3.5 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-colors ${
                currentTab === 'overview' || (currentTab as string) === 'dashboard'
                  ? 'bg-white text-[#263F2B] shadow-2xs font-semibold'
                  : 'text-[#5D655B] hover:text-[#17241B] hover:bg-white/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#263F2B]" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onNavigateTab('knowledge-map')}
              className={`px-3.5 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-colors ${
                currentTab === 'knowledge-map'
                  ? 'bg-white text-[#263F2B] shadow-2xs font-semibold'
                  : 'text-[#5D655B] hover:text-[#17241B] hover:bg-white/50'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Knowledge Map & Prerequisites</span>
            </button>

            <button
              onClick={() => onNavigateTab('tutor')}
              className={`px-3.5 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-colors ${
                currentTab === 'tutor'
                  ? 'bg-white text-[#263F2B] shadow-2xs font-semibold'
                  : 'text-[#5D655B] hover:text-[#17241B] hover:bg-white/50'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Grounded AI Tutor</span>
            </button>

            <button
              onClick={() => onNavigateTab('quiz')}
              className={`px-3.5 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-colors ${
                currentTab === 'quiz'
                  ? 'bg-white text-[#263F2B] shadow-2xs font-semibold'
                  : 'text-[#5D655B] hover:text-[#17241B] hover:bg-white/50'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Adaptive Quiz</span>
            </button>

            <button
              onClick={() => onNavigateTab('flashcards')}
              className={`px-3.5 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-colors ${
                currentTab === 'flashcards'
                  ? 'bg-white text-[#263F2B] shadow-2xs font-semibold'
                  : 'text-[#5D655B] hover:text-[#17241B] hover:bg-white/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Flashcards & Summaries</span>
            </button>

            <button
              onClick={() => onNavigateTab('materials')}
              className={`px-3.5 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-colors ${
                currentTab === 'materials'
                  ? 'bg-white text-[#263F2B] shadow-2xs font-semibold'
                  : 'text-[#5D655B] hover:text-[#17241B] hover:bg-white/50'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Course Materials ({materials.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab View Port */}
      <main className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {currentTab === 'overview' && (
          <OverviewView
            profile={profile}
            studyPlan={studyPlan}
            concepts={concepts}
            onNavigateStudent={onNavigateTab}
            onToggleTask={onToggleTask}
            onInspectCitation={onInspectCitation}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
          />
        )}

        {currentTab === 'knowledge-map' && (
          <KnowledgeMapView
            concepts={concepts}
            onSelectConceptToQuiz={handleSelectConceptToQuiz}
            onSelectConceptToTutor={handleSelectConceptToTutor}
            onInspectCitation={onInspectCitation}
          />
        )}

        {currentTab === 'tutor' && (
          <TutorChatView
            messages={messages}
            onSendMessage={onSendMessage}
            onInspectCitation={onInspectCitation}
            materials={materials}
          />
        )}

        {currentTab === 'quiz' && (
          <AdaptiveQuizView
            questions={quizQuestions}
            onCompleteQuiz={onCompleteQuiz}
            onInspectCitation={onInspectCitation}
            onNavigateStudent={onNavigateTab}
          />
        )}

        {currentTab === 'flashcards' && (
          <FlashcardsView
            cards={flashcards}
            onInspectCitationByAnchor={handleInspectCitationByAnchor}
          />
        )}

        {currentTab === 'materials' && (
          <MaterialsView
            materials={materials}
            onAddMaterial={onAddMaterial}
            onInspectCitation={onInspectCitation}
          />
        )}
      </main>

      {/* Settings Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        profile={profile}
        onSaveProfile={onUpdateProfile}
      />
    </div>
  );
};
