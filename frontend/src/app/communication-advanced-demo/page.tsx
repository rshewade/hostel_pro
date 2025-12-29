'use client';

import { useState } from 'react';
import { cn } from '@/components/utils';
import { Button } from '@/components/ui/Button';
import { SendMessagePanel, DEFAULT_TEMPLATES, SchedulePresetSelector, EscalationSelector, MessageLog, type Recipient, type Supervisor, type MessageLogEntry, type MessageStatus, type SendMessageData } from '@/components/communication';

export default function CommunicationAdvancedDemoPage() {
  const [isMessagePanelOpen, setIsMessagePanelOpen] = useState(false);
  const [messageLog, setMessageLog] = useState<MessageLogEntry[]>([
    {
      id: 'log-001',
      recipient: {
        id: 'app-001',
        name: 'Rahul Sharma',
        role: 'applicant',
      },
      channels: ['sms', 'email'],
      template: 'interview_invitation',
      message: 'Your interview is scheduled on Dec 30, 2024 at 10:00 AM. Mode: Online. Meeting link: https://meet.google.com/abc-xyz',
      status: 'SENT',
      sentAt: '2024-12-28T10:00:00Z',
      sentBy: {
        id: 'sup-001',
        name: 'John Smith',
        role: 'Superintendent',
      },
      auditLogId: 'AUD-2024-12-28-001',
    },
    {
      id: 'log-002',
      recipient: {
        id: 'app-002',
        name: 'Priya Patel',
        role: 'applicant',
      },
      channels: ['whatsapp'],
      template: 'fee_reminder',
      message: 'Reminder: Hostel Fees of ₹30000 due on Jan 30, 2025. Pay now.',
      status: 'DELIVERED',
      sentAt: '2024-12-27T15:30:00Z',
      sentBy: {
        id: 'sup-001',
        name: 'John Smith',
        role: 'Superintendent',
      },
      auditLogId: 'AUD-2024-12-27-002',
    },
    {
      id: 'log-003',
      recipient: {
        id: 'app-003',
        name: 'Amit Kumar',
        role: 'applicant',
      },
      channels: ['sms', 'whatsapp', 'email'],
      template: 'provisional_approval',
      message: 'Your application APP-2024-003 has been provisionally approved. Interview required.',
      status: 'READ',
      sentAt: '2024-12-26T09:00:00Z',
      sentBy: {
        id: 'trust-001',
        name: 'Jane Doe',
        role: 'Trustee',
      },
      escalatedTo: {
        id: 'sup-002',
        name: 'Mike Johnson',
        role: 'Superintendent',
      },
      escalatedAt: '2024-12-26T09:05:00Z',
      auditLogId: 'AUD-2024-12-26-003',
    },
    {
      id: 'log-004',
      recipient: {
        id: 'app-004',
        name: 'Sneha Reddy',
        role: 'applicant',
      },
      channels: ['sms'],
      template: 'rejection',
      message: 'Your application APP-2024-004 has been rejected. Reason: Incomplete documents. Refund pending.',
      status: 'FAILED',
      sentAt: '2024-12-25T14:00:00Z',
      sentBy: {
        id: 'sup-003',
        name: 'Robert Wilson',
        role: 'Superintendent',
      },
      auditLogId: 'AUD-2024-12-25-004',
    },
    {
      id: 'log-005',
      recipient: {
        id: 'app-005',
        name: 'Vijay Singh',
        role: 'applicant',
      },
      channels: ['email'],
      message: 'Leave application for Vijay Singh from Jan 2, 2025 to Jan 5, 2025 has been APPROVED.',
      status: 'SCHEDULED',
      scheduledFor: '2024-12-29T10:00:00Z',
      sentBy: {
        id: 'sup-003',
        name: 'Robert Wilson',
        role: 'Superintendent',
      },
      auditLogId: 'AUD-2024-12-28-005',
    },
  ]);

  const mockRecipients: Recipient[] = [
    {
      id: 'app-001',
      name: 'Rahul Sharma',
      role: 'applicant',
      contact: {
        sms: '+91 98765 43210',
        whatsapp: '+91 98765 43210',
        email: 'rahul.sharma@email.com',
      },
    },
    {
      id: 'app-002',
      name: 'Priya Patel',
      role: 'applicant',
      contact: {
        sms: '+91 98765 43211',
        email: 'priya.patel@email.com',
      },
    },
  ];

  const mockSupervisors: Supervisor[] = [
    {
      id: 'trust-001',
      name: 'Jane Doe',
      role: 'trustee',
      vertical: 'BOYS',
      available: true,
    },
    {
      id: 'acc-001',
      name: 'Robert Wilson',
      role: 'accounts',
      available: true,
    },
    {
      id: 'admin-001',
      name: 'System Administrator',
      role: 'admin',
      available: false,
    },
  ];

  const handleSendMessage = async (data: SendMessageData) => {
    console.log('Sending message:', data);

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const newEntry: MessageLogEntry = {
          id: `log-${Date.now()}`,
          recipient: mockRecipients.find(r => r.id === data.recipientId)!,
          channels: data.channels,
          template: data.templateId,
          message: data.message,
          status: data.schedule ? 'SCHEDULED' : 'SENT',
          sentAt: data.schedule ? undefined : new Date().toISOString(),
          scheduledFor: data.schedule ? new Date(`${data.schedule.date}T${data.schedule.time}`).toISOString() : undefined,
          sentBy: {
            id: 'sup-001',
            name: 'John Smith',
            role: 'Superintendent',
          },
          auditLogId: `AUD-${new Date().toISOString().slice(0, 10)}-${Date.now()}`,
        };

        setMessageLog([newEntry, ...messageLog]);
        resolve();
      }, 1000);
    });
  };

  const handleRetryMessage = (entryId: string) => {
    console.log('Retrying message:', entryId);
    alert('Message retry initiated (demo)');
  };

  const handleViewDetails = (entryId: string) => {
    console.log('Viewing details for:', entryId);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Advanced Communication Features Demo
          </h1>
          <p className="text-gray-600">
            Demonstrates scheduling presets, escalation, and message logging
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-6 rounded-lg border" style={{ background: 'var(--surface-primary)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Send New Message
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Tracking Number</label>
                <p className="font-mono text-sm">APP-2024-001</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Current Status</label>
                <p className="text-sm">Under Review</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Vertical</label>
                <p className="text-sm">Boys Hostel</p>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={() => setIsMessagePanelOpen(true)}
            >
              Open Message Panel
            </Button>

            <div className="mt-6 space-y-2">
              <h3 className="font-semibold text-navy-900">Features Included:</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Quick schedule presets (Tomorrow, In 3 days, etc.)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Supervisor escalation with recipient selection</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Escalation reason tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Full message history log</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Filter by status (Sent, Delivered, Failed, etc.)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Expandable details view</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Retry failed messages</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-lg border" style={{ background: 'var(--surface-primary)' }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Schedule Presets
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Available quick presets for scheduling messages
              </p>

              <div className="space-y-2">
                <div className="p-3 rounded border border-gray-200">
                  <p className="font-medium text-navy-900">Send Now</p>
                  <p className="text-xs text-gray-600">Immediately sends the message</p>
                </div>
                <div className="p-3 rounded border border-gray-200">
                  <p className="font-medium text-navy-900">In 1 Hour</p>
                  <p className="text-xs text-gray-600">Schedule for 1 hour from now</p>
                </div>
                <div className="p-3 rounded border border-gray-200">
                  <p className="font-medium text-navy-900">Tomorrow at 9:00 AM</p>
                  <p className="text-xs text-gray-600">Next morning business hours</p>
                </div>
                <div className="p-3 rounded border border-gray-200">
                  <p className="font-medium text-navy-900">In 3 Days</p>
                  <p className="text-xs text-gray-600">Three days from now at 9:00 AM</p>
                </div>
                <div className="p-3 rounded border border-gray-200">
                  <p className="font-medium text-navy-900">Next Monday at 9:00 AM</p>
                  <p className="text-xs text-gray-600">Next working Monday morning</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg border" style={{ background: 'var(--surface-primary)' }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Escalation Workflow
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Select supervisors for urgent matters
              </p>

              <div className="space-y-2">
                {mockSupervisors.map((supervisor) => (
                  <div
                    key={supervisor.id}
                    className={cn(
                      'p-3 rounded-lg border-2',
                      supervisor.available
                        ? 'border-gray-200 bg-white'
                        : 'border-red-200 bg-red-50 opacity-50'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-navy-900">{supervisor.name}</p>
                        <p className="text-xs text-gray-600">
                          {supervisor.role}
                          {supervisor.vertical && ` • ${supervisor.vertical}`}
                        </p>
                      </div>
                      {!supervisor.available && (
                        <span className="text-xs text-red-600">Unavailable</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 rounded-lg border" style={{ background: 'var(--surface-primary)' }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Message Log
          </h2>

          <MessageLog
            entries={messageLog}
            maxEntries={10}
            onRetry={handleRetryMessage}
            onViewDetails={handleViewDetails}
          />
        </div>

        <SendMessagePanel
          isOpen={isMessagePanelOpen}
          onClose={() => setIsMessagePanelOpen(false)}
          onSend={handleSendMessage}
          recipients={mockRecipients}
          templates={DEFAULT_TEMPLATES}
          defaultRecipientId="app-001"
          defaultChannels={['sms', 'email']}
          context={{
            trackingNumber: 'APP-2024-001',
            status: 'Under Review',
            vertical: 'Boys Hostel',
          }}
          showContextWarning={true}
        />
      </div>
    </div>
  );
}
