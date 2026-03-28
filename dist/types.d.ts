export interface ImmutableConfig {
    apiKey: string;
    baseUrl: string;
    timeout?: number;
}
export interface Actor {
    id: string;
    name?: string;
    type?: string;
}
export interface Target {
    type: string;
    id?: string;
    name?: string;
    metadata?: Record<string, unknown>;
}
export interface EventPayload {
    actor_id: string;
    action: string;
    actor_name?: string;
    actor_type?: string;
    action_category?: string;
    resource?: string;
    resource_id?: string;
    resource_name?: string;
    targets?: Target[];
    /** Key-value metadata. Maximum 50 keys, 64KB total size. */
    metadata?: Record<string, unknown>;
    tenant_id?: string;
    session_id?: string;
    idempotency_key?: string;
    version?: number;
    occurred_at?: string;
}
export interface EventResponse {
    id: string;
    status: 'queued' | 'duplicate';
}
export interface BatchResponse {
    events: EventResponse[];
}
export interface Event {
    id: string;
    actor: {
        id: string;
        name: string | null;
        type: string | null;
    };
    action: string;
    action_category: string | null;
    resource: {
        type: string | null;
        id: string | null;
        name: string | null;
    };
    targets: Target[];
    metadata: Record<string, unknown> | null;
    tenant_id: string | null;
    session_id: string | null;
    ip_country: string | null;
    ip_city: string | null;
    idempotency_key: string | null;
    version: number | null;
    integrity: {
        event_hash: string | null;
        previous_event_hash: string | null;
    };
    occurred_at: string | null;
    created_at: string;
}
export interface Pagination {
    has_more: boolean;
    next_cursor: string | null;
    total: number;
}
export interface QueryResult {
    data: Event[];
    pagination: Pagination;
}
export interface QueryFilters {
    actor_id?: string;
    action?: string;
    resource?: string;
    resource_id?: string;
    tenant_id?: string;
    session_id?: string;
    target_type?: string;
    target_id?: string;
    search?: string;
    from?: string;
    to?: string;
    cursor?: string;
    limit?: number;
}
export interface VerifyResult {
    data: {
        valid: boolean;
        events_checked: number;
        breaks: Array<{
            event_id: string;
            type: string;
            expected_hash?: string;
            actual_hash?: string;
        }>;
    };
}
export interface AlertItem {
    id: string;
    rule_name: string | null;
    rule_type: string | null;
    reason: string;
    event: {
        id: string;
        action: string;
        actor_id: string;
    } | null;
    notified_at: string | null;
    triggered_at: string;
}
export interface AlertResult {
    data: AlertItem[];
    pagination: Pagination;
}
export interface ExportFilters {
    from?: string;
    to?: string;
    actor_id?: string;
    action?: string;
    resource?: string;
    tenant_id?: string;
    session_id?: string;
    search?: string;
}
export interface ExportResponse {
    data: {
        id: string;
        status: 'pending' | 'processing' | 'completed' | 'failed';
    };
}
export interface ExportStatus {
    data: {
        id: string;
        status: 'pending' | 'processing' | 'completed' | 'failed';
        filters: Record<string, string>;
        total_rows: number | null;
        file_size: number | null;
        download_url?: string;
        error_message?: string;
        created_at: string;
        expires_at: string | null;
    };
}
export interface AnchorItem {
    id: string;
    merkle_root: string;
    previous_anchor_hash: string | null;
    events_count: number;
    period_start: string;
    period_end: string;
    chain: string;
    status: 'pending' | 'submitted' | 'confirmed' | 'failed';
    tx_hash: string | null;
    block_number: number | null;
    explorer_url: string | null;
    created_at: string;
}
export interface AnchorDetail extends AnchorItem {
    first_event_hash: string;
    last_event_hash: string;
}
export interface AnchorListResult {
    data: AnchorItem[];
}
export interface AnchorDetailResult {
    data: AnchorDetail;
}
export interface AnchorVerifyResult {
    data: {
        anchor_id: string;
        merkle_root: string;
        valid: boolean;
        chain_valid: boolean;
        expected: string;
        actual: string;
        events_count: number;
        tx_hash: string | null;
        explorer_url: string | null;
    };
}
//# sourceMappingURL=types.d.ts.map