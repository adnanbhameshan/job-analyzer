"""
AI Resume Analyzer — FastAPI Service

Analyzes a PDF resume against a job description using TF-IDF vectorization
and cosine similarity. Returns match score, extracted/missing keywords, and
actionable suggestions.

Usage:
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

import logging

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from analyzer.extractor import extract_text_from_pdf
from analyzer.matcher import calculate_similarity, find_missing_keywords, generate_suggestions
from analyzer.preprocessor import extract_keywords, preprocess_text

# ---------------------------------------------------------------------------
# App Configuration
# ---------------------------------------------------------------------------

logging.basicConfig(level=logging.INFO, format="%(asctime)s — %(levelname)s — %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Resume Analyzer",
    description="Analyzes resume-to-job-description match using NLP",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

MAX_FILE_SIZE_MB = 10
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
ALLOWED_CONTENT_TYPES = {"application/pdf"}

# ---------------------------------------------------------------------------
# Health Check
# ---------------------------------------------------------------------------


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring and readiness probes."""
    return {"status": "healthy", "service": "ai-resume-analyzer"}


# ---------------------------------------------------------------------------
# Main Analysis Endpoint
# ---------------------------------------------------------------------------


@app.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(..., description="PDF resume file"),
    job_description: str = Form(..., description="Job description text"),
):
    """
    Analyze a resume against a job description.

    Accepts a PDF resume and plain-text job description. Returns a structured
    JSON response with match score, extracted skills, missing skills, and
    improvement suggestions.
    """
    # --- Input Validation ---------------------------------------------------

    if not resume.filename:
        raise HTTPException(status_code=400, detail="No resume file provided.")

    if resume.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: '{resume.content_type}'. Only PDF files are accepted.",
        )

    job_description = job_description.strip()
    if not job_description:
        raise HTTPException(
            status_code=400,
            detail="Job description cannot be empty.",
        )

    if len(job_description) < 20:
        raise HTTPException(
            status_code=400,
            detail="Job description is too short. Please provide at least 20 characters.",
        )

    # --- Read & Validate File Size ------------------------------------------

    file_bytes = await resume.read()

    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded PDF file is empty.")

    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds {MAX_FILE_SIZE_MB}MB limit.",
        )

    logger.info("Processing resume: %s (%.1f KB)", resume.filename, len(file_bytes) / 1024)

    # --- PDF Text Extraction ------------------------------------------------

    try:
        raw_resume_text = extract_text_from_pdf(file_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except RuntimeError as exc:
        logger.error("PDF extraction failed: %s", exc)
        raise HTTPException(
            status_code=422,
            detail="Could not process the PDF. The file may be corrupted.",
        )

    # --- Text Preprocessing -------------------------------------------------

    cleaned_resume = preprocess_text(raw_resume_text)
    cleaned_jd = preprocess_text(job_description)

    if not cleaned_resume:
        raise HTTPException(
            status_code=422,
            detail="No meaningful text could be extracted from the resume after preprocessing.",
        )

    # --- Analysis -----------------------------------------------------------

    match_score = calculate_similarity(cleaned_resume, cleaned_jd)
    resume_keywords = extract_keywords(cleaned_resume, top_n=30)
    jd_keywords = extract_keywords(cleaned_jd, top_n=30)
    missing_keywords = find_missing_keywords(resume_keywords, jd_keywords)
    suggestions = generate_suggestions(missing_keywords, match_score)

    logger.info(
        "Analysis complete — Score: %.1f%%, Resume keywords: %d, JD keywords: %d, Missing: %d",
        match_score,
        len(resume_keywords),
        len(jd_keywords),
        len(missing_keywords),
    )

    # --- Response -----------------------------------------------------------

    return {
        "success": True,
        "data": {
            "match_score": match_score,
            "extracted_skills": resume_keywords,
            "missing_skills": missing_keywords,
            "job_keywords": jd_keywords,
            "suggestions": suggestions,
        },
    }
