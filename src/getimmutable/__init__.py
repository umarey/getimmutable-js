"""Immutable – tamper-evident audit logs for B2B SaaS."""

from .client import ImmutableClient
from .errors import ImmutableError
from .pending_event import PendingEvent

__all__ = ["ImmutableClient", "ImmutableError", "PendingEvent"]
__version__ = "0.1.0"
