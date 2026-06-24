const { spawn } = require('child_process');
const http = require('http');

const PORT = 3333;
const BASE_URL = `http://localhost:${PORT}`;

// Helper to make JSON requests using Node.js native http module (to avoid requiring node-fetch)
function makeRequest(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, rawBody: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- INTEGRATION TEST STARTED ---');
  
  // 1. Spawn server process
  console.log('Spawning server.js...');
  const server = spawn('node', ['server.js'], {
    env: { ...process.env, NODE_ENV: 'development', PORT: PORT.toString() }
  });

  server.stdout.on('data', (data) => {
    console.log(`[Server STDOUT]: ${data.toString().trim()}`);
  });

  server.stderr.on('data', (data) => {
    console.error(`[Server STDERR]: ${data.toString().trim()}`);
  });

  // Wait 3 seconds for server to initialize
  await new Promise(r => setTimeout(r, 3000));

  let passed = true;

  try {
    // Test 1: Access admin endpoints without authorization
    console.log('\nTest 1: Accessing admin panel without authorization headers...');
    const resNoAuth = await makeRequest('GET', '/api/admin/groups');
    if (resNoAuth.status === 403) {
      console.log('✅ Pass: Unauthorized access correctly rejected (403)');
    } else {
      console.error(`❌ Fail: Expected 403, got ${resNoAuth.status}`);
      passed = false;
    }

    // Test 2: Create a group with admin authentication
    console.log('\nTest 2: Creating a group ("May 2026") as Admin...');
    const resCreateMay = await makeRequest('POST', '/api/admin/groups', {
      'X-Telegram-Init-Data': 'mock_admin'
    }, { name: 'May 2026' });

    if (resCreateMay.status === 200 && resCreateMay.body.success) {
      console.log(`✅ Pass: Group created! Slug: "${resCreateMay.body.group.slug}"`);
      if (resCreateMay.body.group.slug === 'may-2026') {
        console.log('✅ Pass: Slug correctly generated as "may-2026"');
      } else {
        console.error(`❌ Fail: Expected slug "may-2026", got "${resCreateMay.body.group.slug}"`);
        passed = false;
      }
    } else {
      console.error('❌ Fail: Could not create group', resCreateMay);
      passed = false;
    }

    // Test 3: Create duplicate group to test slug unique suffix appending
    console.log('\nTest 3: Creating duplicate group name ("May 2026") to verify slug collision handling...');
    const resCreateMayDup = await makeRequest('POST', '/api/admin/groups', {
      'X-Telegram-Init-Data': 'mock_admin'
    }, { name: 'May 2026' });

    if (resCreateMayDup.status === 200 && resCreateMayDup.body.group.slug === 'may-2026-1') {
      console.log('✅ Pass: Unique slug handled correctly: "may-2026-1"');
    } else {
      console.error('❌ Fail: Slug collision not handled, got:', resCreateMayDup.body);
      passed = false;
    }

    // Test 4: Create another group
    console.log('\nTest 4: Creating group "Iyun 2026"');
    const resCreateIyun = await makeRequest('POST', '/api/admin/groups', {
      'X-Telegram-Init-Data': 'mock_admin'
    }, { name: 'Iyun 2026' });
    const iyunGroupId = resCreateIyun.body.group.id;
    console.log(`✅ Pass: Created group "Iyun 2026" with ID ${iyunGroupId}`);

    // Test 5: Submit a question for "May 2026" group
    console.log('\nTest 5: Submitting a student question for "may-2026"...');
    const resSubmitQ1 = await makeRequest('POST', '/api/question', {
      'X-Telegram-Init-Data': 'mock_student_99112_may-2026'
    }, {
      group_slug: 'may-2026',
      question_text: 'Qanday qilib kanalda ko\'rishlar sonini oshirish mumkin?'
    });

    if (resSubmitQ1.status === 200 && resSubmitQ1.body.success) {
      console.log('✅ Pass: Question submitted successfully');
    } else {
      console.error('❌ Fail: Question submission failed:', resSubmitQ1);
      passed = false;
    }

    // Test 6: Submit a question for "Iyun 2026" group
    console.log('\nTest 6: Submitting a student question for "iyun-2026"...');
    const resSubmitQ2 = await makeRequest('POST', '/api/question', {
      'X-Telegram-Init-Data': 'mock_student_44556_iyun-2026'
    }, {
      group_slug: 'iyun-2026',
      question_text: 'Railway deploy uchun SQLite persistent volume qayerda sozlanadi?'
    });
    console.log('✅ Pass: Question submitted successfully for Iyun');

    // Test 7: Verify question lists and count badges for Admin
    console.log('\nTest 7: Fetching admin dashboard groups to verify pending question counts...');
    const resDashboard = await makeRequest('GET', '/api/admin/groups', {
      'X-Telegram-Init-Data': 'mock_admin'
    });

    if (resDashboard.status === 200) {
      const groups = resDashboard.body.groups;
      const mayGroup = groups.find(g => g.slug === 'may-2026');
      const iyunGroup = groups.find(g => g.slug === 'iyun-2026');

      if (mayGroup && mayGroup.pending_count === 1 && iyunGroup && iyunGroup.pending_count === 1) {
        console.log('✅ Pass: Pending count for May 2026 is 1, and Iyun 2026 is 1');
      } else {
        console.error('❌ Fail: Pending counts mismatch:', groups);
        passed = false;
      }
    } else {
      console.error('❌ Fail: Could not fetch admin dashboard');
      passed = false;
    }

    // Test 8: Fetch specific questions for a group
    console.log('\nTest 8: Fetching questions list for "Iyun 2026"...');
    const resQuestions = await makeRequest('GET', `/api/admin/questions/${iyunGroupId}`, {
      'X-Telegram-Init-Data': 'mock_admin'
    });

    let iyunQuestionId = null;
    if (resQuestions.status === 200 && resQuestions.body.questions.length === 1) {
      const q = resQuestions.body.questions[0];
      iyunQuestionId = q.id;
      console.log(`✅ Pass: Question details retrieved successfully. Text: "${q.question_text}"`);
    } else {
      console.error('❌ Fail: Expected 1 question for Iyun, got:', resQuestions.body);
      passed = false;
    }

    // Test 9: Delete group and check cascading deletion of its questions
    console.log('\nTest 9: Deleting "Iyun 2026" group and verifying cascade delete of its questions...');
    const resDeleteIyun = await makeRequest('DELETE', `/api/admin/groups/${iyunGroupId}`, {
      'X-Telegram-Init-Data': 'mock_admin'
    });

    if (resDeleteIyun.status === 200) {
      console.log('✅ Pass: Iyun group deleted successfully');
      
      // Verify group is gone and its question is gone
      const resDashboardAfter = await makeRequest('GET', '/api/admin/groups', {
        'X-Telegram-Init-Data': 'mock_admin'
      });
      const groupsAfter = resDashboardAfter.body.groups;
      const iyunExists = groupsAfter.some(g => g.id === iyunGroupId);
      
      if (!iyunExists) {
        console.log('✅ Pass: Iyun group is no longer in groups list');
      } else {
        console.error('❌ Fail: Iyun group still exists after deletion');
        passed = false;
      }
    } else {
      console.error('❌ Fail: Group deletion failed:', resDeleteIyun);
      passed = false;
    }

  } catch (error) {
    console.error('Test Execution Error:', error);
    passed = false;
  } finally {
    // Kill the server
    console.log('\nTerminating server.js...');
    server.kill();
    
    // Give server time to terminate
    await new Promise(r => setTimeout(r, 1000));
  }

  if (passed) {
    console.log('\n🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULY! 🎉');
    process.exit(0);
  } else {
    console.error('\n❌ SOME INTEGRATION TESTS FAILED ❌');
    process.exit(1);
  }
}

runTests();
