import { ImmutableClient } from './client.js';
import { PendingEvent } from './pending-event.js';
import type { Actor, AlertResult, Event, ExportFilters, ExportResponse, ExportStatus, ImmutableConfig, QueryFilters, QueryResult, VerifyResult } from './types.js';
export declare class Immutable {
    readonly client: ImmutableClient;
    constructor(config: ImmutableConfig);
    actor(actor: Actor): PendingEvent;
    get events(): {
        list(filters?: QueryFilters): Promise<QueryResult>;
        get(id: string): Promise<{
            data: Event;
        }>;
        verify(from?: string, to?: string, limit?: number): Promise<VerifyResult>;
        createExport(filters?: ExportFilters): Promise<ExportResponse>;
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