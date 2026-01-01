'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Container, useResponsive } from '@/components/layout';
import { Card } from '@/components/data/Card';
import { Button } from '@/components/ui/Button';
import { Menu, X, LayoutDashboard, Wallet, CalendarDays, BedDouble, FileText, LogOut, FileCheck, Settings, ClipboardCheck, ShieldAlert, History, BookOpen } from 'lucide-react';
import { cn } from '@/components/utils';

interface DashboardTemplateProps {
  title?: string;
  children?: React.ReactNode;
}

const ResponsiveDashboardTemplate: React.FC<DashboardTemplateProps> = ({
  children,
}) => {
  const { isMobile, isDesktop } = useResponsive();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // In a real app, we would call the logout API here
    // await fetch('/api/auth/logout', { method: 'POST' });

    // Clear parent session token if on parent dashboard
    if (pathname.startsWith('/dashboard/parent')) {
      localStorage.removeItem('parentSessionToken');
      router.push('/login/parent');
      return;
    }

    router.push('/login');
  };

  const getNavigationItems = (path: string) => {
    if (path.startsWith('/dashboard/student')) {
      return [
        { label: 'Overview', href: '/dashboard/student', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Fees', href: '/dashboard/student/fees', icon: <Wallet className="w-4 h-4" /> },
        { label: 'Leave', href: '/dashboard/student/leave', icon: <CalendarDays className="w-4 h-4" /> },
        { label: 'Room', href: '/dashboard/student/room', icon: <BedDouble className="w-4 h-4" /> },
        { label: 'Documents', href: '/dashboard/student/documents', icon: <FileText className="w-4 h-4" /> },
        { label: 'Renewal', href: '/dashboard/student/renewal', icon: <History className="w-4 h-4" /> },
        { label: 'Exit', href: '/dashboard/student/exit', icon: <LogOut className="w-4 h-4" /> },
        { label: 'Manual', href: '/dashboard/student/manual', icon: <BookOpen className="w-4 h-4" /> },
      ];
    } else if (path.startsWith('/dashboard/superintendent')) {
      return [
        { label: 'Applications', href: '/dashboard/superintendent', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Leaves', href: '/dashboard/superintendent/leaves', icon: <CalendarDays className="w-4 h-4" /> },
        { label: 'Clearance', href: '/dashboard/superintendent/clearance', icon: <FileCheck className="w-4 h-4" /> },
        { label: 'Configuration', href: '/dashboard/superintendent/config', icon: <Settings className="w-4 h-4" /> },
        { label: 'Manual', href: '/dashboard/superintendent/manual', icon: <BookOpen className="w-4 h-4" /> },
      ];
    } else if (path.startsWith('/dashboard/trustee')) {
      return [
        { label: 'Overview', href: '/dashboard/trustee', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Renewals', href: '/dashboard/trustee/renewal', icon: <FileText className="w-4 h-4" /> },
      ];
    } else if (path.startsWith('/dashboard/accounts')) {
      return [
        { label: 'Overview', href: '/dashboard/accounts', icon: <LayoutDashboard className="w-4 h-4" /> },
      ];
    } else if (path.startsWith('/dashboard/parent')) {
      return [
        { label: 'Overview', href: '/dashboard/parent', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Leave', href: '/dashboard/parent/leave', icon: <CalendarDays className="w-4 h-4" /> },
      ];
    } else if (path.startsWith('/dashboard/admin')) {
      return [
        { label: 'Room Allocation', href: '/dashboard/admin/room-allocation', icon: <BedDouble className="w-4 h-4" /> },
        { label: 'Renewal', href: '/dashboard/admin/renewal', icon: <FileText className="w-4 h-4" /> },
        { label: 'Audit Logs', href: '/dashboard/admin/audit/logs', icon: <ShieldAlert className="w-4 h-4" /> },
        { label: 'Clearance', href: '/dashboard/admin/clearance', icon: <ClipboardCheck className="w-4 h-4" /> },
        { label: 'Exit Approval', href: '/dashboard/admin/exit-approval', icon: <LogOut className="w-4 h-4" /> },
      ];
    }
    return [];
  };

  const navItems = getNavigationItems(pathname);

  // Determine role label for header
  const getRoleLabel = (path: string) => {
    if (path.includes('/student')) return 'Student';
    if (path.includes('/superintendent')) return 'Superintendent';
    if (path.includes('/trustee')) return 'Trustee';
    if (path.includes('/accounts')) return 'Accounts';
    if (path.includes('/parent')) return 'Parent';
    if (path.includes('/admin')) return 'Admin';
    return 'Guest';
  };

  const sidebar = (
    <Card padding="md" className="h-full">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-navy-50 text-navy-900 border-l-4 border-navy-900" 
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </Card>
  );

  const isTopNavRole = pathname.includes('/student') || pathname.includes('/superintendent') || pathname.includes('/trustee') || pathname.includes('/parent');

  return (
    <div className="min-h-screen bg-gray-50">
      <header
        className="px-6 py-4 border-b sticky top-0 z-50 shadow-sm"
        style={{
          backgroundColor: "var(--surface-primary)",
          borderColor: "var(--border-primary)",
        }}
      >
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-2"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            )}
            
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Hirachand Gumanji Family Charitable Trust"
                width={48}
                height={48}
                className="h-12 w-auto"
              />
              <div>
                <h1
                  className="text-lg font-semibold"
                  style={{ color: "var(--text-primary)", fontFamily: "var(--font-serif)" }}
                >
                  Hirachand Gumanji Family
                </h1>
                <p className="text-caption">Charitable Trust</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Desktop Navigation */}
            {isTopNavRole && isDesktop && (
              <nav className="hidden md:flex items-center gap-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-navy-900",
                      pathname === item.href ? "text-navy-900 font-bold" : "text-gray-600"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            )}

            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600 hover:text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar: Show on Desktop for Non-TopNav Roles, or if explicitly opened */}
        {((!isTopNavRole && isDesktop) || sidebarOpen) && navItems.length > 0 && (
          <aside className={`flex-shrink-0 ${isTopNavRole ? 'lg:hidden' : 'hidden lg:block w-64'} sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-4 pl-0`}>
             <div className="pl-4 h-full">
               {sidebar}
             </div>
          </aside>
        )}

        {sidebarOpen && isMobile && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="relative w-64 bg-white h-full shadow-xl">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="font-semibold text-navy-900">Navigation</h2>
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="p-4">
                {sidebar}
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 min-w-0">
          <Container className="py-6" size="full">
            {children}
          </Container>
        </main>
      </div>
    </div>
  );
};

export default ResponsiveDashboardTemplate;
