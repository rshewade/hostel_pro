// Import @testing-library/jest-dom FIRST for side effects (custom matchers)
import '@testing-library/jest-dom';

import { expect, afterEach, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';

expect.extend(matchers);

// Clean up after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  })),
  useSearchParams: vi.fn(() => ({
    get: vi.fn((key: string) => null),
    getAll: vi.fn(() => []),
    has: vi.fn(() => false),
    toString: vi.fn(() => ''),
  })),
  usePathname: vi.fn(() => '/'),
  useParams: vi.fn(() => ({})),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: vi.fn((props: any) => {
    const { src, alt, width, height, ...rest } = props;
    return {
      $$typeof: Symbol.for('react.element'),
      type: 'img',
      props: { src, alt, width, height, ...rest },
      key: null,
      ref: null,
    };
  }),
}));

// Base URL for test environment
const TEST_BASE_URL = 'http://localhost:3000';

// Default mock responses for common API endpoints
const mockApiResponses: Record<string, any> = {
  '/api/applications': [
    {
      id: '1',
      trackingNumber: 'HG-2026-00001',
      status: 'SUBMITTED',
      vertical: 'BOYS',
      applicantName: 'Rahul Sharma',
      firstName: 'Rahul',
      lastName: 'Sharma',
      applicationDate: '2026-01-01',
      paymentStatus: 'PAID',
      interviewScheduled: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      trackingNumber: 'HG-2026-00002',
      status: 'UNDER_REVIEW',
      vertical: 'GIRLS',
      applicantName: 'Priya Patel',
      firstName: 'Priya',
      lastName: 'Patel',
      applicationDate: '2026-01-02',
      paymentStatus: 'PENDING',
      interviewScheduled: false,
      createdAt: new Date().toISOString(),
      flags: ['Documents Pending', 'High Priority'],
    },
    {
      id: '3',
      trackingNumber: 'HG-2026-00003',
      status: 'APPROVED',
      vertical: 'DHARAMSHALA',
      applicantName: 'Rajesh Kumar',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      applicationDate: '2025-12-28',
      paymentStatus: 'PAID',
      interviewScheduled: false,
      createdAt: new Date().toISOString(),
    },
  ],
  '/api/dashboard/student': {
    student: { id: '1', name: 'Test Student', email: 'test@example.com', status: 'ACTIVE' },
    fees: { total: 50000, paid: 25000, pending: 25000 },
    leaves: [],
    room: { id: 'R101', number: '101', floor: 1, building: 'A', capacity: 2 },
  },
  '/api/dashboard/superintendent': {
    applications: [
      { id: '1', status: 'PENDING', applicantName: 'Test', vertical: 'BOYS_HOSTEL' },
    ],
    stats: { pending: 5, approved: 10, rejected: 2 },
  },
  '/api/dashboard/trustee': {
    applications: [
      { id: '1', status: 'FORWARDED', applicantName: 'Test', vertical: 'BOYS_HOSTEL' },
    ],
    interviews: [
      { id: '1', applicationId: '1', scheduledAt: new Date().toISOString(), status: 'SCHEDULED' },
    ],
  },
  '/api/dashboard/accounts': {
    receivables: [
      { id: '1', studentName: 'Test Student', amount: 25000, status: 'PENDING' },
    ],
    payments: [
      { id: '1', studentName: 'Test Student', amount: 25000, date: new Date().toISOString() },
    ],
  },
  '/api/dashboard/parent': {
    student: {
      id: '1',
      name: 'Test Student',
      email: 'test@example.com',
      status: 'ACTIVE',
      room: '101',
      vertical: 'BOYS_HOSTEL',
    },
    fees: [
      { id: '1', description: 'Hostel Fee', amount: 25000, status: 'PAID', dueDate: '2026-01-15' },
      { id: '2', description: 'Mess Fee', amount: 15000, status: 'PENDING', dueDate: '2026-02-01' },
    ],
    leaves: [
      { id: '1', type: 'SHORT_LEAVE', startDate: '2026-01-10', endDate: '2026-01-10', status: 'APPROVED' },
    ],
  },
  '/api/rooms': [
    { id: 'R101', number: '101', floor: 1, building: 'A', capacity: 2, occupied: 1, status: 'AVAILABLE' },
    { id: 'R102', number: '102', floor: 1, building: 'A', capacity: 2, occupied: 2, status: 'FULL' },
  ],
  '/api/allocations': [
    { id: '1', roomId: 'R101', studentId: '1', allocatedAt: new Date().toISOString(), status: 'ACTIVE' },
  ],
  '/api/leaves': [
    { id: '1', studentId: '1', type: 'SHORT_LEAVE', startDate: '2026-01-10', status: 'PENDING' },
  ],
  '/api/fees': {
    structure: [
      { id: '1', name: 'Hostel Fee', amount: 25000, frequency: 'SEMESTER' },
      { id: '2', name: 'Mess Fee', amount: 15000, frequency: 'MONTHLY' },
    ],
  },
  '/api/payments': [
    { id: '1', studentId: '1', amount: 25000, status: 'SUCCESS', date: new Date().toISOString() },
  ],
  '/api/interviews': [
    { id: '1', applicationId: '1', scheduledAt: new Date().toISOString(), status: 'SCHEDULED', mode: 'IN_PERSON' },
  ],
  '/api/interviews/slots': [
    { date: '2026-01-10', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
  ],
  '/api/audit/entity': [
    { id: '1', action: 'CREATE', entityType: 'APPLICATION', timestamp: new Date().toISOString() },
  ],
  '/api/auth/login': {
    success: true,
    user: { id: '1', email: 'test@example.com', role: 'STUDENT' },
    token: 'mock-token',
  },
  '/api/auth/session': {
    user: { id: '1', email: 'test@example.com', role: 'STUDENT' },
    isAuthenticated: true,
  },
  '/api/parent/student': {
    id: '1',
    name: 'Test Student',
    email: 'test@example.com',
    status: 'ACTIVE',
    room: '101',
  },
  '/api/parent/fees': [
    { id: '1', description: 'Hostel Fee', amount: 25000, status: 'PAID' },
    { id: '2', description: 'Mess Fee', amount: 15000, status: 'PENDING' },
  ],
  '/api/parent/leave': [
    { id: '1', type: 'SHORT_LEAVE', startDate: '2026-01-10', status: 'APPROVED' },
  ],
};

// Global fetch mock that handles relative URLs
const originalFetch = globalThis.fetch;

globalThis.fetch = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
  let url: string;

  if (typeof input === 'string') {
    // Handle relative URLs by prepending base URL
    url = input.startsWith('/') ? `${TEST_BASE_URL}${input}` : input;
  } else if (input instanceof URL) {
    url = input.toString();
  } else if (input instanceof Request) {
    url = input.url;
  } else {
    url = String(input);
  }

  // Extract pathname for matching
  let pathname: string;
  try {
    const urlObj = new URL(url);
    pathname = urlObj.pathname;
  } catch {
    pathname = url;
  }

  // Find matching mock response
  const matchingKey = Object.keys(mockApiResponses).find(key =>
    pathname.startsWith(key) || pathname === key
  );

  if (matchingKey) {
    const responseData = mockApiResponses[matchingKey];
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(responseData),
      text: () => Promise.resolve(JSON.stringify(responseData)),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    } as Response);
  }

  // For unmatched API routes, return empty success response
  if (pathname.startsWith('/api/')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve('{}'),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    } as Response);
  }

  // For non-API requests, use original fetch if available
  if (originalFetch) {
    return originalFetch(input, init);
  }

  // Fallback empty response
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    headers: new Headers(),
  } as Response);
}) as typeof fetch;

// Suppress console errors during tests (optional - comment out if you need to debug)
// vi.spyOn(console, 'error').mockImplementation(() => {});
