import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImmutableClient } from '../src/client.js';
import { PendingEvent } from '../src/pending-event.js';
import { ImmutableError } from '../src/errors.js';
import { Immutable } from '../src/immutable.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function mockResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  };
}

describe('ImmutableClient', () => {
  let client: ImmutableClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new ImmutableClient({
      apiKey: 'imk_test_key',
      baseUrl: 'https://api.test.com',
    });
  });

  it('track sends correct payload', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ id: 'evt_1', status: 'queued' }, 202));

    const result = await client.track({
      actor_id: 'user_1',
      action: 'invoice.created',
    });

    expect(result.id).toBe('evt_1');
    expect(result.status).toBe('queued');

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('https://api.test.com/api/v1/events');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({
      actor_id: 'user_1',
      action: 'invoice.created',
    });
  });

  it('track batch sends array', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({
      events: [
        { id: 'evt_1', status: 'queued' },
        { id: 'evt_2', status: 'queued' },
      ],
    }, 202));

    const result = await client.trackBatch([
      { actor_id: 'user_1', action: 'a' },
      { actor_id: 'user_2', action: 'b' },
    ]);

    expect(result.events).toHaveLength(2);

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.events).toHaveLength(2);
  });

  it('auth header included', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ id: 'evt_1', status: 'queued' }, 202));

    await client.track({ actor_id: 'user_1', action: 'test' });

    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers['Authorization']).toBe('Bearer imk_test_key');
  });

  it('throws on 4xx', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ error: 'Validation failed' }, 422));

    await expect(client.track({ actor_id: 'user_1', action: 'test' }))
      .rejects
      .toThrow(ImmutableError);
  });

  it('throws on 5xx', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ error: 'Server error' }, 500));

    await expect(client.track({ actor_id: 'user_1', action: 'test' }))
      .rejects
      .toThrow(ImmutableError);
  });

  it('timeout aborts request', async () => {
    const slowClient = new ImmutableClient({
      apiKey: 'imk_test_key',
      baseUrl: 'https://api.test.com',
      timeout: 1,
    });

    mockFetch.mockImplementationOnce(() => new Promise((resolve) => setTimeout(resolve, 100)));

    await expect(slowClient.track({ actor_id: 'user_1', action: 'test' }))
      .rejects
      .toThrow(ImmutableError);
  });

  it('get events with filters', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({
      data: [],
      pagination: { has_more: false, next_cursor: null, total: 0 },
    }));

    await client.getEvents({ action: 'invoice.*', limit: 10 });

    const url = mockFetch.mock.calls[0][0];
    expect(url).toContain('action=invoice.*');
    expect(url).toContain('limit=10');
  });
});

describe('PendingEvent', () => {
  let client: ImmutableClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new ImmutableClient({
      apiKey: 'imk_test_key',
      baseUrl: 'https://api.test.com',
    });
  });

  it('builder chain works', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ id: 'evt_1', status: 'queued' }, 202));

    const event = new PendingEvent(client, { id: 'user_1', name: 'Jane' });

    await event
      .idempotencyKey('idem_1')
      .version(2)
      .session('sess_1')
      .target('Account', 'acc_1', 'Main')
      .track('transfer.completed', 'Transfer', { amount: 100 });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.actor_id).toBe('user_1');
    expect(body.actor_name).toBe('Jane');
    expect(body.action).toBe('transfer.completed');
    expect(body.resource).toBe('Transfer');
    expect(body.idempotency_key).toBe('idem_1');
    expect(body.version).toBe(2);
    expect(body.session_id).toBe('sess_1');
    expect(body.targets).toEqual([{ type: 'Account', id: 'acc_1', name: 'Main' }]);
    expect(body.metadata).toEqual({ amount: 100 });
  });

  it('resolves object resource', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ id: 'evt_1', status: 'queued' }, 202));

    const event = new PendingEvent(client, { id: 'user_1' });
    await event.track('invoice.created', { type: 'Invoice', id: 'inv_1', name: 'Invoice #42' });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.resource).toBe('Invoice');
    expect(body.resource_id).toBe('inv_1');
    expect(body.resource_name).toBe('Invoice #42');
  });

  it('actionCategory included in payload', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ id: 'evt_1', status: 'queued' }, 202));

    await new PendingEvent(client, { id: 'user_1' })
      .actionCategory('create')
      .track('invoice.created');

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.action_category).toBe('create');
  });

  it('target with metadata included in payload', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ id: 'evt_1', status: 'queued' }, 202));

    await new PendingEvent(client, { id: 'user_1' })
      .target('Account', 'acc_1', 'Main', { role: 'admin' })
      .track('account.updated');

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.targets).toEqual([{ type: 'Account', id: 'acc_1', name: 'Main', metadata: { role: 'admin' } }]);
  });

  it('idempotency key included', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ id: 'evt_1', status: 'queued' }, 202));

    await new PendingEvent(client, { id: 'user_1' })
      .idempotencyKey('unique_key')
      .track('test.action');

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.idempotency_key).toBe('unique_key');
  });
});

describe('Immutable', () => {
  it('actor returns PendingEvent', () => {
    const immutable = new Immutable({
      apiKey: 'imk_test',
      baseUrl: 'https://api.test.com',
    });

    const event = immutable.actor({ id: 'user_1' });
    expect(event).toBeInstanceOf(PendingEvent);
  });

  it('exposes events and alerts namespaces', () => {
    const immutable = new Immutable({
      apiKey: 'imk_test',
      baseUrl: 'https://api.test.com',
    });

    expect(immutable.events).toBeDefined();
    expect(immutable.events.list).toBeTypeOf('function');
    expect(immutable.alerts).toBeDefined();
    expect(immutable.alerts.list).toBeTypeOf('function');
  });
});

describe('Dist smoke test', () => {
  it('PendingEvent from dist has actionCategory and target with metadata', async () => {
    const { PendingEvent: DistPendingEvent } = await import('../dist/pending-event.js');

    expect(DistPendingEvent).toBeDefined();

    const client = new ImmutableClient({
      apiKey: 'imk_test',
      baseUrl: 'https://api.test.com',
    });

    const event = new DistPendingEvent(client, { id: 'user_1' });

    // actionCategory method exists and is chainable
    expect(typeof event.actionCategory).toBe('function');
    const result = event.actionCategory('create');
    expect(result).toBe(event);

    // target method accepts 4 args including metadata
    expect(typeof event.target).toBe('function');
    const result2 = event.target('Account', 'acc_1', 'Main', { role: 'admin' });
    expect(result2).toBe(event);
  });
});
