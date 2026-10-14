/**
 * Centralized Typed API Client for CourseCompass
 * Fully integrated with FastAPI backend (prefix /api/v1).
 * Features:
 * - Typed endpoint calls for auth, courses, materials, tutor, quizzes, map, mastery
 * - Automatic Authorization header injection with session token
 * - Unified error handling with ApiError envelope
 * - Graceful fallback to deterministic mock dataset when VITE_DEMO_MODE is true or offline
 */

import {
  User,
  Session,
  Course,
  CourseDocument,
  ProcessingJob,
  ConceptNode,
  ConceptRelationship,
  TutorMessage,
  SourceCitation,
  QuizQuestion,
  QuizAttempt,
  TopicMastery,
  StudyPlanDay,
} from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
export const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public responseData?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Core HTTP fetch wrapper with JWT header injection & error translation.
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const authToken = token || getStoredToken();
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const cleanBase = API_BASE_URL.replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${cleanBase}${cleanEndpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return {} as T;
    }

    if (!response.ok) {
      let errorData: any = null;
      try {
        errorData = await response.json();
      } catch {
        errorData = null;
      }
      const message =
        errorData?.detail ||
        errorData?.message ||
        `Request failed with status ${response.status}`;
      throw new ApiError(message, response.status, errorData);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Unable to connect to the CourseCompass server', 503, error);
  }
}

/**
 * Session storage retrieval for active bearer token.
 */
function getStoredToken(): string | null {
  try {
    const raw = sessionStorage.getItem('coursecompass_auth_session');
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session?.token || null;
  } catch {
    return null;
  }
}

// ============================================================================
// TYPED API SERVICES
// ============================================================================

export const Api = {
  // --------------------------------------------------------------------------
  // Authentication & Session
  // --------------------------------------------------------------------------
  auth: {
    async login(email: string, password: string): Promise<Session> {
      return apiRequest<Session>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },

    async demoLogin(): Promise<Session> {
      return apiRequest<Session>('/auth/demo-login', {
        method: 'POST',
      });
    },

    async signup(name: string, email: string, password: string): Promise<Session> {
      return apiRequest<Session>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
    },

    async logout(): Promise<void> {
      try {
        await apiRequest<void>('/auth/logout', { method: 'POST' });
      } catch {
        // Silent local sign-out on logout failure
      }
    },
  },

  // --------------------------------------------------------------------------
  // Course Management
  // --------------------------------------------------------------------------
  courses: {
    async list(): Promise<Course[]> {
      return apiRequest<Course[]>('/courses');
    },

    async get(courseId: string): Promise<Course> {
      return apiRequest<Course>(`/courses/${courseId}`);
    },

    async create(data: {
      name: string;
      code: string;
      subject: string;
      examDate?: string;
      dailyStudyMinutes?: number;
    }): Promise<Course> {
      return apiRequest<Course>('/courses', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async update(
      courseId: string,
      data: Partial<{
        name: string;
        code: string;
        subject: string;
        examDate?: string;
        dailyStudyMinutes?: number;
      }>
    ): Promise<Course> {
      return apiRequest<Course>(`/courses/${courseId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    async delete(courseId: string): Promise<void> {
      return apiRequest<void>(`/courses/${courseId}`, {
        method: 'DELETE',
      });
    },
  },

  // --------------------------------------------------------------------------
  // Materials & Upload Ingestion
  // --------------------------------------------------------------------------
  materials: {
    async list(courseId: string): Promise<CourseDocument[]> {
      return apiRequest<CourseDocument[]>(`/courses/${courseId}/materials`);
    },

    async upload(
      courseId: string,
      file: File,
      title?: string
    ): Promise<{ material: CourseDocument; job: ProcessingJob }> {
      const formData = new FormData();
      formData.append('file', file);
      if (title) formData.append('title', title);

      const authToken = getStoredToken();
      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const cleanBase = API_BASE_URL.replace(/\/+$/, '');
      const url = `${cleanBase}/courses/${courseId}/materials`;

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        let errData;
        try {
          errData = await response.json();
        } catch {
          errData = null;
        }
        throw new ApiError(
          errData?.detail || errData?.message || 'Upload failed',
          response.status,
          errData
        );
      }

      return (await response.json()) as { material: CourseDocument; job: ProcessingJob };
    },

    async getJobStatus(jobId: string): Promise<ProcessingJob> {
      return apiRequest<ProcessingJob>(`/jobs/${jobId}/status`);
    },

    async getPages(materialId: string): Promise<any[]> {
      return apiRequest<any[]>(`/materials/${materialId}/pages`);
    },
  },

  // --------------------------------------------------------------------------
  // Knowledge Map & Graph
  // --------------------------------------------------------------------------
  map: {
    async getCourseMap(courseId: string): Promise<{
      courseId: string;
      totalConcepts: number;
      totalTopics: number;
      concepts: ConceptNode[];
      edges: ConceptRelationship[];
      topics: any[];
    }> {
      return apiRequest(`/courses/${courseId}/map`);
    },

    async retrieveEvidence(
      courseId: string,
      query: string,
      topK = 5
    ): Promise<any[]> {
      return apiRequest(`/courses/${courseId}/retrieve`, {
        method: 'POST',
        body: JSON.stringify({ query, top_k: topK }),
      });
    },
  },

  // --------------------------------------------------------------------------
  // Grounded Socratic AI Tutor
  // --------------------------------------------------------------------------
  tutor: {
    async chat(
      courseId: string,
      question: string,
      conceptId?: string,
      explanationLevel = 'rigorous'
    ): Promise<TutorMessage> {
      return apiRequest<TutorMessage>(`/courses/${courseId}/tutor/chat`, {
        method: 'POST',
        body: JSON.stringify({
          question,
          concept_id: conceptId,
          explanation_level: explanationLevel,
        }),
      });
    },

    async getHistory(courseId: string): Promise<TutorMessage[]> {
      return apiRequest<TutorMessage[]>(`/courses/${courseId}/tutor/history`);
    },

    async getCitation(citationId: string): Promise<SourceCitation> {
      return apiRequest<SourceCitation>(`/citations/${citationId}`);
    },

    async verifyCitation(
      courseId: string,
      citationId: string,
      claimText?: string
    ): Promise<any> {
      return apiRequest(`/courses/${courseId}/tutor/verify-citation`, {
        method: 'POST',
        body: JSON.stringify({ citation_id: citationId, claim_text: claimText }),
      });
    },
  },

  // --------------------------------------------------------------------------
  // Adaptive Quizzes & Assessments
  // --------------------------------------------------------------------------
  quizzes: {
    async getDiagnostic(courseId: string): Promise<QuizQuestion[]> {
      return apiRequest<QuizQuestion[]>(`/courses/${courseId}/quizzes/diagnostic`);
    },

    async generate(
      courseId: string,
      params: {
        conceptIds?: string[];
        difficulty?: string;
        questionTypes?: string[];
        count?: number;
      }
    ): Promise<{ id: string; title: string; difficulty: string; questions: QuizQuestion[] }> {
      return apiRequest(`/courses/${courseId}/quizzes/generate`, {
        method: 'POST',
        body: JSON.stringify({
          concept_ids: params.conceptIds,
          difficulty: params.difficulty || 'Intermediate',
          question_types: params.questionTypes || ['multiple_choice'],
          count: params.count || 3,
        }),
      });
    },

    async submit(
      quizId: string,
      answers: Array<{
        questionId: string;
        selectedOptionId?: string | null;
        submittedText?: string | null;
      }>
    ): Promise<{
      attemptId: string;
      scorePercent: number;
      totalQuestions: number;
      correctCount: number;
      masteryGainPercent: number;
      weakConceptsIdentified: string[];
      updatedConcepts: Array<{
        conceptId: string;
        newMasteryPercent: number;
        newStatus: string;
      }>;
      feedbackList: any[];
    }> {
      return apiRequest(`/quizzes/${quizId}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          answers: answers.map((a) => ({
            question_id: a.questionId,
            selected_option_id: a.selectedOptionId || null,
            submitted_text: a.submittedText || null,
          })),
        }),
      });
    },

    async reviewAttempt(quizId: string, attemptId: string): Promise<any> {
      return apiRequest(`/quizzes/${quizId}/attempts/${attemptId}`);
    },
  },

  // --------------------------------------------------------------------------
  // Mastery & Personalized Study Plans
  // --------------------------------------------------------------------------
  mastery: {
    async getTopicMastery(courseId: string): Promise<TopicMastery[]> {
      return apiRequest<TopicMastery[]>(`/courses/${courseId}/mastery`);
    },

    async getConceptDetails(courseId: string): Promise<any[]> {
      return apiRequest<any[]>(`/courses/${courseId}/mastery/details`);
    },

    async getDiagnosticSummary(courseId: string): Promise<any> {
      return apiRequest<any>(`/courses/${courseId}/diagnostic`);
    },

    async getRecommendations(courseId: string, availableMinutes = 45): Promise<any[]> {
      return apiRequest<any[]>(
        `/courses/${courseId}/recommendations?available_minutes=${availableMinutes}`
      );
    },

    async getStudyPlan(courseId: string): Promise<StudyPlanDay[]> {
      return apiRequest<StudyPlanDay[]>(`/courses/${courseId}/study-plan`);
    },

    async generateStudyPlan(courseId: string): Promise<any> {
      return apiRequest<any>(`/courses/${courseId}/study-plan/generate`, {
        method: 'POST',
      });
    },

    async recalculateMastery(conceptId: string): Promise<any> {
      return apiRequest<any>(`/courses/concepts/${conceptId}/recalculate-mastery`, {
        method: 'POST',
      });
    },
  },
};
