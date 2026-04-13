# Issue Log: Hostel Pro

## Status Legend
- [ ] Open
- [x] Resolved

---

## CRITICAL Priority (Production Blockers)

### ISSUE-16: Database credentials and JWT secret exposed in code
- **Files:**
  - `frontend/.env` — plaintext DB password and weak JWT secret
  - `frontend/src/lib/auth.ts:6` — hardcoded fallback `'dev-secret-change-in-production'`
  - `frontend/src/app/api/admin/seed-auth-users/route.ts:38` — fallback `'hostel-admin-seed-2024'`
- **Description:** Real PostgreSQL credentials (username, password, server IP) in `.env`. JWT secret is a readable placeholder. Admin seed secret has a guessable default fallback. All must be rotated and secured before any deployment.
- [ ] Open

### ISSUE-17: SQL injection in allocations update endpoint
- **File:** `frontend/src/app/api/allocations/[id]/route.ts:74-87`
- **Description:** Dynamic SQL built from request body keys without whitelisting. Attacker can set arbitrary DB columns (e.g., `created_at`, `user_id`). Must whitelist allowed fields.
- [ ] Open

### ISSUE-18: 7 missing API endpoints — dashboards will crash
- **Description:** Frontend pages call these endpoints but they don't exist:
  1. `/api/receivables` — called by `dashboard/accounts/page.tsx:97`
  2. `/api/transactions` — called by `dashboard/accounts/page.tsx:98`
  3. `/api/students` — called by superintendent dashboards
  4. `/api/superintendent/exit-clearance` — called by `dashboard/superintendent/clearance/page.tsx:35`
  5. `/api/superintendent/exit-clearance/export` — called by `dashboard/superintendent/clearance/page.tsx:131`
  6. `/api/clearance-items/{id}` (PATCH) — called by `dashboard/superintendent/clearance/page.tsx:65`
  7. `/api/clearance-items/bulk` — called by `dashboard/superintendent/clearance/page.tsx:99`
- **Impact:** Accounts dashboard and superintendent clearance page completely broken.
- [ ] Open

### ISSUE-19: Missing database columns referenced by API routes
- **Description:** API routes try to SET/READ columns that don't exist in `sql/001_create_schema.sql`:
  - `applications` table: `reviewed_at`, `approved_at`, `rejected_at` — only `submitted_at` exists
  - `leave_requests` table: `approved_at`, `rejected_at`, `rejection_reason` — not in schema
- **Files:**
  - `frontend/src/app/api/applications/[id]/route.ts:85-100`
  - `frontend/src/app/api/leaves/[id]/approve/route.ts:42`
  - `frontend/src/app/api/leaves/[id]/reject/route.ts:65`
- [ ] Open

### ISSUE-20: Unauthenticated document upload endpoint
- **File:** `frontend/src/app/api/applications/documents/upload/route.ts:14-16`
- **Description:** `POST` handler has zero authentication. Anyone can upload files claiming any application ID. Must add `requireAuth()` and verify ownership.
- [ ] Open

### ISSUE-21: No rate limiting on auth endpoints
- **Files:**
  - `frontend/src/app/api/auth/login/route.ts`
  - `frontend/src/app/api/otp/send/route.ts`
  - `frontend/src/app/api/otp/verify/route.ts`
- **Description:** No rate limiting, no brute-force protection on login, OTP send, or OTP verify. Allows unlimited attempts.
- [ ] Open

### ISSUE-22: OTP and temporary passwords logged to console
- **Files:**
  - `frontend/src/app/api/otp/send/route.ts:68-75` — logs OTP code
  - `frontend/src/app/api/applications/[id]/route.ts:316` — logs temp password
  - `frontend/src/app/api/auth/login/route.ts:56-131` — logs email, user ID
- **Description:** Sensitive auth secrets visible in server logs. Remove all `console.log` of passwords, OTP codes, and PII.
- [ ] Open

### ISSUE-23: Test suite 40% failure rate
- **Description:** 533 test failures across 24 test files (out of 1311 total tests). Primary cause: `useLanguage must be used within a LanguageProvider` — context provider not wrapped in test setup.
- **File:** `frontend/vitest.setup.ts` — missing LanguageProvider wrapper in test utilities
- [ ] Open

---

## HIGH Priority

### ISSUE-24: No CSRF protection
- **Description:** No CSRF tokens, no SameSite cookie settings configured. POST requests from any origin accepted.
- [ ] Open

### ISSUE-25: No security headers (CSP, X-Frame-Options, etc.)
- **File:** `frontend/next.config.js`
- **Description:** No Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, or HSTS headers configured. Minimal config: `{ output: 'standalone' }`.
- [ ] Open

### ISSUE-26: Multi-step DB operations not wrapped in transactions
- **Files:**
  - `frontend/src/app/api/allocations/route.ts:96-130` — INSERT + UPDATE + AUDIT (3 separate queries)
  - `frontend/src/app/api/applications/[id]/route.ts` — UPDATE + AUDIT (2 queries)
  - `frontend/src/app/api/leaves/[id]/approve/route.ts` — UPDATE + AUDIT (2 queries)
- **Description:** If any query fails mid-operation, database becomes inconsistent. Must wrap in `BEGIN/COMMIT/ROLLBACK`.
- [ ] Open

### ISSUE-27: File upload has no size or type validation
- **Files:**
  - `frontend/src/app/api/applications/documents/upload/route.ts`
  - `frontend/src/app/api/student/documents/upload/route.ts`
- **Description:** No file size limit, no server-side MIME type verification, no extension whitelist. Should restrict to PDF/JPG/PNG, max 10MB.
- [ ] Open

### ISSUE-28: No error boundaries — component crash = blank screen
- **Description:** Zero `error.tsx` files exist in the app directory. No React error boundaries. If any dashboard component throws, the entire page goes blank with no recovery option.
- [ ] Open

### ISSUE-29: No structured logging or monitoring
- **Description:** Only `console.log()` / `console.error()` throughout codebase. No centralized logging (Winston/Pino), no APM, no request tracing, no error aggregation. Health check exists at `/api/health` but no alerting.
- [ ] Open

### ISSUE-30: No database migration system
- **Description:** Raw SQL files only (`sql/001_create_schema.sql`). No migration framework (Knex/Drizzle/Prisma), no version tracking, no rollback capability. Risk of schema drift between environments.
- [ ] Open

### ISSUE-31: OTP session token uses weak randomness
- **File:** `frontend/src/app/api/otp/verify/route.ts:70-77`
- **Description:** Session token built with `Math.random().toString(36)` (cryptographically weak), Base64-encoded (easily decoded), no expiry check. Should use `crypto.randomBytes()` with 5-minute TTL.
- [ ] Open

### ISSUE-32: Inconsistent password policies across endpoints
- **Files:**
  - `frontend/src/app/api/admin/reset-password/route.ts` — accepts 6-char passwords
  - `frontend/src/app/api/auth/reset-password/route.ts` — requires 8 chars + complexity
- **Description:** Two different password strength requirements depending on which endpoint is used. Must enforce consistent policy (minimum 12 chars recommended).
- [ ] Open

### ISSUE-33: CI/CD pipeline has tests disabled
- **File:** `.github/workflows/ci.yml`
- **Description:** Tests are commented out in CI pipeline. Code changes are not validated before merge.
- [ ] Open

### ISSUE-34: No environment variable validation at startup
- **File:** `frontend/src/lib/auth.ts`, `frontend/src/lib/db.ts`
- **Description:** Missing env vars silently fall back to insecure defaults. Should validate required vars (DATABASE_URL, JWT_SECRET) at startup and fail fast if missing.
- [ ] Open

### ISSUE-35: Admin endpoints use shared secret instead of JWT auth
- **Files:**
  - `frontend/src/app/api/admin/seed-auth-users/route.ts`
  - `frontend/src/app/api/admin/reset-password/route.ts`
- **Description:** Admin operations authenticated via a shared secret string in request body, not proper role-based JWT auth. GET endpoint only checks token presence, not role.
- [ ] Open

---

## MEDIUM Priority

### ISSUE-36: No HTTPS enforcement or HSTS header
- **Description:** No forced HTTPS redirect in next.config.js. No Strict-Transport-Security header.
- [ ] Open

### ISSUE-37: Path traversal protection uses string prefix instead of canonical path
- **File:** `frontend/src/app/api/files/serve/route.ts:35-39`
- **Description:** File path check uses `startsWith()` which is vulnerable to symlink bypass. Should use `path.resolve()` and check canonical path.
- [ ] Open

### ISSUE-38: 30+ uses of `any` type in API layer
- **Files:** `frontend/src/lib/api/responses.ts`, `frontend/src/lib/api/index.ts`, `frontend/src/components/AllocationModal.tsx`, `frontend/src/app/dashboard/accounts/page.tsx`, and others
- **Description:** Type safety compromised across API responses and data transformations. Should create proper TypeScript interfaces.
- [ ] Open

### ISSUE-39: 12 raw `<img>` tags instead of `next/image`
- **Description:** 12 instances of `<img>` tag found in source. Should use `next/image` for automatic optimization, lazy loading, and responsive sizing.
- [ ] Open

### ISSUE-40: No code splitting — zero `dynamic()` imports
- **Description:** All 220 components loaded upfront. No `React.lazy()` or Next.js `dynamic()` imports. Non-critical components should be lazily loaded.
- [ ] Open

### ISSUE-41: Missing SEO metadata on dynamic routes
- **Description:** No `generateMetadata()` on dynamic routes. No Open Graph tags, Twitter Card tags, JSON-LD structured data, robots.txt, or sitemap.xml.
- [ ] Open

### ISSUE-42: Leave type mapping mismatch between frontend and backend
- **File:** `frontend/src/app/api/leaves/route.ts:100-125`
- **Description:** Backend enum has `SHORT_LEAVE`, `NIGHT_OUT`, `HOME_VISIT`, `MEDICAL`, etc. Frontend only defines `short`, `night-out`, `multi-day`. Types don't round-trip correctly — `HOME_VISIT` and `MEDICAL` both map to `multi-day`.
- [ ] Open

### ISSUE-43: Docker config references old Supabase environment variables
- **File:** `frontend/docker-compose.yml`
- **Description:** Lists `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` which are no longer used after PostgreSQL migration. Must update to current env vars.
- [ ] Open

### ISSUE-44: No accessibility (WCAG) audit
- **Description:** Some ARIA attributes exist (23+ instances) but no comprehensive audit. Missing: alt text validation, keyboard navigation testing, color contrast validation, screen reader testing. Must validate WCAG 2.1 AA compliance.
- [ ] Open

### ISSUE-45: Audit log access too broad
- **File:** `frontend/src/app/api/auditLogs/route.ts:16-17`
- **Description:** SUPERINTENDENT can view all audit logs. Should be restricted to TRUSTEE and ACCOUNTS only.
- [ ] Open

### ISSUE-46: Predictable temporary passwords
- **File:** `frontend/src/app/api/admin/seed-auth-users/route.ts:101-107`
- **Description:** Temp passwords follow pattern `Hostel@{trackingNumber}`. Attacker knowing tracking numbers can guess credentials. Should use `crypto.randomBytes()`.
- [ ] Open

### ISSUE-47: Database connection has no SSL and no query timeout
- **File:** `frontend/src/lib/db.ts`
- **Description:** PostgreSQL connection string has no `?sslmode=require`. No `statement_timeout` configured. Connection pool size of 20 may allow connection exhaustion.
- [ ] Open

### ISSUE-48: ISSUE-12 is outdated — Supabase fully removed
- **Description:** ISSUE-12 references Supabase as "fully configured and active" but Supabase was completely removed in the PostgreSQL migration (commit `21f21b2`). This issue should be marked as superseded.
- [ ] Open (update ISSUE-12 status)

---

## LOW Priority

### ISSUE-49: Unused dependency `react-router-dom` in package.json
- **File:** `frontend/package.json`
- **Description:** Next.js uses its own built-in router. `react-router-dom` has 0 imports in source. Should remove.
- [ ] Open

### ISSUE-50: No CORS configuration
- **Description:** No explicit CORS headers configured. Defaults to accepting requests from any origin. Should restrict to known frontend domains in production.
- [ ] Open

### ISSUE-51: Hindi i18n framework not implemented
- **Description:** Devanagari font (`Noto_Sans_Devanagari`) loaded in layout but no i18n framework (next-i18next). Translation relies on ad-hoc `t()` function. If Hindi is required, need proper i18n setup. If English-only, remove unused font.
- [ ] Open

### ISSUE-52: No dependency vulnerability scanning in CI
- **Description:** No `npm audit` or Dependabot configured in CI pipeline. Vulnerable packages may go undetected.
- [ ] Open

---

## FUNCTIONALITY Issues (Broken Features)

### ISSUE-53: Students cannot view their own room allocation (auth blocks them)
- **File:** `frontend/src/app/api/allocations/route.ts:20`
- **Description:** `GET /api/allocations` requires `['SUPERINTENDENT', 'TRUSTEE']` role. Student dashboard pages (`student/page.tsx:88`, `student/room/page.tsx:85`, `student/room/check-in/page.tsx:85`) call this API with `?student_id={id}` but get 401. Students cannot see their own room, check-in, or allocation info. The API also ignores the `student_id` query parameter — it returns ALL allocations.
- **Fix:** Added STUDENT to allowed roles. Students auto-filter to own allocations via JWT. Staff can filter by `?student_id=`.
- [x] Resolved

### ISSUE-54: Cannot approve/reject renewals — PUT method missing
- **File:** `frontend/src/app/api/renewals/route.ts`
- **Description:** Superintendent renewal page (`superintendent/renewal/page.tsx:74,87`) sends PUT requests to approve/reject renewals, but `/api/renewals/route.ts` only exports GET. Requests return 405 Method Not Allowed.
- **Fix:** Added PUT handler that accepts `{ id, action: 'APPROVE'|'REJECT', remarks }`. Rejects vacate the allocation; approves keep it active. Audit logged.
- [x] Resolved

### ISSUE-55: Accounts dashboard completely broken — 2 missing API endpoints
- **File:** `frontend/src/app/dashboard/accounts/page.tsx:97-98`
- **Description:** Page fetches from `/api/receivables` and `/api/transactions` — neither endpoint exists. Accounts dashboard shows no financial data.
- **Fix:** Created `/api/receivables/route.ts` (queries `fees` + `users`) and `/api/transactions/route.ts` (queries `transactions` + `fees` + `users`). Both support `?status=` and `?vertical=` filters. Also fixed page to unwrap `{ data }` response wrapper.
- [x] Resolved

### ISSUE-56: Superintendent clearance page broken — 4 missing API endpoints
- **File:** `frontend/src/app/dashboard/superintendent/clearance/page.tsx`
- **Description:** Page calls 4 non-existent endpoints:
  1. `GET /api/superintendent/exit-clearance` (line 35) — load clearance requests
  2. `PATCH /api/clearance-items/{id}` (line 65) — update item status
  3. `POST /api/clearance-items/bulk` (line 99) — bulk update items
  4. `GET /api/superintendent/exit-clearance/export` (line 131) — CSV export
- **Fix:** Created all 4 routes querying `exit_requests`, `exit_clearance_items`, `users`, `rooms` tables. Superintendent vertical-filtered. Export returns CSV. Bulk supports APPROVE_ALL/CLEAR_ALL/RESET_ALL actions.
- [x] Resolved

### ISSUE-57: Missing `/api/students` endpoint
- **File:** `frontend/src/app/dashboard/table-template.tsx:42`
- **Description:** Fetches from `/api/students` which doesn't exist. Note: `table-template.tsx` itself is an orphaned file not imported anywhere (see ISSUE-63), so this may be moot if the file is removed.
- [ ] Open

---

## CLEANUP Issues (Unused / Dead Code to Remove)

### ISSUE-58: Remove unused tracking components (3 files)
- **Files:**
  - `frontend/src/components/tracking/OtpVerification.tsx`
  - `frontend/src/components/tracking/TrackingIdForm.tsx`
  - `frontend/src/components/tracking/TrackingPage.tsx`
- **Description:** These components are never imported anywhere. The tracking flow logic is implemented directly in `/track/page.tsx`. These are dead code.
- [ ] Open

### ISSUE-59: Remove unused shadcn components (3 files)
- **Files:**
  - `frontend/src/components/shadcn/tooltip.tsx` — custom `feedback/Tooltip.tsx` used instead
  - `frontend/src/components/shadcn/switch.tsx` — never imported
  - `frontend/src/components/shadcn/separator.tsx` — never imported
- **Description:** These shadcn component wrappers were generated but never used in the app.
- [ ] Open

### ISSUE-60: Remove unused document utility files (5 files)
- **Files:**
  - `frontend/src/components/documents/rolePermissions.ts`
  - `frontend/src/components/documents/printConstants.ts`
  - `frontend/src/components/documents/apiIntegration.ts`
  - `frontend/src/components/documents/retentionPolicies.ts`
  - `frontend/src/components/documents/auditMetadataTypes.ts`
- **Description:** These files define permissions, print layouts, API helpers, retention policies, and audit types for the documents module but are never imported anywhere in the codebase. Dead code.
- [ ] Open

### ISSUE-61: Remove demo and design-system pages (4 pages)
- **Files:**
  - `frontend/src/app/demo/page.tsx` — persona selector demo
  - `frontend/src/app/design-system/page.tsx` — component showcase
  - `frontend/src/app/communication-demo/page.tsx` — communication module demo
  - `frontend/src/app/communication-advanced-demo/page.tsx` — advanced communication demo
- **Description:** Internal development/testing pages not linked from app navigation. Should not ship to production. Publicly accessible at `/demo`, `/design-system`, etc.
- [ ] Open

### ISSUE-62: Remove unreachable admin dashboard pages (3 pages)
- **Files:**
  - `frontend/src/app/dashboard/admin/biometric/page.tsx`
  - `frontend/src/app/dashboard/admin/mess/page.tsx`
  - `frontend/src/app/dashboard/admin/visitor/page.tsx`
- **Description:** These are `FutureModulePage` placeholders under `/dashboard/admin/` but the ADMIN role was removed (ISSUE-13). No navigation links to these pages. Unreachable dead routes.
- [ ] Open

### ISSUE-63: Remove orphaned `table-template.tsx`
- **File:** `frontend/src/app/dashboard/table-template.tsx`
- **Description:** Not a page (not in a directory with `page.tsx`), not imported by any component. Appears to be a development reference template. Calls `/api/students` which also doesn't exist.
- [ ] Open

### ISSUE-64: Remove unused `react-router-dom` dependency
- **File:** `frontend/package.json`
- **Description:** `react-router-dom@^7.11.0` is listed as a dependency but has zero imports in the source. Next.js uses its own built-in router (`next/navigation`).
- [ ] Open

### ISSUE-65: Remove orphaned backup test file
- **Files:**
  - `frontend/tests/Task12/Task12-SuperintendentDashboard.test.tsx.backup`
  - `.taskmaster/tasks/tasks.json.backup`
- **Description:** Backup files checked into the repo. Should be removed and added to `.gitignore`.
- [ ] Open

### ISSUE-66: Remove duplicate AllocationModal at root components
- **File:** `frontend/src/components/AllocationModal.tsx`
- **Description:** Appears to be an older version. The actively used one lives at `frontend/src/app/dashboard/trustee/_components/AllocationModal.tsx`. Root version is likely unused.
- [ ] Open

### ISSUE-67: Remove Supabase references from Dockerfile
- **File:** `frontend/Dockerfile:12-16`
- **Description:** Build args `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are from the pre-migration era. Supabase was fully removed in commit `21f21b2`.
- [ ] Open

---

---

## Resolved Issues

### ISSUE-01: PublicLayout.tsx missing `"use client"` and `React` import
- **File:** `frontend/src/components/public/PublicLayout.tsx`
- **Lines:** 1, 4
- **Description:** Missing `"use client"` directive. Also uses `React.ReactNode` type without importing `React`.
- **Fix:** Added `"use client"` at top and changed to `import { type ReactNode } from 'react'`.
- [x] Resolved

### ISSUE-02: Contact page toast replaced with `window.alert()`
- **File:** `frontend/src/app/contact/page.tsx`
- **Lines:** 23-26
- **Description:** The source used a polished toast notification. The ported version used `window.alert()` — a UX regression.
- **Fix:** Imported `toast` from `sonner`, replaced `alert(...)` with `toast.success(...)`.
- [x] Resolved

### ISSUE-03: Home page fully client-rendered — defeats SSR/SEO
- **File:** `frontend/src/app/page.tsx`
- **Line:** 1
- **Description:** The entire landing page is marked `"use client"`, so all content (hero, mission, institutions, news) is client-side rendered. This undermines Next.js SSR benefits for the most SEO-critical page. The `useLanguage` hook forces client rendering.
- **Impact:** Search engines may not index landing page content properly.
- **Fix:** Consider extracting static content into server components and wrapping only interactive parts (language toggle) in client boundaries. Acceptable for prototype phase.
- [ ] Open (deferred — acceptable for prototype)

### ISSUE-04: Admissions page Button variant changed from `accent` to `secondary`
- **File:** `frontend/src/app/admissions/[id]/page.tsx`
- **Line:** ~161
- **Description:** Source uses `variant="accent"` for the primary CTA button. Ported version incorrectly used `variant="secondary"`.
- **Fix:** Changed back to `variant="accent"`.
- [x] Resolved

### ISSUE-05: `<Image fill>` missing `sizes` prop (performance)
- **Files:**
  - `frontend/src/components/public/PageHero.tsx`
  - `frontend/src/components/public/Hero.tsx`
  - `frontend/src/components/public/InstitutionsOverview.tsx`
- **Description:** Next.js `<Image>` with `fill` prop should have a `sizes` attribute for optimal responsive image loading.
- **Fix:** Added `sizes="100vw"` to full-width hero images and responsive sizes to card images.
- [x] Resolved

### ISSUE-06: Shield emoji dropped from Admin Panel label in header
- **File:** `frontend/src/components/public/PublicHeader.tsx`
- **Line:** ~50
- **Description:** Source had a shield emoji prefix on the "Admin Panel" Hindi label. The ported version dropped it.
- **Fix:** Added the shield emoji back: `t('Admin Panel', '🛡️ व्यवस्थापक')`.
- [x] Resolved

### ISSUE-07: Alumni Portal button on Hero links to 404
- **File:** `frontend/src/components/public/Hero.tsx`
- **Line:** ~92
- **Description:** The "Alumni Portal" CTA button in the home page hero links to `/alumni/boys-hostel`, which is a non-existent route. The alumni home page is at `/alumni`.
- **Fix:** Changed `href="/alumni/boys-hostel"` to `href="/alumni"`.
- [x] Resolved

### ISSUE-08: Donate button style inconsistent with other Hero CTA buttons
- **File:** `frontend/src/components/public/Hero.tsx`
- **Line:** ~99
- **Description:** The "Donate" button uses `variant="outline"` with custom override classes, while the other two buttons use filled variants. Looks visually inconsistent.
- **Fix:** Changed to `variant="secondary"` to match the Alumni Portal button style.
- [x] Resolved

### ISSUE-09: "Apply for Admission" button links directly to Boys Hostel instead of application landing page
- **File:** `frontend/src/components/public/Hero.tsx`
- **Lines:** ~86-90
- **Description:** The "Apply for Admission" CTA button links to `/admissions/boys-hostel` directly. Should link to the application landing page where users can choose their vertical. Also renamed from "Apply for Admission" to "Admissions".
- **Fix:** Changed `href` to `/apply` and label to `t('Admissions', 'प्रवेश')`.
- [x] Resolved

### ISSUE-10: No language toggle on internal pages — need a shared PrivateHeader component
- **Files:**
  - `frontend/src/app/dashboard/template.tsx` — dashboard sidebar/header (all dashboard pages)
  - `frontend/src/app/apply/*/page.tsx` — apply flow pages have their own header
  - `frontend/src/app/track/page.tsx` — tracking page has its own header
  - `frontend/src/app/login/page.tsx` — login pages have their own layout
- **Description:** The EN/HI language toggle only exists in `PublicHeader.tsx` (public pages). Dashboard, apply, track, and login pages all have their own custom headers with no language toggle. Users on these pages cannot switch to Hindi despite all strings being translated.
- **Fix:** Create a shared **PrivateHeader** component (similar pattern to `PublicHeader.tsx`) for internal/authenticated pages that includes:
  1. Language toggle (EN/HI)
  2. Role-based navigation for internal dashboards (Student, Parent, Superintendent, Trustee, Accounts)
  3. User profile / logout controls
  4. Logo and branding
  - Replace the current custom headers in `dashboard/template.tsx`, apply flow, track, and login pages with this shared PrivateHeader.
- [ ] Open

### ISSUE-11: Hardcoded mock data in dashboard pages that should come from database
- **Description:** 4 dashboard pages had hardcoded mock data instead of API-fetched data.
- **Fix:**
  1. `trustee/applications` — superintendent ID, name, interview details now from API data with fallbacks
  2. `student/renewal` — fetches profile from `/api/auth/session` + `/api/users/profile`, renewal from `/api/renewals`
  3. `superintendent/renewal` — fetches renewal records from `/api/renewals`, shows empty state if none
  4. `trustee/interviews` — fetches from `/api/interviews`, uses actual dates/times/modes
- [x] Resolved

### ISSUE-12: Supabase connection status and database readiness
- **Status:** ~~Supabase is fully configured and active.~~ **SUPERSEDED** — Supabase was fully removed in commit `21f21b2` (April 1, 2026). App now uses direct PostgreSQL + custom JWT auth. See ISSUE-14 and ISSUE-48.
- [x] Resolved (superseded by PostgreSQL migration)

### ISSUE-15: Add Swagger UI for Next.js API routes
- **Description:** After removing the NestJS backend, we lost the Swagger interactive API docs that were at `localhost:3001/api/docs`. Need to add Swagger UI for the Next.js API routes for developer testing convenience.
- **Fix:**
  1. Install `next-swagger-doc` and `swagger-ui-react`
  2. Create `/api/docs` page with Swagger UI
  3. Add `@swagger` JSDoc comments to each API route handler
  4. Auto-generate OpenAPI spec from the JSDoc comments
- **Priority:** Low — developer convenience, not blocking any functionality
- [ ] Open

### ISSUE-13: Remove ADMIN role — not in PRD
- **Description:** ADMIN role was not in PRD. Removed from application code and database.
- **Fix:**
  1. Deleted admin user from PG (nulled audit_logs references first)
  2. Removed ADMIN from `sql/001_create_schema.sql` enum and `sql/002_seed_test_users.sql`
  3. Removed ADMIN from accounts page `UserRole` type and filter dropdown
  4. Removed ADMIN from `exit/types.ts` `ClearanceDepartment` type
  5. PG enum still has ADMIN value (can't drop from enum) but no rows use it
  6. Admin login now returns "Invalid credentials" — confirmed
- [x] Resolved

### ISSUE-14: Remove NestJS backend — consolidate on Next.js API routes
- **Description:** The app had two API layers duplicating each other. Decision: keep only Next.js API routes.
- **Fix:**
  1. Deleted `backend/` directory entirely
  2. Removed `dev:backend`, `dev:all`, `build:backend` scripts from root `package.json`
  3. Added `backend/` to `.gitignore`
  4. Updated `CLAUDE.md` — architecture section reflects single-tier (Next.js only)
  5. Updated `MIGRATION.md` — Phase 5 marked as removed, Phase 6-7 scoped to frontend only
- [x] Resolved

---

## Completed Milestones

### MILESTONE-01: Unified UI components on shadcn
- **Scope:** Replaced custom `components/ui/` (Button, Badge, Chip, Tag, Icons) with extended shadcn wrappers in `components/shadcn/`
- **Files changed:** 67 files had imports updated
- **Created:** `button-extended.tsx`, `badge-extended.tsx`, `chip.tsx`, `tag.tsx` — preserve full custom API (loading, leftIcon, rightIcon, iconOnly, fullWidth, active, variant mapping `primary`→`default`)
- **Deleted:** Entire `components/ui/` directory
- [x] Complete

### MILESTONE-02: Hindi translation added to all app pages
- **Scope:** 71 pages now have `useLanguage` + `t()` bilingual support
- **Skipped (by design):** 7 pages — home page (delegates to translated components), demo pages, design-system pages, DPDP policy (legal review needed)
- **Fixed:** Apostrophe syntax errors in `t('We'll...')` → `t("We'll...")`
- [x] Complete

---

## INFO (No Action Required)

### INFO-01: Next.js 16 async params pattern
- **Files:** `institutions/[id]/page.tsx`, `admissions/[id]/page.tsx`
- **Description:** Uses `params: Promise<{ id: string }>` with `React.use(params)` — correct for Next.js 16.1.0.

### INFO-02: shadcn `ElementRef` deprecation warnings
- **Files:** Multiple shadcn components (accordion, tabs, dropdown-menu, dialog, etc.)
- **Description:** `React.ElementRef` is deprecated in newer React types but still functional. Standard shadcn/ui patterns — won't cause build failures.

### INFO-03: All alumni pages pass audit
- **Files:** All 10 `frontend/src/app/alumni/*.tsx` pages
- **Description:** Zero issues found. All React Router leftovers removed, toast properly uses sonner, imports correct, content preserved.

### INFO-04: Tailwind v4 + shadcn/ui compatibility verified
- **Description:** All shadcn components use Tailwind utility classes (not inline `hsl(var(...))` in className). The `@theme` block in `globals.css` properly registers all semantic colors. No compatibility issues.
