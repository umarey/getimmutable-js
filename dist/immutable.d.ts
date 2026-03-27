import { ImmutableClient } from './client.js';
import { PendingEvent } from './pending-event.js';
import type { Actor, AlertResult, Event, ExportResponse, ExportStatus, ImmutableConfig, QueryFilters, QueryResult, VerifyResult } from './types.js';
export declare class Immutable {
    readonly client: ImmutableClient;
    constructor(config: ImmutableConfig);
    actor(actor: Actor): PendingEvent;
    get events(): {
        list(filters?: QueryFilters): Promise<QueryResult>;
        get(id: string): Promise<{
            data: Event;
        }>;
        verify(from?: string, to?: string): Promise<VerifyResult>;
        createExport(filters?: Record<string, string>): Promise<ExportResponse>;
        getExport(id: string): Promise<ExportStatus>;
    };
    get alerts(): {
        list(filters?: {
            rule_type?: string;
            from?: string;
            to?: string;
            limit?: number;
        }): Promise<AlertResult>;
    };
}
//# sourceMappingURL=immutable.d.ts.map