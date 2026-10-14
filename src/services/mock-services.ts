/**
 * Mock Service Layer for CourseCompass
 * Deterministic academic dataset for course CS 204: Recursion and Graphs
 * and isolated public preview models.
 */

import {
  User,
  Session,
  Course,
  CourseDocument,
  Concept,
  SourceReference,
  TutorAnswer,
  TutorMessage,
  QuizQuestion,
  Flashcard,
  StudyPlanItem,
  StudyPlanDay,
  TopicMastery
} from '../types';

export const PUBLIC_SAMPLE_CITATIONS: Record<string, SourceReference> = {
  textbookRecursion: {
    id: 'cite-sample-tb-1',
    documentId: 'doc-1',
    documentTitle: 'Introduction to Algorithms & Data Structures (4th Ed.)',
    sourceTitle: 'Introduction to Algorithms & Data Structures (4th Ed.)',
    documentType: 'pdf',
    sourceType: 'pdf',
    locationLabel: 'Chapter 4, Page 112',
    pageNumber: 112,
    excerpt:
      'Every well-formed recursive procedure must possess at least one non-recursive base case that halts recursion. Omitting the base case, or failing to make structural progression toward it, leads directly to unbounded call frame growth and a runtime stack overflow exception.',
    contextSnippet:
      'Section 4.2: Anatomy of Stack Frames in Activation Records — Figure 4.3 illustrates push/pop lifecycles.',
    verificationConfidence: 'verified'
  },
  lectureVideo: {
    id: 'cite-sample-vid-1',
    documentId: 'doc-2',
    documentTitle: 'Lecture 08: Recursive Call Stack Mechanics & Base Case Design',
    sourceTitle: 'Lecture 08: Recursive Call Stack Mechanics & Base Case Design',
    documentType: 'video',
    sourceType: 'video',
    locationLabel: 'Timestamp 14:32',
    timestampSeconds: 872,
    timestampLabel: '14:32',
    excerpt:
      'Professor Henderson: "Notice where students make the mistake in Fibonacci or tree traversal. They write the recursive split first, but forget to verify whether negative or boundary inputs reach the leaf condition before executing."',
    contextSnippet:
      'Whiteboard demonstration of activation records pushing onto hardware memory.',
    verificationConfidence: 'verified'
  },
  slidesDfs: {
    id: 'cite-sample-sld-1',
    documentId: 'doc-3',
    documentTitle: 'Lecture 12 Slides: Graph Representations & Depth-First Search',
    sourceTitle: 'Lecture 12 Slides: Graph Representations & Depth-First Search',
    documentType: 'slides',
    sourceType: 'slides',
    locationLabel: 'Slide 19 of 38',
    slideNumber: 19,
    excerpt:
      'Invariant 3: In an unweighted directed graph, an edge (u, v) encountered during DFS is a back-edge if and only if vertex v is currently in the ACTIVE/GRAY state on the recursion call stack.',
    contextSnippet:
      'Three-Color vertex convention: White = unvisited, Gray = active on stack, Black = completed.',
    verificationConfidence: 'verified'
  }
};

export const DEMO_COURSE: Course = {
  id: 'course-cs204',
  userId: 'usr-ananya-sharma',
  name: 'Data Structures: Recursion and Graphs',
  code: 'CS 204',
  subject: 'Computer Science',
  examDate: 'October 25, 2026',
  examCountdownDays: 12,
  dailyStudyMinutes: 45,
  overallMastery: 58,
  documentsCount: 5,
  conceptsCount: 8,
  createdAt: '2026-09-10T10:00:00Z',
  updatedAt: '2026-10-13T18:00:00Z'
};

export const DEMO_DOCUMENTS: CourseDocument[] = [
  {
    id: 'doc-1',
    courseId: 'course-cs204',
    title: 'Textbook Ch. 4: Recursion & Mathematical Induction Foundations',
    type: 'pdf',
    fileSizeBytes: 14889728,
    formattedSize: '14.2 MB',
    pageCountOrDuration: '34 Pages',
    uploadedAt: 'Sep 29, 2026',
    status: 'indexed',
    extractedConcepts: ['Base Cases', 'Divide & Conquer Recurrence', 'Master Theorem Invariants']
  },
  {
    id: 'doc-2',
    courseId: 'course-cs204',
    title: 'Lecture 08: Recursive Call Stack Mechanics & Base Case Design',
    type: 'video',
    fileSizeBytes: 505413632,
    formattedSize: '482 MB',
    pageCountOrDuration: '48m 20s',
    uploadedAt: 'Sep 28, 2026',
    status: 'indexed',
    extractedConcepts: ['Call Stack Activation Records', 'Recursion Base Cases', 'Stack Overflow Invariants']
  },
  {
    id: 'doc-3',
    courseId: 'course-cs204',
    title: 'Lecture 12 Slides: Graph Representations & Depth-First Search',
    type: 'slides',
    fileSizeBytes: 9017753,
    formattedSize: '8.6 MB',
    pageCountOrDuration: '38 Slides',
    uploadedAt: 'Oct 04, 2026',
    status: 'indexed',
    extractedConcepts: ['Adjacency Lists', 'DFS Traversal', 'Graph Cycle Detection', 'Three-Coloring']
  },
  {
    id: 'doc-4',
    courseId: 'course-cs204',
    title: 'TA Office Hours: Base Case Pitfalls & Return Signatures',
    type: 'audio',
    fileSizeBytes: 23173529,
    formattedSize: '22.1 MB',
    pageCountOrDuration: '18m 10s',
    uploadedAt: 'Oct 07, 2026',
    status: 'indexed',
    extractedConcepts: ['Recursion Base Cases', 'Return Identity Elements', 'Call Stack Tracing']
  },
  {
    id: 'doc-5',
    courseId: 'course-cs204',
    title: 'Lab 3 Handout: Call Stack Tracing Worksheet',
    type: 'notes',
    fileSizeBytes: 1468006,
    formattedSize: '1.4 MB',
    pageCountOrDuration: '4 Pages',
    uploadedAt: 'Oct 08, 2026',
    status: 'indexed',
    extractedConcepts: ['Call Stack Activation Records', 'Memory Footprints']
  }
];

export const DEMO_CONCEPTS: Concept[] = [
  {
    id: 'c-stack-mechanics',
    courseId: 'course-cs204',
    topicId: 'top-memory',
    name: 'Call Stack Mechanics',
    difficulty: 'Foundational',
    masteryPercent: 64,
    status: 'learning',
    summary: 'Activation records, stack pointer displacement, local frame allocation, and hardware memory bounds.',
    primaryMisconception: 'Assuming previous frame local variables are overwritten when a new frame is pushed.',
    prerequisiteIds: [],
    dependentConceptIds: ['c-base-cases'],
    citations: [PUBLIC_SAMPLE_CITATIONS.lectureVideo]
  },
  {
    id: 'c-base-cases',
    courseId: 'course-cs204',
    topicId: 'top-recursion',
    name: 'Recursion Base Cases',
    difficulty: 'Foundational',
    masteryPercent: 44,
    status: 'attention',
    summary: 'Guaranteed halting states where the function returns directly without issuing further recursive invocations.',
    primaryMisconception: 'Treating base cases merely as exception guards rather than structural halting values with algebraic identities.',
    prerequisiteIds: ['c-stack-mechanics'],
    dependentConceptIds: ['c-divide-conquer', 'c-dfs-traversal'],
    citations: [PUBLIC_SAMPLE_CITATIONS.textbookRecursion]
  },
  {
    id: 'c-divide-conquer',
    courseId: 'course-cs204',
    topicId: 'top-recursion',
    name: 'Divide and Conquer Recurrence',
    difficulty: 'Intermediate',
    masteryPercent: 78,
    status: 'mastered',
    summary: 'Partitioning problems into self-similar subproblems and combining linear-time solutions.',
    primaryMisconception: 'Confusing recursion tree depth with total call invocations.',
    prerequisiteIds: ['c-base-cases'],
    dependentConceptIds: [],
    citations: [PUBLIC_SAMPLE_CITATIONS.textbookRecursion]
  },
  {
    id: 'c-graph-representations',
    courseId: 'course-cs204',
    topicId: 'top-graphs',
    name: 'Graph Representations',
    difficulty: 'Foundational',
    masteryPercent: 82,
    status: 'mastered',
    summary: 'Trade-offs between Adjacency Matrix O(V^2) space and Adjacency List O(V + E) space.',
    primaryMisconception: 'Defaulting to Adjacency Matrix for sparse network graphs.',
    prerequisiteIds: [],
    dependentConceptIds: ['c-dfs-traversal'],
    citations: [PUBLIC_SAMPLE_CITATIONS.slidesDfs]
  },
  {
    id: 'c-dfs-traversal',
    courseId: 'course-cs204',
    topicId: 'top-traversal',
    name: 'Depth-First Search (DFS)',
    difficulty: 'Intermediate',
    masteryPercent: 49,
    status: 'attention',
    summary: 'Traversing graph branches along deep paths using the system call stack or an explicit LIFO structure.',
    primaryMisconception: 'Confusing DFS call stack ordering with BFS queue order.',
    prerequisiteIds: ['c-base-cases', 'c-graph-representations'],
    dependentConceptIds: ['c-cycle-detection'],
    citations: [PUBLIC_SAMPLE_CITATIONS.slidesDfs, PUBLIC_SAMPLE_CITATIONS.lectureVideo]
  },
  {
    id: 'c-cycle-detection',
    courseId: 'course-cs204',
    topicId: 'top-algorithms',
    name: 'Cycle Detection & Three-Coloring',
    difficulty: 'Advanced',
    masteryPercent: 32,
    status: 'attention',
    summary: 'Detecting directed cycles using vertex states: White (unvisited), Gray (active on stack), Black (finished).',
    primaryMisconception: 'Believing any edge to an already visited vertex indicates a cycle, ignoring cross-edges.',
    prerequisiteIds: ['c-dfs-traversal'],
    dependentConceptIds: ['c-topological-sort'],
    citations: [PUBLIC_SAMPLE_CITATIONS.slidesDfs]
  },
  {
    id: 'c-topological-sort',
    courseId: 'course-cs204',
    topicId: 'top-algorithms',
    name: 'Topological Sorting (DAGs)',
    difficulty: 'Advanced',
    masteryPercent: 25,
    status: 'locked',
    summary: 'Linear ordering of vertices in a Directed Acyclic Graph based on in-degree dependencies.',
    primaryMisconception: 'Attempting topological ordering on graphs containing directed cycles.',
    prerequisiteIds: ['c-cycle-detection'],
    dependentConceptIds: [],
    citations: [PUBLIC_SAMPLE_CITATIONS.slidesDfs]
  }
];

export const DEMO_TOPIC_MASTERY: TopicMastery[] = [
  {
    topicId: 'top-memory',
    topicTitle: 'Memory & Hardware Architecture',
    masteryPercent: 64,
    conceptsTotal: 1,
    conceptsMastered: 0,
    conceptsDeveloping: 1,
    conceptsAttention: 0
  },
  {
    topicId: 'top-recursion',
    topicTitle: 'Recursion Foundations',
    masteryPercent: 61,
    conceptsTotal: 2,
    conceptsMastered: 1,
    conceptsDeveloping: 0,
    conceptsAttention: 1
  },
  {
    topicId: 'top-graphs',
    topicTitle: 'Graph Fundamentals',
    masteryPercent: 82,
    conceptsTotal: 1,
    conceptsMastered: 1,
    conceptsDeveloping: 0,
    conceptsAttention: 0
  },
  {
    topicId: 'top-traversal',
    topicTitle: 'Graph Traversal & Search',
    masteryPercent: 49,
    conceptsTotal: 1,
    conceptsMastered: 0,
    conceptsDeveloping: 0,
    conceptsAttention: 1
  },
  {
    topicId: 'top-algorithms',
    topicTitle: 'Advanced Graph Algorithms',
    masteryPercent: 28,
    conceptsTotal: 2,
    conceptsMastered: 0,
    conceptsDeveloping: 0,
    conceptsAttention: 2
  }
];

// ----------------------------------------------------------------------------
// Multi-Tenant In-Memory State for Mock Mode
// Data is strictly partitioned by userId / ownerId
// ----------------------------------------------------------------------------

interface MockState {
  users: Map<string, User>;
  coursesByOwner: Map<string, Course[]>;
  documentsByCourse: Map<string, CourseDocument[]>;
  conceptsByCourse: Map<string, Concept[]>;
  masteryByCourse: Map<string, TopicMastery[]>;
  studyPlansByCourse: Map<string, StudyPlanDay[]>;
  flashcardsByCourse: Map<string, Flashcard[]>;
  messagesByCourse: Map<string, TutorMessage[]>;
  currentSession: Session | null;
}

function initMockStore(): MockState {
  const users = new Map<string, User>();
  const coursesByOwner = new Map<string, Course[]>();
  const documentsByCourse = new Map<string, CourseDocument[]>();
  const conceptsByCourse = new Map<string, Concept[]>();
  const masteryByCourse = new Map<string, TopicMastery[]>();
  const studyPlansByCourse = new Map<string, StudyPlanDay[]>();
  const flashcardsByCourse = new Map<string, Flashcard[]>();
  const messagesByCourse = new Map<string, TutorMessage[]>();

  // Pre-seed ONLY Ananya Sharma in demo tenant
  const ananya: User = {
    id: 'usr-ananya-sharma',
    name: 'Ananya Sharma',
    email: 'ananya.sharma@collegemail.edu',
    academicLevel: 'Second-year Undergraduate',
    institution: 'School of Engineering & Applied Sciences',
    isNewUser: false,
    createdAt: '2026-09-01T08:00:00Z',
  };
  users.set(ananya.id, ananya);
  coursesByOwner.set(ananya.id, [{ ...DEMO_COURSE }]);
  documentsByCourse.set(DEMO_COURSE.id, [...DEMO_DOCUMENTS]);
  conceptsByCourse.set(DEMO_COURSE.id, [...DEMO_CONCEPTS]);
  masteryByCourse.set(DEMO_COURSE.id, [...DEMO_TOPIC_MASTERY]);

  return {
    users,
    coursesByOwner,
    documentsByCourse,
    conceptsByCourse,
    masteryByCourse,
    studyPlansByCourse,
    flashcardsByCourse,
    messagesByCourse,
    currentSession: null,
  };
}

let store = initMockStore();

export const MockService = {
  // Session & User
  async createUser(
    name: string,
    email: string,
    academicLevel = 'Undergraduate'
  ): Promise<User> {
    const id = `usr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const user: User = {
      id,
      name,
      email: email.toLowerCase().trim(),
      academicLevel,
      institution: 'University College',
      isNewUser: true,
      createdAt: new Date().toISOString(),
    };
    store.users.set(id, user);
    store.coursesByOwner.set(id, []);
    return user;
  },

  async findUserByEmail(email: string): Promise<User | null> {
    const target = email.toLowerCase().trim();
    for (const u of store.users.values()) {
      if (u.email === target) return u;
    }
    return null;
  },

  async getUserById(userId: string): Promise<User | null> {
    return store.users.get(userId) || null;
  },

  async createSession(user: User): Promise<Session> {
    const session: Session = {
      user,
      token: `mock_jwt_${user.id}_${Date.now()}`,
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      isDemoSession: user.id === 'usr-ananya-sharma',
    };
    store.currentSession = session;
    return session;
  },

  async getSession(): Promise<Session | null> {
    return store.currentSession;
  },

  async deleteSession(): Promise<void> {
    store.currentSession = null;
  },

  // Courses (Scoped to ownerId)
  async getCourses(ownerId: string): Promise<Course[]> {
    return store.coursesByOwner.get(ownerId) || [];
  },

  async getCourse(ownerId: string, courseId: string): Promise<Course | null> {
    const courses = store.coursesByOwner.get(ownerId) || [];
    return courses.find((c) => c.id === courseId) || null;
  },

  async getCourseById(courseId: string): Promise<Course | null> {
    for (const list of store.coursesByOwner.values()) {
      const found = list.find((c) => c.id === courseId);
      if (found) return found;
    }
    return null;
  },

  async createCourse(
    ownerId: string,
    data: {
      name: string;
      code: string;
      subject: string;
      examDate?: string;
      dailyStudyMinutes?: number;
    }
  ): Promise<Course> {
    const id = `course-${Date.now()}`;
    const course: Course = {
      id,
      userId: ownerId,
      name: data.name.trim(),
      code: data.code.trim().toUpperCase(),
      subject: data.subject.trim(),
      examDate: data.examDate,
      dailyStudyMinutes: data.dailyStudyMinutes || 45,
      overallMastery: 0,
      documentsCount: 0,
      conceptsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const existing = store.coursesByOwner.get(ownerId) || [];
    store.coursesByOwner.set(ownerId, [course, ...existing]);
    store.documentsByCourse.set(id, []);
    store.conceptsByCourse.set(id, []);
    store.masteryByCourse.set(id, []);
    return course;
  },

  async updateCourse(
    ownerId: string,
    courseId: string,
    data: Partial<Course>
  ): Promise<Course> {
    const courses = store.coursesByOwner.get(ownerId) || [];
    const index = courses.findIndex((c) => c.id === courseId);
    if (index === -1) {
      throw new Error('Course not found or unauthorized');
    }
    const updated = {
      ...courses[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    courses[index] = updated;
    store.coursesByOwner.set(ownerId, courses);
    return updated;
  },

  async deleteCourse(ownerId: string, courseId: string): Promise<void> {
    const courses = store.coursesByOwner.get(ownerId) || [];
    store.coursesByOwner.set(
      ownerId,
      courses.filter((c) => c.id !== courseId)
    );
    store.documentsByCourse.delete(courseId);
    store.conceptsByCourse.delete(courseId);
    store.masteryByCourse.delete(courseId);
    store.studyPlansByCourse.delete(courseId);
    store.flashcardsByCourse.delete(courseId);
    store.messagesByCourse.delete(courseId);
  },

  // Documents & Uploads
  async createDocument(
    ownerId: string,
    courseId: string,
    file: { name: string; size?: number; type?: string },
    title?: string
  ): Promise<{ document: CourseDocument; job: any }> {
    const docId = `doc-${Date.now()}`;
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    let docType: any = 'pdf';
    if (['mp4', 'mov', 'webm'].includes(ext)) docType = 'video';
    else if (['ppt', 'pptx'].includes(ext)) docType = 'slides';
    else if (['mp3', 'wav', 'm4a'].includes(ext)) docType = 'audio';
    else if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) docType = 'image';

    const document: CourseDocument = {
      id: docId,
      courseId,
      title: title || file.name,
      type: docType,
      fileSizeBytes: file.size || 1024 * 1024 * 2,
      formattedSize: file.size
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : '2.5 MB',
      status: 'ready',
      extractedConcepts: ['Core Foundations', 'Key Definitions'],
      summary: `Indexed material for ${title || file.name}`,
    };

    const docs = store.documentsByCourse.get(courseId) || [];
    store.documentsByCourse.set(courseId, [document, ...docs]);

    // Update document count on course
    const courses = store.coursesByOwner.get(ownerId) || [];
    const course = courses.find((c) => c.id === courseId);
    if (course) {
      course.documentsCount = (course.documentsCount || 0) + 1;
    }

    const job = {
      id: `job-${Date.now()}`,
      documentId: docId,
      stage: 'ready',
      stageNumber: 7,
      totalStages: 7,
      stageDescription: 'Corpus indexing complete.',
      progressPercent: 100,
      isCompleted: true,
    };

    return { document, job };
  },

  async getCourseDocuments(courseId: string): Promise<CourseDocument[]> {
    return store.documentsByCourse.get(courseId) || [];
  },

  async getDocuments(ownerId: string, courseId: string): Promise<CourseDocument[]> {
    const course = await this.getCourse(ownerId, courseId);
    if (!course) return [];
    return store.documentsByCourse.get(courseId) || [];
  },

  async updateDocumentStatus(
    ownerId: string,
    courseId: string,
    documentId: string,
    status: any
  ): Promise<CourseDocument> {
    const docs = store.documentsByCourse.get(courseId) || [];
    const doc = docs.find((d) => d.id === documentId);
    if (!doc) throw new Error('Document not found');
    doc.status = status;
    return doc;
  },

  async deleteDocument(
    ownerId: string,
    courseId: string,
    documentId: string
  ): Promise<void> {
    const docs = store.documentsByCourse.get(courseId) || [];
    store.documentsByCourse.set(
      courseId,
      docs.filter((d) => d.id !== documentId)
    );
    const courses = store.coursesByOwner.get(ownerId) || [];
    const course = courses.find((c) => c.id === courseId);
    if (course && course.documentsCount > 0) {
      course.documentsCount -= 1;
    }
  },

  // Learning features
  async getCourseConcepts(courseId: string): Promise<Concept[]> {
    return store.conceptsByCourse.get(courseId) || [];
  },

  async getTopics(ownerId: string, courseId: string): Promise<any[]> {
    return [
      {
        id: `topic-${courseId}-1`,
        courseId,
        title: 'Foundations & Concepts',
        description: 'Core introductory principles and definitions',
        order: 1,
        conceptIds: (store.conceptsByCourse.get(courseId) || []).map((c) => c.id),
      },
    ];
  },

  async getConceptMap(ownerId: string, courseId: string): Promise<any> {
    const concepts = store.conceptsByCourse.get(courseId) || [];
    return {
      courseId,
      totalConcepts: concepts.length,
      totalTopics: concepts.length > 0 ? 1 : 0,
      concepts,
      edges: [],
      topics: [],
    };
  },

  async sendTutorMessage(
    ownerId: string,
    courseId: string,
    message: string,
    explanationLevel = 'rigorous'
  ): Promise<TutorMessage> {
    const docs = store.documentsByCourse.get(courseId) || [];
    if (docs.length === 0) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'tutor',
        text: 'This question was not found in your course material because no files have been uploaded yet. Please upload your textbook PDF, lecture slides, or video recording to begin grounded tutoring.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        answerState: 'not_found',
        citations: [],
      };
    }

    const lower = message.toLowerCase();
    const qWords = lower.split(/\s+/).filter((w) => w.length > 3);
    const matchingDoc = docs.find((doc) => {
      const docTitle = (doc.title || '').toLowerCase();
      const docSummary = (doc.summary || '').toLowerCase();
      return qWords.some((w) => docTitle.includes(w) || docSummary.includes(w));
    });

    if (matchingDoc) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'tutor',
        text: `Based on your uploaded courseware "${matchingDoc.title}":\n\n${matchingDoc.summary || 'Fundamental principles and definitions directly addressing your inquiry.'}\n\nReview this section to master this topic for your course.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        answerState: 'supported',
        citations: [
          {
            id: `cite-${matchingDoc.id}`,
            documentId: matchingDoc.id,
            sourceTitle: matchingDoc.title,
            sourceType: matchingDoc.type,
            locationLabel: `${matchingDoc.title}, Section 1`,
            excerpt: matchingDoc.summary || 'Verified course material grounding excerpt.',
            contextSnippet: `From ${matchingDoc.title}`,
            verificationConfidence: 'verified',
          },
        ],
      };
    }

    // Unrelated query or irrelevant document
    const docNames = docs.map((d) => `"${d.title}"`).slice(0, 3).join(', ');
    return {
      id: `msg-${Date.now()}`,
      sender: 'tutor',
      text: `This topic was not found in your currently uploaded course materials (${docNames}). The uploaded material does not appear to be relevant to this question.\n\nPlease upload the relevant PDF, lecture video, or slide deck covering this topic so CourseCompass can provide a verified, source-grounded answer with citations.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      answerState: 'not_found',
      citations: [],
    };
  },

  async getQuiz(ownerId: string, courseId: string): Promise<QuizQuestion[]> {
    if (courseId === 'course-cs204') return [];
    return [];
  },

  async submitQuiz(
    ownerId: string,
    courseId: string,
    quizId: string,
    answers: any[]
  ): Promise<any> {
    return {
      attemptId: `att-${Date.now()}`,
      scorePercent: 100,
      totalQuestions: answers.length,
      correctCount: answers.length,
      masteryGainPercent: 10,
      weakConceptsIdentified: [],
      updatedConcepts: [],
      feedbackList: [],
    };
  },

  async getTopicMastery(courseId: string): Promise<TopicMastery[]> {
    return store.masteryByCourse.get(courseId) || [];
  },

  async getMastery(ownerId: string, courseId: string): Promise<TopicMastery[]> {
    return store.masteryByCourse.get(courseId) || [];
  },

  async getStudyPlan(ownerId: string, courseId: string): Promise<StudyPlanDay[]> {
    return store.studyPlansByCourse.get(courseId) || [];
  },

  async getRevisionItems(ownerId: string, courseId: string): Promise<Flashcard[]> {
    return store.flashcardsByCourse.get(courseId) || [];
  },

  resetDemoData(): void {
    store = initMockStore();
  },
};

