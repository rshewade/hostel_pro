# Quick Start: db.json Development Setup

This is a 5-minute quick start guide to get the frontend development environment running with mock API.

## Prerequisites

- Node.js 18+ installed
- Basic understanding of REST APIs

## Setup Steps

### 1. Initialize db.json

Copy the example file to create your working database:

```bash
cp db.json.example db.json
```

If db.json already exists in the repo, you can skip this step.

### 2. Install Dependencies

```bash
# Install project dependencies (when package.json exists)
npm install

# Install json-server globally (optional, for convenience)
npm install -g json-server
```

### 3. Start Development Servers

```bash
# Terminal 1: Start json-server (Mock API on port 3001)
npm run dev:api
# OR
json-server --watch db.json --port 3001

# Terminal 2: Start Next.js (Frontend on port 3000)
npm run dev

# OR run both together
npm run dev:all
```

### 4. Verify Setup

Visit these URLs to confirm everything is running:

- **Frontend**: http://localhost:3000
- **Mock API Root**: http://localhost:3001
- **Applications Endpoint**: http://localhost:3001/applications
- **Users Endpoint**: http://localhost:3001/users

### 5. Test API Operations

```bash
# Get all applications
curl http://localhost:3001/applications

# Get application by tracking number
curl http://localhost:3001/applications?tracking_number=BH2024001

# Get applications by status
curl http://localhost:3001/applications?current_status=SUBMITTED

# Create new application (POST)
curl -X POST http://localhost:3001/applications \
  -H "Content-Type: application/json" \
  -d '{
    "tracking_number": "BH2024999",
    "type": "NEW",
    "current_status": "DRAFT",
    "applicant_mobile": "+919999999999"
  }'
```

## Available Endpoints

All endpoints follow REST conventions:

| Endpoint | Description |
|----------|-------------|
| `GET /users` | List all users |
| `GET /applications` | List all applications |
| `GET /applications/:id` | Get specific application |
| `POST /applications` | Create new application |
| `PATCH /applications/:id` | Update application |
| `DELETE /applications/:id` | Delete application |
| `GET /documents` | List all documents |
| `GET /interviews` | List all interviews |
| `GET /rooms` | List all rooms |
| `GET /leaves` | List all leaves |
| `GET /fees` | List all fees |
| `GET /transactions` | List all transactions |

## Query Parameters

json-server supports powerful filtering:

```bash
# Filter by field
GET /applications?current_status=SUBMITTED

# Filter by nested field
GET /applications?data.personal_info.age=21

# Sort
GET /applications?_sort=created_at&_order=desc

# Paginate
GET /applications?_page=1&_limit=10

# Full-text search
GET /applications?q=Amit
```

## Common Development Tasks

### Adding Mock Data

Edit `db.json` directly:

```json
{
  "applications": [
    {
      "id": "app-new",
      "tracking_number": "BH2024100",
      "type": "NEW",
      "current_status": "DRAFT"
      // ... rest of fields
    }
  ]
}
```

json-server will auto-reload when you save the file.

### Resetting Mock Data

```bash
# Reset to clean state
cp db.json.example db.json
```

### Simulating Network Delay

Edit json-server start command:

```bash
json-server --watch db.json --port 3001 --delay 500
```

This adds a 500ms delay to all requests, simulating real network conditions.

## Frontend Integration

### API Configuration

Create `lib/api-config.ts`:

```typescript
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
```

### Sample Component

```typescript
'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/api-config';

export default function ApplicationsList() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/applications`)
      .then(res => res.json())
      .then(data => {
        setApplications(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Applications</h1>
      <ul>
        {applications.map(app => (
          <li key={app.id}>
            {app.tracking_number} - {app.current_status}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Troubleshooting

### json-server command not found

```bash
# Install globally
npm install -g json-server

# Or use npx
npx json-server --watch db.json --port 3001
```

### Port 3001 already in use

```bash
# Find and kill process
lsof -i :3001
kill -9 <PID>

# Or use different port
json-server --watch db.json --port 3002
```

### CORS errors from Next.js

json-server allows CORS by default. If you still see errors, restart both servers.

### Changes not reflecting

1. Check if json-server is watching the correct file
2. Look for JSON syntax errors in db.json
3. Restart json-server if needed

## Next Steps

1. Read the full guide: `.docs/db-json-prototyping-guide.md`
2. Explore the schema: `.docs/architecture/03-3.-core-data-schema-high-level.md`
3. Start building components that consume the mock API
4. Plan migration to Supabase (Phase 2)

## Useful Resources

- **json-server docs**: https://github.com/typicode/json-server
- **db.json structure**: See `db.json.example`
- **Full prototyping guide**: `.docs/db-json-prototyping-guide.md`
- **Architecture docs**: `.docs/architecture.md`

---

**Quick Reference:**

```bash
# Start everything
npm run dev:all

# View all applications
curl http://localhost:3001/applications

# Reset data
cp db.json.example db.json
```

Happy coding!
