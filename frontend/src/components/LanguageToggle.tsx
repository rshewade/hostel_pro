'use client';

import { Globe } from 'lucide-react';
import { Button } from '@/components/shadcn/button-extended';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Language toggle button (EN/HI).
 * Drop into any header to enable language switching.
 */
export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
      className="gap-1"
    >
      <Globe className="h-4 w-4" />
      <span className="hidden sm:inline">{language === 'en' ? 'हिंदी' : 'English'}</span>
      <span className="sm:hidden">{language === 'en' ? 'हि' : 'EN'}</span>
    </Button>
  );
}
