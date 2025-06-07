import bleach

ALLOWED_TAGS = [
    "b", "i", "u", "em", "strong", "a", "p", "br", "ul", "ol", "li"
]

ALLOWED_ATTRS = {
    "a": ["href", "title", "target"]
}

def sanitize_html(value: str | None) -> str | None:
    """Return a sanitized version of *value* for safe storage/display."""
    if value is None:
        return None
    return bleach.clean(
        value, tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRS, strip=True
    )
