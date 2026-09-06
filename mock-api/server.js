#!/usr/bin/env node
/**
 * FieldOps Mock API — zero dependencies, Node 18+.
 *
 *   node server.js            # listens on 4000
 *   PORT=5000 node server.js  # custom port
 *   CHAOS=0 node server.js    # disable random 500s (for debugging only)
 *
 * Deliberate characteristics — these are the point of the exercise:
 *   - every response is delayed 250-600ms
 *   - list endpoint is CURSOR paginated, never returns a total count
 *   - PATCH requires the record's `version`; a stale version returns 409 + server state
 *   - POST/PATCH return 422 with per-field errors for business-rule violations
 *   - status transitions fail with a 500 about 20% of the time (retry succeeds)
 */

const http = require('node:http');
const { randomUUID } = require('node:crypto');

const PORT = Number(process.env.PORT || 4000);
const CHAOS = process.env.CHAOS !== '0';

/* ------------------------------------------------------------------ seed -- */

// Deterministic PRNG so every candidate gets the identical dataset.
let seed = 1337;
const rand = () => {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
};
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

const TECHNICIANS = [
  { id: 'u_01', name: 'Priya Raman', role: 'technician' },
  { id: 'u_02', name: 'Daniel Osei', role: 'technician' },
  { id: 'u_03', name: 'Mei-Ling Chen', role: 'technician' },
  { id: 'u_04', name: 'Tomás Rivera', role: 'supervisor' },
  { id: 'u_05', name: 'Aarav Deshmukh', role: 'technician' },
  { id: 'u_06', name: 'Hannah Nowak', role: 'supervisor' },
];

const SITES = [
  'Pier 4 Cold Store', 'North Ridge Substation', 'Kettle Bridge Pumphouse',
  'Dock 12 Conveyor Hall', 'Aldgate Chiller Plant', 'Marsh Lane Depot',
  'Tay Valley Wind Farm', 'Harbour Point Lift Station',
];

const ASSETS = [
  'Compressor A3', 'Chiller Unit 7', 'Conveyor Belt 2', 'Backup Generator',
  'HVAC Rooftop 1', 'Pump Skid B', 'Transformer T12', 'Loading Dock Leveller',
];

const FAULTS = [
  'Intermittent overheating under load',
  'Abnormal vibration reported by night shift',
  'Pressure drop across the primary loop',
  'Control panel showing E-04 fault code',
  'Coolant leak at the inlet flange',
  'Belt tracking off-centre, edge fraying',
  'Fails to restart after power cycle',
  'Excessive noise above 60% duty',
];

const STATUSES = ['open', 'in_progress', 'blocked', 'done'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const DAY = 86400000;
const now = Date.now();

/** @type {Map<string, any>} */
const orders = new Map();

for (let i = 0; i < 87; i++) {
  const id = `wo_${String(i + 1).padStart(4, '0')}`;
  const createdAt = new Date(now - Math.floor(rand() * 40 * DAY)).toISOString();
  const priority = pick(PRIORITIES);
  const status = pick(STATUSES);
  const assignee = rand() > 0.15 ? pick(TECHNICIANS) : null;
  orders.set(id, {
    id,
    reference: `WO-${2600 + i}`,
    title: `${pick(ASSETS)} — ${pick(FAULTS)}`,
    site: pick(SITES),
    description:
      'Reported by site team. Confirm the fault, capture readings before and after any intervention, and photograph the nameplate if the asset register looks out of date.',
    status,
    priority,
    assigneeId: assignee ? assignee.id : null,
    dueAt: new Date(now + Math.floor((rand() - 0.35) * 20 * DAY)).toISOString(),
    checklist: Array.from({ length: Math.floor(rand() * 4) }, (_, k) => ({
      id: `ck_${i}_${k}`,
      label: pick([
        'Isolate and lock off',
        'Record inlet/outlet pressure',
        'Inspect seals for wear',
        'Torque check on mounting bolts',
        'Photograph nameplate',
      ]),
      done: rand() > 0.6,
    })),
    createdAt,
    updatedAt: createdAt,
    version: 1,
  });
}

/* ------------------------------------------------------------- utilities -- */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const latency = () => 250 + Math.floor(Math.random() * 350);

function send(res, status, body) {
  const payload = body === undefined ? '' : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Cache-Control': 'no-store',
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => {
      raw += c;
      if (raw.length > 1e6) reject(new Error('payload too large'));
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('invalid json'));
      }
    });
  });
}

const encodeCursor = (n) => Buffer.from(String(n)).toString('base64url');
const decodeCursor = (c) => {
  if (!c) return 0;
  const n = Number(Buffer.from(c, 'base64url').toString('utf8'));
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

const withAssignee = (o) => ({
  ...o,
  assignee: o.assigneeId ? TECHNICIANS.find((t) => t.id === o.assigneeId) ?? null : null,
});

/**
 * Shared write-time business rules. Returns a field->message map.
 * These exist so the client has to map server-side errors back onto form fields
 * rather than showing a generic toast.
 */
function validate(input, { partial = false } = {}) {
  const errors = {};
  const has = (k) => Object.prototype.hasOwnProperty.call(input, k);

  if (!partial || has('title')) {
    const title = (input.title ?? '').trim();
    if (title.length < 8) errors.title = 'Title must be at least 8 characters.';
    else if (title.length > 120) errors.title = 'Title must be 120 characters or fewer.';
  }

  if (!partial || has('priority')) {
    if (!PRIORITIES.includes(input.priority))
      errors.priority = `Priority must be one of: ${PRIORITIES.join(', ')}.`;
  }

  if (!partial || has('status')) {
    if (has('status') && !STATUSES.includes(input.status))
      errors.status = `Status must be one of: ${STATUSES.join(', ')}.`;
  }

  if (!partial || has('site')) {
    if (!(input.site ?? '').trim()) errors.site = 'Site is required.';
  }

  if (has('assigneeId') && input.assigneeId !== null) {
    if (!TECHNICIANS.some((t) => t.id === input.assigneeId))
      errors.assigneeId = 'Unknown assignee.';
  }

  if (!partial || has('dueAt')) {
    const due = input.dueAt ? Date.parse(input.dueAt) : NaN;
    if (Number.isNaN(due)) {
      errors.dueAt = 'A valid due date is required.';
    } else if (input.priority === 'urgent' && due - Date.now() > 2 * DAY) {
      // Cross-field rule: mirrored client-side in zod, enforced again here.
      errors.dueAt = 'Urgent work orders must be due within 48 hours.';
    }
  }

  if (has('checklist')) {
    if (!Array.isArray(input.checklist)) errors.checklist = 'Checklist must be a list.';
    else if (input.checklist.length > 10) errors.checklist = 'Maximum of 10 checklist items.';
    else if (input.checklist.some((c) => !(c?.label ?? '').trim()))
      errors.checklist = 'Every checklist item needs a label.';
  }

  // Deliberate server-only rule the client cannot know in advance.
  if ((input.title ?? '').toLowerCase().includes('asbestos')) {
    errors.title = 'Asbestos work must be raised through the compliance system, not FieldOps.';
  }

  return errors;
}

/* ---------------------------------------------------------------- routes -- */

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const method = req.method.toUpperCase();

  if (method === 'OPTIONS') return send(res, 204);
  await sleep(latency());

  try {
    /* ---- health ---- */
    if (method === 'GET' && path === '/health') {
      return send(res, 200, { ok: true, orders: orders.size, chaos: CHAOS });
    }

    /* ---- reset (handy while developing; not part of the brief's happy path) ---- */
    if (method === 'POST' && path === '/__reset') {
      return send(res, 200, { ok: true, note: 'Restart the process for a clean dataset.' });
    }

    /* ---- users ---- */
    if (method === 'GET' && path === '/users') {
      return send(res, 200, { data: TECHNICIANS });
    }

    /* ---- list ---- */
    if (method === 'GET' && path === '/work-orders') {
      const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 20), 1), 50);
      const offset = decodeCursor(url.searchParams.get('cursor'));
      const status = url.searchParams.get('status');
      const priority = url.searchParams.get('priority');
      const assigneeId = url.searchParams.get('assigneeId');
      const q = (url.searchParams.get('q') || '').trim().toLowerCase();

      if (status && !STATUSES.includes(status))
        return send(res, 400, { message: `Unknown status "${status}".` });

      let rows = [...orders.values()];
      if (status) rows = rows.filter((o) => o.status === status);
      if (priority) rows = rows.filter((o) => o.priority === priority);
      if (assigneeId) rows = rows.filter((o) => o.assigneeId === assigneeId);
      if (q)
        rows = rows.filter(
          (o) =>
            o.title.toLowerCase().includes(q) ||
            o.site.toLowerCase().includes(q) ||
            o.reference.toLowerCase().includes(q),
        );

      rows.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

      const page = rows.slice(offset, offset + limit);
      const nextOffset = offset + limit;
      return send(res, 200, {
        data: page.map(withAssignee),
        // No total count, on purpose: the client cannot precompute page count.
        nextCursor: nextOffset < rows.length ? encodeCursor(nextOffset) : null,
      });
    }

    /* ---- create ---- */
    if (method === 'POST' && path === '/work-orders') {
      const body = await readBody(req);
      const errors = validate(body);
      if (Object.keys(errors).length)
        return send(res, 422, { message: 'Validation failed.', errors });

      const id = `wo_${randomUUID().slice(0, 8)}`;
      const ts = new Date().toISOString();
      const record = {
        id,
        reference: `WO-${2600 + orders.size + 1}`,
        title: body.title.trim(),
        site: body.site.trim(),
        description: body.description ?? '',
        status: body.status ?? 'open',
        priority: body.priority,
        assigneeId: body.assigneeId ?? null,
        dueAt: new Date(body.dueAt).toISOString(),
        checklist: (body.checklist ?? []).map((c, i) => ({
          id: c.id ?? `ck_${id}_${i}`,
          label: c.label.trim(),
          done: Boolean(c.done),
        })),
        createdAt: ts,
        updatedAt: ts,
        version: 1,
      };
      orders.set(id, record);
      return send(res, 201, { data: withAssignee(record) });
    }

    /* ---- single-record routes ---- */
    const detail = path.match(/^\/work-orders\/([^/]+)$/);
    const statusRoute = path.match(/^\/work-orders\/([^/]+)\/status$/);
    const id = detail?.[1] ?? statusRoute?.[1];

    if (id) {
      const record = orders.get(id);
      if (!record) return send(res, 404, { message: 'Work order not found.' });

      if (method === 'GET' && detail) {
        return send(res, 200, { data: withAssignee(record) });
      }

      if (method === 'PATCH' && detail) {
        const body = await readBody(req);

        if (body.version === undefined)
          return send(res, 400, {
            message: 'A `version` field is required on updates.',
          });

        if (body.version !== record.version) {
          // Optimistic-concurrency conflict. Server state is returned so the
          // client can decide: rebase, discard, or ask the user.
          return send(res, 409, {
            message: 'This work order changed since you loaded it.',
            current: withAssignee(record),
          });
        }

        const merged = { ...record, ...body };
        const errors = validate(merged);
        if (Object.keys(errors).length)
          return send(res, 422, { message: 'Validation failed.', errors });

        const updated = {
          ...merged,
          checklist: (merged.checklist ?? []).map((c, i) => ({
            id: c.id ?? `ck_${id}_${i}`,
            label: c.label.trim(),
            done: Boolean(c.done),
          })),
          dueAt: new Date(merged.dueAt).toISOString(),
          updatedAt: new Date().toISOString(),
          version: record.version + 1,
        };
        orders.set(id, updated);
        return send(res, 200, { data: withAssignee(updated) });
      }

      if (method === 'POST' && statusRoute) {
        const body = await readBody(req);
        if (!STATUSES.includes(body.status))
          return send(res, 422, {
            message: 'Validation failed.',
            errors: { status: `Status must be one of: ${STATUSES.join(', ')}.` },
          });

        // Flaky on purpose: an optimistic update must roll back, and a retry
        // must not corrupt the cache.
        if (CHAOS && Math.random() < 0.2)
          return send(res, 500, {
            message: 'Upstream dispatch service is unavailable. Try again.',
          });

        const updated = {
          ...record,
          status: body.status,
          updatedAt: new Date().toISOString(),
          version: record.version + 1,
        };
        orders.set(id, updated);
        return send(res, 200, { data: withAssignee(updated) });
      }

      if (method === 'DELETE' && detail) {
        orders.delete(id);
        return send(res, 204);
      }
    }

    return send(res, 404, { message: `No route for ${method} ${path}.` });
  } catch (err) {
    return send(res, 400, { message: err.message || 'Bad request.' });
  }
});

server.listen(PORT, () => {
  console.log(`FieldOps mock API listening on http://localhost:${PORT}`);
  console.log(`  ${orders.size} work orders seeded, ${TECHNICIANS.length} users`);
  console.log(`  chaos mode: ${CHAOS ? 'on (≈20% of status writes fail)' : 'off'}`);
  console.log(`  android emulator: use http://10.0.2.2:${PORT}`);
});
