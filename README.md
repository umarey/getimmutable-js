# @getimmutable/sdk

TypeScript SDK for the [Immutable](https://getimmutable.com) Audit Log API. Zero dependencies — uses native `fetch`.

## Installation

```bash
npm install @getimmutable/sdk
```

Requires Node.js 18+ or any modern browser.

## Quick Start

```typescript
import { Immutable } from '@getimmutable/sdk';

const immutable = new Immutable({
  apiKey: 'imk_your_api_key',
  baseUrl: 'https://your-instance.up.railway.app',
});
```

## Track Events

```typescript
// Simple event
await immutable
  .actor({ id: 'user_123', name: 'Jane Smith' })
  .track('invoice.created', 'Invoice');

// With metadata + targets
await immutable
  .actor({ id: 'user_123', name: 'Jane' })
  .target('Account', 'acc_source', 'Savings')
  .target('Account', 'acc_dest', 'Checking')
  .session('sess_abc123')
  .idempotencyKey('transfer_456')
  .track('transfer.completed', { type: 'Transfer', id: 'txn_789', name: 'Wire Transfer' }, {
    amount: 500,
    currency: 'USD',
  });
```

## Batch Events

```typescript
await immutable.client.trackBatch([
  { actor_id: 'user_1', action: 'page.viewed', session_id: 'sess_1' },
  { actor_id: 'user_1', action: 'button.clicked', session_id: 'sess_1' },
]);
```

## Query Events

```typescript
const { data, pagination } = await immutable.events.list({
  action: 'invoice.*',
  from: '2026-01-01',
  limit: 25,
});

const event = await immutable.events.get('event-uuid');
```

## Verify Hash Chain

```typescript
const result = await immutable.events.verify('2026-01-01', '2026-03-01');
console.log(result.valid); // true
```

## Alerts

```typescript
const alerts = await immutable.alerts.list({ rule_type: 'new_country' });
```

## Exports

```typescript
const { id } = await immutable.events.createExport({ from: '2026-01-01', to: '2026-03-01' });

// Poll for completion
const status = await immutable.events.getExport(id);
if (status.data.download_url) {
  // Download CSV
}
```

## Next.js B2C Pattern

The SDK is designed for server-side use. The browser never touches Immutable directly — everything goes through your server. Here's the complete B2C flow for Next.js:

### 1. Track events in Server Actions

```typescript
// app/actions/track.ts
'use server';
import { getServerSession } from 'next-auth';
import { immutable } from '@/lib/immutable'; // your singleton instance

export async function trackUserAction(action: string, metadata?: Record<string, unknown>) {
  const session = await getServerSession();
  if (!session?.user) return;

  await immutable
    .actor({ id: session.user.id, name: session.user.name })
    .session(session.sessionToken)
    .track(action, undefined, metadata);
}
```

### 2. Generate viewer tokens on the server

```typescript
// app/api/viewer-token/route.ts
import { getServerSession } from 'next-auth';
import { immutable } from '@/lib/immutable';

export async function GET() {
  const session = await getServerSession();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // Token is scoped to the user's org — they can only see their own events
  const response = await immutable.client.createViewerToken({
    tenantId: session.user.orgId,
    ttl: 3600,
  });

  return Response.json(response);
}
```

### 3. Render the activity feed on the client

```tsx
// app/components/activity-feed.tsx
'use client';

export function ActivityFeed({ token }: { token: string }) {
  return <audit-log-viewer token={token} theme="dark" />;
}
```

**The pattern:** User action in browser → hits your Next.js server → server calls Immutable SDK → event stored, alerts evaluated, session tracked → viewer reads back via scoped JWT. The browser never touches Immutable directly.

## Error Handling

```typescript
import { ImmutableError } from '@getimmutable/sdk';

try {
  await immutable.actor({ id: 'user_1' }).track('test');
} catch (error) {
  if (error instanceof ImmutableError) {
    console.log(error.statusCode);    // 422
    console.log(error.responseBody);   // { error: '...', violations: [...] }
  }
}
```

## License

MIT
