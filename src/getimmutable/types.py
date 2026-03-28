from __future__ import annotations

from typing import Any, TypedDict


class Target(TypedDict, total=False):
    type: str
    id: str
    name: str
    metadata: dict[str, Any]


class EventPayload(TypedDict, total=False):
    actor_id: str  # required
    action: str  # required
    actor_name: str
    actor_type: str
    action_category: str
    resource: str
    resource_id: str
    resource_name: str
    targets: list[Target]
    metadata: dict[str, Any]
    tenant_id: str
    session_id: str
    idempotency_key: str
    version: int
    occurred_at: str


class EventResponse(TypedDict):
    id: str
    status: str  # 'queued' | 'duplicate'


class BatchResponse(TypedDict):
    events: list[EventResponse]


class Integrity(TypedDict):
    event_hash: str | None
    previous_event_hash: str | None


class Actor(TypedDict, total=False):
    id: str
    name: str | None
    type: str | None


class Resource(TypedDict, total=False):
    type: str | None
    id: str | None
    name: str | None


class Event(TypedDict):
    id: str
    actor: Actor
    action: str
    action_category: str | None
    resource: Resource
    targets: list[Target]
    metadata: dict[str, Any] | None
    tenant_id: str | None
    session_id: str | None
    ip_country: str | None
    ip_city: str | None
    idempotency_key: str | None
    version: int | None
    integrity: Integrity
    occurred_at: str | None
    created_at: str


class Pagination(TypedDict):
    has_more: bool
    next_cursor: str | None
    total: int


class QueryResult(TypedDict):
    data: list[Event]
    pagination: Pagination


class VerifyBreak(TypedDict, total=False):
    event_id: str
    type: str
    expected_hash: str
    actual_hash: str


class VerifyData(TypedDict):
    valid: bool
    events_checked: int
    breaks: list[VerifyBreak]


class VerifyResult(TypedDict):
    data: VerifyData


class AlertEvent(TypedDict, total=False):
    id: str
    action: str
    actor_id: str


class AlertItem(TypedDict):
    id: str
    rule_name: str | None
    rule_type: str | None
    reason: str
    event: AlertEvent | None
    notified_at: str | None
    triggered_at: str


class AlertResult(TypedDict):
    data: list[AlertItem]
    pagination: Pagination


class ExportData(TypedDict, total=False):
    id: str
    status: str  # 'pending' | 'processing' | 'completed' | 'failed'


class ExportResponse(TypedDict):
    data: ExportData


class ExportStatusData(TypedDict, total=False):
    id: str
    status: str
    filters: dict[str, str]
    total_rows: int | None
    file_size: int | None
    download_url: str
    error_message: str
    created_at: str
    expires_at: str | None


class ExportStatus(TypedDict):
    data: ExportStatusData


class ViewerTokenResponse(TypedDict):
    token: str
    expires_at: int
