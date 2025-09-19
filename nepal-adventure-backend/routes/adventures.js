const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Adventure = require('../models/Adventure');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all adventures
// @route   GET /api/adventures
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
    const limit = parseInt(req.query.limit, 10) || 12;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = { status: 'active' };

    // Country filter
    if (req.query.country) {
      query.country = req.query.country;
    }

    // Filters
    if (req.query.type) {
      const types = req.query.type.split(',');
      query.type = { $in: types };
    }

    if (req.query.region) {
      const regions = req.query.region.split(',');
      query['location.region'] = { $in: regions };
    }

    if (req.query.difficulty) {
      const difficulties = req.query.difficulty.split(',');
      query['difficulty.level'] = { $in: difficulties };
    }

    if (req.query.duration) {
      const [min, max] = req.query.duration.split('-').map(Number);
      if (max) {
        query['duration.days'] = { $gte: min, $lte: max };
      } else {
        query['duration.days'] = { $gte: min };
      }
    }

    if (req.query.maxPrice) {
      query['pricing.basePrice'] = { $lte: parseFloat(req.query.maxPrice) };
    }

    if (req.query.minRating) {
      query['rating.average'] = { $gte: parseFloat(req.query.minRating) };
    }

    // Season filter
    if (req.query.season) {
      query['bestSeasons.season'] = req.query.season;
    }

    // Search
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Sort
    let sortBy = {};
    switch (req.query.sort) {
      case 'price-low':
        sortBy = { 'pricing.basePrice': 1 };
        break;
      case 'price-high':
        sortBy = { 'pricing.basePrice': -1 };
        break;
      case 'rating':
        sortBy = { 'rating.average': -1 };
        break;
      case 'duration':
        sortBy = { 'duration.days': 1 };
        break;
      case 'popular':
        sortBy = { 'stats.totalBookings': -1 };
        break;
      default:
        sortBy = { isFeatured: -1, createdAt: -1 };
    }

    // Execute query
    const adventures = await Adventure.find(query)
      .populate('provider', 'fullName')
      .select('-itinerary -faq') // Exclude large fields for list view
      .sort(sortBy)
      .skip(startIndex)
      .limit(limit);

    // Get total count for pagination
    const total = await Adventure.countDocuments(query);

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
      count: adventures.length,
      total,
      pagination,
      data: adventures
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single adventure
// @route   GET /api/adventures/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const adventure = await Adventure.findById(req.params.id)
      .populate('provider', 'fullName email phone')
      .populate({
        path: 'reviews',
        populate: {
          path: 'reviewer',
          select: 'fullName profileImage'
        },
        options: { sort: { createdAt: -1 }, limit: 5 }
      });

    if (!adventure) {
      return res.status(404).json({
        success: false,
        message: 'Adventure not found'
      });
    }

    // Increment view count (you might want to track this)
    // await Adventure.findByIdAndUpdate(req.params.id, { $inc: { 'stats.views': 1 } });

    res.status(200).json({
      success: true,
      data: adventure
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create adventure
// @route   POST /api/adventures
// @access  Private (Adventure provider)
router.post('/', protect, authorize('gear_provider', 'admin'), [
  body('title').notEmpty().withMessage('Adventure title is required'),
  body('description').notEmpty().withMessage('Adventure description is required'),
  body('type').isIn(['trekking', 'climbing', 'motorbiking', 'cycling', 'rafting', 'paragliding', 'wildlife', 'cultural', 'bungee', 'combo']).withMessage('Invalid adventure type'),
  body('location.region').notEmpty().withMessage('Adventure region is required'),
  body('duration.days').isInt({ min: 1 }).withMessage('Duration must be at least 1 day'),
  body('difficulty.level').isIn(['easy', 'moderate', 'challenging', 'extreme']).withMessage('Invalid difficulty level'),
  body('group.maxSize').isInt({ min: 1 }).withMessage('Max group size must be at least 1'),
  body('pricing.basePrice').isFloat({ min: 0 }).withMessage('Base price must be a positive number')
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

    const adventure = await Adventure.create({
      ...req.body,
      provider: req.user.id
    });

    res.status(201).json({
      success: true,
      data: adventure
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update adventure
// @route   PUT /api/adventures/:id
// @access  Private (Adventure owner or admin)
router.put('/:id', protect, async (req, res, next) => {
  try {
    let adventure = await Adventure.findById(req.params.id);

    if (!adventure) {
      return res.status(404).json({
        success: false,
        message: 'Adventure not found'
      });
    }

    // Check ownership or admin role
    if (adventure.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this adventure'
      });
    }

    adventure = await Adventure.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: adventure
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete adventure
// @route   DELETE /api/adventures/:id
// @access  Private (Adventure owner or admin)
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const adventure = await Adventure.findById(req.params.id);

    if (!adventure) {
      return res.status(404).json({
        success: false,
        message: 'Adventure not found'
      });
    }

    // Check ownership or admin role
    if (adventure.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this adventure'
      });
    }

    await Adventure.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Adventure deleted'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get adventures by type
// @route   GET /api/adventures/type/:type
// @access  Public
router.get('/type/:type', async (req, res, next) => {
  try {
    const adventures = await Adventure.find({
      type: req.params.type,
      status: 'active'
    })
      .populate('provider', 'fullName')
      .select('-itinerary -faq')
      .sort({ isFeatured: -1, 'rating.average': -1 })
      .limit(parseInt(req.query.limit) || 12);

    res.status(200).json({
      success: true,
      count: adventures.length,
      data: adventures
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get featured adventures
// @route   GET /api/adventures/featured
// @access  Public
router.get('/featured', async (req, res, next) => {
  try {
    const adventures = await Adventure.find({
      isFeatured: true,
      status: 'active'
    })
      .populate('provider', 'fullName')
      .select('-itinerary -faq')
      .sort({ 'rating.average': -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      count: adventures.length,
      data: adventures
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get adventure reviews
// @route   GET /api/adventures/:id/reviews
// @access  Public
router.get('/:id/reviews', async (req, res, next) => {
  try {
    const Review = require('../models/Review');
    
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const reviews = await Review.find({
      adventure: req.params.id,
      status: 'approved'
    })
      .populate('reviewer', 'fullName profileImage')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const total = await Review.countDocuments({
      adventure: req.params.id,
      status: 'approved'
    });

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

// @desc    Check adventure availability
// @route   GET /api/adventures/:id/availability
// @access  Public
router.get('/:id/availability', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const adventure = await Adventure.findById(req.params.id);

    if (!adventure) {
      return res.status(404).json({
        success: false,
        message: 'Adventure not found'
      });
    }

    // Check if dates are in blackout periods
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const isBlackedOut = adventure.availability.blackoutDates.some(blackoutDate => {
      const blackout = new Date(blackoutDate);
      return blackout >= start && blackout <= end;
    });

    // Check available dates
    const availabilityInfo = adventure.availability.availableDates.find(period => {
      return start >= period.startDate && end <= period.endDate;
    });

    const isAvailable = !isBlackedOut && (!availabilityInfo || availabilityInfo.available);

    res.status(200).json({
      success: true,
      available: isAvailable,
      reason: !isAvailable ? (isBlackedOut ? 'Blackout period' : 'Not available') : null
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;