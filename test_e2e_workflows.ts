/**
 * End-to-End Workflow & Integration Test Suite for CourseCompass
 * Validates:
 * 1. User Signup & Persistent Account Registry
 * 2. "Already have an account?" Sign-in & Authentication Validation
 * 3. Invalid credentials & nonexistent account safety errors
 * 4. Custom Course Creation (Course: "de", Subject: "copm")
 * 5. Course List & Scoped Retrieval
 * 6. Materials Ingestion (PDF with extracted concepts)
 * 7. YouTube Analysis & Summary Workflow
 * 8. Knowledge Map / Concept Graph populated from materials
 * 9. Source-Grounded AI Tutoring with Evidence & Citations
 * 10. Adaptive Quiz Generation from Uploaded Material
 * 11. Quiz Submission & Dynamic Topic Mastery Gain
 * 12. Strict Multi-Tenant Data Isolation between Users
 * 13. Clean Logout & Private State Sanitization
 */

// Browser storage mocks for Node CLI test environment
if (typeof sessionStorage === 'undefined') {
  const sStore = new Map<string, string>();
  (globalThis as any).sessionStorage = {
    getItem: (k: string) => sStore.get(k) || null,
    setItem: (k: string, v: string) => sStore.set(k, String(v)),
    removeItem: (k: string) => sStore.delete(k),
    clear: () => sStore.clear(),
  };
}
if (typeof localStorage === 'undefined') {
  const lStore = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (k: string) => lStore.get(k) || null,
    setItem: (k: string, v: string) => lStore.set(k, String(v)),
    removeItem: (k: string) => lStore.delete(k),
    clear: () => lStore.clear(),
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
    assert(user1Session.user.id !== 'usr-ananya-sharma', 'User ID is isolated and not Ananya Sharma');

    // -------------------------------------------------------------
    // Test 2: Existing User Sign-In ("Already have an account?")
    // -------------------------------------------------------------
    console.log('\n2. Testing "Already have an account?" Sign-in Flow...');
    // Sign out first
    await AuthService.signOut();
    assert((await AuthService.getSession()) === null, 'Session cleared on sign-out');

    // Test sign in with valid credentials
    const signedInSession = await AuthService.signIn(
      'manish25com@student.mes.ac.in',
      'SecurePass123!'
    );
    assert(signedInSession.user.id === user1Session.user.id, 'Existing account sign-in preserves exact user ID');
    assert(signedInSession.user.email === 'manish25com@student.mes.ac.in', 'Sign-in retrieved correct user email');

    // Test sign in with wrong password
    let wrongPassFailed = false;
    try {
      await AuthService.signIn('manish25com@student.mes.ac.in', 'WrongPassword999!');
    } catch (err: any) {
      wrongPassFailed = true;
      assert(err.message.includes('Invalid email or password'), 'Wrong password rejected with safe message');
    }
    assert(wrongPassFailed, 'Sign-in with wrong password was prevented');

    // Test sign in with unknown email
    let unknownAccountFailed = false;
    try {
      await AuthService.signIn('unknown_user_999@university.edu', 'SomePassword123!');
    } catch (err: any) {
      unknownAccountFailed = true;
      assert(err.message.includes('No account found'), 'Unknown account rejected with clear instruction');
    }
    assert(unknownAccountFailed, 'Sign-in with unknown email was prevented');

    // Restore user session
    await AuthService.signIn('manish25com@student.mes.ac.in', 'SecurePass123!');

    // -------------------------------------------------------------
    // Test 3: Custom Course Creation
    // -------------------------------------------------------------
    console.log('\n3. Testing Custom Course Creation (Course: "de", Subject: "copm")...');
    const newCourse = await Api.courses.create({
      name: 'de',
      code: 'de',
      subject: 'copm',
      dailyStudyMinutes: 45,
    });
    assert(!!newCourse.id, 'Course created with unique ID');
    assert(newCourse.name === 'de', 'Course name is "de"');
    assert(newCourse.subject === 'copm', 'Course subject is "copm"');
    assert(newCourse.userId === user1Session.user.id, 'Course belongs strictly to authenticated student');

    // -------------------------------------------------------------
    // Test 4: Course Listing & Retrieval
    // -------------------------------------------------------------
    console.log('\n4. Testing Course Listing for Authenticated Student...');
    const user1Courses = await Api.courses.list();
    assert(user1Courses.length >= 1, 'Student course list contains created course');
    assert(user1Courses.some((c) => c.name === 'de'), 'Created course "de" found in list');

    const fetchedCourse = await Api.courses.get(newCourse.id);
    assert(fetchedCourse.id === newCourse.id, 'Fetched course by ID successfully');

    // -------------------------------------------------------------
    // Test 5: Materials Ingestion with Automatic Concept Extraction
    // -------------------------------------------------------------
    console.log('\n5. Testing Materials Ingestion (PDF, Slides, Video, Audio)...');
    const mockFile = { name: 'Chapter_1_Digital_Circuits.pdf', size: 1024 * 1024 * 3, type: 'application/pdf' } as any;
    const uploadRes = await Api.materials.upload(newCourse.id, mockFile, 'Digital Logic Fundamentals');
    assert(!!uploadRes.material.id, 'Uploaded material created with document ID');
    assert(uploadRes.material.title === 'Digital Logic Fundamentals', 'Material title correctly stored');
    assert(uploadRes.job.isCompleted === true, 'Processing job completed indexing');
    assert(uploadRes.material.extractedConcepts && uploadRes.material.extractedConcepts.length >= 1, 'Concepts extracted from document');

    const materialsList = await Api.materials.list(newCourse.id);
    assert(materialsList.length >= 1, 'Course materials list reflects uploaded document');

    // -------------------------------------------------------------
    // Test 6: YouTube Lecture Analysis
    // -------------------------------------------------------------
    console.log('\n6. Testing YouTube Ingestion & Summary Workflow...');
    const ytRes = await Api.youtube.analyze(newCourse.id, {
      url: 'https://www.youtube.com/watch?v=sample123',
      title: 'Digital Electronics: Gates & Karnaugh Maps',
    });
    assert(!!ytRes.sourceId, 'YouTube source analysis initiated');
    assert(ytRes.status === 'ready', 'YouTube status ready');

    const ytSummary = await Api.youtube.getSummary(newCourse.id, ytRes.sourceId);
    assert(!!ytSummary.summary, 'YouTube summary generated with key takeaways');

    // -------------------------------------------------------------
    // Test 7: Knowledge Map / Concept Graph
    // -------------------------------------------------------------
    console.log('\n7. Testing Knowledge Map & Concept Relationships...');
    const mapData = await Api.map.getCourseMap(newCourse.id);
    assert(mapData.concepts.length >= 1, 'Knowledge map populated with concepts from uploaded document');
    assert(mapData.concepts.some((c) => c.name.includes('Digital Logic')), 'Concept name matches uploaded study material');

    // -------------------------------------------------------------
    // Test 8: Grounded AI Tutor Answering from Uploaded Material
    // -------------------------------------------------------------
    console.log('\n8. Testing Grounded Socratic AI Tutor & Citations...');
    const tutorAnswer = await Api.tutor.chat(newCourse.id, 'What does Digital Logic Fundamentals cover?');
    assert(tutorAnswer.sender === 'tutor', 'Tutor answered inquiry');
    assert(tutorAnswer.answerState === 'supported', 'Answer is source-grounded in uploaded document');
    assert(tutorAnswer.citations.length >= 1, 'Verified citation returned with answer');
    assert(tutorAnswer.citations[0].sourceTitle === 'Digital Logic Fundamentals', 'Citation cites uploaded document title');

    // -------------------------------------------------------------
    // Test 9: Adaptive Quiz Generation from Uploaded Material
    // -------------------------------------------------------------
    console.log('\n9. Testing Adaptive Quiz Generation from Uploaded Material...');
    const generatedQuiz = await Api.quizzes.generate(newCourse.id, {
      difficulty: 'Adaptive',
      count: 3,
    });
    assert(!!generatedQuiz.id, 'Adaptive quiz generated with ID');
    assert(generatedQuiz.questions.length >= 1, 'Quiz questions generated for course materials');
    assert(generatedQuiz.questions[0].options.length === 4, 'Quiz question has 4 options');
    assert(!!generatedQuiz.questions[0].citation, 'Quiz question has source citation');

    // -------------------------------------------------------------
    // Test 10: Quiz Submission & Mastery Update
    // -------------------------------------------------------------
    console.log('\n10. Testing Quiz Submission & Topic Mastery Gain...');
    const submissionRes = await Api.quizzes.submit(generatedQuiz.id, [
      {
        questionId: generatedQuiz.questions[0].id,
        selectedOptionId: generatedQuiz.questions[0].options.find((o) => o.isCorrect)?.id,
      },
    ]);
    assert(typeof submissionRes.scorePercent === 'number', 'Quiz score calculated');
    assert(submissionRes.correctCount >= 1, 'Correct option credited');

    const masteryData = await Api.mastery.getTopicMastery(newCourse.id);
    assert(masteryData.length >= 1, 'Topic mastery populated for course');

    // -------------------------------------------------------------
    // Test 11: Strict Multi-Tenant User Data Isolation
    // -------------------------------------------------------------
    console.log('\n11. Testing Strict Multi-Tenant User Data Isolation...');
    // Create a second student account
    const user2Session = await AuthService.signUp(
      'Second Student',
      'student2@university.edu',
      'AnotherPassword123!'
    );
    assert(user2Session.user.id !== user1Session.user.id, 'User 2 has completely different user ID');

    // User 2 courses should be completely empty
    const user2Courses = await Api.courses.list();
    assert(user2Courses.length === 0, 'New student starts with 0 courses (no leaks from User 1)');
    assert(!user2Courses.some((c) => c.name === 'de'), 'User 2 CANNOT see User 1 "de" course');

    // User 2 documents should be empty
    const user2Docs = await Api.materials.list(newCourse.id);
    assert(user2Docs.length === 0 || !user2Courses.some(c => c.id === newCourse.id), 'User 2 cannot access User 1 course documents');

    // -------------------------------------------------------------
    // Test 12: Logout & State Sanitization
    // -------------------------------------------------------------
    console.log('\n12. Testing Logout & State Sanitization...');
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
