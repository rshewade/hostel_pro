'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { SendMessagePanel, DEFAULT_TEMPLATES, type Recipient, type SendMessageData } from '@/components/communication';

export default function CommunicationDemoPage() {
  const [isOpen, setIsOpen] = useState(false);

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
    {
      id: 'parent-001',
      name: 'Mr. Sharma (Parent)',
      role: 'parent',
      contact: {
        sms: '+91 98765 43210',
        whatsapp: '+91 98765 43210',
        email: 'sharma.parent@email.com',
      },
    },
  ];

  const handleSendMessage = async (data: SendMessageData) => {
    console.log('Sending message:', data);

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        alert('Message sent successfully!');
        resolve();
      }, 1000);
    });
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Communication Components Demo
          </h1>
          <p className="text-gray-600">
            Demonstrates embedded communication patterns with WhatsApp, SMS, and Email channels
          </p>
        </div>

        <div className="grid gap-6">
          <div className="p-6 rounded-lg border" style={{ background: 'var(--surface-primary)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Application Context Example
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
              onClick={() => setIsOpen(true)}
            >
              Send Message to Applicant
            </Button>
          </div>

          <div className="p-6 rounded-lg border" style={{ background: 'var(--surface-primary)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Component Features
            </h2>

            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span><strong>Channel Toggle:</strong> Select between SMS, WhatsApp, and Email</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span><strong>Recipient Selector:</strong> Auto-populated based on context with contact info</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span><strong>Template Selector:</strong> Pre-built templates with editable content</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span><strong>Message Preview:</strong> Real-time preview with variable replacement</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span><strong>Scheduling:</strong> Schedule messages for future delivery</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span><strong>Escalation:</strong> Notify supervisors for urgent matters</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span><strong>Character Limits:</strong> SMS 160-char limit warning</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span><strong>Variable Validation:</strong> Warns about unreplaced placeholders</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span><strong>Context Summary:</strong> Shows tracking number, status, vertical</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span><strong>Audit Logging:</strong> Indicates messages will be logged</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-lg border" style={{ background: 'var(--surface-primary)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Available Templates
            </h2>

            <div className="grid gap-3">
              {DEFAULT_TEMPLATES.map((template) => (
                <div
                  key={template.id}
                  className="p-4 rounded border"
                  style={{ background: 'var(--bg-page)' }}
                >
                  <h3 className="font-medium mb-2">{template.name}</h3>
                  <code className="block text-xs bg-gray-100 p-2 rounded font-mono">
                    {template.content}
                  </code>
                  {template.variables && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {template.variables.map((variable) => (
                        <span
                          key={variable}
                          className="px-2 py-0.5 text-xs font-mono bg-blue-100 text-blue-700 rounded"
                        >
                          {`{{${variable}}}`}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SendMessagePanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
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
  );
}
