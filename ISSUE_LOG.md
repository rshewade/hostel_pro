# Issue Log: webpages/ → frontend/ Migration

## Status Legend
- [ ] Open
- [x] Resolved

---

## HIGH Priority

### ISSUE-01: PublicLayout.tsx missing `"use client"` and `React` import
- **File:** `frontend/src/components/public/PublicLayout.tsx`
- **Lines:** 1, 4
- **Description:** Missing `"use client"` directive. Also uses `React.ReactNode` type without importing `React`.
- **Fix:** Added `"use client"` at top and changed to `import { type ReactNode } from 'react'`.
- [x] Resolved

---

## MEDIUM Priority

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

---

## LOW Priority

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

---

## USER-REPORTED Issues

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
- **Files & Details:**
  1. **`dashboard/trustee/interviews/page.tsx`** (lines ~100-103) — Hardcoded interview date (`new Date()`), time (`'10:00 AM'`), mode (`'ONLINE'`), fake Google Meet link. Should fetch actual scheduled interview data from API.
  2. **`dashboard/trustee/applications/page.tsx`** (lines ~80-93) — Hardcoded superintendent ID (`'u2'`), name (`'Superintendent'`), forwarding date (`new Date()`), recommendation (`'RECOMMEND'`), fake interview ID (`'int-1'`). Should fetch actual forwarding/recommendation data.
  3. **`dashboard/student/renewal/page.tsx`** (lines ~173-175) — Hardcoded student ID (`'STU001'`), name (`'Amit Kumar Jain'`), vertical, academic year, period, days remaining (`30`). Should fetch from logged-in student profile and renewal API.
  4. **`dashboard/superintendent/renewal/page.tsx`** (lines ~28-49) — Extensive hardcoded renewal record: student name, room (`'A-201'`), fake document filenames, payment amount (`60000`), consent timestamps. Should fetch actual renewal records from API.
- **Fix:** Replace hardcoded data with API calls to the backend, which connects to Supabase.
- [ ] Open

### ISSUE-12: Supabase connection status and database readiness
- **Status:** Supabase is **fully configured and active**.
- **What's working:**
  - Production Supabase project at `fteqtsoifrqigegdvqhx.supabase.co`
  - Frontend: browser client (`src/lib/supabase/client.ts`) + server client (`src/lib/supabase/server.ts`)
  - Backend: NestJS global module (`supabase.provider.ts`)
  - 9 migration files with complete schema (users, applications, documents, fees, audit, compliance, payments, configuration)
  - API routes actively querying Supabase (auth, fees, leaves, allocations, documents, storage)
  - Auth: OTP/SMS/Email via Supabase Auth
  - Storage: Supabase Storage for document uploads with signed URLs
  - No mock db.json — all data goes through Supabase
- **Potential concerns:**
  1. Need to verify all RLS policies are applied correctly on remote Supabase
  2. Some API routes have debug logs with sensitive info (clean for production)
  3. Mixed HTTP method usage (POST vs PUT) should be audited across API routes
  4. Dashboard pages with hardcoded data (ISSUE-11) bypass this connection entirely
- [ ] Open (needs verification that migrations are applied and RLS is enforced)

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
