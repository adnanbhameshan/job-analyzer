/**
 * AI Routes — Resume analysis endpoint.
 *
 * Uses multer for in-memory file upload handling with strict validation:
 * - PDF files only
 * - 10 MB size limit
 * - Single file upload
 */

const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { analyzeResume } = require('../controllers/aiController');

const router = express.Router();

// ---------------------------------------------------------------------------
// Multer Configuration
// ---------------------------------------------------------------------------

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only PDF files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 1,
  },
});

// ---------------------------------------------------------------------------
// Multer Error Handler
// ---------------------------------------------------------------------------

const handleMulterError = (err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds the 10 MB limit.',
      });
    }
    return res.status(400).json({
      success: false,
      message: err.field || 'Invalid file upload.',
    });
  }
  next(err);
};

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

router.post(
  '/analyze',
  protect,
  upload.single('resume'),
  handleMulterError,
  analyzeResume,
);

module.exports = router;
