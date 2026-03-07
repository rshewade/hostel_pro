import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.jpg';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  const navItems = [
    { path: '/', label: t('Home', 'होम') },
    { path: '/about', label: t('About Us', 'हमारे बारे में') },
    {
      label: t('Institutions', 'संस्थाएं'),
      children: [
        { path: '/institutions/boys-hostel', label: t("Boys' Hostel", 'बालक छात्रावास') },
        { path: '/institutions/girls-hostel', label: t("Girls' Hostel", 'बालिका छात्रावास') },
        { path: '/institutions/dharamshala', label: t('Dharamshala', 'धर्मशाला') },
      ],
    },
    {
      label: t('Admissions', 'प्रवेश'),
      children: [
        { path: '/admissions/boys-hostel', label: t("Boys' Hostel", 'बालक छात्रावास') },
        { path: '/admissions/girls-hostel', label: t("Girls' Hostel", 'बालिका छात्रावास') },
        { path: '/admissions/dharamshala', label: t('Dharamshala Booking', 'धर्मशाला बुकिंग') },
      ],
    },
    {
      label: t('Alumni', 'पूर्व छात्र'),
      children: [
        { path: '/alumni', label: t('Alumni Home', 'पूर्व छात्र होम') },
        { path: '/alumni/register', label: t('Register', 'रजिस्टर करें') },
        { path: '/alumni/login', label: t('Login', 'लॉगिन') },
        { path: '/alumni/directory', label: t('Directory', 'निर्देशिका') },
        { path: '/alumni/events', label: t('Events', 'कार्यक्रम') },
        { path: '/alumni/jobs', label: t('Jobs', 'नौकरियां') },
        { path: '/alumni/admin', label: t('🛡️ Admin Panel', '🛡️ व्यवस्थापक') },
      ],
    },
    { path: '/trustees', label: t('Trustees', 'न्यासी') },
    { path: '/gallery', label: t('Gallery', 'गैलरी') },
    { path: '/news', label: t('News', 'समाचार') },
    { path: '/donations', label: t('Donate', 'दान करें') },
    { path: '/contact', label: t('Contact', 'संपर्क') },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="Hirachand Gumanji Family Charitable Trust Logo" 
              className="w-12 h-12 md:w-14 md:h-14 object-contain"
            />
            <div className="hidden sm:block">
              <h1 className="text-sm md:text-base font-heading font-bold text-primary leading-tight">
                {t('Hirachand Gumanji Family', 'हीराचंद गुमानजी परिवार')}
              </h1>
              <p className="text-xs text-muted-foreground">
                {t('Charitable Trust', 'चैरिटेबल ट्रस्ट')}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item, index) =>
              item.children ? (
                <DropdownMenu key={index}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-1 text-foreground/80 hover:text-foreground">
                      {item.label}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="bg-background">
                    {item.children.map((child) => (
                      <DropdownMenuItem key={child.path} asChild>
                        <Link to={child.path} className="cursor-pointer">
                          {child.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link key={item.path} to={item.path!}>
                  <Button
                    variant="ghost"
                    className={`text-foreground/80 hover:text-foreground ${
                      isActive(item.path!) ? 'text-primary bg-primary/10' : ''
                    }`}
                  >
                    {item.label}
                  </Button>
                </Link>
              )
            )}
          </nav>

          {/* Language Toggle & Mobile Menu */}
          <div className="flex items-center gap-2">
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

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="lg:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-1">
              {navItems.map((item, index) =>
                item.children ? (
                  <div key={index} className="space-y-1">
                    <p className="px-3 py-2 text-sm font-medium text-muted-foreground">
                      {item.label}
                    </p>
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        onClick={() => setIsOpen(false)}
                        className="block px-6 py-2 text-sm hover:bg-accent rounded-md"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path!}
                    onClick={() => setIsOpen(false)}
                    className={`px-3 py-2 text-sm rounded-md hover:bg-accent ${
                      isActive(item.path!) ? 'text-primary bg-primary/10' : ''
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
