'use client';

import { useState, useMemo } from 'react';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Card } from '@/components/data/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/data/Table';
import type { TableColumn } from '@/components/types';
import { Select, type SelectOption } from '@/components/forms/Select';
import { cn } from '@/components/utils';

type Vertical = 'ALL' | 'BOYS' | 'GIRLS' | 'DHARAMSHALA';
type Period = 'THIS_MONTH' | 'LAST_MONTH' | 'LAST_3_MONTHS' | 'LAST_6_MONTHS' | 'THIS_YEAR' | 'ALL_TIME';
type Status = 'ALL' | 'PAID' | 'PENDING' | 'OVERDUE' | 'PARTIAL';
type FeeComponent = 'ALL' | 'PROCESSING_FEE' | 'HOSTEL_FEES' | 'SECURITY_DEPOSIT' | 'KEY_DEPOSIT' | 'PARTIAL_PAYMENT';
type UserRole = 'ALL' | 'SUPERINTENDENT' | 'ACCOUNTS' | 'TRUSTEE' | 'ADMIN';

interface Receivable {
  id: string;
  studentName: string;
  studentId: string;
  vertical: 'BOYS' | 'GIRLS' | 'DHARAMSHALA';
  amount: number;
  dueDate: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'PARTIAL';
  feeComponent: 'PROCESSING_FEE' | 'HOSTEL_FEES' | 'SECURITY_DEPOSIT' | 'KEY_DEPOSIT' | 'PARTIAL_PAYMENT';
  contact: {
    phone: string;
    email: string;
    parentPhone?: string;
  };
  audit: {
    createdBy: string;
    createdByRole: UserRole;
    createdAt: string;
    modifiedBy?: string;
    modifiedAt?: string;
  };
  communicationLogs?: number;
}

export default function AccountsDashboard() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'receivables' | 'payment-logs' | 'receipts' | 'clearance' | 'data-export'>('overview');
  const [selectedVertical, setSelectedVertical] = useState<Vertical>('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('THIS_MONTH');
  const [statusFilter, setStatusFilter] = useState<Status>('ALL');
  const [feeComponentFilter, setFeeComponentFilter] = useState<FeeComponent>('ALL');
  const [userRoleFilter, setUserRoleFilter] = useState<UserRole>('ALL');
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' });
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const verticalOptions: SelectOption[] = [
    { value: 'ALL', label: 'All Verticals' },
    { value: 'BOYS', label: 'Boys Hostel' },
    { value: 'GIRLS', label: 'Girls Ashram' },
    { value: 'DHARAMSHALA', label: 'Dharamshala' }
  ];

  const periodOptions: SelectOption[] = [
    { value: 'THIS_MONTH', label: 'This Month' },
    { value: 'LAST_MONTH', label: 'Last Month' },
    { value: 'LAST_3_MONTHS', label: 'Last 3 Months' },
    { value: 'LAST_6_MONTHS', label: 'Last 6 Months' },
    { value: 'THIS_YEAR', label: 'This Year' },
    { value: 'ALL_TIME', label: 'All Time' }
  ];

  const feeComponentOptions: SelectOption[] = [
    { value: 'ALL', label: 'All Fee Components' },
    { value: 'PROCESSING_FEE', label: 'Processing Fee' },
    { value: 'HOSTEL_FEES', label: 'Hostel Fees' },
    { value: 'SECURITY_DEPOSIT', label: 'Security Deposit' },
    { value: 'KEY_DEPOSIT', label: 'Key Deposit' },
    { value: 'PARTIAL_PAYMENT', label: 'Partial Payment' }
  ];

  const userRoleOptions: SelectOption[] = [
    { value: 'ALL', label: 'All User Roles' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'SUPERINTENDENT', label: 'Superintendent' },
    { value: 'ACCOUNTS', label: 'Accounts' },
    { value: 'TRUSTEE', label: 'Trustee' }
  ];

  const mockReceivables: Receivable[] = [
    {
      id: '1',
      studentName: 'Rahul Sharma',
      studentId: 'STU-2024-001',
      vertical: 'BOYS',
      amount: 45000,
      dueDate: '2024-12-25',
      status: 'OVERDUE',
      feeComponent: 'HOSTEL_FEES',
      contact: {
        phone: '+91 9876543210',
        email: 'rahul.sharma@example.com',
        parentPhone: '+91 9876543211'
      },
      audit: {
        createdBy: 'admin@jainhostel.com',
        createdByRole: 'ADMIN',
        createdAt: '2024-12-01T10:30:00Z'
      },
      communicationLogs: 3
    },
    {
      id: '2',
      studentName: 'Priya Patel',
      studentId: 'STU-2024-002',
      vertical: 'GIRLS',
      amount: 42000,
      dueDate: '2025-01-15',
      status: 'PENDING',
      feeComponent: 'PROCESSING_FEE',
      contact: {
        phone: '+91 9876543220',
        email: 'priya.patel@example.com',
        parentPhone: '+91 9876543221'
      },
      audit: {
        createdBy: 'superintendent.girls@jainhostel.com',
        createdByRole: 'SUPERINTENDENT',
        createdAt: '2024-12-05T14:20:00Z'
      },
      communicationLogs: 1
    },
    {
      id: '3',
      studentName: 'Amit Kumar',
      studentId: 'STU-2024-003',
      vertical: 'BOYS',
      amount: 48000,
      dueDate: '2025-01-10',
      status: 'PAID',
      feeComponent: 'HOSTEL_FEES',
      contact: {
        phone: '+91 9876543230',
        email: 'amit.kumar@example.com'
      },
      audit: {
        createdBy: 'accounts@jainhostel.com',
        createdByRole: 'ACCOUNTS',
        createdAt: '2024-11-20T09:15:00Z',
        modifiedBy: 'accounts@jainhostel.com',
        modifiedAt: '2024-12-10T16:45:00Z'
      },
      communicationLogs: 0
    },
    {
      id: '4',
      studentName: 'Sneha Reddy',
      studentId: 'STU-2024-004',
      vertical: 'DHARAMSHALA',
      amount: 38000,
      dueDate: '2024-12-28',
      status: 'PARTIAL',
      feeComponent: 'PARTIAL_PAYMENT',
      contact: {
        phone: '+91 9876543240',
        email: 'sneha.reddy@example.com',
        parentPhone: '+91 9876543241'
      },
      audit: {
        createdBy: 'superintendent.dharamshala@jainhostel.com',
        createdByRole: 'SUPERINTENDENT',
        createdAt: '2024-11-25T11:00:00Z',
        modifiedBy: 'accounts@jainhostel.com',
        modifiedAt: '2024-12-15T13:30:00Z'
      },
      communicationLogs: 2
    },
    {
      id: '5',
      studentName: 'Vijay Singh',
      studentId: 'STU-2024-005',
      vertical: 'GIRLS',
      amount: 52000,
      dueDate: '2025-01-20',
      status: 'PENDING',
      feeComponent: 'SECURITY_DEPOSIT',
      contact: {
        phone: '+91 9876543250',
        email: 'vijay.singh@example.com',
        parentPhone: '+91 9876543251'
      },
      audit: {
        createdBy: 'admin@jainhostel.com',
        createdByRole: 'ADMIN',
        createdAt: '2024-12-08T08:45:00Z'
      },
      communicationLogs: 0
    },
    {
      id: '6',
      studentName: 'Neha Gupta',
      studentId: 'STU-2024-006',
      vertical: 'BOYS',
      amount: 45000,
      dueDate: '2025-01-25',
      status: 'PENDING',
      feeComponent: 'HOSTEL_FEES',
      contact: {
        phone: '+91 9876543260',
        email: 'neha.gupta@example.com',
        parentPhone: '+91 9876543261'
      },
      audit: {
        createdBy: 'superintendent.boys@jainhostel.com',
        createdByRole: 'SUPERINTENDENT',
        createdAt: '2024-12-10T12:00:00Z'
      },
      communicationLogs: 1
    },
    {
      id: '7',
      studentName: 'Rajesh Kumar',
      studentId: 'STU-2024-007',
      vertical: 'DHARAMSHALA',
      amount: 38000,
      dueDate: '2024-12-30',
      status: 'OVERDUE',
      feeComponent: 'HOSTEL_FEES',
      contact: {
        phone: '+91 9876543270',
        email: 'rajesh.kumar@example.com'
      },
      audit: {
        createdBy: 'superintendent.dharamshala@jainhostel.com',
        createdByRole: 'SUPERINTENDENT',
        createdAt: '2024-11-28T15:20:00Z'
      },
      communicationLogs: 4
    },
    {
      id: '8',
      studentName: 'Anita Desai',
      studentId: 'STU-2024-008',
      vertical: 'GIRLS',
      amount: 50000,
      dueDate: '2025-01-05',
      status: 'PAID',
      feeComponent: 'KEY_DEPOSIT',
      contact: {
        phone: '+91 9876543280',
        email: 'anita.desai@example.com',
        parentPhone: '+91 9876543281'
      },
      audit: {
        createdBy: 'accounts@jainhostel.com',
        createdByRole: 'ACCOUNTS',
        createdAt: '2024-12-01T10:00:00Z',
        modifiedBy: 'trustee@jainhostel.com',
        modifiedAt: '2024-12-05T14:00:00Z'
      },
      communicationLogs: 0
    },
    {
      id: '9',
      studentName: 'Suresh Patil',
      studentId: 'STU-2024-009',
      vertical: 'BOYS',
      amount: 46000,
      dueDate: '2025-01-12',
      status: 'PENDING',
      feeComponent: 'HOSTEL_FEES',
      contact: {
        phone: '+91 9876543290',
        email: 'suresh.patil@example.com'
      },
      audit: {
        createdBy: 'admin@jainhostel.com',
        createdByRole: 'ADMIN',
        createdAt: '2024-12-12T09:30:00Z'
      },
      communicationLogs: 1
    },
    {
      id: '10',
      studentName: 'Kavita Mehta',
      studentId: 'STU-2024-010',
      vertical: 'DHARAMSHALA',
      amount: 39000,
      dueDate: '2025-01-18',
      status: 'PARTIAL',
      feeComponent: 'PARTIAL_PAYMENT',
      contact: {
        phone: '+91 9876543300',
        email: 'kavita.mehta@example.com',
        parentPhone: '+91 9876543301'
      },
      audit: {
        createdBy: 'superintendent.dharamshala@jainhostel.com',
        createdByRole: 'SUPERINTENDENT',
        createdAt: '2024-12-15T11:45:00Z',
        modifiedBy: 'accounts@jainhostel.com',
        modifiedAt: '2024-12-20T10:00:00Z'
      },
      communicationLogs: 2
    }
  ];

  const mockPaymentLogs = [
    {
      id: '1',
      transactionId: 'TXN-2024-12-30-001',
      studentName: 'Rahul Sharma',
      studentId: 'STU-2024-001',
      amount: 45000,
      paymentDate: '2024-12-20',
      method: 'UPI',
      status: 'SUCCESS',
      feeHead: 'Hostel Fees',
      vertical: 'BOYS'
    },
    {
      id: '2',
      transactionId: 'TXN-2024-12-28-002',
      studentName: 'Priya Patel',
      studentId: 'STU-2024-002',
      amount: 42000,
      paymentDate: '2024-12-15',
      method: 'QR Code',
      status: 'SUCCESS',
      feeHead: 'Processing Fee',
      vertical: 'GIRLS'
    },
    {
      id: '3',
      transactionId: 'TXN-2024-12-25-003',
      studentName: 'Amit Kumar',
      studentId: 'STU-2024-003',
      amount: 48000,
      paymentDate: '2024-12-10',
      method: 'UPI',
      status: 'FAILED',
      feeHead: 'Hostel Fees',
      vertical: 'BOYS'
    },
    {
      id: '4',
      transactionId: 'TXN-2024-12-22-004',
      studentName: 'Anita Desai',
      studentId: 'STU-2024-008',
      amount: 50000,
      paymentDate: '2024-12-05',
      method: 'NEFT',
      status: 'SUCCESS',
      feeHead: 'Hostel Fees',
      vertical: 'GIRLS'
    },
    {
      id: '5',
      transactionId: 'TXN-2024-12-20-005',
      studentName: 'Sneha Reddy',
      studentId: 'STU-2024-004',
      amount: 20000,
      paymentDate: '2024-12-01',
      method: 'UPI',
      status: 'SUCCESS',
      feeHead: 'Partial Payment',
      vertical: 'DHARAMSHALA'
    }
  ];

  const filteredReceivables = useMemo(() => {
    return mockReceivables.filter(rec => {
      const matchesVertical = selectedVertical === 'ALL' || rec.vertical === selectedVertical;
      const matchesStatus = statusFilter === 'ALL' || rec.status === statusFilter;
      const matchesFeeComponent = feeComponentFilter === 'ALL' || rec.feeComponent === feeComponentFilter;
      const matchesUserRole = userRoleFilter === 'ALL' || rec.audit.createdByRole === userRoleFilter;
      const matchesDateRange = (!dateRange.from || rec.dueDate >= dateRange.from) && (!dateRange.to || rec.dueDate <= dateRange.to);
      return matchesVertical && matchesStatus && matchesFeeComponent && matchesUserRole && matchesDateRange;
    });
  }, [selectedVertical, statusFilter, feeComponentFilter, userRoleFilter, dateRange]);

  const filteredPaymentLogs = useMemo(() => {
    return mockPaymentLogs.filter(log => {
      const matchesVertical = selectedVertical === 'ALL' || log.vertical === selectedVertical;
      return matchesVertical;
    });
  }, [selectedVertical]);

  const kpis = calculateKPIs();
  const kpiData = [
    { title: 'Total Receivables', value: kpis.totalReceivables, icon: '💰', color: 'blue' },
    { title: 'Collected', value: kpis.collected, icon: '✅', color: 'green' },
    { title: 'Overdue', value: kpis.overdue, icon: '⚠️', color: 'red' },
    { title: 'Upcoming This Month', value: kpis.upcomingThisMonth, icon: '📅', color: 'yellow' }
  ];

  function calculateKPIs() {
    const totalReceivables = mockReceivables.reduce((sum, rec) => sum + rec.amount, 0);
    const collected = mockReceivables
      .filter(rec => rec.status === 'PAID')
      .reduce((sum, rec) => sum + rec.amount, 0);
    const overdue = mockReceivables
      .filter(rec => rec.status === 'OVERDUE')
      .reduce((sum, rec) => sum + rec.amount, 0);

    const upcomingThisMonth = mockReceivables
      .filter(rec => {
        const dueDate = new Date(rec.dueDate);
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        return dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear && rec.status === 'PENDING';
      })
      .reduce((sum, rec) => sum + rec.amount, 0);

    return {
      totalReceivables: `₹${totalReceivables.toLocaleString('en-IN')}`,
      collected: `₹${collected.toLocaleString('en-IN')}`,
      overdue: `₹${overdue.toLocaleString('en-IN')}`,
      upcomingThisMonth: `₹${upcomingThisMonth.toLocaleString('en-IN')}`
    };
  }

  const getStatusVariant = (status: string): BadgeVariant => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'OVERDUE':
        return 'error';
      case 'PARTIAL':
        return 'info';
      default:
        return 'default';
    }
  };

  const getVerticalColor = (vertical: string) => {
    switch (vertical) {
      case 'BOYS': return 'bg-blue-100 text-blue-700';
      case 'GIRLS': return 'bg-pink-100 text-pink-700';
      case 'DHARAMSHALA': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleRowSelect = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = () => {
    const allIds = filteredReceivables.map(r => r.id);
    setSelectedRows(new Set(allIds));
  };

  const handleClearSelection = () => {
    setSelectedRows(new Set());
  };

  const handleBulkReminders = () => {
    console.log('Sending reminders to:', Array.from(selectedRows));
    alert(`Sending reminders to ${selectedRows.size} recipients`);
    setSelectedRows(new Set());
  };

  const handleExportSelected = () => {
    console.log('Exporting selected:', Array.from(selectedRows));
    alert(`Exporting ${selectedRows.size} selected records`);
    setSelectedRows(new Set());
  };

  const receivablesColumns: TableColumn<Receivable>[] = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          checked={selectedRows.size === filteredReceivables.length && filteredReceivables.length > 0}
          onChange={(e) => e.target.checked ? handleSelectAll() : handleClearSelection()}
          className="w-4 h-4"
        />
      ),
      render: (_: any, row: Receivable) => (
        <input
          type="checkbox"
          checked={selectedRows.has(row.id)}
          onChange={() => handleRowSelect(row.id)}
          className="w-4 h-4"
        />
      )
    },
    {
      key: 'studentName',
      header: 'Student Name',
      sortable: true,
      render: (value: string) => <span className="font-medium">{value}</span>
    },
    {
      key: 'studentId',
      header: 'Student ID',
      sortable: true,
      render: (value: string) => <span className="font-mono text-xs">{value}</span>
    },
    {
      key: 'vertical',
      header: 'Vertical',
      sortable: true,
      render: (value: string) => (
        <span className={cn('px-2 py-0.5 rounded text-xs font-medium', getVerticalColor(value))}>
          {value}
        </span>
      )
    },
    {
      key: 'amount',
      header: 'Amount (₹)',
      sortable: true,
      render: (value: number) => (
        <span className="font-medium">₹{value.toLocaleString('en-IN')}</span>
      )
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      sortable: true,
      render: (value: string) => <span>{value}</span>
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value: string) => (
        <Badge variant={getStatusVariant(value as any)} size="sm">{value}</Badge>
      )
    },
    {
      key: 'feeComponent',
      header: 'Fee Component',
      sortable: true,
      render: (value: string) => (
        <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
          {value.replace(/_/g, ' ')}
        </span>
      )
    },
    {
      key: 'contact',
      header: 'Contact Summary',
      sortable: false,
      render: (value: any) => (
        <div className="text-xs">
          <div className="flex items-center gap-1">
            <span>Phone: {value.phone}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Email: {value.email}</span>
          </div>
          {value.parentPhone && (
            <div className="flex items-center gap-1">
              <span>Parent Phone: {value.parentPhone}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'communicationLogs',
      header: 'Communication',
      sortable: false,
      render: (_: any, row: Receivable) => (
        row.communicationLogs && row.communicationLogs > 0 ? (
          <button
            className="text-xs text-blue-600 hover:underline"
            onClick={() => console.log('View communication logs for', row.id)}
          >
            View ({row.communicationLogs})
          </button>
        ) : (
          <span className="text-xs text-gray-400">No logs</span>
        )
      )
    },
    {
      key: 'audit',
      header: 'Audit Info',
      sortable: false,
      render: (value: any) => (
        <div className="text-xs">
          <div>By: {value.createdByRole}</div>
          <div>{value.createdAt.split('T')[0]}</div>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: Receivable) => (
        <div className="flex gap-2">
          <Button variant="primary" size="sm">
            View Details
          </Button>
          <Button variant="secondary" size="sm">
            Send Reminder
          </Button>
        </div>
      )
    }
  ];

  const paymentLogColumns: TableColumn<any>[] = [
    {
      key: 'transactionId',
      header: 'Transaction ID',
      sortable: true,
      render: (value: string) => <span className="font-mono text-xs">{value}</span>
    },
    {
      key: 'studentName',
      header: 'Student Name',
      sortable: true,
      render: (value: string) => <span className="font-medium">{value}</span>
    },
    {
      key: 'studentId',
      header: 'Student ID',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-xs">{value}</span>
      )
    },
    {
      key: 'amount',
      header: 'Amount (₹)',
      sortable: true,
      render: (value: number) => (
        <span className="font-medium">₹{value.toLocaleString('en-IN')}</span>
      )
    },
    {
      key: 'paymentDate',
      header: 'Payment Date',
      sortable: true,
      render: (value: string) => <span>{value}</span>
    },
    {
      key: 'method',
      header: 'Payment Method',
      sortable: true,
      render: (value: string) => (
        <Badge variant="info" size="sm">{value}</Badge>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value: string) => (
        <Badge variant={value === 'SUCCESS' ? 'success' : 'error'} size="sm">
          {value}
        </Badge>
      )
    },
    {
      key: 'feeHead',
      header: 'Fee Head',
      sortable: true,
      render: (value: string) => <span className="text-xs">{value}</span>
    },
    {
      key: 'vertical',
      header: 'Vertical',
      sortable: true,
      render: (value: string) => (
        <span className={cn('px-2 py-0.5 rounded text-xs font-medium', getVerticalColor(value))}>
          {value}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          <Button variant="primary" size="sm">
            View Receipt
          </Button>
          <Button variant="secondary" size="sm">
            Download
          </Button>
        </div>
      )
    }
  ];

  const pageSize = 15;
  const totalPages = Math.ceil(filteredReceivables.length / pageSize);
  const paginatedReceivables = filteredReceivables.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div style={{ background: 'var(--bg-page)' }} className="min-h-screen">
      <header className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Accounts Dashboard
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'var(--bg-accent)', color: 'var(--text-on-accent)' }}>
              {selectedVertical === 'ALL' ? 'All Verticals' : selectedVertical}
            </span>
          </div>
          <Button variant="ghost" size="sm">
            Logout
          </Button>
        </div>
      </header>

          <nav className="mx-auto max-w-7xl border-b" style={{ borderColor: 'var(--border-gray-200)' }}>
            <div className="flex gap-8 px-6">
              <button
                className={cn(
                  'py-4 px-2 border-b-2 font-medium text-sm transition-colors',
                  selectedTab === 'overview'
                    ? 'border-navy-900 text-navy-900'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                )}
                style={{
                  borderColor: selectedTab === 'overview' ? 'var(--border-primary)' : 'transparent',
                  color: selectedTab === 'overview' ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}
                onClick={() => setSelectedTab('overview')}
              >
                Overview
              </button>
              <button
                className={cn(
                  'py-4 px-2 border-b-2 font-medium text-sm transition-colors',
                  selectedTab === 'receivables'
                    ? 'border-navy-900 text-navy-900'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                )}
                style={{
                  borderColor: selectedTab === 'receivables' ? 'var(--border-primary)' : 'transparent',
                  color: selectedTab === 'receivables' ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}
                onClick={() => setSelectedTab('receivables')}
              >
                Receivables
              </button>
              <button
                className={cn(
                  'py-4 px-2 border-b-2 font-medium text-sm transition-colors',
                  selectedTab === 'payment-logs'
                    ? 'border-navy-900 text-navy-900'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                )}
                style={{
                  borderColor: selectedTab === 'payment-logs' ? 'var(--border-primary)' : 'transparent',
                  color: selectedTab === 'payment-logs' ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}
                onClick={() => setSelectedTab('payment-logs')}
              >
                Payment Logs
              </button>
              <button
                className={cn(
                  'py-4 px-2 border-b-2 font-medium text-sm transition-colors',
                  selectedTab === 'receipts'
                    ? 'border-navy-900 text-navy-900'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                )}
                style={{
                  borderColor: selectedTab === 'receipts' ? 'var(--border-primary)' : 'transparent',
                  color: selectedTab === 'receipts' ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}
                onClick={() => setSelectedTab('receipts')}
              >
                Receipts
              </button>
              <button
                className={cn(
                  'py-4 px-2 border-b-2 font-medium text-sm transition-colors',
                  selectedTab === 'clearance'
                    ? 'border-navy-900 text-navy-900'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                )}
                style={{
                  borderColor: selectedTab === 'clearance' ? 'var(--border-primary)' : 'transparent',
                  color: selectedTab === 'clearance' ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}
                onClick={() => setSelectedTab('clearance')}
              >
                Clearance
              </button>
              <button
                className={cn(
                  'py-4 px-2 border-b-2 font-medium text-sm transition-colors',
                  selectedTab === 'data-export'
                    ? 'border-navy-900 text-navy-900'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                )}
                style={{
                  borderColor: selectedTab === 'data-export' ? 'var(--border-primary)' : 'transparent',
                  color: selectedTab === 'data-export' ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}
                onClick={() => setSelectedTab('data-export')}
              >
                Export
              </button>
            </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {selectedTab === 'overview' && (
          <>
            <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--surface-primary)' }}>
              <div className="flex flex-wrap items-center gap-4">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Vertical:
                </label>
                <Select
                  options={verticalOptions}
                  value={selectedVertical}
                  onChange={(e) => setSelectedVertical(e.target.value as Vertical)}
                  size="sm"
                />

                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Period:
                </label>
                <Select
                  options={periodOptions}
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as Period)}
                  size="sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {kpiData.map((kpi, idx) => (
                <Card
                  key={idx}
                  shadow="lg"
                  className="hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{kpi.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">{kpi.title}</p>
                      <p className="text-2xl font-bold" style={{ color: kpi.color === 'blue' ? 'var(--color-blue-600)' : kpi.color === 'green' ? 'var(--color-green-600)' : kpi.color === 'red' ? 'var(--color-red-600)' : 'var(--color-yellow-600)' }}>
                        {kpi.value}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Recent Receivables
                </h2>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedTab('receivables')}
                >
                  View All Receivables
                </Button>
              </div>
              <div className="lg:col-span-2">
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Recent Payment Activity
                </h2>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedTab('payment-logs')}
                >
                  View Payment Logs
                </Button>
              </div>
            </div>
          </>
        )}

        {selectedTab === 'receivables' && (
          <>
            <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--surface-primary)' }}>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Vertical:
                  </label>
                  <Select
                    options={verticalOptions}
                    value={selectedVertical}
                    onChange={(e) => setSelectedVertical(e.target.value as Vertical)}
                    size="sm"
                  />
                </div>

                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Status:
                  </label>
                  <Select
                    options={[
                      { value: 'ALL', label: 'All Statuses' },
                      { value: 'PAID', label: 'Paid' },
                      { value: 'PENDING', label: 'Pending' },
                      { value: 'OVERDUE', label: 'Overdue' },
                      { value: 'PARTIAL', label: 'Partial' }
                    ]}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as Status)}
                    size="sm"
                  />
                </div>

                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Fee Component:
                  </label>
                  <Select
                    options={feeComponentOptions}
                    value={feeComponentFilter}
                    onChange={(e) => setFeeComponentFilter(e.target.value as FeeComponent)}
                    size="sm"
                  />
                </div>

                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Created By Role:
                  </label>
                  <Select
                    options={userRoleOptions}
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value as UserRole)}
                    size="sm"
                  />
                </div>

                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    From:
                  </label>
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    className="px-3 py-1.5 border rounded text-sm"
                    style={{ borderColor: 'var(--border-gray-300)' }}
                  />
                </div>

                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    To:
                  </label>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    className="px-3 py-1.5 border rounded text-sm"
                    style={{ borderColor: 'var(--border-gray-300)' }}
                  />
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedVertical('ALL');
                    setStatusFilter('ALL');
                    setFeeComponentFilter('ALL');
                    setUserRoleFilter('ALL');
                    setDateRange({ from: '', to: '' });
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>

            {selectedRows.size > 0 && (
              <div className="mb-4 p-4 rounded-lg flex items-center justify-between" style={{ background: 'var(--bg-accent-light)', borderColor: 'var(--border-primary)', borderWidth: 1 }}>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {selectedRows.size} row{selectedRows.size !== 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" onClick={handleBulkReminders}>
                    Send Reminder
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleExportSelected}>
                    Export Selected
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Receivables List
              </h2>
              <p className="text-sm text-gray-600">
                Showing {paginatedReceivables.length} of {filteredReceivables.length} records
              </p>
            </div>

            <Table<Receivable>
              data={paginatedReceivables}
              columns={receivablesColumns}
              pagination={{
                currentPage: currentPage,
                pageSize: pageSize,
                totalItems: filteredReceivables.length,
                totalPages: totalPages,
                onPageChange: setCurrentPage
              }}
              density="normal"
              striped={true}
              stickyHeader={true}
              emptyMessage="No receivables found matching current filters"
            />
          </>
        )}

        {selectedTab === 'payment-logs' && (
          <>
            <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--surface-primary)' }}>
              <div className="flex flex-wrap items-center gap-4">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Vertical:
                </label>
                  <Select
                    options={verticalOptions}
                    value={selectedVertical}
                    onChange={(e) => setSelectedVertical(e.target.value as Vertical)}
                    size="sm"
                  />

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    console.log('Export payment logs');
                  }}
                >
                  Export Logs
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Payment Logs
              </h2>
              <p className="text-sm text-gray-600">
                Showing {filteredPaymentLogs.length} transactions
              </p>
            </div>

            <Table<any>
              data={filteredPaymentLogs}
              columns={paymentLogColumns}
              pagination={{
                currentPage: 1,
                pageSize: 20,
                totalItems: filteredPaymentLogs.length,
                totalPages: Math.ceil(filteredPaymentLogs.length / 20),
                onPageChange: (page) => console.log('Page change:', page)
              }}
              density="compact"
              striped={true}
              stickyHeader={true}
              emptyMessage="No payment logs found"
            />
          </>
        )}

        {selectedTab === 'receipts' && (
          <div className="p-12 text-center rounded-lg" style={{ background: 'var(--surface-primary)' }}>
            <p className="text-sm text-gray-600">Receipt management module coming soon...</p>
          </div>
        )}

        {selectedTab === 'data-export' && (
          <>
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Tally Export Layout
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Simplified columnar view optimized for Tally integration. Developers: use CSV/XLS export libraries (papaparse, xlsx) with these exact field mappings.
                </p>

                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                  <strong>DEV NOTE:</strong> Ensure frozen headers in generated files. Use sticky positioning for HTML exports or worksheet freeze for Excel exports.
                </div>
              </div>

              <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--surface-primary)' }}>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 flex-1">
                    <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Vertical:
                    </label>
                    <Select
                      options={verticalOptions}
                      value={selectedVertical}
                      onChange={(e) => setSelectedVertical(e.target.value as Vertical)}
                      size="sm"
                    />
                  </div>

                  <div className="flex items-center gap-2 flex-1">
                    <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Fee Component:
                    </label>
                    <Select
                      options={feeComponentOptions}
                      value={feeComponentFilter}
                      onChange={(e) => setFeeComponentFilter(e.target.value as FeeComponent)}
                      size="sm"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" onClick={() => console.log('Download CSV')}>
                      Download CSV
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => console.log('Download XLS')}>
                      Download XLS
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Export Preview (Tally-Ready Format)
                </h3>
                <p className="text-sm text-gray-600">
                  {filteredReceivables.length} records ready for export
                </p>
              </div>

              <Table<any>
                data={filteredReceivables.map(rec => ({
                  voucherNo: rec.id,
                  voucherDate: rec.dueDate,
                  voucherType: rec.status === 'PAID' ? 'Receipt' : 'Payment',
                  partyLedger: rec.studentName,
                  amount: rec.amount,
                  narration: `${rec.feeComponent.replace(/_/g, ' ')} - ${rec.vertical} Hostel`,
                  costCenter: rec.vertical,
                  feeHead: rec.feeComponent.replace(/_/g, ' '),
                  studentId: rec.studentId,
                  createdBy: rec.audit.createdByRole,
                  createdDate: rec.audit.createdAt.split('T')[0]
                }))}
                columns={[
                  { key: 'voucherNo', header: 'Voucher No', sortable: true },
                  { key: 'voucherDate', header: 'Voucher Date', sortable: true },
                  { key: 'voucherType', header: 'Voucher Type', sortable: true },
                  { key: 'partyLedger', header: 'Party Ledger (Student)', sortable: true },
                  { key: 'amount', header: 'Amount (₹)', sortable: true, render: (v: number) => `₹${v.toLocaleString('en-IN')}` },
                  { key: 'narration', header: 'Narration', sortable: false, render: (v: string) => <span className="text-xs">{v}</span> },
                  { key: 'costCenter', header: 'Cost Center', sortable: true },
                  { key: 'feeHead', header: 'Fee Head', sortable: true },
                  { key: 'studentId', header: 'Student ID', sortable: true, render: (v: string) => <span className="font-mono text-xs">{v}</span> },
                  { key: 'createdBy', header: 'Created By', sortable: true },
                  { key: 'createdDate', header: 'Created Date', sortable: true }
                ]}
                pagination={{
                  currentPage: 1,
                  pageSize: 20,
                  totalItems: filteredReceivables.length,
                  totalPages: Math.ceil(filteredReceivables.length / 20),
                  onPageChange: (page) => console.log('Page change:', page)
                }}
                density="compact"
                striped={true}
                stickyHeader={true}
                emptyMessage="No data matching current filters"
              />

              <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border-gray-200)' }}>
                <h3 className="text-md font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Field Mappings for Tally Import
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">Mandatory Fields</h4>
                    <ul className="text-gray-600 space-y-1 list-disc list-inside">
                      <li><strong>Voucher No:</strong> Unique identifier from system</li>
                      <li><strong>Voucher Date:</strong> Payment due date (YYYY-MM-DD)</li>
                      <li><strong>Voucher Type:</strong> Receipt or Payment</li>
                      <li><strong>Party Ledger:</strong> Student name as ledger</li>
                      <li><strong>Amount:</strong> Numerical value in INR</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">Optional Fields</h4>
                    <ul className="text-gray-600 space-y-1 list-disc list-inside">
                      <li><strong>Narration:</strong> Fee component and vertical</li>
                      <li><strong>Cost Center:</strong> BOYS/GIRLS/DHARAMSHALA</li>
                      <li><strong>Fee Head:</strong> Processing/Hostel/Security/Key Deposit</li>
                      <li><strong>Student ID:</strong> Reference identifier</li>
                      <li><strong>Created By:</strong> User role who created entry</li>
                      <li><strong>Created Date:</strong> Entry creation timestamp</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                  <strong>IMPLEMENTATION NOTES:</strong><br/>
                  • Use <code>papaparse</code> for CSV exports, <code>xlsx</code> for Excel exports<br/>
                  • Apply <code>sheet_freeze</code> for Excel: <code>workbook.Sheets[sheetName]['!freeze'] = &#123; xSplit: 1, ySplit: 0 &#125;</code><br/>
                  • CSV should use comma delimiter, UTF-8 encoding with BOM for Excel compatibility<br/>
                  • Date format must be YYYY-MM-DD for Tally import
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
