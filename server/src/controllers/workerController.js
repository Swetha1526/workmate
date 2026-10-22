import { WorkerProfile, WORKER_CATEGORIES } from '../models/WorkerProfile.js';
import { User } from '../models/User.js';

// create or update profile for logged in worker
export const createOrUpdateProfile = async (req, res) => {
  try {
    if (req.user.role !== 'worker') {
      return res.status(403).json({
        success: false,
        message: 'Only registered workers can create or edit a worker profile.',
      });
    }

    const {
      category,
      skills,
      experienceYears,
      bio,
      locality,
      hourlyRate,
      isAvailable,
      profileImage,
    } = req.body;

    if (!category || !WORKER_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Valid category is required. Supported: ${WORKER_CATEGORIES.join(', ')}`,
      });
    }

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one skill must be provided as an array.',
      });
    }

    if (experienceYears === undefined || experienceYears < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid years of experience is required.',
      });
    }

    if (!locality || !locality.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Operating locality is required.',
      });
    }

    if (!hourlyRate || hourlyRate < 50) {
      return res.status(400).json({
        success: false,
        message: 'Hourly rate must be at least ₹50.',
      });
    }

    let profile = await WorkerProfile.findOne({ userId: req.user._id });

    if (profile) {
      // Update existing profile
      profile.category = category;
      profile.skills = skills;
      profile.experienceYears = Number(experienceYears);
      profile.bio = bio || '';
      profile.locality = locality.trim();
      profile.hourlyRate = Number(hourlyRate);
      if (typeof isAvailable === 'boolean') {
        profile.isAvailable = isAvailable;
      }
      if (profileImage) {
        profile.profileImage = profileImage;
      }
      await profile.save();
    } else {
      // Create new profile (isVerified stays false until Admin verification)
      profile = await WorkerProfile.create({
        userId: req.user._id,
        category,
        skills,
        experienceYears: Number(experienceYears),
        bio: bio || '',
        locality: locality.trim(),
        hourlyRate: Number(hourlyRate),
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        profileImage: profileImage || '',
        isVerified: false,
      });
    }

    const populatedProfile = await WorkerProfile.findById(profile._id).populate(
      'userId',
      'name email phone avatar'
    );

    res.status(200).json({
      success: true,
      message: 'Worker profile updated successfully.',
      profile: populatedProfile,
    });
  } catch (error) {
    console.error('Error saving worker profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while saving worker profile.',
      error: error.message,
    });
  }
};

// get current worker profile
export const getMyWorkerProfile = async (req, res) => {
  try {
    const profile = await WorkerProfile.findOne({ userId: req.user._id }).populate(
      'userId',
      'name email phone avatar'
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'No worker profile found. Please complete your profile.',
      });
    }

    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve worker profile.',
      error: error.message,
    });
  }
};

// fetch worker profile by id
export const getWorkerById = async (req, res) => {
  try {
    const profile = await WorkerProfile.findById(req.params.id).populate(
      'userId',
      'name email phone avatar'
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Worker profile not found.',
      });
    }

    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve worker details.',
      error: error.message,
    });
  }
};

// search and filter workers
export const getWorkers = async (req, res) => {
  try {
    const {
      category,
      locality,
      minRate,
      maxRate,
      isAvailable,
      isVerified,
      search,
      sortBy = 'rating', // 'rating' | 'rate_low' | 'rate_high' | 'experience'
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (locality) {
      query.locality = { $regex: locality, $options: 'i' };
    }

    if (minRate || maxRate) {
      query.hourlyRate = {};
      if (minRate) query.hourlyRate.$gte = Number(minRate);
      if (maxRate) query.hourlyRate.$lte = Number(maxRate);
    }

    if (isAvailable !== undefined && isAvailable !== '') {
      query.isAvailable = isAvailable === 'true';
    }

    if (isVerified !== undefined && isVerified !== '') {
      query.isVerified = isVerified === 'true';
    }

    if (search) {
      query.$or = [
        { skills: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { locality: { $regex: search, $options: 'i' } },
      ];
    }

    // Sort order
    let sort = {};
    if (sortBy === 'rate_low') {
      sort = { hourlyRate: 1 };
    } else if (sortBy === 'rate_high') {
      sort = { hourlyRate: -1 };
    } else if (sortBy === 'experience') {
      sort = { experienceYears: -1 };
    } else {
      // Default: highest rating first, then verified
      sort = { isVerified: -1, averageRating: -1, completedJobs: -1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const total = await WorkerProfile.countDocuments(query);
    const workers = await WorkerProfile.find(query)
      .populate('userId', 'name phone avatar')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      workers,
    });
  } catch (error) {
    console.error('Error fetching workers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search workers.',
      error: error.message,
    });
  }
};

// admin toggle verification status
export const verifyWorker = async (req, res) => {
  try {
    const { isVerified, verificationNotes } = req.body;

    const profile = await WorkerProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Worker profile not found.',
      });
    }

    profile.isVerified = Boolean(isVerified);
    profile.verifiedAt = isVerified ? new Date() : null;
    if (verificationNotes !== undefined) {
      profile.verificationNotes = verificationNotes;
    }

    await profile.save();

    res.json({
      success: true,
      message: `Worker profile has been ${isVerified ? 'verified' : 'unverified'}.`,
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update verification status.',
      error: error.message,
    });
  }
};
