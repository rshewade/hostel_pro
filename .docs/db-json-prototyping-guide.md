# db.json Prototyping Guide

## Overview

This guide defines the strategy for using `db.json` with `json-server` during the initial design and frontend development phase, before the production Supabase PostgreSQL backend is ready.

**Document Status:** Approved Development Guideline
**Created:** 2025-12-19
**Applies To:** Frontend development, UI/UX prototyping, early-stage feature development

## Rationale

### Why Use db.json?

1. **Parallel Development**: Frontend and backend teams can work independently
2. **Rapid Prototyping**: Test UI workflows without waiting for backend API implementation
3. **Design Validation**: Validate data structures and relationships before committing to schema
4. **Zero Backend Setup**: No need for Supabase configuration during initial design
5. **Realistic Data**: Work with structured mock data instead of hardcoded arrays

### When NOT to Use db.json

- Production environments (always use Supabase)
- Testing authentication flows (use Supabase Auth even in development)
- Testing file uploads (use Supabase Storage)
- Performance testing (db.json is in-memory and not representative)
- Multi-user scenarios (db.json has no RLS or access control)

## Phase-Based Usage Strategy

### Phase 1: Pure Prototyping (db.json ONLY)
**Duration:** Initial 2-4 weeks
**Focus:** UI/UX, component development, routing, state management

- Use db.json for ALL data operations
- No backend services running
- Focus on frontend experience

### Phase 2: Hybrid Development (db.json + Partial Supabase)
**Duration:** 2-4 weeks
**Focus:** Authentication integration, gradual backend migration

- Use Supabase Auth for login/OTP
- Keep db.json for other data (applications, rooms, etc.)
- Begin implementing backend API endpoints one module at a time

### Phase 3: Full Backend (Supabase ONLY)
**Duration:** Ongoing
**Focus:** Production-ready implementation

- Retire db.json completely
- All data operations through NestJS backend + Supabase
- Enable RLS and proper security

## Setup Instructions

### 1. Install json-server

```bash
# Install as dev dependency
npm install --save-dev json-server

# Or install globally
npm install -g json-server
```

### 2. Create db.json File

Create `db.json` in the project root:

```bash
touch db.json
```

### 3. Add npm Scripts

Update `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:api": "json-server --watch db.json --port 3001",
    "dev:all": "concurrently \"npm run dev\" \"npm run dev:api\""
  },
  "devDependencies": {
    "json-server": "^0.17.4",
    "concurrently": "^8.2.2"
  }
}
```

### 4. Run Development Servers

```bash
# Option 1: Run separately
npm run dev          # Next.js on port 3000
npm run dev:api      # json-server on port 3001

# Option 2: Run together
npm run dev:all
```

## db.json Structure

Based on the documented schema in `.docs/architecture/03-3.-core-data-schema-high-level.md`:

```json
{
  "users": [
    {
      "id": "u1",
      "email": "student1@example.com",
      "password_hash": "$2a$10$dummy_hash",
      "role": "STUDENT",
      "mobile_no": "+919876543210",
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00Z"
    },
    {
      "id": "u2",
      "email": "superintendent@jain.org",
      "password_hash": "$2a$10$dummy_hash",
      "role": "SUPERINTENDENT",
      "mobile_no": "+919876543211",
      "status": "ACTIVE",
      "created_at": "2024-01-10T10:00:00Z"
    }
  ],
  "profiles": [
    {
      "id": "p1",
      "user_id": "u1",
      "full_name": "Rahul Kumar",
      "profile_type": "STUDENT",
      "details": {
        "father_name": "Rajesh Kumar",
        "age": 22,
        "native_place": "Mumbai, Maharashtra"
      }
    }
  ],
  "applications": [
    {
      "id": "app1",
      "tracking_number": "BH2024001",
      "type": "NEW",
      "parent_application_id": null,
      "applicant_mobile": "+919876543210",
      "student_user_id": null,
      "current_status": "SUBMITTED",
      "vertical": "BOYS_HOSTEL",
      "data": {
        "personal_info": {
          "full_name": "Amit Shah",
          "age": 21,
          "native_place": "Ahmedabad, Gujarat"
        },
        "guardian_info": {
          "father_name": "Prakash Shah",
          "father_mobile": "+919876543220"
        },
        "education": {
          "institution": "Gujarat University",
          "course": "B.Com",
          "year": "2nd Year"
        }
      },
      "submitted_at": "2024-12-15T14:30:00Z",
      "created_at": "2024-12-14T10:00:00Z"
    },
    {
      "id": "app2",
      "tracking_number": "GA2024002",
      "type": "NEW",
      "parent_application_id": null,
      "applicant_mobile": "+919876543212",
      "student_user_id": null,
      "current_status": "REVIEW",
      "vertical": "GIRLS_ASHRAM",
      "data": {
        "personal_info": {
          "full_name": "Priya Patel",
          "age": 20,
          "native_place": "Rajkot, Gujarat"
        },
        "guardian_info": {
          "father_name": "Ramesh Patel",
          "father_mobile": "+919876543221"
        }
      },
      "submitted_at": "2024-12-10T09:15:00Z",
      "created_at": "2024-12-09T11:00:00Z"
    }
  ],
  "documents": [
    {
      "id": "doc1",
      "application_id": "app1",
      "document_type": "AADHAR_CARD",
      "s3_key": "mock/documents/app1-aadhar.pdf",
      "verification_status": "PENDING",
      "uploaded_at": "2024-12-14T12:00:00Z"
    },
    {
      "id": "doc2",
      "application_id": "app1",
      "document_type": "PHOTO",
      "s3_key": "mock/documents/app1-photo.jpg",
      "verification_status": "VERIFIED",
      "uploaded_at": "2024-12-14T12:05:00Z"
    }
  ],
  "interviews": [
    {
      "id": "int1",
      "application_id": "app2",
      "trustee_id": "u3",
      "schedule_time": "2024-12-20T10:00:00Z",
      "mode": "IN_PERSON",
      "internal_remarks": "Candidate shows good understanding of hostel rules",
      "final_score": null,
      "status": "SCHEDULED"
    }
  ],
  "rooms": [
    {
      "id": "r1",
      "room_number": "101",
      "vertical": "BOYS_HOSTEL",
      "floor": 1,
      "capacity": 3,
      "current_occupancy": 2,
      "status": "AVAILABLE"
    },
    {
      "id": "r2",
      "room_number": "201",
      "vertical": "GIRLS_ASHRAM",
      "floor": 2,
      "capacity": 2,
      "current_occupancy": 2,
      "status": "FULL"
    }
  ],
  "allocations": [
    {
      "id": "alloc1",
      "student_id": "u1",
      "room_id": "r1",
      "allocated_at": "2024-02-01T00:00:00Z",
      "vacated_at": null,
      "status": "ACTIVE"
    }
  ],
  "leaves": [
    {
      "id": "leave1",
      "student_id": "u1",
      "type": "HOME_VISIT",
      "start_time": "2024-12-25T00:00:00Z",
      "end_time": "2024-12-27T23:59:59Z",
      "reason": "Family function",
      "status": "APPROVED",
      "parent_notified_at": "2024-12-20T10:00:00Z"
    }
  ],
  "fees": [
    {
      "id": "fee1",
      "student_id": "u1",
      "head": "HOSTEL_FEES",
      "amount": 5000,
      "due_date": "2024-07-01",
      "status": "PAID",
      "paid_at": "2024-06-25T10:00:00Z"
    },
    {
      "id": "fee2",
      "student_id": "u1",
      "head": "SECURITY_DEPOSIT",
      "amount": 10000,
      "due_date": "2024-01-15",
      "status": "PAID",
      "paid_at": "2024-01-15T14:00:00Z"
    }
  ],
  "transactions": [
    {
      "id": "txn1",
      "fee_id": "fee1",
      "amount": 5000,
      "payment_method": "UPI",
      "transaction_id": "UPI123456789",
      "status": "SUCCESS",
      "created_at": "2024-06-25T10:00:00Z"
    }
  ],
  "auditLogs": [
    {
      "id": "audit1",
      "entity_type": "APPLICATION",
      "entity_id": "app1",
      "action": "STATUS_CHANGE",
      "old_value": "DRAFT",
      "new_value": "SUBMITTED",
      "performed_by": null,
      "performed_at": "2024-12-15T14:30:00Z",
      "metadata": {
        "ip_address": "192.168.1.100"
      }
    }
  ]
}
```

## Frontend Integration

### API Configuration

Create `lib/api-config.ts`:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  users: `${API_BASE_URL}/users`,
  applications: `${API_BASE_URL}/applications`,
  documents: `${API_BASE_URL}/documents`,
  interviews: `${API_BASE_URL}/interviews`,
  rooms: `${API_BASE_URL}/rooms`,
  leaves: `${API_BASE_URL}/leaves`,
  fees: `${API_BASE_URL}/fees`,
};

export default API_BASE_URL;
```

### Sample API Service

Create `services/application.service.ts`:

```typescript
import { API_ENDPOINTS } from '@/lib/api-config';

export interface Application {
  id: string;
  tracking_number: string;
  type: 'NEW' | 'RENEWAL';
  current_status: string;
  applicant_mobile: string;
  data: Record<string, any>;
}

export const applicationService = {
  // Get all applications
  async getAll(): Promise<Application[]> {
    const res = await fetch(API_ENDPOINTS.applications);
    return res.json();
  },

  // Get by tracking number
  async getByTracking(trackingNumber: string): Promise<Application | null> {
    const res = await fetch(
      `${API_ENDPOINTS.applications}?tracking_number=${trackingNumber}`
    );
    const data = await res.json();
    return data[0] || null;
  },

  // Create new application
  async create(data: Partial<Application>): Promise<Application> {
    const res = await fetch(API_ENDPOINTS.applications, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Update application
  async update(id: string, data: Partial<Application>): Promise<Application> {
    const res = await fetch(`${API_ENDPOINTS.applications}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Filter by status
  async getByStatus(status: string): Promise<Application[]> {
    const res = await fetch(
      `${API_ENDPOINTS.applications}?current_status=${status}`
    );
    return res.json();
  },
};
```

### Environment Variables

Create `.env.local`:

```bash
# Development Phase 1: db.json only
NEXT_PUBLIC_API_URL=http://localhost:3001

# Development Phase 2: Hybrid (update when ready)
# NEXT_PUBLIC_API_URL=http://localhost:3002
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## json-server Advanced Configuration

### Custom Routes

Create `json-server.json`:

```json
{
  "/api/*": "/$1",
  "/applications/:id/documents": "/documents?application_id=:id",
  "/students/:id/leaves": "/leaves?student_id=:id",
  "/students/:id/fees": "/fees?student_id=:id"
}
```

Update npm script:

```json
{
  "scripts": {
    "dev:api": "json-server --watch db.json --port 3001 --routes json-server.json"
  }
}
```

### Middleware for Delays (Realistic Testing)

Create `json-server-middleware.js`:

```javascript
module.exports = (req, res, next) => {
  // Simulate network delay
  setTimeout(() => {
    next();
  }, 300);
};
```

Update script:

```json
{
  "scripts": {
    "dev:api": "json-server --watch db.json --port 3001 --routes json-server.json --middlewares json-server-middleware.js"
  }
}
```

## Migration Path to Supabase

### Step 1: Prepare Migration Script

Create `scripts/migrate-to-supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import dbData from '../db.json';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function migrate() {
  console.log('Starting migration...');

  // Migrate users
  for (const user of dbData.users) {
    const { error } = await supabase.from('users').insert(user);
    if (error) console.error('User migration error:', error);
  }

  // Migrate applications
  for (const app of dbData.applications) {
    const { error } = await supabase.from('applications').insert(app);
    if (error) console.error('Application migration error:', error);
  }

  // ... repeat for other tables

  console.log('Migration complete!');
}

migrate();
```

### Step 2: Abstract Data Layer

Create `lib/data-layer.ts`:

```typescript
// Abstraction layer - switch between db.json and Supabase
const USE_SUPABASE = process.env.NEXT_PUBLIC_USE_SUPABASE === 'true';

export const dataLayer = {
  async getApplications() {
    if (USE_SUPABASE) {
      // Supabase implementation
      const { data } = await supabase.from('applications').select('*');
      return data;
    } else {
      // json-server implementation
      const res = await fetch('http://localhost:3001/applications');
      return res.json();
    }
  },
  // ... other methods
};
```

### Step 3: Feature Flag Approach

```typescript
// .env.local
NEXT_PUBLIC_USE_SUPABASE=false  # Phase 1
NEXT_PUBLIC_USE_SUPABASE=true   # Phase 3
```

## Best Practices

### DO's

1. **Track db.json in version control** - For this project, db.json is committed to ensure all developers work with consistent mock data
2. **Keep db.json synchronized** - Update db.json when schema changes occur
3. **Use realistic IDs** - Use UUIDs or realistic patterns (`app1`, `u1`) for consistency
4. **Mirror production schema** - Keep db.json structure aligned with Supabase schema
5. **Document status transitions** - Add comments in code explaining workflow states
6. **Keep db.json.example as backup** - Maintain db.json.example as a clean template for resetting mock data

### DON'Ts

1. **Don't commit sensitive data** - Even in mock data, avoid real emails/phones
2. **Don't rely on db.json features not in Supabase** - Avoid json-server-specific query syntax
3. **Don't skip migration planning** - Always plan the Supabase transition from day 1
4. **Don't test authentication with db.json** - Use Supabase Auth even in Phase 1
5. **Don't use for performance testing** - db.json is in-memory and unrealistic

## Schema Validation

Create `scripts/validate-db-json.js`:

```javascript
const Ajv = require('ajv');
const dbData = require('../db.json');

const schema = {
  type: 'object',
  required: ['users', 'applications', 'documents'],
  properties: {
    users: { type: 'array' },
    applications: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'tracking_number', 'type', 'current_status'],
        properties: {
          id: { type: 'string' },
          tracking_number: { type: 'string' },
          type: { enum: ['NEW', 'RENEWAL'] },
          current_status: {
            enum: ['DRAFT', 'SUBMITTED', 'REVIEW', 'INTERVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED']
          }
        }
      }
    }
  }
};

const ajv = new Ajv();
const validate = ajv.compile(schema);
const valid = validate(dbData);

if (!valid) {
  console.error('db.json validation failed:', validate.errors);
  process.exit(1);
}

console.log('db.json is valid!');
```

Add to package.json:

```json
{
  "scripts": {
    "validate:db": "node scripts/validate-db-json.js"
  }
}
```

## Transition Checklist

### Before Starting (Phase 1)
- [ ] Install json-server and concurrently
- [ ] Create db.json with initial structure
- [ ] Add db.json to .gitignore
- [ ] Create db.json.example for team
- [ ] Set up npm scripts
- [ ] Create API service abstraction layer

### During Development (Phase 2)
- [ ] Implement Supabase Auth (replace mock auth)
- [ ] Set up Supabase project and tables
- [ ] Create migration scripts
- [ ] Implement feature flags for gradual transition
- [ ] Test hybrid mode (Supabase Auth + db.json data)

### Production Ready (Phase 3)
- [ ] Migrate all data operations to Supabase
- [ ] Enable Row Level Security (RLS)
- [ ] Remove json-server dependencies
- [ ] Delete db.json and related files
- [ ] Update documentation to remove db.json references
- [ ] Remove feature flags

## Troubleshooting

### json-server Not Found
```bash
# Install globally
npm install -g json-server

# Or use npx
npx json-server --watch db.json --port 3001
```

### Port Already in Use
```bash
# Find process on port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or use different port
json-server --watch db.json --port 3002
```

### CORS Issues
Add to `json-server-middleware.js`:

```javascript
module.exports = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
};
```

## References

- **Architecture Schema**: `.docs/architecture/03-3.-core-data-schema-high-level.md`
- **Technical Stack**: `.docs/architecture/02-2.-technical-stack-selection.md`
- **json-server Documentation**: https://github.com/typicode/json-server
- **Supabase Documentation**: https://supabase.com/docs

## Revision History

| Date | Version | Changes |
|------|---------|---------|
| 2025-12-19 | 1.0 | Initial guideline created |

---

**Important:** This is a development-phase guideline only. Production systems MUST use Supabase PostgreSQL with proper RLS, authentication, and security measures.
