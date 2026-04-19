'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';

type LoginFormData = {
  username: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Simulate API call - replace with actual API endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const responseBody = await response.json();

      if (response.ok) {
        const { data } = responseBody;

        // Store auth token in localStorage for API calls
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('userRole', data.role);
          localStorage.setItem('userId', data.userId);
        }

        // Check if first-time login
        if (data.requiresPasswordChange) {
          router.push(`/login/first-time-setup?token=${data.token}`);
        } else {
          // Role-based redirection
          const redirectPath = getRoleRedirectPath(data.role);
          router.push(redirectPath);
        }
      } else {
        setError(responseBody.error || t('Invalid credentials or account not found', 'अमान्य प्रमाण-पत्र या खाता नहीं मिला'));
      }
    } catch (err) {
      setError(t('Unable to connect. Please try again later.', 'कनेक्ट करने में असमर्थ। कृपया बाद में पुनः प्रयास करें।'));
    } finally {
      setLoading(false);
    }
  };

  const getRoleRedirectPath = (role: string): string => {
    switch (role.toUpperCase()) {
      case 'STUDENT':
        return '/dashboard/student';
      case 'SUPERINTENDENT':
        return '/dashboard/superintendent';
      case 'TRUSTEE':
        return '/dashboard/trustee';
      case 'ACCOUNTS':
        return '/dashboard/accounts';
      case 'PARENT':
        return '/dashboard/parent';
      default:
        return '/';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
      <div className="w-full max-w-md mx-auto p-6">
        {/* Language Toggle */}
        <div className="flex justify-end mb-4">
          <LanguageToggle />
        </div>

        {/* Header with branding */}
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="Seth Hirachand Gumanji Jain Hostel"
            className="h-16 w-auto mx-auto mb-4"
          />
          <h1
            className="text-heading-1 mb-2"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}
          >
            {t('Welcome Back', 'पुनः स्वागत है')}
          </h1>
          <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
            {t('Sign in to access your dashboard', 'अपने डैशबोर्ड तक पहुँचने के लिए साइन इन करें')}
          </p>
        </div>

        {/* Role Selection Indicator */}
        <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--surface-secondary)' }}>
          <p className="text-body-sm text-center" style={{ color: 'var(--text-secondary)' }}>
            <strong>{t('Note:', 'नोट:')}</strong> {t('Login is available for Students, Superintendents, Trustees, Accounts, and Parents. Please use the credentials shared with you.', 'लॉगिन छात्रों, अधीक्षकों, ट्रस्टियों, लेखा और अभिभावकों के लिए उपलब्ध है। कृपया आपके साथ साझा किए गए प्रमाण-पत्रों का उपयोग करें।')}
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-4 rounded-md bg-red-50 border-l-4" style={{ borderLeftColor: 'var(--color-red-500)' }}>
            <p className="text-body-sm" style={{ color: 'var(--color-red-700)' }}>
              {error}
            </p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username/Email/Mobile Field */}
          <Input
            type="text"
            label={t('Username, Email, or Mobile Number', 'उपयोगकर्ता नाम, ईमेल, या मोबाइल नंबर')}
            placeholder={t('Enter your username, email, or mobile', 'अपना उपयोगकर्ता नाम, ईमेल, या मोबाइल दर्ज करें')}
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            autoFocus
            autoComplete="username"
          />

          {/* Password Field */}
          <Input
            type="password"
            label={t('Password', 'पासवर्ड')}
            placeholder={t('Enter your password', 'अपना पासवर्ड दर्ज करें')}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            autoComplete="current-password"
          />

          {/* Forgot Password Link */}
          <div className="text-center">
            <Link
              href="/login/forgot-password"
              className="text-sm hover:underline"
              style={{ color: 'var(--text-link)' }}
            >
              {t('Forgot Password?', 'पासवर्ड भूल गए?')}
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            {loading ? t('Signing in...', 'साइन इन हो रहा है...') : t('Sign In', 'साइन इन')}
          </Button>

        {/* Parent/Guardian Login Link */}
        <div className="text-center pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
          <p className="text-body-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            {t('Are you a parent/guardian?', 'क्या आप अभिभावक हैं?')}
          </p>
          <Link
            href="/login/parent"
            className="text-sm font-medium hover:underline"
            style={{ color: 'var(--text-link)' }}
          >
            {t('Use OTP-based Parent Login →', 'OTP-आधारित अभिभावक लॉगिन का उपयोग करें →')}
          </Link>
        </div>
        </form>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-body-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            {t('← Back to Home', '← होम पर वापस जाएँ')}
          </Link>
        </div>

        {/* Institutional Rules Notice */}
        <div className="mt-8 p-4 rounded-lg border" style={{ borderColor: 'var(--border-primary)' }}>
          <h3 className="text-heading-4 mb-2" style={{ color: 'var(--text-primary)' }}>
            {t('Institutional Usage Rules', 'संस्थागत उपयोग नियम')}
          </h3>
          <ul className="space-y-2 text-body-sm" style={{ color: 'var(--text-secondary)' }}>
            <li>• {t('This system is for authorized use only', 'यह प्रणाली केवल अधिकृत उपयोग के लिए है')}</li>
            <li>• {t('All login attempts are logged for security purposes', 'सभी लॉगिन प्रयास सुरक्षा उद्देश्यों के लिए लॉग किए जाते हैं')}</li>
            <li>• {t('Immediate report of unauthorized access is required', 'अनधिकृत पहुँच की तुरंत रिपोर्ट करना आवश्यक है')}</li>
            <li>• {t('Password must be kept confidential and not shared', 'पासवर्ड गोपनीय रखा जाना चाहिए और साझा नहीं किया जाना चाहिए')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
