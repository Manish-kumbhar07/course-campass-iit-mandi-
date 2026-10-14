import {
  StudentProfile,
  ConceptNode,
  CourseMaterial,
  TutorMessage,
  QuizQuestion,
  Flashcard,
  StudyPlanDay,
  SourceCitation
} from '../types';

export const INITIAL_STUDENT_PROFILE: StudentProfile = {
  name: 'Ananya Sharma',
  email: 'ananya.sharma@collegemail.edu',
  academicLevel: 'Second-year Undergraduate',
  university: 'School of Engineering & Applied Sciences',
  currentCourse: 'Data Structures: Recursion and Graphs',
  courseCode: 'CS 204',
  examDate: 'October 25, 2026',
  examCountdownDays: 12,
  dailyStudyMinutes: 45,
  overallMastery: 58,
  weakPoints: [
    'Recursion base case termination conditions',
    'Graph traversal prerequisites (Call stack vs. Queue mechanics)',
    'Cycle detection in directed graphs'
  ],
  studyStreakDays: 7,
  longestStreakDays: 14,
  todayMinutesCompleted: 45,
  last7DaysStreak: [
    { day: 'Wed', date: 'Oct 08', completed: true, minutes: 50 },
    { day: 'Thu', date: 'Oct 09', completed: true, minutes: 45 },
    { day: 'Fri', date: 'Oct 10', completed: true, minutes: 60 },
    { day: 'Sat', date: 'Oct 11', completed: true, minutes: 45 },
    { day: 'Sun', date: 'Oct 12', completed: true, minutes: 55 },
    { day: 'Mon', date: 'Oct 13', completed: true, minutes: 45 },
    { day: 'Today', date: 'Oct 14', completed: true, minutes: 45 }
  ],
  enrolledSubjects: [
    {
      id: 'subj-cs204',
      name: 'Data Structures: Recursion and Graphs',
      code: 'CS 204',
      department: 'Computer Science',
      overallMastery: 74,
      examDate: 'October 25, 2026',
      daysToExam: 12,
      totalTopics: 16,
      masteredTopics: 12,
      weeklyHoursLogged: 6.5,
      dailyGoalMinutes: 45,
      colorTheme: 'emerald',
      active: true
    },
    {
      id: 'subj-econ102',
      name: 'Introduction to Macroeconomics',
      code: 'ECON 102',
      department: 'Economics',
      overallMastery: 68,
      examDate: 'November 07, 2026',
      daysToExam: 24,
      totalTopics: 14,
      masteredTopics: 9,
      weeklyHoursLogged: 4.0,
      dailyGoalMinutes: 30,
      colorTheme: 'blue',
      active: false
    },
    {
      id: 'subj-bio101',
      name: 'Cellular & Molecular Biology',
      code: 'BIO 101',
      department: 'Life Sciences',
      overallMastery: 55,
      examDate: 'November 14, 2026',
      daysToExam: 31,
      totalTopics: 18,
      masteredTopics: 8,
      weeklyHoursLogged: 3.5,
      dailyGoalMinutes: 35,
      colorTheme: 'amber',
      active: false
    }
  ]
};

export const SAMPLE_CITATIONS: Record<string, SourceCitation> = {
  textbookRecursion: {
    id: 'cite-tb-1',
    sourceType: 'pdf',
    sourceTitle: 'Introduction to Algorithms & Data Structures (4th Ed.)',
    locationLabel: 'Chapter 4, Page 112',
    pageNumber: 112,
    excerpt:
      'Every well-formed recursive procedure must possess at least one non-recursive base case that halts recursion. Omitting the base case, or failing to make strict structural progression toward it, leads directly to unbounded call frame growth and a runtime stack overflow exception.',
    contextSnippet:
      'Section 4.2: Anatomy of Stack Frames in Activation Records — Figure 4.3 illustrates push/pop lifecycles on the hardware call stack.'
  },
  lectureRecursionVideo: {
    id: 'cite-vid-1',
    sourceType: 'video',
    sourceTitle: 'Lecture 08: Recursive Call Stack Mechanics & Base Case Design',
    locationLabel: 'Timestamp 14:32 - 16:15',
    timestampSeconds: 872,
    excerpt:
      'Professor Henderson: "Notice where students make the mistake in Fibonacci or tree traversal. They write the recursive step first, but forget to verify whether negative or boundary inputs reach the leaf condition before executing the split."',
    contextSnippet:
      'Chalkboard demonstration of stack frame unwinding with activation records pushing onto memory addresses 0x7fff...'
  },
  slidesGraphDfs: {
    id: 'cite-sld-1',
    sourceType: 'slides',
    sourceTitle: 'Lecture 12 Slide Deck: Graph Representations & Depth-First Search',
    locationLabel: 'Slide 19 of 38',
    slideNumber: 19,
    excerpt:
      'Invariant 3: In an unweighted directed graph, an edge (u, v) encountered during DFS is a back-edge if and only if vertex v is currently in the ACTIVE/GRAY state on the recursion call stack.',
    contextSnippet:
      'Color coding conventions: White = Unvisited, Gray = Active on Current Call Stack, Black = Fully Explored Subtree.'
  },
  audioOfficeHours: {
    id: 'cite-aud-1',
    sourceType: 'audio',
    sourceTitle: 'TA Office Hours: Base Case Pitfalls & Return Signatures',
    locationLabel: 'Audio Track 07:45',
    timestampSeconds: 465,
    excerpt:
      'Teaching Assistant: "When returning a boolean or aggregated counter from recursive branches, make sure your base case returns a neutral identity element (such as 0 for sum, or true for vacuous truth), rather than terminating early without unwinding."',
    contextSnippet:
      'Discussion of common mid-term exam traps in recursive helper functions.'
  },
  notesLabWorksheet: {
    id: 'cite-notes-1',
    sourceType: 'notes',
    sourceTitle: 'Lab 3 Handout: Call Stack Tracing Worksheet',
    locationLabel: 'Problem 2.4, Page 3',
    pageNumber: 3,
    excerpt:
      'Trace problem: Given recursive function f(n) = f(n-1) + f(n-2), construct the tree of stack frames. Show the exact order of pushes and pops in memory for n = 4.',
    contextSnippet:
      'Diagrammatic practice on peak memory footprint O(n) versus total operation count O(2^n).'
  }
};

export const COURSE_MATERIALS: CourseMaterial[] = [
  {
    id: 'mat-1',
    title: 'Lecture 08: Recursive Call Stack Mechanics & Base Case Design',
    type: 'video',
    size: '482 MB',
    durationOrPages: '48m 20s',
    dateAdded: 'Sep 28, 2026',
    extractedConcepts: ['Call Stack Activation Records', 'Recursion Base Cases', 'Stack Overflow Invariants'],
    status: 'processed',
    description: 'Whiteboard breakdown of memory stack layout during mutual and single recursion.'
  },
  {
    id: 'mat-2',
    title: 'Textbook Ch. 4: Recursion & Mathematical Induction Foundations',
    type: 'pdf',
    size: '14.2 MB',
    durationOrPages: '34 Pages',
    dateAdded: 'Sep 29, 2026',
    extractedConcepts: ['Base Cases', 'Divide & Conquer Recurrence', 'Master Theorem Invariants'],
    status: 'processed',
    description: 'Formal proofs and memory diagrams from Introduction to Algorithms & Data Structures.'
  },
  {
    id: 'mat-3',
    title: 'Lecture 12 Slide Deck: Graph Representations & Depth-First Search',
    type: 'slides',
    size: '8.6 MB',
    durationOrPages: '38 Slides',
    dateAdded: 'Oct 04, 2026',
    extractedConcepts: ['Adjacency Lists vs Matrix', 'DFS Traversal', 'Graph Cycle Detection', 'Three-Coloring Invariants'],
    status: 'processed',
    description: 'Visual state transitions for DFS, vertex coloring, and edge classification.'
  },
  {
    id: 'mat-4',
    title: 'TA Office Hours: Recursion Base Case Pitfalls & Return Signatures',
    type: 'audio',
    size: '22.1 MB',
    durationOrPages: '18m 10s',
    dateAdded: 'Oct 07, 2026',
    extractedConcepts: ['Recursion Base Cases', 'Return Identity Elements', 'Call Stack Tracing'],
    status: 'processed',
    description: 'Q&A session clarifying the top 4 common student errors on mid-term review.'
  },
  {
    id: 'mat-5',
    title: 'Lab 3 Handout: Call Stack Tracing Worksheet',
    type: 'notes',
    size: '1.4 MB',
    durationOrPages: '4 Pages',
    dateAdded: 'Oct 08, 2026',
    extractedConcepts: ['Call Stack Activation Records', 'Memory Footprints'],
    status: 'processed',
    description: 'Graded lab exercises tracing call frame pushes and pops across multiple recursive branches.'
  }
];

export const CONCEPTS_DATA: ConceptNode[] = [
  {
    id: 'c-stack-mechanics',
    name: 'Call Stack Mechanics',
    topic: 'Memory Architecture',
    difficulty: 'Foundational',
    masteryPercent: 64,
    status: 'learning',
    prerequisiteIds: [],
    summary:
      'Understanding activation records, stack pointer displacement, local frame allocation, and why each recursive call consumes O(1) auxiliary frame memory until return.',
    primaryMisconception:
      'Assuming variables from prior recursive frames are overwritten when a new frame pushes onto the call stack.',
    citations: [SAMPLE_CITATIONS.lectureRecursionVideo, SAMPLE_CITATIONS.notesLabWorksheet]
  },
  {
    id: 'c-base-cases',
    name: 'Recursion Base Cases',
    topic: 'Recursion Foundations',
    difficulty: 'Foundational',
    masteryPercent: 44,
    status: 'attention',
    prerequisiteIds: ['c-stack-mechanics'],
    summary:
      'Guaranteed termination conditions where the function returns directly without issuing further recursive invocations, safeguarding against infinite depth.',
    primaryMisconception:
      'Treating base cases merely as exception guards rather than structural halting states with explicit mathematical return values.',
    citations: [SAMPLE_CITATIONS.textbookRecursion, SAMPLE_CITATIONS.audioOfficeHours]
  },
  {
    id: 'c-divide-conquer',
    name: 'Divide and Conquer Recurrence',
    topic: 'Recursion Foundations',
    difficulty: 'Intermediate',
    masteryPercent: 78,
    status: 'mastered',
    prerequisiteIds: ['c-base-cases'],
    summary:
      'Partitioning problem spaces into subproblems of identical structure, recursively solving each subproblem, and combining solutions in linear or constant time.',
    primaryMisconception:
      'Confusing tree height logarithmic depth with linear invocation count.',
    citations: [SAMPLE_CITATIONS.textbookRecursion]
  },
  {
    id: 'c-graph-representations',
    name: 'Graph Representations',
    topic: 'Graph Fundamentals',
    difficulty: 'Foundational',
    masteryPercent: 82,
    status: 'mastered',
    prerequisiteIds: [],
    summary:
      'Trade-offs between Adjacency Matrix O(V^2) memory and Adjacency List O(V + E) memory for sparse versus dense graphs.',
    primaryMisconception:
      'Defaulting to Adjacency Matrix for sparse road networks or web link graphs.',
    citations: [SAMPLE_CITATIONS.slidesGraphDfs]
  },
  {
    id: 'c-dfs-traversal',
    name: 'Depth-First Search (DFS)',
    topic: 'Graph Traversal',
    difficulty: 'Intermediate',
    masteryPercent: 49,
    status: 'attention',
    prerequisiteIds: ['c-base-cases', 'c-graph-representations'],
    summary:
      'Exploration of graph vertices along deep paths using the system call stack or an explicit LIFO structure, tracking visit states to prevent cyclic deadlocks.',
    primaryMisconception:
      'Confusing the DFS call stack with BFS queue ordering, leading to incorrect traversal sequence proofs.',
    citations: [SAMPLE_CITATIONS.slidesGraphDfs, SAMPLE_CITATIONS.lectureRecursionVideo]
  },
  {
    id: 'c-bfs-traversal',
    name: 'Breadth-First Search (BFS)',
    topic: 'Graph Traversal',
    difficulty: 'Intermediate',
    masteryPercent: 71,
    status: 'learning',
    prerequisiteIds: ['c-graph-representations'],
    summary:
      'Level-order vertex exploration utilizing a FIFO queue, guaranteeing shortest-path discovery on unweighted graphs.',
    primaryMisconception:
      'Attempting to execute BFS recursively without an external queue container.',
    citations: [SAMPLE_CITATIONS.slidesGraphDfs]
  },
  {
    id: 'c-cycle-detection',
    name: 'Cycle Detection & Three-Coloring',
    topic: 'Graph Algorithms',
    difficulty: 'Advanced',
    masteryPercent: 32,
    status: 'attention',
    prerequisiteIds: ['c-dfs-traversal'],
    summary:
      'Detecting directed cycles using vertex states: White (unvisited), Gray (currently exploring on active stack), Black (completely explored).',
    primaryMisconception:
      'Believing any cross-edge to an already visited vertex indicates a directed cycle, ignoring the necessity of active back-edges.',
    citations: [SAMPLE_CITATIONS.slidesGraphDfs]
  },
  {
    id: 'c-topological-sort',
    name: 'Topological Sorting (DAGs)',
    topic: 'Graph Algorithms',
    difficulty: 'Advanced',
    masteryPercent: 25,
    status: 'locked',
    prerequisiteIds: ['c-cycle-detection'],
    summary:
      'Linear ordering of vertices in a Directed Acyclic Graph such that for every directed edge u -> v, vertex u comes before v in the order.',
    primaryMisconception:
      'Attempting topological sort on graphs with unresolved cycles without validation.',
    citations: [SAMPLE_CITATIONS.slidesGraphDfs, SAMPLE_CITATIONS.textbookRecursion]
  }
];

export const INITIAL_TUTOR_MESSAGES: TutorMessage[] = [
  {
    id: 'msg-1',
    sender: 'tutor',
    text:
      'Hello Ananya. I have indexed your CS 204 course materials: Lecture 08 video, Textbook Chapter 4, Slide Deck 12, and the Lab 3 worksheet. Based on your recent diagnostic check, you are solid on basic Graph Representations (82%), but your recursion base case design (44%) and DFS call stack tracking (49%) need reinforcement before the exam on October 25.\n\nWhat concept shall we work through today?',
    timestamp: '10:14 AM'
  },
  {
    id: 'msg-2',
    sender: 'user',
    text:
      'Why does infinite recursion cause a stack overflow error specifically, instead of just hanging like an infinite while loop?',
    timestamp: '10:15 AM'
  },
  {
    id: 'msg-3',
    sender: 'tutor',
    text:
      'In a simple `while(true)` loop, the program reuses the exact same stack frame. The CPU simply loops through instructions without allocating additional hardware memory.\n\nIn contrast, whenever a function invokes itself recursively, the operating system must allocate a fresh **activation record (stack frame)** in call stack memory. Each frame holds the return instruction pointer, local parameters, and return value buffers. Because stack memory is strictly finite (typically 1–8 MB), unbounded calls exhaust this contiguous region before any frame can return and be popped.',
    timestamp: '10:16 AM',
    citations: [SAMPLE_CITATIONS.textbookRecursion, SAMPLE_CITATIONS.lectureRecursionVideo],
    conceptId: 'c-stack-mechanics'
  }
];

export const SAMPLE_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q-1',
    conceptId: 'c-base-cases',
    conceptName: 'Recursion Base Cases',
    prompt:
      'Examine the following recursive method designed to compute the sum of all elements in an array from index `idx` to the end. What is the fundamental bug?',
    codeSnippet: `int sumArray(int[] arr, int idx) {
    if (idx == arr.length) {
        return 0;
    }
    return arr[idx] + sumArray(arr, idx);
}`,
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
        text: 'The recursive argument is not progressing toward the base case (`idx` is passed without incrementing), causing infinite recursion.',
        isCorrect: true
      },
      {
        id: 'opt-c',
        text: 'The base condition should be `idx > arr.length` to avoid out-of-bounds checks.',
        isCorrect: false,
        misconceptionExplanation:
          'Checking `idx == arr.length` cleanly halts at the exact moment index passes the final element (0-indexed). Changing to strict `>` would cause an IndexOutOfBoundsException on `arr[idx]`.'
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
    citation: SAMPLE_CITATIONS.textbookRecursion
  },
  {
    id: 'q-2',
    conceptId: 'c-dfs-traversal',
    conceptName: 'Depth-First Search (DFS)',
    prompt:
      'During Depth-First Search on a directed graph, which event guarantees the existence of a directed cycle?',
    options: [
      {
        id: 'opt-a',
        text: 'Encountering an edge to a vertex that has already been completely finished (Black state).',
        isCorrect: false,
        misconceptionExplanation:
          'An edge to a finished (Black) vertex is either a cross-edge or forward-edge in the DFS forest. It indicates an already-explored branch, not an active loop back to an ancestor.'
      },
      {
        id: 'opt-b',
        text: 'Encountering a back-edge to a vertex currently active on the current call stack (Gray state).',
        isCorrect: true
      },
      {
        id: 'opt-c',
        text: 'Finding an unvisited neighbor vertex (White state).',
        isCorrect: false,
        misconceptionExplanation:
          'Unvisited vertices simply represent tree edges that continue normal DFS traversal.'
      },
      {
        id: 'opt-d',
        text: 'When the adjacency list of the start vertex contains more than 3 outgoing edges.',
        isCorrect: false,
        misconceptionExplanation:
          'Degree of branching has no bearing on cyclic structure.'
      }
    ],
    explanation:
      'A back-edge points from a descendant in the DFS tree back to an active ancestor currently residing on the call stack (marked Gray). This path forms a closed loop, proving a directed cycle.',
    citation: SAMPLE_CITATIONS.slidesGraphDfs
  },
  {
    id: 'q-3',
    conceptId: 'c-stack-mechanics',
    conceptName: 'Call Stack Mechanics',
    prompt:
      'What is the maximum call stack memory auxiliary space complexity of standard recursive Depth-First Search on a graph with V vertices and E edges?',
    options: [
      {
        id: 'opt-a',
        text: 'O(E) auxiliary space in the worst case.',
        isCorrect: false,
        misconceptionExplanation:
          'Stack frames are allocated per vertex along the active exploration path, not per edge. The graph can have O(V^2) edges, but the stack never holds more than V simultaneous frames.'
      },
      {
        id: 'opt-b',
        text: 'O(V) auxiliary space in the worst case.',
        isCorrect: true
      },
      {
        id: 'opt-c',
        text: 'O(1) auxiliary space regardless of graph topology.',
        isCorrect: false,
        misconceptionExplanation:
          'Recursive DFS relies on the system call stack. In a linear graph (a long chain of vertices), the recursion depth reaches V, consuming O(V) stack memory.'
      },
      {
        id: 'opt-d',
        text: 'O(log V) auxiliary space on all directed graphs.',
        isCorrect: false,
        misconceptionExplanation:
          'Logarithmic depth occurs only in balanced binary tree topologies. General graphs can degrade into degenerate single-line paths of depth V.'
      }
    ],
    explanation:
      'In the worst-case scenario (such as a single linked chain of vertices v1 -> v2 -> ... -> vV), the recursion depth equals V. Hence the peak stack footprint is O(V).',
    citation: SAMPLE_CITATIONS.lectureRecursionVideo
  }
];

export const FLASHCARDS_DATA: Flashcard[] = [
  {
    id: 'fc-1',
    conceptId: 'c-base-cases',
    conceptName: 'Recursion Base Cases',
    topic: 'Recursion Foundations',
    front: 'What are the two essential requirements of every well-formed recursive function?',
    back: '1. At least one non-recursive base case that returns directly.\n2. Progress in every recursive invocation toward that base case (e.g., n - 1, subproblem partitioning).',
    sourceAnchor: 'Textbook Ch. 4, p. 112',
    repetitionStage: 'Review'
  },
  {
    id: 'fc-2',
    conceptId: 'c-stack-mechanics',
    conceptName: 'Call Stack Mechanics',
    topic: 'Memory Architecture',
    front: 'What information does a single activation record (stack frame) contain?',
    back: 'The return memory address (where to resume execution), input parameters, local variables, and saved register states.',
    sourceAnchor: 'Lecture 08, 14:32',
    repetitionStage: 'Review'
  },
  {
    id: 'fc-3',
    conceptId: 'c-cycle-detection',
    conceptName: 'Cycle Detection & Three-Coloring',
    topic: 'Graph Algorithms',
    front: 'In graph three-coloring for cycle detection, what do White, Gray, and Black signify?',
    back: '• White: Unvisited\n• Gray: Currently on the active call stack (in progress)\n• Black: Subtree completely visited and popped from stack\nA back-edge to a Gray vertex identifies a directed cycle.',
    sourceAnchor: 'Slides Deck 12, Slide 19',
    repetitionStage: 'New'
  },
  {
    id: 'fc-4',
    conceptId: 'c-dfs-traversal',
    conceptName: 'Depth-First Search (DFS)',
    topic: 'Graph Traversal',
    front: 'Why does an edge to an already visited vertex NOT necessarily mean a cycle exists in a directed graph?',
    back: 'Because it could be a cross-edge to a node in a separate, already finished branch (Black vertex). A cycle requires an edge to an active ancestor currently in the call stack (Gray vertex).',
    sourceAnchor: 'Lab 3 Handout, p. 3',
    repetitionStage: 'New'
  },
  {
    id: 'fc-5',
    conceptId: 'c-graph-representations',
    conceptName: 'Graph Representations',
    topic: 'Graph Fundamentals',
    front: 'When is an Adjacency List strictly preferred over an Adjacency Matrix?',
    back: 'When the graph is sparse (E << V^2). Adjacency list requires O(V + E) space and allows visiting all neighbors of vertex u in O(deg(u)) time rather than O(V).',
    sourceAnchor: 'Textbook Ch. 4, p. 128',
    repetitionStage: 'Mastered'
  }
];

export const STUDY_PLAN_DATA: StudyPlanDay[] = [
  {
    dayNumber: 1,
    dateString: 'Today · Oct 13',
    focusConceptId: 'c-base-cases',
    focusTitle: 'Prerequisite Repair: Base Case Termination & Identity Elements',
    minutesBudget: 45,
    status: 'in-progress',
    tasks: [
      {
        id: 't-1',
        title: 'Review Lecture 08 excerpt on Call Stack unwinding (14:32 - 16:15)',
        durationMinutes: 15,
        completed: true,
        type: 'reading',
        targetCitation: SAMPLE_CITATIONS.lectureRecursionVideo
      },
      {
        id: 't-2',
        title: 'Diagnostic Quiz on Recursion Base Cases and Parameter Progression',
        durationMinutes: 15,
        completed: false,
        type: 'quiz'
      },
      {
        id: 't-3',
        title: 'Ask Tutor to inspect mutual recursion boundary trap',
        durationMinutes: 15,
        completed: false,
        type: 'tutor'
      }
    ]
  },
  {
    dayNumber: 2,
    dateString: 'Tomorrow · Oct 14',
    focusConceptId: 'c-dfs-traversal',
    focusTitle: 'Graph Traversal Call Stack vs. Queue Mechanics',
    minutesBudget: 45,
    status: 'scheduled',
    tasks: [
      {
        id: 't-4',
        title: 'Study Slide Deck 12: Invariant 3 & Three-Color vertex progression',
        durationMinutes: 20,
        completed: false,
        type: 'reading',
        targetCitation: SAMPLE_CITATIONS.slidesGraphDfs
      },
      {
        id: 't-5',
        title: 'Flashcard Drill: 5 cards on DFS edge classifications',
        durationMinutes: 10,
        completed: false,
        type: 'flashcard'
      },
      {
        id: 't-6',
        title: 'Interactive problem walkthrough: Cycle detection in directed graphs',
        durationMinutes: 15,
        completed: false,
        type: 'quiz'
      }
    ]
  },
  {
    dayNumber: 3,
    dateString: 'Wednesday · Oct 15',
    focusConceptId: 'c-cycle-detection',
    focusTitle: 'Deep Dive: Cycle Detection & Gray Vertex Invariants',
    minutesBudget: 45,
    status: 'scheduled',
    tasks: [
      {
        id: 't-7',
        title: 'TA Office Hours recording: Gray vs Black cross-edge proofs',
        durationMinutes: 20,
        completed: false,
        type: 'reading',
        targetCitation: SAMPLE_CITATIONS.audioOfficeHours
      },
      {
        id: 't-8',
        title: 'Tutor Socratic simulation: Constructing counter-examples',
        durationMinutes: 25,
        completed: false,
        type: 'tutor'
      }
    ]
  },
  {
    dayNumber: 4,
    dateString: 'Thursday · Oct 16',
    focusConceptId: 'c-topological-sort',
    focusTitle: 'Synthesis: Topological Sorting on DAGs',
    minutesBudget: 45,
    status: 'scheduled',
    tasks: [
      {
        id: 't-9',
        title: 'Kahn Algorithm vs DFS Reverse Post-Order reading',
        durationMinutes: 20,
        completed: false,
        type: 'reading'
      },
      {
        id: 't-10',
        title: 'Comprehensive 15-question Adaptive Mock Examination',
        durationMinutes: 25,
        completed: false,
        type: 'quiz'
      }
    ]
  }
];
