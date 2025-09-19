const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Guide = require('../models/Guide');
const User = require('../models/User');
const Review = require('../models/Review');
const { protect, authorize, checkOwnership } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all guides
// @route   GET /api/guides
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('sort').optional().isIn(['rating', 'price', 'experience', 'name']).withMessage('Invalid sort field')
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

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = { isActive: true, 'verification.status': 'verified' };

    // Country filter
    if (req.query.country) {
      query.country = req.query.country;
    }

    // Filters
    if (req.query.specializations) {
      const specs = req.query.specializations.split(',');
      query.specializations = { $in: specs };
    }

    if (req.query.languages) {
      const langs = req.query.languages.split(',');
      query['languages.language'] = { $in: langs };
    }

    if (req.query.regions) {
      const regions = req.query.regions.split(',');
      query['operatingAreas.region'] = { $in: regions };
    }

    if (req.query.minRating) {
      query['rating.average'] = { $gte: parseFloat(req.query.minRating) };
    }

    if (req.query.maxPrice) {
      query['pricing.dailyRate'] = { $lte: parseFloat(req.query.maxPrice) };
    }

    if (req.query.minExperience) {
      query['experience.years'] = { $gte: parseInt(req.query.minExperience) };
    }

    // Search
    if (req.query.search) {
      query.$or = [
        { 'user.fullName': { $regex: req.query.search, $options: 'i' } },
        { 'experience.description': { $regex: req.query.search, $options: 'i' } },
        { specializations: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }

    // Sort
    let sortBy = {};
    switch (req.query.sort) {
      case 'rating':
        sortBy = { 'rating.average': -1 };
        break;
      case 'price':
        sortBy = { 'pricing.dailyRate': 1 };
        break;
      case 'experience':
        sortBy = { 'experience.years': -1 };
        break;
      case 'name':
        sortBy = { 'user.fullName': 1 };
        break;
      default:
        sortBy = { isFeatured: -1, 'rating.average': -1 };
    }

    // Execute query
    const guides = await Guide.find(query)
      .populate('user', 'fullName profileImage')
      .sort(sortBy)
      .skip(startIndex)
      .limit(limit);

    // Get total count for pagination
    const total = await Guide.countDocuments(query);

    // Pagination result
    const pagination = {};
    if (startIndex > 0) {
      pagination.prev = { page: page - 1, limit };
    }
    if (startIndex + limit < total) {
      pagination.next = { page: page + 1, limit };
    }

    res.status(200).json({
      success: true,
      count: guides.length,
      total,
      pagination,
      data: guides
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single guide
// @route   GET /api/guides/:id
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const guide = await Guide.findById(req.params.id)
      .populate('user', 'fullName profileImage email phone')
      .populate({
        path: 'reviews',
        populate: {
          path: 'reviewer',
          select: 'fullName profileImage'
        },
        options: { sort: { createdAt: -1 }, limit: 10 }
      });

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide not found'
      });
    }

    res.status(200).json({
      success: true,
      data: guide
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create guide profile
// @route   POST /api/guides
// @access  Private (Guide only)
router.post('/', protect, authorize('guide'), [
  body('licenseNumber').notEmpty().withMessage('License number is required'),
  body('specializations').isArray({ min: 1 }).withMessage('At least one specialization is required'),
  body('experience.years').isInt({ min: 0 }).withMessage('Experience years must be a positive number'),
  body('pricing.dailyRate').isFloat({ min: 0 }).withMessage('Daily rate must be a positive number')
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

    // Check if guide profile already exists
    const existingGuide = await Guide.findOne({ user: req.user.id });
    if (existingGuide) {
      return res.status(400).json({
        success: false,
        message: 'Guide profile already exists'
      });
    }

    // Create guide profile
    const guide = await Guide.create({
      user: req.user.id,
      ...req.body
    });

    await guide.populate('user', 'fullName email phone');

    res.status(201).json({
      success: true,
      data: guide
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update guide profile
// @route   PUT /api/guides/:id
// @access  Private (Guide owner or admin)
router.put('/:id', protect, checkOwnership('Guide'), async (req, res, next) => {
  try {
    const guide = await Guide.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('user', 'fullName email phone');

    res.status(200).json({
      success: true,
      data: guide
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete guide profile
// @route   DELETE /api/guides/:id
// @access  Private (Guide owner or admin)
router.delete('/:id', protect, checkOwnership('Guide'), async (req, res, next) => {
  try {
    await Guide.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Guide profile deleted'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update guide availability
// @route   PUT /api/guides/:id/availability
// @access  Private (Guide owner)
router.put('/:id/availability', protect, checkOwnership('Guide'), async (req, res, next) => {
  try {
    const { calendar } = req.body;

    const guide = await Guide.findByIdAndUpdate(
      req.params.id,
      { 'availability.calendar': calendar },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: guide
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get guide reviews
// @route   GET /api/guides/:id/reviews
// @access  Public
router.get('/:id/reviews', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const reviews = await Review.find({ guide: req.params.id, status: 'approved' })
      .populate('reviewer', 'fullName profileImage')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const total = await Review.countDocuments({ guide: req.params.id, status: 'approved' });

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

// @desc    Add guide review
// @route   POST /api/guides/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, [
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

    // Check if guide exists
    const guide = await Guide.findById(req.params.id);
    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide not found'
      });
    }

    // Check if user has already reviewed this guide for this booking
    const existingReview = await Review.findOne({
      reviewer: req.user.id,
      guide: req.params.id,
      booking: req.body.booking
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this guide for this booking'
      });
    }

    const review = await Review.create({
      reviewType: 'guide',
      guide: req.params.id,
      reviewer: req.user.id,
      ...req.body
    });

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get featured guides
// @route   GET /api/guides/featured
// @access  Public
router.get('/featured', async (req, res, next) => {
  try {
    const guides = await Guide.find({
      isFeatured: true,
      isActive: true,
      'verification.status': 'verified'
    })
      .populate('user', 'fullName profileImage')
      .sort({ 'rating.average': -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      count: guides.length,
      data: guides
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;