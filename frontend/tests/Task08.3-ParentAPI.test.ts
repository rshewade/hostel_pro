import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GET, POST, PUT, DELETE, PATCH } from '../src/app/api/parent/student/route';

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
    console.log = vi.fn();
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
      const { POST: FeesPost } = await import('../src/app/api/parent/fees/route');
      const response = await FeesPost();

      expect(response.status).toBe(405);
      const data = await response.json();
      expect(data.message).toContain('Method not allowed');
      expect(data.message).toContain('read-only');
    });
  });

  describe('Leave API - Read-Only Enforcement', () => {
    it('rejects POST to leave endpoint with 405', async () => {
      const { POST: LeavePost } = await import('../src/app/api/parent/leave/route');
      const response = await LeavePost();

      expect(response.status).toBe(405);
      const data = await response.json();
      expect(data.message).toContain('Method not allowed');
      expect(data.message).toContain('read-only');
    });
  });

  describe('Notifications API - Read-Only Enforcement', () => {
    it('rejects POST to notifications endpoint with 405', async () => {
      const { POST: NotificationsPost } = await import('../src/app/api/parent/notifications/route');
      const response = await NotificationsPost();

      expect(response.status).toBe(405);
      const data = await response.json();
      expect(data.message).toContain('Method not allowed');
      expect(data.message).toContain('read-only');
    });
  });
});
