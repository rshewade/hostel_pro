import { useState } from 'react';
import { Shield, Users, Calendar, Briefcase, Bell, FileText, Check, X, Eye, Trash2, Clock, Lock, KeyRound } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import applicationsData from '@/data/applications.json';
import alumniData from '@/data/alumni.json';
import eventsData from '@/data/events.json';
import jobsData from '@/data/jobs.json';
import institutions from '@/data/institutions.json';

interface Application {
  id: string;
  name: string;
  email: string;
  institution: string;
  yearOfJoining: number;
  yearOfPassing: number;
  department: string;
  status: string;
  submittedAt: string;
}

const AlumniAdmin = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminOtp, setAdminOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [applications, setApplications] = useState<Application[]>(applicationsData as Application[]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  // Admin login handlers
  const handleSendAdminOtp = async () => {
    if (!adminEmail) {
      toast({
        title: t('Email Required', 'ईमेल आवश्यक है'),
        description: t('Please enter admin email address.', 'कृपया व्यवस्थापक ईमेल पता दर्ज करें।'),
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setOtpSent(true);
    toast({
      title: t('OTP Sent', 'OTP भेजा गया'),
      description: t('Use OTP 999999 for admin login demo.', 'व्यवस्थापक लॉगिन डेमो के लिए OTP 999999 का उपयोग करें।'),
    });
  };

  const handleVerifyAdminOtp = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);

    // Mock admin OTP - use 999999 for admin
    if (adminOtp === '999999') {
      setIsAdminAuthenticated(true);
      toast({
        title: t('Admin Login Successful', 'व्यवस्थापक लॉगिन सफल'),
        description: t('Welcome to the Admin Panel!', 'व्यवस्थापक पैनल में आपका स्वागत है!'),
      });
    } else {
      toast({
        title: t('Invalid OTP', 'अमान्य OTP'),
        description: t('Use 999999 for admin demo.', 'व्यवस्थापक डेमो के लिए 999999 का उपयोग करें।'),
        variant: 'destructive',
      });
    }
  };

  // Mock audit log
  const auditLog = [
    { id: 1, action: 'Application Approved', user: 'admin@trust.org', target: 'Rahul Jain', timestamp: '2024-12-20T10:30:00Z' },
    { id: 2, action: 'Application Rejected', user: 'admin@trust.org', target: 'John Doe', timestamp: '2024-12-19T15:45:00Z' },
    { id: 3, action: 'Event Created', user: 'admin@trust.org', target: 'Annual Reunion 2025', timestamp: '2024-12-18T09:00:00Z' },
    { id: 4, action: 'Job Posted', user: 'moderator@trust.org', target: 'Software Engineer at TechCorp', timestamp: '2024-12-17T14:20:00Z' },
  ];

  const pendingApplications = applications.filter(a => a.status === 'pending');
  const approvedAlumni = alumniData.filter(a => a.status === 'approved');

  const handleAction = (app: Application, type: 'approve' | 'reject') => {
    setSelectedApp(app);
    setActionType(type);
  };

  const confirmAction = () => {
    if (!selectedApp || !actionType) return;

    setApplications(prev =>
      prev.map(app =>
        app.id === selectedApp.id
          ? { ...app, status: actionType === 'approve' ? 'approved' : 'rejected' }
          : app
      )
    );

    toast({
      title: actionType === 'approve' 
        ? t('Application Approved', 'आवेदन स्वीकृत') 
        : t('Application Rejected', 'आवेदन अस्वीकृत'),
      description: `${selectedApp.name}'s ${t('application has been', 'का आवेदन')} ${actionType === 'approve' ? t('approved', 'स्वीकृत किया गया') : t('rejected', 'अस्वीकृत किया गया')}.`,
    });

    setSelectedApp(null);
    setActionType(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const stats = [
    { label: t('Pending Applications', 'लंबित आवेदन'), value: pendingApplications.length, icon: FileText, color: 'text-secondary' },
    { label: t('Total Alumni', 'कुल पूर्व छात्र'), value: approvedAlumni.length, icon: Users, color: 'text-primary' },
    { label: t('Active Events', 'सक्रिय कार्यक्रम'), value: eventsData.filter(e => e.status === 'upcoming').length, icon: Calendar, color: 'text-accent' },
    { label: t('Job Postings', 'नौकरी पोस्टिंग'), value: jobsData.filter(j => j.status === 'active').length, icon: Briefcase, color: 'text-primary' },
  ];

  // Admin Login Screen
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <PageHero
          title={t('Admin Login', 'व्यवस्थापक लॉगिन')}
          subtitle={t('Secure access for trust administrators', 'ट्रस्ट प्रशासकों के लिए सुरक्षित पहुंच')}
        />

        <section className="py-16 bg-background flex-1">
          <div className="container mx-auto px-4 max-w-md">
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  {otpSent ? <KeyRound className="h-8 w-8 text-primary" /> : <Lock className="h-8 w-8 text-primary" />}
                </div>
                <CardTitle className="font-heading">
                  {otpSent ? t('Enter Admin OTP', 'व्यवस्थापक OTP दर्ज करें') : t('Admin Authentication', 'व्यवस्थापक प्रमाणीकरण')}
                </CardTitle>
                <CardDescription>
                  {otpSent 
                    ? t('Enter the 6-digit code sent to admin email', 'व्यवस्थापक ईमेल पर भेजा गया 6-अंकीय कोड दर्ज करें')
                    : t('Only authorized administrators can access this panel', 'केवल अधिकृत प्रशासक ही इस पैनल तक पहुंच सकते हैं')
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {!otpSent ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="adminEmail">{t('Admin Email', 'व्यवस्थापक ईमेल')}</Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="admin@trust.org"
                      />
                    </div>
                    
                    <Button onClick={handleSendAdminOtp} disabled={isLoading} className="w-full">
                      {isLoading ? t('Sending...', 'भेज रहा है...') : t('Send OTP', 'OTP भेजें')}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="adminOtp">{t('Admin OTP', 'व्यवस्थापक OTP')}</Label>
                      <Input
                        id="adminOtp"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={adminOtp}
                        onChange={(e) => setAdminOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="999999"
                        className="text-center text-2xl tracking-widest"
                      />
                      <p className="text-xs text-muted-foreground text-center">
                        {t('Sent to', 'भेजा गया')}: {adminEmail}
                      </p>
                    </div>
                    
                    <Button onClick={handleVerifyAdminOtp} disabled={isLoading} className="w-full">
                      {isLoading ? t('Verifying...', 'सत्यापित कर रहा है...') : t('Verify & Login', 'सत्यापित करें और लॉगिन करें')}
                    </Button>
                    
                    <Button variant="ghost" onClick={() => setOtpSent(false)} className="w-full">
                      {t('Use different email', 'अलग ईमेल उपयोग करें')}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
            
            {/* Demo Notice */}
            <Card className="mt-4 bg-primary/5 border-primary/20">
              <CardContent className="pt-4">
                <p className="text-sm text-center text-muted-foreground">
                  <strong>{t('Demo Mode:', 'डेमो मोड:')}</strong><br/>
                  {t('Email:', 'ईमेल:')} <code className="bg-muted px-1 rounded">admin@trust.org</code><br/>
                  {t('OTP:', 'OTP:')} <code className="bg-muted px-1 rounded">999999</code>
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <PageHero
        title={t('Admin Panel', 'व्यवस्थापक पैनल')}
        subtitle={t('Manage alumni applications, events, and platform settings', 'पूर्व छात्र आवेदन, कार्यक्रम और प्लेटफ़ॉर्म सेटिंग्स प्रबंधित करें')}
      />

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="applications">
            <TabsList className="mb-6 flex-wrap">
              <TabsTrigger value="applications" className="gap-2">
                <FileText className="h-4 w-4" />
                {t('Applications', 'आवेदन')}
                {pendingApplications.length > 0 && (
                  <Badge variant="destructive" className="ml-1">{pendingApplications.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="alumni" className="gap-2">
                <Users className="h-4 w-4" />
                {t('Alumni List', 'पूर्व छात्र सूची')}
              </TabsTrigger>
              <TabsTrigger value="events" className="gap-2">
                <Calendar className="h-4 w-4" />
                {t('Events', 'कार्यक्रम')}
              </TabsTrigger>
              <TabsTrigger value="jobs" className="gap-2">
                <Briefcase className="h-4 w-4" />
                {t('Jobs', 'नौकरियां')}
              </TabsTrigger>
              <TabsTrigger value="announcements" className="gap-2">
                <Bell className="h-4 w-4" />
                {t('Announcements', 'घोषणाएं')}
              </TabsTrigger>
              <TabsTrigger value="audit" className="gap-2">
                <Shield className="h-4 w-4" />
                {t('Audit Log', 'ऑडिट लॉग')}
              </TabsTrigger>
            </TabsList>

            {/* Applications Tab */}
            <TabsContent value="applications">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">{t('Pending Applications', 'लंबित आवेदन')}</CardTitle>
                  <CardDescription>
                    {t('Review and approve or reject alumni registration requests', 'पूर्व छात्र पंजीकरण अनुरोधों की समीक्षा करें और स्वीकृत या अस्वीकृत करें')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingApplications.length > 0 ? (
                    <div className="space-y-4">
                      {pendingApplications.map((app) => (
                        <div key={app.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border border-border/50 gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{app.name}</h4>
                              <Badge variant="outline">{app.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{app.email}</p>
                            <div className="flex flex-wrap gap-4 mt-2 text-sm">
                              <span>{institutions.find(i => i.id === app.institution)?.shortName}</span>
                              <span>{app.yearOfJoining}–{app.yearOfPassing}</span>
                              <span>{app.department}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {t('Submitted', 'जमा किया')}: {formatDate(app.submittedAt)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              {t('View', 'देखें')}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleAction(app, 'approve')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              {t('Approve', 'स्वीकृत')}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleAction(app, 'reject')}
                            >
                              <X className="h-4 w-4 mr-1" />
                              {t('Reject', 'अस्वीकृत')}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      {t('No pending applications', 'कोई लंबित आवेदन नहीं')}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Alumni List Tab */}
            <TabsContent value="alumni">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">{t('Approved Alumni', 'स्वीकृत पूर्व छात्र')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {approvedAlumni.map((alumni) => (
                      <div key={alumni.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div>
                          <p className="font-medium">{alumni.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {institutions.find(i => i.id === alumni.institution)?.shortName} • {alumni.batch}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{alumni.department}</Badge>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-heading">{t('Events Management', 'कार्यक्रम प्रबंधन')}</CardTitle>
                    <CardDescription>{t('Create and manage alumni events', 'पूर्व छात्र कार्यक्रम बनाएं और प्रबंधित करें')}</CardDescription>
                  </div>
                  <Button disabled>
                    <Calendar className="h-4 w-4 mr-2" />
                    {t('Create Event', 'कार्यक्रम बनाएं')}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {eventsData.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">{event.date} • {event.location}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={event.status === 'upcoming' ? 'default' : 'secondary'}>{event.status}</Badge>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Jobs Tab */}
            <TabsContent value="jobs">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">{t('Jobs Management', 'नौकरी प्रबंधन')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {jobsData.map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div>
                          <p className="font-medium">{job.title}</p>
                          <p className="text-sm text-muted-foreground">{job.company} • {t('Posted by', 'द्वारा पोस्ट')}: {job.postedBy.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>{job.status}</Badge>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Announcements Tab */}
            <TabsContent value="announcements">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-heading">{t('Announcements', 'घोषणाएं')}</CardTitle>
                    <CardDescription>{t('Send announcements to alumni', 'पूर्व छात्रों को घोषणाएं भेजें')}</CardDescription>
                  </div>
                  <Button disabled>
                    <Bell className="h-4 w-4 mr-2" />
                    {t('New Announcement', 'नई घोषणा')}
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground py-8">
                    {t('No announcements yet', 'अभी तक कोई घोषणा नहीं')}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Audit Log Tab */}
            <TabsContent value="audit">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">{t('Audit Log', 'ऑडिट लॉग')}</CardTitle>
                  <CardDescription>{t('Track all administrative actions', 'सभी प्रशासनिक कार्यों को ट्रैक करें')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {auditLog.map((log) => (
                      <div key={log.id} className="flex items-start gap-4 p-3 rounded-lg bg-muted/30">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{log.action}</p>
                          <p className="text-sm text-muted-foreground">
                            {t('Target', 'लक्ष्य')}: {log.target}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {log.user} • {formatDate(log.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Confirmation Dialog */}
      <Dialog open={!!selectedApp && !!actionType} onOpenChange={() => { setSelectedApp(null); setActionType(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' 
                ? t('Approve Application', 'आवेदन स्वीकृत करें') 
                : t('Reject Application', 'आवेदन अस्वीकृत करें')}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve'
                ? t('This will grant the applicant access to the alumni directory and features.', 'इससे आवेदक को पूर्व छात्र निर्देशिका और सुविधाओं तक पहुंच मिलेगी।')
                : t('This will reject the application. The applicant will be notified.', 'इससे आवेदन अस्वीकृत हो जाएगा। आवेदक को सूचित किया जाएगा।')}
            </DialogDescription>
          </DialogHeader>
          {selectedApp && (
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="font-medium">{selectedApp.name}</p>
              <p className="text-sm text-muted-foreground">{selectedApp.email}</p>
              <p className="text-sm text-muted-foreground">
                {institutions.find(i => i.id === selectedApp.institution)?.shortName} • {selectedApp.yearOfJoining}–{selectedApp.yearOfPassing}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelectedApp(null); setActionType(null); }}>
              {t('Cancel', 'रद्द करें')}
            </Button>
            <Button
              onClick={confirmAction}
              variant={actionType === 'reject' ? 'destructive' : 'default'}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {actionType === 'approve' ? t('Approve', 'स्वीकृत करें') : t('Reject', 'अस्वीकृत करें')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AlumniAdmin;
