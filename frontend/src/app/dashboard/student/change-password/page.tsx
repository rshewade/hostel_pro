'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/shadcn/button-extended';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ChangePasswordPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.newPassword !== form.confirmPassword) {
      setError(t('New passwords do not match', 'नए पासवर्ड मेल नहीं खाते'));
      return;
    }

    if (form.newPassword.length < 8) {
      setError(t('New password must be at least 8 characters', 'नया पासवर्ड कम से कम 8 अक्षर का होना चाहिए'));
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setError(data.error || t('Failed to change password', 'पासवर्ड बदलने में विफल'));
      }
    } catch {
      setError(t('Unable to connect. Please try again.', 'कनेक्ट करने में असमर्थ। पुनः प्रयास करें।'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          {t('Change Password', 'पासवर्ड बदलें')}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          {t('Update your account password', 'अपना खाता पासवर्ड अपडेट करें')}
        </p>
      </div>

      <div className="bg-white rounded-lg border p-6" style={{ borderColor: 'var(--border-primary)' }}>
        {success ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-medium text-green-700">
              {t('Password changed successfully!', 'पासवर्ड सफलतापूर्वक बदल दिया गया!')}
            </p>
            <Button variant="primary" onClick={() => router.push('/dashboard/student')}>
              {t('Back to Dashboard', 'डैशबोर्ड पर जाएं')}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded border-l-4 bg-red-50" style={{ borderColor: 'var(--color-red-500)' }}>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                {t('Current Password', 'वर्तमान पासवर्ड')} <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                required
                autoComplete="current-password"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-page)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                {t('New Password', 'नया पासवर्ड')} <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                required
                autoComplete="new-password"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-page)', color: 'var(--text-primary)' }}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('Min 8 characters with uppercase, lowercase, number & special character (!@#$%^&*)', 'न्यूनतम 8 अक्षर, बड़ा अक्षर, छोटा अक्षर, संख्या और विशेष वर्ण (!@#$%^&*)')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                {t('Confirm New Password', 'नया पासवर्ड पुनः दर्ज करें')} <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
                autoComplete="new-password"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-page)', color: 'var(--text-primary)' }}
              />
              {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">
                  {t('Passwords do not match', 'पासवर्ड मेल नहीं खाते')}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="primary" loading={loading} disabled={loading}>
                {loading ? t('Changing...', 'बदला जा रहा है...') : t('Change Password', 'पासवर्ड बदलें')}
              </Button>
              <Button type="button" variant="secondary" onClick={() => router.push('/dashboard/student')}>
                {t('Cancel', 'रद्द करें')}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
