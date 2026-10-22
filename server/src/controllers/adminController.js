import { User } from '../models/User.js';
import { WorkerProfile } from '../models/WorkerProfile.js';
import { Booking } from '../models/Booking.js';
import { Review } from '../models/Review.js';

// aggregate platform metrics for admin dashboard
export const getPlatformMetrics = async (req, res) => {
  try {
    const [
      totalUsers,
      totalCustomers,
      individualCustomers,
      businessCustomers,
      totalWorkers,
      verifiedWorkers,
      unverifiedWorkers,
      totalBookings,
      completedBookings,
      bookingStatusStats,
      revenueStats,
      totalReviews,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'customer', customerType: 'individual' }),
      User.countDocuments({ role: 'customer', customerType: 'business' }),
      WorkerProfile.countDocuments(),
      WorkerProfile.countDocuments({ isVerified: true }),
      WorkerProfile.countDocuments({ isVerified: false }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'completed' }),
      Booking.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Booking.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, totalVolume: { $sum: '$totalEstimatedCost' } } },
      ]),
      Review.countDocuments(),
    ]);

    const statusMap = {
      pending: 0,
      accepted: 0,
      rejected: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
    };
    bookingStatusStats.forEach((stat) => {
      if (statusMap[stat._id] !== undefined) {
        statusMap[stat._id] = stat.count;
      }
    });

    res.json({
      success: true,
      metrics: {
        users: {
          total: totalUsers,
          customers: totalCustomers,
          individual: individualCustomers,
          business: businessCustomers,
        },
        workers: {
          total: totalWorkers,
          verified: verifiedWorkers,
          unverified: unverifiedWorkers,
        },
        bookings: {
          total: totalBookings,
          completed: completedBookings,
          statusBreakdown: statusMap,
          grossPlatformVolume: revenueStats[0]?.totalVolume || 0,
        },
        reviews: {
          total: totalReviews,
        },
      },
    });
  } catch (error) {
    console.error('Error calculating admin metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve administrative metrics.',
      error: error.message,
    });
  }
};

// list users with role and search filters
export const getAdminUsers = async (req, res) => {
  try {
    const { role, isActive, search, page = 1, limit = 15 } = req.query;

    const query = {};
    if (role && role !== 'all') query.role = role;
    if (isActive !== undefined && isActive !== '') query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users.',
      error: error.message,
    });
  }
};

// toggle active/suspended state for user account
export const toggleUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Administrators cannot suspend their own account.',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.isActive = Boolean(isActive);
    await user.save();

    res.json({
      success: true,
      message: `User ${user.name} has been ${user.isActive ? 'activated' : 'suspended'}.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user status.',
      error: error.message,
    });
  }
};

// list worker profiles for verification review
export const getAdminWorkers = async (req, res) => {
  try {
    const { isVerified, category } = req.query;
    const query = {};
    if (isVerified !== undefined && isVerified !== '') query.isVerified = isVerified === 'true';
    if (category && category !== 'all') query.category = category;

    const profiles = await WorkerProfile.find(query)
      .populate('userId', 'name email phone avatar isActive')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: profiles.length,
      workers: profiles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve worker profiles.',
      error: error.message,
    });
  }
};
