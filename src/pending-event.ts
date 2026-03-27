import type { ImmutableClient } from './client.js';
import type { Actor, EventPayload, EventResponse, Target } from './types.js';

export class PendingEvent {
  private readonly actorData: Actor;
  private idempotencyKeyValue?: string;
  private versionValue?: number;
  private sessionValue?: string;
  private targetsValue: Target[] = [];
  private actionCategoryValue?: string;

  constructor(
    private readonly client: ImmutableClient,
    actor: Actor,
  ) {
    this.actorData = actor;
  }

  idempotencyKey(key: string): this {
    this.idempotencyKeyValue = key;
    return this;
  }

  version(v: number): this {
    this.versionValue = v;
    return this;
  }

  session(id: string): this {
    this.sessionValue = id;
    return this;
  }

  actionCategory(category: string): this {
    this.actionCategoryValue = category;
    return this;
  }

  target(type: string, id?: string, name?: string, metadata?: Record<string, unknown>): this {
    this.targetsValue.push({ type, id, name, metadata });
    return this;
  }

  targets(targets: Target[]): this {
    this.targetsValue = targets;
    return this;
  }

  async track(
    action: string,
    resource?: string | { type: string; id: string; name?: string },
    metadata?: Record<string, unknown>,
  ): Promise<EventResponse> {
    const payload: EventPayload = {
      actor_id: this.actorData.id,
      action,
    };

    if (this.actorData.name) payload.actor_name = this.actorData.name;
    if (this.actorData.type) payload.actor_type = this.actorData.type;

    if (typeof resource === 'string') {
      payload.resource = resource;
    } else if (resource) {
      payload.resource = resource.type;
      payload.resource_id = resource.id;
      if (resource.name) payload.resource_name = resource.name;
    }

    if (this.actionCategoryValue) payload.action_category = this.actionCategoryValue;
    if (metadata && Object.keys(metadata).length > 0) payload.metadata = metadata;
    if (this.targetsValue.length > 0) payload.targets = this.targetsValue;
    if (this.idempotencyKeyValue) payload.idempotency_key = this.idempotencyKeyValue;
    if (this.versionValue) payload.version = this.versionValue;
    if (this.sessionValue) payload.session_id = this.sessionValue;

    return this.client.track(payload);
  }
}
