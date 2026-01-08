'use client';

import { useState, useCallback, useEffect } from 'react';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/feedback/Modal';
import { Table } from '@/components/data/Table';
import { SendMessagePanel, type SendMessageData, DEFAULT_TEMPLATES } from '@/components/communication/SendMessagePanel';
import { MessageLog, type MessageLogEntry } from '@/components/communication/MessageLog';
import type { TableColumn, TableRowDensity } from '@/components/types';
import { cn } from '@/components/utils';
import { Input } from '@/components/forms/Input';
import { Select, type SelectOption } from '@/components/forms/Select';

// Types
type ApplicationStatus = 'DRAFT' | 'SUBMITTED' | 'REVIEW' | 'FORWARDED' | 'PROVISIONALLY_APPROVED' | 'INTERVIEW_SCHEDULED' | 'INTERVIEW_COMPLETED' | 'APPROVED' | 'REJECTED';
type Vertical = 'BOYS' | 'GIRLS' | 'DHARAMSHALA';
type InterviewMode = 'ONLINE' | 'PHYSICAL';
type InterviewStatus = 'NOT_SCHEDULED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED' | 'CANCELLED';
type DecisionType = 'PROVISIONAL_APPROVE_INTERVIEW' | 'PROVISIONAL_APPROVE_NO_INTERVIEW' | 'PROVISIONAL_REJECT' | 'FINAL_APPROVE' | 'FINAL_REJECT';

interface Application {
  id: string;
  trackingNumber: string;
  applicantName: string;
  vertical: Vertical;
  status: ApplicationStatus;
  applicationDate: string;
  paymentStatus: string;
  interviewScheduled: boolean;
  flags?: string[];
  forwardedBy?: {
    superintendentId: string;
    superintendentName: string;
    forwardedOn: string;
    recommendation: 'RECOMMEND' | 'NOT_RECOMMEND' | 'NEUTRAL';
    remarks: string;
  };
  interview?: {
    id: string;
    scheduledDate: string;
    scheduledTime: string;
    mode: InterviewMode;
    meetingLink?: string;
    location?: string;
    status: InterviewStatus;
    score?: number;
  };
  provisionalDecision?: {
    issuedOn: string;
    issuedBy: string;
    decisionType: 'APPROVE' | 'REJECT';
    remarks: string;
  };
}

interface InterviewEvaluation {
  id: string;
  applicationId: string;
  applicantName: string;
  interviewDate: string;
  interviewTime: string;
  mode: InterviewMode;
  conductedBy: string;
  criteria: {
    academicBackground: {
      score: number;
      comments: string;
    };
    communicationSkills: {
      score: number;
      comments: string;
    };
    discipline: {
      score: number;
      comments: string;
    };
    motivation: {
      score: number;
      comments: string;
    };
  };
  overallScore: number;
  overallObservations: string;
  recommendation: 'APPROVE' | 'REJECT' | 'DEFERRED';
}

export default function TrusteeDashboard() {
  const [selectedTab, setSelectedTab] = useState<'applications' | 'interviews' | 'approvals' | 'communication' | 'audit'>('applications');
  const [selectedSubTab, setSelectedSubTab] = useState<'forwarded' | 'interview-queue' | 'interview-scheduled' | 'pending-final'>('forwarded');
  const [selectedVertical, setSelectedVertical] = useState<Vertical | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedDetailTab, setSelectedDetailTab] = useState<'summary' | 'interview' | 'decision' | 'audit'>('summary');

  // Communication state
  const [showMessagePanel, setShowMessagePanel] = useState(false);
  const [selectedMessageRecipient, setSelectedMessageRecipient] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [messageEntries, setMessageEntries] = useState<MessageLogEntry[]>([
    {
      id: 'msg-1',
      recipient: { id: '1', name: 'Rahul Sharma', role: 'applicant' },
      channels: ['email'],
      template: 'provisional_approval',
      message: 'Your application APP-2024-001 has been provisionally approved. Interview required.',
      status: 'SENT',
      sentAt: '2024-12-23T10:00:00Z',
      sentBy: { id: 'trust-001', name: 'Jane Doe', role: 'Trustee' },
      auditLogId: 'AUD-005'
    }
  ]);

  // Decision modal state
  const [decisionModal, setDecisionModal] = useState<{
    isOpen: boolean;
    type: DecisionType;
    application: Application | null;
    remarks: string;
    rejectionReason?: string;
  }>({
    isOpen: false,
    type: 'PROVISIONAL_APPROVE_INTERVIEW',
    application: null,
    remarks: '',
    rejectionReason: undefined
  });
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Interview evaluation state
  const [evaluationForm, setEvaluationForm] = useState<InterviewEvaluation>({
    id: '',
    applicationId: '',
    applicantName: '',
    interviewDate: '',
    interviewTime: '',
    mode: 'ONLINE',
    conductedBy: 'Trustee',
    criteria: {
      academicBackground: {
        score: 0,
        comments: ''
      },
      communicationSkills: {
        score: 0,
        comments: ''
      },
      discipline: {
        score: 0,
        comments: ''
      },
      motivation: {
        score: 0,
        comments: ''
      }
    },
    overallScore: 0,
    overallObservations: '',
    recommendation: 'APPROVE'
  });

  // Interview scheduling state
  const [interviewSchedule, setInterviewSchedule] = useState({
    mode: 'ONLINE',
    date: '',
    time: '',
    sendInvitation: true,
    sendReminder: true
  });
  const [isSchedulingInterview, setIsSchedulingInterview] = useState(false);

  // Interview evaluation modal state
  const [evaluationModal, setEvaluationModal] = useState<{
    isOpen: boolean;
    application: Application | null;
  }>({
    isOpen: false,
    application: null
  });
  const [isSavingEvaluation, setIsSavingEvaluation] = useState(false);

  // Select options
  const verticalOptions: SelectOption[] = [
    { value: 'ALL', label: 'All Verticals' },
    { value: 'BOYS', label: 'Boys Hostel' },
    { value: 'GIRLS', label: 'Girls Ashram' },
    { value: 'DHARAMSHALA', label: 'Dharamshala' }
  ];

  // API data state
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch applications from API
  const fetchApplications = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/applications');
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      const data = await response.json();
      
      const transformedApplications: Application[] = Array.isArray(data) ? data.map((app: any) => {
        let applicantName = 'Unknown';
        if (app.firstName) {
          applicantName = `${app.firstName} ${app.lastName || ''}`.trim();
        } else if (app.data?.personal_info?.full_name) {
          applicantName = app.data.personal_info.full_name;
        }

        let status: ApplicationStatus = 'SUBMITTED';
        if (app.status === 'REVIEW' || app.current_status === 'REVIEW') {
          status = 'FORWARDED';
        } else if (app.status === 'PROVISIONALLY_APPROVED' || app.current_status === 'PROVISIONALLY_APPROVED') {
          status = 'PROVISIONALLY_APPROVED';
        } else if (app.status === 'APPROVED' || app.current_status === 'APPROVED') {
          status = 'PROVISIONALLY_APPROVED';
        } else if (app.status === 'INTERVIEW_SCHEDULED' || app.current_status === 'INTERVIEW_SCHEDULED') {
          status = 'INTERVIEW_SCHEDULED';
        } else if (app.status === 'INTERVIEW_COMPLETED' || app.current_status === 'INTERVIEW_COMPLETED') {
          status = 'INTERVIEW_COMPLETED';
        }

        return {
          id: app.id,
          trackingNumber: app.trackingNumber || app.tracking_number || app.id,
          applicantName,
          vertical: (app.vertical || 'BOYS').toUpperCase().replace('-HOSTEL', '').replace('_', ''),
          status,
          applicationDate: app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-GB') : 
                          app.submittedAt ? new Date(app.submittedAt).toLocaleDateString('en-GB') : 
                          new Date().toLocaleDateString('en-GB'),
          paymentStatus: 'PAID',
          interviewScheduled: status === 'INTERVIEW_SCHEDULED' || status === 'INTERVIEW_COMPLETED',
          interview: status === 'INTERVIEW_SCHEDULED' || status === 'INTERVIEW_COMPLETED' ? {
            id: 'int-1',
            scheduledDate: new Date().toLocaleDateString('en-GB'),
            scheduledTime: '10:00 AM',
            mode: 'ONLINE',
            status: status === 'INTERVIEW_SCHEDULED' ? 'SCHEDULED' : 'COMPLETED'
          } : undefined,
          flags: [],
          forwardedBy: app.remarks ? {
            superintendentId: 'u2',
            superintendentName: 'Superintendent',
            forwardedOn: new Date().toLocaleDateString('en-GB'),
            recommendation: 'RECOMMEND',
            remarks: app.remarks
          } : undefined
        };
      }) : [];
      
      setApplications(transformedApplications);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Filter applications based on sub-tab
  const filteredApplications = applications.filter(app => {
    if (selectedSubTab === 'forwarded') {
      return app.status === 'FORWARDED' || app.status === 'REVIEW';
    } else if (selectedSubTab === 'interview-queue') {
      return app.status === 'PROVISIONALLY_APPROVED' && !app.interviewScheduled;
    } else if (selectedSubTab === 'interview-scheduled') {
      return app.status === 'INTERVIEW_SCHEDULED';
    } else if (selectedSubTab === 'pending-final') {
      return app.status === 'INTERVIEW_COMPLETED';
    }
    return true;
  });

  // Status badge variants
  const getStatusVariant = (status: ApplicationStatus): BadgeVariant => {
    switch (status) {
      case 'FORWARDED':
        return 'info';
      case 'PROVISIONALLY_APPROVED':
        return 'warning';
      case 'INTERVIEW_SCHEDULED':
        return 'warning';
      case 'INTERVIEW_COMPLETED':
        return 'warning';
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleSendMessage = async (data: SendMessageData) => {
    setIsSending(true);
    try {
      const newEntry: MessageLogEntry = {
        id: `msg-${Date.now()}`,
        recipient: applications.find(app => app.id === data.recipientId) ? {
          id: data.recipientId,
          name: applications.find(app => app.id === data.recipientId)!.applicantName,
          role: 'applicant' as const
        } : { id: data.recipientId, name: 'Unknown', role: 'applicant' as const },
        channels: data.channels,
        template: DEFAULT_TEMPLATES.find(t => t.id === data.templateId)?.name,
        message: data.message,
        status: data.schedule ? 'SCHEDULED' : 'SENT',
        sentAt: data.schedule ? undefined : new Date().toISOString(),
        scheduledFor: data.schedule?.date ? `${data.schedule.date}T${data.schedule.time || '00:00'}:00Z` : undefined,
        escalatedTo: data.escalate ? { id: 'trustee-board', name: 'Trustee Board', role: 'Trustee' } : undefined,
        escalatedAt: data.escalate ? new Date().toISOString() : undefined,
        sentBy: { id: 'trust-001', name: 'Jane Doe', role: 'Trustee' },
        auditLogId: `AUD-${Date.now()}`
      };
      setMessageEntries([newEntry, ...messageEntries]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleScheduleInterview = async () => {
    if (!interviewSchedule.date || !interviewSchedule.time || !selectedApplication) {
      alert('Please select both date and time for the interview');
      return;
    }

    setIsSchedulingInterview(true);
    try {
      const response = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: selectedApplication.id,
          trustee_id: 'u3', // Current logged in trustee
          schedule_time: `${interviewSchedule.date}T${interviewSchedule.time}:00Z`,
          mode: interviewSchedule.mode,
          send_invitation: interviewSchedule.sendInvitation,
          send_reminder: interviewSchedule.sendReminder
        })
      });

      if (response.ok) {
        // Update application status to INTERVIEW_SCHEDULED
        await fetch(`/api/applications/${selectedApplication.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'INTERVIEW_SCHEDULED',
            current_status: 'INTERVIEW_SCHEDULED'
          })
        });
        
        await fetchApplications();
        setSelectedDetailTab('summary');
        alert('Interview scheduled successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to schedule interview');
      }
    } catch (err) {
      console.error('Error scheduling interview:', err);
      alert('Failed to schedule interview');
      } finally {
        setIsSchedulingInterview(false);
      }
    };

  const handleJoinInterview = () => {
    if (selectedApplication?.interview?.meetingLink) {
      window.open(selectedApplication.interview.meetingLink, '_blank');
    } else {
      alert('No meeting link available for this interview');
    }
  };

  const handleCompleteInterview = () => {
    setEvaluationModal({
      isOpen: true,
      application: selectedApplication
    });
  };

  const handleSaveEvaluation = async () => {
    if (!evaluationModal.application) return;

    setIsSavingEvaluation(true);
    try {
      const evaluationData = {
        academicScore: evaluationForm.criteria.academicBackground.score,
        academicComments: evaluationForm.criteria.academicBackground.comments,
        communicationScore: evaluationForm.criteria.communicationSkills.score,
        communicationComments: evaluationForm.criteria.communicationSkills.comments,
        disciplineScore: evaluationForm.criteria.discipline.score,
        disciplineComments: evaluationForm.criteria.discipline.comments,
        motivationScore: evaluationForm.criteria.motivation.score,
        motivationComments: evaluationForm.criteria.motivation.comments,
        overallScore: evaluationForm.overallScore,
        overallObservations: evaluationForm.overallObservations,
        recommendation: evaluationForm.recommendation
      };

      await fetch(`/api/applications/${evaluationModal.application.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'INTERVIEW_COMPLETED',
          current_status: 'INTERVIEW_COMPLETED',
          interview_evaluation: evaluationData
        })
      });

      await fetchApplications();
      setEvaluationModal({ isOpen: false, application: null });
      setSelectedDetailTab('summary');
      // Reset evaluation form
      setEvaluationForm({
        id: '',
        applicationId: '',
        applicantName: '',
        interviewDate: '',
        interviewTime: '',
        mode: 'ONLINE',
        conductedBy: 'Trustee',
        criteria: {
          academicBackground: { score: 0, comments: '' },
          communicationSkills: { score: 0, comments: '' },
          discipline: { score: 0, comments: '' },
          motivation: { score: 0, comments: '' }
        },
        overallScore: 0,
        overallObservations: '',
        recommendation: 'APPROVE'
      });
      alert('Interview evaluation saved successfully!');
    } catch (err) {
      console.error('Error saving evaluation:', err);
      alert('Failed to save evaluation');
    } finally {
      setIsSavingEvaluation(false);
    }
  };

  // Table columns for applications
  const applicationColumns: TableColumn<Application>[] = [
    {
      key: 'applicantName',
      header: 'Applicant Name',
      sortable: true,
      render: (value: string) => (
        <span className="font-medium">{value}</span>
      )
    },
    {
      key: 'trackingNumber',
      header: 'Tracking #',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-xs">{value}</span>
      )
    },
    {
      key: 'vertical',
      header: 'Vertical',
      sortable: true,
      render: (value: Vertical) => (
        <span className={cn(
          'px-2 py-0.5 rounded text-xs font-medium',
          value === 'BOYS' && 'bg-blue-100 text-blue-700',
          value === 'GIRLS' && 'bg-pink-100 text-pink-700',
          value === 'DHARAMSHALA' && 'bg-yellow-100 text-yellow-700'
        )}>
          {value}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value: ApplicationStatus) => (
        <Badge variant={getStatusVariant(value)} size="sm">
          {value.replace(/_/g, ' ')}
        </Badge>
      )
    },
    {
      key: 'interviewScheduled',
      header: 'Interview',
      render: (value: boolean, row: Application) => (
        <div className="flex items-center gap-2">
          <Badge
            variant={value ? 'success' : 'default'}
            size="sm"
            rounded={true}
          >
            {value && row.interview
              ? `${row.interview.mode === 'ONLINE' ? 'Online' : 'Physical'}`
              : 'Not Scheduled'}
          </Badge>
          {row.interview?.score && (
            <span className="text-xs text-gray-600">Score: {row.interview.score}/20</span>
          )}
        </div>
      )
    },
    {
      key: 'flags',
      header: 'Flags',
      render: (value: string[]) => (
        <div className="flex gap-1">
          {value && value.length > 0 && value.map((flag, index) => (
            <Chip
              key={index}
              variant="warning"
              size="sm"
            >
              {flag}
            </Chip>
          ))}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: Application) => (
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setSelectedApplication(row)}
          >
            Review
          </Button>
          {row.status === 'FORWARDED' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setDecisionModal({
                  isOpen: true,
                  type: 'PROVISIONAL_APPROVE_INTERVIEW',
                  application: row,
                  remarks: ''
                });
              }}
            >
              Provisional
            </Button>
          )}
          {(row.status === 'PROVISIONALLY_APPROVED' || row.status === 'INTERVIEW_COMPLETED') && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setDecisionModal({
                  isOpen: true,
                  type: 'FINAL_APPROVE',
                  application: row,
                  remarks: ''
                });
              }}
            >
              Final Decision
            </Button>
          )}
        </div>
      )
    }
  ];

  // Table columns for interviews
  const interviewColumns: TableColumn<Application>[] = [
    {
      key: 'applicantName',
      header: 'Applicant Name',
      sortable: true,
      render: (value: string) => (
        <span className="font-medium">{value}</span>
      )
    },
    {
      key: 'interview',
      header: 'Schedule',
      sortable: true,
      render: (_: any, row: Application) => (
        <div>
          <div className="text-sm">{row.interview?.scheduledDate}</div>
          <div className="text-xs text-gray-600">{row.interview?.scheduledTime}</div>
        </div>
      )
    },
    {
      key: 'mode',
      header: 'Mode',
      render: (_: any, row: Application) => (
        <Badge
          variant={row.interview?.mode === 'ONLINE' ? 'info' : 'success'}
          size="sm"
        >
          {row.interview?.mode === 'ONLINE' ? 'Online' : 'Physical'}
        </Badge>
      )
    },
    {
      key: 'vertical',
      header: 'Vertical',
      sortable: true,
      render: (value: Vertical) => (
        <span className={cn(
          'px-2 py-0.5 rounded text-xs font-medium',
          value === 'BOYS' && 'bg-blue-100 text-blue-700',
          value === 'GIRLS' && 'bg-pink-100 text-pink-700',
          value === 'DHARAMSHALA' && 'bg-yellow-100 text-yellow-700'
        )}>
          {value}
        </span>
      )
    },
    {
      key: 'interviewStatus',
      header: 'Status',
      render: (_: any, row: Application) => {
        const statusMap: Record<InterviewStatus, { variant: BadgeVariant; label: string }> = {
          'NOT_SCHEDULED': { variant: 'default', label: 'Not Scheduled' },
          'SCHEDULED': { variant: 'warning', label: 'Scheduled' },
          'IN_PROGRESS': { variant: 'info', label: 'In Progress' },
          'COMPLETED': { variant: 'success', label: 'Completed' },
          'MISSED': { variant: 'error', label: 'Missed' },
          'CANCELLED': { variant: 'error', label: 'Cancelled' }
        };
        const status = statusMap[row.interview?.status || 'NOT_SCHEDULED'];
        return <Badge variant={status.variant} size="sm">{status.label}</Badge>;
      }
    },
    {
      key: 'interviewActions',
      header: 'Actions',
      render: (_: any, row: Application) => (
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setSelectedApplication(row)}
          >
            {row.interview?.status === 'SCHEDULED' ? 'Join' : row.interview?.status === 'COMPLETED' ? 'Evaluate' : 'Schedule'}
          </Button>
        </div>
      )
    }
  ];

  return (
    <div style={{ background: 'var(--bg-page)' }} className="min-h-screen">
      {/* Header */}
      <header className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Trustee Dashboard
            </h1>
            <Select
              options={verticalOptions}
              value={selectedVertical}
              onChange={(e) => setSelectedVertical(e.target.value as Vertical | 'ALL')}
              className="w-48"
            />
          </div>
          <Button variant="ghost" size="sm">
            Logout
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <nav className="mx-auto max-w-7xl border-b" style={{ borderColor: 'var(--border-gray-200)' }}>
        <div className="flex gap-8 px-6">
          <button
            className={cn(
              'py-4 px-2 border-b-2 font-medium text-sm transition-colors',
              selectedTab === 'applications'
                ? 'border-navy-900 text-navy-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            )}
            style={{
              borderColor: selectedTab === 'applications' ? 'var(--border-primary)' : 'transparent',
              color: selectedTab === 'applications' ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
            onClick={() => setSelectedTab('applications')}
          >
            Applications
          </button>
          <button
            className={cn(
              'py-4 px-2 border-b-2 font-medium text-sm transition-colors',
              selectedTab === 'interviews'
                ? 'border-navy-900 text-navy-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            )}
            style={{
              borderColor: selectedTab === 'interviews' ? 'var(--border-primary)' : 'transparent',
              color: selectedTab === 'interviews' ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
            onClick={() => setSelectedTab('interviews')}
          >
            Interviews
          </button>
          <button
            className={cn(
              'py-4 px-2 border-b-2 font-medium text-sm transition-colors',
              selectedTab === 'approvals'
                ? 'border-navy-900 text-navy-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            )}
            style={{
              borderColor: selectedTab === 'approvals' ? 'var(--border-primary)' : 'transparent',
              color: selectedTab === 'approvals' ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
            onClick={() => setSelectedTab('approvals')}
          >
            Approvals
          </button>
          <button
            className={cn(
              'py-4 px-2 border-b-2 font-medium text-sm transition-colors',
              selectedTab === 'communication'
                ? 'border-navy-900 text-navy-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            )}
            style={{
              borderColor: selectedTab === 'communication' ? 'var(--border-primary)' : 'transparent',
              color: selectedTab === 'communication' ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
            onClick={() => setSelectedTab('communication')}
          >
            Communication
          </button>
          <button
            className={cn(
              'py-4 px-2 border-b-2 font-medium text-sm transition-colors',
              selectedTab === 'audit'
                ? 'border-navy-900 text-navy-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            )}
            style={{
              borderColor: selectedTab === 'audit' ? 'var(--border-primary)' : 'transparent',
              color: selectedTab === 'audit' ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
            onClick={() => setSelectedTab('audit')}
          >
            Audit & Reports
          </button>
        </div>
      </nav>

      {/* Sub-tabs for Applications */}
      {selectedTab === 'applications' && (
        <nav className="mx-auto max-w-7xl border-b" style={{ borderColor: 'var(--border-gray-200)' }}>
          <div className="flex gap-4 px-6">
            <button
              className={cn(
                'py-3 px-2 text-sm font-medium transition-colors',
                selectedSubTab === 'forwarded'
                  ? 'text-navy-900 border-b-2 border-navy-900'
                  : 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent'
              )}
              onClick={() => setSelectedSubTab('forwarded')}
            >
              Forwarded for Review
            </button>
            <button
              className={cn(
                'py-3 px-2 text-sm font-medium transition-colors',
                selectedSubTab === 'interview-queue'
                  ? 'text-navy-900 border-b-2 border-navy-900'
                  : 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent'
              )}
              onClick={() => setSelectedSubTab('interview-queue')}
            >
              Interview Queue
            </button>
            <button
              className={cn(
                'py-3 px-2 text-sm font-medium transition-colors',
                selectedSubTab === 'interview-scheduled'
                  ? 'text-navy-900 border-b-2 border-navy-900'
                  : 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent'
              )}
              onClick={() => setSelectedSubTab('interview-scheduled')}
            >
              Interview Scheduled
            </button>
            <button
              className={cn(
                'py-3 px-2 text-sm font-medium transition-colors',
                selectedSubTab === 'pending-final'
                  ? 'text-navy-900 border-b-2 border-navy-900'
                  : 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent'
              )}
              onClick={() => setSelectedSubTab('pending-final')}
            >
              Pending Final Decision
            </button>
          </div>
        </nav>
      )}

      {/* Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {selectedTab === 'applications' && (
          <>
            {/* Filters */}
            <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--surface-primary)' }}>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Search:
                  </label>
                  <input
                    type="text"
                    placeholder="Search by name or tracking #"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded border border-gray-300 px-3 py-2 text-sm flex-1 max-w-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                    style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }}
                  />
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedVertical('ALL');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>

            {/* Applications Table */}
            <Table<Application>
              data={filteredApplications}
              columns={applicationColumns}
              onRowClick={(row) => setSelectedApplication(row)}
              pagination={{
                currentPage: 1,
                pageSize: 10,
                totalItems: filteredApplications.length,
                totalPages: Math.ceil(filteredApplications.length / 10),
                onPageChange: (page) => console.log('Page change:', page)
              }}
              density="normal"
              striped={true}
            />
          </>
        )}

        {selectedTab === 'interviews' && (
          <>
            {/* Filters */}
            <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--surface-primary)' }}>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Search:
                  </label>
                  <input
                    type="text"
                    placeholder="Search by name or tracking #"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded border border-gray-300 px-3 py-2 text-sm flex-1 max-w-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                    style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }}
                  />
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedVertical('ALL');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>

            {/* Interviews Table */}
            <Table<Application>
              data={filteredApplications}
              columns={interviewColumns}
              onRowClick={(row) => setSelectedApplication(row)}
              pagination={{
                currentPage: 1,
                pageSize: 10,
                totalItems: filteredApplications.length,
                totalPages: Math.ceil(filteredApplications.length / 10),
                onPageChange: (page) => console.log('Page change:', page)
              }}
              density="normal"
              striped={true}
            />
          </>
        )}

        {selectedTab === 'approvals' && (
          <div className="p-12 text-center rounded-lg" style={{ background: 'var(--surface-primary)' }}>
            <p className="text-gray-600">Approvals history coming soon...</p>
          </div>
        )}

        {selectedTab === 'communication' && (
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setShowMessagePanel(true)}
                className="p-6 rounded-lg border-2 border-dashed hover:border-navy-900 transition-colors text-left"
                style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-gray-200)' }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">💬</span>
                  <h3 className="font-semibold text-navy-900">Send Message</h3>
                </div>
                <p className="text-sm text-gray-600">Send SMS, WhatsApp, or Email to applicants</p>
              </button>
              <button
                onClick={() => {}}
                className="p-6 rounded-lg border-2 border-dashed hover:border-navy-900 transition-colors text-left"
                style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-gray-200)' }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">📊</span>
                  <h3 className="font-semibold text-navy-900">View Statistics</h3>
                </div>
                <p className="text-sm text-gray-600">View communication analytics and reports</p>
              </button>
              <button
                onClick={() => {}}
                className="p-6 rounded-lg border-2 border-dashed hover:border-navy-900 transition-colors text-left"
                style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-gray-200)' }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">📋</span>
                  <h3 className="font-semibold text-navy-900">Manage Templates</h3>
                </div>
                <p className="text-sm text-gray-600">Create and edit message templates</p>
              </button>
            </div>

            {/* Message History */}
            <div className="p-6 rounded-lg" style={{ background: 'var(--surface-primary)' }}>
              <MessageLog
                entries={messageEntries}
                loading={false}
                onRetry={(entryId) => {
                  console.log('Retry message:', entryId);
                }}
                onViewDetails={(entryId) => {
                  console.log('View details:', entryId);
                }}
                maxEntries={10}
              />
            </div>
          </div>
        )}

        {selectedTab === 'audit' && (
          <div className="p-12 text-center rounded-lg" style={{ background: 'var(--surface-primary)' }}>
            <p className="text-gray-600">Audit & Reports coming soon...</p>
          </div>
        )}
      </main>

      {/* Application Detail Modal */}
      <Modal
        isOpen={selectedApplication !== null}
        onClose={() => {
          setSelectedApplication(null);
          setSelectedDetailTab('summary');
        }}
        title={selectedApplication?.trackingNumber + ' - ' + selectedApplication?.applicantName}
        size="xl"
      >
        {selectedApplication && (
          <div className="space-y-6">
            {/* Detail Tabs */}
            <div className="flex gap-4 border-b pb-4" style={{ borderColor: 'var(--border-gray-200)' }}>
              <button
                className={cn(
                  'py-2 px-4 text-sm font-medium rounded transition-colors',
                  selectedDetailTab === 'summary'
                    ? 'bg-navy-900 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
                onClick={() => setSelectedDetailTab('summary')}
              >
                Summary
              </button>
              <button
                className={cn(
                  'py-2 px-4 text-sm font-medium rounded transition-colors',
                  selectedDetailTab === 'interview'
                    ? 'bg-navy-900 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
                onClick={() => setSelectedDetailTab('interview')}
              >
                Interview
              </button>
              <button
                className={cn(
                  'py-2 px-4 text-sm font-medium rounded transition-colors',
                  selectedDetailTab === 'decision'
                    ? 'bg-navy-900 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
                onClick={() => setSelectedDetailTab('decision')}
              >
                Decision
              </button>
              <button
                className={cn(
                  'py-2 px-4 text-sm font-medium rounded transition-colors',
                  selectedDetailTab === 'audit'
                    ? 'bg-navy-900 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
                onClick={() => setSelectedDetailTab('audit')}
              >
                Audit
              </button>
            </div>

            {/* Summary Tab Content */}
            {selectedDetailTab === 'summary' && (
              <div className="space-y-6">
                {/* Applicant Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    Applicant Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Name</label>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {selectedApplication.applicantName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Tracking Number</label>
                      <p className="font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
                        {selectedApplication.trackingNumber}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Vertical</label>
                      <Badge
                        variant={selectedApplication.vertical === 'BOYS' ? 'success' : selectedApplication.vertical === 'GIRLS' ? 'warning' : 'info'}
                        size="md"
                      >
                        {selectedApplication.vertical}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Application Date</label>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {selectedApplication.applicationDate}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status & Payment */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Application Status</label>
                    <Badge
                      variant={getStatusVariant(selectedApplication.status)}
                      size="md"
                      className="mt-2"
                    >
                      {selectedApplication.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Payment Status</label>
                    <Badge
                      variant={selectedApplication.paymentStatus === 'PAID' ? 'success' : selectedApplication.paymentStatus === 'PENDING' ? 'warning' : 'error'}
                      size="md"
                      className="mt-2"
                    >
                      {selectedApplication.paymentStatus}
                    </Badge>
                  </div>
                </div>

                {/* Superintendent Review */}
                {selectedApplication.forwardedBy && (
                  <div className="p-4 rounded border" style={{ background: 'var(--bg-page)', borderColor: 'var(--border-gray-200)' }}>
                    <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                      Superintendent Review
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Forwarded By:</span>
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {selectedApplication.forwardedBy.superintendentName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Forwarded On:</span>
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {selectedApplication.forwardedBy.forwardedOn}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Recommendation:</span>
                        <Badge
                          variant={selectedApplication.forwardedBy.recommendation === 'RECOMMEND' ? 'success' : selectedApplication.forwardedBy.recommendation === 'NOT_RECOMMEND' ? 'error' : 'info'}
                          size="sm"
                        >
                          {selectedApplication.forwardedBy.recommendation}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-gray-600">Remarks:</span>
                        <p className="mt-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                          {selectedApplication.forwardedBy.remarks}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Flags */}
                {selectedApplication.flags && selectedApplication.flags.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Flags
                    </h4>
                    <div className="flex gap-2">
                      {selectedApplication.flags.map((flag, index) => (
                        <Chip
                          key={index}
                          variant="warning"
                          size="sm"
                        >
                          {flag}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}

                {/* Documents Preview */}
                <div>
                  <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    Uploaded Documents
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {['Student Declaration', 'Parent Consent', 'Aadhar Card', 'Marksheets'].map((doc, index) => (
                      <div
                        key={index}
                        className="p-4 rounded border cursor-pointer hover:shadow-md transition-shadow"
                        style={{ borderColor: 'var(--border-gray-200)', background: 'var(--bg-page)' }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">📄</div>
                          <div>
                            <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                              {doc}
                            </p>
                            <p className="text-xs text-gray-600">PDF • 245 KB</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trustee Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-gray-200)' }}>
                  <div className="flex gap-3">
                    {selectedApplication.status === 'FORWARDED' && (
                      <>
                        <Button
                          variant="primary"
                          onClick={() => {
                            setDecisionModal({
                              isOpen: true,
                              type: 'PROVISIONAL_APPROVE_INTERVIEW',
                              application: selectedApplication,
                              remarks: ''
                            });
                          }}
                        >
                          Issue Provisional Approval
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            setDecisionModal({
                              isOpen: true,
                              type: 'PROVISIONAL_REJECT',
                              application: selectedApplication,
                              remarks: ''
                            });
                          }}
                        >
                          Reject Provisionally
                        </Button>
                      </>
                    )}
                    {(selectedApplication.status === 'PROVISIONALLY_APPROVED' || selectedApplication.status === 'INTERVIEW_COMPLETED') && (
                      <>
                        <Button
                          variant="primary"
                          onClick={() => {
                            setDecisionModal({
                              isOpen: true,
                              type: 'FINAL_APPROVE',
                              application: selectedApplication,
                              remarks: ''
                            });
                          }}
                        >
                          Final Approve
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            setDecisionModal({
                              isOpen: true,
                              type: 'FINAL_REJECT',
                              application: selectedApplication,
                              remarks: ''
                            });
                          }}
                        >
                          Final Reject
                        </Button>
                      </>
                    )}
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSelectedMessageRecipient(selectedApplication.id);
                      setShowMessagePanel(true);
                    }}
                  >
                    Send Message
                  </Button>
                </div>
              </div>
            )}

            {/* Interview Tab Content */}
            {selectedDetailTab === 'interview' && (
              <div className="space-y-6">
                {!selectedApplication.interview || selectedApplication.interview?.status === 'NOT_SCHEDULED' ? (
                  <>
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Schedule Interview
                    </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Mode</label>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                              <input 
                                type="radio" 
                                name="mode" 
                                value="ONLINE" 
                                checked={interviewSchedule.mode === 'ONLINE'}
                                onChange={(e) => setInterviewSchedule({ ...interviewSchedule, mode: e.target.value })}
                                className="w-4 h-4" 
                              />
                              <span>Online (Zoom/Google Meet)</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input 
                                type="radio" 
                                name="mode" 
                                value="PHYSICAL"
                                checked={interviewSchedule.mode === 'PHYSICAL'}
                                onChange={(e) => setInterviewSchedule({ ...interviewSchedule, mode: e.target.value })}
                                className="w-4 h-4" 
                              />
                              <span>Physical</span>
                            </label>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="interview-date" className="text-sm font-medium mb-2 block">Date</label>
                            <input
                              id="interview-date"
                              type="date"
                              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                              style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }}
                              value={interviewSchedule.date}
                              onChange={(e) => setInterviewSchedule({ ...interviewSchedule, date: e.target.value })}
                            />
                          </div>
                          <div>
                            <label htmlFor="interview-time" className="text-sm font-medium mb-2 block">Time</label>
                            <input
                              id="interview-time"
                              type="time"
                              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                              style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }}
                              value={interviewSchedule.time}
                              onChange={(e) => setInterviewSchedule({ ...interviewSchedule, time: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={interviewSchedule.sendInvitation}
                              onChange={(e) => setInterviewSchedule({ ...interviewSchedule, sendInvitation: e.target.checked })}
                              className="w-4 h-4" 
                            />
                            <span className="text-sm">Send interview invitation to applicant</span>
                          </label>
                        </div>
                        <div>
                          <label className="flex items-center gap-2">
                            <input 
                              type="checkbox"
                              checked={interviewSchedule.sendReminder}
                              onChange={(e) => setInterviewSchedule({ ...interviewSchedule, sendReminder: e.target.checked })}
                              className="w-4 h-4" 
                            />
                            <span className="text-sm">Send auto-reminder 24 hours before</span>
                          </label>
                        </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="primary"
                          onClick={handleScheduleInterview}
                          loading={isSchedulingInterview}
                        >
                          Schedule Interview
                        </Button>
                        <Button variant="secondary" onClick={() => {
                          setSelectedDetailTab('summary');
                        }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                      Interview Details
                    </h3>
                    <div className="p-4 rounded border" style={{ background: 'var(--bg-page)', borderColor: 'var(--border-gray-200)' }}>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Scheduled For:</span>
                          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {selectedApplication.interview?.scheduledDate} at {selectedApplication.interview?.scheduledTime}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mode:</span>
                          <Badge
                            variant={selectedApplication.interview?.mode === 'ONLINE' ? 'info' : 'success'}
                            size="sm"
                          >
                            {selectedApplication.interview?.mode === 'ONLINE' ? 'Online' : 'Physical'}
                          </Badge>
                        </div>
                        {selectedApplication.interview?.mode === 'ONLINE' && selectedApplication.interview.meetingLink && (
                          <div>
                            <span className="text-gray-600 block mb-1">Meeting Link:</span>
                            <a
                              href={selectedApplication.interview.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline font-medium"
                            >
                              {selectedApplication.interview.meetingLink}
                            </a>
                          </div>
                        )}
                        {selectedApplication.interview?.mode === 'PHYSICAL' && selectedApplication.interview.location && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Location:</span>
                            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                              {selectedApplication.interview.location}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                      <div className="flex gap-2 mt-4">
                      {selectedApplication.interview?.status === 'SCHEDULED' && (
                        <>
                          <Button variant="primary" onClick={handleJoinInterview}>
                            Join Interview
                          </Button>
                          <Button variant="secondary" onClick={handleCompleteInterview}>
                            Complete & Evaluate
                          </Button>
                          <Button variant="destructive">Cancel</Button>
                        </>
                      )}
                      {selectedApplication.interview?.status === 'COMPLETED' && (
                        <>
                          <Button
                            variant="primary"
                            onClick={() => setSelectedDetailTab('decision')}
                          >
                            View Evaluation
                          </Button>
                          <Button variant="secondary">Reschedule</Button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Decision Tab Content */}
            {selectedDetailTab === 'decision' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Final Decision
                </h3>

                {selectedApplication.status === 'FORWARDED' && (
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Issue a provisional decision before proceeding to final approval.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        onClick={() => {
                          setDecisionModal({
                            isOpen: true,
                            type: 'PROVISIONAL_APPROVE_INTERVIEW',
                            application: selectedApplication,
                            remarks: ''
                          });
                        }}
                      >
                        Provisionally Approve (Interview Required)
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => {
                          setDecisionModal({
                            isOpen: true,
                            type: 'PROVISIONAL_APPROVE_NO_INTERVIEW',
                            application: selectedApplication,
                            remarks: ''
                          });
                        }}
                      >
                        Provisionally Approve (No Interview)
                      </Button>
                    </div>
                  </div>
                )}

                {(selectedApplication.status === 'PROVISIONALLY_APPROVED' || selectedApplication.status === 'INTERVIEW_COMPLETED') && (
                  <>
                    <div className="p-4 rounded border mb-4" style={{ background: 'var(--bg-page)', borderColor: 'var(--border-gray-200)' }}>
                      <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                        Application Summary
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tracking Number:</span>
                          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {selectedApplication.trackingNumber}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Current Status:</span>
                          <Badge variant={getStatusVariant(selectedApplication.status)} size="sm">
                            {selectedApplication.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        {selectedApplication.interview?.score && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Interview Score:</span>
                            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                              {selectedApplication.interview.score}/20
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        onClick={() => {
                          setDecisionModal({
                            isOpen: true,
                            type: 'FINAL_APPROVE',
                            application: selectedApplication,
                            remarks: ''
                          });
                        }}
                      >
                        Final Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setDecisionModal({
                            isOpen: true,
                            type: 'FINAL_REJECT',
                            application: selectedApplication,
                            remarks: ''
                          });
                        }}
                      >
                        Final Reject
                      </Button>
                    </div>

                    <div className="mt-4 p-3 rounded border-l-4" style={{
                      background: 'var(--color-blue-50)',
                      borderColor: 'var(--color-blue-500)'
                    }}>
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> Final approval will create a student account and send login credentials to the applicant.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Audit Tab Content */}
            {selectedDetailTab === 'audit' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Audit Trail
                </h3>
                <div className="text-sm text-gray-600 mb-4">
                  Application ID: {selectedApplication.id} | Current Status: {selectedApplication.status.replace(/_/g, ' ')}
                </div>

                <div className="space-y-3">
                  {[
                    {
                      date: 'Dec 20, 2024 - 10:30 AM',
                      event: 'Application Submitted',
                      user: 'Applicant (Rahul Sharma)',
                      details: 'Initial application with all documents',
                      auditId: 'AUD-001'
                    },
                    {
                      date: 'Dec 21, 2024 - 2:15 PM',
                      event: 'Payment Verified',
                      user: 'System (Automatic)',
                      details: 'Processing fee of ₹5,000 received',
                      auditId: 'AUD-002'
                    },
                    {
                      date: 'Dec 22, 2024 - 4:30 PM',
                      event: 'Forwarded to Trustees',
                      user: selectedApplication.forwardedBy?.superintendentName || 'Superintendent',
                      details: `Recommendation: ${selectedApplication.forwardedBy?.recommendation}`,
                      auditId: 'AUD-003'
                    }
                  ].map((entry, index) => (
                    <div key={index} className="p-3 rounded border" style={{ background: 'var(--bg-page)', borderColor: 'var(--border-gray-200)' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono text-gray-500">{entry.auditId}</span>
                        <span className="text-xs text-gray-500">{entry.date}</span>
                      </div>
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {entry.event}
                      </div>
                      <div className="text-sm text-gray-600">
                        By: {entry.user}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {entry.details}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-4 border-t" style={{ borderColor: 'var(--border-gray-200)' }}>
                  <Button variant="secondary" size="sm">Export to PDF</Button>
                  <Button variant="secondary" size="sm">Export to CSV</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Decision Modal */}
      <Modal
        isOpen={decisionModal.isOpen}
        onClose={() => setDecisionModal({
          isOpen: false,
          type: 'PROVISIONAL_APPROVE_INTERVIEW',
          application: null,
          remarks: ''
        })}
        title={
          decisionModal.type === 'FINAL_APPROVE' ? 'Final Approve' :
          decisionModal.type === 'FINAL_REJECT' ? 'Final Reject' :
          decisionModal.type === 'PROVISIONAL_REJECT' ? 'Reject Application' :
          'Provisional Approval'
        }
        size="lg"
        variant={decisionModal.type.includes('REJECT') ? 'destructive' : 'confirmation'}
        onConfirm={async () => {
          if (!decisionModal.application) return;
          
          setIsActionLoading(true);
          try {
            let newStatus = 'APPROVED';
            if (decisionModal.type === 'FINAL_REJECT' || decisionModal.type === 'PROVISIONAL_REJECT') {
              newStatus = 'REJECTED';
            } else if (decisionModal.type === 'PROVISIONAL_APPROVE_INTERVIEW' || decisionModal.type === 'PROVISIONAL_APPROVE_NO_INTERVIEW') {
              newStatus = 'PROVISIONALLY_APPROVED';
            }
            
            const response = await fetch(`/api/applications/${decisionModal.application.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                status: newStatus,
                current_status: newStatus,
                decision_type: decisionModal.type,
                remarks: decisionModal.remarks,
                rejection_reason: decisionModal.rejectionReason
              })
            });

            if (response.ok) {
              await fetchApplications();
              setDecisionModal({
                isOpen: false,
                type: 'PROVISIONAL_APPROVE_INTERVIEW',
                application: null,
                remarks: ''
              });
              if (selectedApplication) {
                setSelectedApplication(null);
              }
              alert(`Application ${newStatus === 'REJECTED' ? 'rejected' : 'processed'} successfully`);
            } else {
              alert('Failed to process application');
            }
          } catch (err) {
            console.error('Error processing application:', err);
            alert('Failed to process application');
          } finally {
            setIsActionLoading(false);
          }
        }}
        confirmText={
          decisionModal.type === 'FINAL_APPROVE' ? 'Issue Final Approval' :
          decisionModal.type === 'FINAL_REJECT' ? 'Confirm Final Rejection' :
          decisionModal.type === 'PROVISIONAL_REJECT' ? 'Confirm Rejection' :
          'Issue Provisional Decision'
        }
        confirmLoading={isActionLoading}
      >
        {decisionModal.application && (
          <div className="space-y-4">
            {/* Application Summary */}
            <div className="p-4 rounded border" style={{ background: 'var(--bg-page)', borderColor: 'var(--border-gray-200)' }}>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-gray-600">Applicant Name</label>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {decisionModal.application.applicantName}
                  </p>
                </div>
                <div>
                  <label className="text-gray-600">Tracking Number</label>
                  <p className="font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
                    {decisionModal.application.trackingNumber}
                  </p>
                </div>
                <div>
                  <label className="text-gray-600">Vertical</label>
                  <Badge
                    variant={decisionModal.application.vertical === 'BOYS' ? 'success' : decisionModal.application.vertical === 'GIRLS' ? 'warning' : 'info'}
                    size="sm"
                    className="mt-1"
                  >
                    {decisionModal.application.vertical}
                  </Badge>
                </div>
                <div>
                  <label className="text-gray-600">Current Status</label>
                  <Badge
                    variant={getStatusVariant(decisionModal.application.status)}
                    size="sm"
                    className="mt-1"
                  >
                    {decisionModal.application.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Implications */}
            {(decisionModal.type === 'PROVISIONAL_APPROVE_INTERVIEW' || decisionModal.type === 'PROVISIONAL_APPROVE_NO_INTERVIEW') && (
              <div className="p-3 rounded" style={{ background: 'var(--color-blue-50)' }}>
                <p className="text-sm text-blue-800">
                  <strong>Implications:</strong> Applicant will be notified of provisional approval.
                  {decisionModal.type === 'PROVISIONAL_APPROVE_INTERVIEW' ? ' Interview will be required.' : ' No interview required.'}
                </p>
              </div>
            )}

            {decisionModal.type === 'FINAL_APPROVE' && (
              <div className="p-3 rounded" style={{ background: 'var(--color-green-50)' }}>
                <p className="text-sm text-green-800">
                  <strong>Implications:</strong> Student account will be created automatically.
                  Login credentials will be sent via Email/SMS. Room allocation can proceed.
                </p>
              </div>
            )}

            {(decisionModal.type === 'FINAL_REJECT' || decisionModal.type === 'PROVISIONAL_REJECT') && (
              <div className="p-3 rounded border-l-4" style={{
                background: 'var(--color-red-50)',
                borderColor: 'var(--color-red-500)'
              }}>
                <p className="text-sm text-red-800">
                  <strong>WARNING:</strong> This action will reject the application permanently.
                  Applicant will be notified. Application will be archived after 1 year.
                </p>
              </div>
            )}

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Decision Remarks (Internal)
              </label>
              <textarea
                value={decisionModal.remarks}
                onChange={(e) => setDecisionModal({ ...decisionModal, remarks: e.target.value })}
                placeholder={
                  decisionModal.type.includes('REJECT')
                    ? 'Enter rejection reason and rationale...'
                    : 'Enter approval remarks...'
                }
                className="w-full rounded border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 min-h-[100px]"
                style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }}
                required
              />
            </div>

            {/* Notifications */}
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-sm">Notify applicant via SMS</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-sm">Notify applicant via Email</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-sm">Notify superintendent</span>
              </label>
            </div>
          </div>
        )}
      </Modal>

      {/* Interview Evaluation Modal */}
      <Modal
        isOpen={evaluationModal.isOpen}
        onClose={() => setEvaluationModal({ isOpen: false, application: null })}
        title="Interview Evaluation"
        size="lg"
        variant="confirmation"
        confirmText="Save Evaluation"
        cancelText="Cancel"
        onConfirm={handleSaveEvaluation}
        confirmLoading={isSavingEvaluation}
      >
        {evaluationModal.application && (
          <div className="space-y-4">
            <div className="p-3 rounded bg-blue-50 mb-4">
              <p className="font-medium">{evaluationModal.application.applicantName}</p>
              <p className="text-sm text-gray-600">{evaluationModal.application.trackingNumber}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Academic Background (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={evaluationForm.criteria.academicBackground.score}
                  onChange={(e) => setEvaluationForm({
                    ...evaluationForm,
                    criteria: {
                      ...evaluationForm.criteria,
                      academicBackground: {
                        ...evaluationForm.criteria.academicBackground,
                        score: parseInt(e.target.value) || 0
                      }
                    }
                  })}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Communication Skills (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={evaluationForm.criteria.communicationSkills.score}
                  onChange={(e) => setEvaluationForm({
                    ...evaluationForm,
                    criteria: {
                      ...evaluationForm.criteria,
                      communicationSkills: {
                        ...evaluationForm.criteria.communicationSkills,
                        score: parseInt(e.target.value) || 0
                      }
                    }
                  })}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Discipline (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={evaluationForm.criteria.discipline.score}
                  onChange={(e) => setEvaluationForm({
                    ...evaluationForm,
                    criteria: {
                      ...evaluationForm.criteria,
                      discipline: {
                        ...evaluationForm.criteria.discipline,
                        score: parseInt(e.target.value) || 0
                      }
                    }
                  })}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Motivation (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={evaluationForm.criteria.motivation.score}
                  onChange={(e) => setEvaluationForm({
                    ...evaluationForm,
                    criteria: {
                      ...evaluationForm.criteria,
                      motivation: {
                        ...evaluationForm.criteria.motivation,
                        score: parseInt(e.target.value) || 0
                      }
                    }
                  })}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Comments - Academic</label>
              <textarea
                value={evaluationForm.criteria.academicBackground.comments}
                onChange={(e) => setEvaluationForm({
                  ...evaluationForm,
                  criteria: {
                    ...evaluationForm.criteria,
                    academicBackground: {
                      ...evaluationForm.criteria.academicBackground,
                      comments: e.target.value
                    }
                  }
                })}
                className="w-full rounded border border-gray-300 px-3 py-2 min-h-[60px]"
                placeholder="Comments on academic background..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Comments - Communication</label>
              <textarea
                value={evaluationForm.criteria.communicationSkills.comments}
                onChange={(e) => setEvaluationForm({
                  ...evaluationForm,
                  criteria: {
                    ...evaluationForm.criteria,
                    communicationSkills: {
                      ...evaluationForm.criteria.communicationSkills,
                      comments: e.target.value
                    }
                  }
                })}
                className="w-full rounded border border-gray-300 px-3 py-2 min-h-[60px]"
                placeholder="Comments on communication skills..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Comments - Discipline</label>
              <textarea
                value={evaluationForm.criteria.discipline.comments}
                onChange={(e) => setEvaluationForm({
                  ...evaluationForm,
                  criteria: {
                    ...evaluationForm.criteria,
                    discipline: {
                      ...evaluationForm.criteria.discipline,
                      comments: e.target.value
                    }
                  }
                })}
                className="w-full rounded border border-gray-300 px-3 py-2 min-h-[60px]"
                placeholder="Comments on discipline..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Comments - Motivation</label>
              <textarea
                value={evaluationForm.criteria.motivation.comments}
                onChange={(e) => setEvaluationForm({
                  ...evaluationForm,
                  criteria: {
                    ...evaluationForm.criteria,
                    motivation: {
                      ...evaluationForm.criteria.motivation,
                      comments: e.target.value
                    }
                  }
                })}
                className="w-full rounded border border-gray-300 px-3 py-2 min-h-[60px]"
                placeholder="Comments on motivation..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Overall Score (1-20)</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={evaluationForm.overallScore}
                  onChange={(e) => setEvaluationForm({ ...evaluationForm, overallScore: parseInt(e.target.value) || 0 })}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Recommendation</label>
                <select
                  value={evaluationForm.recommendation}
                  onChange={(e) => setEvaluationForm({ ...evaluationForm, recommendation: e.target.value as any })}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                >
                  <option value="APPROVE">Approve</option>
                  <option value="DEFERRED">Deferred</option>
                  <option value="REJECT">Reject</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Overall Observations</label>
              <textarea
                value={evaluationForm.overallObservations}
                onChange={(e) => setEvaluationForm({ ...evaluationForm, overallObservations: e.target.value })}
                className="w-full rounded border border-gray-300 px-3 py-2 min-h-[80px]"
                placeholder="Overall observations and recommendations..."
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Send Message Panel */}
      <SendMessagePanel
        isOpen={showMessagePanel}
        onClose={() => {
          setShowMessagePanel(false);
          setSelectedMessageRecipient(null);
        }}
        onSend={handleSendMessage}
        recipients={applications.map(app => ({
          id: app.id,
          name: app.applicantName,
          role: 'applicant' as const,
          phone: '+91 9876543210',
          email: `${app.applicantName.toLowerCase().replace(' ', '.')}@example.com`
        }))}
        templates={DEFAULT_TEMPLATES}
        defaultRecipientId={selectedMessageRecipient || undefined}
        context={selectedApplication ? {
          trackingNumber: selectedApplication.trackingNumber,
          status: selectedApplication.status,
          vertical: selectedApplication.vertical
        } : undefined}
        isLoading={isSending}
        showContextWarning={!!selectedApplication}
      />
    </div>
  );
}
