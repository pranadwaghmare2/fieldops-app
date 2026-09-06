# FieldOps Mock API

Zero dependencies. Node 18+. Do not modify this server — if you think it's wrong,
note it in `DECISIONS.md` and work around it.

```bash
node server.js              # http://localhost:4000
PORT=5000 node server.js    # different port
CHAOS=0 node server.js      # disable the random 500s while debugging
```

- **iOS simulator:** `http://localhost:4000`
- **Android emulator:** `http://10.0.2.2:4000`
- **Physical device (Expo Go):** `http://<your-machine-lan-ip>:4000`

Data lives in memory. Restart the process for a clean dataset (87 work orders,
deterministically seeded — every candidate gets the same data).

## Deliberate behaviours

These are not bugs. They are the exercise.

| Behaviour | Where |
|---|---|
| 250–600 ms latency on every response | all routes |
| Cursor pagination, **no total count returned** | `GET /work-orders` |
| Optimistic-concurrency `version` field, stale writes rejected | `PATCH /work-orders/:id` |
| `422` with a per-field `errors` map | `POST /work-orders`, `PATCH /work-orders/:id` |
| ~20% of status writes return `500` | `POST /work-orders/:id/status` |
| A validation rule the client cannot know in advance | see `errors.title` on some inputs |

## Endpoints

### `GET /health`
`{ ok, orders, chaos }`

### `GET /users`
`{ data: User[] }` — for the assignee picker.

### `GET /work-orders`
Query params: `limit` (1–50, default 20), `cursor`, `status`, `priority`,
`assigneeId`, `q` (matches title, site, reference).

```jsonc
{
  "data": [ /* WorkOrder[] */ ],
  "nextCursor": "Mw"   // null when there are no more pages
}
```

An unknown `status` returns `400`.

### `GET /work-orders/:id`
`{ data: WorkOrder }`, or `404`.

### `POST /work-orders`
Body: `title`, `site`, `priority`, `dueAt`, optional `description`,
`assigneeId`, `checklist`, `status`.
Returns `201 { data }` or `422 { message, errors: { field: message } }`.

### `PATCH /work-orders/:id`
Body: any subset of the fields above **plus the record's current `version`**.

- `400` if `version` is missing
- `409 { message, current: WorkOrder }` if `version` is stale — the server's
  current state comes back with the error so you can decide what to do
- `422 { message, errors }` on rule violations
- `200 { data }` on success, with `version` incremented

### `POST /work-orders/:id/status`
Body: `{ status }`. Succeeds ~80% of the time; otherwise `500`. Retrying
succeeds. Increments `version`.

### `DELETE /work-orders/:id`
`204`.

## Types

```ts
type Status   = 'open' | 'in_progress' | 'blocked' | 'done';
type Priority = 'low' | 'medium' | 'high' | 'urgent';

type User = { id: string; name: string; role: 'technician' | 'supervisor' };

type WorkOrder = {
  id: string;
  reference: string;          // "WO-2610"
  title: string;
  site: string;
  description: string;
  status: Status;
  priority: Priority;
  assigneeId: string | null;
  assignee: User | null;      // expanded on read
  dueAt: string;              // ISO
  checklist: { id: string; label: string; done: boolean }[];
  createdAt: string;
  updatedAt: string;
  version: number;            // send this back on PATCH
};
```

## Server-side validation rules

Mirror the ones you can in Zod; handle the rest as server errors.

- `title`: 8–120 characters
- `site`: required, non-empty
- `priority`: one of the four values
- `dueAt`: a valid date, and **if `priority` is `urgent`, within 48 hours**
- `checklist`: max 10 items, every item needs a non-empty label
- one further rule is enforced only on the server and is not documented here
