"""PDF text extraction utilities using PyMuPDF."""

import fitz  # PyMuPDF


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extract all text content from a PDF file.

    Args:
        file_bytes: Raw bytes of the PDF file.

    Returns:
        Concatenated text from all pages of the PDF.

    Raises:
        ValueError: If the PDF contains no extractable text.
        RuntimeError: If the PDF cannot be opened or parsed.
    """
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
    except Exception as exc:
        raise RuntimeError(f"Failed to open PDF: {exc}") from exc

    pages_text: list[str] = []
    for page_num, page in enumerate(doc, start=1):
        text = page.get_text("text")
        if text and text.strip():
            pages_text.append(text.strip())

    doc.close()

    if not pages_text:
        raise ValueError(
            "The uploaded PDF contains no extractable text. "
            "It may be a scanned image — please upload a text-based PDF."
        )

    return "\n".join(pages_text)
