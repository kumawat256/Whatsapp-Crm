# WhatsApp CRM

Self-hosted WhatsApp CRM. No paid services, no cloud dependencies. Media is
stored on the local filesystem; WhatsApp connectivity goes through a
QR-based personal WhatsApp Web provider (added in Phase 4) behind a
`WhatsAppProvider` interface so another provider can be swapped in later.

> QR-based automation is not ban-proof or policy-safe. It is not an
> official WhatsApp Business API integration.

## Stack

- Frontend: React + TypeScript + Vite + Tailwind + shadcn/ui (`apps/web`)
- Backend: Node.js + NestJS + TypeScript (`apps/api`)
- DB: MySQL (via XAMPP locally) + Prisma
- Queue: database-backed (MySQL polling via `@nestjs/schedule`) — no Redis
- Realtime: Socket.IO
- Storage: local filesystem (`/storage`)
- Auth: JWT + refresh tokens
- Package manager: pnpm (workspaces)

## Local development

This machine runs everything natively: MySQL via XAMPP and the api/web dev
servers as host processes. No Docker.

Prerequisites already running on this machine:

- XAMPP MySQL (port 3306, `whatsapp_crm` database created, `root` has no
  password by default)

No Redis or other external queue/cache service is needed — the campaign
engine (Phase 8) polls MySQL directly.

### One-command setup

With MySQL already running and reachable (an empty `whatsapp_crm` database
doesn't need to exist yet — the migration step creates it):

```bash
pnpm setup
```

This installs every workspace's dependencies, creates `.env` and
`apps/api/.env` from their `.env.example` (with freshly generated JWT/session
secrets — never the example's placeholder values) if they don't already
exist, applies all Prisma migrations, and seeds roles/permissions + the
initial Super Admin login. Safe to re-run any time — existing `.env` files
are left untouched and the seed step is idempotent.

Then start both dev servers (two terminals):

```bash
pnpm dev:api   # http://localhost:3000  (health check: /health)
pnpm dev:web   # http://localhost:5174
```

### Manual setup

If you'd rather run each step yourself (e.g. to point `DATABASE_URL` at a
non-default MySQL setup before installing):

```bash
pnpm install
cp .env.example .env               # adjust if needed
cp apps/api/.env.example apps/api/.env
```

Apply migrations and seed roles/permissions + an admin user:

```bash
cd apps/api
pnpm prisma:migrate
pnpm db:seed
```

Seed creates two system roles (`Admin`, `Agent`) and one admin login:
`admin@whatsapp-crm.local` / `ChangeMe123!` (override via `SEED_ADMIN_EMAIL`
/ `SEED_ADMIN_PASSWORD` env vars). Change the password after first login —
there's no self-registration; admins create other users from `POST
/api/users`.

Run both apps (two terminals):

```bash
pnpm dev:api   # http://localhost:3000  (health: /health)
pnpm dev:web   # http://localhost:5174
```

## Data model

Full schema lives in [`apps/api/prisma/schema.prisma`](apps/api/prisma/schema.prisma):
Users/Roles/Permissions/RefreshTokens (Phase 2), Organizations,
WhatsAppAccounts/WhatsAppSessions, Contacts/Lists/ListMembers/Tags/ContactTags,
Conversations/Messages/Media, Templates, Campaigns/CampaignRecipients,
CreditWallet/CreditTransactions, Automations, Notifications, AuditLogs,
SystemSettings. `organizationId` is nullable throughout — this deployment
is single-tenant in practice, but multi-org support can be turned on later
without a schema rewrite. Business logic for each domain lands in its own
phase; Phase 3 is persistence only.

```bash
cd apps/api
pnpm prisma:migrate   # create + apply a new migration after editing schema.prisma
pnpm prisma:studio    # browse data
```

## WhatsApp connectivity

QR-based personal WhatsApp Web sessions via [Baileys](https://github.com/WhiskeySockets/Baileys),
behind a `WhatsAppProvider` interface (`src/whatsapp/interfaces/whatsapp-provider.interface.ts`)
so another provider (e.g. an official Business API integration) can be
swapped in later. **This is not an official WhatsApp Business API
integration, and QR automation is not ban-proof or policy-safe.**

- Session credentials are AES-256-GCM encrypted at rest under
  `storage/wa-sessions/<accountId>/` (`SESSION_ENCRYPTION_KEY` in env) —
  see `src/whatsapp/session-store/encrypted-file-auth-state.ts`.
- Connection lifecycle (`connect`/`disconnect`/status) is exposed via
  `POST /api/whatsapp/accounts/:id/connect` etc., gated by the
  `whatsapp.manage` permission.
- QR codes and status changes stream over Socket.IO (`/whatsapp`
  namespace, JWT-authenticated on handshake) rather than polling.
- Message send/receive isn't wired up yet — that lands with the inbox
  phase, reusing the same provider interface.

## Contacts, Lists, Tags

Full CRUD behind three permissions (`contacts.manage`, `lists.manage`,
`tags.manage`) — granted to both `Admin` and `Agent` by seed, unlike the
admin-only WhatsApp permission, since this is day-to-day CRM work.

- `Contact.phoneNumber` is globally unique (see the comment in
  `schema.prisma` — `organizationId` is nullable, so a composite unique
  with it would silently stop being enforced).
- CSV import/export (`POST /api/contacts/import`, `GET /api/contacts/export`)
  — upserts by phone number, auto-creates any tag names referenced in the
  `tags` column, and reports per-row skip reasons. Upload is capped at 5MB
  and gated on a `.csv` extension (mimetypes are too unreliable to trust
  for acceptance, only rejection).
- Tag/list membership are separate join-table endpoints
  (`POST /api/contacts/:id/tags`, `POST /api/lists/:id/members`) rather
  than nested writes on the contact payload.

## Inbox, messages, media

Text/image/video/audio/document sending and receiving, wired onto the
`WhatsAppProvider` interface from Phase 4 (`sendTextMessage`/
`sendMediaMessage`, plus `messages.upsert`/`messages.update` listeners for
inbound messages and delivery/read receipts).

- REST: `/api/conversations` (list/create/assign/mark-read,
  `:id/messages` to list or send), `/api/media` (upload, gated to an
  explicit mimetype allow-list, 20MB cap, `:id/file` to stream back).
- Realtime: `/inbox` Socket.IO namespace (same JWT-on-handshake pattern as
  `/whatsapp`) pushes new messages and conversation updates to every
  connected agent — verified with two browser tabs open on the same
  conversation, confirming a message sent in one appears in the other
  without a refresh.
- An unknown inbound sender auto-creates a minimal Contact
  (`source: "whatsapp"`) rather than dropping the message.
- Sending is blocked (400, not a silent failure) when the contact has
  opted out or the WhatsApp account isn't `CONNECTED` — checked before a
  Message row is even created.
- `messages.manage` permission, granted to both Admin and Agent.

Live send/receive against a real paired WhatsApp account isn't something
this environment can verify end-to-end (no phone available to scan the
QR code) — same limitation as Phase 4. What's covered by automated tests
and manual verification: the full REST/DB/socket pipeline, the
not-connected and opted-out guards, and the failure path when a message
send throws (marks the message `FAILED` and still notifies the UI) — see
`test/inbox.e2e-spec.ts`.

## Templates

Reusable message bodies with `{{variableName}}` placeholders
(`src/templates/template-render.util.ts` — pure `extractVariables`/
`renderTemplate`/`contactVariables` functions, unit tested). Variables are
substituted from contact fields (`firstName`, `lastName`, `phoneNumber`,
etc.) plus any extra values passed in; an unresolved placeholder is left
as-is rather than throwing. `templates.manage` permission (Admin + Agent).
REST: `/api/templates` CRUD. Consumed directly by the campaign engine
(`renderForContact`) — no duplicate rendering logic.

## Campaigns

Bulk sends over a template to a set of contacts/lists/tags, throttled
through a database-backed job runner so agents keep control over pacing.
No Redis/BullMQ — a 1-second poll against MySQL is enough at this scale
and it's one less moving part to run on a self-hosted server.

- REST: `/api/campaigns` CRUD, `:id/preview` (dry-run recipient counts —
  total contacts, opted-out exclusions, already-added, estimated
  recipients), `:id/recipients` (add + paginated list),
  `:id/launch|pause|resume|cancel|retry-failed`, `emergency-stop` (cancels
  every running campaign at once).
- `campaign-runner.service.ts` ticks every second (`@Interval`), scans
  RUNNING campaigns, and claims due `CampaignRecipient` rows (status
  `PENDING`/`QUEUED` with `scheduledFor` in the past) up to that
  campaign's `concurrency`, via an atomic `updateMany` status transition
  so concurrent ticks can't double-claim the same row. Per-recipient rows
  carry a cumulative random `scheduledFor` offset
  (`minDelaySeconds`–`maxDelaySeconds`) so sends don't fire back-to-back.
  Pause/resume/cancel need no queue-side bookkeeping — they just flip
  `campaign.status`, and the tick only ever looks at RUNNING campaigns.
- `campaign-processor.service.ts` re-checks opt-out status, the daily send
  limit, and account-connected state at send time (not just at launch) —
  a recipient over the daily limit gets its `scheduledFor` pushed to the
  next day's window instead of failing. Sending itself reuses
  `ConversationsService.sendMessage()` from Phase 6, so campaign messages
  and manually-sent messages go through identical logic.
- Failed sends retry with backoff up to `retryLimit`, then land in
  `FAILED` with `errorMessage` set. A campaign auto-completes (event-driven,
  `CAMPAIGN_RECIPIENT_PROCESSED_EVENT`) once no recipient is left in an
  active status.
- Scheduled campaigns (`scheduledAt` in the future) are picked up by a
  separate `@Cron(EVERY_MINUTE)` scheduler instead of running immediately.
- `campaigns.manage` permission (Admin + Agent). Disclaimer shown in the
  UI: delay/limit controls are compliance and reliability aids, not a
  ban-proof guarantee.

## Credits

A single wallet (`CreditWallet`, one per deployment — not per org) gates
outbound WhatsApp sending. There's no payment gateway integration (the
project has a zero-paid-services constraint), so top-ups are a manual
admin action rather than a checkout flow.

- `src/credits/credits.service.ts`: `getWallet`/`listTransactions` (paginated
  ledger, filterable by `type`), `topup` (admin-initiated CREDIT
  transaction), `assertSufficientBalance` + `debit` (used internally by the
  send path). Every balance change writes a `CreditTransaction` row with a
  `balanceAfter` snapshot — the ledger, not just the wallet counter, is the
  source of truth for "why is the balance what it is."
- `ConversationsService.sendMessage()` — the single send path shared by the
  inbox and campaigns (Phase 6/8) — checks `assertSufficientBalance` up
  front (before a `Message` row is even created, same guard-clause pattern
  as the opted-out/not-connected checks) and only calls `debit` after a
  send actually succeeds. A failed send is never charged.
- REST: `GET /api/credits/wallet`, `GET /api/credits/transactions`,
  `POST /api/credits/topup`. Gated by `credits.manage`, granted to Admin
  only — unlike day-to-day permissions (contacts/messages/campaigns), wallet
  management is an admin/billing concern.
- 1 credit per outbound message (text or media), flat rate — no per-type
  pricing tiers.

## Analytics + Admin

**Analytics** — `GET /api/analytics/overview`, gated by `analytics.view`
(Admin only). A single read-only aggregate endpoint (`src/analytics/`):
contact/conversation/message counts, campaign send/fail totals, credit
balance and 30-day spend, WhatsApp account connection counts, user counts,
and a 7-day outbound-message trend. All counted directly from existing
tables — no separate events/metrics pipeline. The 7-day trend is built
from local calendar days, not `toISOString()` truncation, which would
mislabel "today" in any timezone ahead of UTC (local midnight shifts to
the previous day once converted).

**Admin** fills in what Phase 2 (Auth + RBAC) only laid the schema for —
until now there was no way to list/edit users, manage roles, or touch
system settings through the API at all:

- Users (`users.manage`): `GET/PATCH /api/users`, `POST /api/users/:id/reset-password`.
  Deactivation, not deletion — a `User` row is referenced by too much
  (messages, templates, campaigns, credit transactions) to safely hard-delete.
  Deactivated users are blocked at login (`auth.service.ts` already checked
  `isActive`, from Phase 2). An admin cannot deactivate their own account —
  enforced both server-side and by disabling the button client-side.
- Roles (`roles.manage`): `GET /api/roles`, `GET /api/permissions`,
  `POST/PATCH/DELETE /api/roles`. System roles (`Admin`, `Agent`,
  `isSystem: true`) can have their permission set edited — a real admin
  need — but not their name, and can't be deleted, since `seed.ts` looks
  them up by name and deleting one out from under assigned users would
  orphan them. Deleting a role with users still on it is rejected.
- Settings (`settings.manage`): `GET /api/settings`, `PUT /api/settings/:key`.
  A flat key→JSON store (`SystemSetting`) for anything that needs to be
  admin-configurable without a schema change; nothing reads from it yet —
  it's infrastructure for later phases to hang config on.

## Automations + Audit logs

**Audit logs** (`audit-logs.view`, Admin only) are declarative, not
sprinkled through service logic. A route opts in with one decorator:

```ts
@Patch(':id')
@Audit('user.update', 'User')
update(@Param('id') id: string, @Body() dto: UpdateUserDto) { ... }
```

A global `AuditLogInterceptor` (`src/audit-logs/`) reads that metadata via
`Reflector`; for undecorated routes it's a single cheap lookup and a
no-op. On success it writes an `AuditLog` row — action, entity
type/id (from the response body's `id`/`key`, falling back to the route
param), acting user, and IP — as a fire-and-forget write after the
response, so a logging hiccup can never fail the request it's observing.
Applied to the admin-facing surface: users, roles, settings, credits
top-ups, campaign lifecycle actions, and WhatsApp connect/disconnect.
`GET /api/audit-logs` supports filtering by `userId`/`entityType`/`action`.

**Automations** (`automations.manage`, Admin only) are a small
trigger→action engine, not a generic workflow builder — one trigger type,
two actions, intentionally:

- Trigger: `message_received`, with an optional `triggerConfig.keyword`
  filter (case-insensitive substring match against the inbound text; no
  keyword means it fires on every inbound message).
- Actions: `send_template` (auto-reply, reusing
  `TemplatesService.renderForContact` + `ConversationsService.sendMessage`
  — same send path as Phase 6/8, so it's credit-metered like any other
  send) or `add_tag` (reusing `ContactsService.setTags`, additive rather
  than replacing the contact's existing tags).
- `AutomationsListenerService` listens on `INBOX_MESSAGE_EVENT`
  (filtered to `direction: INBOUND`), not the lower-level
  `WHATSAPP_INCOMING_MESSAGE_EVENT` — by the time the inbox event fires,
  `ConversationsService.handleIncomingMessage` has already created the
  contact/conversation/message rows, so a first-time sender is guaranteed
  to exist. One automation failing (e.g. its template or tag was deleted
  after the automation was created) is caught and logged, not allowed to
  break inbound message processing for the rest.
- `POST/PATCH /api/automations` validates `actionConfig` against
  `actionType` up front — an unknown `templateId`/`tagId` is rejected at
  save time, not discovered the first time the automation tries to fire.

## Auth

JWT access token (15m, in-memory on the frontend) + refresh token (7d,
httpOnly cookie scoped to `/api/auth`, rotated on every use). Reuse of a
rotated-out refresh token revokes all of that user's active sessions.
RBAC is role + permission based (`src/auth/guards/rbac.guard.ts`,
`src/common/permissions.ts`); routes are protected by default (global
`JwtAuthGuard`) — mark an endpoint `@Public()` to opt out.

## Workspace layout

```text
apps/
  api/    NestJS backend
  web/    React + Vite frontend
storage/  Local media/import/export tree (see below)
```

## Local storage

```text
/storage
  /media/images
  /media/videos
  /media/audio
  /media/documents
  /avatars
  /imports
  /exports
  /wa-sessions   (WhatsApp session auth data — not committed)
```

Metadata for files under `/storage` is tracked in the database (from
Phase 6 onward). `STORAGE_ROOT` in `apps/api/.env` points at this tree.

## Security + production hardening

- **Rate limiting** (`@nestjs/throttler`, global `ThrottlerGuard`): 120
  req/min/IP by default — generous enough that a real page load (several
  concurrent GETs) never trips it. `POST /api/auth/login` overrides this to
  10/min and `POST /api/auth/refresh` to 30/min, since those are the
  unauthenticated routes actually worth protecting against
  credential-stuffing/brute-force; everything else is already behind
  `JwtAuthGuard`.
- **Global exception filter** (`src/common/filters/all-exceptions.filter.ts`):
  known errors (`BadRequestException`, `NotFoundException`, etc.) pass
  through with their existing status/body unchanged. Anything unexpected —
  a genuine bug — is logged server-side with method/URL/user for
  debugging, but the client only ever sees a generic `Internal server
  error`, never the raw message or stack trace. Scoped to HTTP only; the
  WhatsApp/Inbox gateways already catch their own errors and never relied
  on this.
- **Helmet** (security headers) and **compression** (gzip) are applied in
  `main.ts`. Note for anyone writing e2e tests: files that build the Nest
  app directly via `Test.createTestingModule()` bypass `main.ts`'s
  `bootstrap()` entirely, so helmet/compression/the exception filter don't
  apply unless a test re-adds them itself — see `test/security.e2e-spec.ts`
  for the one file that does, to actually verify they work.
- **Graceful shutdown**: `app.enableShutdownHooks()` — without it, Nest's
  `OnModuleDestroy` hooks (`PrismaService.$disconnect`, the campaign
  runner's tick loop) never fire on `SIGTERM`, so a process manager restart
  would kill the process mid-request instead of draining it.
- **Health check** (`GET /health`, public): actually queries the database
  (`SELECT 1`) rather than just returning "ok" unconditionally, and
  responds `503` if it can't — the difference between a load
  balancer/orchestrator correctly detecting "the DB is down" versus
  reporting healthy while every request fails.
- **Dependency check**: `pnpm add` flagged `@whiskeysockets/baileys` as
  matching a known advisory (GHSA-qvv5-jq5g-4cgg) — verified against the
  actual advisory data that the vulnerable range is `< 6.7.22` (or
  `7.0.0-rc.1`–`7.0.0-rc11`); this project is pinned to `6.17.16`, which is
  past the fixed version and not actually affected. Worth re-checking
  `pnpm audit` / advisory warnings periodically rather than trusting a
  version-number pattern-match at a glance.
- CSRF exposure is already low by construction, not by an add-on: the
  refresh token lives in an httpOnly cookie scoped to `/api/auth`, but
  every authenticated request uses the JWT access token via an
  `Authorization` header (not a cookie) — a page on another origin can't
  read or set that header, so there's nothing for a forged cross-site
  request to ride on.

**Before deploying to a real server:**

- [ ] Generate fresh `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET`/
      `SESSION_ENCRYPTION_KEY` for that environment — never reuse the ones
      from local dev (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- [ ] Set `NODE_ENV=production` (flips the refresh cookie to `secure: true`,
      requiring HTTPS)
- [ ] Put a reverse proxy (nginx/Caddy) in front for TLS — this app doesn't
      terminate HTTPS itself
- [ ] Set `CORS_ORIGIN` to the real frontend origin, not `localhost`
- [ ] Run `prisma migrate deploy` (not `migrate dev`) against the
      production database
- [ ] Re-run `pnpm db:seed` once — it's idempotent (upserts), so it's safe
      to run again after new permissions land in later work
- [ ] Change the seeded admin password immediately after first login
- [ ] Use a process manager (pm2/systemd) so crashes restart the process,
      and so `enableShutdownHooks()` actually gets a `SIGTERM` to react to
- [ ] Back up `storage/wa-sessions/` and the database — losing the former
      means re-scanning a QR code for every connected WhatsApp account

## Phases

Built incrementally; see task tracker / commit history for status.

1. Monorepo + Docker + base architecture
2. Auth + RBAC
3. Database + Prisma
4. WhatsApp QR/provider layer
5. Contacts + Lists + Tags
6. Inbox + Messages + Media
7. Templates
8. Campaigns + DB-backed queue
9. Credits
10. Analytics + Admin
11. Automations + Audit logs
12. Tests + Security + Production hardening
