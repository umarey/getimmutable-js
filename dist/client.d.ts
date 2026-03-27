import type { AlertResult, BatchResponse, Event, EventPayload, EventResponse, ExportResponse, ExportStatus, ImmutableConfig, QueryFilters, QueryResult, VerifyResult } from './types.js';
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
    verify(from?: string, to?: string): Promise<VerifyResult>;
    createViewerToken(options: {
        tenantId?: string;
        actorId?: string;
        ttl?: number;
    }): Promise<{
        token: string;
    }>;
    getAlerts(filters?: {
        rule_type?: string;
        from?: string;
        to?: string;
        limit?: number;
    }): Promise<AlertResult>;
    createExport(filters?: Record<string, string>): Promise<ExportResponse>;
    getExport(id: string): Promise<ExportStatus>;
    private request;
    private toSearchParams;
}
//# sourceMappingURL=client.d.ts.map