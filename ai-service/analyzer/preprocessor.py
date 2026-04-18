"""Text preprocessing and keyword extraction utilities."""

import re
import string

from collections import Counter

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
    Extract the top-N keywords from text using frequency counts.

    Args:
        text: Preprocessed text string.
        top_n: Number of top keywords to return.

    Returns:
        List of keywords sorted by frequency (descending).
    """
    if not text.strip():
        return []

    words = text.split()
    tokens = words.copy()
    
    # Add bigrams
    for i in range(len(words) - 1):
        tokens.append(words[i] + " " + words[i+1])

    counts = Counter(tokens)
    most_common = counts.most_common(top_n)

    return [keyword for keyword, _count in most_common]
