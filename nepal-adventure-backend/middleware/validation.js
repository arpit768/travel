const { body, param, query, validationResult } = require('express-validator');
const validator = require('validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Common validation rules
const commonValidations = {
  email: body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email address is too long'),

  password: body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),

  fullName: body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Full name can only contain letters, spaces, apostrophes, and hyphens'),

  phone: body('phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),

  role: body('role')
    .isIn(['tourist', 'guide', 'porter', 'gear', 'operator', 'admin'])
    .withMessage('Invalid user role'),

  mongoId: param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),

  positiveNumber: (field) => body(field)
    .isFloat({ min: 0 })
    .withMessage(`${field} must be a positive number`),

  stringLength: (field, min = 1, max = 255) => body(field)
    .trim()
    .isLength({ min, max })
    .withMessage(`${field} must be between ${min} and ${max} characters`)
};

// User registration validation
const validateRegistration = [
  commonValidations.fullName,
  commonValidations.email,
  commonValidations.password,
  commonValidations.phone,
  commonValidations.role,

  // Optional fields validation
  body('guideData.licenseNumber')
    .optional()
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage('License number must be between 5 and 50 characters'),

  body('guideData.specializations')
    .optional()
    .isArray()
    .withMessage('Specializations must be an array'),

  body('guideData.specializations.*')
    .optional()
    .isIn(['trekking', 'mountaineering', 'cultural', 'wildlife', 'adventure'])
    .withMessage('Invalid specialization'),

  body('porterData.carryingCapacity')
    .optional()
    .isInt({ min: 10, max: 100 })
    .withMessage('Carrying capacity must be between 10 and 100 kg'),

  body('porterData.maxAltitude')
    .optional()
    .isInt({ min: 1000, max: 9000 })
    .withMessage('Maximum altitude must be between 1000 and 9000 meters'),

  handleValidationErrors
];

// User login validation
const validateLogin = [
  commonValidations.email,
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Password update validation
const validatePasswordUpdate = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  commonValidations.password,
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  handleValidationErrors
];

// Profile update validation
const validateProfileUpdate = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),

  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),

  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Street address is too long'),

  body('address.city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City name is too long'),

  body('address.country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country name is too long'),

  handleValidationErrors
];

// Adventure creation validation
const validateAdventure = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),

  body('description')
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Description must be between 50 and 2000 characters'),

  body('price')
    .isFloat({ min: 1 })
    .withMessage('Price must be a positive number'),

  body('duration')
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer'),

  body('difficulty')
    .isIn(['easy', 'moderate', 'hard', 'extreme'])
    .withMessage('Invalid difficulty level'),

  body('maxGroupSize')
    .isInt({ min: 1, max: 50 })
    .withMessage('Max group size must be between 1 and 50'),

  body('location.country')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters'),

  body('location.region')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Region must be between 2 and 100 characters'),

  handleValidationErrors
];

// Booking validation
const validateBooking = [
  body('adventure')
    .isMongoId()
    .withMessage('Invalid adventure ID'),

  body('participants')
    .isInt({ min: 1, max: 20 })
    .withMessage('Participants must be between 1 and 20'),

  body('startDate')
    .isISO8601()
    .withMessage('Invalid start date format')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      if (date <= now) {
        throw new Error('Start date must be in the future');
      }
      return true;
    }),

  body('specialRequests')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Special requests cannot exceed 1000 characters'),

  handleValidationErrors
];

// Query parameter validation
const validateQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('sort')
    .optional()
    .matches(/^[a-zA-Z_-]+$/)
    .withMessage('Invalid sort parameter'),

  handleValidationErrors
];

// Custom sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Recursively sanitize all string values in req.body
  const sanitize = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Remove potential malicious scripts and HTML
        obj[key] = validator.escape(obj[key].trim());
        // Remove null bytes and other control characters
        obj[key] = obj[key].replace(/[\x00-\x1F\x7F-\x9F]/g, '');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  if (req.body && typeof req.body === 'object') {
    sanitize(req.body);
  }

  next();
};

// File upload validation
const validateFileUpload = (allowedTypes = [], maxSize = 5 * 1024 * 1024) => {
  return (req, res, next) => {
    if (!req.file) {
      return next();
    }

    const file = req.file;

    // Check file size
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: `File size too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`
      });
    }

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
      });
    }

    // Additional security check for file content
    if (file.mimetype.startsWith('image/')) {
      // Basic image validation
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid image format'
        });
      }
    }

    next();
  };
};

module.exports = {
  validateRegistration,
  validateLogin,
  validatePasswordUpdate,
  validateProfileUpdate,
  validateAdventure,
  validateBooking,
  validateQuery,
  commonValidations,
  handleValidationErrors,
  sanitizeInput,
  validateFileUpload
};