import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../src/models/User.js';
import { createApp } from '../src/app.js';
import { seedDefaultAdmin } from '../src/controllers/authController.js';

dotenv.config();

const runAuthTests = async () => {
  console.log('🧪 Starting Phase 1 Authentication Tests...');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  await seedDefaultAdmin();

  const app = createApp();
  const server = app.listen(5099);

  const baseUrl = 'http://localhost:5099/api/auth';

  try {
    // Clean up any previous test accounts
    await User.deleteMany({ email: { $in: ['testcustomer@example.com', 'testworker@example.com', 'hackadmin@example.com'] } });

    // 1. Test Customer Registration (Individual)
    const regCustRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Arun Kumar',
        email: 'testcustomer@example.com',
        password: 'password123',
        phone: '+91 9123456789',
        role: 'customer',
        customerType: 'individual',
      }),
    });
    const regCustData = await regCustRes.json();
    console.assert(regCustRes.status === 201, 'Customer register status should be 201');
    console.assert(regCustData.token, 'Should return JWT token');
    console.assert(regCustData.user.role === 'customer', 'Role should be customer');
    console.log('✅ Test 1 Passed: Customer registration successful');

    // 2. Test Duplicate Email Rejection
    const dupRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Arun Duplicate',
        email: 'testcustomer@example.com',
        password: 'password123',
        phone: '+91 9123456789',
      }),
    });
    console.assert(dupRes.status === 400, 'Duplicate email should be rejected with 400');
    console.log('✅ Test 2 Passed: Duplicate email rejected');

    // 3. Test Security: Public Admin Registration Rejection
    const hackAdminRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Hacker',
        email: 'hackadmin@example.com',
        password: 'password123',
        phone: '+91 9000000000',
        role: 'admin',
      }),
    });
    console.assert(hackAdminRes.status === 400, 'Role admin in public registration must be rejected with 400');
    console.log('✅ Test 3 Passed: Public admin registration prevented');

    // 4. Test Worker Registration
    const regWorkerRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Ramesh Plumber',
        email: 'testworker@example.com',
        password: 'password123',
        phone: '+91 9888877777',
        role: 'worker',
      }),
    });
    const regWorkerData = await regWorkerRes.json();
    console.assert(regWorkerRes.status === 201, 'Worker register status should be 201');
    console.assert(regWorkerData.user.role === 'worker', 'Role should be worker');
    console.log('✅ Test 4 Passed: Worker registration successful');

    // 5. Test Customer Login
    const loginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testcustomer@example.com',
        password: 'password123',
      }),
    });
    const loginData = await loginRes.json();
    console.assert(loginRes.status === 200, 'Login status should be 200');
    console.assert(loginData.token, 'Should return token');
    console.log('✅ Test 5 Passed: Customer login successful');

    // 6. Test Protected Route /api/auth/me
    const meRes = await fetch(`${baseUrl}/me`, {
      headers: { Authorization: `Bearer ${loginData.token}` },
    });
    const meData = await meRes.json();
    console.assert(meRes.status === 200, 'Protected /me should be 200');
    console.assert(meData.user.email === 'testcustomer@example.com', 'User email should match');
    console.log('✅ Test 6 Passed: Protected /me route returned verified profile');

    // 7. Test Admin Login with Seeded Credentials
    const adminLoginRes = await fetch(`${baseUrl}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@workmate.local',
        password: 'Admin@WorkMate2026!',
      }),
    });
    const adminData = await adminLoginRes.json();
    console.assert(adminLoginRes.status === 200, 'Admin login should succeed');
    console.assert(adminData.user.role === 'admin', 'Admin role should be admin');
    console.log('✅ Test 7 Passed: Dedicated Admin Login verified');

    console.log('\n🎉 ALL 7 PHASE 1 AUTH BACKEND TESTS PASSED!\n');
  } finally {
    server.close();
    await mongoose.disconnect();
  }
};

runAuthTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
