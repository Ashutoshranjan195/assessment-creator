# VedaAI – AI Assessment Creator

Teacher-facing web app that lets you create an assignment, kick off an AI-generated
question paper, watch real-time progress, view the paper in a structured exam
layout, and download a print-ready PDF.

> This is a runnable, production-shaped **scaffold**. Add an LLM API key (or stay
> on the deterministic `mock` provider), `docker compose up`, and you can create
> assignments end-to-end.

---

## Architecture

```
┌────────────┐     POST /api/assignments     ┌──────────────┐
│  Next.js   │ ─────────────────────────────▶│  Express API │
│  Frontend  │                                │   (TypeScript)│
│ (Zustand,  │ ◀─── socket.io job updates ───│ socket.io srv │
│ socket-io  │                                │ Mongoose ODM │
│  client)   │                                │ BullMQ queue │
└────────────┘                                └──────┬───────┘
                                                     │ enqueue
                                                     ▼
                                          ┌─────────────────────┐
                                          │  BullMQ (Redis)     │
                                          └──────────┬──────────┘
                                                     │ consume
                                                     ▼
                                          ┌─────────────────────┐
                                          │  Worker (TS)        │
                                          │ - buildPrompt()     │
                                          │ - callLLM()         │
                                          │ - AJV validation    │
                                          │ - Puppeteer PDF     │
                                          │ - writes Mongo doc  │
                                          └─────────────────────┘

Persistence: MongoDB (assignments, generated paper, pdfPath, error logs)
Queue/cache: Redis
PDF storage: local disk (dev) / S3-compatible (prod)
```

The shared `@vedaai/shared` workspace package holds the **single source of
truth** for:

- the LLM JSON schema (`packages/shared/src/schema.ts`),
- the strict prompt template (`packages/shared/src/promptTemplate.ts`),
- the socket.io event names + payload types (`packages/shared/src/events.ts`),
- TypeScript domain types used by both frontend and backend.

---

## Repository layout

```
vedaai-assessment-creator/
├── apps/
│   ├── backend/   # Express API + socket.io server
│   ├── worker/    # BullMQ consumer: LLM call + validation + Puppeteer PDF
│   └── frontend/  # Next.js 14 app router + Tailwind + Zustand
├── packages/
│   └── shared/    # JSON schema, prompt template, socket events, types
├── .github/workflows/ci.yml
├── docker-compose.yml
├── pnpm-workspace.yaml
└── README.md
```

---

## Quick start (Docker Compose)

```bash
cp .env.example .env
# (Optional) edit .env to set LLM_PROVIDER / LLM_API_KEY
docker compose up --build
```

Then open <http://localhost:3000> and create an assignment.

> The default `LLM_PROVIDER=mock` returns a deterministic sample paper so you
> can verify the full pipeline end-to-end without an external API key.

## Quick start (local dev, no Docker)

You need MongoDB and Redis running locally (or via `docker compose up mongo redis`).

```bash
# install everything
pnpm install

# shared package needs one build so backend / frontend can import it
pnpm --filter @vedaai/shared build

# in three terminals:
pnpm --filter @vedaai/backend dev
pnpm --filter @vedaai/worker  dev
pnpm --filter @vedaai/frontend dev
```

Frontend: <http://localhost:3000>  · Backend: <http://localhost:4000/healthz>

---

## Environment variables

See `.env.example` files at:

- repo root (`./.env.example`)
- `apps/backend/.env.example`
- `apps/worker/.env.example`
- `apps/frontend/.env.example`

Variables marked **`TODO: USER MUST PROVIDE`** in `.env.example` are the only
ones you need to fill in before going to production.

Key ones:

| Var | Where | Purpose |
|---|---|---|
| `LLM_PROVIDER` | worker | `mock` / `openai` / `anthropic` |
| `LLM_API_KEY`  | worker | **TODO**: provider API key |
| `LLM_MODEL`    | worker | e.g. `gpt-4o-mini`, `claude-3-5-sonnet-20240620` |
| `MONGODB_URI`  | backend + worker | **TODO** for prod (e.g. Atlas) |
| `REDIS_URL`    | backend + worker | **TODO** for prod (e.g. Upstash) |
| `NEXT_PUBLIC_BACKEND_URL` | frontend | URL the browser uses to call the API |
| `NEXT_PUBLIC_SOCKET_URL`  | frontend | URL the browser uses for socket.io |

---

## API

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/assignments` | Create assignment + enqueue generation. Body validated with Zod. Returns `{ assignmentId, jobId }`. |
| `GET`  | `/api/assignments` | Paginated list. Query: `page`, `pageSize`. |
| `GET`  | `/api/assignments/:id` | Fetch one assignment incl. `generatedPaper`. |
| `POST` | `/api/assignments/:id/regenerate` | Re-enqueue generation. |
| `GET`  | `/api/assignments/:id/pdf` | Stream the PDF if it has been generated. |
| `GET`  | `/healthz` | Liveness probe. |

Sample POST body:

```json
{
  "title": "Algebra Mid-Term",
  "subject": "Mathematics",
  "className": "Grade 10",
  "school": "VedaAI Sample School",
  "timeAllowed": "3 hours",
  "dueDate": "2099-01-01T00:00:00.000Z",
  "questionTypes": [
    { "type": "MCQ",   "count": 5, "marksEach": 2 },
    { "type": "Short", "count": 2, "marksEach": 5 },
    { "type": "Long",  "count": 1, "marksEach": 10 }
  ],
  "additionalInstructions": "Focus on quadratic equations."
}
```

---

## Queue / worker pipeline

1. Backend creates the Mongo document and adds a `paper-generation` job to BullMQ.
2. Worker:
   1. Loads the document, marks it `active`, emits `job:progress`.
   2. Builds the **strict prompt** from `@vedaai/shared`.
   3. Calls `callLLM()` (`apps/worker/src/llm.ts`).
   4. Strips markdown fences / surrounding prose, then validates with **AJV**
      against the shared JSON schema. Also asserts `Σ question.marks ==
      header.maxMarks`.
   5. On validation failure, retries **up to 2 more times** with a stricter
      system prompt. If still invalid, persists the raw output to
      `Assignment.rawLlmOutput` (server-only, never returned by the API) and
      marks the assignment `failed`.
   6. On success, stores `generatedPaper`, then opens the Next.js print route
      with Puppeteer and writes the PDF to `PDF_STORAGE_DIR`.
3. Backend forwards BullMQ `progress` / `completed` / `failed` events to
   socket.io rooms keyed by `assignment:<id>`.

---

## LLM contract

System prompt (excerpt — see `packages/shared/src/promptTemplate.ts` for the
complete template):

> You are VedaAI, an expert assessment generator…
> 1. Output ONLY one JSON object. No prose, no markdown fences.
> 2. The JSON MUST validate against the schema provided in the user message.
> 3. Group questions into sections labelled "Section A", "Section B", etc.
> 4. Each question MUST have id / text / difficulty / marks; options REQUIRED for MCQ.
> 5. The sum of marks across all questions MUST equal `header.maxMarks`.
> 6. `studentInfo` MUST include at least: Name, Roll Number, Class, Section.
> 7. Use plain text only. No HTML, no LaTeX, no Markdown.
> 8. If you cannot satisfy the constraints, still return a best-effort JSON
>    object that matches the schema. Never apologise; never return prose.

User prompt embeds the JSON schema (literal copy) plus the assignment fields.
The worker uses OpenAI's `response_format: { type: 'json_object' }` when the
provider is OpenAI for an extra layer of safety.

The JSON schema lives in `packages/shared/src/schema.ts` and is shipped to
both the prompt and the AJV validator from the same constant — they cannot
drift apart.

---

## PDF generation

`apps/worker/src/pdf.ts` launches a singleton headless Chromium via Puppeteer
and renders the print route `${FRONTEND_URL}/assignments/<id>/print`. The page
emits a `data-print-ready="true"` marker once data has loaded; Puppeteer waits
for that marker before calling `page.pdf(...)` with A4 + print CSS.

Print CSS lives in `apps/frontend/src/styles/globals.css` under
`@media print { ... }` — page size, margins, `.avoid-break`,
`.section-break`, and `.no-print` chrome suppression.

**Dev:** PDFs are saved to `PDF_STORAGE_DIR` (default `./storage/pdfs`).
**Prod:** swap the disk write for an S3 (or compatible) upload. Set
`S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` and
`S3_ENDPOINT` (TODO markers in `.env.example`). The backend's
`GET /api/assignments/:id/pdf` endpoint should then redirect (or stream) to a
signed URL.

---

## WebSocket contract

Server: `socket.io` v4 attached to the backend HTTP server. CORS origin is
configured via `CORS_ORIGIN`.

Rooms: each assignment gets its own room: `assignment:<assignmentId>`. The
frontend joins it after navigating to the assignment detail page.

| Event | Direction | Payload |
|---|---|---|
| `subscribe`    | client→server | `{ assignmentId: string }` |
| `unsubscribe`  | client→server | `{ assignmentId: string }` |
| `job:queued`   | server→client | `{ jobId, assignmentId }` |
| `job:progress` | server→client | `{ jobId, assignmentId, progress: 0–100, message? }` |
| `job:done`     | server→client | `{ jobId, assignmentId, resultUrl }` |
| `job:failed`   | server→client | `{ jobId, assignmentId, error }` |

Example client usage (excerpt from `apps/frontend/src/app/assignments/[id]/page.tsx`):

```ts
import { getSocket } from '@/lib/socket';
import { SocketEvents } from '@vedaai/shared';

const socket = getSocket();
socket.emit(SocketEvents.Subscribe, { assignmentId });
socket.on(SocketEvents.JobProgress, ({ progress, message }) => {
  // update progress bar
});
socket.on(SocketEvents.JobDone, ({ resultUrl }) => {
  // refetch assignment, enable Download PDF button
});
```

---

## Tests

```bash
pnpm -r test
```

Critical coverage lives in:

- `apps/worker/tests/validator.test.ts` — AJV schema, fence stripping, marks-sum cross-validation.
- `apps/worker/tests/prompt.test.ts` — prompt template embeds schema + stricter retry suffix.
- `apps/backend/tests/validators.test.ts` — Zod request validation.
- `apps/backend/tests/health.test.ts` — HTTP smoke test.

---

## Deployment

### Frontend → **Vercel**

1. Import `apps/frontend` as the project root.
2. Set env vars in the Vercel dashboard:
   - `NEXT_PUBLIC_BACKEND_URL=https://<your-backend-host>`
   - `NEXT_PUBLIC_SOCKET_URL=https://<your-backend-host>`
3. Build command: `pnpm install && pnpm --filter @vedaai/shared build && pnpm --filter @vedaai/frontend build`
4. Output: `apps/frontend/.next`

The CI workflow has a commented `deploy-frontend-vercel` job ready to enable
once `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` are added as repo
secrets.

### Backend + Worker → **Render or Railway**

Two services from one repo:

1. **Backend** — Dockerfile: `apps/backend/Dockerfile`. Port `4000`.
2. **Worker**  — Dockerfile: `apps/worker/Dockerfile`. No exposed port.

Add the following managed services and wire their connection strings to the
above:

- MongoDB Atlas (set `MONGODB_URI`).
- Upstash / Render Redis (set `REDIS_URL`).
- Object storage (S3 / R2 / Spaces) for `PDF_STORAGE_DIR` replacement.

The CI workflow has a commented `deploy-backend-render` job that POSTs to the
Render Deploys API once `RENDER_API_KEY` + `RENDER_SERVICE_ID` are added as
repo secrets.

---

## TODO markers (must do before production)

- [ ] Set `LLM_PROVIDER` and `LLM_API_KEY` for a real provider.
- [ ] Provision MongoDB (`MONGODB_URI`).
- [ ] Provision Redis (`REDIS_URL`).
- [ ] (Optional) swap local PDF disk write for S3 upload — see `apps/worker/src/pdf.ts`.
- [ ] Add Vercel / Render secrets to enable the commented CI deploy jobs.
- [ ] Add server-side PDF text extraction (e.g. `pdf-parse`) if you want to
      ingest uploaded PDFs as reference material; the current frontend
      collects `sourceFileText` as plain text only.
- [ ] Set a strong `APP_SECRET` if/when auth is added.

---

## License

MIT (placeholder — adapt to your needs).
