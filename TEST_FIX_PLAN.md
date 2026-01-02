# Test Fix Plan - Hostel Management Application

**Current Status:** 1,309/1,475 tests passing (88.7%)
**Target:** Fix all 138 failing tests

## Summary

This plan addresses 8 categories of test failures across 14 test files, categorized by root cause and fix complexity.

---

## Phase 1: Critical Infrastructure Fixes (High Priority)

### 1.1 Next.js App Router Mocking (Affects 20+ tests)
**Test Files:** Task 09, Task 17, Task 07 (partial)
**Root Cause:** `useRouter` hook throws "invariant expected app router to be mounted" in test environment

**Fix Strategy:**
1. Create `tests/mocks/next/navigation.ts` with mocked `useRouter`, `useSearchParams`, `usePathname`
2. Update `vitest.setup.ts` to import the mock
3. Add wrapper component for tests that need router context

**Files to Create/Modify:**
- `tests/mocks/next/navigation.ts` (new)
- `tests/test-utils.tsx` (update with router wrapper)
- `vitest.setup.ts` (add mock import)

**Estimated Time:** 30-45 minutes

**Expected Impact:** Fixes 20+ failing tests in Task 09, Task 17, Task 07

---

### 1.2 React Act() Warnings (Task 07)
**Root Cause:** State updates not wrapped in `act()`

**Fix Strategy:**
1. Wrap async state updates in test helper
2. Use `waitFor` or `act()` for DOM updates after user interactions

**Files to Modify:**
- `tests/Task07-StudentLogin.test.tsx`

**Estimated Time:** 15 minutes

**Expected Impact:** Eliminates act() warnings, may fix redirection tests

---

## Phase 2: Component & UI Fixes

### 2.1 Task 08.2 - Parent Dashboard (21 failures)
**Test File:** `tests/Task08.2-ParentDashboard.test.tsx`

**Issues Analysis:**
- Student overview section not rendering
- Fee status section elements missing
- Leave summary components not found
- Notifications center missing
- Mobile viewport rendering issues

**Fix Strategy:**
1. Read the actual Parent Dashboard component to understand current implementation
2. Compare test expectations with actual rendered output
3. Fix test selectors or update component to match expectations
4. Ensure proper mock data is being passed

**Files to Modify:**
- `src/app/dashboard/parent/page.tsx` (if component needs fixes)
- `tests/Task08.2-ParentDashboard.test.tsx` (update test assertions)

**Estimated Time:** 45-60 minutes

**Expected Impact:** 21 tests passing

---

### 2.2 Task 08.4 - Compliance (30 failures)
**Test File:** `tests/Task08.4-Compliance.test.tsx`

**Issues Analysis:**
- All 30 tests failing - likely component not implementing expected features
- DPDP compliance banner missing
- View-only access banner missing
- ARIA labels missing
- Help section missing

**Fix Strategy:**
1. Review compliance component requirements from PRD
2. Implement missing features or fix test expectations
3. Ensure ARIA attributes are present
4. Add help section with contact information

**Files to Modify:**
- `src/app/dashboard/parent/page.tsx` or compliance component
- `tests/Task08.4-Compliance.test.tsx`

**Estimated Time:** 60-90 minutes

**Expected Impact:** 30 tests passing

---

### 2.3 Task 07 - Student Login (5 failures)
**Test File:** `tests/Task07-StudentLogin.test.tsx`

**Issues Analysis:**
- DPDP consent checkbox not found
- Redirection tests failing (role-based routing)

**Fix Strategy:**
1. Add DPDP consent checkbox to login form if missing
2. Fix role-based redirection logic or test assertions
3. Ensure router context is properly mocked (see Phase 1.1)

**Files to Modify:**
- `src/app/login/page.tsx` (add consent checkbox if missing)
- `tests/Task07-StudentLogin.test.tsx`

**Estimated Time:** 30 minutes

**Expected Impact:** 5 tests passing

---

### 2.4 Task 17 - Student Room View (multiple failures)
**Test File:** `tests/Task17-StudentRoomView.test.tsx`

**Issues Analysis:**
- "Refresh Data" button not found (component shows "Retry" instead)
- "Allocated On" text not found (error state showing)
- Error state rendering instead of normal room allocation state

**Fix Strategy:**
1. Check if error state is rendering because mock data is missing
2. Update test expectations to match actual UI ("Retry" vs "Refresh Data")
3. Add proper mock data for room allocation
4. Fix error state handling

**Files to Modify:**
- `src/app/dashboard/student/room/page.tsx` (if changes needed)
- `tests/Task17-StudentRoomView.test.tsx` (update expectations)

**Estimated Time:** 30-45 minutes

**Expected Impact:** 10+ tests passing

---

## Phase 3: API & Logic Fixes

### 3.1 Task 08.3 - Parent API (2 failures)
**Test File:** `tests/Task08.3-ParentAPI.test.ts`

**Issues Analysis:**
- GET request with valid session token failing
- Student data filtering (no sensitive fields) not working

**Fix Strategy:**
1. Review API endpoint implementation
2. Fix session token validation logic
3. Ensure sensitive fields are filtered from response
4. Check mock server configuration

**Files to Modify:**
- `src/app/api/parent/student/route.ts` or similar
- `tests/Task08.3-ParentAPI.test.ts`

**Estimated Time:** 20-30 minutes

**Expected Impact:** 2 tests passing

---

### 3.2 Task 11 - Retention Policies (1 failure)
**Test File:** `tests/Task11-RetentionPolicies.test.ts`

**Issues Analysis:**
- IST to UTC conversion failure

**Fix Strategy:**
1. Review timezone conversion logic in retention utilities
2. Fix IST offset calculation
3. Ensure proper timezone handling in tests

**Files to Modify:**
- `src/lib/retention-policies.ts` (or similar utility file)
- `tests/Task11-RetentionPolicies.test.ts`

**Estimated Time:** 15 minutes

**Expected Impact:** 1 test passing

---

## Phase 4: Test Infrastructure Improvements

### 4.1 Task 10 - FormWizard & Stepper (3 failures)
**Test File:** `tests/Task10-FormWizard.test.tsx`

**Issues Analysis:**
- Duplicate test names causing conflicts
- Vertical orientation rendering issues

**Fix Strategy:**
1. Rename duplicate tests to unique names
2. Fix vertical orientation test assertions
3. Ensure proper prop passing to Stepper component

**Files to Modify:**
- `tests/Task10-FormWizard.test.tsx`

**Estimated Time:** 15 minutes

**Expected Impact:** 3 tests passing

---

## Phase 5: Verification & Regression Testing

### 5.1 Full Test Suite Run
- Run `npm run test:run` after all fixes
- Verify no new tests broke
- Document any edge cases discovered

**Estimated Time:** 10 minutes

---

### 5.2 Build Verification
- Run `npm run build` to ensure no TypeScript errors
- Verify all 83 routes still build successfully

**Estimated Time:** 5 minutes

---

## Execution Order

### Recommended Fix Sequence:

1. **Start with Phase 1.1** (Router mocking) - This will fix the most failures (20+) and unblock other fixes
2. **Phase 1.2** (act() warnings) - Quick win
3. **Phase 2.1** (Parent Dashboard) - Largest block of UI fixes (21 tests)
4. **Phase 2.4** (Student Room View) - Mock data issues (10+ tests)
5. **Phase 2.2** (Compliance) - 30 tests, may need component work
6. **Phase 2.3** (Student Login) - 5 tests
7. **Phase 3.1** (Parent API) - 2 tests
8. **Phase 3.2** (Retention Policies) - 1 test
9. **Phase 4.1** (FormWizard) - 3 tests
10. **Phase 5** (Verification)

**Total Estimated Time:** 4-6 hours

---

## Success Metrics

- **Before:** 1,309/1,475 tests passing (88.7%)
- **After:** 1,447/1,475 tests passing (98%+)
- **Remaining failures:** < 30 tests (edge cases, optional features)

---

## Notes

1. **Some tests may need component updates** - Tests are based on original specs; if components evolved differently, we may need to update test expectations instead of components

2. **Mock data consistency** - Ensure all tests use consistent mock data that matches current API structure

3. **Router context** - The app router issue is the most impactful fix; starting here will provide the best ROI

4. **Component vs Test updates** - For each failing test, evaluate whether to fix the component or the test expectation based on:
   - Is the feature from the PRD/architecture specs?
   - Is the test expectation realistic?
   - Has the requirement changed?

---

## Risk Mitigation

1. **Backup tests before changes** - Run tests, save output
2. **Fix one category at a time** - Verify fixes before moving to next
3. **Document any intentional test changes** - Note why tests were updated rather than components
4. **Regression testing** - After each fix category, run full suite to ensure no regressions
