/**
 * Mock Service Layer for CourseCompass
 * Deterministic academic dataset for course CS 204: Recursion and Graphs,
 * full multi-tenant isolation, and persistent mock store in localStorage.
 */

import {
  User,
  Session,
  Course,
  CourseDocument,
  Concept,
  SourceReference,
  TutorMessage,
  QuizQuestion,
  Flashcard,
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
    primaryMisconception: 'Believing local variables persist across sibling recursive calls in separate stack frames.',
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
    masteryPercent: 58,
    status: 'learning',
    summary: 'Halting conditions, structural progression toward bounds, and identity return elements.',
    primaryMisconception: 'Returning 0 instead of appropriate base value, or failing to make structural progression on recursive parameters.',
    prerequisiteIds: ['c-stack-mechanics'],
    dependentConceptIds: ['c-divide-conquer', 'c-dfs-traversal'],
    citations: [PUBLIC_SAMPLE_CITATIONS.textbookRecursion, PUBLIC_SAMPLE_CITATIONS.lectureVideo]
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

export const DEMO_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q-demo-1',
    conceptId: 'c-base-cases',
    conceptName: 'Recursion Base Cases',
    prompt:
      'Examine the following recursive method designed to compute the sum of all elements in an array from index `idx` to the end. What is the fundamental bug?',
    codeSnippet: `int sumArray(int[] arr, int idx) {\n    if (idx == arr.length) {\n        return 0;\n    }\n    return arr[idx] + sumArray(arr, idx);\n}`,
    options: [
      {
        id: 'opt-a',
        text: 'The base case return value should be -1 instead of 0.',
        isCorrect: false,
        misconceptionExplanation:
          '0 is the correct additive identity element. Changing it to -1 would corrupt the mathematical sum.'
      },
      {
        id: 'opt-b',
        text: 'The recursive argument is not progressing toward the base case (`idx` is passed without incrementing), causing infinite recursion and stack overflow.',
        isCorrect: true
      },
      {
        id: 'opt-c',
        text: 'The base condition should be `idx > arr.length` to avoid out-of-bounds checks.',
        isCorrect: false,
        misconceptionExplanation:
          'Checking `idx == arr.length` cleanly halts at the exact moment index passes the final element (0-indexed).'
      },
      {
        id: 'opt-d',
        text: 'Java does not allow arrays to be passed recursively as function arguments.',
        isCorrect: false,
        misconceptionExplanation:
          'Arrays are passed by reference and are perfectly valid parameters in recursive invocations.'
      }
    ],
    explanation:
      'For recursion to terminate, each recursive step must make strict progress toward the halting state. Passing `idx` unchanged means `sumArray(arr, idx)` repeatedly creates identical stack frames at the same index until memory exhausts.',
    citation: PUBLIC_SAMPLE_CITATIONS.textbookRecursion
  },
  {
    id: 'q-demo-2',
    conceptId: 'c-dfs-traversal',
    conceptName: 'Depth-First Search (DFS)',
    prompt:
      'During Depth-First Search on a directed graph, which event guarantees the existence of a directed cycle?',
    options: [
      {
        id: 'opt-2-a',
        text: 'Encountering an edge to a vertex that has already been completely finished (Black state).',
        isCorrect: false,
        misconceptionExplanation:
          'An edge to a finished (Black) vertex is either a cross-edge or forward-edge in the DFS forest. It indicates an already-explored branch, not an active loop back to an ancestor.'
      },
      {
        id: 'opt-2-b',
        text: 'Encountering a back-edge to a vertex currently active on the current call stack (Gray state).',
        isCorrect: true
      },
      {
        id: 'opt-2-c',
        text: 'Finding an unvisited neighbor vertex (White state).',
        isCorrect: false,
        misconceptionExplanation:
          'Unvisited vertices simply represent tree edges that continue normal DFS traversal.'
      },
      {
        id: 'opt-2-d',
        text: 'When the adjacency list of the start vertex contains more than 3 outgoing edges.',
        isCorrect: false,
        misconceptionExplanation:
          'Vertex out-degree has no bearing on cycle existence.'
      }
    ],
    explanation:
      'In a directed graph, a back-edge points to an ancestor on the recursion stack (Gray state), establishing a closed directed cycle.',
    citation: PUBLIC_SAMPLE_CITATIONS.slidesDfs
  }
];

// ----------------------------------------------------------------------------
// Multi-Tenant State with LocalStorage Persistence
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
  quizzesByCourse: Map<string, QuizQuestion[]>;
  currentSession: Session | null;
}

const MOCK_STORAGE_KEY = 'coursecompass_mock_store_v2';

function initMockStore(): MockState {
  const users = new Map<string, User>();
  const coursesByOwner = new Map<string, Course[]>();
  const documentsByCourse = new Map<string, CourseDocument[]>();
  const conceptsByCourse = new Map<string, Concept[]>();
  const masteryByCourse = new Map<string, TopicMastery[]>();
  const studyPlansByCourse = new Map<string, StudyPlanDay[]>();
  const flashcardsByCourse = new Map<string, Flashcard[]>();
  const messagesByCourse = new Map<string, TutorMessage[]>();
  const quizzesByCourse = new Map<string, QuizQuestion[]>();

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
  quizzesByCourse.set(DEMO_COURSE.id, [...DEMO_QUIZ_QUESTIONS]);

  return {
    users,
    coursesByOwner,
    documentsByCourse,
    conceptsByCourse,
    masteryByCourse,
    studyPlansByCourse,
    flashcardsByCourse,
    messagesByCourse,
    quizzesByCourse,
    currentSession: null,
  };
}

function saveStoreToLocalStorage(state: MockState): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const serializable = {
      users: Array.from(state.users.entries()),
      coursesByOwner: Array.from(state.coursesByOwner.entries()),
      documentsByCourse: Array.from(state.documentsByCourse.entries()),
      conceptsByCourse: Array.from(state.conceptsByCourse.entries()),
      masteryByCourse: Array.from(state.masteryByCourse.entries()),
      studyPlansByCourse: Array.from(state.studyPlansByCourse.entries()),
      flashcardsByCourse: Array.from(state.flashcardsByCourse.entries()),
      messagesByCourse: Array.from(state.messagesByCourse.entries()),
      quizzesByCourse: Array.from(state.quizzesByCourse.entries()),
    };
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(serializable));
  } catch (err) {
    console.error('Failed to persist mock store in localStorage:', err);
  }
}

function loadStoreFromLocalStorage(initial: MockState): MockState {
  try {
    if (typeof localStorage === 'undefined') return initial;
    const raw = localStorage.getItem(MOCK_STORAGE_KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw);
    if (parsed.users) {
      for (const [k, v] of parsed.users) initial.users.set(k, v);
    }
    if (parsed.coursesByOwner) {
      for (const [k, v] of parsed.coursesByOwner) initial.coursesByOwner.set(k, v);
    }
    if (parsed.documentsByCourse) {
      for (const [k, v] of parsed.documentsByCourse) initial.documentsByCourse.set(k, v);
    }
    if (parsed.conceptsByCourse) {
      for (const [k, v] of parsed.conceptsByCourse) initial.conceptsByCourse.set(k, v);
    }
    if (parsed.masteryByCourse) {
      for (const [k, v] of parsed.masteryByCourse) initial.masteryByCourse.set(k, v);
    }
    if (parsed.studyPlansByCourse) {
      for (const [k, v] of parsed.studyPlansByCourse) initial.studyPlansByCourse.set(k, v);
    }
    if (parsed.flashcardsByCourse) {
      for (const [k, v] of parsed.flashcardsByCourse) initial.flashcardsByCourse.set(k, v);
    }
    if (parsed.messagesByCourse) {
      for (const [k, v] of parsed.messagesByCourse) initial.messagesByCourse.set(k, v);
    }
    if (parsed.quizzesByCourse) {
      for (const [k, v] of parsed.quizzesByCourse) initial.quizzesByCourse.set(k, v);
    }
    return initial;
  } catch {
    return initial;
  }
}

let store = loadStoreFromLocalStorage(initMockStore());

function generateQuizQuestionsForDocument(
  doc: CourseDocument,
  concepts: Concept[]
): QuizQuestion[] {
  const cleanTitle = doc.title.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  const c1 = concepts[0] || { id: `c-${doc.id}-1`, name: `${cleanTitle}: Core Principles` };
  const c2 = concepts[1] || { id: `c-${doc.id}-2`, name: `${cleanTitle}: Key Invariants` };
  const c3 = concepts[2] || { id: `c-${doc.id}-3`, name: `${cleanTitle}: Applied Problem Solving` };

  const cite: SourceReference = {
    id: `cite-${doc.id}-quiz-1`,
    documentId: doc.id,
    documentTitle: doc.title,
    sourceTitle: doc.title,
    sourceType: doc.type || 'pdf',
    locationLabel: `${doc.title}, Section 1`,
    excerpt: doc.summary || `Primary source foundations from ${doc.title}.`,
    contextSnippet: `Extracted from ${doc.title}`,
    verificationConfidence: 'verified'
  };

  return [
    {
      id: `q-${doc.id}-1`,
      conceptId: c1.id,
      conceptName: c1.name,
      difficulty: 'Foundational',
      prompt: `Based on your course material "${cleanTitle}", what is the primary foundational rule required for ${c1.name}?`,
      options: [
        {
          id: `opt-${doc.id}-1a`,
          text: `All operational base invariants and constraints must be explicitly verified before proceeding with subsequent calculations.`,
          isCorrect: true
        },
        {
          id: `opt-${doc.id}-1b`,
          text: `Boundary conditions can be safely skipped if default initializers are present.`,
          isCorrect: false,
          misconceptionExplanation: `Skipping boundary conditions violates core structural invariants and leads to unbounded execution.`
        },
        {
          id: `opt-${doc.id}-1c`,
          text: `State transitions should be executed in arbitrary order regardless of data dependencies.`,
          isCorrect: false,
          misconceptionExplanation: `Data dependencies must dictate execution order to preserve system correctness.`
        },
        {
          id: `opt-${doc.id}-1d`,
          text: `Only final memory consumption matters, while correctness invariants can be deferred.`,
          isCorrect: false,
          misconceptionExplanation: `Correctness invariants are paramount; optimizing memory without correctness is a critical failure.`
        }
      ],
      explanation: `According to ${cleanTitle}, establishing and maintaining the base invariant guarantees that subsequent operations terminate and yield mathematically sound results.`,
      citation: cite
    },
    {
      id: `q-${doc.id}-2`,
      conceptId: c2.id,
      conceptName: c2.name,
      difficulty: 'Intermediate',
      prompt: `In "${cleanTitle}", which condition triggers a common misconception when analyzing ${c2.name}?`,
      options: [
        {
          id: `opt-${doc.id}-2a`,
          text: `Assuming that intermediate state checks can be ignored when processing nested subproblems.`,
          isCorrect: true
        },
        {
          id: `opt-${doc.id}-2b`,
          text: `Verifying that subproblem solutions satisfy both inductive base rules and step invariants.`,
          isCorrect: false,
          misconceptionExplanation: `Verifying inductive properties is the recommended best practice, not a misconception.`
        },
        {
          id: `opt-${doc.id}-2c`,
          text: `Documenting asymptotic complexity bounds alongside operational implementations.`,
          isCorrect: false,
          misconceptionExplanation: `Complexity analysis reinforces algorithmic understanding and prevents performance regressions.`
        },
        {
          id: `opt-${doc.id}-2d`,
          text: `Using modular decomposition to isolate independent calculation components.`,
          isCorrect: false,
          misconceptionExplanation: `Modular decomposition is a core engineering principle that aids correctness verification.`
        }
      ],
      explanation: `Ignoring intermediate states causes students to miss edge cases where subproblem outputs violate overall system assumptions.`,
      citation: {
        ...cite,
        id: `cite-${doc.id}-quiz-2`,
        locationLabel: `${doc.title}, Section 2`
      }
    },
    {
      id: `q-${doc.id}-3`,
      conceptId: c3.id,
      conceptName: c3.name,
      difficulty: 'Advanced',
      prompt: `When applying ${c3.name} to complex examination problems, how should edge-case inputs be systematically handled?`,
      options: [
        {
          id: `opt-${doc.id}-3a`,
          text: `Identify degenerate inputs (null, zero, single-element, cyclic) and define halting base cases before writing the general inductive step.`,
          isCorrect: true
        },
        {
          id: `opt-${doc.id}-3b`,
          text: `Focus strictly on average-case inputs and let runtime exceptions capture edge cases.`,
          isCorrect: false,
          misconceptionExplanation: `Relying on runtime exceptions for expected edge cases causes test failures and unhandled errors.`
        },
        {
          id: `opt-${doc.id}-3c`,
          text: `Hardcode outputs for known inputs while ignoring the underlying recurrence relation.`,
          isCorrect: false,
          misconceptionExplanation: `Hardcoding fails to generalize and violates academic grading standards.`
        },
        {
          id: `opt-${doc.id}-3d`,
          text: `Convert all problems to brute-force enumerations regardless of time and space constraints.`,
          isCorrect: false,
          misconceptionExplanation: `Brute-force solutions frequently timeout on large test suites and exceed syllabus complexity limits.`
        }
      ],
      explanation: `Rigorous problem-solving requires addressing degenerate boundary inputs prior to the general algorithm to prevent unhandled exceptions and infinite loops.`,
      citation: {
        ...cite,
        id: `cite-${doc.id}-quiz-3`,
        locationLabel: `${doc.title}, Section 3`
      }
    }
  ];
}

export const MockService = {
  // Session & User Registration
  registerUser(user: User): void {
    store.users.set(user.id, user);
    if (!store.coursesByOwner.has(user.id)) {
      store.coursesByOwner.set(user.id, []);
    }
    saveStoreToLocalStorage(store);
  },

  async createUser(
    name: string,
    email: string,
    academicLevel = 'Undergraduate'
  ): Promise<User> {
    const id = `usr-${email.replace(/[^a-z0-9]/g, '_')}`;
    const user: User = {
      id,
      name,
      email: email.toLowerCase().trim(),
      academicLevel,
      institution: 'Academic Workspace',
      isNewUser: true,
      createdAt: new Date().toISOString(),
    };
    store.users.set(id, user);
    if (!store.coursesByOwner.has(id)) {
      store.coursesByOwner.set(id, []);
    }
    saveStoreToLocalStorage(store);
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

  // Courses (Scoped strictly to ownerId)
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
      examDate: data.examDate || new Date(Date.now() + 14 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
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
    store.quizzesByCourse.set(id, []);
    saveStoreToLocalStorage(store);
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
    saveStoreToLocalStorage(store);
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
    store.quizzesByCourse.delete(courseId);
    saveStoreToLocalStorage(store);
  },

  // Documents & Upload Pipeline with Automatic Concept & Quiz Synthesis
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

    const cleanTitle = (title || file.name).replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

    const newConcepts: Concept[] = [
      {
        id: `c-${docId}-1`,
        courseId,
        topicId: `top-${courseId}-1`,
        name: `${cleanTitle}: Core Principles`,
        difficulty: 'Foundational',
        masteryPercent: 45,
        status: 'learning',
        summary: `Foundational definitions, invariants, and initial formulas extracted from ${cleanTitle}.`,
        primaryMisconception: `Confusing introductory definitions with operational constraints.`,
        prerequisiteIds: [],
        citations: [
          {
            id: `cite-${docId}-1`,
            documentId: docId,
            documentTitle: title || file.name,
            sourceTitle: title || file.name,
            sourceType: docType,
            locationLabel: `${title || file.name}, Section 1`,
            excerpt: `Primary foundational principles and structural definitions extracted from ${title || file.name}.`,
            contextSnippet: `From ${title || file.name}`,
            verificationConfidence: 'verified'
          }
        ]
      },
      {
        id: `c-${docId}-2`,
        courseId,
        topicId: `top-${courseId}-1`,
        name: `${cleanTitle}: Key Invariants`,
        difficulty: 'Intermediate',
        masteryPercent: 35,
        status: 'attention',
        summary: `Critical operational invariants, conditions, and boundary behaviors detailed in ${cleanTitle}.`,
        primaryMisconception: `Assuming boundary conditions hold without explicit verification.`,
        prerequisiteIds: [`c-${docId}-1`],
        citations: [
          {
            id: `cite-${docId}-2`,
            documentId: docId,
            documentTitle: title || file.name,
            sourceTitle: title || file.name,
            sourceType: docType,
            locationLabel: `${title || file.name}, Section 2`,
            excerpt: `Operational constraints, boundary checks, and system invariants detailed in ${title || file.name}.`,
            contextSnippet: `From ${title || file.name}`,
            verificationConfidence: 'verified'
          }
        ]
      },
      {
        id: `c-${docId}-3`,
        courseId,
        topicId: `top-${courseId}-1`,
        name: `${cleanTitle}: Applied Problem Solving`,
        difficulty: 'Advanced',
        masteryPercent: 20,
        status: 'attention',
        summary: `Synthesizing theoretical foundations into rigorous problem solving and exam analysis for ${cleanTitle}.`,
        primaryMisconception: `Failing to check edge-case and degenerate inputs during comprehensive analysis.`,
        prerequisiteIds: [`c-${docId}-2`],
        citations: [
          {
            id: `cite-${docId}-3`,
            documentId: docId,
            documentTitle: title || file.name,
            sourceTitle: title || file.name,
            sourceType: docType,
            locationLabel: `${title || file.name}, Section 3`,
            excerpt: `Problem solving strategies, proofs, and application exercises in ${title || file.name}.`,
            contextSnippet: `From ${title || file.name}`,
            verificationConfidence: 'verified'
          }
        ]
      }
    ];

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
      extractedConcepts: newConcepts.map((c) => c.name),
      summary: `Indexed material covering foundational principles, invariants, and applied problem solving for ${cleanTitle}.`,
    };

    // Store document
    const docs = store.documentsByCourse.get(courseId) || [];
    store.documentsByCourse.set(courseId, [document, ...docs]);

    // Store extracted concepts
    const existingConcepts = store.conceptsByCourse.get(courseId) || [];
    store.conceptsByCourse.set(courseId, [...newConcepts, ...existingConcepts]);

    // Generate adaptive quiz questions for this document
    const newQuestions = generateQuizQuestionsForDocument(document, newConcepts);
    const existingQuestions = store.quizzesByCourse.get(courseId) || [];
    store.quizzesByCourse.set(courseId, [...newQuestions, ...existingQuestions]);

    // Update topic mastery
    const topicMastery: TopicMastery = {
      topicId: `top-${courseId}-1`,
      topicTitle: `${cleanTitle} Foundations`,
      masteryPercent: 33,
      conceptsTotal: 3,
      conceptsMastered: 0,
      conceptsDeveloping: 1,
      conceptsAttention: 2
    };
    const currentMastery = store.masteryByCourse.get(courseId) || [];
    store.masteryByCourse.set(courseId, [topicMastery, ...currentMastery]);

    // Update course metadata
    const courses = store.coursesByOwner.get(ownerId) || [];
    const course = courses.find((c) => c.id === courseId);
    if (course) {
      course.documentsCount = (course.documentsCount || 0) + 1;
      course.conceptsCount = (store.conceptsByCourse.get(courseId) || []).length;
      course.overallMastery = 33;
    }

    saveStoreToLocalStorage(store);

    const job = {
      id: `job-${Date.now()}`,
      documentId: docId,
      stage: 'ready',
      stageNumber: 7,
      totalStages: 7,
      stageDescription: 'Corpus indexing complete. Concepts and adaptive quizzes synthesized.',
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
    saveStoreToLocalStorage(store);
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
    saveStoreToLocalStorage(store);
  },

  // Learning features
  async getCourseConcepts(courseId: string): Promise<Concept[]> {
    return store.conceptsByCourse.get(courseId) || [];
  },

  async getTopics(ownerId: string, courseId: string): Promise<any[]> {
    const concepts = store.conceptsByCourse.get(courseId) || [];
    return [
      {
        id: `topic-${courseId}-1`,
        courseId,
        title: 'Foundations & Concepts',
        description: 'Core introductory principles and definitions',
        order: 1,
        conceptIds: concepts.map((c) => c.id),
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
      edges: concepts
        .filter((c) => c.prerequisiteIds && c.prerequisiteIds.length > 0)
        .flatMap((c) =>
          c.prerequisiteIds.map((pId) => ({
            id: `edge-${pId}-${c.id}`,
            sourceConceptId: pId,
            targetConceptId: c.id,
            relationshipType: 'prerequisite',
            confidence: 1.0
          }))
        ),
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
    if (docs.length === 0 && courseId !== 'course-cs204') {
      return {
        id: `msg-${Date.now()}`,
        sender: 'tutor',
        text: 'This question was not found in your course material because no files have been uploaded yet. Please upload your textbook PDF, lecture slides, or video recording to begin grounded tutoring with verified citations.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        answerState: 'not_found',
        citations: [],
      };
    }

    const lower = message.toLowerCase();
    const qWords = lower.split(/\s+/).filter((w) => w.length > 3);

    // Check demo responses for CS 204
    if (courseId === 'course-cs204') {
      if (lower.includes('base case') || lower.includes('terminate')) {
        return {
          id: `msg-${Date.now()}`,
          sender: 'tutor',
          text: `Every recursive method requires at least one non-recursive halting base case. As demonstrated by Professor Henderson in Lecture 08 (14:32) and detailed in Textbook Chapter 4 (p. 112), omitting base case parameter progression creates unbounded activation records on the system call stack, triggering a hardware StackOverflowException.\n\nLevel: ${explanationLevel}. Remember: When returning aggregated values, base cases must return the algebraic identity element (0 for summation, true for universal conjunction).`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          answerState: 'supported',
          citations: [PUBLIC_SAMPLE_CITATIONS.textbookRecursion, PUBLIC_SAMPLE_CITATIONS.lectureVideo],
        };
      }
      if (lower.includes('dfs') || lower.includes('cycle') || lower.includes('three-color')) {
        return {
          id: `msg-${Date.now()}`,
          sender: 'tutor',
          text: 'In Depth-First Search on directed graphs, cycle detection relies on three vertex states:\n• White: Unvisited vertex\n• Gray: Currently active on the recursion call stack\n• Black: Subtree completely explored and popped\n\nPer Invariant 3 in Slide Deck 12 (Slide 19), a cycle exists if and only if an edge leads to an active Gray vertex. An edge to a Black vertex is a cross-edge between separate branches, not an ancestor back-edge.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          answerState: 'supported',
          citations: [PUBLIC_SAMPLE_CITATIONS.slidesDfs],
        };
      }
    }

    // Match against user's uploaded materials
    const matchingDoc = docs.find((doc) => {
      const docTitle = (doc.title || '').toLowerCase();
      const docSummary = (doc.summary || '').toLowerCase();
      const concepts = (doc.extractedConcepts || []).map((c) => c.toLowerCase());
      return (
        qWords.some((w) => docTitle.includes(w) || docSummary.includes(w)) ||
        concepts.some((c) => qWords.some((w) => c.includes(w)))
      );
    });

    if (matchingDoc) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'tutor',
        text: `Based directly on your uploaded courseware "${matchingDoc.title}":\n\n${matchingDoc.summary}\n\nCore verified principles indicate that state invariants and foundational definitions must be strictly observed. Review this section to master this topic for your upcoming exams.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        answerState: 'supported',
        citations: [
          {
            id: `cite-${matchingDoc.id}-tut`,
            documentId: matchingDoc.id,
            documentTitle: matchingDoc.title,
            sourceTitle: matchingDoc.title,
            sourceType: matchingDoc.type,
            locationLabel: `${matchingDoc.title}, Section 1`,
            excerpt: matchingDoc.summary || `Verified course material excerpt from ${matchingDoc.title}.`,
            contextSnippet: `From ${matchingDoc.title}`,
            verificationConfidence: 'verified',
          },
        ],
      };
    }

    // Unrelated query or irrelevant document
    const docNames = docs.map((d) => `"${d.title}"`).slice(0, 3).join(', ');
    const docContext = docNames ? ` (currently uploaded: ${docNames})` : '';
    return {
      id: `msg-${Date.now()}`,
      sender: 'tutor',
      text: `This topic was not found in your currently uploaded course materials${docContext}.\n\nThe uploaded material does not appear to be relevant to this question. Please upload a relevant PDF, lecture video, or slide deck covering this topic so CourseCompass can provide a verified, source-grounded answer with citations.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      answerState: 'not_found',
      citations: [],
    };
  },

  async getQuiz(ownerId: string, courseId: string): Promise<QuizQuestion[]> {
    if (courseId === 'course-cs204') {
      return DEMO_QUIZ_QUESTIONS;
    }

    const questions = store.quizzesByCourse.get(courseId);
    if (questions && questions.length > 0) {
      return questions;
    }

    // If no questions yet, synthesize from uploaded documents
    const docs = store.documentsByCourse.get(courseId) || [];
    if (docs.length > 0) {
      const concepts = store.conceptsByCourse.get(courseId) || [];
      const generated = generateQuizQuestionsForDocument(docs[0], concepts);
      store.quizzesByCourse.set(courseId, generated);
      saveStoreToLocalStorage(store);
      return generated;
    }

    return [];
  },

  async submitQuiz(
    ownerId: string,
    courseId: string,
    quizId: string,
    answers: Array<{ questionId: string; selectedOptionId?: string | null; submittedText?: string | null }>
  ): Promise<any> {
    let courseQuestions = (await this.getQuiz(ownerId, courseId)) || [];
    let targetCourseId = courseId;

    if (courseQuestions.length === 0 && answers.length > 0) {
      const qId = answers[0].questionId;
      for (const [cId, qList] of store.quizzesByCourse.entries()) {
        if (qList.some((q) => q.id === qId)) {
          courseQuestions = qList;
          targetCourseId = cId;
          break;
        }
      }
    }

    let correctCount = 0;

    const feedbackList = answers.map((ans) => {
      const question = courseQuestions.find((q) => q.id === ans.questionId);
      const chosenOpt = question?.options.find((o) => o.id === ans.selectedOptionId);
      const isCorrect = chosenOpt?.isCorrect ?? false;
      if (isCorrect) correctCount += 1;
      return {
        questionId: ans.questionId,
        isCorrect,
        explanation: chosenOpt?.misconceptionExplanation || question?.explanation || ''
      };
    });

    const total = answers.length || 1;
    const scorePercent = Math.round((correctCount / total) * 100);

    // Update concepts mastery
    const concepts = store.conceptsByCourse.get(targetCourseId) || [];
    for (const q of courseQuestions) {
      const targetConcept = concepts.find((c) => c.id === q.conceptId);
      if (targetConcept) {
        const delta = scorePercent >= 70 ? 12 : -5;
        targetConcept.masteryPercent = Math.max(0, Math.min(100, targetConcept.masteryPercent + delta));
        targetConcept.status = targetConcept.masteryPercent >= 75 ? 'mastered' : targetConcept.masteryPercent >= 40 ? 'learning' : 'attention';
      }
    }

    // Update overall course mastery
    const courses = store.coursesByOwner.get(ownerId) || [];
    const course = courses.find((c) => c.id === courseId);
    if (course && concepts.length > 0) {
      const avg = Math.round(concepts.reduce((sum, c) => sum + c.masteryPercent, 0) / concepts.length);
      course.overallMastery = avg;
    }

    saveStoreToLocalStorage(store);

    return {
      attemptId: `att-${Date.now()}`,
      scorePercent,
      totalQuestions: total,
      correctCount,
      masteryGainPercent: scorePercent >= 70 ? 12 : 0,
      weakConceptsIdentified: concepts.filter((c) => c.masteryPercent < 50).map((c) => c.id),
      updatedConcepts: concepts.map((c) => ({
        conceptId: c.id,
        newMasteryPercent: c.masteryPercent,
        newStatus: c.status
      })),
      feedbackList,
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
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(MOCK_STORAGE_KEY);
    }
    store = initMockStore();
  },
};
