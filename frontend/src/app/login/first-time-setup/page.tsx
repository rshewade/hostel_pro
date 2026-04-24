'use client';

import { useState, useId, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input } from '@/components';
import { Checkbox } from '@/components/forms/Checkbox';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';

type PasswordChangeFormData = {
  newPassword: string;
  confirmPassword: string;
};

function FirstTimeSetupContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [formData, setFormData] = useState<PasswordChangeFormData>({
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dpdpConsent, setDpdpConsent] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordStrength = {
    hasMinLength: formData.newPassword.length >= 8,
    hasUpperCase: /[A-Z]/.test(formData.newPassword),
    hasLowerCase: /[a-z]/.test(formData.newPassword),
    hasNumber: /[0-9]/.test(formData.newPassword),
    hasSpecialChar: /[!@#$%^&*]/.test(formData.newPassword),
  };

  const getPasswordStrength = () => {
    const criteriaMet = Object.values(passwordStrength).filter(Boolean).length;
    if (criteriaMet <= 2) return { label: t('Weak', 'कमज़ोर'), color: 'bg-red-50 text-red-700' };
    if (criteriaMet <= 3) return { label: t('Fair', 'ठीक'), color: 'bg-yellow-50 text-yellow-700' };
    return { label: t('Strong', 'मज़बूत'), color: 'bg-green-50 text-green-700' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validate password match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate DPDP consent
    if (!dpdpConsent) {
      setError('Please accept the DPDP consent to continue');
      return;
    }

    // Validate password strength
    if (strength.label === 'Weak') {
      setError('Password does not meet minimum security requirements. Please use a stronger password.');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call - replace with actual API endpoint
      const response = await fetch('/api/auth/first-time-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword: formData.newPassword,
          dpdpConsent,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(true);
        // Store auth token in localStorage for API calls
        // The token is available from URL params
        if (token) {
          localStorage.setItem('authToken', token);
          // Decode JWT payload to get user info
          try {
            const payload = token.split('.')[1];
            const padded = payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(payload.length / 4) * 4, '=');
            const tokenData = JSON.parse(atob(padded));
            localStorage.setItem('userRole', tokenData.role || '');
            localStorage.setItem('userId', tokenData.sub || tokenData.userId || '');
          } catch (e) {
            console.error('Error decoding token:', e);
          }
        }
        // Auto-redirect after 2 seconds
        // API returns { success: true, data: { role: '...' } }
        const role = result.data?.role || result.role;
        setTimeout(() => {
          const redirectPath = getRoleRedirectPath(role);
          router.push(redirectPath);
        }, 2000);
      } else {
        setError(result.error || result.message || 'Failed to update password. Please try again.');
      }
    } catch (err) {
      setError('Unable to connect. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleRedirectPath = (role: string | undefined): string => {
    if (!role) return '/dashboard/student'; // Default fallback
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

  const newPasswordId = useId();
  const confirmPasswordId = useId();

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <div className="w-full max-w-md mx-auto p-6">
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ background: 'var(--bg-accent)' }}
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: 'var(--text-on-accent)' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L17 11m-0 0l-6 0m6 5a2 2 0 002 2h3a2 2 0 002-2V7a2 2 0 00-2 2h-2m2 5a2 2 0 012 2h5a2 2 0 012 2z"
                />
              </svg>
            </div>
            <h1
              className="text-heading-1 mb-2"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}
            >
              {t('Password Updated Successfully', 'पासवर्ड सफलतापूर्वक अपडेट हुआ')}
            </h1>
            <p className="text-body mb-6" style={{ color: 'var(--text-secondary)' }}>
              {t('You will be redirected to your dashboard shortly...', 'आपको शीघ्र ही आपके डैशबोर्ड पर भेज दिया जाएगा...')}
            </p>
            <div className="w-16 h-1 mx-auto mb-6" style={{ background: 'var(--color-green-500)' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8" style={{ background: 'var(--bg-page)' }}>
      <div className="w-full max-w-md mx-auto">
        {/* Language Toggle */}
        <div className="flex justify-end mb-4 px-6">
          <LanguageToggle />
        </div>

        {/* Header */}
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
            {t('First-Time Password Change', 'पहली बार पासवर्ड बदलें')}
          </h1>
          <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
            {t('For security purposes, please set a new password before accessing your account', 'सुरक्षा के लिए, कृपया अपने खाते तक पहुंचने से पहले एक नया पासवर्ड सेट करें')}
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

        {/* Password Change Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password Field */}
          <Input
            id={newPasswordId}
            type="password"
            label={t('New Password', 'नया पासवर्ड')}
            placeholder={t('Enter your new password', 'अपना नया पासवर्ड दर्ज करें')}
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            required
            autoComplete="new-password"
            helperText={t('Minimum 8 characters with mix of uppercase, lowercase, numbers, and special characters', 'न्यूनतम 8 अक्षर जिसमें बड़े, छोटे अक्षर, संख्याएं और विशेष वर्ण शामिल हों')}
          />

          {/* Confirm Password Field */}
          <Input
            id={confirmPasswordId}
            type="password"
            label={t('Confirm New Password', 'नया पासवर्ड पुनः दर्ज करें')}
            placeholder={t('Re-enter your new password', 'अपना नया पासवर्ड दोबारा दर्ज करें')}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
            autoComplete="new-password"
            error={formData.newPassword !== formData.confirmPassword && formData.confirmPassword ? t('Passwords do not match', 'पासवर्ड मेल नहीं खाते') : undefined}
          />

          {/* Password Strength Indicator */}
          {formData.newPassword && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-body-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {t('Password Strength', 'पासवर्ड की मज़बूती')}
                </span>
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: strength.color }}
                >
                  {strength.label}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-body-sm">
                  <span className={passwordStrength.hasMinLength ? 'text-green-600' : 'text-gray-400'}>
                    {passwordStrength.hasMinLength ? '✓' : '○'}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>{t('Minimum 8 characters', 'न्यूनतम 8 अक्षर')}</span>
                </div>
                <div className="flex items-center gap-2 text-body-sm">
                  <span className={passwordStrength.hasUpperCase ? 'text-green-600' : 'text-gray-400'}>
                    {passwordStrength.hasUpperCase ? '✓' : '○'}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>{t('One uppercase letter', 'एक बड़ा अक्षर')}</span>
                </div>
                <div className="flex items-center gap-2 text-body-sm">
                  <span className={passwordStrength.hasLowerCase ? 'text-green-600' : 'text-gray-400'}>
                    {passwordStrength.hasLowerCase ? '✓' : '○'}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>{t('One lowercase letter', 'एक छोटा अक्षर')}</span>
                </div>
                <div className="flex items-center gap-2 text-body-sm">
                  <span className={passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-400'}>
                    {passwordStrength.hasNumber ? '✓' : '○'}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>{t('One number', 'एक संख्या')}</span>
                </div>
                <div className="flex items-center gap-2 text-body-sm">
                  <span className={passwordStrength.hasSpecialChar ? 'text-green-600' : 'text-gray-400'}>
                    {passwordStrength.hasSpecialChar ? '✓' : '○'}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>{t('One special character (!@#$%^&*)', 'एक विशेष वर्ण (!@#$%^&*)')}</span>
                </div>
              </div>
            </div>
          )}

          {/* DPDP Consent Checkbox */}
          <div className="p-4 rounded-lg mb-4" style={{ background: 'var(--surface-secondary)' }}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Checkbox
                  checked={dpdpConsent}
                  onChange={(e) => setDpdpConsent(e.target.checked)}
                  required
                />
              </div>
              <div className="flex-1">
                <span className="text-body font-medium mb-1 block" style={{ color: 'var(--text-primary)' }}>
                  {t('I accept the Data Protection and Privacy Principles', 'मैं डेटा सुरक्षा और गोपनीयता सिद्धांत स्वीकार करता/करती हूं')}
                </span>
                <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                  {t('I consent to the collection, storage, and processing of my personal data as per the Digital Personal Data Protection (DPDP) Act. I understand that my data will be used for hostel management purposes and that I can withdraw this consent at any time.', 'मैं डिजिटल व्यक्तिगत डेटा सुरक्षा (DPDP) अधिनियम के अनुसार अपने व्यक्तिगत डेटा के संग्रह, भंडारण और प्रसंस्करण के लिए सहमति देता/देती हूं। मैं समझता/समझती हूं कि मेरे डेटा का उपयोग छात्रावास प्रबंधन के उद्देश्यों के लिए किया जाएगा और मैं किसी भी समय यह सहमति वापस ले सकता/सकती हूं।')}
                </p>
                <Link
                  href="/dpdp-policy"
                  className="text-sm text-gold-600 hover:underline"
                  target="_blank"
                >
                  {t('Read Full DPDP Policy →', 'पूरी DPDP नीति पढ़ें →')}
                </Link>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            loading={loading}
            disabled={loading || !dpdpConsent || strength.label === 'Weak'}
          >
            {loading ? t('Updating Password...', 'पासवर्ड अपडेट हो रहा है...') : t('Set New Password & Continue', 'नया पासवर्ड सेट करें और जारी रखें')}
          </Button>
        </form>

        {/* Security Information */}
        <div className="mt-8 p-4 rounded-lg border" style={{ borderColor: 'var(--border-primary)' }}>
          <h3 className="text-heading-4 mb-3" style={{ color: 'var(--text-primary)' }}>
            {t('Security Guidelines', 'सुरक्षा दिशानिर्देश')}
          </h3>
          <ul className="space-y-2 text-body-sm" style={{ color: 'var(--text-secondary)' }}>
            <li>• {t('Password must be at least 8 characters long', 'पासवर्ड कम से कम 8 अक्षरों का होना चाहिए')}</li>
            <li>• {t('Include uppercase and lowercase letters, numbers, and special characters', 'बड़े और छोटे अक्षर, संख्याएं और विशेष वर्ण शामिल करें')}</li>
            <li>• {t('Do not use easily guessable information (birthdays, phone numbers)', 'आसानी से अनुमान लगाने योग्य जानकारी (जन्मदिन, फोन नंबर) का उपयोग न करें')}</li>
            <li>• {t('Change your password regularly', 'अपना पासवर्ड नियमित रूप से बदलें')}</li>
            <li>• {t('Never share your password with anyone', 'अपना पासवर्ड कभी किसी के साथ साझा न करें')}</li>
          </ul>
        </div>

        {/* Help Link */}
        <div className="text-center mt-6">
          <Link
            href="/login/help"
            className="text-body-sm"
            style={{ color: 'var(--text-link)' }}
          >
            {t('Need help? Contact Support', 'मदद चाहिए? सहायता से संपर्क करें')}
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

export default function FirstTimeSetupPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <FirstTimeSetupContent />
    </Suspense>
  );
}
