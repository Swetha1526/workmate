import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { WorkerProfile } from '../models/WorkerProfile.js';
import { Booking } from '../models/Booking.js';
import { Review } from '../models/Review.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';

dotenv.config();

export const resetPlatformData = async () => {
  await connectDB();
  console.log('🧹 Clearing previous workers and demo data...');

  // 1. Remove all worker profiles, bookings, reviews, messages
  await WorkerProfile.deleteMany({});
  await Booking.deleteMany({});
  await Review.deleteMany({});
  await Conversation.deleteMany({});
  await Message.deleteMany({});

  // 2. Remove all existing worker users and test customer accounts
  await User.deleteMany({ role: 'worker' });
  await User.deleteMany({ email: { $nin: ['admin@workmate.local'] } });

  // 3. Ensure Admin exists
  let admin = await User.findOne({ email: 'admin@workmate.local' });
  if (!admin) {
    admin = await User.create({
      name: 'WorkMate System Admin',
      email: 'admin@workmate.local',
      password: process.env.ADMIN_PASSWORD || 'Admin@WorkMate2026!',
      phone: '+91 98765 43210',
      role: 'admin',
      isActive: true,
    });
    console.log('✅ Admin provisioned: admin@workmate.local');
  } else {
    console.log('🛡️ Admin already exists: admin@workmate.local');
  }

  // 4. Ensure Customer Raju exists
  const raju = await User.create({
    name: 'Raju',
    email: 'raju@workmate.local',
    password: 'Password123!',
    phone: '+91 98401 11223',
    role: 'customer',
    customerType: 'individual',
    locality: 'T. Nagar, Chennai',
    address: '42, South Usman Road, T. Nagar',
    city: 'Chennai',
    pincode: '600017',
    bio: 'Homeowner looking for skilled trade workers for maintenance and emergency repairs.',
    isActive: true,
  });
  console.log('✅ Customer Raju created: raju@workmate.local');

  // 5. Ensure 1 Plumber Worker exists
  const plumberUser = await User.create({
    name: 'Ramesh Plumber',
    email: 'plumber@workmate.local',
    password: 'Password123!',
    phone: '+91 98402 22334',
    role: 'worker',
    locality: 'T. Nagar, Chennai',
    address: '15, Burkit Road, T. Nagar',
    city: 'Chennai',
    pincode: '600017',
    bio: 'Licensed Master Plumber with 8+ years experience in domestic leak detection, piping, and fixtures.',
    isActive: true,
  });

  const plumberProfile = await WorkerProfile.create({
    userId: plumberUser._id,
    category: 'plumbers',
    skills: ['Pipe Fitting', 'Leak Detection', 'Bathroom Sanitary', 'Water Heater Install', 'Drain Cleaning'],
    experienceYears: 8,
    bio: 'Licensed Master Plumber with 8+ years experience specializing in residential and commercial plumbing, emergency pipe leak repairs, overhead tank setups, and bathroom fixtures.',
    locality: 'T. Nagar, Chennai',
    hourlyRate: 350,
    isAvailable: true,
    isVerified: true,
    verifiedAt: new Date(),
    verificationNotes: 'Verified Trade Certification & Background Checked',
    averageRating: 4.9,
    reviewCount: 16,
    completedJobs: 28,
    isDemo: false,
  });

  console.log('✅ Plumber Worker created: plumber@workmate.local with profile ID:', plumberProfile._id);

  console.log('\n🎉 Platform database reset successfully!');
  console.log('----------------------------------------------------');
  console.log('1. Admin: admin@workmate.local / Admin@WorkMate2026!');
  console.log('2. Customer: raju@workmate.local / Password123!');
  console.log('3. Worker (Plumber): plumber@workmate.local / Password123!');
  console.log('----------------------------------------------------');
};

resetPlatformData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Reset failed:', err);
    process.exit(1);
  });
