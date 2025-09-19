const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Adventure = require('../models/Adventure');
const Guide = require('../models/Guide');
const Porter = require('../models/Porter');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    let query = {};

    // Filter by user role
    if (req.user.role === 'tourist') {
      query.customer = req.user.id;
    } else if (req.user.role === 'guide') {
      // Find guide profile
      const guide = await Guide.findOne({ user: req.user.id });
      if (guide) {
        query.guide = guide._id;
      }
    } else if (req.user.role === 'porter') {
      // Find porter profile
      const porter = await Porter.findOne({ user: req.user.id });
      if (porter) {
        query.porter = porter._id;
      }
    }
    // Admins can see all bookings (no filter)

    // Additional filters
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Country filter (filter through adventure's country)
    let bookingQuery = Booking.find(query);
    if (req.query.country) {
      // Use aggregation to filter by adventure's country
      const bookings = await Booking.aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'adventures',
            localField: 'adventure',
            foreignField: '_id',
            as: 'adventure'
          }
        },
        { $unwind: '$adventure' },
        { $match: { 'adventure.country': req.query.country } },
        {
          $lookup: {
            from: 'users',
            localField: 'customer',
            foreignField: '_id',
            as: 'customer'
          }
        },
        { $unwind: '$customer' },
        {
          $lookup: {
            from: 'guides',
            localField: 'guide',
            foreignField: '_id',
            as: 'guide'
          }
        },
        {
          $lookup: {
            from: 'porters',
            localField: 'porter',
            foreignField: '_id',
            as: 'porter'
          }
        },
        { $sort: { createdAt: -1 } }
      ]);

      return res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings
      });
    }

    const bookings = await bookingQuery
      .populate('customer', 'fullName email phone')
      .populate('adventure', 'title type location duration')
      .populate('guide', 'user')
      .populate('porter', 'user')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'fullName email phone')
      .populate('adventure')
      .populate({
        path: 'guide',
        populate: { path: 'user', select: 'fullName email phone' }
      })
      .populate({
        path: 'porter',
        populate: { path: 'user', select: 'fullName email phone' }
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check access permissions
    const hasAccess = 
      booking.customer._id.toString() === req.user.id ||
      (booking.guide && booking.guide.user._id.toString() === req.user.id) ||
      (booking.porter && booking.porter.user._id.toString() === req.user.id) ||
      req.user.role === 'admin';

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private (Tourist)
router.post('/', protect, authorize('tourist'), [
  body('adventure').isMongoId().withMessage('Valid adventure ID is required'),
  body('tripDetails.startDate').isISO8601().withMessage('Valid start date is required'),
  body('tripDetails.endDate').isISO8601().withMessage('Valid end date is required'),
  body('tripDetails.groupSize').isInt({ min: 1 }).withMessage('Group size must be at least 1'),
  body('tripDetails.participants').isArray({ min: 1 }).withMessage('At least one participant is required')
], async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { adventure: adventureId, guide: guideId, porter: porterId, tripDetails, specialRequirements } = req.body;

    // Verify adventure exists
    const adventure = await Adventure.findById(adventureId);
    if (!adventure) {
      return res.status(404).json({
        success: false,
        message: 'Adventure not found'
      });
    }

    // Calculate duration
    const startDate = new Date(tripDetails.startDate);
    const endDate = new Date(tripDetails.endDate);
    const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    // Calculate pricing
    let totalAmount = adventure.pricing.basePrice * tripDetails.groupSize;
    let guidePrice = 0;
    let porterPrice = 0;

    // Add guide cost if selected
    if (guideId) {
      const guide = await Guide.findById(guideId);
      if (guide) {
        guidePrice = guide.pricing.dailyRate * duration;
        totalAmount += guidePrice;
      }
    }

    // Add porter cost if selected
    if (porterId) {
      const porter = await Porter.findById(porterId);
      if (porter) {
        porterPrice = porter.pricing.dailyRate * duration;
        totalAmount += porterPrice;
      }
    }

    // Create booking
    const booking = await Booking.create({
      customer: req.user.id,
      adventure: adventureId,
      guide: guideId,
      porter: porterId,
      tripDetails: {
        ...tripDetails,
        duration
      },
      pricing: {
        basePrice: adventure.pricing.basePrice * tripDetails.groupSize,
        guidePrice,
        porterPrice,
        totalAmount
      },
      specialRequirements,
      createdBy: req.user.id
    });

    // Populate the booking before returning
    await booking.populate([
      { path: 'adventure', select: 'title type location' },
      { path: 'guide', populate: { path: 'user', select: 'fullName' } },
      { path: 'porter', populate: { path: 'user', select: 'fullName' } }
    ]);

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
router.put('/:id', protect, async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check permissions
    const canUpdate = 
      booking.customer.toString() === req.user.id ||
      req.user.role === 'admin';

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    // Only allow certain fields to be updated
    const allowedFields = ['specialRequirements', 'tripDetails.participants'];
    const updateData = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key) || allowedFields.some(field => key.startsWith(field))) {
        updateData[key] = req.body[key];
      }
    });

    booking = await Booking.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check permissions
    const canCancel = 
      booking.customer.toString() === req.user.id ||
      req.user.role === 'admin';

    if (!canCancel) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Check if booking can be cancelled
    if (!booking.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be cancelled at this time'
      });
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.cancellation = {
      cancelled: true,
      cancelledBy: 'customer',
      cancelledAt: new Date(),
      reason: req.body.reason || 'Cancelled by customer'
    };

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Confirm booking (Guide/Porter)
// @route   PUT /api/bookings/:id/confirm
// @access  Private (Guide/Porter)
router.put('/:id/confirm', protect, authorize('guide', 'porter', 'admin'), async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is the assigned guide or porter
    const guide = await Guide.findOne({ user: req.user.id });
    const porter = await Porter.findOne({ user: req.user.id });

    const isAssigned = 
      (guide && booking.guide && booking.guide.toString() === guide._id.toString()) ||
      (porter && booking.porter && booking.porter.toString() === porter._id.toString()) ||
      req.user.role === 'admin';

    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to confirm this booking'
      });
    }

    booking.status = 'confirmed';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking confirmed',
      data: booking
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update booking progress
// @route   PUT /api/bookings/:id/progress
// @access  Private (Guide/Porter)
router.put('/:id/progress', protect, authorize('guide', 'porter', 'admin'), async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization similar to confirm
    const guide = await Guide.findOne({ user: req.user.id });
    const porter = await Porter.findOne({ user: req.user.id });

    const isAuthorized = 
      (guide && booking.guide && booking.guide.toString() === guide._id.toString()) ||
      (porter && booking.porter && booking.porter.toString() === porter._id.toString()) ||
      req.user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    // Update progress
    const progressUpdate = {
      currentStatus: req.body.currentStatus,
      currentLocation: req.body.currentLocation,
      lastUpdate: new Date()
    };

    if (req.body.milestone) {
      booking.progress.milestones.push({
        ...req.body.milestone,
        timestamp: new Date()
      });
    }

    if (req.body.dailyReport) {
      booking.progress.dailyReports.push({
        ...req.body.dailyReport,
        date: new Date()
      });
    }

    booking.progress = { ...booking.progress, ...progressUpdate };
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;