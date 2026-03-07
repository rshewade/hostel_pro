import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Building, GraduationCap, Home, Eye, EyeOff, Save } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import institutions from '@/data/institutions.json';

const AlumniProfile = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Mock profile data
  const [profile, setProfile] = useState({
    name: 'Rahul Jain',
    email: 'rahul.jain@example.com',
    phone: '+91 98765 43210',
    institution: 'boys-hostel',
    batch: '2012–2016',
    department: 'Commerce',
    hostelBlock: 'Block A',
    roomNumber: '204',
    yearsOfStay: '2012-2016',
    bio: 'Proud alumnus of the Boys\' Hostel. Currently working in finance.',
    visibility: {
      email: 'alumni-only',
      phone: 'private',
      batch: 'alumni-only',
    },
  });

  useEffect(() => {
    const session = localStorage.getItem('alumniSession');
    if (session) {
      setIsAuthenticated(true);
    } else {
      navigate('/alumni/login');
    }
  }, [navigate]);

  const updateProfile = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const updateVisibility = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      visibility: { ...prev.visibility, [field]: value },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Mock save
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast({
      title: t('Profile Updated', 'प्रोफ़ाइल अपडेट किया गया'),
      description: t('Your changes have been saved successfully.', 'आपके परिवर्तन सफलतापूर्वक सहेजे गए हैं।'),
    });
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <PageHero
        title={t('My Profile', 'मेरी प्रोफ़ाइल')}
        subtitle={t('Manage your alumni profile and privacy settings', 'अपनी पूर्व छात्र प्रोफ़ाइल और गोपनीयता सेटिंग्स प्रबंधित करें')}
      />

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Profile Header */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-heading font-bold">{profile.name}</h2>
                  <p className="text-muted-foreground">{profile.batch}</p>
                  <p className="text-sm text-primary">
                    {institutions.find(i => i.id === profile.institution)?.name}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <User className="h-5 w-5" />
                {t('Personal Information', 'व्यक्तिगत जानकारी')}
              </CardTitle>
              <CardDescription>
                {t('Update your contact details', 'अपने संपर्क विवरण अपडेट करें')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('Full Name', 'पूरा नाम')}</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => updateProfile('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('Email', 'ईमेल')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => updateProfile('email', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('Phone', 'फ़ोन')}</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => updateProfile('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('Bio', 'परिचय')}</Label>
                  <Input
                    value={profile.bio}
                    onChange={(e) => updateProfile('bio', e.target.value)}
                    placeholder={t('A short bio about yourself', 'अपने बारे में संक्षिप्त परिचय')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                {t('Academic Information', 'शैक्षणिक जानकारी')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('Institution', 'संस्था')}</Label>
                  <Input value={institutions.find(i => i.id === profile.institution)?.name} disabled />
                </div>
                <div className="space-y-2">
                  <Label>{t('Batch', 'बैच')}</Label>
                  <Input value={profile.batch} disabled />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">{t('Department', 'विभाग')}</Label>
                  <Input
                    id="department"
                    value={profile.department}
                    onChange={(e) => updateProfile('department', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('Years of Stay', 'रहने के वर्ष')}</Label>
                  <Input value={profile.yearsOfStay} disabled />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hostel Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <Home className="h-5 w-5" />
                {t('Hostel Information', 'छात्रावास जानकारी')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hostelBlock">{t('Hostel Block', 'छात्रावास ब्लॉक')}</Label>
                  <Input
                    id="hostelBlock"
                    value={profile.hostelBlock}
                    onChange={(e) => updateProfile('hostelBlock', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roomNumber">{t('Room Number', 'कमरा नंबर')}</Label>
                  <Input
                    id="roomNumber"
                    value={profile.roomNumber}
                    onChange={(e) => updateProfile('roomNumber', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <Eye className="h-5 w-5" />
                {t('Privacy Settings', 'गोपनीयता सेटिंग्स')}
              </CardTitle>
              <CardDescription>
                {t('Control who can see your information', 'नियंत्रित करें कि आपकी जानकारी कौन देख सकता है')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Visibility */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{t('Email Address', 'ईमेल पता')}</p>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                  </div>
                </div>
                <Select value={profile.visibility.email} onValueChange={(v) => updateVisibility('email', v)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alumni-only">
                      <span className="flex items-center gap-2">
                        <Eye className="h-4 w-4" /> {t('Alumni Only', 'केवल पूर्व छात्र')}
                      </span>
                    </SelectItem>
                    <SelectItem value="private">
                      <span className="flex items-center gap-2">
                        <EyeOff className="h-4 w-4" /> {t('Private', 'निजी')}
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Phone Visibility */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{t('Phone Number', 'फ़ोन नंबर')}</p>
                    <p className="text-sm text-muted-foreground">{profile.phone}</p>
                  </div>
                </div>
                <Select value={profile.visibility.phone} onValueChange={(v) => updateVisibility('phone', v)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alumni-only">
                      <span className="flex items-center gap-2">
                        <Eye className="h-4 w-4" /> {t('Alumni Only', 'केवल पूर्व छात्र')}
                      </span>
                    </SelectItem>
                    <SelectItem value="private">
                      <span className="flex items-center gap-2">
                        <EyeOff className="h-4 w-4" /> {t('Private', 'निजी')}
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Batch Visibility */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{t('Batch & Academic Info', 'बैच और शैक्षणिक जानकारी')}</p>
                    <p className="text-sm text-muted-foreground">{profile.batch}, {profile.department}</p>
                  </div>
                </div>
                <Select value={profile.visibility.batch} onValueChange={(v) => updateVisibility('batch', v)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alumni-only">
                      <span className="flex items-center gap-2">
                        <Eye className="h-4 w-4" /> {t('Alumni Only', 'केवल पूर्व छात्र')}
                      </span>
                    </SelectItem>
                    <SelectItem value="private">
                      <span className="flex items-center gap-2">
                        <EyeOff className="h-4 w-4" /> {t('Private', 'निजी')}
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button onClick={handleSave} disabled={isSaving} className="w-full" size="lg">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? t('Saving...', 'सहेज रहा है...') : t('Save Changes', 'परिवर्तन सहेजें')}
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AlumniProfile;
