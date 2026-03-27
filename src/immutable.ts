import { ImmutableClient } from './client.js';
import { PendingEvent } from './pending-event.js';
import type {
  Actor,
  AlertResult,
  Event,
  ExportFilters,
  ExportResponse,
  ExportStatus,
  ImmutableConfig,
  QueryFilters,
  QueryResult,
  VerifyResult,
} from './types.js';

export class Immutable {
  public readonly client: ImmutableClient;

  constructor(config: ImmutableConfig) {
    this.client = new ImmutableClient(config);
  }

  actor(actor: Actor): PendingEvent {
    return new PendingEvent(this.client, actor);
  }

  get events() {
    const client = this.client;
    return {
      list(filters?: QueryFilters): Promise<QueryResult> {
        return client.getEvents(filters);
      },
      get(id: string): Promise<{ data: Event }> {
        return client.getEvent(id);
      },
      verify(from?: string, to?: string, limit?: number): Promise<VerifyResult> {
        return client.verify(from, to, limit);
      },
      createExport(filters?: ExportFilters): Promise<ExportResponse> {
        return client.createExport(filters);
      },
      getExport(id: string): Promise<ExportStatus> {
        return client.getExport(id);
      },
    };
  }

  get alerts() {
    const client = this.client;
    return {
      list(filters?: { rule_type?: string; from?: string; to?: string; limit?: number }): Promise<AlertResult> {
        return client.getAlerts(filters);
      },
    };
  }
}
