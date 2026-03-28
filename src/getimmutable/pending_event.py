from __future__ import annotations

from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from .client import ImmutableClient
    from .types import EventResponse


class PendingEvent:
    """Fluent builder for constructing and sending an audit event."""

    def __init__(self, client: ImmutableClient, actor: dict[str, Any]) -> None:
        self._client = client
        self._actor = actor
        self._idempotency_key: str | None = None
        self._version: int | None = None
        self._session_id: str | None = None
        self._action_category: str | None = None
        self._targets: list[dict[str, Any]] = []

    def idempotency_key(self, key: str) -> PendingEvent:
        """Set an idempotency key to prevent duplicate events."""
        self._idempotency_key = key
        return self

    def version(self, v: int) -> PendingEvent:
        """Set the event schema version."""
        self._version = v
        return self

    def session(self, session_id: str) -> PendingEvent:
        """Set the session identifier."""
        self._session_id = session_id
        return self

    def action_category(self, category: str) -> PendingEvent:
        """Set the action category."""
        self._action_category = category
        return self

    def target(
        self,
        type: str,
        id: str | None = None,
        name: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> PendingEvent:
        """Add a target resource to this event."""
        t: dict[str, Any] = {"type": type}
        if id is not None:
            t["id"] = id
        if name is not None:
            t["name"] = name
        if metadata is not None:
            t["metadata"] = metadata
        self._targets.append(t)
        return self

    def targets(self, targets: list[dict[str, Any]]) -> PendingEvent:
        """Set all targets at once."""
        self._targets = targets
        return self

    def track(
        self,
        action: str,
        resource: str | dict[str, Any] | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> EventResponse:
        """Send the event to the Immutable API.

        Args:
            action: The action name (e.g. "document.created").
            resource: A resource type string, or a dict with type, id, and optionally name.
            metadata: Additional key-value metadata.
        """
        payload: dict[str, Any] = {
            "actor_id": str(self._actor["id"]),
            "action": action,
        }

        if self._actor.get("name"):
            payload["actor_name"] = self._actor["name"]
        if self._actor.get("type"):
            payload["actor_type"] = self._actor["type"]
        if isinstance(resource, dict):
            payload["resource"] = resource.get("type", "")
            if resource.get("id"):
                payload["resource_id"] = resource["id"]
            if resource.get("name"):
                payload["resource_name"] = resource["name"]
        elif resource is not None:
            payload["resource"] = resource
        if metadata and len(metadata) > 0:
            payload["metadata"] = metadata
        if self._action_category:
            payload["action_category"] = self._action_category
        if self._idempotency_key:
            payload["idempotency_key"] = self._idempotency_key
        if self._version is not None:
            payload["version"] = self._version
        if self._session_id:
            payload["session_id"] = self._session_id
        if self._targets:
            payload["targets"] = self._targets

        return self._client.track(payload)
