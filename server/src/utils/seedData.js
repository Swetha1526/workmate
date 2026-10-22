import { User } from '../models/User.js';
import { WorkerProfile } from '../models/WorkerProfile.js';

const INITIAL_WORKERS = [
  {
    name: 'Ramesh Plumber',
    email: 'plumber@workmate.local',
    phone: '+91 98402 22334',
    category: 'plumbers',
    skills: ['Pipe Fitting', 'Leak Detection', 'Bathroom Sanitary', 'Water Heater Install', 'Drain Cleaning'],
    experienceYears: 8,
    bio: 'Licensed Master Plumber with 8+ years experience specializing in residential leak repairs, sanitary fixtures, and piping.',
    locality: 'T. Nagar, Chennai',
    hourlyRate: 350,
    isAvailable: true,
    isVerified: true,
    averageRating: 4.9,
    reviewCount: 16,
    completedJobs: 28,
  },
];

export const seedCustomerRaju = async () => {
  try {
    const existing = await User.findOne({ email: 'raju@workmate.local' });
    if (!existing) {
      await User.create({
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
        bio: 'Homeowner seeking skilled trade workers for repairs.',
        isActive: true,
      });
      console.log('Created customer Raju');
    }
  } catch (error) {
    console.error('Error seeding customer Raju:', error.message);
  }
};

export const seedDemoWorkersIfEmpty = async () => {
  try {
    await seedCustomerRaju();

    const existingCount = await WorkerProfile.countDocuments();
    if (existingCount > 0) {
      return;
    }

    for (const workerData of INITIAL_WORKERS) {
      let user = await User.findOne({ email: workerData.email });
      if (!user) {
        user = await User.create({
          name: workerData.name,
          email: workerData.email,
          password: 'Password123!',
          phone: workerData.phone,
          role: 'worker',
          locality: workerData.locality,
          address: '15, Burkit Road, T. Nagar',
          city: 'Chennai',
          pincode: '600017',
          bio: workerData.bio,
          isActive: true,
        });
      }

      await WorkerProfile.create({
        userId: user._id,
        category: workerData.category,
        skills: workerData.skills,
        experienceYears: workerData.experienceYears,
        bio: workerData.bio,
        locality: workerData.locality,
        hourlyRate: workerData.hourlyRate,
        isAvailable: workerData.isAvailable,
        isVerified: workerData.isVerified,
        verifiedAt: new Date(),
        verificationNotes: 'Verified Trade Certification & Background Checked',
        averageRating: workerData.averageRating,
        reviewCount: workerData.reviewCount,
        completedJobs: workerData.completedJobs,
        isDemo: false,
      });
    }

    console.log('Initial worker seeded.');
  } catch (error) {
    console.error('Error seeding initial workers:', error.message);
  }
};
