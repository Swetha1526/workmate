import { Booking, BOOKING_STATUSES } from '../models/Booking.js';
import { WorkerProfile } from '../models/WorkerProfile.js';
import { Conversation } from '../models/Conversation.js';

// create a new booking request
export const createBooking = async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Only customers can request a booking.',
      });
    }

    const {
      workerId,
      jobDescription,
      locality,
      scheduledDate,
      scheduledTime,
      estimatedHours,
    } = req.body;

    if (!workerId) {
      return res.status(400).json({ success: false, message: 'Worker profile ID is required.' });
    }

    const worker = await WorkerProfile.findById(workerId).populate('userId', 'name email phone');
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker profile not found.' });
    }

    if (!worker.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'This worker is currently marked as unavailable for new bookings.',
      });
    }

    // Prevent booking oneself
    if (worker.userId._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot book your own worker profile.',
      });
    }

    const parsedHours = Number(estimatedHours) || 1;
    if (parsedHours < 1 || parsedHours > 24) {
      return res.status(400).json({
        success: false,
        message: 'Estimated hours must be between 1 and 24 hours.',
      });
    }

    // Server-side calculated cost
    const totalCost = worker.hourlyRate * parsedHours;

    const booking = await Booking.create({
      customerId: req.user._id,
      workerId: worker._id,
      workerUserId: worker.userId._id,
      category: worker.category,
      jobDescription: jobDescription.trim(),
      locality: locality.trim(),
      scheduledDate: new Date(scheduledDate),
      scheduledTime: scheduledTime.trim(),
      estimatedHours: parsedHours,
      hourlyRate: worker.hourlyRate,
      totalEstimatedCost: totalCost,
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          timestamp: new Date(),
          changedBy: req.user._id,
          note: 'Booking request placed by customer.',
        },
      ],
    });

    // Automatically provision conversation room for real-time chat
    let conversation = await Conversation.findOne({ bookingId: booking._id });
    if (!conversation) {
      conversation = await Conversation.create({
        bookingId: booking._id,
        participants: [req.user._id, worker.userId._id],
      });
    }

    res.status(201).json({
      success: true,
      message: 'Booking request created successfully.',
      booking,
      conversationId: conversation._id,
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating booking.',
      error: error.message,
    });
  }
};

// get all bookings for logged-in customer
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.user._id })
      .populate('workerId')
      .populate('workerUserId', 'name phone email avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your bookings.',
      error: error.message,
    });
  }
};

// get bookings assigned to logged-in worker
export const getWorkerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ workerUserId: req.user._id })
      .populate('customerId', 'name phone email customerType avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve assigned bookings.',
      error: error.message,
    });
  }
};

// get single booking by id
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customerId', 'name phone email customerType')
      .populate('workerId')
      .populate('workerUserId', 'name phone email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const isCustomer = booking.customerId._id.toString() === req.user._id.toString();
    const isWorker = booking.workerUserId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isWorker && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this booking.',
      });
    }

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve booking.',
      error: error.message,
    });
  }
};

// update booking status (accepted, in_progress, completed, cancelled)
export const updateBookingStatus = async (req, res) => {
  try {
    const { status, note = '', cancellationReason = '' } = req.body;

    if (!BOOKING_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${BOOKING_STATUSES.join(', ')}`,
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const isCustomer = booking.customerId.toString() === req.user._id.toString();
    const isWorker = booking.workerUserId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isWorker && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this booking.',
      });
    }

    const currentStatus = booking.status;

    // Reject transitions on terminal states
    if (['rejected', 'completed', 'cancelled'].includes(currentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from terminal state '${currentStatus}'.`,
      });
    }

    // State machine validation
    if (currentStatus === 'pending') {
      if (['accepted', 'rejected'].includes(status)) {
        if (!isWorker && !isAdmin) {
          return res.status(403).json({
            success: false,
            message: 'Only the assigned worker can accept or reject this booking request.',
          });
        }
      } else if (status === 'cancelled') {
        if (!isCustomer && !isAdmin) {
          return res.status(403).json({
            success: false,
            message: 'Only the customer can cancel a pending booking request.',
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: `Cannot move directly from 'pending' to '${status}'.`,
        });
      }
    } else if (currentStatus === 'accepted') {
      if (status === 'in_progress') {
        // Can be started by worker or customer
      } else if (status === 'cancelled') {
        if (!cancellationReason.trim()) {
          return res.status(400).json({
            success: false,
            message: 'Cancellation reason is required when cancelling an accepted booking.',
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: `Cannot move directly from 'accepted' to '${status}'.`,
        });
      }
    } else if (currentStatus === 'in_progress') {
      if (status !== 'completed' && status !== 'cancelled') {
        return res.status(400).json({
          success: false,
          message: `An in-progress booking can only be 'completed' or 'cancelled'.`,
        });
      }
    }

    // Apply update
    booking.status = status;
    if (status === 'cancelled') {
      booking.cancellationReason = cancellationReason || note;
      booking.cancelledBy = req.user._id;
    }

    if (status === 'completed') {
      // Increment completed jobs on worker profile
      await WorkerProfile.findByIdAndUpdate(booking.workerId, {
        $inc: { completedJobs: 1 },
      });
    }

    booking.statusHistory.push({
      status,
      timestamp: new Date(),
      changedBy: req.user._id,
      note: note || `Status changed to ${status} by ${req.user.name}`,
    });

    await booking.save();

    res.json({
      success: true,
      message: `Booking status updated to ${status}.`,
      booking,
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating booking status.',
      error: error.message,
    });
  }
};

// mark direct cash / upi payment as settled
export const recordDirectPayment = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const isCustomer = booking.customerId.toString() === req.user._id.toString();
    const isWorker = booking.workerUserId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isWorker && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    booking.paymentStatus = 'paid_direct';
    booking.paidAt = new Date();
    await booking.save();

    res.json({
      success: true,
      message: 'Direct payment recorded successfully.',
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to record direct payment.',
      error: error.message,
    });
  }
};
