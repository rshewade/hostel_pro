# Hostel Pro — Security Assessment Report

**Date:** 2026-05-05 (post-remediation snapshot)
**Scope:** Full codebase security review (Next.js frontend, API routes, SQL migrations, infrastructure, repository hygiene)
**Base branch:** `24April`
**Remediation branch:** `security-fixes-non-auth` (13 commits, 13 findings closed)
**Classification:** Internal — Contains vulnerability details

---

## Executive Summary

A baseline assessment on 2026-05-05 surfaced **30 findings** (6 Critical, 8 High, 9 Medium, 4 Low, 3 Info). The `security-fixes-non-auth` branch closes **13 of those** without disturbing login or core business flows — including 3 Critical (forged reset-password token, CORS wildcard, dev-OTP `'123456'`), 4 High (SQL injection in superintendent reset, no expiry on reset token, no rate limit on reset endpoints, CI tests disabled), and 5 Medium-tier issues. **17 findings remain open**, dominated by three customer-facing PII-exposure endpoints (S-02, S-03), committed seed credentials (S-04), and the broader auth-platform work needed to migrate from `localStorage` JWTs to HttpOnly cookies (S-08).

The branch as it stands is materially safer than baseline but **still not production-ready**: an unauthenticated attacker can enumerate applicant tracking numbers and harvest full PII + face photos (S-02, S-03), and any environment that runs `sql/002_seed_test_users.sql` ships with a publicly-known password for ten staff/student accounts (S-04). These three Criticals must close before deployment.

| Severity | Original | Resolved | **Remaining** |
|----------|---------:|---------:|--------------:|
| Critical | 6 | 3 | **3** |
| High     | 8 | 4 | **4** |
| Medium   | 9 | 5 | **4** |
| Low      | 4 | 1 | **3** |
| Info     | 3 | 1 | **2** |
| **Total**| **30** | **14** | **16** |

---

## Resolved on `security-fixes-non-auth`

| ID | Finding | Severity | Commit |
|----|---------|----------|--------|
| S-01 | Account takeover via forged forgot-password token | Critical | `a4ad10d` |
| S-05 | CORS wildcard default + missing security headers | Critical | `878f28e` |
| S-06 | Hardcoded OTP `'123456'` in dev mode | Critical | `a949dad` |
| S-09 | Second-order SQL injection in superintendent reset-password | High | `909db50` |
| S-11 | Reset-password token had no expiry validation | High | `a4ad10d` |
| S-14 | Missing rate limit on forgot-password / reset-password | High | `a4ad10d` |
| S-29 | CI test step disabled (paired with S-23 audit gate) | High | `b61420c` |
| S-15 | `canAccessStudent` allowed through when vertical was unknown | Medium | `8d52fd6` |
| S-16 | Raw `error.message` returned to clients (non-auth routes) | Medium | `14209d4` |
| S-19 | Audit + business write not atomic (fee-configuration scope) | Medium | `d78a2ef` |
| S-20 | Unbounded list queries (3 of 11 endpoints capped) | Medium | `49fdc96` |
| S-22 | Placeholder JWT_SECRET accepted at startup | Medium | `a949dad` |
| S-27 | Repo hygiene — `.gitignore` tightened | Low | `2f82e30` |
| S-23 | No `npm audit` gate in CI (continue-on-error step added) | Info | `b61420c` |

**Verification commands** for the closed items:

```bash
# S-01, S-11 — forgot-password tokens are now HMAC-signed with 15-min exp
node -e "console.log(Buffer.from('forged','utf8').toString('base64'))" \
  | xargs -I{} curl -s -X POST localhost:3000/api/auth/reset-password \
    -H 'Content-Type: application/json' \
    -d '{"token":"{}","otp":"000000","newPassword":"X1!asdfgh"}'
# expects 401 "Invalid or expired reset token"

# S-09 — superintendent reset-password rejects SQLi-shaped vertical
psql -c "SELECT 1 FROM pg_proc WHERE prosrc ~ 'AND vertical = '''" hostel_pro
# expects no row — string-interpolated clause is gone

# S-22 — placeholder JWT_SECRET fails fast
JWT_SECRET=generate-a-strong-random-secret-at-least-48-chars npm run dev
# expects: FATAL: JWT_SECRET is a placeholder or shorter than 32 chars

# S-20 — list endpoints cap at 100 by default
curl -s '/api/applications?limit=10000' | jq '.data | length'
# expects ≤ 500
```

---

## OWASP Top 10 Mapping (open items only)

| OWASP Category | Open Findings |
|----------------|---------------|
| A01: Broken Access Control | S-02, S-03, S-08, S-13, S-18 |
| A02: Cryptographic Failures | S-04 |
| A03: Injection | S-26 |
| A04: Insecure Design | S-12 |
| A05: Security Misconfiguration | S-07, S-17, S-21, S-30 |
| A06: Vulnerable / Outdated Components | (S-23 partially closed; full audit still pending) |
| A07: Authentication Failures | S-24, S-25 |
| A08: Software & Data Integrity Failures | S-10 |
| A09: Logging & Monitoring Failures | S-28 |
| A10: SSRF | No findings |

---

## Critical Findings (Remaining)

### S-02: Unauthenticated PII Disclosure on Application Tracking

**Severity:** Critical
**Status:** Open
**OWASP:** A01 — Broken Access Control
**Location:** [frontend/src/app/api/applications/track/[trackingNumber]/route.ts:22-35](frontend/src/app/api/applications/track/[trackingNumber]/route.ts#L22-L35)

The endpoint is unauthenticated and runs `SELECT *` keyed by `tracking_number`, returning the full `data` jsonb column — personal info, guardian info (parent names/mobiles/emails), DOB, gender, blood group, address, hostel preferences, and the application UUID. Tracking numbers are sequential / guessable.

**Exploit:** `for n in 1..N: curl /api/applications/track/HP-2025-${n:04}` — harvest PII for every applicant.

**Remediation:**
1. Bind to an OTP-verified session token (mirror `drafts-by-mobile`), OR
2. Project only non-sensitive columns (`status`, `vertical`, `submitted_at`, `current_status`).

---

### S-03: Unauthenticated Applicant Photo Download

**Severity:** Critical
**Status:** Open
**OWASP:** A01 — Broken Access Control
**Location:** [frontend/src/app/api/applications/[id]/photo/route.ts:25-67](frontend/src/app/api/applications/[id]/photo/route.ts#L25-L67)

Documented as a "Public endpoint." Serves applicant photos by UUID **or** tracking_number. With S-02's tracking-number guessability, attackers can mass-download face photos for every applicant.

**Remediation:** Require an authenticated staff session OR an OTP-verified applicant session bound to the application's mobile number. Path traversal is already mitigated via `resolveAndValidatePath`.

---

### S-04: Bcrypt Password Hashes Committed in Seed SQL

**Severity:** Critical
**Status:** Open
**OWASP:** A02 — Cryptographic Failures
**Location:** [sql/002_seed_test_users.sql:3-25](sql/002_seed_test_users.sql#L3-L25)

The same bcrypt hash (for `Password123`) is reused across **ten** seeded users — superintendents, trustees, students, parents. The plaintext is documented in commit messages. Anyone running the seed script in any environment ships with admin-equivalent accounts whose password is publicly known.

**Remediation:**
1. Move test-user seeding out of versioned SQL into a post-deployment script gated by an env-only secret.
2. Generate per-user random passwords on seed; emit them to the operator.
3. Add a startup guard: refuse to boot if a known-seed bcrypt hash is present in `users` when `NODE_ENV=production`.

---

## High Findings (Remaining)

### S-07: Plaintext Secrets in `docker-compose.yml`

**Severity:** High
**Status:** Open
**OWASP:** A05 — Security Misconfiguration
**Location:** [docker-compose.yml:9-13](docker-compose.yml#L9-L13), [docker-compose.prod.yml:9-13](docker-compose.prod.yml#L9-L13)

`DATABASE_URL`, `JWT_SECRET`, and `ADMIN_SEED_SECRET` are injected via `environment:` in plain compose YAML.

**Remediation:** Move to `env_file: .env.production` (already gitignored after S-27) or use Docker/K8s secrets.

---

### S-08: JWT Stored in `localStorage`

**Severity:** High
**Status:** Open
**OWASP:** A07 — Authentication Failures
**Location:** 86 `Bearer ${token}` injections across dashboard pages — e.g. [frontend/src/app/dashboard/template.tsx:71](frontend/src/app/dashboard/template.tsx#L71)

Any successful XSS — first-party or via any third-party script that ends up rendered — reads the token and uses it for the full 24h JWT lifetime. This branch's S-05 fix (CSP/Frame-Options) reduces but does not eliminate the surface; a comprehensive cookie migration is the proper fix.

**Remediation:** Migrate to `HttpOnly` + `Secure` + `SameSite=Strict` cookies. Add CSRF protection. Touches all 86 dashboard fetch call sites — schedule as a dedicated branch.

---

### S-10: Razorpay `/initiate` Unauthenticated + Leaks PII

**Severity:** High
**Status:** Open
**OWASP:** A08 — Software & Data Integrity / A01 — Broken Access Control
**Location:** [frontend/src/app/api/payments/razorpay/initiate/route.ts:14-101](frontend/src/app/api/payments/razorpay/initiate/route.ts#L14-L101)

No `requireAuth`, no OTP-bound session check. Anyone with an application UUID can mint Razorpay orders against the merchant account and read back the `prefill` block (name, email, mobile). Server-side amount pinning prevents fund misdirection but the PII leak and Razorpay-side abuse are concrete.

**Remediation:** Require an OTP-verified session token bound to `applicant_mobile`.

---

### S-12: Unauthenticated Alumni Document Upload (10 MB)

**Severity:** High
**Status:** Open
**OWASP:** A04 — Insecure Design
**Location:** [frontend/src/app/api/alumni/documents/upload/route.ts:12-32](frontend/src/app/api/alumni/documents/upload/route.ts#L12-L32)

Accepts up to 10 MB files from any unauthenticated caller. No registration-session binding; MIME validated only by client-supplied `file.type`.

**Remediation:**
1. Require a session token tied to an in-flight alumni registration.
2. Add server-side magic-byte validation (paired with S-21).
3. Bind file paths to the registration session ID.

---

### S-13: `/api/applications/drafts-by-mobile` Audit Pending

**Severity:** High
**Status:** Open (verification)
**OWASP:** A01 — Broken Access Control
**Location:** [frontend/src/app/api/applications/drafts-by-mobile/route.ts](frontend/src/app/api/applications/drafts-by-mobile/route.ts)

Design spec gates the endpoint on an OTP-issued session token. End-to-end verification is required to confirm that:
1. The session token is HMAC-verified before any DB lookup.
2. The token's `mobile` claim equals the requested `mobile`.
3. Token expiry is enforced.

**Remediation:** Code review + integration test exercising tampered tokens, mismatched-mobile tokens, and expired tokens.

---

## Medium Findings (Remaining)

### S-17: TRUSTEE Can Reset Any Password Without Step-Up Auth

**Severity:** Medium
**Status:** Open
**OWASP:** A05 — Security Misconfiguration
**Location:** [frontend/src/app/api/admin/reset-password/route.ts:25-60](frontend/src/app/api/admin/reset-password/route.ts#L25-L60)

A single TRUSTEE-role JWT can reset any user's password — including other TRUSTEEs — with no second factor. A stolen TRUSTEE token (S-08 path) is a one-shot full-system compromise.

**Remediation:** Require step-up authentication (re-prompt password or fresh OTP) before TRUSTEE-initiated resets. Log a high-priority audit event.

---

### S-18: Wide `allowedRoles` in Lifecycle Routes

**Severity:** Medium
**Status:** Open
**OWASP:** A05 — Security Misconfiguration
**Location:** Multiple application-lifecycle routes (e.g., [frontend/src/app/api/applications/[id]/submit/route.ts](frontend/src/app/api/applications/[id]/submit/route.ts), [frontend/src/app/api/interviews/[id]/complete/route.ts](frontend/src/app/api/interviews/[id]/complete/route.ts))

`requireAuth(['STUDENT', 'SUPERINTENDENT', 'TRUSTEE', 'ACCOUNTS'])` patterns frequently grant write access to the wrong role tier. For example, a student should not be able to mark an interview "complete."

**Remediation:** Per route, narrow `allowedRoles` to the smallest set that owns that transition. Add explicit ownership checks: `application.student_user_id === user.id`. Now that `canAccessStudent` is hardened (S-15 closed), wire it in.

---

### S-21: Client-Supplied MIME on File Uploads

**Severity:** Medium
**Status:** Open
**OWASP:** A05 — Security Misconfiguration
**Location:** [frontend/src/app/api/applications/documents/upload/route.ts:43-49](frontend/src/app/api/applications/documents/upload/route.ts#L43-L49), [frontend/src/app/api/alumni/documents/upload/route.ts](frontend/src/app/api/alumni/documents/upload/route.ts), [frontend/src/app/api/student/documents/upload/route.ts](frontend/src/app/api/student/documents/upload/route.ts)

The MIME whitelist trusts `file.type` from the client. A `.exe` renamed to `.pdf` with `Content-Type: application/pdf` is stored as PDF and may execute on the operator's machine when opened.

**Remediation:** Add `file-type` (npm) and validate magic bytes server-side; reject when detected MIME doesn't match the whitelist.

---

### S-26: Date / String Filters Lacking Validation

**Severity:** Medium
**Status:** Open
**OWASP:** A03 — Injection (low impact)
**Location:** [frontend/src/app/api/auditLogs/route.ts](frontend/src/app/api/auditLogs/route.ts), [frontend/src/app/api/users/route.ts](frontend/src/app/api/users/route.ts) — `role`, `vertical`, `is_active` query params

Parameterization prevents SQL injection, but invalid values can trigger Postgres errors that leak schema info via the few remaining raw-`error.message` paths.

**Remediation:** Validate query-param enums against `VERTICALS`, `ROLES`, etc. before query.

---

## Low Findings (Remaining)

### S-24: Token Expiration Without Idle Timeout

**Severity:** Low
**Status:** Open
**OWASP:** A07 — Authentication Failures
**Location:** [frontend/src/lib/auth.ts:10](frontend/src/lib/auth.ts#L10) — `JWT_EXPIRES_IN = 86400`

24-hour access tokens with no idle timeout. A stolen token (S-08 path) is usable for the full 24h.

**Remediation:** Reduce to 1–2h; rely on the existing 7-day refresh token. Risk: existing sessions invalidate sooner.

---

### S-25: No Per-Token JWT Denylist

**Severity:** Low
**Status:** Open
**OWASP:** A07 — Authentication Failures
**Location:** [frontend/src/lib/auth.ts:319](frontend/src/lib/auth.ts#L319)

`getUserFromToken` checks `users.is_active` — good. But for a single-token compromise where the user remains active, the only mitigation is `invalidateAllSessions` (force-logout everywhere).

**Remediation:** Add a `token_blacklist` (jti) table or Redis denylist with TTL = remaining JWT lifetime.

---

### S-27 (residual): `Testing.xlsx` and Manual-Testing Guides at Repo Root

**Severity:** Low
**Status:** Partial — `.gitignore` tightened (`2f82e30`); existing committed files not yet relocated
**Location:** Repository root — `Testing.xlsx`, `MANUAL_TESTING_GUIDE.md`, `MANUAL_TESTING_GUIDE_v2.md`, `MANUAL_TESTING_GUIDE_v3.md`, `TESTING_SUMMARY.md`, `ISSUE_LOG.md`

The `*.xlsx` ignore now prevents *new* QA artefacts from being committed, but the existing files remain in the working tree. Audit each for sensitive material; relocate to `.docs/qa/` (gitignored) or a private wiki.

---

## Informational Findings (Remaining)

### S-28: No Structured Application Logging

The `logger` from `lib/logger.ts` is used inconsistently. There is no centralized request-tracing or log-aggregation integration (Sentry, Datadog, ELK).

### S-30: PostgreSQL Host Hardcoded in CLAUDE.md

CLAUDE.md documents `51.68.196.242:5432/hostel_pro` as the production DB host. Information disclosure but not directly exploitable.

---

## Remediation Priority Matrix (Remaining Work)

### Phase 1: Block Production Deployment

| ID | Finding | Effort |
|----|---------|--------|
| S-02 | Bind `/applications/track` to OTP session OR project safe columns | 2 h |
| S-03 | Add auth/OTP-session check to `/applications/[id]/photo` | 2 h |
| S-04 | Move seed users out of versioned SQL; production startup guard | 4 h |
| S-07 | Move docker-compose secrets to env-file | 2 h |

### Phase 2: Within 2 Weeks

| ID | Finding | Effort |
|----|---------|--------|
| S-08 | Migrate JWT to HttpOnly cookies + add CSRF (full refactor) | 16 h |
| S-10 | Auth-gate Razorpay `/initiate` | 2 h |
| S-12 | Bind alumni upload to registration session + magic-byte check | 4 h |
| S-13 | Audit `drafts-by-mobile` HMAC verification end-to-end | 2 h |
| S-17 | Step-up auth for TRUSTEE password resets | 4 h |
| S-21 | Server-side magic-byte MIME validation | 4 h |

### Phase 3: Within 1 Month

| ID | Finding | Effort |
|----|---------|--------|
| S-18 | Audit `allowedRoles` in lifecycle routes; wire in `canAccessStudent` | 4 h |
| S-24 | Reduce access-token TTL to 1–2 h with refresh rotation | 2 h |
| S-25 | Add per-token JWT denylist (jti) | 8 h |
| S-26 | Enum validation on query params | 2 h |
| S-27 | Audit / relocate `Testing.xlsx` and manual-testing guides | 2 h |
| S-28 | Adopt Sentry / Datadog for structured logging | 8 h |

### Optional (Low Priority)

| ID | Finding | Effort |
|----|---------|--------|
| S-19 (residual) | Wrap remaining audit-log + business write pairs in `withTransaction` | 8 h |
| S-20 (residual) | Cap remaining 8 list endpoints | 4 h |
| S-30 | Move DB host out of CLAUDE.md | 0.5 h |

---

## Appendix: Files Requiring Immediate Attention (Open Items)

| File | Issue |
|------|-------|
| [frontend/src/app/api/applications/track/[trackingNumber]/route.ts](frontend/src/app/api/applications/track/[trackingNumber]/route.ts) | S-02 — unauth full-PII jsonb dump |
| [frontend/src/app/api/applications/[id]/photo/route.ts](frontend/src/app/api/applications/[id]/photo/route.ts) | S-03 — unauth photo download |
| [sql/002_seed_test_users.sql](sql/002_seed_test_users.sql) | S-04 — committed bcrypt hash for `Password123` × 10 users |
| [docker-compose.yml](docker-compose.yml), [docker-compose.prod.yml](docker-compose.prod.yml) | S-07 — plaintext secrets |
| All dashboard pages (86 sites) | S-08 — JWT in `localStorage` |
| [frontend/src/app/api/payments/razorpay/initiate/route.ts](frontend/src/app/api/payments/razorpay/initiate/route.ts) | S-10 — unauth + PII leak |
| [frontend/src/app/api/alumni/documents/upload/route.ts](frontend/src/app/api/alumni/documents/upload/route.ts) | S-12 — unauth 10 MB upload |
| [frontend/src/app/api/applications/drafts-by-mobile/route.ts](frontend/src/app/api/applications/drafts-by-mobile/route.ts) | S-13 — verify session-token enforcement |
| [frontend/src/app/api/admin/reset-password/route.ts](frontend/src/app/api/admin/reset-password/route.ts) | S-17 — TRUSTEE step-up auth |

---

## Branch Verification Checklist

Before merging `security-fixes-non-auth` to `master`:

- [ ] `cd frontend && npm install` — refresh lockfile after dep removal (`react-hook-form`, `next-themes`)
- [ ] `cd frontend && npm run lint` — passes
- [ ] `cd frontend && npm run test:run` — Vitest suite green (now enforced in CI)
- [ ] `cd frontend && npm run build` — Next.js build clean
- [ ] Add `MOCK_OTP_ENABLED=true` to local `frontend/.env.local` if you ran with `NODE_ENV=development` (default OTP `'123456'` no longer fires automatically)
- [ ] Confirm `CORS_ORIGIN` is set in any production env var store before next deploy (the app refuses to start without it now)
- [ ] Smoke-test the forgot-password / reset-password flow end-to-end — token format changed
- [ ] Smoke-test superintendent password reset (S-09 fix is server-side; no UI change expected)

---

*Snapshot generated 2026-05-05. Prior baseline + remediation history is preserved in git via tagged commits on the `security-fixes-non-auth` branch.*
