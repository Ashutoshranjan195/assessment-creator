// Smoke test for the HTTP layer. Does NOT touch Mongo/Redis — routes that
// require them are not exercised here; that is what e2e / docker compose runs
// cover. This keeps `pnpm test` fast and hermetic in CI.

import request from 'supertest';
import express from 'express';

// Build a minimal app mirroring createApp() but without the DB-bound router.
function buildHealthOnlyApp(): express.Express {
  const app = express();
  app.get('/healthz', (_req, res) => res.json({ ok: true }));
  return app;
}

describe('GET /healthz', () => {
  it('responds with { ok: true }', async () => {
    const res = await request(buildHealthOnlyApp()).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
