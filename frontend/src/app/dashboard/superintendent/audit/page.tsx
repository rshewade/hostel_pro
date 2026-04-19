'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/shadcn/button-extended';
import { Tabs } from '@/components/data/Tabs';
import { CommunicationLogTable, type CommunicationLogEntry } from '@/components/audit/CommunicationLogTable';
import { ApprovalHistoryTable, type ApprovalHistoryEntry } from '@/components/audit/ApprovalHistoryTable';
import { ConsentLogsView, type ConsentLogEntry } from '@/components/audit/ConsentLogsView';
import { Shield, MessageCircle, FileText, ClipboardList, Download, Bell, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdminAuditLogsPage() {
  const { t } = useLanguage();
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLogEntry[]>([]);
  const [approvalHistory, setApprovalHistory] = useState<ApprovalHistoryEntry[]>([]);
  const [consentLogs, setConsentLogs] = useState<ConsentLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuditData = async () => {
      try {
        setLoading(true);
        const [commRes, auditRes] = await Promise.all([
          fetch('/api/communications'),
          fetch('/api/auditLogs')
        ]);

        if (!commRes.ok || !auditRes.ok) {
          throw new Error('Failed to fetch audit data');
        }

        const commResult = await commRes.json();
        const auditResult = await auditRes.json();

        // Extract data from wrapped response
        const commData = commResult.data || commResult || [];
        const auditData = auditResult.data || auditResult || [];

        // Transform communication logs
        const transformedCommLogs: CommunicationLogEntry[] = (Array.isArray(commData) ? commData : []).map((log: any) => ({
          id: log.id,
          dateTime: log.date_time || log.timestamp || log.created_at,
          sender: log.sender || { name: log.sender_name || 'System', role: log.sender_role || 'SYSTEM' },
          recipients: log.recipients || [],
          channel: log.channel || 'EMAIL',
          status: log.status || 'SENT',
          context: log.context || '',
          message: log.message || log.content || '',
          recipientCount: log.recipient_count || log.recipients?.length || 1,
        }));

        // Transform audit logs into approval history and consent logs
        const transformedApprovals: ApprovalHistoryEntry[] = (Array.isArray(auditData) ? auditData : [])
          .filter((log: any) => log.log_type === 'APPROVAL' || log.entity_type)
          .map((log: any) => ({
            id: log.id,
            dateTime: log.date_time || log.timestamp,
            entityType: log.entity_type,
            entityId: log.entity_id,
            entityTitle: log.entity_title,
            studentId: log.student_id,
            studentName: log.student_name,
            authority: log.authority,
            decision: log.decision,
            previousStatus: log.previous_status,
            newStatus: log.new_status,
            remarks: log.remarks,
            vertical: log.vertical,
          }));

        const transformedConsents: ConsentLogEntry[] = (Array.isArray(auditData) ? auditData : [])
          .filter((log: any) => log.log_type === 'CONSENT' || log.consent_type)
          .map((log: any) => ({
            id: log.id,
            consentType: log.consent_type,
            studentId: log.student_id,
            studentName: log.student_name,
            parentName: log.parent_name,
            timestamp: log.timestamp,
            expiryDate: log.expiry_date,
            method: log.method,
            ipAddress: log.ip_address,
            version: log.version,
            status: log.status,
            context: log.context,
            documentUrl: log.document_url,
          }));

        setCommunicationLogs(transformedCommLogs);
        setApprovalHistory(transformedApprovals);
        setConsentLogs(transformedConsents);
        setError(null);
      } catch (err) {
        console.error('Error fetching audit data:', err);
        setError('Failed to load audit logs. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAuditData();
  }, []);
  const handleExport = () => {};

  const handleViewDetails = (_id: string) => {};

  const handleViewStudent = (_studentId: string) => {};

  const tabs = [
    {
      id: 'communication',
      label: t('Communication Logs', 'संचार लॉग'),
      icon: <MessageCircle className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('Communication Logs', 'संचार लॉग')}</h2>
              <p className="text-sm text-gray-500">
                {t('WhatsApp, SMS, and Email communications across all channels', 'सभी चैनलों पर WhatsApp, SMS, और ईमेल संचार')}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Bell className="w-4 h-4" />
              <span>{communicationLogs.length} entries</span>
            </div>
          </div>
          <CommunicationLogTable
            entries={communicationLogs}
            onExport={handleExport}
            onViewDetails={handleViewDetails}
          />
        </div>
      ),
    },
    {
      id: 'approvals',
      label: t('Approval History', 'अनुमोदन इतिहास'),
      icon: <ClipboardList className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('Approval History', 'अनुमोदन इतिहास')}</h2>
              <p className="text-sm text-gray-500">
                {t('Decisions on applications, leaves, payments, and renewals', 'आवेदन, अवकाश, भुगतान, और नवीनीकरण पर निर्णय')}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FileText className="w-4 h-4" />
              <span>{approvalHistory.length} entries</span>
            </div>
          </div>
          <ApprovalHistoryTable
            entries={approvalHistory}
            onExport={handleExport}
            onViewDetails={handleViewDetails}
          />
        </div>
      ),
    },
    {
      id: 'consents',
      label: t('Consent Logs', 'सहमति लॉग'),
      icon: <Shield className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('Consent & Undertaking Logs', 'सहमति और अंडरटेकिंग लॉग')}</h2>
              <p className="text-sm text-gray-500">
                {t('DPDP, hostel rules, parent consent, and other consent records', 'DPDP, छात्रावास नियम, अभिभावक सहमति, और अन्य सहमति रिकॉर्ड')}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Shield className="w-4 h-4" />
              <span>{consentLogs.length} entries</span>
            </div>
          </div>
          <ConsentLogsView
            entries={consentLogs}
            onExport={handleExport}
            onViewDocument={handleViewDetails}
            onViewStudent={handleViewStudent}
          />
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-900 mx-auto mb-4"></div>
          <p className="text-gray-500">{t('Loading audit logs...', 'लेखा परीक्षा लॉग लोड हो रहे हैं...')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-2">{error}</p>
          <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
            {t('Retry', 'पुनः प्रयास करें')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {t('Audit & Compliance', 'लेखा परीक्षा और अनुपालन')}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {t('Communication, approvals, and consent logs', 'संचार, अनुमोदन, और सहमति लॉग')}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          {t('Export Logs', 'लॉग निर्यात करें')}
        </Button>
      </div>

      {/* Content */}
      <Tabs tabs={tabs} className="mb-6" />
    </div>
  );
}
