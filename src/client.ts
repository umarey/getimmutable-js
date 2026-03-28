import { ImmutableError } from './errors.js';
import type {
  AlertResult,
  AnchorDetailResult,
  AnchorListResult,
  AnchorVerifyResult,
  BatchResponse,
  Event,
  EventPayload,
  EventResponse,
  ExportFilters,
  ExportResponse,
  ExportStatus,
  ImmutableConfig,
  QueryFilters,
  QueryResult,
  VerifyResult,
} from './types.js';

export class ImmutableClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(config: ImmutableConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.timeout = config.timeout ?? 5000;
  }

  async track(payload: EventPayload): Promise<EventResponse> {
    return this.request<EventResponse>('POST', '/v1/events', payload);
  }

  async trackBatch(events: EventPayload[]): Promise<BatchResponse> {
    return this.request<BatchResponse>('POST', '/v1/events/batch', { events });
  }

  async getEvents(filters?: QueryFilters): Promise<QueryResult> {
    const params = filters ? this.toSearchParams(filters as Record<string, unknown>) : '';
    return this.request<QueryResult>('GET', `/v1/events${params ? `?${params}` : ''}`);
  }

  async getEvent(id: string): Promise<{ data: Event }> {
    return this.request<{ data: Event }>('GET', `/v1/events/${id}`);
  }

  async verify(from?: string, to?: string, limit?: number): Promise<VerifyResult> {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (limit !== undefined) params.set('limit', String(limit));
    const qs = params.toString();
    return this.request<VerifyResult>('GET', `/v1/verify${qs ? `?${qs}` : ''}`);
  }

  async createViewerToken(options: { tenantId?: string; actorId?: string; ttl?: number }): Promise<{ token: string; expires_at: number }> {
    return this.request<{ token: string; expires_at: number }>('POST', '/v1/viewer-token', {
      tenant_id: options.tenantId,
      actor_id: options.actorId,
      ttl: options.ttl,
    });
  }

  async getAlerts(filters?: { rule_type?: string; from?: string; to?: string; limit?: number }): Promise<AlertResult> {
    const params = filters ? this.toSearchParams(filters) : '';
    return this.request<AlertResult>('GET', `/v1/alerts${params ? `?${params}` : ''}`);
  }

  async createExport(filters?: ExportFilters): Promise<ExportResponse> {
    return this.request<ExportResponse>('POST', '/v1/exports', filters);
  }

  async getExport(id: string): Promise<ExportStatus> {
    return this.request<ExportStatus>('GET', `/v1/exports/${id}`);
  }

  // ── Anchors ──────────────────────────────────────────────────────

  async getAnchors(limit?: number): Promise<AnchorListResult> {
    const params = limit ? `?limit=${limit}` : '';
    return this.request<AnchorListResult>('GET', `/v1/anchors${params}`);
  }

  async getAnchor(id: string): Promise<AnchorDetailResult> {
    return this.request<AnchorDetailResult>('GET', `/v1/anchors/${id}`);
  }

  async verifyAnchor(id: string): Promise<AnchorVerifyResult> {
    return this.request<AnchorVerifyResult>('GET', `/v1/anchors/${id}/verify`);
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/api${path}`, {
        method,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const data = (await response.json()) as Record<string, unknown>;

      if (!response.ok) {
        throw new ImmutableError(
          (data.error as string) ?? `HTTP ${response.status}`,
          response.status,
          data,
        );
      }

      return data as T;
    } catch (error) {
      if (error instanceof ImmutableError) throw error;
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ImmutableError('Request timed out', 0);
      }
      throw new ImmutableError(
        error instanceof Error ? error.message : 'Unknown error',
        0,
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private toSearchParams(obj: Record<string, unknown>): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    }
    return params.toString();
  }
}
