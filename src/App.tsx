/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  AppRoute,
  PublicTab,
  StudentTab,
  SourceReference,
  StudentProfile,
  TutorMessage,
  CourseMaterial,
  ConceptNode,
  CourseDocument,
  EnrolledSubject
} from './types';
import {
  INITIAL_STUDENT_PROFILE,
  CONCEPTS_DATA,
  COURSE_MATERIALS,
  INITIAL_TUTOR_MESSAGES,
  SAMPLE_QUIZ_QUESTIONS,
  FLASHCARDS_DATA,
  STUDY_PLAN_DATA,
  SAMPLE_CITATIONS
} from './data/courseData';
import { PublicNavbar } from './components/navigation/PublicNavbar';
import { LandingPage } from './components/landing/LandingPage';
import { SignInPage } from './components/auth/SignInPage';
import { SignUpPage } from './components/auth/SignUpPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { SourceCitationModal } from './components/common/SourceCitationModal';
import { StartLogoAnimation } from './components/common/StartLogoAnimation';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { CourseCreationWorkspace } from './components/courses/CourseCreationWorkspace';
import { StudySprintView } from './components/courses/StudySprintView';
import { SettingsView } from './components/settings/SettingsView';
import { AppShell, AuthenticatedTab } from './components/layout/AppShell';

import { OverviewView } from './components/student/OverviewView';
import { KnowledgeMapView } from './components/student/KnowledgeMapView';
import { TutorChatView } from './components/student/TutorChatView';
import { AdaptiveQuizView } from './components/student/AdaptiveQuizView';
import { FlashcardsView } from './components/student/FlashcardsView';
import { MaterialsView } from './components/student/MaterialsView';

function AppContent() {
  const { user, signOut } = useAuth();

  // Route state: Starts STRICTLY at '/' on unauthenticated visits
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('/');
  const [publicTab, setPublicTab] = useState<PublicTab>('home');
  const [preservedRedirectPath, setPreservedRedirectPath] = useState<AppRoute>('/app/dashboard');

  // Authenticated workspace sub-tab (Dashboard at the top of navigation)
  const [activeTab, setActiveTab] = useState<AuthenticatedTab>('dashboard');

  // Course & Student Data
  const [profile, setProfile] = useState<StudentProfile>(INITIAL_STUDENT_PROFILE);
  const [concepts, setConcepts] = useState<ConceptNode[]>(CONCEPTS_DATA);
  const [materials, setMaterials] = useState<CourseMaterial[]>(COURSE_MATERIALS);
  const [messages, setMessages] = useState<TutorMessage[]>(INITIAL_TUTOR_MESSAGES);
  const [studyPlan, setStudyPlan] = useState(STUDY_PLAN_DATA);
  const [quizQuestions] = useState(SAMPLE_QUIZ_QUESTIONS);
  const [flashcards] = useState(FLASHCARDS_DATA);

  // Citation inspector modal
  const [inspectingCitation, setInspectingCitation] = useState<any | null>(null);

  const handleSelectPublicTab = (tab: PublicTab) => {
    setPublicTab(tab);
    if (tab === 'home') {
      setCurrentRoute('/');
    } else {
      setCurrentRoute(`/${tab}` as AppRoute);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (route: AppRoute) => {
    setCurrentRoute(route);
    // If routing to a public feature tab, update publicTab
    if (route === '/' || route === '/product') setPublicTab('home');
    else if (route === '/how-it-works') setPublicTab('how-it-works');
    else if (route === '/features') setPublicTab('features');
    else if (route === '/security') setPublicTab('security');
    else if (route === '/accessibility') setPublicTab('accessibility');
    else if (route === '/pricing') setPublicTab('pricing');
    else if (route === '/privacy') setPublicTab('privacy');
    else if (route === '/terms') setPublicTab('terms');
    else if (route === '/faq') setPublicTab('faq');
    else if (route === '/contact') setPublicTab('contact');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRedirectToSignIn = (requestedPath: AppRoute) => {
    setPreservedRedirectPath(requestedPath);
    setCurrentRoute('/sign-in');
  };

  const handleInspectReference = (ref: SourceReference) => {
    setInspectingCitation({
      id: ref.id,
      sourceType: ref.sourceType || ref.documentType || 'video',
      sourceTitle: ref.sourceTitle || ref.documentTitle || 'Course Source',
      locationLabel: ref.locationLabel,
      pageNumber: ref.pageNumber,
      slideNumber: ref.slideNumber,
      timestampSeconds: ref.timestampSeconds,
      excerpt: ref.excerpt,
      contextSnippet: ref.contextSnippet
    });
  };

  // AI Tutor message handler with the 4 distinct answer states
  const handleSendMessage = (text: string, explanationLevel?: string) => {
    const userMsg: TutorMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      let replyText = '';
      let replyCitations: any[] = [];
      let answerState: 'supported' | 'partially_supported' | 'not_found' | 'outside_materials' = 'supported';

      const lower = text.toLowerCase();
      if (lower.includes('red-black') || lower.includes('b-tree') || lower.includes('avl')) {
        // State 3: Not found in course materials
        answerState = 'not_found';
        replyText =
          'This topic (Balanced Trees / Red-Black Trees) was not found in your currently indexed CS 204 courseware (Lecture 08, Textbook Ch. 4, Slide Deck 12, Lab 3). CourseCompass strictly adheres to verified source boundaries.\n\nWould you like an outside conceptual overview, or would you prefer to upload your Balanced Trees slide deck?';
      } else if (lower.includes('base case') || lower.includes('terminate')) {
        // State 1: Supported by course
        answerState = 'supported';
        replyText =
          `Every recursive method requires at least one non-recursive halting base case. As demonstrated by Professor Henderson in Lecture 08 (14:32) and detailed in Textbook Chapter 4 (p. 112), omitting base case parameter progression creates unbounded activation records on the system call stack, triggering a hardware StackOverflowException.\n\nLevel: ${explanationLevel || 'Rigorous'}. Remember: When returning aggregated values, base cases must return the algebraic identity element (0 for summation, true for universal conjunction).`;
        replyCitations = [SAMPLE_CITATIONS.textbookRecursion, SAMPLE_CITATIONS.lectureRecursionVideo];
      } else if (lower.includes('dfs') || lower.includes('cycle') || lower.includes('three-color')) {
        // State 1: Supported by course
        answerState = 'supported';
        replyText =
          'In Depth-First Search on directed graphs, cycle detection relies on three vertex states:\n• White: Unvisited vertex\n• Gray: Currently active on the recursion call stack\n• Black: Subtree completely explored and popped\n\nPer Invariant 3 in Slide Deck 12 (Slide 19), a cycle exists if and only if an edge leads to an active Gray vertex. An edge to a Black vertex is a cross-edge between separate branches, not an ancestor back-edge.';
        replyCitations = [SAMPLE_CITATIONS.slidesGraphDfs];
      } else {
        // State 2: Partially supported
        answerState = 'partially_supported';
        replyText =
          'This question is partially supported by your CS 204 courseware on recursion call stack bounds. The hardware call stack mirrors recursion depth directly. Always verify both the base case halting condition and monotonic progress in arguments before processing subproblems.';
        replyCitations = [SAMPLE_CITATIONS.lectureRecursionVideo];
      }

      const tutorReply: TutorMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'tutor',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        answerState,
        citations: replyCitations
      };

      setMessages((prev) => [...prev, tutorReply]);
    }, 600);
  };

  const handleToggleTask = (dayIndex: number, taskId: string) => {
    setStudyPlan((prev) => {
      const copy = [...prev];
      const targetDay = { ...copy[dayIndex] };
      targetDay.tasks = targetDay.tasks.map((t: any) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      copy[dayIndex] = targetDay;
      return copy;
    });
  };

  const handleCompleteQuiz = (scorePercent: number) => {
    setConcepts((prev) =>
      prev.map((c) => {
        if (c.id === 'c-base-cases') {
          return {
            ...c,
            masteryPercent: Math.min(100, c.masteryPercent + 14),
            status: c.masteryPercent + 14 >= 60 ? 'learning' : 'attention'
          };
        }
        if (c.id === 'c-dfs-traversal') {
          return {
            ...c,
            masteryPercent: Math.min(100, c.masteryPercent + 10),
            status: c.masteryPercent + 10 >= 60 ? 'learning' : 'attention'
          };
        }
        return c;
      })
    );

    setProfile((prev) => ({
      ...prev,
      overallMastery: Math.min(100, prev.overallMastery + 6)
    }));
  };

  const handleOnboardingComplete = (data: any) => {
    setProfile((prev) => ({
      ...prev,
      currentCourse: data.courseName,
      courseCode: data.code,
      examDate: data.examDate,
      dailyStudyMinutes: data.dailyMinutes,
      weakPoints: data.difficulties
    }));
    handleNavigate('/app/overview');
  };

  const handleCourseCreated = (courseData: any) => {
    setProfile((prev) => ({
      ...prev,
      currentCourse: courseData.name,
      examDate: courseData.examDate
    }));
    setMaterials((prev) => [...courseData.documents, ...prev]);
  };

  const handleSwitchSubject = (subject: EnrolledSubject) => {
    setProfile((prev) => ({
      ...prev,
      currentCourse: subject.name,
      courseCode: subject.code,
      examDate: subject.examDate,
      examCountdownDays: subject.daysToExam,
      overallMastery: subject.overallMastery,
      dailyStudyMinutes: subject.dailyGoalMinutes || 45,
      enrolledSubjects: (prev.enrolledSubjects || []).map((s) => ({
        ...s,
        active: s.id === subject.id
      }))
    }));
  };

  const handleAddNewSubject = (newSubject: EnrolledSubject) => {
    setProfile((prev) => {
      const existing = prev.enrolledSubjects || [];
      const updated = [
        newSubject,
        ...existing.map((s) => ({ ...s, active: false }))
      ];
      return {
        ...prev,
        currentCourse: newSubject.name,
        courseCode: newSubject.code,
        examDate: newSubject.examDate,
        examCountdownDays: newSubject.daysToExam,
        overallMastery: newSubject.overallMastery,
        dailyStudyMinutes: newSubject.dailyGoalMinutes || 45,
        enrolledSubjects: updated
      };
    });
  };

  const isPublicRoute =
    currentRoute === '/' ||
    currentRoute === '/product' ||
    currentRoute === '/how-it-works' ||
    currentRoute === '/features' ||
    currentRoute === '/security' ||
    currentRoute === '/accessibility' ||
    currentRoute === '/pricing' ||
    currentRoute === '/privacy' ||
    currentRoute === '/terms' ||
    currentRoute === '/faq' ||
    currentRoute === '/contact';

  return (
    <div className="min-h-screen bg-white text-[#1D1D1F] flex flex-col font-sans-body selection:bg-[#E5E5EA]">
      {/* Startup Logo Animation when web loads */}
      <StartLogoAnimation />

      {/* 1. PUBLIC AREA: Discrete feature views selectable from navbar or footer */}
      {isPublicRoute && (
        <>
          <PublicNavbar
            currentTab={publicTab}
            onSelectTab={handleSelectPublicTab}
            onNavigate={handleNavigate}
          />
          <LandingPage
            currentTab={publicTab}
            onSelectTab={handleSelectPublicTab}
            onNavigate={handleNavigate}
            onInspectCitation={handleInspectReference}
          />
        </>
      )}

      {/* 2. AUTHENTICATION PAGES */}
      {currentRoute === '/sign-in' && (
        <SignInPage
          onNavigate={handleNavigate}
          redirectPath={preservedRedirectPath}
        />
      )}

      {currentRoute === '/sign-up' && (
        <SignUpPage onNavigate={handleNavigate} />
      )}

      {currentRoute === '/forgot-password' && (
        <ForgotPasswordPage onNavigate={handleNavigate} />
      )}

      {/* 3. ONBOARDING (Protected) */}
      {currentRoute === '/onboarding' && (
        <ProtectedRoute
          currentRoute={currentRoute}
          onRedirectToSignIn={handleRedirectToSignIn}
        >
          <OnboardingFlow
            onComplete={handleOnboardingComplete}
            onNavigate={handleNavigate}
          />
        </ProtectedRoute>
      )}

      {/* 4. NEW COURSE WORKSPACE (Protected) */}
      {currentRoute === '/app/courses/new' && (
        <ProtectedRoute
          currentRoute={currentRoute}
          onRedirectToSignIn={handleRedirectToSignIn}
        >
          <div className="py-8 px-4 sm:px-6 max-w-5xl mx-auto">
            <button
              onClick={() => handleNavigate('/app/dashboard')}
              className="text-xs text-[#5D655B] hover:text-[#17241B] font-medium mb-4 inline-block"
            >
              ← Back to Dashboard
            </button>
            <CourseCreationWorkspace
              onCourseCreated={handleCourseCreated}
              onNavigate={handleNavigate}
            />
          </div>
        </ProtectedRoute>
      )}

      {/* 5. AUTHENTICATED APP SHELL & COURSE DASHBOARDS (Protected) */}
      {currentRoute.startsWith('/app') && currentRoute !== '/app/courses/new' && (
        <ProtectedRoute
          currentRoute={currentRoute}
          onRedirectToSignIn={handleRedirectToSignIn}
        >
          <AppShell
            user={user || { id: 'u-1', name: profile.name, email: profile.email, createdAt: '' }}
            profile={profile}
            currentTab={activeTab}
            onNavigateTab={setActiveTab}
            onSignOut={async () => {
              await signOut();
              handleNavigate('/');
            }}
            onNewCourse={() => handleNavigate('/app/courses/new')}
            onSwitchSubject={handleSwitchSubject}
          >
            {(activeTab === 'dashboard' || activeTab === 'overview') && (
              <OverviewView
                profile={profile}
                studyPlan={studyPlan}
                concepts={concepts}
                onNavigateStudent={(tab) => {
                  if (tab === 'quiz') setActiveTab('practice');
                  else if (tab === 'knowledge-map') setActiveTab('map');
                  else if (tab === 'tutor') setActiveTab('tutor');
                  else if (tab === 'flashcards') setActiveTab('revision');
                  else if (tab === 'materials') setActiveTab('materials');
                  else setActiveTab(tab as any);
                }}
                onToggleTask={handleToggleTask}
                onInspectCitation={handleInspectReference}
                onOpenOnboarding={() => handleNavigate('/onboarding')}
                onSwitchSubject={handleSwitchSubject}
                onAddNewSubject={handleAddNewSubject}
              />
            )}

            {activeTab === 'tutor' && (
              <TutorChatView
                messages={messages}
                onSendMessage={handleSendMessage}
                onInspectCitation={handleInspectReference}
                materials={materials}
              />
            )}

            {activeTab === 'map' && (
              <KnowledgeMapView
                concepts={concepts}
                onSelectConceptToQuiz={() => setActiveTab('practice')}
                onSelectConceptToTutor={(concept) => {
                  handleSendMessage(`Can you explain "${concept.name}" and why students struggle with "${concept.primaryMisconception}"?`);
                  setActiveTab('tutor');
                }}
                onInspectCitation={handleInspectReference}
              />
            )}

            {activeTab === 'practice' && (
              <AdaptiveQuizView
                questions={quizQuestions}
                onCompleteQuiz={handleCompleteQuiz}
                onInspectCitation={handleInspectReference}
                onNavigateStudent={(tab) => setActiveTab(tab as any)}
              />
            )}

            {activeTab === 'sprint' && (
              <StudySprintView
                concepts={concepts}
                onInspectCitation={handleInspectReference}
                onFinishSprint={() => setActiveTab('dashboard')}
              />
            )}

            {activeTab === 'mastery' && (
              <div className="space-y-6">
                <div className="bg-white border border-[#E1E4D8] rounded-2xl p-6 shadow-2xs space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-[#E1E4D8]">
                    <div>
                      <h2 className="font-serif-display text-xl font-bold text-[#263F2B]">
                        Topic & Concept Mastery Dashboard
                      </h2>
                      <p className="text-xs text-[#5D655B]">
                        Calculated deterministically through diagnostic quiz performance and prerequisite checks.
                      </p>
                    </div>
                    <span className="font-mono-code text-sm font-bold text-[#263F2B]">
                      {profile.overallMastery}% Overall
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {concepts.map((c) => (
                      <div
                        key={c.id}
                        className="p-4 rounded-xl bg-[#F8F7EF] border border-[#E1E4D8] space-y-2 text-xs"
                      >
                        <div className="flex justify-between items-center font-semibold">
                          <span className="text-[#17241B]">{c.name}</span>
                          <span
                            className={`font-mono-code ${
                              c.masteryPercent >= 70
                                ? 'text-emerald-700'
                                : c.masteryPercent < 50
                                ? 'text-[#D71935]'
                                : 'text-[#697650]'
                            }`}
                          >
                            {c.masteryPercent}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-[#E1E4D8] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              c.masteryPercent >= 70
                                ? 'bg-[#263F2B]'
                                : c.masteryPercent < 50
                                ? 'bg-[#D71935]'
                                : 'bg-[#A8B594]'
                            }`}
                            style={{ width: `${c.masteryPercent}%` }}
                          ></div>
                        </div>
                        <p className="text-[11px] text-[#5D655B]">{c.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'study-plan' && (
              <OverviewView
                profile={profile}
                studyPlan={studyPlan}
                concepts={concepts}
                onNavigateStudent={(tab) => setActiveTab(tab as any)}
                onToggleTask={handleToggleTask}
                onInspectCitation={handleInspectReference}
                onOpenOnboarding={() => handleNavigate('/onboarding')}
              />
            )}

            {activeTab === 'revision' && (
              <FlashcardsView
                cards={flashcards}
                onInspectCitationByAnchor={(anchor) => {
                  const found = Object.values(SAMPLE_CITATIONS).find((c) =>
                    c.locationLabel.toLowerCase().includes(anchor.toLowerCase())
                  );
                  if (found) handleInspectReference(found);
                }}
              />
            )}

            {activeTab === 'materials' && (
              <MaterialsView
                materials={materials}
                onAddMaterial={(mat) => setMaterials((prev) => [mat, ...prev])}
                onInspectCitation={handleInspectReference}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                user={user || { id: 'u-1', name: profile.name, email: profile.email, createdAt: '' }}
                profile={profile}
                onUpdateProfile={(updated) => setProfile((prev) => ({ ...prev, ...updated }))}
                onDeleteCourse={() => {
                  handleNavigate('/app/courses/new');
                }}
                onDeleteAccount={async () => {
                  await signOut();
                  handleNavigate('/');
                }}
              />
            )}
          </AppShell>
        </ProtectedRoute>
      )}

      {/* Verified Citation Modal for inspecting excerpts */}
      <SourceCitationModal
        citation={inspectingCitation}
        onClose={() => setInspectingCitation(null)}
        onAskAboutCitation={(cite) => {
          setActiveTab('tutor');
          handleSendMessage(`Can you explain the citation from "${cite.sourceTitle}" (${cite.locationLabel}) in more detail: "${cite.excerpt}"?`);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
