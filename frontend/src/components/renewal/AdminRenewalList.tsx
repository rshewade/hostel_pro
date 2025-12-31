'use client';

import React, { useState } from 'react';
import { Card } from '@/components/data/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import { Table } from '@/components/data/Table';
import type { TableColumn } from '@/components/types';
import { RenewalStatusTracker } from './RenewalStatusTracker';
import { Search, Filter, Download, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';

export interface RenewalApplication {
  id: string;
  studentId: string;
  studentName: string;
  vertical: string;
  room: string;
  type: 'NEW' | 'RENEWAL';
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  daysRemaining: number;
  documentsUploaded: number;
  documentsRequired: number;
  paymentStatus: 'PENDING' | 'PARTIAL' | 'COMPLETE';
  amountDue: number;
  submittedAt: string | null;
  reviewedAt: string | null;
}

interface AdminRenewalListProps {
  title?: string;
  showVerticalFilter?: boolean;
  currentVertical?: string;
  onViewDetail: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  className?: string;
}

const SAMPLE_RENEWALS: RenewalApplication[] = [
  {
    id: 'REN001',
    studentId: 'STU001',
    studentName: 'Amit Kumar Jain',
    vertical: 'Boys Hostel',
    room: 'A-201',
    type: 'RENEWAL',
    status: 'IN_PROGRESS',
    daysRemaining: 30,
    documentsUploaded: 1,
    documentsRequired: 2,
    paymentStatus: 'PENDING',
    amountDue: 60000,
    submittedAt: null,
    reviewedAt: null,
  },
  {
    id: 'REN002',
    studentId: 'STU002',
    studentName: 'Priya Sharma',
    vertical: 'Girls Ashram',
    room: 'B-105',
    type: 'RENEWAL',
    status: 'UNDER_REVIEW',
    daysRemaining: 15,
    documentsUploaded: 2,
    documentsRequired: 2,
    paymentStatus: 'PARTIAL',
    amountDue: 5000,
    submittedAt: '2025-01-08T10:00:00Z',
    reviewedAt: null,
  },
  {
    id: 'REN003',
    studentId: 'STU003',
    studentName: 'Rahul Verma',
    vertical: 'Boys Hostel',
    room: 'C-301',
    type: 'RENEWAL',
    status: 'UNDER_REVIEW',
    daysRemaining: 10,
    documentsUploaded: 2,
    documentsRequired: 1,
    paymentStatus: 'COMPLETE',
    amountDue: 0,
    submittedAt: '2025-01-05T14:00:00Z',
    reviewedAt: null,
  },
  {
    id: 'REN004',
    studentId: 'STU004',
    studentName: 'Sneha Gupta',
    vertical: 'Girls Ashram',
    room: 'B-102',
    type: 'NEW',
    status: 'IN_PROGRESS',
    daysRemaining: 45,
    documentsUploaded: 0,
    documentsRequired: 3,
    paymentStatus: 'PENDING',
    amountDue: 75000,
    submittedAt: null,
    reviewedAt: null,
  },
];

export const AdminRenewalList: React.FC<AdminRenewalListProps> = ({
  title = 'Renewal Applications',
  showVerticalFilter = true,
  currentVertical = 'All',
  onViewDetail,
  onApprove,
  onReject,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verticalFilter, setVerticalFilter] = useState(currentVertical);

  const filteredRenewals = SAMPLE_RENEWALS.filter((renewal) => {
    const matchesSearch =
      renewal.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      renewal.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      renewal.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || renewal.status === statusFilter;
    const matchesVertical = verticalFilter === 'All' || renewal.vertical === verticalFilter;

    return matchesSearch && matchesStatus && matchesVertical;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NOT_STARTED':
        return <Badge variant="default" size="sm">Not Started</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="warning" size="sm">In Progress</Badge>;
      case 'UNDER_REVIEW':
        return <Badge variant="info" size="sm">Under Review</Badge>;
      case 'APPROVED':
        return <Badge variant="success" size="sm">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="error" size="sm">Rejected</Badge>;
      default:
        return <Badge variant="default" size="sm">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="error" size="sm">Pending</Badge>;
      case 'PARTIAL':
        return <Badge variant="warning" size="sm">Partial</Badge>;
      case 'COMPLETE':
        return <Badge variant="success" size="sm">Complete</Badge>;
      default:
        return <Badge variant="default" size="sm">{status}</Badge>;
    }
  };

  const columns: TableColumn<RenewalApplication>[] = [
    {
      key: 'id',
      header: 'ID',
      width: '100px',
      render: (value) => (
        <span className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>
          {value}
        </span>
      ),
    },
    {
      key: 'studentName',
      header: 'Student',
      render: (value, row) => (
        <div>
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{value}</p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {row.studentId} | {row.room}
          </p>
        </div>
      ),
    },
    {
      key: 'vertical',
      header: 'Vertical',
      width: '120px',
      render: (value) => (
        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{value}</span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      width: '80px',
      render: (value) => (
        <Badge variant={value === 'NEW' ? 'info' : 'default'} size="sm">
          {value}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '130px',
      render: (value) => getStatusBadge(value),
    },
    {
      key: 'documents',
      header: 'Documents',
      width: '100px',
      render: (value, row) => (
        <span className="text-sm">
          <span style={{ color: row.documentsUploaded === row.documentsRequired ? 'var(--color-green-600)' : 'var(--text-primary)' }}>
            {row.documentsUploaded}
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>/{row.documentsRequired}</span>
        </span>
      ),
    },
    {
      key: 'payment',
      header: 'Payment',
      width: '100px',
      render: (value, row) => (
        <div>
          {getPaymentBadge(row.paymentStatus)}
          {row.amountDue > 0 && (
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              ₹{row.amountDue.toLocaleString()}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'daysRemaining',
      header: 'Days Left',
      width: '90px',
      render: (value) => (
        <span
          className="text-sm font-medium"
          style={{
            color:
              value <= 7
                ? 'var(--color-red-600)'
                : value <= 15
                ? 'var(--color-amber-600)'
                : 'var(--text-primary)',
          }}
        >
          {value} days
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '150px',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetail(row.id)}
            aria-label="View Details"
          >
            <Eye className="w-4 h-4" />
          </Button>
          {row.status === 'UNDER_REVIEW' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onApprove(row.id)}
                aria-label="Approve"
                className="text-green-600 hover:text-green-700"
              >
                <CheckCircle className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReject(row.id)}
                aria-label="Reject"
                className="text-red-600 hover:text-red-700"
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const statusCounts = {
    all: SAMPLE_RENEWALS.length,
    IN_PROGRESS: SAMPLE_RENEWALS.filter((r) => r.status === 'IN_PROGRESS').length,
    UNDER_REVIEW: SAMPLE_RENEWALS.filter((r) => r.status === 'UNDER_REVIEW').length,
    APPROVED: SAMPLE_RENEWALS.filter((r) => r.status === 'APPROVED').length,
    REJECTED: SAMPLE_RENEWALS.filter((r) => r.status === 'REJECTED').length,
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Review and process student renewal applications
          </p>
        </div>
        <Button variant="secondary" size="sm" leftIcon={<Download className="w-4 h-4" />}>
          Export
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by student name, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        {showVerticalFilter && (
          <div className="w-[180px]">
            <Select
              value={verticalFilter}
              onChange={(e) => setVerticalFilter(e.target.value)}
              options={[
                { value: 'All', label: 'All Verticals' },
                { value: 'Boys Hostel', label: 'Boys Hostel' },
                { value: 'Girls Ashram', label: 'Girls Ashram' },
                { value: 'Dharamshala', label: 'Dharamshala' },
              ]}
            />
          </div>
        )}
        <div className="flex gap-2">
          {(['all', 'IN_PROGRESS', 'UNDER_REVIEW', 'APPROVED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ')}
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-white/50">
                {statusCounts[status]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Card padding="none" shadow="sm">
        <Table
          data={filteredRenewals}
          columns={columns}
          striped
          stickyHeader
          emptyMessage="No renewal applications found"
        />
      </Card>

      <div className="mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
        Showing {filteredRenewals.length} of {SAMPLE_RENEWALS.length} applications
      </div>
    </div>
  );
};

export default AdminRenewalList;
