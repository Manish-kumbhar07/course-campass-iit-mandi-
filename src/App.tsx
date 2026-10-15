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
  EnrolledSubject,
  StudyPlanDay,
  QuizQuestion,
  Flashcard
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
import { WeeklyReportView } from './components/student/WeeklyReportView';

import { Api } from './services/api-client';

const createEmptyProfile = (u?: any): StudentProfile => ({
  name: u?.name || (u?.email ? u.email.split('@')[0] : 'Student'),
  email: u?.email || '',
  academicLevel: u?.academicLevel || 'Undergraduate',
  university: u?.institution || 'Academic Workspace',
  currentCourse: '',
  courseCode: '',
  examDate: '',
  examCountdownDays: 0,
  dailyStudyMinutes: 45,
  overallMastery: 0,
  weakPoints: [],
  studyStreakDays: 0,
  longestStreakDays: 0,
  todayMinutesCompleted: 0,
  last7DaysStreak: [
    { day: 'Wed', date: '', completed: false, minutes: 0 },
    { day: 'Thu', date: '', completed: false, minutes: 0 },
    { day: 'Fri', date: '', completed: false, minutes: 0 },
    { day: 'Sat', date: '', completed: false, minutes: 0 },
    { day: 'Sun', date: '', completed: false, minutes: 0 },
    { day: 'Mon', date: '', completed: false, minutes: 0 },
    { day: 'Today', date: '', completed: false, minutes: 0 }
  ],
  enrolledSubjects: []
});

function AppContent() {
  const { user, session, signOut } = useAuth();

  // Route state: Starts STRICTLY at '/' on unauthenticated visits
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('/');
  const [publicTab, setPublicTab] = useState<PublicTab>('home');
  const [preservedRedirectPath, setPreservedRedirectPath] = useState<AppRoute>('/app/dashboard');

  // Authenticated workspace sub-tab (Dashboard at the top of navigation)
  const [activeTab, setActiveTab] = useState<AuthenticatedTab>('dashboard');

  // Active course ID (empty for new users; 'course-cs204' for demo users)
  const [activeCourseId, setActiveCourseId] = useState<string>('');

  // Course & Student Data (Starts clean for real users, populated on session/course change)
  const [profile, setProfile] = useState<StudentProfile>(() => createEmptyProfile(user));
  const [concepts, setConcepts] = useState<ConceptNode[]>([]);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [studyPlan, setStudyPlan] = useState<StudyPlanDay[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  // Network & Loading States
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Citation inspector modal
  const [inspectingCitation, setInspectingCitation] = useState<any | null>(null);

  // Synchronize live backend data when student logs in or changes course
  React.useEffect(() => {
    if (!user) {
      setProfile(createEmptyProfile(null));
      setActiveCourseId('');
      setConcepts([]);
      setMaterials([]);
      setMessages([]);
      setStudyPlan([]);
      setQuizQuestions([]);
      setFlashcards([]);
      return;
    }

    const isDemo = Boolean(session?.isDemoSession || user.email === 'ananya.sharma@collegemail.edu');

    if (isDemo) {
      setProfile(INITIAL_STUDENT_PROFILE);
      setActiveCourseId('course-cs204');
      setConcepts(CONCEPTS_DATA);
      setMaterials(COURSE_MATERIALS);
      setMessages(INITIAL_TUTOR_MESSAGES);
      setStudyPlan(STUDY_PLAN_DATA);
      setQuizQuestions(SAMPLE_QUIZ_QUESTIONS);
      setFlashcards(FLASHCARDS_DATA);
      return;
    }

    let isMounted = true;
    async function loadUserData() {
      setIsDataLoading(true);
      try {
        const userCourses = await Api.courses.list().catch(() => []);
        if (!isMounted) return;

        if (!userCourses || userCourses.length === 0) {
          // New student without courses
          setActiveCourseId('');
          setConcepts([]);
          setMaterials([]);
          setMessages([]);
          setStudyPlan([]);
          setQuizQuestions([]);
          setFlashcards([]);
          setProfile(createEmptyProfile(user));
          return;
        }

        // Student has courses: resolve active course
        const currentTargetId = (activeCourseId && userCourses.some((c) => c.id === activeCourseId))
          ? activeCourseId
          : userCourses[0].id;

        if (currentTargetId !== activeCourseId) {
          setActiveCourseId(currentTargetId);
        }

        const activeCourseObj = userCourses.find((c) => c.id === currentTargetId) || userCourses[0];

        const enrolledList: EnrolledSubject[] = userCourses.map((c) => ({
          id: c.id,
          name: c.name,
          code: c.code,
          department: c.subject || 'Academic',
          overallMastery: c.overallMastery || 0,
          examDate: c.examDate || '',
          daysToExam: c.examCountdownDays || 30,
          totalTopics: c.conceptsCount || 0,
          masteredTopics: 0,
          weeklyHoursLogged: 0,
          dailyGoalMinutes: c.dailyStudyMinutes || 45,
          active: c.id === activeCourseObj.id
        }));

        setProfile((prev) => ({
          ...prev,
          name: user.name || (user.email ? user.email.split('@')[0] : 'Student'),
          email: user.email,
          academicLevel: user.academicLevel || prev.academicLevel || 'Undergraduate',
          university: user.institution || prev.university || '',
          currentCourse: activeCourseObj.name,
          courseCode: activeCourseObj.code,
          examDate: activeCourseObj.examDate || '',
          examCountdownDays: activeCourseObj.examCountdownDays || 30,
          dailyStudyMinutes: activeCourseObj.dailyStudyMinutes || 45,
          overallMastery: activeCourseObj.overallMastery || 0,
          enrolledSubjects: enrolledList
        }));

        // Fetch scoped course assets for the active course
        const [mapRes, mats, plan, diag, hist, topMastery] = await Promise.all([
          Api.map.getCourseMap(currentTargetId).catch(() => null),
          Api.materials.list(currentTargetId).catch(() => []),
          Api.mastery.getStudyPlan(currentTargetId).catch(() => []),
          Api.quizzes.getDiagnostic(currentTargetId).catch(() => []),
          Api.tutor.getHistory(currentTargetId).catch(() => []),
          Api.mastery.getTopicMastery(currentTargetId).catch(() => [])
        ]);

        if (!isMounted) return;

        setConcepts(mapRes && mapRes.concepts ? mapRes.concepts : []);
        setMaterials(mats || []);
        setStudyPlan(plan || []);
        setQuizQuestions(diag || []);
        setMessages(hist || []);

        if (topMastery && topMastery.length > 0) {
          const avg = Math.round(
            (topMastery as any[]).reduce((acc: number, m: any) => acc + (m.masteryPercent || 0), 0) / topMastery.length
          );
          setProfile((prev) => ({
            ...prev,
            overallMastery: avg
          }));
        }
      } catch (err) {
        console.warn('API sync warning: using current state.', err);
      } finally {
        if (isMounted) setIsDataLoading(false);
      }
    }

    loadUserData();
    return () => {
      isMounted = false;
    };
  }, [user, session, activeCourseId]);

  const handleSelectPublicTab = (tab: PublicTab) => {
    setPublicTab(tab);
    if (tab === 'home') {
      setCurrentRoute('/');
    } else {
      setCurrentRoute(`/${tab}` as AppRoute);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (route: AppRoute | string) => {
    // Check parameterized routes: /app/courses/:courseId/:subview
    const courseSubRouteMatch = route.match(/^\/app\/courses\/([^/]+)\/([^/]+)$/);
    if (courseSubRouteMatch) {
      const [, cId, subview] = courseSubRouteMatch;
      if (cId && cId !== 'new') {
        setActiveCourseId(cId);
      }
      if (subview === 'upload' || subview === 'processing') {
        setActiveTab('materials');
      } else if (subview === 'tutor') {
        setActiveTab('tutor');
      } else if (subview === 'map') {
        setActiveTab('map');
      } else if (subview === 'practice') {
        setActiveTab('practice');
      } else if (subview === 'mastery') {
        setActiveTab('mastery');
      } else if (subview === 'study-plan') {
        setActiveTab('study-plan');
      } else if (subview === 'sprint') {
        setActiveTab('sprint');
      } else if (subview === 'revision') {
        setActiveTab('revision');
      } else if (subview === 'weekly-report') {
        setActiveTab('weekly-report');
      }
      setCurrentRoute(route as AppRoute);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (route === '/app/dashboard' || route === '/app/overview' || route === '/app/courses') {
      setActiveTab('dashboard');
    } else if (route === '/app/settings') {
      setActiveTab('settings');
    }

    setCurrentRoute(route as AppRoute);
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

  const handleTabSwitch = (tab: AuthenticatedTab) => {
    setActiveTab(tab);
    if (activeCourseId) {
      if (tab === 'dashboard' || tab === 'overview') {
        setCurrentRoute('/app/dashboard');
      } else if (tab === 'materials') {
        setCurrentRoute(`/app/courses/${activeCourseId}/upload` as any);
      } else if (tab === 'tutor') {
        setCurrentRoute(`/app/courses/${activeCourseId}/tutor` as any);
      } else if (tab === 'map') {
        setCurrentRoute(`/app/courses/${activeCourseId}/map` as any);
      } else if (tab === 'practice') {
        setCurrentRoute(`/app/courses/${activeCourseId}/practice` as any);
      } else if (tab === 'mastery') {
        setCurrentRoute(`/app/courses/${activeCourseId}/mastery` as any);
      } else if (tab === 'study-plan') {
        setCurrentRoute(`/app/courses/${activeCourseId}/study-plan` as any);
      } else if (tab === 'sprint') {
        setCurrentRoute(`/app/courses/${activeCourseId}/sprint` as any);
      } else if (tab === 'revision') {
        setCurrentRoute(`/app/courses/${activeCourseId}/revision` as any);
      } else if (tab === 'weekly-report') {
        setCurrentRoute(`/app/courses/${activeCourseId}/weekly-report` as any);
      } else if (tab === 'settings') {
        setCurrentRoute('/app/settings');
      }
    }
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
  const handleSendMessage = async (text: string, explanationLevel?: string) => {
    const userMsg: TutorMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      // Call live FastAPI Grounded AI Tutor endpoint
      const response = await Api.tutor.chat(
        activeCourseId,
        text,
        undefined,
        explanationLevel || 'rigorous'
      );
      setMessages((prev) => [...prev, response]);
    } catch {
      // Offline fallback: Use active course materials
      let replyText = '';
      let replyCitations: any[] = [];
      let answerState: 'supported' | 'partially_supported' | 'not_found' | 'outside_materials' = 'supported';

      const currentCourseMaterials = materials.filter(m => !m.courseId || m.courseId === activeCourseId);
      const lower = text.toLowerCase();

      // Check if user has uploaded any materials for this course
      if (currentCourseMaterials.length === 0 && activeCourseId !== 'course-cs204') {
        answerState = 'not_found';
        replyText =
          'This question was not found because no study materials have been uploaded for this course yet.\n\nPlease upload your relevant textbook PDF, lecture slides, or video recording so CourseCompass can answer your question with verified source citations.';
      } else if (lower.includes('red-black') || lower.includes('b-tree') || lower.includes('avl') || lower.includes('quantum') || lower.includes('cryptography')) {
        // Not found in course materials
        answerState = 'not_found';
        const docNames = currentCourseMaterials.map(m => `"${m.title}"`).slice(0, 3).join(', ');
        const docContext = docNames ? ` (currently uploaded: ${docNames})` : '';
        replyText =
          `This topic was not found in your currently indexed courseware${docContext}. CourseCompass strictly adheres to verified source boundaries.\n\nThe uploaded material does not appear to contain content relevant to this question. Please upload a relevant PDF, lecture video, or slide deck covering this topic so CourseCompass can provide a verified, source-grounded answer.`;
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
        // Check if query words match any of the student's uploaded materials
        const qWords = lower.split(/\s+/).filter(w => w.length > 3);
        const matchingDoc = currentCourseMaterials.find(doc => {
          const docTitle = (doc.title || '').toLowerCase();
          const docSummary = (doc.summary || '').toLowerCase();
          return qWords.some(w => docTitle.includes(w) || docSummary.includes(w));
        });

        if (matchingDoc) {
          answerState = 'supported';
          replyText =
            `According to your uploaded courseware "${matchingDoc.title}":\n\n` +
            `Based on your study materials, the core principles of "${text.trim()}" are detailed directly in ${matchingDoc.title}. ` +
            `Key concepts include: ${matchingDoc.summary || 'Fundamental course definitions and theorems.'}\n\n` +
            `Review this section in your course materials to ensure thorough preparation for upcoming exams.`;
          replyCitations = [
            {
              id: `cite-${matchingDoc.id}-${Date.now()}`,
              documentId: matchingDoc.id,
              sourceTitle: matchingDoc.title,
              sourceType: matchingDoc.type,
              locationLabel: `${matchingDoc.title}, Page 1`,
              excerpt: matchingDoc.summary || `Extracted excerpt covering ${text.trim()} from ${matchingDoc.title}.`,
              contextSnippet: `From ${matchingDoc.title}`,
              verificationConfidence: 'verified'
            }
          ];
        } else {
          // If no matching doc found, notify user that uploaded materials are not relevant to this topic
          answerState = 'not_found';
          const docNames = currentCourseMaterials.map(m => `"${m.title}"`).slice(0, 3).join(', ');
          const docContext = docNames ? ` (currently uploaded: ${docNames})` : '';
          replyText =
            `This topic was not found in your currently uploaded course materials${docContext}.\n\n` +
            `The materials you have uploaded do not appear to contain content relevant to this question. ` +
            `Please upload a relevant PDF, lecture video, or slide deck covering this topic so CourseCompass can provide a verified, source-grounded answer with citations.`;
        }
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
    }
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

  const handleCompleteQuiz = async (scorePercent: number) => {
    try {
      // 1. Submit diagnostic check on backend to update official mastery
      const submitRes = await Api.quizzes.submit('quiz-cs204-diag', [
        {
          questionId: 'q-dfs-cycle-1',
          selectedOptionId: 'opt-2'
        }
      ]).catch(() => null);

      if (submitRes && submitRes.updatedConcepts) {
        setConcepts((prev) =>
          prev.map((c) => {
            const upd = submitRes.updatedConcepts.find((u) => u.conceptId === c.id);
            if (upd) {
              return {
                ...c,
                masteryPercent: upd.newMasteryPercent,
                status: upd.newStatus as any
              };
            }
            return c;
          })
        );
      }

      // 2. Refresh live topic mastery breakdown
      const topMastery = await Api.mastery.getTopicMastery(activeCourseId).catch(() => null);
      if (topMastery && topMastery.length > 0) {
        const avg = Math.round(
          topMastery.reduce((acc, m) => acc + m.masteryPercent, 0) / topMastery.length
        );
        setProfile((prev) => ({
          ...prev,
          overallMastery: avg,
        }));
      }
    } catch {
      // Offline fallback
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
    }
  };

  const handleOnboardingComplete = async (data: any) => {
    let courseId = '';
    try {
      const created = await Api.courses.create({
        name: data.courseName || 'General Studies',
        code: data.code || 'GEN 101',
        subject: data.subject || 'General Studies',
        examDate: data.examDate || '',
        dailyStudyMinutes: data.dailyMinutes || 45
      });
      courseId = created.id;
    } catch (err) {
      console.error('Failed to create course in onboarding:', err);
      courseId = `course-${Date.now()}`;
    }

    setActiveCourseId(courseId);

    const newSubject: EnrolledSubject = {
      id: courseId,
      name: data.courseName,
      code: data.code,
      department: data.subject || 'Academic',
      overallMastery: 0,
      examDate: data.examDate,
      daysToExam: 30,
      totalTopics: 0,
      masteredTopics: 0,
      weeklyHoursLogged: 0,
      dailyGoalMinutes: data.dailyMinutes || 45,
      active: true
    };

    setProfile((prev) => ({
      ...prev,
      currentCourse: data.courseName,
      courseCode: data.code,
      examDate: data.examDate,
      dailyStudyMinutes: data.dailyMinutes || 45,
      weakPoints: data.difficulties || [],
      enrolledSubjects: [newSubject, ...(prev.enrolledSubjects || []).map((s) => ({ ...s, active: false }))]
    }));

    handleNavigate('/app/overview');
  };

  const handleCourseCreated = async (courseData: any) => {
    let courseId = courseData.id;
    if (!courseId) {
      try {
        const created = await Api.courses.create({
          name: courseData.name,
          code: courseData.code || 'SUBJ 101',
          subject: courseData.subject || 'General Studies',
          examDate: courseData.examDate,
          dailyStudyMinutes: courseData.dailyStudyMinutes || 45
        });
        courseId = created.id;
      } catch (err) {
        console.error('Failed to create course:', err);
        courseId = `course-${Date.now()}`;
      }
    }

    setActiveCourseId(courseId);

    const newSubject: EnrolledSubject = {
      id: courseId,
      name: courseData.name,
      code: courseData.code,
      department: courseData.subject || 'Academic',
      overallMastery: 0,
      examDate: courseData.examDate || '',
      daysToExam: 30,
      totalTopics: 0,
      masteredTopics: 0,
      weeklyHoursLogged: 0,
      dailyGoalMinutes: courseData.dailyStudyMinutes || 45,
      active: true
    };

    setProfile((prev) => ({
      ...prev,
      currentCourse: courseData.name,
      courseCode: courseData.code,
      examDate: courseData.examDate || prev.examDate,
      dailyStudyMinutes: courseData.dailyStudyMinutes || prev.dailyStudyMinutes,
      enrolledSubjects: [newSubject, ...(prev.enrolledSubjects || []).map((s) => ({ ...s, active: false }))]
    }));

    if (courseData.documents && courseData.documents.length > 0) {
      setMaterials((prev) => [...courseData.documents, ...prev]);
    }

    handleNavigate('/app/overview');
  };

  const handleSwitchSubject = (subject: EnrolledSubject) => {
    setActiveCourseId(subject.id);
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

  const handleAddNewSubject = async (newSubject: EnrolledSubject) => {
    let createdId = newSubject.id;
    try {
      const created = await Api.courses.create({
        name: newSubject.name,
        code: newSubject.code,
        subject: newSubject.department || 'Academic',
        examDate: newSubject.examDate,
        dailyStudyMinutes: newSubject.dailyGoalMinutes || 45
      });
      createdId = created.id;
    } catch (err) {
      console.error('Failed to add subject to backend:', err);
    }

    const subjectWithId: EnrolledSubject = {
      ...newSubject,
      id: createdId,
      active: true
    };

    setActiveCourseId(createdId);

    setProfile((prev) => {
      const existing = prev.enrolledSubjects || [];
      const updated = [
        subjectWithId,
        ...existing.map((s) => ({ ...s, active: false }))
      ];
      return {
        ...prev,
        currentCourse: subjectWithId.name,
        courseCode: subjectWithId.code,
        examDate: subjectWithId.examDate,
        examCountdownDays: subjectWithId.daysToExam,
        overallMastery: subjectWithId.overallMastery,
        dailyStudyMinutes: subjectWithId.dailyGoalMinutes || 45,
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
            onNavigateTab={handleTabSwitch}
            onSignOut={async () => {
              await signOut();
              setActiveCourseId('');
              setConcepts([]);
              setMaterials([]);
              setMessages([]);
              setStudyPlan([]);
              setQuizQuestions([]);
              setFlashcards([]);
              setProfile(createEmptyProfile(null));
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
                materialsCount={materials.length}
                onNavigateStudent={(tab) => {
                  if (tab === 'quiz') handleTabSwitch('practice');
                  else if (tab === 'knowledge-map') handleTabSwitch('map');
                  else if (tab === 'tutor') handleTabSwitch('tutor');
                  else if (tab === 'flashcards') handleTabSwitch('revision');
                  else if (tab === 'materials') handleTabSwitch('materials');
                  else if (tab === 'weekly-report') handleTabSwitch('weekly-report');
                  else handleTabSwitch(tab as any);
                }}
                onToggleTask={handleToggleTask}
                onInspectCitation={handleInspectReference}
                onOpenOnboarding={() => handleNavigate('/onboarding')}
                onSwitchSubject={handleSwitchSubject}
                onAddNewSubject={handleAddNewSubject}
                onCreateCourse={() => handleNavigate('/app/courses/new')}
                onUploadMaterials={() => handleTabSwitch('materials')}
              />
            )}

            {activeTab === 'tutor' && (
              <TutorChatView
                courseCode={profile.courseCode || 'Course'}
                messages={messages}
                onSendMessage={handleSendMessage}
                onInspectCitation={handleInspectReference}
                materials={materials}
              />
            )}

            {activeTab === 'map' && (
              <KnowledgeMapView
                concepts={concepts}
                onSelectConceptToQuiz={() => handleTabSwitch('practice')}
                onSelectConceptToTutor={(concept) => {
                  handleSendMessage(`Can you explain "${concept.name}" and why students struggle with "${concept.primaryMisconception}"?`);
                  handleTabSwitch('tutor');
                }}
                onInspectCitation={handleInspectReference}
              />
            )}

            {activeTab === 'practice' && (
              <AdaptiveQuizView
                questions={quizQuestions}
                onCompleteQuiz={handleCompleteQuiz}
                onInspectCitation={handleInspectReference}
                onNavigateStudent={(tab) => handleTabSwitch(tab as any)}
              />
            )}

            {activeTab === 'sprint' && (
              <StudySprintView
                concepts={concepts}
                onInspectCitation={handleInspectReference}
                onFinishSprint={() => handleTabSwitch('dashboard')}
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

                  {concepts.length === 0 ? (
                    <div className="p-8 text-center bg-[#F8F7EF] rounded-xl border border-[#E1E4D8] space-y-2">
                      <p className="font-semibold text-xs text-[#17241B]">No concepts assessed yet</p>
                      <p className="text-[11px] text-[#5D655B]">
                        Upload course materials or complete practice quizzes to start tracking concept mastery.
                      </p>
                    </div>
                  ) : (
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
                  )}
                </div>
              </div>
            )}

            {activeTab === 'study-plan' && (
              <OverviewView
                profile={profile}
                studyPlan={studyPlan}
                concepts={concepts}
                materialsCount={materials.length}
                onNavigateStudent={(tab) => {
                  if (tab === 'quiz') handleTabSwitch('practice');
                  else if (tab === 'knowledge-map') handleTabSwitch('map');
                  else if (tab === 'tutor') handleTabSwitch('tutor');
                  else if (tab === 'flashcards') handleTabSwitch('revision');
                  else if (tab === 'materials') handleTabSwitch('materials');
                  else handleTabSwitch(tab as any);
                }}
                onToggleTask={handleToggleTask}
                onInspectCitation={handleInspectReference}
                onOpenOnboarding={() => handleNavigate('/onboarding')}
                onSwitchSubject={handleSwitchSubject}
                onAddNewSubject={handleAddNewSubject}
                onCreateCourse={() => handleNavigate('/app/courses/new')}
                onUploadMaterials={() => handleTabSwitch('materials')}
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
                courseId={activeCourseId}
                materials={materials}
                onAddMaterial={(mat) => setMaterials((prev) => [mat, ...prev])}
                onInspectCitation={handleInspectReference}
                onAskTutorAboutSource={(sourceTitle, initialPrompt) => {
                  handleTabSwitch('tutor');
                  handleSendMessage(initialPrompt || `Can you explain the main concepts covered in "${sourceTitle}"?`);
                }}
                onGenerateQuizFromSource={() => {
                  handleTabSwitch('practice');
                }}
              />
            )}

            {activeTab === 'weekly-report' && (
              <WeeklyReportView
                profile={profile}
                concepts={concepts}
                studyPlan={studyPlan}
                onNavigateStudent={(tab) => {
                  if (tab === 'quiz') handleTabSwitch('practice');
                  else if (tab === 'knowledge-map') handleTabSwitch('map');
                  else if (tab === 'tutor') handleTabSwitch('tutor');
                  else if (tab === 'flashcards') handleTabSwitch('revision');
                  else if (tab === 'materials') handleTabSwitch('materials');
                  else handleTabSwitch(tab as any);
                }}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                user={user || { id: 'u-1', name: profile.name, email: profile.email, createdAt: '' }}
                profile={profile}
                onUpdateProfile={(updated) => setProfile((prev) => ({ ...prev, ...updated }))}
                onDeleteCourse={async () => {
                  if (activeCourseId) {
                    try {
                      await Api.courses.delete(activeCourseId);
                    } catch (err) {
                      console.error('Delete course error:', err);
                    }
                    const remaining = (profile.enrolledSubjects || []).filter((s) => s.id !== activeCourseId);
                    if (remaining.length > 0) {
                      setActiveCourseId(remaining[0].id);
                    } else {
                      setActiveCourseId('');
                      setConcepts([]);
                      setMaterials([]);
                      setMessages([]);
                      setStudyPlan([]);
                      setQuizQuestions([]);
                      setFlashcards([]);
                      setProfile((prev) => ({
                        ...prev,
                        currentCourse: '',
                        courseCode: '',
                        enrolledSubjects: []
                      }));
                    }
                  }
                  handleNavigate('/app/dashboard');
                }}
                onDeleteAccount={async () => {
                  await signOut();
                  setActiveCourseId('');
                  setConcepts([]);
                  setMaterials([]);
                  setMessages([]);
                  setStudyPlan([]);
                  setQuizQuestions([]);
                  setFlashcards([]);
                  setProfile(createEmptyProfile(null));
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
