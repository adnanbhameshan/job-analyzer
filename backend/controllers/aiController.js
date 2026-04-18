/**
 * AI Controller — Handles resume analysis requests.
 *
 * Acts as a proxy between the React frontend and the Python AI service.
 * Validates inputs, forwards the resume + job description to the Python
 * service, and returns the structured analysis results.
 */

const axios = require('axios');
const FormData = require('form-data');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * @desc    Analyze a resume against a job description
 * @route   POST /api/ai/analyze
 * @access  Private (requires authentication)
 */
const analyzeResume = async (req, res) => {
  try {
    // --- Input Validation --------------------------------------------------

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume file (PDF).',
      });
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({
        success: false,
        message: 'Only PDF files are accepted.',
      });
    }

    const jobDescription = req.body.job_description?.trim();

    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a job description.',
      });
    }

    if (jobDescription.length < 20) {
      return res.status(400).json({
        success: false,
        message: 'Job description is too short. Please provide more detail.',
      });
    }

    // --- Forward to Python AI Service --------------------------------------

    const formData = new FormData();
    formData.append('resume', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    formData.append('job_description', jobDescription);

    const response = await axios.post(`${AI_SERVICE_URL}/analyze`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000, // 30-second timeout for large PDFs
      maxContentLength: 50 * 1024 * 1024,
    });

    // --- Return Results ----------------------------------------------------

    return res.status(200).json(response.data);

  } catch (error) {
    // Distinguish between AI service errors and unexpected failures

    if (error.response) {
      // Python service returned an error response
      const statusCode = error.response.status;
      const detail = error.response.data?.detail || 'AI service returned an error.';

      console.error(`AI service error [${statusCode}]:`, detail);

      return res.status(statusCode >= 500 ? 502 : statusCode).json({
        success: false,
        message: detail,
      });
    }

    if (error.code === 'ECONNREFUSED') {
      console.error('AI service is not running at:', AI_SERVICE_URL);
      return res.status(503).json({
        success: false,
        message: 'AI analysis service is currently unavailable. Please try again later.',
      });
    }

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      console.error('AI service request timed out');
      return res.status(504).json({
        success: false,
        message: 'Analysis timed out. The resume may be too large — try a shorter PDF.',
      });
    }

    // Unexpected error
    console.error('Unexpected error in analyzeResume:', error.message);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred during analysis.',
    });
  }
};

module.exports = { analyzeResume };
