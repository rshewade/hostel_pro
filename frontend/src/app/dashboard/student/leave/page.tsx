'use client';

import { useState } from 'react';
import { Input } from '@/components/forms/Input';
import { DatePicker } from '@/components/forms/DatePicker';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

type LeaveType = 'short' | 'night-out' | 'multi-day';
type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

interface LeaveRequest {
  id: string;
  type: LeaveType;
  fromDate: string;
  toDate: string;
  fromTime?: string;
  toTime?: string;
  reason: string;
  destination?: string;
  contactNumber?: string;
  status: LeaveStatus;
  appliedDate: string;
  remarks?: string;
}

interface LeaveRule {
  type: string;
  description: string;
}

const leaveRules: LeaveRule[] = [
  {
    type: 'Short Leave',
    description: 'Maximum 2 days per month. Minimum 24 hours notice required.'
  },
  {
    type: 'Night-Out',
    description: 'Must return by 10:00 PM. Prior approval from Superintendent required.'
  },
  {
    type: 'Multi-Day Leave',
    description: 'Maximum 7 days per semester. Minimum 3 days notice required. Requires parent/guardian consent.'
  }
];

const mockLeaveHistory: LeaveRequest[] = [
  {
    id: '1',
    type: 'short',
    fromDate: '2024-12-15',
    toDate: '2024-12-15',
    fromTime: '09:00',
    toTime: '18:00',
    reason: 'Personal work at home',
    status: 'APPROVED',
    appliedDate: '2024-12-10',
    remarks: 'Approved for emergency family matter'
  },
  {
    id: '2',
    type: 'multi-day',
    fromDate: '2024-12-20',
    toDate: '2024-12-25',
    fromTime: '08:00',
    toTime: '18:00',
    reason: 'Attend sister\'s wedding',
    destination: 'Mumbai',
    contactNumber: '+91 98765 43210',
    status: 'PENDING',
    appliedDate: '2024-12-18'
  },
  {
    id: '3',
    type: 'night-out',
    fromDate: '2024-12-28',
    toDate: '2024-12-28',
    fromTime: '18:00',
    toTime: '22:00',
    reason: 'Family dinner',
    status: 'REJECTED',
    appliedDate: '2024-12-26',
    remarks: 'Insufficient notice given. Night-outs require 24 hours prior approval.'
  },
  {
    id: '4',
    type: 'short',
    fromDate: '2024-12-30',
    toDate: '2024-12-30',
    fromTime: '14:00',
    toTime: '18:00',
    reason: 'Medical appointment',
    status: 'PENDING',
    appliedDate: '2024-12-28'
  }
];

export default function LeaveManagementPage() {
  const [selectedType, setSelectedType] = useState<LeaveType | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'request' | 'history'>('request');
  
  const [formData, setFormData] = useState({
    fromDate: '',
    toDate: '',
    fromTime: '',
    toTime: '',
    reason: '',
    destination: '',
    contactNumber: ''
  });
  
  const [formErrors, setFormErrors] = useState({
    fromDate: '',
    toDate: '',
    reason: '',
    contactNumber: ''
  });

  const getStatusBadge = (status: LeaveStatus) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning">Pending</Badge>;
      case 'APPROVED':
        return <Badge variant="success">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="error">Rejected</Badge>;
      case 'CANCELLED':
        return <Badge variant="default">Cancelled</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const handleTypeSelect = (type: LeaveType) => {
    setSelectedType(type);
    setShowForm(true);
    setFormData({
      fromDate: '',
      toDate: '',
      fromTime: '',
      toTime: '',
      reason: '',
      destination: '',
      contactNumber: ''
    });
    setFormErrors({
      fromDate: '',
      toDate: '',
      reason: '',
      contactNumber: ''
    });
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFormErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const errors = { ...formErrors };
    
    if (!formData.fromDate) {
      errors.fromDate = 'From date is required';
    }
    
    if (!formData.toDate) {
      errors.toDate = 'To date is required';
    }
    
    if (formData.fromDate && formData.toDate && new Date(formData.fromDate) > new Date(formData.toDate)) {
      errors.toDate = 'To date must be after from date';
    }
    
    if (!formData.reason.trim()) {
      errors.reason = 'Reason is required';
    }
    
    if (formData.reason.trim().length < 10) {
      errors.reason = 'Reason must be at least 10 characters';
    }
    
    if (selectedType === 'multi-day' && !formData.destination?.trim()) {
      errors.toDate = 'Destination is required for multi-day leave';
    }
    
    if (selectedType === 'night-out' && !formData.toTime) {
      errors.toDate = 'Return time is required for night-out';
    }
    
    setFormErrors(errors);
    return Object.values(errors).every(error => error === '');
  };

  const handleSubmit = () => {
    if (validateForm()) {
      alert('Leave request submitted successfully!');
      setShowForm(false);
      setSelectedType(null);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedType(null);
    setFormData({
      fromDate: '',
      toDate: '',
      fromTime: '',
      toTime: '',
      reason: '',
      destination: '',
      contactNumber: ''
    });
    setFormErrors({
      fromDate: '',
      toDate: '',
      reason: '',
      contactNumber: ''
    });
  };

  const getLeaveTypeInfo = (type: LeaveType) => {
    switch (type) {
      case 'short':
        return {
          icon: '📋',
          title: 'Short Leave',
          description: 'For absences up to 2 days within city limits',
          duration: 'Max 2 days/month'
        };
      case 'night-out':
        return {
          icon: '🌙',
          title: 'Night Out',
          description: 'Evening outing returning same night',
          duration: 'Return by 10:00 PM'
        };
      case 'multi-day':
        return {
          icon: '📅',
          title: 'Multi-Day Leave',
          description: 'Extended leave requiring prior approval',
          duration: 'Max 7 days/semester'
        };
    }
  };

  const pageContent = (
    <div style={{ background: 'var(--bg-page)' }} className="min-h-screen">
      <div className="px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <h1 style={{ color: 'var(--text-primary)' }} className="text-3xl font-bold mb-2">
              Leave Management
            </h1>
            <p style={{ color: 'var(--text-secondary)' }} className="text-body">
              Request leave, view history, and check approval status
            </p>
          </div>

          {!showForm && !selectedType && (
            <div className="space-y-6">
              <h2 style={{ color: 'var(--text-primary)' }} className="text-2xl font-semibold mb-6">
                Select Leave Type
              </h2>
              <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-3 mb-8">
                {(['short', 'night-out', 'multi-day'] as LeaveType[]).map((type) => {
                  const info = getLeaveTypeInfo(type);
                  return (
                    <button
                      key={type}
                      onClick={() => handleTypeSelect(type)}
                      className="card p-6 text-left transition-all hover:shadow-lg"
                      style={{
                        background: 'var(--surface-primary)',
                        borderColor: 'var(--border-primary)',
                        borderRadius: 'var(--radius-lg)'
                      }}
                    >
                      <div className="text-4xl mb-3">{info.icon}</div>
                      <h3 style={{ color: 'var(--text-primary)' }} className="text-lg font-semibold mb-2">
                        {info.title}
                      </h3>
                      <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                        {info.description}
                      </p>
                      <p style={{ color: 'var(--color-blue-600)' }} className="text-xs font-medium mt-2">
                        {info.duration}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="mb-8 p-6 rounded-lg" style={{ background: 'var(--surface-primary)', borderLeft: '4px solid var(--color-gold-500)' }}>
                <div className="flex items-start gap-2">
                  <span className="text-xl">📜</span>
                  <div>
                    <h3 style={{ color: 'var(--text-primary)' }} className="text-lg font-semibold mb-2">
                      Leave Rules & Policies
                    </h3>
                  </div>
                </div>
                <div className="space-y-3">
                  {leaveRules.map((rule, index) => (
                    <div key={index} className="flex items-start gap-3 pb-3 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-accent)' }}>
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <p style={{ color: 'var(--text-primary)' }} className="font-medium mb-1">
                          {rule.type}
                        </p>
                        <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                          {rule.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {showForm && selectedType && (
            <div className="mb-6">
              <button
                onClick={handleCancel}
                className="text-sm mb-6"
                style={{ color: 'var(--text-link)', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                ← Back to Leave Types
              </button>

              <h2 style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold mb-2">
                {getLeaveTypeInfo(selectedType).title} Application
              </h2>
              <p style={{ color: 'var(--text-secondary)' }} className="text-body mb-6">
                Fill in the required details to request {getLeaveTypeInfo(selectedType).title.toLowerCase()}
              </p>

              <div className="card p-6 rounded-lg" style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-primary)' }}>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                  <div>
                    <DatePicker
                      label="From Date"
                      value={formData.fromDate}
                      onChange={(e) => handleInputChange('fromDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      error={formErrors.fromDate}
                      helperText="Select the start date of your leave"
                      required
                    />
                  </div>
                  <div>
                    <DatePicker
                      label="To Date"
                      value={formData.toDate}
                      onChange={(e) => handleInputChange('toDate', e.target.value)}
                      min={formData.fromDate}
                      error={formErrors.toDate}
                      helperText="Select the end date of your leave"
                      required
                    />
                  </div>
                </div>

                {(selectedType === 'short' || selectedType === 'night-out') && (
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <Input
                        type="text"
                        label="From Time"
                        placeholder="HH:MM"
                        value={formData.fromTime}
                        onChange={(e) => handleInputChange('fromTime', e.target.value)}
                        helperText="Start time for your leave"
                        error={formErrors.fromDate}
                      />
                    </div>
                    <div>
                      <Input
                        type="text"
                        label="To Time"
                        placeholder="HH:MM"
                        value={formData.toTime}
                        onChange={(e) => handleInputChange('toTime', e.target.value)}
                        helperText="End time for your leave"
                        error={formErrors.toDate}
                      />
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <Input
                    type="text"
                    label="Reason for Leave"
                    placeholder="Please provide a detailed reason for your leave request"
                    value={formData.reason}
                    onChange={(e) => handleInputChange('reason', e.target.value)}
                    error={formErrors.reason}
                    helperText="Minimum 10 characters required. Include all relevant details."
                    required
                  />
                </div>

                {selectedType === 'multi-day' && (
                  <div className="mb-6">
                    <Input
                      type="text"
                      label="Destination"
                      placeholder="Where will you be going during your leave?"
                      value={formData.destination}
                      onChange={(e) => handleInputChange('destination', e.target.value)}
                      error={formErrors.toDate}
                      helperText="Destination city or place is required for multi-day leave"
                      required
                    />
                  </div>
                )}

                <div className="mb-6">
                  <Input
                    type="tel"
                    label="Emergency Contact Number (Optional)"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.contactNumber}
                    onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                    helperText="Contact number for emergency during leave period"
                  />
                </div>

                <div className="flex gap-4 pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                  <Button
                    variant="secondary"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                  >
                    Submit Leave Request
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!showForm && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 style={{ color: 'var(--text-primary)' }} className="text-2xl font-semibold">
                  Leave History
                </h2>
              </div>
              
              <div className="card" style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-primary)' }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b" style={{ borderColor: 'var(--border-primary)' }}>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Type
                        </th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Dates
                        </th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Reason
                        </th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Status
                        </th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Remarks
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockLeaveHistory.map((leave) => (
                        <tr key={leave.id} className="border-b hover:bg-gray-50" style={{ borderColor: 'var(--border-primary)' }}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">
                                {leave.type === 'short' && '📋'}
                                {leave.type === 'night-out' && '🌙'}
                                {leave.type === 'multi-day' && '📅'}
                              </span>
                              <span className="capitalize" style={{ color: 'var(--text-primary)' }}>
                                {leave.type.replace('-', ' ')}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                            {leave.fromDate} → {leave.toDate}
                          </td>
                          <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                            {leave.reason}
                            {leave.destination && (
                              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                to {leave.destination}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {getStatusBadge(leave.status)}
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {leave.remarks || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {pageContent}
    </>
  );
}
