import type { ImmutableClient } from './client.js';
import type { Actor, EventResponse, Target } from './types.js';
export declare class PendingEvent {
    private readonly client;
    private readonly actorData;
    private idempotencyKeyValue?;
    private versionValue?;
    private sessionValue?;
    private targetsValue;
    private actionCategoryValue?;
    constructor(client: ImmutableClient, actor: Actor);
    idempotencyKey(key: string): this;
    version(v: number): this;
    session(id: string): this;
    actionCategory(category: string): this;
    target(type: string, id?: string, name?: string, metadata?: Record<string, unknown>): this;
    targets(targets: Target[]): this;
    track(action: string, resource?: string | {
        type: string;
        id: string;
        name?: string;
    }, metadata?: Record<string, unknown>): Promise<EventResponse>;
}
//# sourceMappingURL=pending-event.d.ts.map