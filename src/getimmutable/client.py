from __future__ import annotations

from typing import Any

import httpx

from .errors import ImmutableError
from .pending_event import PendingEvent
from .types import (
    AlertResult,
    BatchResponse,
    Event,
    EventPayload,
    EventResponse,
    ExportResponse,
    ExportStatus,
    QueryResult,
    VerifyResult,
    ViewerTokenResponse,
)


class ImmutableClient:
    """Synchronous client for the Immutable audit log API."""

    def __init__(self, api_key: str, base_url: str, timeout: float = 5.0) -> None:
        self._api_key = api_key
        self._base_url = base_url.rstrip("/")
        self._timeout = timeout

    # ── Fluent builder ──────────────────────────────────────────────

    def actor(
        self,
        actor_id: str,
        *,
        name: str | None = None,
        type: str | None = None,
    ) -> PendingEvent:
        """Start building an event with an explicit actor."""
        return PendingEvent(self, {"id": actor_id, "name": name, "type": type})

    # ── Events ──────────────────────────────────────────────────────

    def track(self, payload: EventPayload) -> EventResponse:
        """Send a single event. Returns ``{id, status}``."""
        return self._post("/v1/events", payload)

    def track_batch(self, events: list[EventPayload]) -> BatchResponse:
        """Send up to 100 events at once."""
        return self._post("/v1/events/batch", {"events": events})

    def get_events(
        self,
        *,
        actor_id: str | None = None,
        action: str | None = None,
        resource: str | None = None,
        resource_id: str | None = None,
        tenant_id: str | None = None,
        session_id: str | None = None,
        target_type: str | None = None,
        target_id: str | None = None,
        search: str | None = None,
        from_date: str | None = None,
        to_date: str | None = None,
        cursor: str | None = None,
        limit: int | None = None,
    ) -> QueryResult:
        """Query events with filters and cursor pagination."""
        params = _compact(
            actor_id=actor_id,
            action=action,
            resource=resource,
            resource_id=resource_id,
            tenant_id=tenant_id,
            session_id=session_id,
            target_type=target_type,
            target_id=target_id,
            search=search,
            cursor=cursor,
            limit=limit,
            **{"from": from_date, "to": to_date},
        )
        return self._get("/v1/events", params)

    def get_event(self, event_id: str) -> dict[str, Event]:
        """Get a single event by ID. Returns ``{data: Event}``."""
        return self._get(f"/v1/events/{event_id}")

    # ── Verification ────────────────────────────────────────────────

    def verify(
        self,
        *,
        from_date: str | None = None,
        to_date: str | None = None,
        limit: int | None = None,
    ) -> VerifyResult:
        """Verify the hash chain integrity."""
        params = _compact(limit=limit, **{"from": from_date, "to": to_date})
        return self._get("/v1/verify", params)

    # ── Viewer tokens ───────────────────────────────────────────────

    def create_viewer_token(
        self,
        *,
        tenant_id: str | None = None,
        actor_id: str | None = None,
        ttl: int | None = None,
    ) -> ViewerTokenResponse:
        """Create a scoped JWT for the embeddable viewer."""
        body = _compact(tenant_id=tenant_id, actor_id=actor_id, ttl=ttl)
        return self._post("/v1/viewer-token", body)

    # ── Alerts ──────────────────────────────────────────────────────

    def get_alerts(
        self,
        *,
        rule_type: str | None = None,
        from_date: str | None = None,
        to_date: str | None = None,
        limit: int | None = None,
        cursor: str | None = None,
    ) -> AlertResult:
        """Query triggered alerts."""
        params = _compact(rule_type=rule_type, cursor=cursor, limit=limit, **{"from": from_date, "to": to_date})
        return self._get("/v1/alerts", params)

    # ── Exports ─────────────────────────────────────────────────────

    def create_export(
        self,
        *,
        from_date: str | None = None,
        to_date: str | None = None,
        actor_id: str | None = None,
        action: str | None = None,
        resource: str | None = None,
        tenant_id: str | None = None,
        session_id: str | None = None,
        search: str | None = None,
    ) -> ExportResponse:
        """Create a CSV export job."""
        body = _compact(
            actor_id=actor_id,
            action=action,
            resource=resource,
            tenant_id=tenant_id,
            session_id=session_id,
            search=search,
            **{"from": from_date, "to": to_date},
        )
        return self._post("/v1/exports", body)

    def get_export(self, export_id: str) -> ExportStatus:
        """Check the status of an export."""
        return self._get(f"/v1/exports/{export_id}")

    # ── Anchors ─────────────────────────────────────────────────────

    def get_anchors(self, *, limit: int | None = None) -> Any:
        """List blockchain anchors for the workspace."""
        params = _compact(limit=limit)
        return self._get("/v1/anchors", params or None)

    def get_anchor(self, anchor_id: str) -> Any:
        """Get details of a specific anchor."""
        return self._get(f"/v1/anchors/{anchor_id}")

    def verify_anchor(self, anchor_id: str) -> Any:
        """Verify an anchor by recomputing the Merkle root."""
        return self._get(f"/v1/anchors/{anchor_id}/verify")

    # ── HTTP helpers ────────────────────────────────────────────────

    def _post(self, path: str, body: dict[str, Any]) -> Any:
        return self._request("POST", path, json=body)

    def _get(self, path: str, params: dict[str, Any] | None = None) -> Any:
        return self._request("GET", path, params=params)

    def _request(
        self,
        method: str,
        path: str,
        *,
        json: dict[str, Any] | None = None,
        params: dict[str, Any] | None = None,
    ) -> Any:
        url = f"{self._base_url}/api{path}"
        try:
            response = httpx.request(
                method,
                url,
                json=json,
                params=params,
                headers={
                    "Authorization": f"Bearer {self._api_key}",
                    "Accept": "application/json",
                },
                timeout=self._timeout,
            )
        except httpx.TimeoutException as exc:
            raise ImmutableError("Request timed out") from exc
        except httpx.HTTPError as exc:
            raise ImmutableError(f"HTTP error: {exc}") from exc

        data = response.json()

        if response.status_code >= 400:
            message = data.get("error") or data.get("message") or f"HTTP {response.status_code}"
            raise ImmutableError(message, response.status_code, data)

        return data


def _compact(**kwargs: Any) -> dict[str, Any]:
    """Remove None values from a dict."""
    return {k: v for k, v in kwargs.items() if v is not None}
