# Bug Fixes: Contact Page Infinite Loop Error

## Date: 2025-12-22

## Issue Reported

**Error Type**: Runtime Error
**Error Message**: "Too many re-renders. React limits the number of renders to prevent an infinite loop."
**Location**: Contact Details Page (`/apply/boys-hostel/contact`)
**Pattern**: IDENTICAL to verify page bug (Issue #6 from bug-fixes-apply-page-v2.md)

---

## Root Causes Identified

### Issue #1: **validateInput Called During Render** (CRITICAL) 🔴

**Location**: `frontend/src/app/apply/boys-hostel/contact/page.tsx:303`

**Problem**:
```typescript
<button
  onClick={handleSendOTP}
  disabled={!validateInput()}  // ❌ Calls setState during render!
>
```

**Why This Causes Infinite Loop**:
```typescript
const validateInput = () => {
  const newErrors: string[] = [];
  // ... validation logic
  setErrors(newErrors);  // ❌ setState called during render
  return newErrors.length === 0;
};
```

When `validateInput()` is called in the `disabled` prop:
1. React renders the component
2. Evaluates `disabled={!validateInput()}`
3. validateInput() calls `setErrors(newErrors)`
4. `setErrors` triggers a re-render
5. Back to step 1 → **INFINITE LOOP**

**Fix**:
Created two separate functions:

```typescript
// Pure validation (no setState) - SAFE for render
const isInputValid = () => {
  if (contactMethod === 'phone') {
    return phoneNumber && /^[6-9]\d{9}$/.test(phoneNumber);
  } else {
    return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
};

// Validation with errors (calls setState) - ONLY for event handlers
const validateInput = () => {
  const newErrors: string[] = [];
  // ... validation logic
  setErrors(newErrors);  // ✅ Only called in event handlers now
  return newErrors.length === 0;
};
```

Updated the button:
```typescript
<button
  onClick={handleSendOTP}
  disabled={!isInputValid()}  // ✅ Pure function, no setState
>
```

---

### Issue #2: **Missing Clock Import** (MEDIUM) 🟡

**Location**: `frontend/src/app/apply/boys-hostel/contact/page.tsx:5`

**Problem**: Clock icon used on line 321 but not imported

**Fix**:
```typescript
// Before
import { ArrowLeft, ArrowRight, Shield, RefreshCw, Phone, Mail } from 'lucide-react';

// After
import { ArrowLeft, ArrowRight, Shield, RefreshCw, Phone, Mail, Clock } from 'lucide-react';
```

---

## Changes Summary

### Files Modified
1. `frontend/src/app/apply/boys-hostel/contact/page.tsx`

### All Changes Made

```diff
Line 5: Import
+ import { ..., Clock } from 'lucide-react';

Lines 22-29: New pure validation function
+ // Pure validation (no setState) - safe for render
+ const isInputValid = () => {
+   if (contactMethod === 'phone') {
+     return phoneNumber && /^[6-9]\d{9}$/.test(phoneNumber);
+   } else {
+     return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
+   }
+ };

Lines 31-49: Updated validateInput with comments
+ // Validation with error setting - only call in event handlers
  const validateInput = () => {
    // ... validation logic
    setErrors(newErrors);
    return newErrors.length === 0;
  };

Line 313: Button disabled
- disabled={!validateInput()}
+ disabled={!isInputValid()}
```

---

## Root Cause Analysis

### Why This Is The Same Bug As Verify Page

Both pages had **functions that call setState being invoked during render**:

| Page | Function | Called In | setState Call | Result |
|------|----------|-----------|--------------|--------|
| Verify | `validateOTP()` | `disabled` prop | `setErrors()` | ♾️ Loop |
| Contact | `validateInput()` | `disabled` prop | `setErrors()` | ♾️ Loop |

Both used the **same anti-pattern**: calling a side-effect function during render.

### React's Rules (Reminder)

**✅ ALLOWED**:
- Call setState in event handlers (onClick, onChange, etc.)
- Call setState in useEffect
- Call setState in async callbacks

**❌ FORBIDDEN**:
- Call setState during render (in JSX or component body)
- Call setState in functions used during render (like disabled props)

---

## Testing & Verification

### Before Fix
- ❌ Page crashed immediately when accessing `/apply/boys-hostel/contact`
- ❌ Browser tab became unresponsive
- ❌ "Too many re-renders" error
- ❌ Could not access the contact page at all

### After Fix
- ✅ Page loads successfully
- ✅ Contact method selection (Phone/Email) works
- ✅ Input validation works correctly
- ✅ Button disabled state reflects input validity
- ✅ No infinite loops
- ✅ No console errors
- ✅ No performance issues

---

## Pattern Recognition

### Common Bug Pattern Across Both Pages

```typescript
// ❌ ANTI-PATTERN - Causes infinite loops
<button disabled={!validateFunction()}>

function validateFunction() {
  // ... validation logic
  setState(someValue);  // ❌ Side effect during render
  return isValid;
}

// ✅ CORRECT PATTERN - Separates concerns
<button disabled={!isValid()}>  {/* Pure function */}

function isValid() {
  // ... pure validation logic
  return isValid;  // ✅ No side effects
}

function validate() {
  // ... validation logic
  setState(someValue);  // ✅ Only called in event handlers
  return isValid;
}
```

---

## Prevention Strategies

### 1. **Function Naming Convention**

Use clear naming to distinguish pure from side-effect functions:

```typescript
// Pure functions (for render)
const isValid = () => { /* no setState */ };
const canSubmit = () => { /* no setState */ };
const hasErrors = () => { /* no setState */ };

// Side-effect functions (for event handlers)
const validate = () => { /* calls setState */ };
const submit = () => { /* calls setState */ };
const checkErrors = () => { /* calls setState */ };
```

### 2. **Code Review Checklist**

When reviewing button components:
- [ ] Check all props (disabled, className, style, etc.)
- [ ] Verify functions called in props are pure
- [ ] Ensure no setState in render path
- [ ] Confirm side effects only in event handlers

### 3. **ESLint Custom Rule**

```javascript
// Detect setState in JSX attribute expressions
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "JSXAttribute > JSXExpressionContainer CallExpression[callee.name=/^set/]",
        "message": "Don't call setState in JSX attributes - use a pure function"
      }
    ]
  }
}
```

---

## Files To Audit For Similar Patterns

The following pages should be checked for the same anti-pattern:

- [ ] `frontend/src/app/apply/girls-ashram/contact/page.tsx`
- [ ] `frontend/src/app/apply/dharamshala/contact/page.tsx`
- [ ] `frontend/src/app/apply/girls-ashram/verify/page.tsx`
- [ ] `frontend/src/app/apply/dharamshala/verify/page.tsx`

**Search Pattern**: Look for `disabled={!validateSomething()}`

---

## Impact Assessment

**Severity**: 🔴 CRITICAL (Complete page crash)
**User Impact**: 100% of users blocked from accessing contact page
**Affected Workflows**: All Boys Hostel applications
**Resolution Time**: 10 minutes (pattern already known from verify page)
**Regression Risk**: 🟢 LOW (simplified logic, clear separation of concerns)

---

## Lessons Learned

### 1. **Same Pattern, Same Problem**

This bug was IDENTICAL to the verify page bug. The same anti-pattern appeared in two different files because:
- Both pages were likely created around the same time
- Both pages have similar validation requirements
- The anti-pattern wasn't caught during initial development

### 2. **Systematic Auditing Required**

After finding the same bug twice, we need to:
1. Audit ALL pages for this pattern
2. Create reusable validation utilities
3. Establish clear conventions for pure vs side-effect functions

### 3. **Pattern Library Benefits**

Having standard validation patterns would prevent this:

```typescript
// Reusable validation hook
function useValidation(validationRules) {
  const [errors, setErrors] = useState([]);

  // Pure function for render
  const isValid = () => validationRules.every(rule => rule.test());

  // Side-effect function for events
  const validate = () => {
    const newErrors = validationRules
      .filter(rule => !rule.test())
      .map(rule => rule.message);
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  return { isValid, validate, errors };
}
```

---

## Verification Checklist

### Functionality
- [x] Page loads without errors
- [x] Contact method toggle works (Phone/Email)
- [x] Phone number input accepts valid input
- [x] Email input accepts valid input
- [x] Button disabled when input invalid
- [x] Button enabled when input valid
- [x] Send OTP button works
- [x] OTP sent confirmation displays
- [x] Resend timer countdown works
- [x] Resend OTP button appears after timer

### Performance
- [x] No infinite loops
- [x] No console errors
- [x] No excessive re-renders
- [x] Smooth input typing
- [x] Fast validation feedback

### Code Quality
- [x] No setState in render
- [x] Pure functions for JSX props
- [x] Clear separation of concerns
- [x] Proper function naming
- [x] All imports present

---

## Related Documentation

- **Verify Page Bug**: `.docs/bug-fixes-apply-page-v2.md`
- **React Rules of Hooks**: https://react.dev/reference/rules/rules-of-hooks
- **React Render and Commit**: https://react.dev/learn/render-and-commit

---

**Fixed By**: Claude Code
**Date**: 2025-12-22
**Status**: ✅ FULLY RESOLVED
**Verified**: Yes - All functionality working
**Confidence**: HIGH - Same root cause as verify page, properly fixed
**Related Issue**: Identical to verify page Issue #6
