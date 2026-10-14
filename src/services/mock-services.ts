/**
 * Mock Service Layer for CourseCompass
 * Deterministic academic dataset for course CS 204: Recursion and Graphs
 * and isolated public preview models.
 */

import {
  Course,
  CourseDocument,
  Concept,
  SourceReference,
  TutorAnswer,
  QuizQuestion,
  Flashcard,
  StudyPlanItem,
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

export const MockService = {
  async getCourses(userId: string): Promise<Course[]> {
    if (userId === 'usr-ananya-sharma') {
      return [DEMO_COURSE];
    }
    // New users start with 0 courses
    return [];
  },

  async getCourseById(courseId: string): Promise<Course | null> {
    if (courseId === 'course-cs204') return DEMO_COURSE;
    return null;
  },

  async getCourseDocuments(courseId: string): Promise<CourseDocument[]> {
    if (courseId === 'course-cs204') return DEMO_DOCUMENTS;
    return [];
  },

  async getCourseConcepts(courseId: string): Promise<Concept[]> {
    if (courseId === 'course-cs204') return DEMO_CONCEPTS;
    return [];
  },

  async getTopicMastery(courseId: string): Promise<TopicMastery[]> {
    if (courseId === 'course-cs204') return DEMO_TOPIC_MASTERY;
    return [];
  }
};
