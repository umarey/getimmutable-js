from __future__ import annotations

from typing import Any


class ImmutableError(Exception):
    """Raised when an Immutable API request fails."""

    def __init__(self, message: str, status_code: int = 0, response_data: dict[str, Any] | None = None) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.response_data = response_data or {}
