"""Text preprocessing and keyword extraction utilities."""

import re
import string

from sklearn.feature_extraction.text import TfidfVectorizer

# Common English stopwords — lightweight, no NLTK dependency required.
STOPWORDS: set[str] = {
    "a", "an", "the", "and", "or", "but", "if", "in", "on", "at", "to",
    "for", "of", "with", "by", "from", "as", "is", "was", "are", "were",
    "be", "been", "being", "have", "has", "had", "do", "does", "did",
    "will", "would", "shall", "should", "may", "might", "must", "can",
    "could", "i", "me", "my", "we", "our", "you", "your", "he", "him",
    "his", "she", "her", "it", "its", "they", "them", "their", "this",
    "that", "these", "those", "am", "not", "no", "nor", "so", "than",
    "too", "very", "just", "about", "above", "after", "again", "all",
    "also", "any", "because", "before", "between", "both", "each",
    "few", "get", "got", "here", "how", "into", "more", "most", "new",
    "now", "only", "other", "out", "over", "own", "same", "some",
    "such", "then", "there", "through", "under", "until", "up", "us",
    "what", "when", "where", "which", "while", "who", "whom", "why",
    "work", "working", "worked", "experience", "etc", "using", "used",
    "use", "well", "able", "need", "needs", "including", "include",
}


def preprocess_text(text: str) -> str:
    """
    Clean and normalize raw text for NLP processing.

    Steps:
        1. Convert to lowercase
        2. Remove URLs
        3. Remove email addresses
        4. Remove punctuation
        5. Collapse multiple whitespace
        6. Remove stopwords

    Args:
        text: Raw input text.

    Returns:
        Cleaned, normalized text string.
    """
    text = text.lower()
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)
    text = re.sub(r"\S+@\S+\.\S+", " ", text)
    text = text.translate(str.maketrans("", "", string.punctuation))
    text = re.sub(r"\s+", " ", text).strip()

    tokens = text.split()
    tokens = [t for t in tokens if t not in STOPWORDS and len(t) > 1]

    return " ".join(tokens)


def extract_keywords(text: str, top_n: int = 30) -> list[str]:
    """
    Extract the top-N keywords from text using TF-IDF scoring.

    Args:
        text: Preprocessed text string.
        top_n: Number of top keywords to return.

    Returns:
        List of keywords sorted by TF-IDF score (descending).
    """
    if not text.strip():
        return []

    vectorizer = TfidfVectorizer(
        max_features=200,
        ngram_range=(1, 2),  # Unigrams + bigrams for phrases like "machine learning"
        stop_words="english",
    )

    try:
        tfidf_matrix = vectorizer.fit_transform([text])
    except ValueError:
        # Happens if text is empty after vectorizer's own preprocessing
        return []

    feature_names = vectorizer.get_feature_names_out()
    scores = tfidf_matrix.toarray().flatten()

    # Pair features with scores and sort descending
    scored_keywords = sorted(
        zip(feature_names, scores), key=lambda x: x[1], reverse=True
    )

    return [keyword for keyword, _score in scored_keywords[:top_n]]
