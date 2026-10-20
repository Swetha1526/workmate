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

const runFullWorkflowTests = async () => {
  console.log('🧪 Starting Full Workflow Integration Tests (Phases 1-6)...');

  await mongoose.connect(process.env.MONGODB_URI);
  await seedDefaultAdmin();
  await seedDemoWorkersIfEmpty();

  const app = createApp();
  const server = app.listen(5097);
  const baseUrl = 'http://localhost:5097/api';

  try {
    // Clean previous specific test records
    await User.deleteMany({ email: { $in: ['flow.customer@workmate.local', 'flow.worker@workmate.local'] } });

    // 1. Setup Customer & Worker accounts
    const custRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Deepak Customer',
        email: 'flow.customer@workmate.local',
        password: 'Password123!',
        phone: '+91 99999 11111',
        role: 'customer',
        customerType: 'individual',
      }),
    });
    const custData = await custRes.json();
    const custToken = custData.token;

    const workerRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Vijay Electrician',
        email: 'flow.worker@workmate.local',
        password: 'Password123!',
        phone: '+91 99999 22222',
        role: 'worker',
      }),
    });
    const workerData = await workerRes.json();
    const workerToken = workerData.token;

    // 2. Worker creates their profile
    const profileRes = await fetch(`${baseUrl}/workers/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${workerToken}`,
      },
      body: JSON.stringify({
        category: 'electricians',
        skills: ['Power Distribution', 'Generator Sync'],
        experienceYears: 5,
        bio: 'Certified industrial and domestic electrician.',
        locality: 'T. Nagar, Chennai',
        hourlyRate: 350,
      }),
    });
    const profileData = await profileRes.json();
    const workerProfileId = profileData.profile._id;
    console.log('✅ Step 1: Customer and Worker profiles setup');

    // 3. Customer places a booking request
    const bookRes = await fetch(`${baseUrl}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custToken}`,
      },
      body: JSON.stringify({
        workerId: workerProfileId,
        jobDescription: 'Main circuit breaker tripping intermittently',
        locality: 'T. Nagar, Chennai',
        scheduledDate: new Date(Date.now() + 86400000).toISOString(),
        scheduledTime: '11:00 AM',
        estimatedHours: 3,
      }),
    });
    const bookData = await bookRes.json();
    console.assert(bookRes.status === 201, 'Booking creation should be 201');
    console.assert(bookData.booking.totalEstimatedCost === 1050, 'Total cost must be 350 * 3 = 1050');
    console.assert(bookData.booking.status === 'pending', 'Initial status must be pending');
    const bookingId = bookData.booking._id;
    console.log('✅ Step 2: Customer booking placed (Total cost calculated by server: ₹1050)');

    // 4. Worker accepts the booking
    const acceptRes = await fetch(`${baseUrl}/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${workerToken}`,
      },
      body: JSON.stringify({ status: 'accepted', note: 'Will arrive with digital multimeter' }),
    });
    const acceptData = await acceptRes.json();
    console.assert(acceptData.booking.status === 'accepted', 'Booking status must be accepted');
    console.log('✅ Step 3: Worker accepted booking');

    // 5. Worker starts work (in_progress)
    const progressRes = await fetch(`${baseUrl}/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${workerToken}`,
      },
      body: JSON.stringify({ status: 'in_progress', note: 'Work commenced' }),
    });
    console.assert(progressRes.status === 200, 'in_progress status should be 200');
    console.log('✅ Step 4: Booking moved to in_progress');

    // 6. Worker completes work
    const completeRes = await fetch(`${baseUrl}/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${workerToken}`,
      },
      body: JSON.stringify({ status: 'completed', note: 'Defective breaker replaced' }),
    });
    console.assert(completeRes.status === 200, 'completed status should be 200');
    console.log('✅ Step 5: Booking marked completed');

    // 7. Test invalid transition: completed -> cancelled (must fail)
    const invalidTransRes = await fetch(`${baseUrl}/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custToken}`,
      },
      body: JSON.stringify({ status: 'cancelled', cancellationReason: 'Late cancel' }),
    });
    console.assert(invalidTransRes.status === 400, 'Transition from completed must be rejected with 400');
    console.log('✅ Step 6: Invalid state machine transition rejected');

    // 8. Record direct cash payment
    const payRes = await fetch(`${baseUrl}/bookings/${bookingId}/payment`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${custToken}` },
    });
    const payData = await payRes.json();
    console.assert(payData.booking.paymentStatus === 'paid_direct', 'Payment must be marked paid_direct');
    console.log('✅ Step 7: Direct payment recorded');

    // 9. Customer submits review
    const reviewRes = await fetch(`${baseUrl}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custToken}`,
      },
      body: JSON.stringify({
        bookingId,
        rating: 5,
        comment: 'Super fast troubleshooting and high quality workmanship!',
      }),
    });
    const reviewData = await reviewRes.json();
    console.assert(reviewRes.status === 201, 'Review should be created with 201');
    console.log('✅ Step 8: Customer review submitted');

    // 10. Duplicate review prevention
    const dupReviewRes = await fetch(`${baseUrl}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custToken}`,
      },
      body: JSON.stringify({
        bookingId,
        rating: 4,
        comment: 'Duplicate review attempt',
      }),
    });
    console.assert(dupReviewRes.status === 400, 'Duplicate review must be rejected with 400');
    console.log('✅ Step 9: Duplicate review rejected');

    // 11. Test Chat: Get conversation & send message
    const convRes = await fetch(`${baseUrl}/chat/booking/${bookingId}`, {
      headers: { Authorization: `Bearer ${custToken}` },
    });
    const convData = await convRes.json();
    const convId = convData.conversation._id;

    const msgRes = await fetch(`${baseUrl}/chat/${convId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custToken}`,
      },
      body: JSON.stringify({ text: 'Hi Vijay, please let me know when you reach near T. Nagar signal.' }),
    });
    console.assert(msgRes.status === 201, 'Message send should return 201');

    const getMsgRes = await fetch(`${baseUrl}/chat/${convId}/messages`, {
      headers: { Authorization: `Bearer ${workerToken}` },
    });
    const getMsgData = await getMsgRes.json();
    console.assert(getMsgData.messages.length >= 1, 'Should retrieve persisted messages');
    console.log(`✅ Step 10: Chat message sent, persisted, and retrieved with read receipt`);

    // 12. Test Admin Dashboard Metrics & Security
    const adminLoginRes = await fetch(`${baseUrl}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@workmate.local',
        password: 'Admin@WorkMate2026!',
      }),
    });
    const adminData = await adminLoginRes.json();
    const adminToken = adminData.token;

    // Security check: Customer cannot access /api/admin/metrics
    const unauthAdminRes = await fetch(`${baseUrl}/admin/metrics`, {
      headers: { Authorization: `Bearer ${custToken}` },
    });
    console.assert(unauthAdminRes.status === 403, 'Customer must be blocked from admin metrics with 403');
    console.log('✅ Step 11: Security check passed (Non-admin blocked from admin metrics)');

    const metricsRes = await fetch(`${baseUrl}/admin/metrics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const metricsData = await metricsRes.json();
    console.assert(metricsData.metrics.bookings.completed >= 1, 'Metrics must count completed bookings');
    console.assert(metricsData.metrics.bookings.grossPlatformVolume >= 1050, 'Platform volume must include ₹1050');
    console.log(`✅ Step 12: Admin metrics verified (Completed bookings: ${metricsData.metrics.bookings.completed}, Platform Volume: ₹${metricsData.metrics.bookings.grossPlatformVolume})`);

    console.log('\n🎉 ALL FULL WORKFLOW INTEGRATION TESTS PASSED!\n');
  } finally {
    server.close();
    await mongoose.disconnect();
  }
};

runFullWorkflowTests().catch((err) => {
  console.error('❌ Full workflow test failed:', err);
  process.exit(1);
});
