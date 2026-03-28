import { ImmutableError } from './errors.js';
export class ImmutableClient {
    apiKey;
    baseUrl;
    timeout;
    constructor(config) {
        this.apiKey = config.apiKey;
        this.baseUrl = config.baseUrl.replace(/\/$/, '');
        this.timeout = config.timeout ?? 5000;
    }
    async track(payload) {
        return this.request('POST', '/v1/events', payload);
    }
    async trackBatch(events) {
        return this.request('POST', '/v1/events/batch', { events });
    }
    async getEvents(filters) {
        const params = filters ? this.toSearchParams(filters) : '';
        return this.request('GET', `/v1/events${params ? `?${params}` : ''}`);
    }
    async getEvent(id) {
        return this.request('GET', `/v1/events/${id}`);
    }
    async verify(from, to, limit) {
        const params = new URLSearchParams();
        if (from)
            params.set('from', from);
        if (to)
            params.set('to', to);
        if (limit !== undefined)
            params.set('limit', String(limit));
        const qs = params.toString();
        return this.request('GET', `/v1/verify${qs ? `?${qs}` : ''}`);
    }
    async createViewerToken(options) {
        return this.request('POST', '/v1/viewer-token', {
            tenant_id: options.tenantId,
            actor_id: options.actorId,
            ttl: options.ttl,
        });
    }
    async getAlerts(filters) {
        const params = filters ? this.toSearchParams(filters) : '';
        return this.request('GET', `/v1/alerts${params ? `?${params}` : ''}`);
    }
    async createExport(filters) {
        return this.request('POST', '/v1/exports', filters);
    }
    async getExport(id) {
        return this.request('GET', `/v1/exports/${id}`);
    }
    async request(method, path, body) {
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
            const data = (await response.json());
            if (!response.ok) {
                throw new ImmutableError(data.error ?? `HTTP ${response.status}`, response.status, data);
            }
            return data;
        }
        catch (error) {
            if (error instanceof ImmutableError)
                throw error;
            if (error instanceof DOMException && error.name === 'AbortError') {
                throw new ImmutableError('Request timed out', 0);
            }
            throw new ImmutableError(error instanceof Error ? error.message : 'Unknown error', 0);
        }
        finally {
            clearTimeout(timeoutId);
        }
    }
    toSearchParams(obj) {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(obj)) {
            if (value !== undefined && value !== null) {
                params.set(key, String(value));
            }
        }
        return params.toString();
    }
}
//# sourceMappingURL=client.js.map