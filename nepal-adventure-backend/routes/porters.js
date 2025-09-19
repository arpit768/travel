const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Porter = require('../models/Porter');
const User = require('../models/User');
const Review = require('../models/Review');
const { protect, authorize, checkOwnership } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all porters
// @route   GET /api/porters
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
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
    if (req.query.regions) {
      const regions = req.query.regions.split(',');
      query['familiarRoutes.region'] = { $in: regions };
    }

    if (req.query.languages) {
      const langs = req.query.languages.split(',');
      query['languages.language'] = { $in: langs };
    }

    if (req.query.minCapacity) {
      query.carryingCapacity = { $gte: parseInt(req.query.minCapacity) };
    }

    if (req.query.maxPrice) {
      query['pricing.dailyRate'] = { $lte: parseFloat(req.query.maxPrice) };
    }

    if (req.query.minExperience) {
      query['experience.years'] = { $gte: parseInt(req.query.minExperience) };
    }

    if (req.query.minAltitude) {
      query.maxAltitude = { $gte: parseInt(req.query.minAltitude) };
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
      case 'capacity':
        sortBy = { carryingCapacity: -1 };
        break;
      default:
        sortBy = { isFeatured: -1, 'rating.average': -1 };
    }

    // Execute query
    const porters = await Porter.find(query)
      .populate('user', 'fullName profileImage')
      .sort(sortBy)
      .skip(startIndex)
      .limit(limit);

    // Get total count for pagination
    const total = await Porter.countDocuments(query);

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
      count: porters.length,
      total,
      pagination,
      data: porters
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single porter
// @route   GET /api/porters/:id
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const porter = await Porter.findById(req.params.id)
      .populate('user', 'fullName profileImage email phone')
      .populate({
        path: 'reviews',
        populate: {
          path: 'reviewer',
          select: 'fullName profileImage'
        },
        options: { sort: { createdAt: -1 }, limit: 10 }
      });

    if (!porter) {
      return res.status(404).json({
        success: false,
        message: 'Porter not found'
      });
    }

    res.status(200).json({
      success: true,
      data: porter
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create porter profile
// @route   POST /api/porters
// @access  Private (Porter only)
router.post('/', protect, authorize('porter'), [
  body('carryingCapacity').isInt({ min: 10, max: 50 }).withMessage('Carrying capacity must be between 10-50 kg'),
  body('maxAltitude').isInt({ min: 0 }).withMessage('Max altitude must be a positive number'),
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

    // Check if porter profile already exists
    const existingPorter = await Porter.findOne({ user: req.user.id });
    if (existingPorter) {
      return res.status(400).json({
        success: false,
        message: 'Porter profile already exists'
      });
    }

    // Create porter profile
    const porter = await Porter.create({
      user: req.user.id,
      ...req.body
    });

    await porter.populate('user', 'fullName email phone');

    res.status(201).json({
      success: true,
      data: porter
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update porter profile
// @route   PUT /api/porters/:id
// @access  Private (Porter owner or admin)
router.put('/:id', protect, checkOwnership('Porter'), async (req, res, next) => {
  try {
    const porter = await Porter.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('user', 'fullName email phone');

    res.status(200).json({
      success: true,
      data: porter
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete porter profile
// @route   DELETE /api/porters/:id
// @access  Private (Porter owner or admin)
router.delete('/:id', protect, checkOwnership('Porter'), async (req, res, next) => {
  try {
    await Porter.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Porter profile deleted'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get porter reviews
// @route   GET /api/porters/:id/reviews
// @access  Public
router.get('/:id/reviews', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const reviews = await Review.find({ porter: req.params.id, status: 'approved' })
      .populate('reviewer', 'fullName profileImage')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const total = await Review.countDocuments({ porter: req.params.id, status: 'approved' });

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

module.exports = router;