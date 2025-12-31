'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge, Button } from '@/components/ui';
import { Card } from '@/components/data/Card';
import { 
  GraduationCap, 
  Shield, 
  Users, 
  Briefcase, 
  Building2, 
  UserCheck,
  ArrowRight,
  ChevronRight,
  Play,
  Eye,
  Info,
  X
} from 'lucide-react';

type Persona = 'applicant' | 'student' | 'superintendent' | 'trustee' | 'accounts' | 'parent';

interface PersonaConfig {
  id: Persona;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  startingPage: string;
  features: string[];
}

interface Hotspot {
  id: string;
  x: number;
  y: number;
  label: string;
  description: string;
  page: string;
}

interface TourStep {
  id: string;
  title: string;
  description: string;
  page: string;
  action: string;
}

const tours: Record<Persona, TourStep[]> = {
  applicant: [
    { id: 't1', title: 'Start Application', description: 'Select your accommodation type - Boys Hostel, Girls Ashram, or Dharamshala', page: '/apply', action: 'Click "Apply Now"' },
    { id: 't2', title: 'OTP Verification', description: 'Verify your identity using mobile or email OTP', page: '/apply/boys-hostel/contact', action: 'Enter contact details' },
    { id: 't3', title: 'Complete Form', description: 'Fill out personal, education, and family details', page: '/apply/boys-hostel/form', action: 'Fill application' },
    { id: 't4', title: 'Track Status', description: 'Monitor your application progress online', page: '/track', action: 'Use tracking number' }
  ],
  student: [
    { id: 't1', title: 'Login', description: 'Access your dashboard with credentials', page: '/login', action: 'Enter credentials' },
    { id: 't2', title: 'View Dashboard', description: 'See renewal alerts, fee status, and announcements', page: '/dashboard/student', action: 'Review dashboard' },
    { id: 't3', title: 'Pay Fees', description: 'Make payments and download receipts', page: '/dashboard/student/fees', action: 'Click "Pay Fees"' },
    { id: 't4', title: 'Apply Leave', description: 'Request leave with parent notification', page: '/dashboard/student/leave', action: 'Submit request' }
  ],
  superintendent: [
    { id: 't1', title: 'Dashboard', description: 'Overview of pending applications and tasks', page: '/dashboard/superintendent', action: 'Review stats' },
    { id: 't2', title: 'Application Review', description: 'Review applications and supporting documents', page: '/dashboard/superintendent', action: 'Click application' },
    { id: 't3', title: 'Take Action', description: 'Approve, reject, or forward to trustee', page: '/dashboard/superintendent', action: 'Select action' },
    { id: 't4', title: 'Leave Management', description: 'Approve/reject student leave requests', page: '/dashboard/superintendent', action: 'Review requests' }
  ],
  trustee: [
    { id: 't1', title: 'Forwarded Apps', description: 'View applications forwarded by superintendents', page: '/dashboard/trustee', action: 'Review queue' },
    { id: 't2', title: 'Schedule Interview', description: 'Set date/time for applicant interview', page: '/dashboard/trustee', action: 'Schedule' },
    { id: 't3', title: 'Final Decision', description: 'Approve or reject final admission', page: '/dashboard/trustee', action: 'Make decision' }
  ],
  accounts: [
    { id: 't1', title: 'Receivables', description: 'View outstanding fees by student', page: '/dashboard/accounts', action: 'Review list' },
    { id: 't2', title: 'Payment Logs', description: 'Track all payment transactions', page: '/dashboard/accounts', action: 'View logs' },
    { id: 't3', title: 'Export', description: 'Export data for accounting software', page: '/dashboard/accounts', action: 'Click Export' }
  ],
  parent: [
    { id: 't1', title: 'OTP Login', description: 'Secure login via ward mobile number', page: '/login/parent', action: 'Verify OTP' },
    { id: 't2', title: 'Dashboard', description: 'View ward information and status', page: '/dashboard/parent', action: 'View details' },
    { id: 't3', title: 'Leave History', description: 'Track all leave requests and approvals', page: '/dashboard/parent', action: 'View history' }
  ]
};

const personas: PersonaConfig[] = [
  {
    id: 'applicant',
    name: 'Applicant',
    description: 'Guest user applying for admission',
    icon: <GraduationCap className="w-8 h-8" />,
    color: 'var(--color-blue-600)',
    bgColor: 'var(--color-blue-50)',
    startingPage: '/',
    features: [
      'Browse verticals (Boys/Girls/Dharamshala)',
      'OTP-verified application wizard',
      'Track application status',
      'Download admission letters'
    ]
  },
  {
    id: 'student',
    name: 'Student',
    description: 'Resident student dashboard',
    icon: <UserCheck className="w-8 h-8" />,
    color: 'var(--color-green-600)',
    bgColor: 'var(--color-green-50)',
    startingPage: '/login',
    features: [
      'Dashboard with renewal alerts',
      'Pay fees with payment flow',
      'Apply for leave',
      'View room and roommates',
      '6-month renewal process',
      'Exit request workflow'
    ]
  },
  {
    id: 'superintendent',
    name: 'Superintendent',
    description: 'Hostel administrator',
    icon: <Shield className="w-8 h-8" />,
    color: 'var(--color-purple-600)',
    bgColor: 'var(--color-purple-50)',
    startingPage: '/dashboard/superintendent',
    features: [
      'Review applications',
      'Approve/Reject/Forward',
      'Manage leave requests',
      'Configure leave types',
      'Send communications',
      'Parent notification rules'
    ]
  },
  {
    id: 'trustee',
    name: 'Trustee',
    description: 'Final approval authority',
    icon: <Building2 className="w-8 h-8" />,
    color: 'var(--color-amber-600)',
    bgColor: 'var(--color-amber-50)',
    startingPage: '/dashboard/trustee',
    features: [
      'Review forwarded applications',
      'Schedule interviews',
      'Issue provisional decisions',
      'Final approve/reject',
      'Communication history',
      'Audit trail'
    ]
  },
  {
    id: 'accounts',
    name: 'Accounts',
    description: 'Finance team',
    icon: <Briefcase className="w-8 h-8" />,
    color: 'var(--color-red-600)',
    bgColor: 'var(--color-red-50)',
    startingPage: '/dashboard/accounts',
    features: [
      'View receivables',
      'Payment logs',
      'Export to Tally/CSV',
      'Bulk reminder actions',
      'Receipt management',
      'Clearance tracking'
    ]
  },
  {
    id: 'parent',
    name: 'Parent',
    description: 'Parent/Guardian view',
    icon: <Users className="w-8 h-8" />,
    color: 'var(--color-indigo-600)',
    bgColor: 'var(--color-indigo-50)',
    startingPage: '/login/parent',
    features: [
      'OTP-based login',
      'View ward information',
      'Fee status overview',
      'Leave history',
      'Notifications',
      'Read-only access'
    ]
  }
];

const statusFlows = [
  { name: 'Application Status Flow', path: '/track/APP-2024-001', status: 'UNDER_REVIEW' },
  { name: 'Approved Application', path: '/track/APP-2024-004', status: 'APPROVED' },
  { name: 'Rejected Application', path: '/track/APP-2024-005', status: 'REJECTED' }
];

const hotspots: Hotspot[] = [
  {
    id: 'hs1',
    x: 10,
    y: 15,
    label: 'Dashboard Stats',
    description: 'Key metrics at a glance - applications, pending actions, alerts',
    page: '/dashboard/superintendent'
  },
  {
    id: 'hs2',
    x: 50,
    y: 25,
    label: 'Application Queue',
    description: 'Review and take action on incoming applications',
    page: '/dashboard/superintendent'
  },
  {
    id: 'hs3',
    x: 75,
    y: 35,
    label: 'Quick Actions',
    description: 'Approve, reject, or forward applications in one click',
    page: '/dashboard/superintendent'
  },
  {
    id: 'hs4',
    x: 20,
    y: 20,
    label: 'Student Overview',
    description: 'View all residents and their current status',
    page: '/dashboard/student'
  },
  {
    id: 'hs5',
    x: 60,
    y: 40,
    label: 'Fee Payment',
    description: 'Integrated payment gateway with receipt generation',
    page: '/dashboard/student/fees'
  },
  {
    id: 'hs6',
    x: 40,
    y: 50,
    label: 'Leave Management',
    description: 'Apply for leave and track approval status',
    page: '/dashboard/student/leave'
  }
];

export default function WorkingApplicationPage() {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [showFlowDiagram, setShowFlowDiagram] = useState(false);
  const [showHotspots, setShowHotspots] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [showTour, setShowTour] = useState(false);
  const [currentTourStep, setCurrentTourStep] = useState(0);

  const startTour = (persona: Persona) => {
    setSelectedPersona(persona);
    setShowTour(true);
    setCurrentTourStep(0);
  };

  const nextTourStep = () => {
    if (selectedPersona && currentTourStep < tours[selectedPersona].length - 1) {
      setCurrentTourStep(currentTourStep + 1);
    }
  };

  const prevTourStep = () => {
    if (currentTourStep > 0) {
      setCurrentTourStep(currentTourStep - 1);
    }
  };

  const closeTour = () => {
    setShowTour(false);
    setCurrentTourStep(0);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      {/* Header */}
      <header
        className="px-6 py-4 border-b"
        style={{
          backgroundColor: 'var(--surface-primary)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="Hirachand Gumanji Family Charitable Trust"
                width={48}
                height={48}
                className="h-12 w-auto"
              />
            </Link>
            <div>
              <h1
                className="text-lg font-semibold"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}
              >
                Working Application Demo
              </h1>
              <p className="text-caption">Task 25 - End-to-End User Journeys</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm hover:underline" style={{ color: 'var(--text-link)' }}>
              ← Back to Home
            </Link>
          </nav>
        </div>
      </header>

      <main className="px-6 py-12">
        <div className="mx-auto max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
              Working Application Demo
            </h1>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Explore complete end-to-end user journeys for all personas in the Jain Hostel Management System. 
              Select a persona below to begin testing their workflow.
            </p>
          </div>

          {/* Persona Selection */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--text-primary)' }}>
              Select a Persona to Begin
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {personas.map((persona) => (
                <Card
                  key={persona.id}
                  padding="lg"
                  shadow="md"
                  className={`cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] ${
                    selectedPersona === persona.id ? 'ring-2 ring-offset-2' : ''
                  }`}
                  style={{
                    backgroundColor: selectedPersona === persona.id ? persona.bgColor : 'var(--surface-primary)',
                    borderColor: selectedPersona === persona.id ? persona.color : 'var(--border-primary)',
                    '--tw-ring-color': persona.color
                  } as React.CSSProperties}
                  onClick={() => setSelectedPersona(persona.id)}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: persona.bgColor, color: persona.color }}
                    >
                      {persona.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                        {persona.name}
                      </h3>
                      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                        {persona.description}
                      </p>
                      <ul className="space-y-1">
                        {persona.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                            <ChevronRight className="w-3 h-3 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                        {persona.features.length > 3 && (
                          <li className="text-xs font-medium" style={{ color: 'var(--text-link)' }}>
                            +{persona.features.length - 3} more features
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-primary)' }}>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Starting: {persona.startingPage}
                    </span>
                    <Button variant="ghost" size="sm">
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Selected Persona Detail */}
          {selectedPersona && (
            <div className="mb-12 p-8 rounded-xl" style={{ backgroundColor: 'var(--surface-primary)', borderColor: 'var(--border-primary)', borderWidth: 1 }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ 
                      backgroundColor: personas.find(p => p.id === selectedPersona)?.bgColor, 
                      color: personas.find(p => p.id === selectedPersona)?.color 
                    }}
                  >
                    {personas.find(p => p.id === selectedPersona)?.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                      {personas.find(p => p.id === selectedPersona)?.name} Journey
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {personas.find(p => p.id === selectedPersona)?.description}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="primary"
                  onClick={() => window.open(personas.find(p => p.id === selectedPersona)?.startingPage, '_blank')}
                >
                  Start Journey <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {/* Feature List */}
              <div className="grid gap-4 md:grid-cols-2 mb-6">
                {personas.find(p => p.id === selectedPersona)?.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-page)' }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-green-100">
                      <ChevronRight className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Access - Application Status */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--text-primary)' }}>
              Quick Access - Tracking Demo
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {statusFlows.map((flow, idx) => (
                <Link
                  key={idx}
                  href={flow.path}
                  className="block"
                >
                  <Card padding="md" shadow="sm" className="hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            flow.status === 'APPROVED' ? 'success' :
                            flow.status === 'REJECTED' ? 'error' : 'warning'
                          }
                          size="sm"
                        >
                          {flow.status}
                        </Badge>
                        <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                          {flow.name}
                        </span>
                      </div>
                      <Eye className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation Flow Diagram */}
          <div className="mb-12">
            <div 
              className="p-6 rounded-xl cursor-pointer"
              style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border-primary)', borderWidth: 1 }}
              onClick={() => setShowFlowDiagram(!showFlowDiagram)}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  View Navigation Flow Diagram
                </h2>
                <ChevronRight 
                  className={`w-5 h-5 transition-transform ${showFlowDiagram ? 'rotate-90' : ''}`} 
                  style={{ color: 'var(--text-secondary)' }} 
                />
              </div>
            </div>

            {showFlowDiagram && (
              <div className="mt-6 p-6 rounded-xl" style={{ backgroundColor: 'var(--surface-primary)', borderColor: 'var(--border-primary)', borderWidth: 1 }}>
                <div className="space-y-6">
                  {/* Applicant Flow */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-blue-600)' }}>
                      <GraduationCap className="w-5 h-5" />
                      Applicant Flow
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700">Landing</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700">Apply</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700">Contact + OTP</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700">Form Wizard</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700">Tracking</span>
                    </div>
                  </div>

                  {/* Student Flow */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-green-600)' }}>
                      <UserCheck className="w-5 h-5" />
                      Student Flow
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700">Login</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700">Dashboard</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700">Fees / Leave / Room</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700">Renewal</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700">Exit</span>
                    </div>
                  </div>

                  {/* Admin Flow */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-purple-600)' }}>
                      <Shield className="w-5 h-5" />
                      Superintendent Flow
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700">Login</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700">Applications</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700">Review</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700">Forward to Trustee</span>
                    </div>
                  </div>

                  {/* Trustee Flow */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-amber-600)' }}>
                      <Building2 className="w-5 h-5" />
                      Trustee Flow
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700">Login</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700">Forwarded Apps</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700">Interview</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700">Final Decision</span>
                    </div>
                  </div>

                  {/* Accounts Flow */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-red-600)' }}>
                      <Briefcase className="w-5 h-5" />
                      Accounts Flow
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="px-3 py-1 rounded-full bg-red-100 text-red-700">Login</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <span className="px-3 py-1 rounded-full bg-red-100 text-red-700">Receivables</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <span className="px-3 py-1 rounded-full bg-red-100 text-red-700">Payment Logs</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <span className="px-3 py-1 rounded-full bg-red-100 text-red-700">Export</span>
                    </div>
                  </div>

                  {/* Parent Flow */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-indigo-600)' }}>
                      <Users className="w-5 h-5" />
                      Parent Flow
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700">Parent Login</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700">OTP Verify</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700">Dashboard</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700">View Only</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Component States Demo */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--text-primary)' }}>
              Interactive Component States
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card padding="md" shadow="sm">
                <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Button States</h4>
                <div className="space-y-2">
                  <Button variant="primary" size="sm" fullWidth>Primary</Button>
                  <Button variant="secondary" size="sm" fullWidth>Secondary</Button>
                  <Button variant="ghost" size="sm" fullWidth>Ghost</Button>
                  <Button variant="primary" size="sm" fullWidth loading>Loading</Button>
                  <Button variant="primary" size="sm" fullWidth disabled>Disabled</Button>
                </div>
              </Card>

              <Card padding="md" shadow="sm">
                <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Status Badges</h4>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="info" size="sm">Info</Badge>
                    <Badge variant="success" size="sm">Success</Badge>
                    <Badge variant="warning" size="sm">Warning</Badge>
                    <Badge variant="error" size="sm">Error</Badge>
                    <Badge variant="default" size="sm">Default</Badge>
                  </div>
                </div>
              </Card>

              <Card padding="md" shadow="sm">
                <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Form States</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Default input"
                    className="w-full px-3 py-2 border rounded text-sm"
                    style={{ borderColor: 'var(--border-primary)' }}
                  />
                  <input
                    type="text"
                    placeholder="Focused input"
                    className="w-full px-3 py-2 border rounded text-sm"
                    style={{ borderColor: 'var(--color-blue-500)', outline: 'none' }}
                  />
                  <input
                    type="text"
                    placeholder="Error input"
                    className="w-full px-3 py-2 border rounded text-sm"
                    style={{ borderColor: 'var(--color-red-500)', backgroundColor: 'var(--color-red-50)' }}
                  />
                </div>
              </Card>

              <Card padding="md" shadow="sm">
                <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Progress States</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: 'var(--text-secondary)' }}>Progress</span>
                      <span style={{ color: 'var(--text-primary)' }}>75%</span>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'var(--bg-page)' }}>
                      <div className="h-2 rounded-full bg-blue-500" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: 'var(--text-secondary)' }}>Success</span>
                      <span style={{ color: 'var(--color-green-600)' }}>100%</span>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'var(--bg-page)' }}>
                      <div className="h-2 rounded-full bg-green-500" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* DPDP Compliance Notice */}
          <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--color-blue-50)', borderColor: 'var(--color-blue-200)', borderWidth: 1 }}>
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--color-blue-900)' }}>
                  DPDP Act Compliance
                </h3>
                <p className="text-sm mb-3" style={{ color: 'var(--color-blue-700)' }}>
                  This working application demonstrates data protection principles in compliance with the Digital Personal Data Protection Act, 2023.
                  All flows include appropriate consent banners, data minimization notices, and audit trail logging.
                </p>
                <Link 
                  href="/dpdp-policy" 
                  className="text-sm font-medium hover:underline"
                  style={{ color: 'var(--color-blue-600)' }}
                >
                  View Full DPDP Policy →
                </Link>
              </div>
            </div>
          </div>

          {/* Guided Tour Section */}
          <div className="mt-12">
            <div 
              className="p-6 rounded-xl cursor-pointer"
              style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border-primary)', borderWidth: 1 }}
              onClick={() => setShowTour(!showTour)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Play className="w-5 h-5" style={{ color: 'var(--color-green-600)' }} />
                  <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    Guided Tour for Stakeholders
                  </h2>
                </div>
                <ChevronRight 
                  className={`w-5 h-5 transition-transform ${showTour ? 'rotate-90' : ''}`} 
                  style={{ color: 'var(--text-secondary)' }} 
                />
              </div>
              <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                Step-by-step walkthrough of key user journeys. Perfect for demos and training.
              </p>
            </div>

            {showTour && (
              <div className="mt-6 p-6 rounded-xl" style={{ backgroundColor: 'var(--surface-primary)', borderColor: 'var(--border-primary)', borderWidth: 1 }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Select a Persona to Start Tour
                </h3>
                
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 mb-6">
                  {personas.map((persona) => (
                    <button
                      key={persona.id}
                      onClick={() => startTour(persona.id)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        selectedPersona === persona.id 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: persona.bgColor, color: persona.color }}
                        >
                          {persona.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {persona.name}
                          </h4>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {tours[persona.id as Persona]?.length || 0} steps
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {selectedPersona && tours[selectedPersona] && (
                  <div className="border-t pt-6" style={{ borderColor: 'var(--border-primary)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {personas.find(p => p.id === selectedPersona)?.name} Journey - Step {currentTourStep + 1} of {tours[selectedPersona].length}
                      </h4>
                      <button 
                        onClick={closeTour}
                        className="p-1 rounded hover:bg-gray-100"
                      >
                        <X className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                      </button>
                    </div>

                    <div className="mb-4">
                      <div className="flex gap-1 mb-2">
                        {tours[selectedPersona].map((_, idx) => (
                          <div 
                            key={idx}
                            className="h-2 flex-1 rounded-full transition-all"
                            style={{ 
                              backgroundColor: idx <= currentTourStep ? 'var(--color-green-500)' : 'var(--color-gray-200)' 
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {(() => {
                      const step = tours[selectedPersona][currentTourStep];
                      return (
                        <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: 'var(--color-green-50)' }}>
                          <div className="flex items-start gap-3">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: 'var(--color-green-500)', color: 'white' }}
                            >
                              {currentTourStep + 1}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold mb-1" style={{ color: 'var(--color-green-900)' }}>
                                {step.title}
                              </h5>
                              <p className="text-sm mb-2" style={{ color: 'var(--color-green-700)' }}>
                                {step.description}
                              </p>
                              <div className="flex items-center gap-2">
                                <Link 
                                  href={step.page}
                                  className="text-sm font-medium underline"
                                  style={{ color: 'var(--color-green-600)' }}
                                >
                                  Go to: {step.page}
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="flex justify-between">
                      <button
                        onClick={prevTourStep}
                        disabled={currentTourStep === 0}
                        className="btn-outline"
                        style={{ opacity: currentTourStep === 0 ? 0.5 : 1 }}
                      >
                        ← Previous
                      </button>
                      <button
                        onClick={nextTourStep}
                        disabled={selectedPersona && currentTourStep >= tours[selectedPersona].length - 1}
                        className="btn-primary"
                        style={{ opacity: selectedPersona && currentTourStep >= tours[selectedPersona].length - 1 ? 0.5 : 1 }}
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 mt-12 border-t" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="mx-auto max-w-6xl text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          <p className="mb-2">Working Application Demo - Task 25 | Jain Hostel Management System</p>
          <p>Use this demo to test all user journeys end-to-end before stakeholder review sessions.</p>
        </div>
      </footer>
    </div>
  );
}
