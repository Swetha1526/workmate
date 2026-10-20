import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { validateRegisterInput, validateLoginInput } from '../validators/authValidator.js';

// Helper to generate signed JWT
const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET || 'workmate_fallback_secret_key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: userId, role }, secret, { expiresIn });
};

/**
 * @desc    Register a new Customer or Worker
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { errors, isValid } = validateRegisterInput(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, errors });
    }

    const { name, email, password, phone, role = 'customer', customerType = 'individual' } = req.body;

    // Check duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Explicitly restrict admin registration from public endpoint
    const safeRole = role === 'worker' ? 'worker' : 'customer';

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone.trim(),
      role: safeRole,
      customerType: safeRole === 'customer' ? customerType : undefined,
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account successfully registered.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        customerType: user.customerType,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration.',
      error: error.message,
    });
  }
};

/**
 * @desc    Login Customer or Worker
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { errors, isValid } = validateLoginInput(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, errors });
    }

    const { email, password } = req.body;

    // Retrieve user including password hash
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        customerType: user.customerType,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login.',
      error: error.message,
    });
  }
};

/**
 * @desc    Dedicated Admin Login endpoint
 * @route   POST /api/auth/admin/login
 * @access  Public (Enforces admin role check)
 */
export const adminLogin = async (req, res) => {
  try {
    const { errors, isValid } = validateLoginInput(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, errors });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Valid administrator credentials required.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Administrator account is deactivated.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrator credentials.',
      });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Admin authentication successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin login.',
      error: error.message,
    });
  }
};

/**
 * @desc    Get currently authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private (Protected by JWT)
 */
export const getMe = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      customerType: req.user.customerType,
      avatar: req.user.avatar,
      createdAt: req.user.createdAt,
    },
  });
};

/**
 * Auto-seed default administrator if none exists in DB
 */
export const seedDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const defaultAdminEmail = process.env.ADMIN_EMAIL || 'admin@workmate.local';
      const defaultAdminPass = process.env.ADMIN_PASSWORD || 'Admin@WorkMate2026!';

      await User.create({
        name: 'WorkMate System Admin',
        email: defaultAdminEmail,
        password: defaultAdminPass,
        phone: '+91 98765 43210',
        role: 'admin',
      });
      console.log(`🛡️ Default Admin account provisioned: ${defaultAdminEmail}`);
    }
  } catch (err) {
    console.error('Error auto-seeding admin:', err.message);
  }
};
