'use client';

import React, { useState } from 'react';
import { Container, Grid, Col, Stack, useResponsive, Breakpoint } from '@/components/layout';
import { Card } from '@/components/data/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Menu, X, ChevronDown } from 'lucide-react';

interface DashboardTemplateProps {
  title?: string;
  children?: React.ReactNode;
}

const ResponsiveDashboardTemplate: React.FC<DashboardTemplateProps> = ({
  title = 'Dashboard',
  children,
}) => {
  const { breakpoint, isMobile, isTablet, isDesktop } = useResponsive();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebar = (
    <Card padding="md" className="h-full">
      <nav className="space-y-1">
        {['Overview', 'Applications', 'Residents', 'Leave', 'Payments', 'Reports'].map((item) => (
          <button
            key={item}
            className="w-full text-left px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {item}
          </button>
        ))}
      </nav>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <Container>
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              )}
              <h1 className="text-xl font-bold text-navy-900">{title}</h1>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 hidden sm:block">
                {breakpoint.toUpperCase()}
              </span>
              <Badge variant="info" size="sm">
                Admin
              </Badge>
            </div>
          </div>
        </Container>
      </header>

      <div className="flex">
        {(isDesktop || sidebarOpen) && (
          <aside className="w-64 flex-shrink-0 hidden lg:block sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            {sidebar}
          </aside>
        )}

        {sidebarOpen && isMobile && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="relative w-64 bg-white h-full">
              <div className="p-4 border-b">
                <h2 className="font-semibold">Navigation</h2>
              </div>
              {sidebar}
            </div>
          </div>
        )}

        <main className="flex-1 min-w-0">
          <Container className="py-6">
            {children || (
              <Grid gap="lg">
                <Col span={{ xs: 12, md: 8, lg: 9 }}>
                  <Card padding="lg">
                    <h2 className="text-lg font-semibold mb-4">Main Content Area</h2>
                    <p className="text-gray-600 mb-4">
                      Breakpoint: <strong>{breakpoint.toUpperCase()}</strong>
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-gray-100 p-4 rounded-lg text-center">
                          Card {i}
                        </div>
                      ))}
                    </div>
                  </Card>
                </Col>

                <Col span={{ xs: 12, md: 4, lg: 3 }}>
                  <Card padding="lg">
                    <h2 className="text-lg font-semibold mb-4">Sidebar</h2>
                    <Stack gap={3}>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">Pending Actions</p>
                        <p className="text-2xl font-bold text-blue-600">12</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-900">Completed Today</p>
                        <p className="text-2xl font-bold text-green-600">28</p>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-lg">
                        <p className="text-sm font-medium text-amber-900">Pending Reviews</p>
                        <p className="text-2xl font-bold text-amber-600">5</p>
                      </div>
                    </Stack>
                  </Card>
                </Col>

                <Col span={12}>
                  <Card padding="lg">
                    <h2 className="text-lg font-semibold mb-4">Data Table</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-1">ID</th>
                            <th className="text-left py-2 px-1">Name</th>
                            <th className="text-left py-2 px-1 hidden md:table-cell">Status</th>
                            <th className="text-left py-2 px-1 hidden lg:table-cell">Date</th>
                            <th className="text-right py-2 px-1">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <tr key={i} className="border-b last:border-0">
                              <td className="py-3 px-1">#{1000 + i}</td>
                              <td className="py-3 px-1">Student Name {i}</td>
                              <td className="py-3 px-1 hidden md:table-cell">
                                <Badge variant={i % 2 === 0 ? 'success' : 'warning'} size="sm">
                                  {i % 2 === 0 ? 'Active' : 'Pending'}
                                </Badge>
                              </td>
                              <td className="py-3 px-1 hidden lg:table-cell">Jan {10 + i}, 2025</td>
                              <td className="py-3 px-1 text-right">
                                <Button variant="ghost" size="xs">View</Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </Col>
              </Grid>
            )}
          </Container>
        </main>
      </div>
    </div>
  );
};

export default ResponsiveDashboardTemplate;
