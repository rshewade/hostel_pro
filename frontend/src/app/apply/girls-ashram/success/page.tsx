'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, FileText, Home, ArrowRight } from 'lucide-react';
import { Button } from '@/components/shadcn/button-extended';
import { Suspense } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

function SuccessContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const trackingNumber = searchParams.get('trackingNumber') || 'N/A';

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <header
        className="px-6 py-4 border-b"
        style={{
          backgroundColor: 'var(--surface-primary)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
                {t('Hirachand Gumanji Family', 'हीराचंद गुमानजी परिवार')}</h1>
              <p className="text-caption">{t('Charitable Trust', 'चैरिटेबल ट्रस्ट')}</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="nav-link">{t('Home', 'होम')}</Link>
            <Link href="/apply" className="nav-link">{t('Apply Now', 'अभी आवेदन करें')}</Link>
            <Link href="/track" className="nav-link">{t('Check Status', 'स्थिति जांचें')}</Link>
          </nav>
        </div>
      </header>

      <main className="px-6 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: 'var(--color-green-100)' }}
          >
            <CheckCircle className="w-10 h-10" style={{ color: 'var(--color-green-600)' }} />
          </div>

          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            {t('Application Submitted Successfully!', 'आवेदन सफलतापूर्वक जमा हो गया!')}</h1>

          <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
            {t('Your application for Girls Ashram has been received. We will review your application and contact you soon.', 'बालिका आश्रम के लिए आपका आवेदन प्राप्त हो गया है। हम आपके आवेदन की समीक्षा करेंगे और जल्द ही संपर्क करेंगे।')}</p>

          <div
            className="p-6 rounded-lg mb-8"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              border: '1px solid var(--border-primary)'
            }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <FileText className="w-5 h-5" style={{ color: 'var(--color-blue-600)' }} />
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {t('Your Tracking Number', 'आपका ट्रैकिंग नंबर')}</span>
            </div>
            <div
              className="text-2xl font-bold font-mono p-4 rounded"
              style={{
                backgroundColor: 'var(--surface-primary)',
                color: 'var(--color-blue-600)'
              }}
            >
              {trackingNumber}
            </div>
            <p className="mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {t('Please save this tracking number. You will need it to check your application status.', 'कृपया यह ट्रैकिंग नंबर सहेजें। आपको अपने आवेदन की स्थिति जांचने के लिए इसकी आवश्यकता होगी।')}</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {t('What happens next?', 'आगे क्या होगा?')}</h3>
            <ol className="text-left space-y-3 max-w-md mx-auto">
              <li className="flex items-start gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-blue-100)', color: 'var(--color-blue-600)' }}
                >
                  1
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {t('Our team will review your application within 3-5 business days.', 'हमारी टीम 3-5 कार्य दिवसों में आपके आवेदन की समीक्षा करेगी।')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-blue-100)', color: 'var(--color-blue-600)' }}
                >
                  2
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {t('You will receive an SMS/email notification about your interview schedule.', 'आपको साक्षात्कार कार्यक्रम के बारे में एसएमएस/ईमेल सूचना प्राप्त होगी।')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-blue-100)', color: 'var(--color-blue-600)' }}
                >
                  3
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {t('After the interview, you will be notified of the final decision.', 'साक्षात्कार के बाद, आपको अंतिम निर्णय की सूचना दी जाएगी।')}</span>
              </li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href={`/track/${trackingNumber}`}>
              <Button variant="primary">
                {t('Track Application', 'आवेदन ट्रैक करें')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/">
              <Button variant="secondary">
                <Home className="w-4 h-4 mr-2" />
                {t('Back to Home', 'होम पर वापस जाएं')}</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
