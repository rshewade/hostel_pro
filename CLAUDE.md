# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Hostel Management Application** for a Jain Hostel system covering Boys Hostel, Girls Ashram, and Dharamshala. The application manages the complete resident lifecycle from admission application through approvals, interviews, payments, room allocation, stay management, 6-month renewals, and final exit with strict institutional governance, auditability, and DPDP Act compliance.

**Key Features:**
- Multi-role workflows (Applicants, Residents, Superintendents, Trustees, Accounts, Parents)
- Guest-first admission flow (OTP-verified applications without requiring accounts)
- Manual approval workflows with interview scheduling
- Financial tracking with multi-head accounting
- Document management and PDF generation for legal undertakings
- Leave management with parent notifications
- 6-month renewal cycle management
- Exit and alumni tracking
- Complete audit logging

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js | Unified handling of SEO Landing Pages and Role-Based Dashboards |
| **Backend** | NestJS | Structured framework for complex business rules and PDF generation |
| **Database** | PostgreSQL (Supabase) | Relational integrity with Row Level Security (RLS) |
| **Storage** | Supabase Storage | Integrated with RLS for secure document access |
| **Auth** | Supabase Auth | OTP handling for Applicants/Parents and JWT for Residents/Staff |
| **Notifications** | BullMQ / Redis | Asynchronous SMS/WhatsApp/Email delivery |
| **PDF Service** | Puppeteer / pdf-lib | Backend service for non-repudiable legal documents |

## Development Commands

**Note:** This project is in early stages. Package.json and source code directories have not yet been created. Commands will be added once the project structure is initialized.

### Development Phases

**Phase 1: Prototyping with db.json (Current)**
```bash
npm run dev          # Next.js frontend (port 3000)
npm run dev:api      # json-server mock API (port 3001)
npm run dev:all      # Run both concurrently
```

**Phase 2: Hybrid Development**
- Supabase Auth for authentication
- db.json for remaining data operations
- Gradual backend migration

**Phase 3: Production Setup**
- Full Supabase PostgreSQL backend
- NestJS API with RLS enabled
- Complete security implementation

See `.docs/db-json-prototyping-guide.md` for detailed setup and migration instructions.

## Architecture

### Three-Tier Architecture

The application follows a three-tier architecture optimized for institutional governance:

1. **Frontend (Next.js):**
   - Public landing pages with vertical selection (Boys/Girls/Dharamshala)
   - Guest application tracking (OTP-verified, no persistent accounts)
   - Role-based dashboards post-authentication
   - Mobile-first responsive design

2. **Backend (NestJS):**
   - RESTful API with role-based access control (RBAC)
   - Business logic layer for pricing, approvals, renewals
   - PDF generation service for legal documents
   - Job queue integration for async notifications

3. **Database (PostgreSQL via Supabase):**
   - Row Level Security (RLS) for multi-tenancy
   - Audit logging for all state changes
   - Document storage with signed URLs

### Key Architectural Decisions

- **Guest-First Admissions:** Applicants use OTP-verified sessions to submit and track applications. A permanent User account is created ONLY after final approval to reduce friction and comply with DPDP Act.
- **Tagged Task Lists:** Applications route to specific Superintendents based on vertical (Boys/Girls/Dharamshala).
- **Immutable Audit Trail:** All application status changes and financial transactions create immutable audit log entries.
- **PDF Generation:** All approvals trigger background jobs to generate "Final Admission Packet" PDFs with accepted terms, stored in S3-compatible storage.

### Core Data Schema

**Applications Lifecycle:**
- `id` (UUID), `tracking_number` (human-readable)
- `type` (NEW, RENEWAL), `parent_application_id` (for renewal history)
- `applicant_mobile` (OTP-verified, used before User creation)
- `student_user_id` (nullable, populated after approval)
- `current_status` (DRAFT, SUBMITTED, REVIEW, INTERVIEW, APPROVED, REJECTED, ARCHIVED)
- `data` (jsonb) - Stores all form responses

**User Roles:**
- STUDENT (Residents with full dashboard access)
- SUPERINTENDENT (Boys/Girls/Dharamshala specific)
- TRUSTEE (Interview and final approval authority)
- ACCOUNTS (Financial tracking and receipt generation)
- PARENT (View-only, OTP-based login)

## Design System

**Colors (Logo-Derived):**
- **Primary:** Institutional Blue (Headers, Navigation, Key Actions)
- **Accent:** Brownish-Yellow (CTA highlights, semantic differentiation)
- **Interface Theme:** White & Blue (Clean, professional background)

**Typography:** Professional Sans-Serif (Inter/Roboto) for high readability

**Layout Style:**
- Modern elevated card containers on light backgrounds
- Visual step-flow for admission journey: Draft → Submitted → Review → Interview → Approved → Checked-in
- Mobile-first responsive design

## Code Conventions

### File Naming
- **Frontend Components:** PascalCase (e.g., `ApplicationForm.tsx`, `StudentDashboard.tsx`)
- **Backend Services:** kebab-case (e.g., `application.service.ts`, `pdf-generation.service.ts`)
- **Database Tables/Columns:** snake_case (e.g., `applications`, `student_user_id`)

### State Management
- Local state (`useState`) for UI-only state
- Context/Zustand for cross-component global state
- Server state via React Query/SWR for API data

### Authentication Flow
- Public routes: Landing pages, Application submission, Status tracking (OTP-verified)
- Protected routes: All dashboards (role-based JWT authentication)
- RLS policies enforce data access at database level

### API Design
- RESTful endpoints with role-based authorization
- `/api/v1/public/*` - Guest APIs (OTP-restricted)
- `/api/v1/admin/*` - Admin-only operations
- All endpoints return structured responses with error codes

## Project Structure

```
.docs/               # Project documentation
├── prd.md          # Product Requirements Document
├── architecture.md # System architecture overview
├── prd/            # Detailed PRD sections
└── architecture/   # Detailed architecture sections

.taskmaster/        # Task Master AI task management
├── tasks/          # Task definitions
├── config.json     # AI model configuration
└── CLAUDE.md       # Task Master integration guide

.github/            # GitHub configuration
└── instructions/   # AI assistant instructions
```

## Task Master Integration

This project uses Task Master AI for task-driven development. See `.taskmaster/CLAUDE.md` for comprehensive workflow guidance.

**Key Task Master Commands:**
```bash
task-master list                    # Show all tasks
task-master next                    # Get next available task
task-master show <id>               # View task details
task-master set-status --id=<id> --status=done  # Complete task
```

**Important:** After completing tasks, create test scripts and verify the build succeeds before marking as complete.

## Git Workflow

- Feature branches from `main` (e.g., `feature/guest-application`, `fix/otp-verification`)
- Conventional Commits (e.g., `feat:`, `fix:`, `refactor:`, `docs:`)
- All commits should reference task IDs when applicable (e.g., `feat: implement OTP verification (task 2.3)`)

## Security & Compliance

### DPDP Act Compliance
- Encryption: AES-256 for PII
- Signed URLs for all student documents
- Data minimization: Applications archived (PII stripped) after 1 year of rejection/exit
- Consent tracking: Digital fingerprints captured at every 6-month renewal

### Security Checklist
- Never commit API keys, credentials, or sensitive data
- All user input must be validated and sanitized
- Use parameterized queries to prevent SQL injection
- Implement rate limiting on public endpoints
- Enable Row Level Security (RLS) on all database tables

## Testing Strategy

- **Unit Tests:** Utility functions and business logic
- **Integration Tests:** API endpoints with role-based access
- **E2E Tests:** Complete user flows (Application → Approval → Room Allocation)
- All tests run against consistent mock data

## Documentation References

- **PRD:** `.docs/prd.md` - Complete product requirements
- **Architecture:** `.docs/architecture.md` - System design and technical decisions
- **Frontend Spec:** `.docs/frontend-spec.md` - UI/UX design philosophy
- **BRD:** `.docs/BRD.txt` - Business requirements document
- **db.json Prototyping:** `.docs/db-json-prototyping-guide.md` - Mock API setup for frontend development

## Important Notes

- This is an early-stage project. Frontend and backend codebases have not yet been initialized.
- The `.docs/` folder contains complete specifications. Reference these documents when implementing features.
- All development should follow the Guest-First architecture pattern.
- Every feature should consider the multi-role access model and audit requirements.
