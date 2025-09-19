const express = require('express');
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    let query = { status: 'approved' };

    // Filter by type
    if (req.query.type) {
      query.reviewType = req.query.type;
    }

    // Filter by rating
    if (req.query.minRating) {
      query.rating = { $gte: parseInt(req.query.minRating) };
    }

    const reviews = await Review.find(query)
      .populate('reviewer', 'fullName profileImage')
      .populate('guide', 'user')
      .populate('porter', 'user')
      .populate('adventure', 'title type')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const total = await Review.countDocuments(query);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('reviewer', 'fullName profileImage')
      .populate('guide', 'user')
      .populate('porter', 'user')
      .populate('adventure', 'title type');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
router.post('/', protect, [
  body('reviewType').isIn(['guide', 'porter', 'adventure', 'gear_provider']).withMessage('Invalid review type'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').notEmpty().withMessage('Review title is required'),
  body('review').notEmpty().withMessage('Review text is required'),
  body('booking').isMongoId().withMessage('Valid booking ID is required')
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

    const { reviewType, booking: bookingId, guide, porter, adventure, gearProvider } = req.body;

    // Verify booking exists and belongs to user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this booking'
      });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed bookings'
      });
    }

    // Check for existing review
    let existingQuery = {
      reviewer: req.user.id,
      booking: bookingId,
      reviewType
    };

    if (reviewType === 'guide' && guide) {
      existingQuery.guide = guide;
    } else if (reviewType === 'porter' && porter) {
      existingQuery.porter = porter;
    } else if (reviewType === 'adventure' && adventure) {
      existingQuery.adventure = adventure;
    }

    const existingReview = await Review.findOne(existingQuery);
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this item for this booking'
      });
    }

    // Create review
    const reviewData = {
      ...req.body,
      reviewer: req.user.id
    };

    const review = await Review.create(reviewData);

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
router.put('/:id', protect, async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership
    if (review.reviewer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership
    if (review.reviewer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Review deleted'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Mark review as helpful
// @route   PUT /api/reviews/:id/helpful
// @access  Private
router.put('/:id/helpful', protect, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const isHelpful = req.body.helpful === true;

    if (isHelpful) {
      review.helpfulness.helpful += 1;
    } else {
      review.helpfulness.notHelpful += 1;
    }

    review.helpfulness.totalVotes += 1;
    await review.save();

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;