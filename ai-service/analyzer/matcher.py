"""Resume-to-job-description matching engine."""

import math
from collections import Counter


def get_tokens(text: str) -> list[str]:
    """Extract unigrams and bigrams from text."""
    words = text.split()
    tokens = words.copy()
    for i in range(len(words) - 1):
        tokens.append(words[i] + " " + words[i+1])
    return tokens


def calculate_similarity(resume_text: str, job_description: str) -> float:
    """
    Compute cosine similarity between resume and job description using TF-IDF.
    Implemented in pure Python to avoid large dependencies like scikit-learn.

    Args:
        resume_text: Preprocessed resume text.
        job_description: Preprocessed job description text.

    Returns:
        Similarity score as a percentage (0–100), rounded to 1 decimal.
    """
    if not resume_text.strip() or not job_description.strip():
        return 0.0

    resume_tokens = get_tokens(resume_text)
    job_tokens = get_tokens(job_description)
    
    resume_set = set(resume_tokens)
    job_set = set(job_tokens)

    vocab = set(resume_tokens + job_tokens)
    resume_tf = Counter(resume_tokens)
    job_tf = Counter(job_tokens)

    def get_tfidf_vector(tf_counter):
        vec = []
        for word in vocab:
            tf = tf_counter[word]
            df = (1 if word in resume_set else 0) + (1 if word in job_set else 0)
            idf = math.log(3.0 / (1.0 + df)) + 1.0
            vec.append(tf * idf)
        return vec

    vec1 = get_tfidf_vector(resume_tf)
    vec2 = get_tfidf_vector(job_tf)

    dot = sum(a * b for a, b in zip(vec1, vec2))
    norm_a = math.sqrt(sum(a * a for a in vec1))
    norm_b = math.sqrt(sum(b * b for b in vec2))

    if norm_a == 0 or norm_b == 0:
        return 0.0

    score = (dot / (norm_a * norm_b)) * 100
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
