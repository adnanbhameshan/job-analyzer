/**
 * AI Resume Analyzer Page
 *
 * Allows users to upload a PDF resume and paste a job description,
 * then displays match analysis results including a score ring,
 * matched/missing skill badges, and actionable suggestions.
 */

import { useState, useRef, useCallback } from 'react';
import apiClient from '../api/client';
import './AiAnalyzer.css';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// ---------------------------------------------------------------------------
// Score Ring Sub-component
// ---------------------------------------------------------------------------

/**
 * Animated circular progress ring that visualises the match score.
 * Color transitions from red → amber → green based on score value.
 */
const ScoreRing = ({ score }) => {
  const radius = 65;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getScoreColor = (value) => {
    if (value >= 75) return '#16a34a';
    if (value >= 50) return '#f59e0b';
    if (value >= 25) return '#f97316';
    return '#ef4444';
  };

  return (
    <div className="ai-analyzer__score-ring">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle className="ai-analyzer__score-track" cx="80" cy="80" r={radius} />
        <circle
          className="ai-analyzer__score-fill"
          cx="80"
          cy="80"
          r={radius}
          stroke={getScoreColor(score)}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="ai-analyzer__score-value">
        <span className="ai-analyzer__score-number" style={{ color: getScoreColor(score) }}>
          {score}
        </span>
        <span className="ai-analyzer__score-percent">%</span>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const AiAnalyzer = () => {
  // State
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);

  const fileInputRef = useRef(null);

  // -------------------------------------------------------------------------
  // File Handling
  // -------------------------------------------------------------------------

  const validateFile = useCallback((selectedFile) => {
    if (!selectedFile) return null;

    if (selectedFile.type !== 'application/pdf') {
      setError('Only PDF files are accepted. Please select a valid resume.');
      return null;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setError(`File size exceeds ${MAX_FILE_SIZE_MB} MB limit.`);
      return null;
    }

    setError('');
    return selectedFile;
  }, []);

  const handleFileSelect = (e) => {
    const selectedFile = validateFile(e.target.files?.[0]);
    if (selectedFile) setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    const droppedFile = validateFile(e.dataTransfer.files?.[0]);
    if (droppedFile) setFile(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  // -------------------------------------------------------------------------
  // Analysis Submission
  // -------------------------------------------------------------------------

  const handleAnalyze = async () => {
    // Client-side validation
    if (!file) {
      setError('Please upload your resume (PDF).');
      return;
    }
    if (!jobDescription.trim()) {
      setError('Please enter a job description.');
      return;
    }
    if (jobDescription.trim().length < 20) {
      setError('Job description is too short. Please provide more detail.');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('job_description', jobDescription.trim());

    try {
      const response = await apiClient.post('/ai/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000, // 60s — large PDFs can take a while
      });

      if (response.data?.success) {
        setResults(response.data.data);
      } else {
        setError(response.data?.message || 'Analysis failed. Please try again.');
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.code === 'ECONNABORTED'
          ? 'Request timed out. Try a smaller resume.'
          : 'Unable to connect to the analysis service. Please try again later.');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Reset
  // -------------------------------------------------------------------------

  const handleReset = () => {
    setFile(null);
    setJobDescription('');
    setResults(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="ai-analyzer">
      {/* Header */}
      <div className="ai-analyzer__header">
        <h1 className="ai-analyzer__title">
          <svg className="ai-analyzer__title-icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z" />
            <circle cx="12" cy="15" r="2" />
            <path d="M12 17v2" />
          </svg>
          AI Resume Analyzer
        </h1>
        <p className="ai-analyzer__subtitle">
          Upload your resume and a job description to see how well they match
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="ai-analyzer__error" role="alert">
          <svg className="ai-analyzer__error-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="ai-analyzer__error-text">{error}</span>
        </div>
      )}

      {/* Form */}
      {!results && !loading && (
        <div className="ai-analyzer__form">
          <div className="ai-analyzer__form-grid">
            {/* Left: File Upload */}
            <div>
              <span className="ai-analyzer__upload-label">Resume (PDF)</span>
              <div
                className={`ai-analyzer__dropzone${isDragActive ? ' ai-analyzer__dropzone--active' : ''}${file ? ' ai-analyzer__dropzone--has-file' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              >
                <svg className="ai-analyzer__dropzone-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <polyline points="9 15 12 12 15 15" />
                </svg>
                {file ? (
                  <span className="ai-analyzer__filename">✓ {file.name}</span>
                ) : (
                  <>
                    <p className="ai-analyzer__dropzone-text">
                      <strong>Click to upload</strong> or drag and drop
                    </p>
                    <p className="ai-analyzer__dropzone-hint">PDF only, up to {MAX_FILE_SIZE_MB} MB</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  id="resume-upload"
                />
              </div>
            </div>

            {/* Right: Job Description */}
            <div className="ai-analyzer__jd-section">
              <label className="ai-analyzer__jd-label" htmlFor="job-description">
                Job Description
              </label>
              <textarea
                id="job-description"
                className="ai-analyzer__jd-textarea"
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="ai-analyzer__submit-row">
            <button
              className="ai-analyzer__submit-btn"
              onClick={handleAnalyze}
              disabled={!file || !jobDescription.trim()}
              id="analyze-button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              Analyze Match
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="ai-analyzer__loading">
          <div className="ai-analyzer__spinner" />
          <span className="ai-analyzer__loading-text">Analyzing your resume...</span>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="ai-analyzer__results">
          <h2 className="ai-analyzer__results-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Analysis Results
          </h2>

          {/* Score Ring */}
          <div className="ai-analyzer__score-card">
            <ScoreRing score={results.match_score} />
            <span className="ai-analyzer__score-label">Match Score</span>
          </div>

          {/* Skills Grid */}
          <div className="ai-analyzer__skills-grid">
            {/* Matched Skills */}
            <div className="ai-analyzer__skills-card">
              <h3 className="ai-analyzer__skills-heading ai-analyzer__skills-heading--matched">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Matched Skills
                <span className="ai-analyzer__skills-count">{results.extracted_skills.length}</span>
              </h3>
              <div className="ai-analyzer__badges">
                {results.extracted_skills.length > 0 ? (
                  results.extracted_skills.map((skill, i) => (
                    <span
                      key={skill}
                      className="ai-analyzer__badge ai-analyzer__badge--matched"
                      style={{ animationDelay: `${i * 0.04}s` }}
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="ai-analyzer__dropzone-hint">No matching skills found</span>
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="ai-analyzer__skills-card">
              <h3 className="ai-analyzer__skills-heading ai-analyzer__skills-heading--missing">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Missing Skills
                <span className="ai-analyzer__skills-count">{results.missing_skills.length}</span>
              </h3>
              <div className="ai-analyzer__badges">
                {results.missing_skills.length > 0 ? (
                  results.missing_skills.map((skill, i) => (
                    <span
                      key={skill}
                      className="ai-analyzer__badge ai-analyzer__badge--missing"
                      style={{ animationDelay: `${i * 0.04}s` }}
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="ai-analyzer__dropzone-hint">Great — no critical skills are missing!</span>
                )}
              </div>
            </div>
          </div>

          {/* Suggestions */}
          {results.suggestions?.length > 0 && (
            <div className="ai-analyzer__suggestions">
              <h3 className="ai-analyzer__suggestions-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                Suggestions
              </h3>
              {results.suggestions.map((suggestion, i) => (
                <div
                  className="ai-analyzer__suggestion-item"
                  key={i}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="ai-analyzer__suggestion-bullet" />
                  <p className="ai-analyzer__suggestion-text">{suggestion}</p>
                </div>
              ))}
            </div>
          )}

          {/* Reset */}
          <div className="ai-analyzer__reset-row">
            <button className="ai-analyzer__reset-btn" onClick={handleReset}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              Analyze Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiAnalyzer;
