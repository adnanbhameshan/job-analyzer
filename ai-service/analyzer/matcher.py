"""Resume-to-job-description matching engine."""

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def calculate_similarity(resume_text: str, job_description: str) -> float:
    """
    Compute cosine similarity between resume and job description using TF-IDF.

    Args:
        resume_text: Preprocessed resume text.
        job_description: Preprocessed job description text.

    Returns:
        Similarity score as a percentage (0–100), rounded to 1 decimal.
    """
    if not resume_text.strip() or not job_description.strip():
        return 0.0

    vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words="english")

    try:
        tfidf_matrix = vectorizer.fit_transform([resume_text, job_description])
    except ValueError:
        return 0.0

    similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
    score = float(similarity[0][0]) * 100

    return round(score, 1)


def find_missing_keywords(
    resume_keywords: list[str], job_keywords: list[str]
) -> list[str]:
    """
    Identify job description keywords absent from the resume.

    Uses normalized comparison: a job keyword is considered "present" if it
    appears as a substring in any resume keyword (handles partial matches
    like "react" matching "react js").

    Args:
        resume_keywords: Keywords extracted from the resume.
        job_keywords: Keywords extracted from the job description.

    Returns:
        List of missing keywords sorted alphabetically.
    """
    resume_joined = " ".join(resume_keywords).lower()
    missing = [
        kw for kw in job_keywords
        if kw.lower() not in resume_joined
    ]
    return sorted(set(missing))


def generate_suggestions(missing_keywords: list[str], match_score: float) -> list[str]:
    """
    Generate actionable improvement suggestions based on analysis results.

    Args:
        missing_keywords: Keywords from JD not found in the resume.
        match_score: Cosine similarity score (0–100).

    Returns:
        List of suggestion strings.
    """
    suggestions: list[str] = []

    # Score-based suggestions
    if match_score >= 80:
        suggestions.append(
            "Excellent match! Your resume aligns very well with this job description."
        )
    elif match_score >= 60:
        suggestions.append(
            "Good match. A few targeted additions could strengthen your application."
        )
    elif match_score >= 40:
        suggestions.append(
            "Moderate match. Consider tailoring your resume to highlight more relevant experience."
        )
    else:
        suggestions.append(
            "Low match. Significant resume updates are recommended to align with this role."
        )

    # Missing keyword suggestions
    if missing_keywords:
        top_missing = missing_keywords[:5]
        suggestions.append(
            f"Add these high-priority keywords to your resume: {', '.join(top_missing)}."
        )

        if len(missing_keywords) > 5:
            suggestions.append(
                f"Consider also incorporating: {', '.join(missing_keywords[5:10])}."
            )

    # General best practices
    suggestions.append(
        "Quantify your achievements with metrics (e.g., 'Increased performance by 30%')."
    )
    suggestions.append(
        "Ensure your resume uses terminology that mirrors the job description."
    )

    return suggestions
