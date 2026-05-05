# Hostel Pro — Security Assessment Report

**Date:** 2026-05-05
**Scope:** Full codebase security review (Next.js frontend, API routes, SQL migrations, infrastructure, repository hygiene)
**Branch reviewed:** `24April`
**Classification:** Internal — Contains vulnerability details

---

## Executive Summary

The Hostel Pro application has **6 critical** and **8 high** severity security findings, dominated by an authentication-bypass-grade flaw in the password-reset flow, a CORS wildcard default in `next.config.js`, two unauthenticated PII-exposure endpoints in the application-tracking flow, and committed bcrypt password hashes for ten seeded test users. Authentication primitives are otherwise well-built (bcrypt rounds 12, HMAC-signed session tokens, `is_active` JWT revocation) and email templates correctly escape user input — but several customer-facing endpoints leak personal data without authentication, and the dev-mode hardcoded OTP `'123456'` becomes a production risk if `NODE_ENV` is ever misconfigured.

**Overall Security Posture: HIGH RISK** — The application is not safe for production deployment in its current state. Several findings are directly exploitable without prior access.

| Severity | Count |
|----------|-------|
| Critical | 6 |
| High | 8 |
| Medium | 9 |
| Low | 4 |
| Informational | 3 |

---

## OWASP Top 10 Mapping

| OWASP Category | Findings |
|----------------|----------|
| A01: Broken Access Control | S-02, S-03, S-08, S-13, S-15 |
| A02: Cryptographic Failures | S-04, S-06, S-07, S-22 |
| A03: Injection | S-09, S-26 |
| A04: Insecure Design | S-01, S-12, S-14, S-19 |
| A05: Security Misconfiguration | S-05, S-16, S-17, S-18, S-20, S-21, S-27 |
| A06: Vulnerable / Outdated Components | S-23 |
| A07: Authentication Failures | S-11, S-24, S-25 |
| A08: Software & Data Integrity Failures | S-10 |
| A09: Logging & Monitoring Failures | S-28 |
| A10: SSRF | No findings |

---

## Critical Findings

### S-01: Account Takeover via Forged Forgot-Password Token

**Severity:** Critical
**OWASP:** A04 — Insecure Design / A07 — Authentication Failures
**Location:** [frontend/src/app/api/auth/forgot-password/route.ts:95](frontend/src/app/api/auth/forgot-password/route.ts#L95) + [frontend/src/app/api/auth/reset-password/route.ts:67-91](frontend/src/app/api/auth/reset-password/route.ts#L67-L91)

The `forgot-password` route issues an **unsigned base64 JSON token** containing `{ userId, contact, timestamp }`. The `reset-password` route decodes the token client-side, verifies the OTP against `tokenData.contact`, and then runs:

```typescript
UPDATE users SET password_hash = $1 WHERE id = tokenData.userId
```

Because the token is not signed (no HMAC, no asymmetric signature), an attacker can forge any token. The OTP is verified against the **claimed** `contact`, but the password update applies to the **claimed** `userId` — which is decoupled from the OTP path.

**Exploit Scenario:**
1. Attacker calls `/api/auth/forgot-password` with their own email/mobile → receives a valid OTP for `attacker@evil.com`.
2. Attacker forges a token: `base64.encode({ userId: "<VICTIM_UUID>", contact: "attacker@evil.com", timestamp: Date.now() })`.
3. Attacker POSTs `/api/auth/reset-password` with the forged token + the OTP they actually received. The OTP check passes (keyed by `attacker@evil.com`); the UPDATE rewrites the **victim's** password.
4. Attacker logs in as the victim.

Victim UUIDs are leaked through the unauthenticated `/api/applications/track/[trackingNumber]` endpoint (S-02), trustee-listing endpoints, and other admin views.

**Remediation:**
1. Sign the reset token with HMAC using `JWT_SECRET` (mirror the `createSignedSessionToken` pattern in [frontend/src/lib/auth.ts:101-114](frontend/src/lib/auth.ts#L101-L114)).
2. Or — preferred — drop `userId` from the token entirely; derive it server-side via `SELECT id FROM users WHERE email = $1 OR mobile = $1` *after* successful OTP verification.
3. Add timestamp validation (see S-11).

---

### S-02: Unauthenticated PII Disclosure on Application Tracking

**Severity:** Critical
**OWASP:** A01 — Broken Access Control
**Location:** [frontend/src/app/api/applications/track/[trackingNumber]/route.ts:22-35](frontend/src/app/api/applications/track/[trackingNumber]/route.ts#L22-L35)

The endpoint is **unauthenticated** and runs `SELECT *` keyed by `tracking_number`, returning the full `data` jsonb column. That column contains:

- Personal info: full name, DOB, gender, blood group
- Guardian info: parent names, mobile numbers, emails, addresses
- Emergency contact info
- Hostel preferences and other application data
- The application UUID (used as a pivot for further attacks — see S-01)

Tracking numbers are described in CLAUDE.md as "human-readable" (e.g., `HP-2025-0001`) and are sequential / guessable.

**Exploit Scenario:**
```
for n in 1..N:
  curl -s https://hostel.example.com/api/applications/track/HP-2025-${n:04}
  → harvest { id, applicant_mobile, data: { personal_info, guardian_info, ... } }
```

This is a direct DPDP Act violation (CLAUDE.md explicitly calls out DPDP compliance as in-scope) and a regulatory exposure for the institution.

**Remediation:**
1. Require an OTP-verified session token bound to `applicant_mobile` (use the same pattern as `drafts-by-mobile`).
2. Or — for an unauthenticated public-tracking flow — project only non-sensitive columns: `status, vertical, submitted_at, current_status, tracking_number`. Do NOT return `data` jsonb, `applicant_mobile`, or `id`.

---

### S-03: Unauthenticated Applicant Photo Download

**Severity:** Critical
**OWASP:** A01 — Broken Access Control
**Location:** [frontend/src/app/api/applications/[id]/photo/route.ts:25-67](frontend/src/app/api/applications/[id]/photo/route.ts#L25-L67)

The route is documented in code as a "Public endpoint" with no authentication. It serves the applicant's passport-size photograph by either UUID or `tracking_number`. Path traversal is mitigated (`resolveAndValidatePath` is correctly used), but the access-control gate itself is missing.

Combined with S-02's tracking-number guessability, this leaks face photos for every applicant — biometric-grade PII.

**Exploit Scenario:** Same enumeration loop as S-02 with `/api/applications/HP-2025-${n}/photo` → mass-download all applicant photos.

**Remediation:**
1. Require an authenticated staff session OR an OTP-verified applicant session bound to the application's mobile number.
2. Alternatively, only serve via short-lived signed tokens minted server-side after authorization. Use `generateSignedToken` from [frontend/src/lib/storage.ts](frontend/src/lib/storage.ts).

---

### S-04: Bcrypt Password Hashes Committed in Seed SQL

**Severity:** Critical
**OWASP:** A02 — Cryptographic Failures
**Location:** [sql/002_seed_test_users.sql:3-25](sql/002_seed_test_users.sql#L3-L25)

```sql
-- Password: Password123 (bcrypt cost 12)
INSERT INTO users (email, password_hash, role, ...)
VALUES (..., '$2b$12$BVZ6IVRfoDLBIHgF8I8AcOXM92KBUA2Ff9EDAfVxeDXwvVY5mHpCi', 'TRUSTEE', ...);
```

The same bcrypt hash (corresponding to `Password123`) is used for **all ten** seeded users — superintendents, trustees, students, parents. The plaintext password is documented in commit messages. Anyone who runs the seed script in any environment receives a system with admin-equivalent accounts whose password is publicly known.

**Exploit Scenario:**
1. A staging or QA deployment runs `sql/002_seed_test_users.sql` for convenience.
2. Attacker with read access to the repo (or to the running staging URL) tries `Password123` against any of the documented seeded users (e.g., `trustee@hostelpro.test`).
3. Login succeeds → full TRUSTEE privileges → access to all applicant PII, ability to reset student passwords, etc.

**Remediation:**
1. Move test-user seeding out of versioned SQL into a post-deployment script that requires an environment-only secret (e.g., `node scripts/seed-test-users.js --env=staging`).
2. Generate per-user random passwords on seed and email them to the operator.
3. Add a startup guard: refuse to boot if a known seed bcrypt hash is present in production (`NODE_ENV=production`).
4. Rotate any production-database row whose `password_hash` matches the seeded hash.

---

### S-05: CORS Wildcard Default + Missing Security Headers

**Severity:** Critical
**OWASP:** A05 — Security Misconfiguration
**Location:** [frontend/next.config.js:12](frontend/next.config.js#L12)

```js
{ key: 'Access-Control-Allow-Origin', value: process.env.CORS_ORIGIN || '*' }
```

If `CORS_ORIGIN` is unset (developer error, missed env var in CI/CD), every API route returns `Access-Control-Allow-Origin: *`. Combined with the JWT being passed in the `Authorization` header (not cookies), browsers will happily send the token cross-origin from any attacker-controlled site that is reachable to a logged-in user.

The `headers()` block also omits all hardening headers:
- No `Content-Security-Policy`
- No `Strict-Transport-Security`
- No `X-Frame-Options` / `frame-ancestors`
- No `X-Content-Type-Options: nosniff`
- No `Referrer-Policy`

**Exploit Scenario:** A logged-in trustee visits an attacker site. The site issues a cross-origin XHR — but more realistically, the attacker stages a phishing payload or XSS that reads the token from `localStorage` (S-08) and exfiltrates over the wildcard-CORS-allowed origin.

**Remediation:** In `next.config.js` `headers()`:
```js
{ key: 'Access-Control-Allow-Origin', value: process.env.CORS_ORIGIN }, // no default
{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
{ key: 'X-Frame-Options', value: 'DENY' },
{ key: 'X-Content-Type-Options', value: 'nosniff' },
{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
{ key: 'Content-Security-Policy', value: "default-src 'self'; ..." },
```
Refuse to start if `CORS_ORIGIN` is unset in production.

---

### S-06: Hardcoded OTP `'123456'` in Development Mode

**Severity:** Critical
**OWASP:** A02 — Cryptographic Failures
**Location:** [frontend/src/lib/auth.ts:150](frontend/src/lib/auth.ts#L150)

```typescript
const otp = process.env.NODE_ENV === 'development' ? '123456' : generateOtp();
```

The OTP for **every** authentication flow (applicant tracking, alumni login, password reset) is hardcoded to `123456` whenever `NODE_ENV` is `development`. While correct for local dev, this is a single environment-variable misconfiguration away from a complete authentication bypass in any deployed environment.

**Exploit Scenario:**
1. A staging or even production deployment is mis-configured with `NODE_ENV=development` (a common Docker/PM2 misstep).
2. Attacker requests an OTP for any victim mobile number.
3. Attacker submits `123456`. OTP verifies. Full session granted.

This converts a configuration mistake into instant universal account takeover.

**Remediation:**
1. Replace the `NODE_ENV` check with an explicit feature flag: `process.env.MOCK_OTP_ENABLED === 'true'`.
2. Hard-fail at startup if `MOCK_OTP_ENABLED=true` AND `NODE_ENV=production` simultaneously.
3. Even in dev, randomize the OTP and log it server-side rather than always returning `123456`.

---

## High Findings

### S-07: Plaintext Secrets in `docker-compose.yml`

**Severity:** High
**OWASP:** A02 — Cryptographic Failures
**Location:** [docker-compose.yml:9-13](docker-compose.yml#L9-L13), [docker-compose.prod.yml:9-13](docker-compose.prod.yml#L9-L13)

Both compose files inject `DATABASE_URL`, `JWT_SECRET`, and `ADMIN_SEED_SECRET` directly via the `environment:` key. Any developer or CI agent with read access to the file sees the live values. There is no `env_file:` reference and no secrets-mounting pattern.

**Remediation:**
1. Replace inline `environment:` keys with `env_file: .env.production` (gitignored).
2. Or use Docker Swarm / Kubernetes secrets.
3. Audit git history: `git log -p docker-compose*.yml` to confirm no real secrets were ever committed; if so, rotate them.

---

### S-08: JWT Stored in `localStorage` (XSS Token Theft)

**Severity:** High
**OWASP:** A07 — Authentication Failures
**Location:** 86 `Bearer ${token}` injections across the dashboard pages, e.g. [frontend/src/app/dashboard/template.tsx:71](frontend/src/app/dashboard/template.tsx#L71), [frontend/src/app/dashboard/trustee/page.tsx:52](frontend/src/app/dashboard/trustee/page.tsx#L52)

JWTs are read via `localStorage.getItem('authToken')` and attached to every API call. Any successful XSS — first-party or via any third-party script that ends up rendered — can read the token and use it to impersonate the user for the full 24-hour token lifetime.

The application has no Content-Security-Policy (S-05), making first-party XSS blast radius unbounded.

**Remediation:**
1. Switch to `HttpOnly` + `Secure` + `SameSite=Strict` cookies for the access token.
2. Adjust API routes to read the token from the cookie via `request.cookies.get('authToken')`.
3. Add CSRF protection (double-submit cookie or `SameSite=Strict`-only) once cookies are introduced.

---

### S-09: Second-Order SQL Injection in Superintendent Reset Password

**Severity:** High
**OWASP:** A03 — Injection
**Location:** [frontend/src/app/api/superintendent/reset-password/route.ts:32-40](frontend/src/app/api/superintendent/reset-password/route.ts#L32-L40)

```typescript
const verticalClause = vertical ? `AND vertical = '${vertical}'` : '';
const { rows } = await query(
  `SELECT id, full_name, email, mobile, role, vertical
   FROM users
   WHERE id = $1 AND role = 'STUDENT' AND is_active = true ${verticalClause}`,
  [userId]
);
```

`vertical` is sourced from `getVerticalFilter(authUser)` — currently the `users.vertical` column. Any flow that ever lets a value containing `'` reach `users.vertical` (a buggy admin form, a future user-controlled vertical-self-select feature, a manual DB seed) becomes direct SQL injection here, allowing the caller to reset arbitrary users' passwords across all verticals.

**Remediation:** Parameterize:
```typescript
const verticalClause = vertical ? 'AND vertical = $2' : '';
const params = vertical ? [userId, vertical] : [userId];
```

---

### S-10: Razorpay `/initiate` Unauthenticated + Leaks PII

**Severity:** High
**OWASP:** A08 — Software & Data Integrity / A01 — Broken Access Control
**Location:** [frontend/src/app/api/payments/razorpay/initiate/route.ts:14-101](frontend/src/app/api/payments/razorpay/initiate/route.ts#L14-L101)

No `requireAuth`, no OTP-bound session check. Anyone with a guessed or harvested application UUID can:

- Create live Razorpay orders against the institution's merchant account (financial abuse, surcharge cost).
- Read back the `prefill` block (lines 91-95) containing applicant **name, email, and mobile**.
- Populate the `transactions` table with attacker-driven rows.

The amount is hard-pinned server-side, so funds cannot be misdirected — but the PII leak and Razorpay-side abuse are concrete.

**Remediation:** Require an OTP-verified session token bound to `applicant_mobile` (same pattern as `/api/applications/drafts-by-mobile`).

---

### S-11: Reset-Password Token Has No Expiry Validation

**Severity:** High
**OWASP:** A07 — Authentication Failures
**Location:** [frontend/src/app/api/auth/reset-password/route.ts:67-91](frontend/src/app/api/auth/reset-password/route.ts#L67-L91)

The forgot-password token contains a `timestamp` field that is never validated. A leaked or recovered token (browser history, referer leak, log file, Sentry breadcrumb) remains valid indefinitely as long as the attacker can also obtain a fresh OTP for any contact — which (combined with S-01) is trivial.

**Remediation:**
```typescript
if (Date.now() - tokenData.timestamp > 15 * 60 * 1000) {
  return badRequestResponse('Reset token expired');
}
```

---

### S-12: Unauthenticated Alumni Document Upload (10 MB)

**Severity:** High
**OWASP:** A04 — Insecure Design
**Location:** [frontend/src/app/api/alumni/documents/upload/route.ts:12-32](frontend/src/app/api/alumni/documents/upload/route.ts#L12-L32)

The route accepts up to 10 MB files from any unauthenticated caller. Path traversal is mitigated (UUID-prefixed sanitized filenames via `saveFile`), but:

- No binding to an in-progress alumni registration session.
- MIME validation is by client-supplied `file.type` only — no server-side magic-byte verification.
- Once an alumni record's file path is signed by another route, attacker-uploaded content becomes hostable on the institution's domain.

**Remediation:**
1. Require a registration-session token (issued during `/api/alumni/register` flow) to be present.
2. Validate magic bytes server-side (e.g., `file-type` package).
3. Bind uploaded files to the registration session ID; reject files not tied to a known alumni record.

---

### S-13: Unauthenticated `/api/applications/drafts-by-mobile` Surface

**Severity:** High
**OWASP:** A01 — Broken Access Control
**Location:** [frontend/src/app/api/applications/drafts-by-mobile/route.ts](frontend/src/app/api/applications/drafts-by-mobile/route.ts)

The endpoint is gated by an OTP-issued session token in the design spec, but the implementation must be confirmed end-to-end. Any path where a caller can pass an `applicant_mobile` and receive draft-application UUIDs without OTP-binding becomes a PII enumeration tool.

**Remediation:** Audit the route to confirm:
1. The session token is HMAC-verified before any DB lookup.
2. The token's `mobile` claim must equal the requested `mobile`.
3. Token expiry is enforced.

---

### S-14: Missing Rate Limit on Password Reset Endpoints

**Severity:** High
**OWASP:** A04 — Insecure Design
**Location:** [frontend/src/app/api/auth/forgot-password/route.ts](frontend/src/app/api/auth/forgot-password/route.ts), [frontend/src/app/api/auth/reset-password/route.ts](frontend/src/app/api/auth/reset-password/route.ts)

Login (`/api/auth/login`) and OTP send/verify (`/api/otp/*`, `/api/alumni/otp/*`) correctly use `checkRateLimit` from `lib/rate-limit.ts`. The two password-reset endpoints do **not**.

Combined with S-01's auth-bypass primitive, this allows unbounded brute-forcing of OTP codes (6 digits = 10⁶ space) per user contact — feasible at thousands of requests per second.

**Remediation:**
- `/api/auth/forgot-password`: 3 requests / hour per `contact`.
- `/api/auth/reset-password`: 5 requests / hour per `userId` claimed in the token.

---

## Medium Findings

### S-15: `canAccessStudent` Allows Through When Vertical Is Unknown

**Severity:** Medium
**OWASP:** A01 — Broken Access Control
**Location:** [frontend/src/lib/authorize.ts:71-90](frontend/src/lib/authorize.ts#L71-L90)

The vertical check only fires `if (studentVertical && authUser.vertical)`. If the database column `students.vertical` is null/empty for any record, a superintendent of a different vertical may access that student.

**Remediation:** Treat missing `studentVertical` as deny: `if (!studentVertical) return false;`.

---

### S-16: Raw `error.message` Returned to Clients (10 routes)

**Severity:** Medium
**OWASP:** A05 — Security Misconfiguration
**Locations:**
- [frontend/src/app/api/config/applications-status/route.ts:48](frontend/src/app/api/config/applications-status/route.ts#L48), [:94](frontend/src/app/api/config/applications-status/route.ts#L94)
- [frontend/src/app/api/health/route.ts:36](frontend/src/app/api/health/route.ts#L36)
- [frontend/src/app/api/admin/seed-auth-users/route.ts:131](frontend/src/app/api/admin/seed-auth-users/route.ts#L131)
- [frontend/src/app/api/alumni/otp/verify/route.ts:78](frontend/src/app/api/alumni/otp/verify/route.ts#L78)
- [frontend/src/app/api/alumni/otp/send/route.ts:53](frontend/src/app/api/alumni/otp/send/route.ts#L53)
- [frontend/src/app/api/alumni/admin/applications/route.ts:66](frontend/src/app/api/alumni/admin/applications/route.ts#L66)
- [frontend/src/app/api/alumni/directory/route.ts:72](frontend/src/app/api/alumni/directory/route.ts#L72)
- [frontend/src/app/api/student/documents/[id]/url/route.ts:46](frontend/src/app/api/student/documents/[id]/url/route.ts#L46)

These leak Postgres error messages (column names, constraint names, query fragments) to unauthenticated clients, aiding reconnaissance.

**Remediation:** Use the conditional `serverErrorResponse(error)` from `lib/api/responses.ts` everywhere. It already gates stack-trace exposure on `NODE_ENV !== 'production'`. Audit and remove all direct `error: error.message` returns.

---

### S-17: TRUSTEE Can Reset Any Password Without Step-Up Auth

**Severity:** Medium
**OWASP:** A05 — Security Misconfiguration
**Location:** [frontend/src/app/api/admin/reset-password/route.ts:25-60](frontend/src/app/api/admin/reset-password/route.ts#L25-L60)

A single TRUSTEE-role JWT (24 h lifetime) can reset any user's password — including other TRUSTEEs and the entire student body — with no second factor. A stolen TRUSTEE token (S-08 path) is a one-shot full-system compromise.

**Remediation:** Require step-up authentication (re-prompt password or short-lived OTP) before TRUSTEE-initiated password resets. Log a high-priority audit event with operator + target IDs.

---

### S-18: `submitForReview`-Style Authorizations Missing in Lifecycle Routes

**Severity:** Medium
**OWASP:** A05 — Security Misconfiguration
**Location:** Multiple application-lifecycle routes (e.g., [frontend/src/app/api/applications/[id]/submit/route.ts](frontend/src/app/api/applications/[id]/submit/route.ts), [frontend/src/app/api/interviews/[id]/complete/route.ts](frontend/src/app/api/interviews/[id]/complete/route.ts))

`requireAuth(['STUDENT', 'SUPERINTENDENT', 'TRUSTEE', 'ACCOUNTS'])` patterns frequently grant write access to the wrong role tier. For example, a student should not be able to mark an interview "complete." Audit each lifecycle transition's allowed-roles list.

**Remediation:** Per route, narrow `allowedRoles` to the smallest set that owns that transition. Add explicit ownership checks: `application.student_user_id === user.id`.

---

### S-19: Most Routes Lack Multi-Statement Transactions

**Severity:** Medium
**OWASP:** A04 — Insecure Design
**Locations:**
- [frontend/src/app/api/fee-configuration/route.ts:79-90](frontend/src/app/api/fee-configuration/route.ts#L79-L90) — INSERT + audit_log not atomic
- [frontend/src/app/api/fees/route.ts:131-150](frontend/src/app/api/fees/route.ts#L131-L150) — UPDATE + audit_log not atomic
- [frontend/src/app/api/payments/route.ts:82-100](frontend/src/app/api/payments/route.ts#L82-L100) — INSERT payment + UPDATE fee status not atomic
- [frontend/src/app/api/clearance-items/bulk/route.ts:71-77](frontend/src/app/api/clearance-items/bulk/route.ts#L71-L77) — bulk audit log inserts without transaction

If the audit-log INSERT fails after a successful financial UPDATE, the audit record is missing — a compliance gap. If the financial UPDATE fails after the audit INSERT, the log claims an action that never happened.

**Remediation:** Wrap any pair of `query` calls that span business + audit in `withTransaction()` from [lib/db.ts:26-41](frontend/src/lib/db.ts#L26-L41).

---

### S-20: Unbounded List Queries (11 endpoints)

**Severity:** Medium
**OWASP:** A05 — Security Misconfiguration
**Locations:**
- [frontend/src/app/api/users/route.ts:23](frontend/src/app/api/users/route.ts#L23) — `SELECT * FROM users WHERE 1=1` no LIMIT
- [frontend/src/app/api/applications/route.ts:51](frontend/src/app/api/applications/route.ts#L51) — `SELECT * FROM applications`
- [frontend/src/app/api/auditLogs/route.ts](frontend/src/app/api/auditLogs/route.ts) — full-table audit dump
- [frontend/src/app/api/alumni/directory/route.ts](frontend/src/app/api/alumni/directory/route.ts) — full directory dump
- [frontend/src/app/api/dashboard/superintendent/route.ts:21-22](frontend/src/app/api/dashboard/superintendent/route.ts#L21-L22) — `SELECT * FROM applications` full scan
- + 6 more (rooms, fees, fee-configuration, transactions, communications, clearance-items)

**Remediation:** Cap all list endpoints at `LIMIT 100` by default; require `?page=&limit=` for caller-driven paging.

---

### S-21: MIME Type Validation Is Client-Supplied

**Severity:** Medium
**OWASP:** A05 — Security Misconfiguration
**Location:** [frontend/src/app/api/applications/documents/upload/route.ts:43-49](frontend/src/app/api/applications/documents/upload/route.ts#L43-L49), [frontend/src/app/api/alumni/documents/upload/route.ts](frontend/src/app/api/alumni/documents/upload/route.ts), [frontend/src/app/api/student/documents/upload/route.ts](frontend/src/app/api/student/documents/upload/route.ts)

The MIME whitelist is checked against `file.type`, which is whatever the client claims. An attacker can rename `.exe` to `.pdf` and set `Content-Type: application/pdf`; the file is stored and served as PDF. When the file is later opened by a clerk on a Windows machine via the photo or document URL, the actual binary may be executed depending on browser/OS handling.

**Remediation:** Validate magic bytes server-side using `file-type` (npm) or `libmagic`. Reject if the detected MIME doesn't match the whitelist.

---

### S-22: API Keys / SMTP Creds in `.env.example` Use Weak Placeholders

**Severity:** Medium
**OWASP:** A02 — Cryptographic Failures
**Location:** [.env.example:8](.env.example#L8), [.env.example:13](.env.example#L13), [.env.example:19](.env.example#L19)

Placeholder text reads `JWT_SECRET=generate-a-strong-random-secret-at-least-48-chars`. If a developer copies the file to `.env` and forgets to replace the placeholder, the app uses the literal placeholder string as the secret. The runtime check in [auth.ts:6-9](frontend/src/lib/auth.ts#L6-L9) only verifies the variable is set — not that it isn't the placeholder.

**Remediation:** Add a startup guard: refuse to start if `JWT_SECRET` matches the known placeholder pattern or is < 48 chars; same for `ADMIN_SEED_SECRET`.

---

### S-23: Outdated Dependency Surface

**Severity:** Medium
**OWASP:** A06 — Vulnerable / Outdated Components
**Location:** [frontend/package.json](frontend/package.json), [package.json](package.json)

Run `npm audit` against both lockfiles. At time of writing, no automated scan was performed — but any audit/scan should be a CI gate before each deployment.

**Remediation:**
1. Add `npm audit --audit-level=high` to `.github/workflows/ci.yml`.
2. Triage and patch any high/critical advisories within 7 days.

---

## Low Findings

### S-24: Token Expiration Without Idle Timeout

**Severity:** Low
**OWASP:** A07 — Authentication Failures
**Location:** [frontend/src/lib/auth.ts:10](frontend/src/lib/auth.ts#L10)

JWT access tokens valid for 24 hours with no idle-timeout. A stolen token (S-08) is usable for the full 24h regardless of inactivity.

**Remediation:** Reduce access-token lifetime to 1–2 hours; rotate via the existing 7-day refresh token (already implemented in `auth.ts`).

---

### S-25: No JWT Revocation List Beyond `is_active`

**Severity:** Low
**OWASP:** A07 — Authentication Failures
**Location:** [frontend/src/lib/auth.ts:319](frontend/src/lib/auth.ts#L319)

`getUserFromToken()` checks `users.is_active` and `alumni.status` — good. However, there's no per-token revocation (beyond logout's `invalidateAllSessions`). If a single token is suspected compromised but the user is active, the only mitigation is force-logout of all sessions.

**Remediation:** Add a `token_blacklist` (jti) table or use a Redis denylist with TTL = JWT remaining lifetime.

---

### S-26: Date / String Filters Lacking Validation

**Severity:** Low
**OWASP:** A03 — Injection (low impact)
**Location:** [frontend/src/app/api/auditLogs/route.ts](frontend/src/app/api/auditLogs/route.ts), [frontend/src/app/api/users/route.ts](frontend/src/app/api/users/route.ts) — `role`, `vertical`, `is_active` query params

Several list endpoints accept query parameters and pass them straight into parameterized queries. Parameterization prevents SQL injection, but invalid types (e.g., `role=<script>`) can trigger Postgres errors that leak schema info via S-16.

**Remediation:** Validate enums against `VERTICALS`, `ROLES`, etc., before query.

---

### S-27: `Testing.xlsx` and Manual-Testing Guides at Repo Root

**Severity:** Low
**OWASP:** A05 — Security Misconfiguration
**Location:** Repository root — `Testing.xlsx`, `MANUAL_TESTING_GUIDE.md`, `MANUAL_TESTING_GUIDE_v2.md`, `MANUAL_TESTING_GUIDE_v3.md`, `TESTING_SUMMARY.md`, `ISSUE_LOG.md`

`Testing.xlsx` may contain test credentials, real applicant data used for manual testing, or internal QA notes. The manual-testing guides may contain production URLs, default credentials, or step-by-step replay scripts useful to an attacker.

**Remediation:**
1. Audit each file's contents for sensitive material.
2. Move QA artefacts to a private wiki or `.docs/qa/` folder, then `.gitignore` the binary spreadsheet.
3. Scrub any sensitive content from git history.

---

## Informational Findings

### S-28: No Structured Application Logging

The `logger` from `lib/logger.ts` is used inconsistently. There is no centralized request-tracing or log-aggregation integration (Sentry, Datadog, ELK).

### S-29: CI Has Tests Disabled

[.github/workflows/ci.yml:30-32](.github/workflows/ci.yml#L30-L32) — the `Run tests` step is commented out. The Vitest suite under `frontend/tests/` is therefore never executed in CI.

### S-30: PostgreSQL Host Hardcoded in CLAUDE.md

CLAUDE.md documents `51.68.196.242:5432/hostel_pro` as the production DB host. This information is not itself a vulnerability but discloses the deployment topology.

---

## Remediation Priority Matrix

### Phase 1: Immediate (Block Deployment)

| ID | Finding | Effort |
|----|---------|--------|
| S-01 | Sign reset-password token / derive userId server-side | 4 h |
| S-02 | Bind `/applications/track` to OTP session, project safe columns | 2 h |
| S-03 | Add auth/OTP-session check to `/applications/[id]/photo` | 2 h |
| S-04 | Move seed users out of versioned SQL; rotate any prod hashes | 4 h |
| S-05 | Remove CORS `*` default; add CSP/HSTS/X-Frame-Options headers | 2 h |
| S-06 | Replace `NODE_ENV` OTP gate with `MOCK_OTP_ENABLED` flag | 1 h |
| S-09 | Parameterize `vertical` in superintendent reset-password | 1 h |
| S-11 | Validate `tokenData.timestamp` (15-min expiry) | 1 h |
| S-14 | Rate-limit forgot-password and reset-password endpoints | 2 h |

### Phase 2: Short-Term (Within 2 Weeks)

| ID | Finding | Effort |
|----|---------|--------|
| S-07 | Move docker-compose secrets to env-file | 2 h |
| S-08 | Migrate JWT to HttpOnly cookies + add CSRF | 16 h |
| S-10 | Auth-gate Razorpay `/initiate` | 2 h |
| S-12 | Bind alumni upload to registration session + magic-byte check | 4 h |
| S-13 | Audit `drafts-by-mobile` HMAC verification end-to-end | 2 h |
| S-15 | Make vertical mandatory in `canAccessStudent` | 1 h |
| S-16 | Replace raw error.message returns with serverErrorResponse | 2 h |
| S-17 | Step-up auth for TRUSTEE password resets | 4 h |
| S-19 | Wrap audit-log + business writes in transactions | 8 h |
| S-21 | Server-side magic-byte MIME validation | 4 h |
| S-22 | Reject placeholder secrets at startup | 1 h |

### Phase 3: Medium-Term (Within 1 Month)

| ID | Finding | Effort |
|----|---------|--------|
| S-18 | Audit `allowedRoles` in lifecycle routes | 4 h |
| S-20 | Cap list endpoints at LIMIT 100 + paging | 4 h |
| S-23 | Run `npm audit` and patch high/critical | 4 h |
| S-24 | Reduce access-token TTL to 1–2 h with refresh rotation | 2 h |
| S-25 | Add per-token JWT denylist (jti) | 8 h |
| S-26 | Enum validation on query params | 2 h |
| S-27 | Audit / relocate `Testing.xlsx` and manual-testing guides | 2 h |
| S-29 | Re-enable Vitest in CI | 1 h |

---

## Appendix: Files Requiring Immediate Attention

| File | Issue |
|------|-------|
| [frontend/src/app/api/auth/forgot-password/route.ts](frontend/src/app/api/auth/forgot-password/route.ts) + [frontend/src/app/api/auth/reset-password/route.ts](frontend/src/app/api/auth/reset-password/route.ts) | S-01 — unsigned token + S-11 + S-14 |
| [frontend/src/app/api/applications/track/[trackingNumber]/route.ts](frontend/src/app/api/applications/track/[trackingNumber]/route.ts) | S-02 — unauth full-PII jsonb dump |
| [frontend/src/app/api/applications/[id]/photo/route.ts](frontend/src/app/api/applications/[id]/photo/route.ts) | S-03 — unauth photo download |
| [sql/002_seed_test_users.sql](sql/002_seed_test_users.sql) | S-04 — committed bcrypt hash for `Password123` × 10 users |
| [frontend/next.config.js](frontend/next.config.js) | S-05 — CORS `*` default + missing security headers |
| [frontend/src/lib/auth.ts](frontend/src/lib/auth.ts) | S-06 — hardcoded OTP `'123456'`; S-22 placeholder check |
| [frontend/src/app/api/superintendent/reset-password/route.ts](frontend/src/app/api/superintendent/reset-password/route.ts) | S-09 — string-interpolated `vertical` |
| [frontend/src/app/api/payments/razorpay/initiate/route.ts](frontend/src/app/api/payments/razorpay/initiate/route.ts) | S-10 — unauth + PII leak |
| [frontend/src/app/api/alumni/documents/upload/route.ts](frontend/src/app/api/alumni/documents/upload/route.ts) | S-12 — unauth 10 MB upload |
| [docker-compose.yml](docker-compose.yml), [docker-compose.prod.yml](docker-compose.prod.yml) | S-07 — plaintext secrets |
| Repository root | S-27 — `Testing.xlsx`, `MANUAL_TESTING_GUIDE*.md`, `TESTING_SUMMARY.md` |

---

*This assessment was performed through static code analysis only. Dynamic testing (penetration testing, DAST scanning) is recommended as a follow-up activity to identify runtime vulnerabilities not visible through code review.*
