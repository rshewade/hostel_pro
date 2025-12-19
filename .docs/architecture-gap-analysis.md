# Gap Analysis: Architecture vs. Business Requirements

**Date:** December 19, 2025
**Reviewer:** Winston (Architect)
**Documents Reviewed:**
1.  `repo/.docs/BRD.txt` (Source of Truth)
2.  `repo/.docs/architecture.md` (Current Architecture)

## Executive Summary
The current architecture provides a strong foundation using the **Next.js + NestJS + Supabase** stack, which is well-suited for the project's scalability and security goals. However, a critical divergence exists in the **Identity & Access Management** strategy regarding the "Pre-Approval" vs. "Post-Approval" stages defined in the BRD.

## Critical Gaps

### 1. Identity Model Mismatch (High Priority)
*   **Requirement (BRD):** "Applicant Flow (Pre-Approval): ... No persistent 'Dashboard' account created yet. Application submits directly... Student Login credentials generated systematically ONLY upon Final Approval."
*   **Architecture (Current):** Section 3.1 lists `Users` with roles (STUDENT, etc.) and Section 3.2 lists `Applications` linked to `student_id`.
*   **The Gap:** The architecture implies a `User` (Student) must exist to have an `Application`. The BRD explicitly states the opposite: Applicants are guests verified by OTP/Tracking ID, and the "User" account is a *result* of approval.
*   **Recommendation:**
    *   Refactor schema to allow `Applications` to exist without a foreign key to `Users` initially, OR introduction of a `staging_users` or `applicants` table.
    *   Define the "Promotion" workflow where a `User` record is minted upon admission approval.

### 2. Digital Undertakings & PDF Generation
*   **Requirement (BRD):** "Print-optimized layouts for audit and physical submission... Downloadable copies."
*   **Architecture (Current):** Mentions `ConsentLogs` for digital fingerprints.
*   **The Gap:** No specific strategy for generating the *immutable PDF artifacts* of these undertakings. While digital logs are good for DB, the institutional requirement often demands a generated PDF file stored in S3.
*   **Recommendation:** Add a **PDF Generation Service** (e.g., dedicated NestJS module using Puppeteer or a library like `pdf-lib`) to the Backend Service layer.

### 3. Renewal Workflow Specifics
*   **Requirement (BRD):** "Renewal reminders (6-month cycle)... Re-upload updated certificates."
*   **Architecture (Current):** Mentions renewal in API versioning context.
*   **The Gap:** The database schema for `Applications` does not explicitly support the concept of "Renewal Chains" (linking a new application to a previous resident record).
*   **Recommendation:** Add `type` (NEW, RENEWAL) and `parent_application_id` to the `Applications` schema to track student history across semesters.

## Minor Adjustments

*   **Communication:** The BRD specifies "Embedded Communication" with manual triggers. The Architecture's "Scalable Notification Engine" (BullMQ) is perfect for this, but we should explicitly list "On-Demand" triggers in the API section.
*   **Alumni Data:** explicit mention of `Alumni` table or status in `Users` to handle the "Exit & Alumni Module" data retention/migration policies.

## Next Steps
I propose updating `repo/.docs/architecture.md` to V2 to address these gaps before we proceed to coding.
