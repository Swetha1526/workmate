import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createApp } from '../src/app.js';
import { seedDefaultAdmin } from '../src/controllers/authController.js';
import { seedDemoWorkersIfEmpty } from '../src/utils/seedData.js';

dotenv.config();

const runWorkerTests = async () => {
  console.log('🧪 Starting Phase 2 & 3 Worker Profile & Discovery Tests...');

  await mongoose.connect(process.env.MONGODB_URI);
  await seedDefaultAdmin();
  await seedDemoWorkersIfEmpty();

  const app = createApp();
  const server = app.listen(5098);
  const baseUrl = 'http://localhost:5098/api';

  try {
    // 1. Test Discovery: Get all workers
    const allWorkersRes = await fetch(`${baseUrl}/workers`);
    const allWorkersData = await allWorkersRes.json();
    console.assert(allWorkersRes.status === 200, 'Workers endpoint should return 200');
    console.assert(allWorkersData.workers.length >= 10, 'Should return at least 10 workers');
    console.log(`✅ Test 1 Passed: Found ${allWorkersData.workers.length} workers in database`);

    // 2. Test Discovery: Category filter (plumbers)
    const plumberRes = await fetch(`${baseUrl}/workers?category=plumbers`);
    const plumberData = await plumberRes.json();
    console.assert(plumberData.workers.every((w) => w.category === 'plumbers'), 'All returned workers must be plumbers');
    console.log(`✅ Test 2 Passed: Filtered ${plumberData.workers.length} plumber(s)`);

    // 3. Test Discovery: Locality search (Velachery)
    const localityRes = await fetch(`${baseUrl}/workers?locality=Velachery`);
    const localityData = await localityRes.json();
    console.assert(localityData.workers.length > 0, 'Should find worker in Velachery');
    console.assert(localityData.workers[0].locality.includes('Velachery'), 'Locality should match Velachery');
    console.log('✅ Test 3 Passed: Locality filtering verified');

    // 4. Test Single Worker Profile Detail
    const sampleWorkerId = allWorkersData.workers[0]._id;
    const detailRes = await fetch(`${baseUrl}/workers/${sampleWorkerId}`);
    const detailData = await detailRes.json();
    console.assert(detailRes.status === 200, 'Detail status should be 200');
    console.assert(detailData.profile.userId.name, 'Profile must populate User name');
    console.log(`✅ Test 4 Passed: Fetched profile detail for ${detailData.profile.userId.name}`);

    // 5. Test Admin Verification Endpoint
    // First, login as admin
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

    const verifyRes = await fetch(`${baseUrl}/workers/${sampleWorkerId}/verify`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        isVerified: true,
        verificationNotes: 'Verified Trade License #TN-2026-PLUMB',
      }),
    });
    const verifyData = await verifyRes.json();
    console.assert(verifyRes.status === 200, 'Admin verification should return 200');
    console.assert(verifyData.profile.isVerified === true, 'Profile must be verified');
    console.log('✅ Test 5 Passed: Admin verification status successfully updated');

    console.log('\n🎉 ALL 5 PHASE 2 & 3 WORKER BACKEND TESTS PASSED!\n');
  } finally {
    server.close();
    await mongoose.disconnect();
  }
};

runWorkerTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
