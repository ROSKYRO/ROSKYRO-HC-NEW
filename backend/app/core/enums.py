"""
Safe parsing of enum-valued *query parameters*.

Request bodies are validated by Pydantic, but query params like
`?status_filter=foo` were being passed straight into `SomeEnum(value)`, which
raises a bare `ValueError` — FastAPI turns that into a 500 Internal Server
Error. A mistyped filter in the admin console is a client mistake, so it
should be a 400 with a readable message listing what IS accepted.
"""
from typing import Optional, Type, TypeVar

from fastapi import HTTPException

E = TypeVar("E")


def parse_enum_filter(enum_cls: Type[E], value: Optional[str], field: str = "filter") -> Optional[E]:
    """None/blank -> None (no filtering). A valid member -> that member.
    Anything else -> HTTP 400 naming the allowed values."""
    if value is None or not str(value).strip():
        return None
    try:
        return enum_cls(value)
    except ValueError:
        allowed = ", ".join(m.value for m in enum_cls)
        raise HTTPException(
            status_code=400,
            detail=f"Invalid {field} '{value}'. Allowed values: {allowed}.",
        )
