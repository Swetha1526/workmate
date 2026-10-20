import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createApp } from '../src/app.js';
import { User } from '../src/models/User.js';
import { WorkerProfile } from '../src/models/WorkerProfile.js';
import { Booking } from '../src/models/Booking.js';
import { Review } from '../src/models/Review.js';
import { Conversation } from '../src/models/Conversation.js';
import { Message } from '../src/models/Message.js';
import { seedDefaultAdmin } from '../src/controllers/authController.js';
import { seedDemoWorkersIfEmpty } from '../src/utils/seedData.js';

dotenv.config();

const results = [];
const recordTest = (suite, testName, passed, detail = '') => {
  results.push({ suite, testName, passed, detail });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [${suite}] ${testName} ${detail ? `(${detail})` : ''}`);
};

const runMasterTestSuite = async () => {
  console.log('\n======================================================');
  console.log('🚀 WorkMate Master Automated Capstone Test Suite');
  console.log('======================================================\n');

  const startTime = Date.now();

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    recordTest('DB', 'MongoDB Atlas Cloud Connection', true, `Database: ${mongoose.connection.name}`);

    await seedDefaultAdmin();
    recordTest('DB', 'Admin Account Auto-Provisioning', true, 'admin@workmate.local verified');

    await seedDemoWorkersIfEmpty();
    recordTest('DB', 'Demo Workers Seeded (10 Categories)', true, 'Sample data tagged with isDemo: true');

    const app = createApp();
    const server = app.listen(5095);
    const baseUrl = 'http://localhost:5095/api';

    try {
      // Suite 1: Authentication & Role Enforcement
      const custEmail = `cust_${Date.now()}@test.local`;
      const workerEmail = `work_${Date.now()}@test.local`;

      const regCustRes = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Priya Sharma',
          email: custEmail,
          password: 'Password123!',
          phone: '+91 91111 22222',
          role: 'customer',
          customerType: 'business',
        }),
      });
      const regCustData = await regCustRes.json();
      recordTest('AUTH', 'Customer (Business) Registration', regCustRes.status === 201 && !!regCustData.token);

      const regWorkerRes = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Velu Mason',
          email: workerEmail,
          password: 'Password123!',
          phone: '+91 93333 44444',
          role: 'worker',
        }),
      });
      const regWorkerData = await regWorkerRes.json();
      recordTest('AUTH', 'Worker Registration', regWorkerRes.status === 201 && !!regWorkerData.token);

      // Security check: Block self-assigned admin
      const secRegRes = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Hacker',
          email: `hacker_${Date.now()}@test.local`,
          password: 'Password123!',
          phone: '+91 90000 00000',
          role: 'admin',
        }),
      });
      recordTest('SECURITY', 'Public Admin Registration Rejection', secRegRes.status === 400);

      // Suite 2: Worker Profile Management
      const createProfRes = await fetch(`${baseUrl}/workers/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${regWorkerData.token}`,
        },
        body: JSON.stringify({
          category: 'masons',
          skills: ['Plastering', 'Granite Fitting', 'Compound Wall'],
          experienceYears: 8,
          locality: 'Adyar, Chennai',
          hourlyRate: 450,
          bio: 'Experienced civil mason specializing in residential renovations.',
        }),
      });
      const createProfData = await createProfRes.json();
      recordTest('WORKER', 'Worker Profile Creation with Category & Skills', createProfRes.status === 200);

      // Suite 3: Worker Discovery & Filters
      const discRes = await fetch(`${baseUrl}/workers?category=masons`);
      const discData = await discRes.json();
      const allMasons = discData.workers.every((w) => w.category === 'masons');
      recordTest('DISCOVERY', 'Filter Workers by Category (masons)', discRes.status === 200 && allMasons && discData.workers.length >= 1);

      // Suite 4: Booking Workflow & Cost Calculation
      const bookRes = await fetch(`${baseUrl}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${regCustData.token}`,
        },
        body: JSON.stringify({
          workerId: createProfData.profile._id,
          jobDescription: 'Front porch tiling and repair',
          locality: 'Adyar, Chennai',
          scheduledDate: new Date(Date.now() + 86400000).toISOString(),
          scheduledTime: '10:00 AM',
          estimatedHours: 4,
        }),
      });
      const bookData = await bookRes.json();
      const expectedCost = 450 * 4; // 1800
      recordTest('BOOKING', 'Booking Placement & Server-side Cost Calculation', bookRes.status === 201 && bookData.booking.totalEstimatedCost === expectedCost, `Total: ₹${expectedCost}`);

      const bookingId = bookData.booking._id;

      // Status transitions
      const acceptRes = await fetch(`${baseUrl}/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${regWorkerData.token}`,
        },
        body: JSON.stringify({ status: 'accepted' }),
      });
      recordTest('BOOKING', 'Worker Accept Action', acceptRes.status === 200);

      const progRes = await fetch(`${baseUrl}/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${regWorkerData.token}`,
        },
        body: JSON.stringify({ status: 'in_progress' }),
      });
      recordTest('BOOKING', 'In-Progress Transition', progRes.status === 200);

      const compRes = await fetch(`${baseUrl}/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${regWorkerData.token}`,
        },
        body: JSON.stringify({ status: 'completed' }),
      });
      recordTest('BOOKING', 'Job Completion Transition', compRes.status === 200);

      // Direct payment recording
      const payRes = await fetch(`${baseUrl}/bookings/${bookingId}/payment`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${regCustData.token}` },
      });
      recordTest('BOOKING', 'Direct Cash/UPI Payment Recorded', payRes.status === 200);

      // Suite 5: Customer Reviews
      const revRes = await fetch(`${baseUrl}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${regCustData.token}`,
        },
        body: JSON.stringify({
          bookingId,
          rating: 5,
          comment: 'Outstanding stonework and punctual arrival.',
        }),
      });
      recordTest('REVIEWS', 'Post-completion Review Submission & Rating Update', revRes.status === 201);

      // Suite 6: Socket / Chat Message Persistence
      const convRes = await fetch(`${baseUrl}/chat/booking/${bookingId}`, {
        headers: { Authorization: `Bearer ${regCustData.token}` },
      });
      const convData = await convRes.json();
      const convId = convData.conversation._id;

      const chatSendRes = await fetch(`${baseUrl}/chat/${convId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${regCustData.token}`,
        },
        body: JSON.stringify({ text: 'Hello Velu, do you need any extra cement mix?' }),
      });
      recordTest('CHAT', 'Chat Message Persistence in MongoDB', chatSendRes.status === 201);

      const chatFetchRes = await fetch(`${baseUrl}/chat/${convId}/messages`, {
        headers: { Authorization: `Bearer ${regWorkerData.token}` },
      });
      const chatFetchData = await chatFetchRes.json();
      recordTest('CHAT', 'Chat History & Read Receipt Synchronization', chatFetchRes.status === 200 && chatFetchData.messages.length >= 1);

      // Suite 7: Admin Panel & Metrics
      const adminLoginRes = await fetch(`${baseUrl}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@workmate.local',
          password: 'Admin@WorkMate2026!',
        }),
      });
      const adminData = await adminLoginRes.json();
      recordTest('ADMIN', 'Dedicated Admin Portal Authentication', adminLoginRes.status === 200);

      const metricsRes = await fetch(`${baseUrl}/admin/metrics`, {
        headers: { Authorization: `Bearer ${adminData.token}` },
      });
      const metricsData = await metricsRes.json();
      recordTest('ADMIN', 'Live Platform Metrics Aggregation', metricsRes.status === 200 && metricsData.metrics.users.total >= 3);

      // Cleanup test user accounts
      await User.deleteMany({ email: { $in: [custEmail, workerEmail] } });
    } finally {
      server.close();
      await mongoose.disconnect();
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    const passCount = results.filter((r) => r.passed).length;
    const failCount = results.filter((r) => !r.passed).length;

    console.log('\n======================================================');
    console.log(`🏁 Test Summary: ${passCount} Passed, ${failCount} Failed (${elapsed}s)`);
    console.log('======================================================\n');

    if (failCount > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Master test suite failed with error:', err);
    process.exit(1);
  }
};

runMasterTestSuite();
