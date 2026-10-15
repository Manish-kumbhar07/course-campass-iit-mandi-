export type AppRoute =
  | '/'
  | '/product'
  | '/how-it-works'
  | '/features'
  | '/security'
  | '/accessibility'
  | '/pricing'
  | '/privacy'
  | '/terms'
  | '/contact'
  | '/faq'
  | '/sign-in'
  | '/sign-up'
  | '/forgot-password'
  | '/reset-password'
  | '/verify-email'
  | '/auth/callback'
  | '/onboarding'
  | '/app/dashboard'
  | '/app/overview'
  | '/app/courses'
  | '/app/courses/new'
  | '/app/courses/:courseId'
  | '/app/courses/:courseId/upload'
  | '/app/courses/:courseId/materials'
  | '/app/courses/:courseId/processing'
  | '/app/courses/:courseId/tutor'
  | '/app/courses/:courseId/map'
  | '/app/courses/:courseId/practice'
  | '/app/courses/:courseId/mastery'
  | '/app/courses/:courseId/weekly-report'
  | '/app/courses/:courseId/study-plan'
  | '/app/courses/:courseId/sprint'
  | '/app/courses/:courseId/revision'
  | '/app/settings'
  | '/app/settings/privacy'
  | '/app/settings/security';

export type AppArea = 'public' | 'student';
export type PublicTab =
  | 'home'
  | 'how-it-works'
  | 'features'
  | 'security'
  | 'accessibility'
  | 'pricing'
  | 'privacy'
  | 'terms'
  | 'contact'
  | 'faq';
export type StudentTab =
  | 'dashboard'
  | 'overview'
  | 'materials'
  | 'tutor'
  | 'knowledge-map'
  | 'quiz'
  | 'practice'
  | 'flashcards'
  | 'revision'
  | 'mastery'
  | 'weekly-report'
  | 'settings'
  | 'help'
  | 'courses-new';

export interface User {
  id: string;
  name: string;
  email: string;
  academicLevel?: string;
  institution?: string;
  isNewUser?: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export interface Session {
  user: User;
  token: string;
  expiresAt: string;
  isDemoSession?: boolean;
}

export interface Course {
  id: string;
  userId: string;
  name: string;
  code: string;
  subject: string;
  examDate?: string;
  examCountdownDays?: number;
  dailyStudyMinutes: number;
  overallMastery: number;
  documentsCount: number;
  conceptsCount: number;
  createdAt: string;
  updatedAt: string;
}

export type DocumentType = 'pdf' | 'video' | 'slides' | 'audio' | 'image' | 'notes' | 'youtube';
export type MaterialType = DocumentType;


export interface CourseDocument {
  id: string;
  courseId?: string;
  title: string;
  type: DocumentType;
  fileSizeBytes?: number;
  formattedSize?: string;
  size?: string;
  pageCountOrDuration?: string;
  durationOrPages?: string;
  uploadedAt?: string;
  dateAdded?: string;
  status: 'uploaded' | 'processing' | 'indexed' | 'failed' | 'ready' | 'processed';
  extractedConcepts: string[];
  summary?: string;
  description?: string;
}

export type CourseMaterial = CourseDocument;

export interface YouTubeSection {
  timestamp_seconds: number;
  timestamp_display: string;
  heading: string;
  summary: string;
  key_points: string[];
}

export interface YouTubeDefinition {
  term: string;
  definition: string;
  context?: string;
}

export interface YouTubeConfusingArea {
  topic: string;
  common_misconception: string;
  clarification: string;
}

export interface YouTubeSuggestedFlashcard {
  front: string;
  back: string;
  tag?: string;
}

export interface YouTubeSummary {
  source_id: string;
  video_id: string;
  url: string;
  title: string;
  channel: string;
  duration_seconds: number;
  duration_display: string;
  overview: string;
  sections: YouTubeSection[];
  core_definitions: YouTubeDefinition[];
  confusing_areas: YouTubeConfusingArea[];
  suggested_flashcards: YouTubeSuggestedFlashcard[];
  key_takeaways: string[];
}


export interface ProcessingJob {
  id: string;
  documentId: string;
  stage:
    | 'secure_upload'
    | 'reading_content'
    | 'understanding_diagrams'
    | 'transcribing_lecture'
    | 'finding_concepts'
    | 'building_prerequisites'
    | 'ready';
  stageNumber: number;
  totalStages: number;
  stageDescription: string;
  progressPercent: number;
  isCompleted: boolean;
  error?: string;
}

export interface SourceReference {
  id: string;
  documentId?: string;
  documentTitle?: string;
  sourceTitle: string;
  documentType?: DocumentType;
  sourceType: DocumentType;
  locationLabel: string; // e.g. "Page 112", "Slide 19", "14:32"
  pageNumber?: number;
  slideNumber?: number;
  timestampSeconds?: number;
  timestampLabel?: string;
  excerpt: string;
  contextSnippet: string;
  verificationConfidence?: 'verified' | 'partial' | 'inconclusive';
}

export type SourceCitation = SourceReference;

export type TutorAnswerState =
  | 'supported'
  | 'partially_supported'
  | 'not_found'
  | 'outside_materials';

export interface TutorAnswer {
  id: string;
  question: string;
  answerText: string;
  state: TutorAnswerState;
  citations: SourceReference[];
  conceptId?: string;
  explanationLevel?: 'introductory' | 'rigorous' | 'exam_prep';
  createdAt: string;
}

export interface TutorMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
  answerState?: TutorAnswerState;
  citations?: SourceReference[];
  unsupportedWarning?: string;
  conceptId?: string;
}

export interface Topic {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  conceptIds: string[];
}

export interface Concept {
  id: string;
  courseId?: string;
  topicId?: string;
  topic?: string;
  name: string;
  difficulty: 'Foundational' | 'Intermediate' | 'Advanced';
  masteryPercent: number;
  status: 'mastered' | 'learning' | 'attention' | 'locked';
  summary: string;
  primaryMisconception: string;
  prerequisiteIds: string[];
  dependentConceptIds?: string[];
  citations: SourceReference[];
}

export type ConceptNode = Concept;

export interface ConceptRelationship {
  sourceConceptId: string;
  targetConceptId: string;
  relationshipType: 'prerequisite' | 'component' | 'extension';
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  misconceptionExplanation?: string;
}

export interface QuizQuestion {
  id: string;
  conceptId: string;
  conceptName: string;
  topicName?: string;
  prompt: string;
  codeSnippet?: string;
  questionType?: 'multiple_choice' | 'short_answer' | 'numerical';
  difficulty?: 'Foundational' | 'Intermediate' | 'Advanced';
  options: QuizOption[];
  explanation: string;
  citation: SourceReference;
}

export interface QuizAttempt {
  id: string;
  courseId: string;
  quizTitle: string;
  startedAt: string;
  completedAt?: string;
  scorePercent: number;
  totalQuestions: number;
  correctCount: number;
  weakConceptsIdentified: string[];
  masteryGainPercent: number;
  status: 'in_progress' | 'completed';
}

export interface TopicMastery {
  topicId: string;
  topicTitle: string;
  masteryPercent: number;
  conceptsTotal: number;
  conceptsMastered: number;
  conceptsDeveloping: number;
  conceptsAttention: number;
}

export interface Misconception {
  id: string;
  conceptId: string;
  conceptName: string;
  studentConfusion: string;
  diagnosticAdvice: string;
  citedSource: SourceReference;
}

export interface StudyRecommendation {
  id: string;
  conceptId: string;
  conceptName: string;
  urgency: 'high' | 'medium' | 'low';
  reason: string;
  suggestedAction: 'quiz' | 'tutor' | 'flashcard' | 'reading';
  estimatedMinutes: number;
}

export interface StudyPlanDay {
  dayNumber: number;
  dateString: string;
  focusConceptId: string;
  focusTitle: string;
  minutesBudget: number;
  status: 'completed' | 'in-progress' | 'scheduled';
  tasks: {
    id: string;
    title: string;
    durationMinutes: number;
    completed: boolean;
    type: 'tutor' | 'quiz' | 'flashcard' | 'reading';
    targetCitation?: SourceReference;
  }[];
}

export type StudyPlanItem = StudyPlanDay;

export interface Flashcard {
  id: string;
  conceptId: string;
  conceptName: string;
  topic?: string;
  topicTitle?: string;
  front: string;
  back: string;
  sourceAnchor: string;
  repetitionStage: 'New' | 'Review' | 'Mastered';
  lastReviewedAt?: string;
}

export interface EnrolledSubject {
  id: string;
  name: string;
  code: string;
  department: string;
  overallMastery: number;
  examDate: string;
  daysToExam: number;
  totalTopics: number;
  masteredTopics: number;
  weeklyHoursLogged: number;
  dailyGoalMinutes?: number;
  colorTheme?: string;
  active?: boolean;
}

export interface StudentProfile {
  name: string;
  email: string;
  academicLevel: string;
  university: string;
  currentCourse: string;
  courseCode: string;
  examDate: string;
  examCountdownDays: number;
  dailyStudyMinutes: number;
  overallMastery: number;
  weakPoints: string[];
  studyStreakDays?: number;
  longestStreakDays?: number;
  todayMinutesCompleted?: number;
  last7DaysStreak?: { day: string; date: string; completed: boolean; minutes: number }[];
  enrolledSubjects?: EnrolledSubject[];
}
