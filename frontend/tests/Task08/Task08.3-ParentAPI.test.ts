import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET, POST, PUT, DELETE, PATCH } from '../../src/app/api/parent/student/route';

// Mock the database layer
vi.mock('../../src/lib/api/db', () => ({
  find: vi.fn().mockImplementation((collection: string, filter?: (item: any) => boolean) => {
    if (collection === 'applications') {
      const mockApps = [{
        id: 'app-1',
        vertical: 'BOYS_HOSTEL',
        current_status: 'APPROVED',
        student_user_id: 'student-1',
        tracking_number: 'BH-2024-001',
        submitted_at: '2024-06-15',
        data: {
          personal_info: { full_name: 'Rahul Jain' },
          guardian_info: { father_mobile: '9876543210' }
        }
      }];
      return Promise.resolve(filter ? mockApps.filter(filter) : mockApps);
    }
    if (collection === 'profiles') {
      return Promise.resolve([]);
    }
    return Promise.resolve([]);
  }),
  findOne: vi.fn().mockImplementation((collection: string, filter?: (item: any) => boolean) => {
    if (collection === 'allocations') {
      const mockAlloc = {
        id: 'alloc-1',
        student_id: 'student-1',
        room_id: 'room-1',
        status: 'ACTIVE',
        allocated_at: '2024-06-15'
      };
      return Promise.resolve(filter ? (filter(mockAlloc) ? mockAlloc : null) : mockAlloc);
    }
    if (collection === 'rooms') {
      const mockRoom = {
        id: 'room-1',
        room_number: 'B-101',
        vertical: 'BOYS_HOSTEL'
      };
      return Promise.resolve(filter ? (filter(mockRoom) ? mockRoom : null) : mockRoom);
    }
    return Promise.resolve(null);
  }),
}));

// Mock Next.js Request object
const mockRequest = (method: string = 'GET', url: string = 'http://localhost/api/parent/student?sessionToken=test') => {
  return {
    url,
    method,
  } as any;
};

describe('Task 8.3 - Parent API Permissions and View-Only Behavior', () => {
  beforeEach(() => {
    // Clear console before each test
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Student API - GET Requests', () => {
    it('allows GET requests with valid session token', async () => {
      const validToken = Buffer.from(JSON.stringify({
        contact: '9876543210',
        vertical: 'parent',
        verified: true,
        timestamp: Date.now(),
        sessionId: 'test-session-123'
      })).toString('base64');

      const request = mockRequest('GET', `http://localhost/api/parent/student?sessionToken=${validToken}`);
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.name).toBe('Rahul Jain');
    });

    it('returns 401 for missing session token', async () => {
      const request = mockRequest('GET', 'http://localhost/api/parent/student');
      const response = await GET(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.message).toContain('Authentication required');
    });

    it('returns 401 for invalid session token', async () => {
      const request = mockRequest('GET', 'http://localhost/api/parent/student?sessionToken=invalid');
      const response = await GET(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.message).toContain('Invalid session token');
    });

    it('returns 403 for non-parent role', async () => {
      const studentToken = Buffer.from(JSON.stringify({
        contact: '9876543210',
        vertical: 'student',
        verified: true,
        timestamp: Date.now(),
        sessionId: 'test-session-123'
      })).toString('base64');

      const request = mockRequest('GET', `http://localhost/api/parent/student?sessionToken=${studentToken}`);
      const response = await GET(request);

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.message).toContain('Access denied');
    });

    it('returns 401 for expired session token', async () => {
      const expiredToken = Buffer.from(JSON.stringify({
        contact: '9876543210',
        vertical: 'parent',
        verified: true,
        timestamp: Date.now() - 86400001, // 24 hours + 1ms ago
        sessionId: 'test-session-123'
      })).toString('base64');

      const request = mockRequest('GET', `http://localhost/api/parent/student?sessionToken=${expiredToken}`);
      const response = await GET(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.message).toContain('Session expired');
    });
  });

  describe('Student API - Mutation Prevention', () => {
    it('rejects POST requests with 405', async () => {
      const response = await POST();

      expect(response.status).toBe(405);
      const data = await response.json();
      expect(data.message).toContain('Method not allowed');
      expect(data.message).toContain('read-only');
    });

    it('rejects PUT requests with 405', async () => {
      const response = await PUT();

      expect(response.status).toBe(405);
      const data = await response.json();
      expect(data.message).toContain('Method not allowed');
      expect(data.message).toContain('read-only');
    });

    it('rejects DELETE requests with 405', async () => {
      const response = await DELETE();

      expect(response.status).toBe(405);
      const data = await response.json();
      expect(data.message).toContain('Method not allowed');
      expect(data.message).toContain('read-only');
    });

    it('rejects PATCH requests with 405', async () => {
      const response = await PATCH();

      expect(response.status).toBe(405);
      const data = await response.json();
      expect(data.message).toContain('Method not allowed');
      expect(data.message).toContain('read-only');
    });
  });

  describe('Data Scope Validation', () => {
    it('returns only student data (no sensitive fields)', async () => {
      const validToken = Buffer.from(JSON.stringify({
        contact: '9876543210',
        vertical: 'parent',
        verified: true,
        timestamp: Date.now(),
        sessionId: 'test-session-123'
      })).toString('base64');

      const request = mockRequest('GET', `http://localhost/api/parent/student?sessionToken=${validToken}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      // Should include basic student info
      expect(data.data.id).toBeDefined();
      expect(data.data.name).toBeDefined();
      expect(data.data.vertical).toBeDefined();
      expect(data.data.room).toBeDefined();
      
      // Should NOT include sensitive fields like passwords, internal remarks, etc.
      expect(data.data.password).toBeUndefined();
      expect(data.data.internalRemarks).toBeUndefined();
    });
  });

  describe('Fees API - Read-Only Enforcement', () => {
    it('rejects POST to fees endpoint with 405', async () => {
      const { POST: FeesPost } = await import('../../src/app/api/parent/fees/route');
      const response = await FeesPost();

      expect(response.status).toBe(405);
      const data = await response.json();
      expect(data.message).toContain('Method not allowed');
      expect(data.message).toContain('read-only');
    });
  });

  describe('Leave API - Read-Only Enforcement', () => {
    it('rejects POST to leave endpoint with 405', async () => {
      const { POST: LeavePost } = await import('../../src/app/api/parent/leave/route');
      const response = await LeavePost();

      expect(response.status).toBe(405);
      const data = await response.json();
      expect(data.message).toContain('Method not allowed');
      expect(data.message).toContain('read-only');
    });
  });

  describe('Notifications API - Read-Only Enforcement', () => {
    it('rejects POST to notifications endpoint with 405', async () => {
      const { POST: NotificationsPost } = await import('../../src/app/api/parent/notifications/route');
      const response = await NotificationsPost();

      expect(response.status).toBe(405);
      const data = await response.json();
      expect(data.message).toContain('Method not allowed');
      expect(data.message).toContain('read-only');
    });
  });
});
