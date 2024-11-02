const multer = require('multer');
const path = require('path');
const ApiError = require('../utils/apiResponse');
const { UPLOAD } = require('../config/constants');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  if (UPLOAD.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError('Invalid file type. Only JPEG, PNG and WebP are allowed', 400), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: UPLOAD.MAX_FILE_SIZE,
  },
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new ApiError('File size too large', 400));
    }
    return next(new ApiError(err.message, 400));
  }
  next(err);
};

module.exports = {
  upload,
  handleMulterError,
}; 