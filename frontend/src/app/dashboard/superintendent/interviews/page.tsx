'use client';

import { useState, useEffect, useCallback } from 'react';
import { Badge, type BadgeVariant } from '@/components/shadcn/badge-extended';
import { Button } from '@/components/shadcn/button-extended';
import { Table } from '@/components/data/Table';
import { Spinner } from '@/components/feedback/Spinner';
import type { TableColumn } from '@/components/types';
import { cn } from '@/components/utils';
import { useLanguage } from '@/contexts/LanguageContext';

type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'MISSED' | 'CANCELLED';

interface Interview {
  id: string;
  applicationId: string;
  applicantName: string;
  trackingNumber: string;
  vertical: string;
  scheduleTime: string;
  mode: string;
  status: InterviewStatus;
  trusteeName: string;
  score: number | null;
  internalRemarks: string;
  applicationStatus: string;
}

export default function SuperintendentInterviewsPage() {
  const { t } = useLanguage();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<InterviewStatus | 'ALL'>('ALL');
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

  const fetchInterviews = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/interviews', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch interviews');
      const result = await res.json();
      const data = result.data || result || [];

      const list: Interview[] = (Array.isArray(data) ? data : []).map((item: any) => {
        const app = item.application || {};
        return {
          id: item.id,
          applicationId: item.application_id || app.id || '',
          applicantName: app.applicant_name || app.applicantName || 'Unknown',
          trackingNumber: app.tracking_number || app.trackingNumber || '',
          vertical: app.vertical || '',
          scheduleTime: item.schedule_time || item.scheduleTime || '',
          mode: item.mode || 'IN_PERSON',
          status: (item.status || 'SCHEDULED') as InterviewStatus,
          trusteeName: item.trustee_name || item.trusteeName || 'Not assigned',
          score: item.score || null,
          internalRemarks: item.internal_remarks || item.internalRemarks || '',
          applicationStatus: app.current_status || app.application_status || '',
        };
      });

      setInterviews(list);
    } catch (err: any) {
      setError(err.message || 'Failed to load interviews');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const filtered = interviews.filter(
    (i) => statusFilter === 'ALL' || i.status === statusFilter
  );

  const getStatusVariant = (status: InterviewStatus): BadgeVariant => {
    switch (status) {
      case 'SCHEDULED': return 'warning';
      case 'COMPLETED': return 'success';
      case 'MISSED': return 'error';
      case 'CANCELLED': return 'default';
      default: return 'default';
    }
  };

  const getModeLabel = (mode: string) => {
    const labels: Record<string, string> = {
      IN_PERSON: 'In Person',
      ZOOM: 'Zoom',
      GOOGLE_MEET: 'Google Meet',
      WHATSAPP_VIDEO: 'WhatsApp',
      PHONE_CALL: 'Phone',
    };
    return labels[mode] || mode;
  };

  const columns: TableColumn<Interview>[] = [
    {
      key: 'applicantName',
      header: t('Applicant', 'आवेदक'),
      sortable: true,
      render: (_: any, row: Interview) => (
        <div>
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{row.applicantName}</p>
          <p className="text-xs text-gray-500 font-mono">{row.trackingNumber}</p>
        </div>
      ),
    },
    {
      key: 'scheduleTime',
      header: t('Date & Time', 'तिथि और समय'),
      sortable: true,
      render: (value: string) => {
        if (!value) return <span className="text-gray-400">-</span>;
        const d = new Date(value);
        return (
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
            <p className="text-xs text-gray-500">
              {d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        );
      },
    },
    {
      key: 'mode',
      header: t('Mode', 'माध्यम'),
      render: (value: string) => (
        <span className="text-sm">{getModeLabel(value)}</span>
      ),
    },
    {
      key: 'trusteeName',
      header: t('Trustee', 'ट्रस्टी'),
      render: (value: string) => (
        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{value}</span>
      ),
    },
    {
      key: 'status',
      header: t('Status', 'स्थिति'),
      render: (value: InterviewStatus) => (
        <Badge variant={getStatusVariant(value)} size="sm">
          {value}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: t('Actions', 'कार्रवाई'),
      render: (_: any, row: Interview) => (
        <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedInterview(row); }}>
          {t('View Details', 'विवरण देखें')}
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
        <span className="ml-3" style={{ color: 'var(--text-secondary)' }}>
          {t('Loading interviews...', 'साक्षात्कार लोड हो रहे हैं...')}
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Button variant="secondary" size="sm" onClick={fetchInterviews}>
          {t('Retry', 'पुनः प्रयास')}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {t('Interviews', 'साक्षात्कार')}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {t('Scheduled and completed interviews for your vertical', 'आपके विभाग के निर्धारित और पूर्ण साक्षात्कार')}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchInterviews}>
          {t('Refresh', 'रिफ्रेश')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4" style={{ borderColor: 'var(--border-primary)' }}>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('Scheduled', 'निर्धारित')}</p>
          <p className="text-2xl font-bold text-amber-600">
            {interviews.filter((i) => i.status === 'SCHEDULED').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-4" style={{ borderColor: 'var(--border-primary)' }}>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('Completed', 'पूर्ण')}</p>
          <p className="text-2xl font-bold text-green-600">
            {interviews.filter((i) => i.status === 'COMPLETED').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-4" style={{ borderColor: 'var(--border-primary)' }}>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('Missed', 'छूटे')}</p>
          <p className="text-2xl font-bold text-red-600">
            {interviews.filter((i) => i.status === 'MISSED').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-4" style={{ borderColor: 'var(--border-primary)' }}>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('Total', 'कुल')}</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {interviews.length}
          </p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm font-medium mr-2" style={{ color: 'var(--text-secondary)' }}>
          {t('Status:', 'स्थिति:')}
        </label>
        {(['ALL', 'SCHEDULED', 'COMPLETED', 'MISSED', 'CANCELLED'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2',
              statusFilter === s
                ? 'border-navy-900 bg-navy-900 text-white'
                : 'border-gray-300 text-gray-700 hover:border-gray-400'
            )}
          >
            {s === 'ALL' ? t('All', 'सभी') : s}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-lg" style={{ background: 'var(--surface-primary)' }}>
          <p className="text-gray-600 mb-2">{t('No interviews found', 'कोई साक्षात्कार नहीं मिला')}</p>
          <p className="text-sm text-gray-500">
            {t('Schedule interviews from the Applications page.', 'आवेदन पृष्ठ से साक्षात्कार निर्धारित करें।')}
          </p>
        </div>
      ) : (
        <Table<Interview>
          data={filtered}
          columns={columns}
          density="normal"
          striped={true}
        />
      )}

      {/* Interview Detail Modal */}
      {selectedInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedInterview(null)}>
          <div
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border-primary)' }}>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t('Interview Details', 'साक्षात्कार विवरण')}
              </h2>
              <button onClick={() => setSelectedInterview(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('Applicant', 'आवेदक')}</p>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{selectedInterview.applicantName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('Tracking #', 'ट्रैकिंग #')}</p>
                  <p className="font-mono text-sm" style={{ color: 'var(--text-primary)' }}>{selectedInterview.trackingNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('Vertical', 'विभाग')}</p>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    {selectedInterview.vertical.includes('BOYS') ? 'Boys Hostel' : selectedInterview.vertical.includes('GIRLS') ? 'Girls Ashram' : 'Dharamshala'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('Mode', 'माध्यम')}</p>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{getModeLabel(selectedInterview.mode)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('Scheduled Date', 'निर्धारित तिथि')}</p>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    {selectedInterview.scheduleTime
                      ? new Date(selectedInterview.scheduleTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('Scheduled Time', 'निर्धारित समय')}</p>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    {selectedInterview.scheduleTime
                      ? new Date(selectedInterview.scheduleTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('Trustee', 'ट्रस्टी')}</p>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{selectedInterview.trusteeName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('Interview Status', 'साक्षात्कार स्थिति')}</p>
                  <Badge variant={getStatusVariant(selectedInterview.status)} size="sm">{selectedInterview.status}</Badge>
                </div>
                {selectedInterview.applicationStatus && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('Application Status', 'आवेदन स्थिति')}</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {selectedInterview.applicationStatus.replace(/_/g, ' ')}
                    </p>
                  </div>
                )}
                {selectedInterview.score !== null && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('Score', 'अंक')}</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedInterview.score}</p>
                  </div>
                )}
              </div>
              {selectedInterview.internalRemarks && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('Remarks', 'टिप्पणी')}</p>
                  <p className="text-sm p-3 rounded-lg bg-gray-50 border border-gray-200" style={{ color: 'var(--text-primary)' }}>
                    {selectedInterview.internalRemarks}
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 p-5 border-t" style={{ borderColor: 'var(--border-primary)' }}>
              <Button variant="secondary" size="sm" onClick={() => setSelectedInterview(null)}>
                {t('Close', 'बंद करें')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
