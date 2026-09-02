"use client";

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { Phone, Mail, MapPin, Heart } from 'lucide-react';

const PublicFooter = () => {
  const { t } = useLanguage();

  const quickLinks = [
    { path: '/about', label: t('About Us', 'हमारे बारे में') },
    { path: '/institutions/boys-hostel', label: t("Boys' Hostel", 'बालक छात्रावास') },
    { path: '/institutions/girls-hostel', label: t("Girls' Hostel", 'बालिका छात्रावास') },
    { path: '/institutions/dharamshala', label: t('Dharamshala', 'धर्मशाला') },
    { path: '/donations', label: t('Donate', 'दान करें') },
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold">&#x0950;</span>
              </div>
              <div>
                <h3 className="font-heading font-bold">
                  {t('Seth Hirachand Gumanji', 'सेठ हीराचंद गुमानजी')}
                </h3>
                <p className="text-sm text-primary-foreground/70">
                  {t('Jain Trust, Mumbai', 'जैन ट्रस्ट, मुंबई')}
                </p>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              {t(
                'Serving the Jain community through education, shelter, and spiritual welfare since 1940.',
                'शिक्षा, आश्रय और आध्यात्मिक कल्याण के माध्यम से 1940 से जैन समुदाय की सेवा में।'
              )}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold mb-4">
              {t('Quick Links', 'त्वरित लिंक')}
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold mb-4">
              {t('Contact Us', 'संपर्क करें')}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-primary-foreground/80">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  {t(
                    '148, Lamington Road, Opp. Navjivan Society, Grant Road (E), Mumbai, Maharashtra – 400007',
                    '148, लेमिंग्टन रोड, नवजीवन सोसायटी के सामने, ग्रांट रोड (पूर्व), मुंबई, महाराष्ट्र – 400007'
                  )}
                </span>
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/80">
                <Phone className="h-4 w-4 shrink-0" />
                <span>+91 22 2414 1234</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/80">
                <Mail className="h-4 w-4 shrink-0" />
                <span>info@shgjaintrust.org</span>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-heading font-semibold mb-4">
              {t('Support Our Mission', 'हमारे मिशन का समर्थन करें')}
            </h4>
            <p className="text-sm text-primary-foreground/80 mb-4">
              {t(
                'Your generous donations help us continue our service to the community.',
                'आपका उदार दान हमें समुदाय की सेवा जारी रखने में मदद करता है।'
              )}
            </p>
            <Link
              href="/donations"
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              <Heart className="h-4 w-4" />
              {t('Donate Now', 'अभी दान करें')}
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/70">
            <p>
              &copy; {new Date().getFullYear()} {t('Seth Hirachand Gumanji Jain Trust. All rights reserved.', 'सेठ हीराचंद गुमानजी जैन ट्रस्ट। सर्वाधिकार सुरक्षित।')}
            </p>
            <div className="flex items-center gap-4">
              <Link href="/faq" className="hover:text-primary-foreground transition-colors">
                {t('FAQ', 'सामान्य प्रश्न')}
              </Link>
              <Link href="/facilities" className="hover:text-primary-foreground transition-colors">
                {t('Rules & Regulations', 'नियम और विनियम')}
              </Link>
              <Link href="/privacy-policy" className="hover:text-primary-foreground transition-colors">
                {t('Privacy Policy', 'गोपनीयता नीति')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
