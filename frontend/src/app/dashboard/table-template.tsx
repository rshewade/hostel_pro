'use client';

import React, { useState } from 'react';
import { Container, Grid, Col, Stack, useResponsive } from '@/components/layout';
import { Card } from '@/components/data/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import { ChevronLeft, ChevronRight, Download, Filter, Search } from 'lucide-react';

interface StudentData {
  id: string;
  name: string;
  vertical: string;
  room: string;
  status: string;
  dues: string;
}

const ResponsiveTableTemplate: React.FC = () => {
  const { breakpoint, isMobile } = useResponsive();
  const [currentPage, setCurrentPage] = useState(1);

  const students: StudentData[] = [
    { id: 'STU001', name: 'Amit Kumar Jain', vertical: 'Boys Hostel', room: 'A-201', status: 'Active', dues: '₹0' },
    { id: 'STU002', name: 'Priya Sharma', vertical: 'Girls Ashram', room: 'B-105', status: 'Active', dues: '₹5,000' },
    { id: 'STU003', name: 'Rahul Verma', vertical: 'Boys Hostel', room: 'C-301', status: 'On Leave', dues: '₹0' },
    { id: 'STU004', name: 'Neha Gupta', vertical: 'Girls Ashram', room: 'D-102', status: 'Active', dues: '₹2,500' },
    { id: 'STU005', name: 'Vikram Singh', vertical: 'Boys Hostel', room: 'A-105', status: 'Inactive', dues: '₹12,000' },
    { id: 'STU006', name: 'Anjali Patel', vertical: 'Girls Ashram', room: 'B-201', status: 'Active', dues: '₹0' },
    { id: 'STU007', name: 'Karan Mehta', vertical: 'Boys Hostel', room: 'C-105', status: 'Active', dues: '₹3,500' },
    { id: 'STU008', name: 'Sonia Reddy', vertical: 'Girls Ashram', room: 'D-301', status: 'On Leave', dues: '₹0' },
  ];

  const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'info' => {
    switch (status) {
      case 'Active': return 'success';
      case 'On Leave': return 'info';
      case 'Inactive': return 'error';
      default: return 'warning';
    }
  };

  const renderMobileCard = (student: StudentData) => (
    <div key={student.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-navy-900">{student.name}</h3>
          <p className="text-sm text-gray-500">{student.id}</p>
        </div>
        <Badge variant={getStatusVariant(student.status)} size="sm">
          {student.status}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div>
          <p className="text-gray-500">Vertical</p>
          <p className="font-medium">{student.vertical}</p>
        </div>
        <div>
          <p className="text-gray-500">Room</p>
          <p className="font-medium">{student.room}</p>
        </div>
        <div>
          <p className="text-gray-500">Dues</p>
          <p className="font-medium">{student.dues}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="primary" size="xs" className="flex-1">View</Button>
        <Button variant="secondary" size="xs" className="flex-1">Edit</Button>
      </div>
    </div>
  );

  const renderTableRow = (student: StudentData) => (
    <tr key={student.id} className="border-b last:border-0 hover:bg-gray-50">
      <td className="py-3 px-4">
        <div>
          <p className="font-medium text-navy-900">{student.name}</p>
          <p className="text-sm text-gray-500">{student.id}</p>
        </div>
      </td>
      <td className="py-3 px-4 hidden md:table-cell">{student.vertical}</td>
      <td className="py-3 px-4 hidden lg:table-cell">{student.room}</td>
      <td className="py-3 px-4">
        <Badge variant={getStatusVariant(student.status)} size="sm">
          {student.status}
        </Badge>
      </td>
      <td className="py-3 px-4 hidden sm:table-cell">{student.dues}</td>
      <td className="py-3 px-4 text-right">
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="xs">View</Button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <Container>
        <Stack gap={6}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-navy-900">Students</h1>
              <p className="text-gray-500">Manage student records and information</p>
            </div>
            <Button variant="primary">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          <Card padding="md">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Select
                  options={[
                    { value: 'all', label: 'All Verticals' },
                    { value: 'boys', label: 'Boys Hostel' },
                    { value: 'girls', label: 'Girls Ashram' },
                  ]}
                  className="w-36"
                />
                <Select
                  options={[
                    { value: 'all', label: 'All Status' },
                    { value: 'active', label: 'Active' },
                    { value: 'leave', label: 'On Leave' },
                  ]}
                  className="w-36"
                />
              </div>
            </div>

            {isMobile ? (
              <Stack gap={4}>
                {students.map(renderMobileCard)}
              </Stack>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Vertical</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Room</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Dues</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(renderTableRow)}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500">
                Showing 1-8 of 156 students
              </p>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" disabled={currentPage === 1}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="px-3 py-1 bg-gray-100 rounded text-sm">1</span>
                <Button variant="secondary" size="sm">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </Stack>
      </Container>
    </div>
  );
};

export default ResponsiveTableTemplate;
