import type { AlertResult, AnchorDetailResult, AnchorListResult, AnchorVerifyResult, BatchResponse, Event, EventPayload, EventResponse, ExportFilters, ExportResponse, ExportStatus, ImmutableConfig, QueryFilters, QueryResult, VerifyResult } from './types.js';
export declare class ImmutableClient {
    private readonly apiKey;
    private readonly baseUrl;
    private readonly timeout;
    constructor(config: ImmutableConfig);
    track(payload: EventPayload): Promise<EventResponse>;
    trackBatch(events: EventPayload[]): Promise<BatchResponse>;
    getEvents(filters?: QueryFilters): Promise<QueryResult>;
    getEvent(id: string): Promise<{
        data: Event;
    }>;
    verify(from?: string, to?: string, limit?: number): Promise<VerifyResult>;
    createViewerToken(options: {
        tenantId?: string;
        actorId?: string;
        ttl?: number;
    }): Promise<{
        token: string;
        expires_at: number;
    }>;
    getAlerts(filters?: {
        rule_type?: string;
        from?: string;
        to?: string;
        limit?: number;
    }): Promise<AlertResult>;
    createExport(filters?: ExportFilters): Promise<ExportResponse>;
    getExport(id: string): Promise<ExportStatus>;
    getAnchors(limit?: number): Promise<AnchorListResult>;
    getAnchor(id: string): Promise<AnchorDetailResult>;
    verifyAnchor(id: string): Promise<AnchorVerifyResult>;
    private request;
    private toSearchParams;
}
//# sourceMappingURL=client.d.ts.map