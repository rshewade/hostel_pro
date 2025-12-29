import { describe, it, expect, vi, beforeEach, afterEach, act } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ChannelToggle,
  RecipientSelector,
  TemplateSelector,
  MessagePreview,
  SendMessagePanel,
  SchedulePresetSelector,
  EscalationSelector,
  MessageLog,
  DEFAULT_TEMPLATES,
  type Recipient,
  type Supervisor,
  type MessageLogEntry,
  type SendMessageData,
} from '../src/components/communication';

describe('Task 14 - Embedded Communication Patterns', () => {
  afterEach(cleanup);

  describe('ChannelToggle Component', () => {
    const channels = [
      { id: 'sms' as const, label: 'SMS', icon: '📱' },
      { id: 'whatsapp' as const, label: 'WhatsApp', icon: '💬' },
      { id: 'email' as const, label: 'Email', icon: '📧' },
    ];

    it('renders all channel buttons', () => {
      const handleChange = vi.fn();
      render(
        <ChannelToggle
          channels={channels}
          selectedChannels={[]}
          onChange={handleChange}
        />
      );

      expect(screen.getByText('SMS')).toBeInTheDocument();
      expect(screen.getByText('WhatsApp')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('highlights selected channels', () => {
      render(
        <ChannelToggle
          channels={channels}
          selectedChannels={['sms', 'email']}
          onChange={vi.fn()}
        />
      );

      const smsButton = screen.getByText('SMS').closest('button');
      const emailButton = screen.getByText('Email').closest('button');
      const whatsappButton = screen.getByText('WhatsApp').closest('button');

      expect(smsButton).toHaveClass(/border-gold-600/);
      expect(emailButton).toHaveClass(/border-gold-600/);
      expect(whatsappButton).not.toHaveClass(/border-gold-600/);
    });

    it('handles channel selection', () => {
      const handleChange = vi.fn();
      render(
        <ChannelToggle
          channels={channels}
          selectedChannels={[]}
          onChange={handleChange}
        />
      );

      fireEvent.click(screen.getByText('SMS'));
      expect(handleChange).toHaveBeenCalledWith(['sms']);
    });

    it('handles channel deselection', () => {
      const handleChange = vi.fn();
      render(
        <ChannelToggle
          channels={channels}
          selectedChannels={['sms']}
          onChange={handleChange}
        />
      );

      fireEvent.click(screen.getByText('SMS'));
      expect(handleChange).toHaveBeenCalledWith([]);
    });

    it('disables all buttons when disabled', () => {
      render(
        <ChannelToggle
          channels={channels}
          selectedChannels={['sms']}
          onChange={vi.fn()}
          disabled={true}
        />
      );

      const button = screen.getByText('SMS').closest('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass(/disabled:opacity-50/);
    });

    it('disables individual channels', () => {
      const channelsWithDisabled = [
        ...channels,
        { id: 'telegram' as const, label: 'Telegram', disabled: true },
      ];

      render(
        <ChannelToggle
          channels={channelsWithDisabled}
          selectedChannels={[]}
          onChange={vi.fn()}
        />
      );

      const telegramButton = screen.getByText('Telegram').closest('button');
      expect(telegramButton).toBeDisabled();
    });
  });

  describe('RecipientSelector Component', () => {
    const recipients: Recipient[] = [
      {
        id: 'rec-001',
        name: 'Rahul Sharma',
        role: 'applicant',
        contact: {
          sms: '+91 98765 43210',
          whatsapp: '+91 98765 43210',
          email: 'rahul.sharma@email.com',
        },
      },
      {
        id: 'rec-002',
        name: 'Priya Patel',
        role: 'student',
        contact: {
          sms: '+91 98765 43211',
          email: 'priya.patel@email.com',
        },
      },
    ];

    it('renders all recipients', () => {
      const handleChange = vi.fn();
      render(
        <RecipientSelector
          recipients={recipients}
          selectedRecipientId='rec-001'
          onChange={handleChange}
        />
      );

      expect(screen.getByText('Rahul Sharma')).toBeInTheDocument();
      expect(screen.getByText('Priya Patel')).toBeInTheDocument();
      expect(screen.getByText('applicant')).toBeInTheDocument();
      expect(screen.getByText('student')).toBeInTheDocument();
    });

    it('highlights selected recipient', () => {
      render(
        <RecipientSelector
          recipients={recipients}
          selectedRecipientId='rec-001'
          onChange={vi.fn()}
        />
      );

      const selectedButton = screen.getByText('Rahul Sharma').closest('button');
      expect(selectedButton).toHaveClass(/border-gold-600/);

      const checkmark = selectedButton?.querySelector('svg');
      expect(checkmark).toBeInTheDocument();
    });

    it('displays contact method indicators', () => {
      render(
        <RecipientSelector
          recipients={recipients}
          selectedRecipientId='rec-001'
          onChange={vi.fn()}
          showContext={true}
        />
      );

      expect(screen.getByTestId('contact-sms-rec-001')).toBeInTheDocument();
      expect(screen.getByTestId('contact-whatsapp-rec-001')).toBeInTheDocument();
      expect(screen.getByTestId('contact-email-rec-001')).toBeInTheDocument();
    });

    it('shows recipient details when selected', () => {
      render(
        <RecipientSelector
          recipients={recipients}
          selectedRecipientId='rec-001'
          onChange={vi.fn()}
          showContext={true}
        />
      );

      expect(screen.getByTestId('recipient-details')).toBeInTheDocument();
      expect(screen.getByTestId('detail-sms')).toBeInTheDocument();
      expect(screen.getByTestId('detail-whatsapp')).toBeInTheDocument();
      expect(screen.getByTestId('detail-email')).toBeInTheDocument();
    });

    it('handles empty recipients list', () => {
      render(
        <RecipientSelector
          recipients={[]}
          selectedRecipientId=''
          onChange={vi.fn()}
        />
      );

      expect(screen.getByText(/No recipients available/i)).toBeInTheDocument();
    });

    it('handles recipient selection', () => {
      const handleChange = vi.fn();
      render(
        <RecipientSelector
          recipients={recipients}
          selectedRecipientId='rec-001'
          onChange={handleChange}
        />
      );

      fireEvent.click(screen.getByText('Priya Patel'));
      expect(handleChange).toHaveBeenCalledWith('rec-002');
    });

    it('applies correct role badge colors', () => {
      render(
        <RecipientSelector
          recipients={recipients}
          selectedRecipientId='rec-001'
          onChange={vi.fn()}
        />
      );

      const applicantBadge = screen.getByText('applicant');
      const studentBadge = screen.getByText('student');

      expect(applicantBadge).toHaveClass(/bg-blue-100/);
      expect(studentBadge).toHaveClass(/bg-green-100/);
    });
  });

  describe('TemplateSelector Component', () => {
    it('renders template dropdown', () => {
      const handleTemplateChange = vi.fn();
      const handleMessageChange = vi.fn();

      render(
        <TemplateSelector
          templates={DEFAULT_TEMPLATES}
          selectedTemplateId='interview_invitation'
          message=''
          onTemplateChange={handleTemplateChange}
          onMessageChange={handleMessageChange}
        />
      );

      expect(screen.getByText('Interview Invitation')).toBeInTheDocument();
      expect(screen.getByText('Provisional Approval')).toBeInTheDocument();
      expect(screen.getByText('Final Approval')).toBeInTheDocument();
      expect(screen.getByText('Rejection')).toBeInTheDocument();
      expect(screen.getByText('Fee Reminder')).toBeInTheDocument();
    });

    it('renders message textarea', () => {
      render(
        <TemplateSelector
          templates={DEFAULT_TEMPLATES}
          selectedTemplateId='interview_invitation'
          message='Test message'
          onTemplateChange={vi.fn()}
          onMessageChange={vi.fn()}
        />
      );

      const textarea = screen.getByTestId('message-textarea');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveValue('Test message');
    });

    it('populates message when template selected', async () => {
      const handleMessageChange = vi.fn();
      const handleTemplateChange = vi.fn();
      const user = userEvent.setup();

      render(
        <TemplateSelector
          templates={DEFAULT_TEMPLATES}
          selectedTemplateId=''
          message=''
          onTemplateChange={handleTemplateChange}
          onMessageChange={handleMessageChange}
        />
      );

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'interview_invitation');

      expect(handleTemplateChange).toHaveBeenCalledTimes(1);
      expect(handleMessageChange).toHaveBeenCalled();
      expect(handleMessageChange).toHaveBeenCalledWith(expect.stringContaining('{{date}}'));
    });

    it('displays available variables', () => {
      render(
        <TemplateSelector
          templates={DEFAULT_TEMPLATES}
          selectedTemplateId='interview_invitation'
          message=''
          onTemplateChange={vi.fn()}
          onMessageChange={vi.fn()}
        />
      );

      expect(screen.getByText('Available variables:')).toBeInTheDocument();
      expect(screen.getByText('{{date}}')).toBeInTheDocument();
      expect(screen.getByText('{{time}}')).toBeInTheDocument();
      expect(screen.getByText('{{mode}}')).toBeInTheDocument();
      expect(screen.getByText('{{link}}')).toBeInTheDocument();
    });

    it('handles message changes', () => {
      const handleMessageChange = vi.fn();

      render(
        <TemplateSelector
          templates={DEFAULT_TEMPLATES}
          selectedTemplateId='interview_invitation'
          message='Initial message'
          onTemplateChange={vi.fn()}
          onMessageChange={handleMessageChange}
        />
      );

      const textarea = screen.getByTestId('message-textarea');
      fireEvent.change(textarea, { target: { value: 'Updated message' } });
      expect(handleMessageChange).toHaveBeenCalledWith('Updated message');
    });

    it('shows character limit warning for long messages', () => {
      const longMessage = 'A'.repeat(500);

      render(
        <TemplateSelector
          templates={DEFAULT_TEMPLATES}
          selectedTemplateId='interview_invitation'
          message={longMessage}
          onTemplateChange={vi.fn()}
          onMessageChange={vi.fn()}
        />
      );

      const textarea = screen.getByTestId('message-textarea');
      expect(textarea).toBeInTheDocument();

      // Character count is shown by Textarea component as "500/500"
      const charCountText = screen.getByText('500/500');
      expect(charCountText).toBeInTheDocument();
    });

    it('renders message textarea', () => {
      render(
        <TemplateSelector
          templates={DEFAULT_TEMPLATES}
          selectedTemplateId='interview_invitation'
          message='Test message'
          onTemplateChange={vi.fn()}
          onMessageChange={vi.fn()}
        />
      );

      const textarea = screen.getByPlaceholderText(/Type your message/i);
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveValue('Test message');
    });

    it('populates message when template selected', () => {
      const handleMessageChange = vi.fn();

      render(
        <TemplateSelector
          templates={DEFAULT_TEMPLATES}
          selectedTemplateId='interview_invitation'
          message=''
          onTemplateChange={vi.fn()}
          onMessageChange={handleMessageChange}
        />
      );

      // Should have message from template
      const textarea = screen.getByPlaceholderText(/Type your message/i);
      expect(textarea.value).toContain('{{date}}');
      expect(textarea.value).toContain('{{time}}');
    });

    it('displays available variables', () => {
      const template = DEFAULT_TEMPLATES.find(t => t.id === 'interview_invitation')!;

      render(
        <TemplateSelector
          templates={[template]}
          selectedTemplateId='interview_invitation'
          message=''
          onTemplateChange={vi.fn()}
          onMessageChange={vi.fn()}
        />
      );

      expect(screen.getByText('Available variables:')).toBeInTheDocument();
      expect(screen.getByText('{{date}}')).toBeInTheDocument();
      expect(screen.getByText('{{time}}')).toBeInTheDocument();
      expect(screen.getByText('{{mode}}')).toBeInTheDocument();
    });

    it('handles message changes', () => {
      const handleMessageChange = vi.fn();

      render(
        <TemplateSelector
          templates={DEFAULT_TEMPLATES}
          selectedTemplateId='interview_invitation'
          message='Initial message'
          onTemplateChange={vi.fn()}
          onMessageChange={handleMessageChange}
        />
      );

      const textarea = screen.getByPlaceholderText(/Type your message/i);
      fireEvent.change(textarea, { target: { value: 'Updated message' } });
      expect(handleMessageChange).toHaveBeenCalledWith('Updated message');
    });

    it('shows character limit warning for long messages', () => {
      const longMessage = 'A'.repeat(500);

      render(
        <TemplateSelector
          templates={DEFAULT_TEMPLATES}
          selectedTemplateId='interview_invitation'
          message={longMessage}
          onTemplateChange={vi.fn()}
          onMessageChange={vi.fn()}
        />
      );

      const characterCount = screen.getByText(/500 \/ 500 characters/);
      expect(characterCount).toBeInTheDocument();
    });
  });

  describe('MessagePreview Component', () => {
    it('renders message with variable replacement', () => {
      render(
        <MessagePreview
          message='Hello {{name}}, your interview is on {{date}}'
          variables={{ name: 'Rahul', date: 'Dec 30, 2024' }}
          channel='sms'
        />
      );

      expect(screen.getByTestId('preview-content')).toBeInTheDocument();
      expect(screen.getByTestId('preview-content')).toHaveTextContent(/Hello Rahul/);
      expect(screen.getByTestId('preview-content')).toHaveTextContent(/interview is on Dec 30, 2024/);
      expect(screen.queryByTestId('preview-content')).not.toHaveTextContent(/{{name}}/);
    });

    it('shows character count for SMS', () => {
      render(
        <MessagePreview
          message='Short message'
          variables={{}}
          channel='sms'
          showCharacterCount={true}
        />
      );

      expect(screen.getByTestId('character-count')).toBeInTheDocument();
      expect(screen.getByTestId('character-count')).toHaveTextContent('13 / 160 characters');
    });

    it('shows warning for SMS over limit', () => {
      const longMessage = 'A'.repeat(200);

      render(
        <MessagePreview
          message={longMessage}
          variables={{}}
          channel='sms'
          showCharacterCount={true}
        />
      );

      expect(screen.getByTestId('character-count')).toBeInTheDocument();
      expect(screen.getByTestId('character-count')).toHaveTextContent(/200 \/ 160 characters/);
      expect(screen.getByTestId('sms-limit-warning')).toBeInTheDocument();
    });

    it('shows unlimited for email channel', () => {
      render(
        <MessagePreview
          message='Test message'
          variables={{}}
          channel='email'
          showCharacterCount={true}
        />
      );

      expect(screen.getByTestId('character-count')).toHaveTextContent(/∞ characters/);
    });

    it('warns about unreplaced variables', () => {
      render(
        <MessagePreview
          message='Hello {{name}}, see you on {{date}}'
          variables={{ name: 'Rahul' }}
          channel='sms'
        />
      );

      expect(screen.getByTestId('unreplaced-variables-warning')).toBeInTheDocument();
      expect(screen.getByTestId('unreplaced-variables-list')).toBeInTheDocument();
      expect(screen.getByTestId('unreplaced-variables-list')).toHaveTextContent('{{date}}');
    });

    it('displays channel-specific styling', () => {
      const { rerender } = render(
        <MessagePreview
          message='Test'
          variables={{}}
          channel='sms'
        />
      );

      const smsBox = screen.getByTestId('preview-content');
      expect(smsBox).toHaveClass(/bg-yellow-50/);

      rerender(
        <MessagePreview
          message='Test'
          variables={{}}
          channel='whatsapp'
        />
      );

      const whatsappBox = screen.getByTestId('preview-content');
      expect(whatsappBox).toHaveClass(/bg-green-50/);

      rerender(
        <MessagePreview
          message='Test'
          variables={{}}
          channel='email'
        />
      );

      const emailBox = screen.getByTestId('preview-content');
      expect(emailBox).toHaveClass(/bg-blue-50/);
    });

    it('shows variable values used', () => {
      render(
        <MessagePreview
          message='Hello {{name}}'
          variables={{ name: 'Rahul' }}
          channel='sms'
        />
      );

      expect(screen.getByTestId('variable-values')).toBeInTheDocument();
      expect(screen.getByTestId('variable-value-name')).toBeInTheDocument();
    });
  });

  describe('SchedulePresetSelector Component', () => {
    it('renders all default presets', () => {
      const handleSelect = vi.fn();

      render(
        <SchedulePresetSelector
          onSelect={handleSelect}
        />
      );

      expect(screen.getByText('Quick Schedule Presets')).toBeInTheDocument();
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('calculates "Tomorrow at 9:00 AM" correctly', () => {
      const handleSelect = vi.fn();

      render(
        <SchedulePresetSelector
          baseDate={new Date('2024-12-28T00:00:00Z')}
          onSelect={handleSelect}
        />
      );

      const select = screen.getByRole('combobox');
      // Set value to tomorrow_9am
      const option = Array.from(select.options).find(
        opt => opt.value === 'tomorrow_9am'
      );
      if (option) {
        fireEvent.change(select, { target: { value: 'tomorrow_9am' } });

        expect(handleSelect).toHaveBeenCalled();
        const selectedDate = handleSelect.mock.calls[0][0] as Date;
        expect(selectedDate.getHours()).toBe(9);
        expect(selectedDate.getMinutes()).toBe(0);
      }
    });

    it('calculates "Next Monday" correctly from Friday', () => {
      const handleSelect = vi.fn();

      render(
        <SchedulePresetSelector
          baseDate={new Date('2024-12-27T00:00:00Z')} // Friday
          onSelect={handleSelect}
        />
      );

      const select = screen.getByRole('combobox');
      const option = Array.from(select.options).find(
        opt => opt.value === 'next_monday_9am'
      );
      if (option) {
        fireEvent.change(select, { target: { value: 'next_monday_9am' } });

        const selectedDate = handleSelect.mock.calls[0][0] as Date;
        expect(selectedDate.getDay()).toBe(1); // Monday
      }
    });
  });

  describe('EscalationSelector Component', () => {
    const supervisors: Supervisor[] = [
      {
        id: 'sup-001',
        name: 'Jane Doe',
        role: 'trustee',
        vertical: 'BOYS',
        available: true,
      },
      {
        id: 'sup-002',
        name: 'Robert Wilson',
        role: 'accounts',
        available: true,
      },
      {
        id: 'sup-003',
        name: 'System Admin',
        role: 'admin',
        available: false,
      },
    ];

    it('renders escalation header', () => {
      render(
        <EscalationSelector
          supervisors={supervisors}
          onSelect={vi.fn()}
        />
      );

      expect(screen.getByText('Escalation Required?')).toBeInTheDocument();
      expect(screen.getByText(/Select a supervisor to notify/i)).toBeInTheDocument();
      expect(screen.getByText('🚨')).toBeInTheDocument();
    });

    it('renders all supervisors', () => {
      render(
        <EscalationSelector
          supervisors={supervisors}
          onSelect={vi.fn()}
        />
      );

      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('Robert Wilson')).toBeInTheDocument();
      expect(screen.getByText('System Admin')).toBeInTheDocument();
      expect(screen.getByText('Trustee')).toBeInTheDocument();
      expect(screen.getByText('Accounts')).toBeInTheDocument();
      expect(screen.getByText('Administrator')).toBeInTheDocument();
    });

    it('handles supervisor selection', () => {
      const handleSelect = vi.fn();

      render(
        <EscalationSelector
          supervisors={supervisors}
          onSelect={handleSelect}
        />
      );

      fireEvent.click(screen.getByText('Jane Doe'));
      expect(handleSelect).toHaveBeenCalledWith('sup-001');
    });

    it('shows role badges with correct colors', () => {
      render(
        <EscalationSelector
          supervisors={supervisors}
          onSelect={vi.fn()}
        />
      );

      const trusteeBadge = screen.getByText('Trustee');
      const accountsBadge = screen.getByText('Accounts');

      expect(trusteeBadge).toHaveClass(/bg-purple-100/);
      expect(accountsBadge).toHaveClass(/bg-blue-100/);
    });

    it('disables unavailable supervisors', () => {
      render(
        <EscalationSelector
          supervisors={supervisors}
          onSelect={vi.fn()}
        />
      );

      const adminButton = screen.getByText('System Admin').closest('button');
      expect(adminButton).toBeDisabled();
      expect(screen.getByText('⚠️ Currently unavailable')).toBeInTheDocument();
    });

    it('shows context when provided', () => {
      render(
        <EscalationSelector
          supervisors={supervisors}
          onSelect={vi.fn()}
          context='Overdue fee: Hostel Fees for Rahul Sharma'
        />
      );

      expect(screen.getByText('Communication Context')).toBeInTheDocument();
      expect(screen.getByText(/Overdue fee/i)).toBeInTheDocument();
    });

    it('enters escalation reason workflow', async () => {
      const handleSelect = vi.fn();

      render(
        <EscalationSelector
          supervisors={supervisors}
          onSelect={handleSelect}
        />
      );

      // Select supervisor
      fireEvent.click(screen.getByText('Jane Doe'));
      fireEvent.click(screen.getByText('Confirm Escalation'));

      // Should show reason input
      await waitFor(() => {
        expect(screen.getByText('Escalation Reason (Optional)')).toBeInTheDocument();
        expect(screen.getByText('Escalation To:')).toBeInTheDocument();
      });
    });
  });

  describe('MessageLog Component', () => {
    const mockEntries: MessageLogEntry[] = [
      {
        id: 'log-001',
        recipient: {
          id: 'rec-001',
          name: 'Rahul Sharma',
          role: 'applicant',
        },
        channels: ['sms', 'email'],
        template: 'interview_invitation',
        message: 'Your interview is scheduled on Dec 30, 2024',
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
          id: 'rec-002',
          name: 'Priya Patel',
          role: 'student',
        },
        channels: ['whatsapp'],
        message: 'Fee reminder',
        status: 'FAILED',
        sentAt: '2024-12-27T15:30:00Z',
        sentBy: {
          id: 'sup-002',
          name: 'Jane Doe',
          role: 'Superintendent',
        },
        auditLogId: 'AUD-2024-12-27-002',
      },
      {
        id: 'log-003',
        recipient: {
          id: 'rec-003',
          name: 'Amit Kumar',
          role: 'applicant',
        },
        channels: ['email'],
        message: 'Provisional approval',
        status: 'SCHEDULED',
        scheduledFor: '2024-12-30T10:00:00Z',
        sentBy: {
          id: 'sup-003',
          name: 'Mike Johnson',
          role: 'Superintendent',
        },
        auditLogId: 'AUD-2024-12-28-003',
      },
      {
        id: 'log-004',
        recipient: {
          id: 'rec-004',
          name: 'Sneha Reddy',
          role: 'student',
        },
        channels: ['sms', 'whatsapp', 'email'],
        message: 'Leave notification',
        status: 'DELIVERED',
        sentAt: '2024-12-26T09:00:00Z',
        escalatedTo: {
          id: 'trust-001',
          name: 'Jane Doe',
          role: 'Trustee',
        },
        escalatedAt: '2024-12-26T09:05:00Z',
        sentBy: {
          id: 'sup-004',
          name: 'Robert Wilson',
          role: 'Superintendent',
        },
        auditLogId: 'AUD-2024-12-26-004',
      },
    ];

    it('renders all message entries', () => {
      render(
        <MessageLog
          entries={mockEntries}
        />
      );

      expect(screen.getByText('Rahul Sharma')).toBeInTheDocument();
      expect(screen.getByText('Priya Patel')).toBeInTheDocument();
      expect(screen.getByText('Amit Kumar')).toBeInTheDocument();
      expect(screen.getByText('Sneha Reddy')).toBeInTheDocument();
    });

    it('displays status badges correctly', () => {
      render(
        <MessageLog
          entries={mockEntries}
        />
      );

      expect(screen.getByText('SENT')).toBeInTheDocument();
      expect(screen.getByText('FAILED')).toBeInTheDocument();
      expect(screen.getByText('SCHEDULED')).toBeInTheDocument();
      expect(screen.getByText('DELIVERED')).toBeInTheDocument();
    });

    it('shows channel icons', () => {
      render(
        <MessageLog
          entries={mockEntries}
        />
      );

      expect(screen.getByTestId('channel-icons-log-001')).toBeInTheDocument();
      expect(screen.getByTestId('channel-icons-log-002')).toBeInTheDocument();
      expect(screen.getByTestId('channel-icons-log-003')).toBeInTheDocument();
      expect(screen.getByTestId('channel-icons-log-004')).toBeInTheDocument();
    });

    it('displays scheduled messages with date', () => {
      render(
        <MessageLog
          entries={mockEntries}
        />
      );

      expect(screen.getByTestId('scheduled-info-log-003')).toBeInTheDocument();
      expect(screen.getByTestId('scheduled-info-log-003')).toHaveTextContent(/Scheduled for:/i);
      expect(screen.getByTestId('scheduled-info-log-003').textContent).toContain('📅');
    });

    it('displays escalation information', () => {
      render(
        <MessageLog
          entries={mockEntries}
        />
      );

      expect(screen.getByTestId('escalation-info-log-004')).toBeInTheDocument();
      expect(screen.getByTestId('escalation-info-log-004')).toHaveTextContent(/Escalated to:/i);
      expect(screen.getByTestId('escalation-info-log-004').textContent).toContain('🚨');
    });

    it('filters by status', () => {
      render(
        <MessageLog
          entries={mockEntries}
        />
      );

      const filter = screen.getByRole('combobox');
      fireEvent.change(filter, { target: { value: 'SENT' } });

      expect(screen.getByTestId('message-log-entry-log-001')).toBeInTheDocument();
      expect(screen.queryByTestId('message-log-entry-log-002')).not.toBeInTheDocument();
    });

    it('expands entry details', async () => {
      render(
        <MessageLog
          entries={mockEntries}
          onViewDetails={vi.fn()}
        />
      );

      fireEvent.click(screen.getByTestId('details-button-log-001'));

      await waitFor(() => {
        expect(screen.getByTestId('expanded-details-log-001')).toBeInTheDocument();
      });
    });

    it('shows retry button for failed messages', () => {
      const handleRetry = vi.fn();

      render(
        <MessageLog
          entries={mockEntries}
          onRetry={handleRetry}
        />
      );

      const retryButton = screen.getByTestId('retry-button-log-002');
      expect(retryButton).toBeInTheDocument();

      fireEvent.click(retryButton);
      expect(handleRetry).toHaveBeenCalledWith('log-002');
    });

    it('shows empty state', () => {
      render(
        <MessageLog
          entries={[]}
          emptyMessage='No messages sent yet'
        />
      );

      expect(screen.getByText('📭')).toBeInTheDocument();
      expect(screen.getByText('No messages sent yet')).toBeInTheDocument();
    });

    it('shows loading state', () => {
      render(
        <MessageLog
          entries={[]}
          loading={true}
        />
      );

      expect(screen.getByText('Loading message history...')).toBeInTheDocument();
      expect(screen.getByTestId('message-log-loading')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('shows error state', () => {
      render(
        <MessageLog
          entries={[]}
          error='Failed to load messages'
        />
      );

      expect(screen.getByText(/Failed to load message history/i)).toBeInTheDocument();
      expect(screen.getByTestId('message-log-error')).toBeInTheDocument();
    });

    it('limits entries to maxEntries', () => {
      render(
        <MessageLog
          entries={mockEntries}
          maxEntries={2}
        />
      );

      expect(screen.getByText(/2 of 4 shown/)).toBeInTheDocument();
    });
  });

  describe('SendMessagePanel Component Integration', () => {
    const mockRecipients: Recipient[] = [
      {
        id: 'rec-001',
        name: 'Rahul Sharma',
        role: 'applicant',
        contact: {
          sms: '+91 98765 43210',
          whatsapp: '+91 98765 43210',
          email: 'rahul.sharma@email.com',
        },
      },
    ];

    it('renders all sub-components', () => {
      render(
        <SendMessagePanel
          isOpen={true}
          onClose={vi.fn()}
          onSend={vi.fn()}
          recipients={mockRecipients}
          templates={DEFAULT_TEMPLATES}
        />
      );

      expect(screen.getByTestId('recipient-selector')).toBeInTheDocument();
      expect(screen.getByText(/Message Template/i)).toBeInTheDocument();
      expect(screen.getByText(/Message Content/i)).toBeInTheDocument();
      expect(screen.getByTestId('message-preview')).toBeInTheDocument();
    });

    it('shows context summary when showContextWarning is true', () => {
      render(
        <SendMessagePanel
          isOpen={true}
          onClose={vi.fn()}
          onSend={vi.fn()}
          recipients={mockRecipients}
          templates={DEFAULT_TEMPLATES}
          context={{
            trackingNumber: 'APP-2024-001',
            status: 'Under Review',
            vertical: 'Boys Hostel',
          }}
          showContextWarning={true}
        />
      );

      expect(screen.getByText('APP-2024-001')).toBeInTheDocument();
      expect(screen.getByText('Under Review')).toBeInTheDocument();
      expect(screen.getByText('Boys Hostel')).toBeInTheDocument();
    });

    it('validates missing recipient', async () => {
      const handleSend = vi.fn().mockResolvedValue(undefined);

      render(
        <SendMessagePanel
          isOpen={true}
          onClose={vi.fn()}
          onSend={handleSend}
          recipients={mockRecipients}
          templates={DEFAULT_TEMPLATES}
          defaultRecipientId=''
          defaultChannels={[]}
        />
      );

      await act(async () => {
        fireEvent.click(screen.getByText('Send Now'));
      });

      expect(screen.getByText('Please select a recipient')).toBeInTheDocument();
      expect(handleSend).not.toHaveBeenCalled();
    });

    it('validates missing channels', async () => {
      const handleSend = vi.fn().mockResolvedValue(undefined);

      render(
        <SendMessagePanel
          isOpen={true}
          onClose={vi.fn()}
          onSend={handleSend}
          recipients={mockRecipients}
          templates={DEFAULT_TEMPLATES}
          defaultRecipientId='rec-001'
          defaultChannels={[]}
        />
      );

      await act(async () => {
        fireEvent.click(screen.getByText('Send Now'));
      });

      expect(screen.getByText('Please select at least one channel')).toBeInTheDocument();
      expect(handleSend).not.toHaveBeenCalled();
    });

    it('validates unreplaced variables', async () => {
      const handleSend = vi.fn().mockResolvedValue(undefined);

      render(
        <SendMessagePanel
          isOpen={true}
          onClose={vi.fn()}
          onSend={handleSend}
          recipients={mockRecipients}
          templates={DEFAULT_TEMPLATES}
          defaultRecipientId='rec-001'
          defaultChannels={['sms']}
        />
      );

      const textarea = screen.getByTestId('message-textarea');
      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'Hello {{name}}, {{date}}' } });
        fireEvent.click(screen.getByText('Send Now'));
      });

      await waitFor(() => {
        expect(screen.getByText(/unreplaced variables/i)).toBeInTheDocument();
      }, { timeout: 5000 });
      expect(handleSend).not.toHaveBeenCalled();
    });

    it('successfully sends valid message', async () => {
      const handleSend = vi.fn().mockResolvedValue(undefined);

      render(
        <SendMessagePanel
          isOpen={true}
          onClose={vi.fn()}
          onSend={handleSend}
          recipients={mockRecipients}
          templates={DEFAULT_TEMPLATES}
          defaultRecipientId='rec-001'
          defaultChannels={['sms']}
          context={{
            trackingNumber: 'APP-2024-001',
            status: 'Under Review',
            vertical: 'Boys Hostel',
          }}
        />
      );

      await act(async () => {
        const templateSelect = screen.getByRole('combobox');
        fireEvent.change(templateSelect, { target: { value: 'interview_invitation' } });
        fireEvent.click(screen.getByText('Send Now'));
      });

      await waitFor(() => {
        expect(handleSend).toHaveBeenCalled();
        const sentData = handleSend.mock.calls[0][0] as SendMessageData;
        expect(sentData.recipientId).toBe('rec-001');
        expect(sentData.channels).toEqual(['sms']);
        expect(sentData.templateId).toBe('interview_invitation');
        expect(sentData.message).toContain('{{date}}');
      }, { timeout: 5000 });
    });

    it('shows loading state during send', () => {
      const handleSend = vi.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));

      render(
        <SendMessagePanel
          isOpen={true}
          onClose={vi.fn()}
          onSend={handleSend}
          recipients={mockRecipients}
          templates={DEFAULT_TEMPLATES}
          defaultRecipientId='rec-001'
          defaultChannels={['sms']}
          isLoading={true}
        />
      );

      const sendButton = screen.getByText('Send Now');
      expect(sendButton).toBeDisabled();
    });

    it('shows scheduled button when date/time set', async () => {
      render(
        <SendMessagePanel
          isOpen={true}
          onClose={vi.fn()}
          onSend={vi.fn()}
          recipients={mockRecipients}
          templates={DEFAULT_TEMPLATES}
          defaultRecipientId='rec-001'
          defaultChannels={['sms']}
        />
      );

      await act(async () => {
        const dateInput = screen.getByLabelText(/Date/i);
        fireEvent.change(dateInput, { target: { value: '2024-12-30' } });
        const timeInput = screen.getByLabelText(/Time/i);
        fireEvent.change(timeInput, { target: { value: '09:00' } });
      });

      expect(screen.getByText('Schedule Message')).toBeInTheDocument();
      expect(screen.queryByText('Send Now')).not.toBeInTheDocument();
    });

    it('shows scheduled button when date/time set', () => {
      render(
        <SendMessagePanel
          isOpen={true}
          onClose={vi.fn()}
          onSend={vi.fn()}
          recipients={mockRecipients}
          templates={DEFAULT_TEMPLATES}
          defaultRecipientId='rec-001'
          defaultChannels={['sms']}
        />
      );

      const dateInput = screen.getByLabelText(/Date/i);
      const timeInput = screen.getByLabelText(/Time/i);

      fireEvent.change(dateInput, { target: { value: '2024-12-30' } });
      fireEvent.change(timeInput, { target: { value: '09:00' } });

      expect(screen.getByText('Schedule Message')).toBeInTheDocument();
      expect(screen.queryByText('Send Now')).not.toBeInTheDocument();
    });

    it('closes panel on cancel', async () => {
      const handleClose = vi.fn();

      render(
        <SendMessagePanel
          isOpen={true}
          onClose={handleClose}
          onSend={vi.fn()}
          recipients={mockRecipients}
          templates={DEFAULT_TEMPLATES}
        />
      );

      await act(async () => {
        fireEvent.click(screen.getByText('Cancel'));
      });

      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe('Template System', () => {
    it('includes all required templates', () => {
      const templateIds = DEFAULT_TEMPLATES.map(t => t.id);

      expect(templateIds).toContain('interview_invitation');
      expect(templateIds).toContain('provisional_approval');
      expect(templateIds).toContain('final_approval');
      expect(templateIds).toContain('rejection');
      expect(templateIds).toContain('fee_reminder');
      expect(templateIds).toContain('leave_application');
    });

    it('templates have proper variable declarations', () => {
      const interviewTemplate = DEFAULT_TEMPLATES.find(t => t.id === 'interview_invitation')!;
      expect(interviewTemplate.variables).toContain('date');
      expect(interviewTemplate.variables).toContain('time');
      expect(interviewTemplate.variables).toContain('mode');
      expect(interviewTemplate.variables).toContain('link');

      const feeTemplate = DEFAULT_TEMPLATES.find(t => t.id === 'fee_reminder')!;
      expect(feeTemplate.variables).toContain('fee_name');
      expect(feeTemplate.variables).toContain('amount');
      expect(feeTemplate.variables).toContain('due_date');
    });

    it('templates use correct variable syntax', () => {
      DEFAULT_TEMPLATES.forEach(template => {
        expect(template.content).toMatch(/\{\{[^}]+\}\}/);
      });
    });

    it('templates have descriptive names', () => {
      const names = DEFAULT_TEMPLATES.map(t => t.name);

      expect(names).toContain('Interview Invitation');
      expect(names).toContain('Provisional Approval');
      expect(names).toContain('Final Approval');
      expect(names).toContain('Rejection');
      expect(names).toContain('Fee Reminder');
      expect(names).toContain('Leave Application');
    });
  });

  describe('Accessibility Features', () => {
    it('ChannelToggle has proper ARIA labels', () => {
      const channels = [
        { id: 'sms' as const, label: 'SMS' },
      ];

      render(
        <ChannelToggle
          channels={channels}
          selectedChannels={[]}
          onChange={vi.fn()}
        />
      );

      const button = screen.getByTestId('channel-button-sms');
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('RecipientSelector has proper ARIA labels', () => {
      const recipients: Recipient[] = [
        {
          id: 'rec-001',
          name: 'Rahul Sharma',
          role: 'applicant',
          contact: {
            sms: '+91 98765 43210',
          },
        },
      ];

      render(
        <RecipientSelector
          recipients={recipients}
          selectedRecipientId='rec-001'
          onChange={vi.fn()}
        />
      );

      const label = screen.getByTestId('recipient-selector-label');
      expect(label).toBeInTheDocument();
    });

    it('MessageLog has proper status announcements', () => {
      const entries: MessageLogEntry[] = [
        {
          id: 'log-001',
          recipient: {
            id: 'rec-001',
            name: 'Rahul Sharma',
            role: 'applicant',
          },
          channels: ['sms'],
          message: 'Test',
          status: 'SENT',
          sentAt: '2024-12-28T10:00:00Z',
          sentBy: {
            id: 'sup-001',
            name: 'John',
            role: 'Superintendent',
          },
          auditLogId: 'AUD-001',
        },
      ];

      render(
        <MessageLog
          entries={entries}
        />
      );

      const entry = screen.getByTestId('message-log-entry-log-001');
      expect(entry).toBeInTheDocument();
      expect(entry).toHaveAttribute('data-status', 'SENT');
    });
  });

  describe('Edge Cases', () => {
    it('handles very long messages gracefully', () => {
      const veryLongMessage = 'A'.repeat(10000);

      render(
        <MessagePreview
          message={veryLongMessage}
          variables={{}}
          channel='email'
        />
      );

      const textarea = screen.getByText('Test').nextElementSibling as HTMLElement;
      expect(textarea).toBeInTheDocument();
      expect(textarea?.textContent).toHaveLength(10000);
    });

    it('handles special characters in message', () => {
      const specialMessage = 'Hello @user! #hashtag $money %percent &amp;';

      render(
        <MessagePreview
          message={specialMessage}
          variables={{}}
          channel='sms'
        />
      );

      expect(screen.getByText(/@user/)).toBeInTheDocument();
      expect(screen.getByText(/#hashtag/)).toBeInTheDocument();
      expect(screen.getByText(/\$money/)).toBeInTheDocument();
    });

    it('handles unicode characters', () => {
      const unicodeMessage = 'Hello 👋🌍🎉';

      render(
        <MessagePreview
          message={unicodeMessage}
          variables={{}}
          channel='whatsapp'
        />
      );

      expect(screen.getByText('👋')).toBeInTheDocument();
      expect(screen.getByText('🌍')).toBeInTheDocument();
      expect(screen.getByText('🎉')).toBeInTheDocument();
    });

    it('handles empty recipient list gracefully', () => {
      render(
        <RecipientSelector
          recipients={[]}
          selectedRecipientId=''
          onChange={vi.fn()}
        />
      );

      expect(screen.getByText(/No recipients available/i)).toBeInTheDocument();
    });

    it('handles empty message log gracefully', () => {
      render(
        <MessageLog
          entries={[]}
          emptyMessage='No messages found'
        />
      );

      expect(screen.getByText('📭')).toBeInTheDocument();
      expect(screen.getByText('No messages found')).toBeInTheDocument();
    });
  });

  describe('User Workflow Scenarios', () => {
    it('complete message sending workflow', async () => {
      const handleSend = vi.fn().mockResolvedValue(undefined);
      const recipients: Recipient[] = [
        {
          id: 'rec-001',
          name: 'Rahul Sharma',
          role: 'applicant',
          contact: {
            sms: '+91 98765 43210',
            email: 'rahul.sharma@email.com',
          },
        },
      ];

      render(
        <SendMessagePanel
          isOpen={true}
          onClose={vi.fn()}
          onSend={handleSend}
          recipients={recipients}
          templates={DEFAULT_TEMPLATES}
          context={{
            trackingNumber: 'APP-2024-001',
            status: 'Under Review',
            vertical: 'Boys Hostel',
          }}
        />
      );

      // Step 1: Verify context displayed
      expect(screen.getByText('APP-2024-001')).toBeInTheDocument();

      // Step 2: Verify recipient selected
      expect(screen.getByText('Rahul Sharma')).toBeInTheDocument();

      // Step 3: Select channels
      fireEvent.click(screen.getByText('SMS'));
      fireEvent.click(screen.getByText('Email'));

      // Step 4: Select template
      const templateSelect = screen.getByRole('combobox');
      fireEvent.change(templateSelect, { target: { value: 'interview_invitation' } });

      // Step 5: Verify template loaded
      const textarea = screen.getByPlaceholderText(/Type your message/i);
      expect(textarea.value).toContain('{{date}}');

      // Step 6: Send message
      fireEvent.click(screen.getByText('Send Now'));

      // Step 7: Verify send called with correct data
      await waitFor(() => {
        expect(handleSend).toHaveBeenCalled();
        const sentData = handleSend.mock.calls[0][0] as SendMessageData;
        expect(sentData.recipientId).toBe('rec-001');
        expect(sentData.channels).toEqual(['sms', 'email']);
        expect(sentData.templateId).toBe('interview_invitation');
      });
    });

    it('scheduled message workflow', async () => {
      const handleSend = vi.fn().mockResolvedValue(undefined);
      const recipients: Recipient[] = [
        {
          id: 'rec-001',
          name: 'Rahul Sharma',
          role: 'applicant',
          contact: {
            sms: '+91 98765 43210',
          },
        },
      ];

      render(
        <SendMessagePanel
          isOpen={true}
          onClose={vi.fn()}
          onSend={handleSend}
          recipients={recipients}
          templates={DEFAULT_TEMPLATES}
          defaultRecipientId='rec-001'
          defaultChannels={['sms']}
        />
      );

      // Set schedule date
      const dateInput = screen.getByLabelText(/Date/i);
      fireEvent.change(dateInput, { target: { value: '2024-12-30' } });

      // Set schedule time
      const timeInput = screen.getByLabelText(/Time/i);
      fireEvent.change(timeInput, { target: { value: '09:00' } });

      // Verify button text changed
      expect(screen.getByText('Schedule Message')).toBeInTheDocument();

      // Send
      fireEvent.click(screen.getByText('Schedule Message'));

      await waitFor(() => {
        expect(handleSend).toHaveBeenCalled();
        const sentData = handleSend.mock.calls[0][0] as SendMessageData;
        expect(sentData.schedule?.date).toBe('2024-12-30');
        expect(sentData.schedule?.time).toBe('09:00');
      });
    });

    it('escalation workflow', async () => {
      const handleSelect = vi.fn();
      const supervisors: Supervisor[] = [
        {
          id: 'sup-001',
          name: 'Jane Doe',
          role: 'trustee',
          available: true,
        },
        {
          id: 'sup-002',
          name: 'Robert Wilson',
          role: 'accounts',
          available: true,
        },
      ];

      render(
        <EscalationSelector
          supervisors={supervisors}
          onSelect={handleSelect}
          context='Urgent: Overdue fee requires attention'
        />
      );

      // Step 1: Select supervisor
      fireEvent.click(screen.getByText('Jane Doe'));
      expect(handleSelect).toHaveBeenCalledWith('sup-001');

      // Step 2: Confirm escalation
      fireEvent.click(screen.getByText('Confirm Escalation'));

      // Step 3: Enter reason
      await waitFor(() => {
        const reasonTextarea = screen.getByPlaceholderText(/Provide context/i);
        expect(reasonTextarea).toBeInTheDocument();

        fireEvent.change(reasonTextarea, {
          target: { value: 'Urgent: Fee overdue by 7 days' },
        });
      });

      // Step 4: Save reason
      fireEvent.click(screen.getByText('Save Reason'));

      await waitFor(() => {
        expect(screen.queryByText(/Provide context/i)).not.toBeInTheDocument();
      });
    });

    it('message log filtering workflow', () => {
      const entries: MessageLogEntry[] = [
        {
          id: 'log-001',
          recipient: {
            id: 'rec-001',
            name: 'Rahul Sharma',
            role: 'applicant',
          },
          channels: ['sms'],
          message: 'Test 1',
          status: 'SENT',
          sentAt: '2024-12-28T10:00:00Z',
          sentBy: {
            id: 'sup-001',
            name: 'John',
            role: 'Superintendent',
          },
          auditLogId: 'AUD-001',
        },
        {
          id: 'log-002',
          recipient: {
            id: 'rec-002',
            name: 'Priya Patel',
            role: 'applicant',
          },
          channels: ['email'],
          message: 'Test 2',
          status: 'FAILED',
          sentAt: '2024-12-27T10:00:00Z',
          sentBy: {
            id: 'sup-002',
            name: 'Jane',
            role: 'Superintendent',
          },
          auditLogId: 'AUD-002',
        },
      ];

      render(
        <MessageLog
          entries={entries}
        />
      );

      // Initial: All messages shown
      expect(screen.getByText('Rahul Sharma')).toBeInTheDocument();
      expect(screen.getByText('Priya Patel')).toBeInTheDocument();

      // Filter by SENT status
      const filter = screen.getByRole('combobox');
      fireEvent.change(filter, { target: { value: 'SENT' } });

      // Only SENT message shown
      expect(screen.getByText('Rahul Sharma')).toBeInTheDocument();
      expect(screen.queryByText('Priya Patel')).not.toBeInTheDocument();

      // Filter by FAILED status
      fireEvent.change(filter, { target: { value: 'FAILED' } });

      // Only FAILED message shown
      expect(screen.queryByText('Rahul Sharma')).not.toBeInTheDocument();
      expect(screen.getByText('Priya Patel')).toBeInTheDocument();
    });
  });
});
