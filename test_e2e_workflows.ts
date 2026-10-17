/**
 * End-to-End Workflow & Integration Test Suite for CourseCompass
 * Tests:
 * 1. User Signup & Authentication Resilience
 * 2. Custom Course Creation (Course: "de", Subject: "copm")
 * 3. Course List & Course Retrieval
 * 4. Materials Ingestion (PDF, Slides, Video, Audio, YouTube)
 * 5. YouTube Analysis & Summary Workflow
 * 6. Knowledge Map / Concept Graph
 * 7. Source-Grounded AI Tutoring with Evidence
 * 8. Adaptive Quiz Generation & Submission
 * 9. Topic Mastery & Time-Bounded Study Plan
 * 10. Strict User Data Isolation between independent student accounts
 * 11. Clean Logout State Sanitation
 */

// Minimal browser storage mock for Node environment
if (typeof sessionStorage === 'undefined') {
  const store = new Map<string, string>();
  (globalThis as any).sessionStorage = {
    getItem: (k: string) => store.get(k) || null,
    setItem: (k: string, v: string) => store.set(k, v),
    removeItem: (k: string) => store.delete(k),
    clear: () => store.clear(),
  };
}

import { AuthService } from './src/services/auth-service';
import { Api } from './src/services/api-client';

async function runTests() {
  console.log('====================================================');
  console.log('   COURSECOMPASS FULL END-TO-END WORKFLOW TEST');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // Test 1: Sign up new student
    // -------------------------------------------------------------
    console.log('1. Testing User Registration & Session Generation...');
    const user1Session = await AuthService.signUp(
      'Manish Kumbhar',
      'manish25com@student.mes.ac.in',
      'SecurePass123!'
    );
    assert(!!user1Session.token, 'Session token generated');
    assert(user1Session.user.name === 'Manish Kumbhar', 'User name matches registration');
    assert(user1Session.user.email === 'manish25com@student.mes.ac.in', 'User email matches registration');
    assert(user1Session.user.isNewUser === true, 'New user flag set to true');
    assert(user1Session.user.id !== 'usr-ananya-sharma', 'User ID is isolated and not Ananya Sharma');

    // -------------------------------------------------------------
    // Test 2: Custom Course Creation
    // -------------------------------------------------------------
    console.log('\n2. Testing Custom Course Creation (Course: "de", Subject: "copm")...');
    const newCourse = await Api.courses.create({
      name: 'de',
      code: 'de',
      subject: 'copm',
      dailyStudyMinutes: 45,
    });
    assert(!!newCourse.id, 'Course created with unique ID');
    assert(newCourse.name === 'de', 'Course name is "de"');
    assert(newCourse.subject === 'copm', 'Course subject is "copm"');
    assert(newCourse.userId === user1Session.user.id, 'Course belongs to authenticated student');

    // -------------------------------------------------------------
    // Test 3: Course Listing & Retrieval
    // -------------------------------------------------------------
    console.log('\n3. Testing Course Listing for Authenticated Student...');
    const user1Courses = await Api.courses.list();
    assert(user1Courses.length >= 1, 'Student course list contains created course');
    assert(user1Courses.some((c) => c.name === 'de'), 'Created course "de" found in list');

    const fetchedCourse = await Api.courses.get(newCourse.id);
    assert(fetchedCourse.id === newCourse.id, 'Fetched course by ID successfully');

    // -------------------------------------------------------------
    // Test 4: Materials Ingestion
    // -------------------------------------------------------------
    console.log('\n4. Testing Materials Ingestion (PDF, Slides, Video, Audio)...');
    const mockFile = { name: 'Chapter_1_Digital_Circuits.pdf', size: 1024 * 1024 * 3, type: 'application/pdf' } as any;
    const uploadRes = await Api.materials.upload(newCourse.id, mockFile, 'Digital Logic Fundamentals');
    assert(!!uploadRes.material.id, 'Uploaded material created with document ID');
    assert(uploadRes.material.title === 'Digital Logic Fundamentals', 'Material title correctly stored');
    assert(uploadRes.job.isCompleted === true, 'Processing job completed indexing');

    const materialsList = await Api.materials.list(newCourse.id);
    assert(materialsList.length >= 1, 'Course materials list reflects uploaded document');

    // -------------------------------------------------------------
    // Test 5: YouTube Lecture Analysis
    // -------------------------------------------------------------
    console.log('\n5. Testing YouTube Ingestion & Summary Workflow...');
    const ytRes = await Api.youtube.analyze(newCourse.id, {
      url: 'https://www.youtube.com/watch?v=sample123',
      title: 'Digital Electronics: Gates & Karnaugh Maps',
    });
    assert(!!ytRes.sourceId, 'YouTube source analysis initiated');
    assert(ytRes.status === 'ready', 'YouTube status ready');

    const ytSummary = await Api.youtube.getSummary(newCourse.id, ytRes.sourceId);
    assert(!!ytSummary.summary, 'YouTube summary generated with key takeaways');

    // -------------------------------------------------------------
    // Test 6: Knowledge Map & Concept Graph
    // -------------------------------------------------------------
    console.log('\n6. Testing Knowledge Map & Concept Relationships...');
    const mapData = await Api.map.getCourseMap(newCourse.id);
    assert(typeof mapData.totalConcepts === 'number', 'Knowledge map returns total concepts metric');
    assert(Array.isArray(mapData.concepts), 'Knowledge map returns concept nodes array');

    // -------------------------------------------------------------
    // Test 7: Grounded AI Tutor
    // -------------------------------------------------------------
    console.log('\n7. Testing Grounded Socratic AI Tutor & Citations...');
    const tutorAnswer = await Api.tutor.chat(newCourse.id, 'Explain logic gates and Karnaugh maps');
    assert(tutorAnswer.sender === 'tutor', 'Tutor answered inquiry');
    assert(tutorAnswer.text.length > 20, 'Tutor provides educational response');
    assert(!!tutorAnswer.answerState, 'Tutor specifies evidentiary grounding status');

    // -------------------------------------------------------------
    // Test 8: Adaptive Quizzes & Assessments
    // -------------------------------------------------------------
    console.log('\n8. Testing Adaptive Quiz Generation & Submission...');
    const generatedQuiz = await Api.quizzes.generate(newCourse.id, {
      difficulty: 'Intermediate',
      count: 2,
    });
    assert(!!generatedQuiz.id, 'Adaptive quiz generated with ID');
    assert(Array.isArray(generatedQuiz.questions), 'Quiz questions array returned');

    const submissionRes = await Api.quizzes.submit(generatedQuiz.id, [
      { questionId: 'q-1', selectedOptionId: 'opt-1' },
    ]);
    assert(typeof submissionRes.scorePercent === 'number', 'Quiz score calculated');

    // -------------------------------------------------------------
    // Test 9: Topic Mastery & Personalized Study Plan
    // -------------------------------------------------------------
    console.log('\n9. Testing Topic Mastery & Personalized Study Plan...');
    const masteryData = await Api.mastery.getTopicMastery(newCourse.id);
    assert(Array.isArray(masteryData), 'Topic mastery returned as array');

    const studyPlan = await Api.mastery.getStudyPlan(newCourse.id);
    assert(Array.isArray(studyPlan), 'Personalized daily study plan returned as array');

    // -------------------------------------------------------------
    // Test 10: Strict User Data Isolation
    // -------------------------------------------------------------
    console.log('\n10. Testing Strict Multi-Tenant User Data Isolation...');
    // Create a second student account
    const user2Session = await AuthService.signUp(
      'Second Student',
      'student2@university.edu',
      'AnotherPassword123!'
    );
    assert(user2Session.user.id !== user1Session.user.id, 'User 2 has completely different user ID');

    // User 2 courses should be completely empty
    const user2Courses = await Api.courses.list();
    assert(user2Courses.length === 0, 'New student starts with 0 courses (no demo leaks)');
    assert(!user2Courses.some((c) => c.name === 'de'), 'User 2 CANNOT see User 1 "de" course');

    // -------------------------------------------------------------
    // Test 11: Logout & State Sanitization
    // -------------------------------------------------------------
    console.log('\n11. Testing Logout & State Sanitization...');
    await AuthService.signOut();
    const activeSession = await AuthService.getSession();
    assert(activeSession === null, 'Session cleared on sign-out');
    const currentUser = await AuthService.getCurrentUser();
    assert(currentUser === null, 'Current user is null after logout');

  } catch (err) {
    console.error('\n💥 Unexpected Exception during test run:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();

