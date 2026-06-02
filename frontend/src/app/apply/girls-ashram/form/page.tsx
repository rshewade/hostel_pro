'use client';

import { FormWizard, Input, Select, DatePicker, FileUpload } from '@/components/forms';
import { Button } from '@/components/shadcn/button-extended';
import { ArrowLeft, Save, FileText, User, GraduationCap, Home, Users, Upload, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';
import { AdmissionFeeStep } from '@/components/forms/AdmissionFeeStep';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ApplicationFormPageWrapper() {
  return (
    <Suspense fallback={null}>
      <ApplicationFormPage />
    </Suspense>
  );
}

function ApplicationFormPage() {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [initialData, setInitialData] = useState<any>({});
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pendingApplicationId, setPendingApplicationId] = useState<string | null>(null);
  const [pendingTrackingNumber, setPendingTrackingNumber] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    const appId = searchParams.get('appId');
    const tracking = searchParams.get('tracking');
    if (!appId || !tracking) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/applications/track/${tracking}`);
        const json = await res.json();
        const app = json?.data?.data || json?.data;
        if (!cancelled && app && app.id === appId && app.current_status === 'DRAFT' && app.vertical === 'GIRLS_ASHRAM') {
          setPendingApplicationId(appId);
          setPendingTrackingNumber(tracking);
        }
      } catch {
        // ignore — show full form
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  useEffect(() => {
    const loadDraft = async () => {
      try {
        const savedDraft = localStorage.getItem('application_draft_girls-ashram');
        const verifiedMobile = localStorage.getItem('otp_verified_mobile') || '';
        const verifiedEmail = localStorage.getItem('otp_verified_email') || '';
        const contactDefaults = {
          applicantMobile: verifiedMobile,
          applicantEmail: verifiedEmail,
          gender: 'Female',
          vertical: 'girls-ashram',
        };
        if (savedDraft) {
          setInitialData({ ...JSON.parse(savedDraft), ...contactDefaults });
        } else {
          setInitialData(contactDefaults);
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
        setInitialData({ vertical: 'girls-ashram', gender: 'Female' });
      }
      setIsLoading(false);
    };

    loadDraft();
  }, []);

  const wizardSteps = [
    {
      id: 'personal-details',
      title: 'Personal Details',
      component: ({
        data,
        onChange,
        errors,
        setErrors,
        isValid,
        setIsValid,
        saving,
      }: any) => (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-blue-100)' }}>
              <User className="w-6 h-6" style={{ color: 'var(--color-blue-600)' }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {t('Personal Information', 'व्यक्तिगत जानकारी')}</h2>
              <p style={{ color: 'var(--text-secondary)' }}>{t('Please provide your personal details', 'कृपया अपना व्यक्तिगत विवरण प्रदान करें')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label={t('First Name', 'पहला नाम')}
              value={data.firstName || ''}
              onChange={(e) => onChange('firstName', e.target.value)}
              error={errors.firstName}
              required
              placeholder={t('Enter first name', 'पहला नाम दर्ज करें')}
            />

            <Input
              label={t('Middle Name', 'मध्य नाम')}
              value={data.middleName || ''}
              onChange={(e) => onChange('middleName', e.target.value)}
              placeholder={t('Enter middle name (optional)', 'मध्य नाम दर्ज करें (वैकल्पिक)')}
            />

            <Input
              label={t('Last Name', 'अंतिम नाम')}
              value={data.lastName || ''}
              onChange={(e) => onChange('lastName', e.target.value)}
              error={errors.lastName}
              required
              placeholder={t('Enter last name', 'अंतिम नाम दर्ज करें')}
            />

            <Input
              label={t('Mobile Number', 'मोबाइल नंबर')}
              type="tel"
              value={data.applicantMobile || ''}
              onChange={data.applicantMobile && !data.applicantEmail
                ? () => {}
                : (e) => onChange('applicantMobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
              disabled={!!data.applicantMobile && !data.applicantEmail}
              error={errors.applicantMobile}
              required
              placeholder={t('Enter 10-digit mobile number', '10 अंकों का मोबाइल नंबर दर्ज करें')}
              helperText={data.applicantMobile && !data.applicantEmail
                ? t('Verified via OTP — cannot be changed', 'ओटीपी से सत्यापित — बदला नहीं जा सकता')
                : t('Required for communication and tracking', 'संचार और ट्रैकिंग के लिए आवश्यक')}
              maxLength={10}
              inputMode="tel"
            />

            <Input
              label={t('Email Address', 'ईमेल पता')}
              type="email"
              value={data.applicantEmail || ''}
              onChange={data.applicantEmail && !data.applicantMobile
                ? () => {}
                : (e) => onChange('applicantEmail', e.target.value)}
              disabled={!!data.applicantEmail && !data.applicantMobile}
              error={errors.applicantEmail}
              required
              placeholder={t('Enter your email address', 'अपना ईमेल पता दर्ज करें')}
              helperText={data.applicantEmail && !data.applicantMobile
                ? t('Verified via OTP — cannot be changed', 'ओटीपी से सत्यापित — बदला नहीं जा सकता')
                : t('Used for login credentials and notifications', 'लॉगिन क्रेडेंशियल और सूचनाओं के लिए उपयोग किया जाएगा')}
            />

            <DatePicker
              label={t('Date of Birth', 'जन्म तिथि')}
              value={data.dob || ''}
              onChange={(e) => onChange('dob', e.target.value)}
              error={errors.dob}
              required
              helperText={t('You must be at least 18 years old', 'आपकी आयु कम से कम 18 वर्ष होनी चाहिए')}
            />

            <Input
              label={t('Gender', 'लिंग')}
              value="Female"
              onChange={() => {}}
              disabled
              required
            />

            <Select
              label={t('Blood Group', 'रक्त समूह')}
              value={data.bloodGroup || ''}
              onChange={(e) => onChange('bloodGroup', e.target.value)}
              error={errors.bloodGroup}
              required
              options={[
                { value: '', label: 'Select Blood Group' },
                { value: 'A+', label: 'A+' },
                { value: 'A-', label: 'A-' },
                { value: 'B+', label: 'B+' },
                { value: 'B-', label: 'B-' },
                { value: 'AB+', label: 'AB+' },
                { value: 'AB-', label: 'AB-' },
                { value: 'O+', label: 'O+' },
                { value: 'O-', label: 'O-' },
              ]}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              {t('Permanent Address', 'स्थायी पता')}</h3>
            <div className="space-y-4">
              <Input
                label={t('Address Line 1', 'पता पंक्ति 1')}
                value={data.addressLine1 || ''}
                onChange={(e) => onChange('addressLine1', e.target.value)}
                error={errors.addressLine1}
                required
                placeholder={t('House/Flat No, Street, Area', 'मकान/फ्लैट नंबर, सड़क, क्षेत्र')}
              />

              <Input
                label={t('Address Line 2', 'पता पंक्ति 2')}
                value={data.addressLine2 || ''}
                onChange={(e) => onChange('addressLine2', e.target.value)}
                placeholder={t('Landmark, Locality', 'लैंडमार्क, इलाका')}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label={t('City', 'शहर')}
                  value={data.city || ''}
                  onChange={(e) => onChange('city', e.target.value)}
                  error={errors.city}
                  required
                  placeholder={t('Enter city', 'शहर दर्ज करें')}
                />

                <Input
                  label={t('State', 'राज्य')}
                  value={data.state || ''}
                  onChange={(e) => onChange('state', e.target.value)}
                  error={errors.state}
                  required
                  placeholder={t('Enter state', 'राज्य दर्ज करें')}
                />

                <Input
                  label={t('PIN Code', 'पिन कोड')}
                  type="text"
                  value={data.pinCode || ''}
                  onChange={(e) => onChange('pinCode', e.target.value)}
                  error={errors.pinCode}
                  required
                  placeholder={t('6-digit PIN', '6 अंकों का पिन')}
                  maxLength={6}
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              {t('Parent/Guardian Information', 'अभिभावक जानकारी')}</h3>
            <div className="space-y-4">
              <Input
                label={t('Father\'s Name', 'पिता का नाम')}
                value={data.fatherName || ''}
                onChange={(e) => onChange('fatherName', e.target.value)}
                error={errors.fatherName}
                required
                placeholder={t('Enter father\'s full name', 'पिता का पूरा नाम दर्ज करें')}
              />

              <Input
                label={t('Father\'s Occupation', 'पिता का व्यवसाय')}
                value={data.fatherOccupation || ''}
                onChange={(e) => onChange('fatherOccupation', e.target.value)}
                placeholder={t('Enter father\'s occupation', 'पिता का व्यवसाय दर्ज करें')}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t('Father\'s Mobile Number', 'पिता का मोबाइल नंबर')}
                  type="tel"
                  value={data.fatherMobile || ''}
                  onChange={(e) => onChange('fatherMobile', e.target.value)}
                  error={errors.fatherMobile}
                  required
                  placeholder={t('10-digit mobile number', '10 अंकों का मोबाइल नंबर')}
                  maxLength={10}
                  inputMode="tel"
                />

                <Input
                  label={t('Father\'s Email', 'पिता का ईमेल')}
                  type="email"
                  value={data.fatherEmail || ''}
                  onChange={(e) => onChange('fatherEmail', e.target.value)}
                  placeholder={t('Enter email (optional)', 'ईमेल दर्ज करें (वैकल्पिक)')}
                />
              </div>

              <Input
                label={t('Mother\'s Name', 'माता का नाम')}
                value={data.motherName || ''}
                onChange={(e) => onChange('motherName', e.target.value)}
                error={errors.motherName}
                required
                placeholder={t('Enter mother\'s full name', 'माता का पूरा नाम दर्ज करें')}
              />

              <Input
                label={t('Mother\'s Occupation', 'माता का व्यवसाय')}
                value={data.motherOccupation || ''}
                onChange={(e) => onChange('motherOccupation', e.target.value)}
                placeholder={t('Enter mother\'s occupation', 'माता का व्यवसाय दर्ज करें')}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t('Mother\'s Mobile Number', 'माता का मोबाइल नंबर')}
                  type="tel"
                  value={data.motherMobile || ''}
                  onChange={(e) => onChange('motherMobile', e.target.value)}
                  placeholder={t('10-digit mobile number (optional)', '10 अंकों का मोबाइल नंबर (वैकल्पिक)')}
                  maxLength={10}
                  inputMode="tel"
                />

                <Input
                  label={t('Mother\'s Email', 'माता का ईमेल')}
                  type="email"
                  value={data.motherEmail || ''}
                  onChange={(e) => onChange('motherEmail', e.target.value)}
                  placeholder={t('Enter email (optional)', 'ईमेल दर्ज करें (वैकल्पिक)')}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              {t('Local Guardian (if different from parents)', 'स्थानीय अभिभावक (यदि माता-पिता से भिन्न)')}</h3>
            <div className="space-y-4">
              <Input
                label={t('Guardian Name', 'अभिभावक का नाम')}
                value={data.guardianName || ''}
                onChange={(e) => onChange('guardianName', e.target.value)}
                placeholder={t('Enter local guardian\'s name (optional)', 'स्थानीय अभिभावक का नाम दर्ज करें (वैकल्पिक)')}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t('Relationship', 'संबंध')}
                  value={data.guardianRelationship || ''}
                  onChange={(e) => onChange('guardianRelationship', e.target.value)}
                  placeholder={t('e.g., Uncle, Family Friend', 'जैसे, चाचा, पारिवारिक मित्र')}
                />

                <Input
                  label={t('Guardian Mobile', 'अभिभावक मोबाइल')}
                  type="tel"
                  value={data.guardianMobile || ''}
                  onChange={(e) => onChange('guardianMobile', e.target.value)}
                  placeholder={t('10-digit mobile number', '10 अंकों का मोबाइल नंबर')}
                  maxLength={10}
                  inputMode="tel"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              {t('Emergency Contact', 'आपातकालीन संपर्क')}</h3>
            <div className="space-y-4">
              <Input
                label={t('Emergency Contact Person', 'आपातकालीन संपर्क व्यक्ति')}
                value={data.emergencyContactPerson || ''}
                onChange={(e) => onChange('emergencyContactPerson', e.target.value)}
                error={errors.emergencyContactPerson}
                required
                placeholder={t('Name of emergency contact', 'आपातकालीन संपर्क का नाम')}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t('Emergency Mobile', 'आपातकालीन मोबाइल')}
                  type="tel"
                  value={data.emergencyMobile || ''}
                  onChange={(e) => onChange('emergencyMobile', e.target.value)}
                  error={errors.emergencyMobile}
                  required
                  placeholder={t('10-digit mobile number', '10 अंकों का मोबाइल नंबर')}
                  maxLength={10}
                  inputMode="tel"
                />

                <Input
                  label={t('Relationship', 'संबंध')}
                  value={data.emergencyRelationship || ''}
                  onChange={(e) => onChange('emergencyRelationship', e.target.value)}
                  error={errors.emergencyRelationship}
                  required
                  placeholder={t('e.g., Parent, Sibling', 'जैसे, माता-पिता, भाई-बहन')}
                />
              </div>
            </div>
          </div>
        </div>
      ),
      validate: (data: any) => {
        const errors: any = {};
        if (!data.firstName?.trim()) errors.firstName = 'First name is required';
        if (!data.lastName?.trim()) errors.lastName = 'Last name is required';
        if (!data.applicantMobile?.trim()) {
          errors.applicantMobile = 'Mobile number is required';
        } else if (!/^[6-9]\d{9}$/.test(data.applicantMobile)) {
          errors.applicantMobile = 'Must be 10 digits starting with 6-9';
        }
        if (!data.applicantEmail?.trim()) {
          errors.applicantEmail = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.applicantEmail)) {
          errors.applicantEmail = 'Please enter a valid email address';
        }
        if (!data.dob) {
          errors.dob = 'Date of birth is required';
        } else {
          const dob = new Date(data.dob);
          const today = new Date();
          let age = today.getFullYear() - dob.getFullYear();
          const monthDiff = today.getMonth() - dob.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
          if (age < 18) errors.dob = 'Applicant must be at least 18 years old';
        }
        if (!data.gender) errors.gender = 'Gender is required';
        if (!data.bloodGroup) errors.bloodGroup = 'Blood group is required';
        if (!data.addressLine1?.trim()) errors.addressLine1 = 'Address line 1 is required';
        if (!data.city?.trim()) errors.city = 'City is required';
        if (!data.state?.trim()) errors.state = 'State is required';
        if (!data.pinCode?.trim() || !/^\d{6}$/.test(data.pinCode)) {
          errors.pinCode = 'Valid 6-digit PIN code is required';
        }
        if (!data.fatherName?.trim()) errors.fatherName = 'Father name is required';
        if (!data.fatherMobile?.trim() || !/^\d{10}$/.test(data.fatherMobile)) {
          errors.fatherMobile = 'Valid 10-digit mobile number is required';
        }
        if (!data.motherName?.trim()) errors.motherName = 'Mother name is required';
        if (!data.emergencyContactPerson?.trim()) errors.emergencyContactPerson = 'Emergency contact person is required';
        if (!data.emergencyMobile?.trim() || !/^\d{10}$/.test(data.emergencyMobile)) {
          errors.emergencyMobile = 'Valid 10-digit emergency mobile is required';
        } else if (data.guardianMobile && data.emergencyMobile === data.guardianMobile) {
          errors.emergencyMobile = 'Emergency mobile must differ from local guardian mobile';
        } else if ((!data.fatherDeceased && data.fatherMobile && data.emergencyMobile === data.fatherMobile) || (!data.motherDeceased && data.motherMobile && data.emergencyMobile === data.motherMobile)) {
          errors.emergencyMobile = 'Emergency mobile must differ from parent mobile';
        }
        if (!data.emergencyRelationship?.trim()) errors.emergencyRelationship = 'Relationship is required';
        return Object.keys(errors).length > 0 ? errors : null;
      },
    },
    {
      id: 'academic-info',
      title: 'Academic Information',
      description: 'Educational details',
      component: ({ data, onChange, errors }: any) => (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-green-100)' }}>
              <GraduationCap className="w-6 h-6" style={{ color: 'var(--color-green-600)' }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {t('Academic Details', 'शैक्षणिक विवरण')}</h2>
              <p style={{ color: 'var(--text-secondary)' }}>{t('Please provide your educational background', 'कृपया अपनी शैक्षणिक पृष्ठभूमि प्रदान करें')}</p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label={t('Current Institution/College', 'वर्तमान संस्था/कॉलेज')}
              value={data.institution || ''}
              onChange={(e) => onChange('institution', e.target.value)}
              error={errors.institution}
              required
              placeholder={t('Enter institution name', 'संस्था का नाम दर्ज करें')}
            />

            <Input
              label={t('Course/Degree', 'पाठ्यक्रम/डिग्री')}
              value={data.course || ''}
              onChange={(e) => onChange('course', e.target.value)}
              error={errors.course}
              required
              placeholder="e.g., B.Com, B.Sc, B.Tech"
            />

            <Select
              label={t('Year/Semester', 'वर्ष/सेमेस्टर')}
              value={data.year || ''}
              onChange={(e) => onChange('year', e.target.value)}
              error={errors.year}
              required
              options={[
                { value: '', label: 'Select Year' },
                { value: '1', label: '1st Year' },
                { value: '2', label: '2nd Year' },
                { value: '3', label: '3rd Year' },
                { value: '4', label: '4th Year' },
                { value: '5', label: '5th Year' },
              ]}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t('Previous Academic Qualification', 'पिछली शैक्षणिक योग्यता')}
                value={data.qualification || ''}
                onChange={(e) => onChange('qualification', e.target.value)}
                error={errors.qualification}
                required
                placeholder="e.g., 12th (HSC), Diploma, etc."
              />

              <Input
                label={t('Percentage/CGPA', 'प्रतिशत/सीजीपीए')}
                value={data.percentage || ''}
                onChange={(e) => onChange('percentage', e.target.value)}
                error={errors.percentage}
                required
                placeholder="e.g., 85% or 8.5 CGPA"
                inputMode="decimal"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t('Board/University', 'बोर्ड/विश्वविद्यालय')}
                value={data.board || ''}
                onChange={(e) => onChange('board', e.target.value)}
                error={errors.board}
                required
                placeholder="e.g., Maharashtra State Board, Mumbai University"
              />

              <Input
                label={t('Passing Year', 'उत्तीर्ण वर्ष')}
                type="number"
                value={data.passingYear || ''}
                onChange={(e) => onChange('passingYear', e.target.value)}
                error={errors.passingYear}
                required
                placeholder="e.g., 2024"
              />
            </div>
          </div>
        </div>
      ),
      validate: (data: any) => {
        const errors: any = {};
        if (!data.institution?.trim()) errors.institution = 'Institution name is required';
        if (!data.course?.trim()) errors.course = 'Course name is required';
        if (!data.year) errors.year = 'Year is required';
        if (!data.percentage?.trim()) errors.percentage = 'Percentage/CGPA is required';
        if (!data.qualification?.trim()) errors.qualification = 'Qualification is required';
        if (!data.board?.trim()) errors.board = 'Board/University is required';
        if (!data.passingYear) {
          errors.passingYear = 'Passing year is required';
        } else if (parseInt(data.passingYear) > new Date().getFullYear()) {
          errors.passingYear = 'Passing year cannot be in the future';
        }
        return Object.keys(errors).length > 0 ? errors : null;
      },
    },
    {
      id: 'hostel-preferences',
      title: 'Hostel Preferences',
      description: 'Room and duration preferences',
      component: ({ data, onChange, errors }: any) => (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-amber-100)' }}>
              <Home className="w-6 h-6" style={{ color: 'var(--color-amber-600)' }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {t('Hostel Preferences', 'छात्रावास प्राथमिकताएं')}</h2>
              <p style={{ color: 'var(--text-secondary)' }}>{t('Specify your room type and stay preferences', 'अपने कमरे का प्रकार और ठहरने की प्राथमिकताएं बताएं')}</p>
            </div>
          </div>

          <div className="space-y-4">
            <Select
              label={t('Vertical', 'श्रेणी')}
              value={data.vertical || 'girls-ashram'}
              onChange={(e) => onChange('vertical', e.target.value)}
              disabled
              helperText={t('This is pre-selected based on your application choice', 'यह आपके आवेदन की पसंद के आधार पर पूर्व-चयनित है')}
              options={[
                { value: 'boys-hostel', label: 'Boys Hostel' },
                { value: 'girls-ashram', label: 'Girls Ashram' },
                { value: 'dharamshala', label: 'Dharamshala' },
              ]}
            />

            <Select
              label={t('Preferred Room Type', 'पसंदीदा कमरे का प्रकार')}
              value={data.roomType || ''}
              onChange={(e) => onChange('roomType', e.target.value)}
              error={errors.roomType}
              required
              helperText={t('Subject to availability', 'उपलब्धता के अधीन')}
              options={[
                { value: '', label: 'Select Room Type' },
                { value: '2-sharing', label: '2-Sharing' },
                { value: '3-sharing', label: '3-Sharing' },
                { value: '4-sharing', label: '4-Sharing' },
              ]}
            />

            <Select
              label={t('Duration of Stay', 'ठहरने की अवधि')}
              value={data.duration || ''}
              onChange={(e) => onChange('duration', e.target.value)}
              error={errors.duration}
              required
              options={[
                { value: '', label: 'Select Duration' },
                { value: '6-months', label: '6 Months' },
                { value: '1-year', label: '1 Year' },
                { value: '2-years', label: '2 Years' },
                { value: '3-years', label: '3 Years' },
                { value: '4-years', label: '4 Years' },
              ]}
            />

            <DatePicker
              label={t('Intended Joining Date', 'अपेक्षित प्रवेश तिथि')}
              value={data.joiningDate || ''}
              onChange={(e) => onChange('joiningDate', e.target.value)}
              error={errors.joiningDate}
              required
              helperText={t('Expected date of admission', 'प्रवेश की अपेक्षित तिथि')}
            />

          </div>
        </div>
      ),
      validate: (data: any) => {
        const errors: any = {};
        if (!data.roomType) errors.roomType = 'Room type is required';
        if (!data.duration) errors.duration = 'Duration is required';
        if (!data.joiningDate) errors.joiningDate = 'Joining date is required';
        return Object.keys(errors).length > 0 ? errors : null;
      },
    },
    {
      id: 'references',
      title: 'References',
      description: 'Ex-student references',
      component: ({ data, onChange, errors }: any) => (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-purple-100)' }}>
              <Users className="w-6 h-6" style={{ color: 'var(--color-purple-600)' }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {t('References', 'संदर्भ')}</h2>
              <p style={{ color: 'var(--text-secondary)' }}>{t('Provide references from ex-students', 'पूर्व छात्रों से संदर्भ प्रदान करें')}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6 border-2" style={{ borderColor: 'var(--border-primary)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                {t('Reference 1', 'संदर्भ 1')}</h3>
              <div className="space-y-4">
                <Input
                  label={t('Ex-Student Name', 'पूर्व छात्र का नाम')}
                  value={data.ref1Name || ''}
                  onChange={(e) => onChange('ref1Name', e.target.value)}
                  error={errors.ref1Name}
                  required
                  placeholder={t('Enter full name of ex-student', 'पूर्व छात्र का पूरा नाम दर्ज करें')}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('Mobile Number', 'मोबाइल नंबर')}
                    type="tel"
                    value={data.ref1Mobile || ''}
                    onChange={(e) => onChange('ref1Mobile', e.target.value)}
                    error={errors.ref1Mobile}
                    required
                    placeholder={t('10-digit mobile number', '10 अंकों का मोबाइल नंबर')}
                    maxLength={10}
                    inputMode="tel"
                  />

                  <Input
                    label={t('Year of Stay', 'ठहरने का वर्ष')}
                    value={data.ref1Year || ''}
                    onChange={(e) => onChange('ref1Year', e.target.value)}
                    error={errors.ref1Year}
                    required
                    placeholder="e.g., 2020-2023"
                  />
                </div>

                <Input
                  label={t('Relationship (Optional)', 'संबंध (वैकल्पिक)')}
                  value={data.ref1Relationship || ''}
                  onChange={(e) => onChange('ref1Relationship', e.target.value)}
                  placeholder={t('e.g., Family friend, Relative, Neighbor', 'जैसे, पारिवारिक मित्र, रिश्तेदार, पड़ोसी')}
                />
              </div>
            </div>

            <div className="card p-6 border-2" style={{ borderColor: 'var(--border-primary)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                {t('Reference 2', 'संदर्भ 2')}</h3>
              <div className="space-y-4">
                <Input
                  label={t('Ex-Student Name', 'पूर्व छात्र का नाम')}
                  value={data.ref2Name || ''}
                  onChange={(e) => onChange('ref2Name', e.target.value)}
                  placeholder={t('Enter full name of ex-student', 'पूर्व छात्र का पूरा नाम दर्ज करें')}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('Mobile Number', 'मोबाइल नंबर')}
                    type="tel"
                    value={data.ref2Mobile || ''}
                    onChange={(e) => onChange('ref2Mobile', e.target.value)}
                    placeholder={t('10-digit mobile number', '10 अंकों का मोबाइल नंबर')}
                    maxLength={10}
                    inputMode="tel"
                  />

                  <Input
                    label={t('Year of Stay', 'ठहरने का वर्ष')}
                    value={data.ref2Year || ''}
                    onChange={(e) => onChange('ref2Year', e.target.value)}
                    placeholder="e.g., 2021-2024"
                  />
                </div>

                <Input
                  label={t('Relationship (Optional)', 'संबंध (वैकल्पिक)')}
                  value={data.ref2Relationship || ''}
                  onChange={(e) => onChange('ref2Relationship', e.target.value)}
                  placeholder={t('e.g., Family friend, Relative, Neighbor', 'जैसे, पारिवारिक मित्र, रिश्तेदार, पड़ोसी')}
                />
              </div>
            </div>
          </div>
        </div>
      ),
      validate: (data: any) => {
        const errors: any = {};
        if (!data.ref1Name?.trim()) errors.ref1Name = 'Ex-student name is required';
        if (!data.ref1Mobile?.trim() || !/^\d{10}$/.test(data.ref1Mobile)) {
          errors.ref1Mobile = 'Valid 10-digit mobile number is required';
        }
        if (!data.ref1Year?.trim()) errors.ref1Year = 'Year of stay is required';
        return Object.keys(errors).length > 0 ? errors : null;
      },
    },
    {
      id: 'documents',
      title: 'Documents',
      description: 'Upload required documents',
      component: ({ data, onChange, errors, saving }: any) => (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-blue-100)' }}>
              <Upload className="w-6 h-6" style={{ color: 'var(--color-blue-600)' }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {t('Document Upload', 'दस्तावेज़ अपलोड')}</h2>
              <p style={{ color: 'var(--text-secondary)' }}>{t('Upload required documents', 'आवश्यक दस्तावेज़ अपलोड करें')}</p>
            </div>
          </div>

          <div className="card p-6 border-2" style={{ backgroundColor: 'var(--color-blue-50)', borderColor: 'var(--color-blue-200)' }}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <FileText className="w-5 h-5" />
              {t('Upload Guidelines', 'अपलोड दिशानिर्देश')}</h3>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-semibold">•</span>
                <span>{t('Accepted formats: PDF, JPG, JPEG', 'स्वीकृत प्रारूप: PDF, JPG, JPEG')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-semibold">•</span>
                <span>{t('Maximum file size: 5 MB per document', 'अधिकतम फ़ाइल आकार: 5 MB प्रति दस्तावेज़')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-semibold">•</span>
                <span>{t('Ensure documents are clear and readable', 'सुनिश्चित करें कि दस्तावेज़ स्पष्ट और पढ़ने योग्य हैं')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-semibold">•</span>
                <span>{t('Drag and drop files or click to browse', 'फ़ाइलें ड्रैग और ड्रॉप करें या ब्राउज़ करने के लिए क्लिक करें')}</span>
              </li>
            </ul>
          </div>

          {/* Required Documents Checklist */}
          <div className="card p-4 border-2" style={{ backgroundColor: 'var(--color-gray-50)', borderColor: 'var(--border-primary)' }}>
            <h3 className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <CheckCircle className="w-5 h-5" />
              {t('Required Documents Checklist', 'आवश्यक दस्तावेज़ चेकलिस्ट')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { key: 'photoFile', label: t('Passport Size Photo', 'पासपोर्ट आकार का फोटो'), required: true },
                { key: 'birthCertificate', label: t('Birth Certificate', 'जन्म प्रमाण पत्र'), required: true },
                { key: 'marksheet', label: t('Educational Marksheet', 'शैक्षणिक अंकपत्र'), required: true },
                { key: 'recommendationLetter', label: t('Recommendation Letter', 'अनुशंसा पत्र'), required: false },
              ].map((doc) => {
                const uploaded = !!data[doc.key];
                return (
                  <div key={doc.key} className="flex items-center gap-2 py-1.5 px-2 rounded" style={{ backgroundColor: uploaded ? 'var(--color-green-50, #f0fdf4)' : 'transparent' }}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      uploaded ? 'bg-green-200 text-green-800' : doc.required ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {uploaded ? '✓' : doc.required ? '!' : '—'}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      {doc.label}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      uploaded ? 'bg-green-100 text-green-700' : doc.required ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {uploaded ? t('Uploaded', 'अपलोड') : doc.required ? t('Required', 'आवश्यक') : t('Optional', 'वैकल्पिक')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <FileUpload
              label={t('Recent Passport Size Photo', 'हालिया पासपोर्ट आकार का फोटो')}
              value={data.photoFile || null}
              onChange={(file) => onChange('photoFile', file)}
              error={errors.photoFile}
              required
              accept=".jpg,.jpeg,.pdf"
              maxSize={5 * 1024 * 1024}
              showPreview={true}
            />

            <FileUpload
              label={t('Birth Certificate', 'जन्म प्रमाण पत्र')}
              value={data.birthCertificate || null}
              onChange={(file) => onChange('birthCertificate', file)}
              error={errors.birthCertificate}
              required
              accept=".jpg,.jpeg,.pdf"
              maxSize={5 * 1024 * 1024}
              showPreview={true}
            />

            <div className="card p-6 border-2" style={{ borderColor: 'var(--border-primary)' }}>
              <FileUpload
                label={t('Educational Marksheet/Certificate', 'शैक्षणिक अंकपत्र/प्रमाण पत्र')}
                value={data.marksheet || null}
                onChange={(file) => onChange('marksheet', file)}
                error={errors.marksheet}
                required
                accept=".jpg,.jpeg,.pdf"
                maxSize={5 * 1024 * 1024}
                showPreview={true}
              />
            </div>

            <div className="card p-6 border-2" style={{ borderColor: 'var(--border-primary)' }}>
              <FileUpload
                label={t('Medical Fitness Certificate (from MBBS Doctor)', 'चिकित्सा फिटनेस प्रमाण पत्र (MBBS डॉक्टर से)')}
                value={data.medicalFitnessCertificate || null}
                onChange={(file) => onChange('medicalFitnessCertificate', file)}
                error={errors.medicalFitnessCertificate}
                required
                accept=".jpg,.jpeg,.pdf"
                maxSize={5 * 1024 * 1024}
                showPreview={true}
              />
            </div>

            <div className="card p-6 border-2" style={{ borderColor: 'var(--border-primary)' }}>
              <FileUpload
                label={t('Community Recommendation Letter (Optional)', 'सामुदायिक अनुशंसा पत्र (वैकल्पिक)')}
                value={data.recommendationLetter || null}
                onChange={(file) => onChange('recommendationLetter', file)}
                accept=".jpg,.jpeg,.pdf"
                maxSize={5 * 1024 * 1024}
                showPreview={true}
              />
            </div>
          </div>
        </div>
      ),
      validate: (data: any) => {
        const errors: any = {};
        if (!data.photoFile) errors.photoFile = 'Photo is required';
        if (!data.birthCertificate) errors.birthCertificate = 'Birth certificate is required';
        if (!data.marksheet) errors.marksheet = 'Marksheet is required';
        if (!data.medicalFitnessCertificate) errors.medicalFitnessCertificate = 'Medical fitness certificate is required';
        return Object.keys(errors).length > 0 ? errors : null;
      },
    },
    {
      id: 'review',
      title: 'Review & Submit',
      description: 'Review before submitting',
      component: ({ data }: any) => (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-green-100)' }}>
              <CheckCircle className="w-6 h-6" style={{ color: 'var(--color-green-600)' }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {t('Review Your Application', 'अपने आवेदन की समीक्षा करें')}</h2>
              <p style={{ color: 'var(--text-secondary)' }}>{t('Please review all details before submitting', 'कृपया जमा करने से पहले सभी विवरणों की समीक्षा करें')}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="card p-6 border-2" style={{ borderColor: 'var(--border-primary)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                {t('Personal Details', 'व्यक्तिगत विवरण')}</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {data.firstName} {data.middleName} {data.lastName}</p>
                <p><strong>Mobile:</strong> {data.applicantMobile}</p>
                <p><strong>Email:</strong> {data.applicantEmail}</p>
                <p><strong>Date of Birth:</strong> {data.dob}</p>
                <p><strong>Gender:</strong> {data.gender}</p>
                <p><strong>Blood Group:</strong> {data.bloodGroup}</p>
                <p><strong>Address:</strong> {data.addressLine1}, {data.addressLine2}, {data.city}, {data.state} - {data.pinCode}</p>
                <p><strong>Father:</strong> {data.fatherName} — {data.fatherOccupation} ({data.fatherMobile})</p>
                <p><strong>Mother:</strong> {data.motherName} — {data.motherOccupation} ({data.motherMobile})</p>
                <p><strong>Emergency Contact:</strong> {data.emergencyContactPerson} ({data.emergencyMobile})</p>
              </div>
            </div>

            <div className="card p-6 border-2" style={{ borderColor: 'var(--border-primary)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                {t('Academic Information', 'शैक्षणिक जानकारी')}</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Institution:</strong> {data.institution}</p>
                <p><strong>Course:</strong> {data.course}</p>
                <p><strong>Year:</strong> {data.year}</p>
                <p><strong>Percentage/CGPA:</strong> {data.percentage}</p>
                <p><strong>Qualification:</strong> {data.qualification}</p>
                <p><strong>Board/University:</strong> {data.board}</p>
                <p><strong>Passing Year:</strong> {data.passingYear}</p>
              </div>
            </div>

            <div className="card p-6 border-2" style={{ borderColor: 'var(--border-primary)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                {t('Hostel Preferences', 'छात्रावास प्राथमिकताएं')}</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Vertical:</strong> {data.vertical === 'girls-ashram' ? 'Girls Ashram' : data.vertical === 'girls-ashram' ? 'Girls Ashram' : 'Dharamshala'}</p>
                <p><strong>Room Type:</strong> {data.roomType}</p>
                <p><strong>Duration:</strong> {data.duration}</p>
                <p><strong>Joining Date:</strong> {data.joiningDate}</p>
              </div>
            </div>

            <div className="card p-6 border-2" style={{ borderColor: 'var(--border-primary)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                {t('Reference 1', 'संदर्भ 1')}</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {data.ref1Name}</p>
                <p><strong>Mobile:</strong> {data.ref1Mobile}</p>
                <p><strong>Year of Stay:</strong> {data.ref1Year}</p>
                {data.ref1Relationship && <p><strong>Relationship:</strong> {data.ref1Relationship}</p>}
              </div>
            </div>

            {data.ref2Name && (
              <div className="card p-6 border-2" style={{ borderColor: 'var(--border-primary)' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  {t('Reference 2', 'संदर्भ 2')}</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {data.ref2Name}</p>
                  <p><strong>Mobile:</strong> {data.ref2Mobile}</p>
                  <p><strong>Year of Stay:</strong> {data.ref2Year}</p>
                  {data.ref2Relationship && <p><strong>Relationship:</strong> {data.ref2Relationship}</p>}
                </div>
              </div>
            )}

            <div className="card p-6 border-2" style={{ borderColor: 'var(--border-primary)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                {t('Documents', 'दस्तावेज़')}</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Photo:</strong> {data.photoFile?.name || 'Not uploaded'}</p>
                <p><strong>Birth Certificate:</strong> {data.birthCertificate?.name || 'Not uploaded'}</p>
                <p><strong>Marksheet:</strong> {data.marksheet?.name || 'Not uploaded'}</p>
                <p><strong>Medical Fitness Certificate:</strong> {data.medicalFitnessCertificate?.name || 'Not uploaded'}</p>
                {data.recommendationLetter && (
                  <p><strong>Recommendation Letter:</strong> {data.recommendationLetter.name}</p>
                )}
              </div>
            </div>
          </div>

          <div className="card p-6 border-2" style={{ backgroundColor: 'var(--color-blue-50)', borderColor: 'var(--color-blue-200)' }}>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              {t('Declaration', 'घोषणा')}</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              {t('I hereby declare that all the information provided above is true and correct to the best of my knowledge. I understand that any false information may result in rejection of my application.', 'मैं एतद्द्वारा घोषणा करता/करती हूं कि ऊपर दी गई सभी जानकारी मेरी सर्वोत्तम जानकारी के अनुसार सत्य और सही है। मैं समझता/समझती हूं कि कोई भी गलत जानकारी मेरे आवेदन की अस्वीकृति का कारण बन सकती है।')}</p>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1"
                required
              />
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                {t('I agree to the terms and conditions and declare that the information provided is accurate', 'मैं नियम और शर्तों से सहमत हूं और घोषणा करता/करती हूं कि प्रदान की गई जानकारी सटीक है')}</span>
            </label>
          </div>
        </div>
      ),
      validate: (data: any) => {
        return null;
      },
    },
  ];

  const handleSaveDraft = async (data: any, step: number) => {
    try {
      localStorage.setItem('application_draft_girls-ashram', JSON.stringify(data));
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to save draft:', error);
      throw new Error('Failed to save draft locally');
    }
  };

  const uploadDocument = async (file: File, documentType: string, tempId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    formData.append('application_id', tempId);

    const response = await fetch('/api/applications/documents/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to upload ${documentType}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || `Failed to upload ${documentType}`);
    }

    return result.data;
  };

  const handleSubmit = async (data: any) => {
    try {
      const documentFields = ['photoFile', 'birthCertificate', 'marksheet', 'medicalFitnessCertificate', 'recommendationLetter'];
      const submissionData = { ...data };
      for (const fieldName of documentFields) {
        if (submissionData[fieldName] instanceof File) {
          delete submissionData[fieldName];
        }
      }

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...submissionData,
          applicant_mobile: data.applicantMobile || localStorage.getItem('otp_verified_mobile') || '',
          applicant_email: data.applicantEmail || localStorage.getItem('otp_verified_email') || '',
          vertical: 'girls-ashram',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({} as any));
        const errorMessage = errorData.message || errorData.error || 'Failed to submit application';
        throw new Error(errorMessage);
      }

      const result = await response.json();
      const application = result.data || result;
      const applicationId = application.id;
      const trackingNumber = application.trackingNumber || application.tracking_number;

      for (const fieldName of documentFields) {
        const file = data[fieldName];
        if (file instanceof File) {
          try {
            await uploadDocument(file, fieldName, applicationId);
          } catch (uploadError: any) {
            console.warn(`Document upload for ${fieldName} failed (can be re-uploaded later):`, uploadError);
          }
        }
      }

      localStorage.removeItem('application_draft_girls-ashram');
      setPendingApplicationId(applicationId);
      setPendingTrackingNumber(trackingNumber);
    } catch (error: any) {
      console.error('Failed to submit application:', error);
      setPaymentError(error.message || 'Submission failed');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading application form...</p>
        </div>
      </div>
    );
  }

  if (pendingApplicationId) {
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
            <Link href="/apply" className="flex items-center gap-3">
              <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              <div>
                <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
                  {t('Girls Ashram Application', 'बालिका आश्रम आवेदन')}</h1>
                <p className="text-caption">{t('Application Form', 'आवेदन पत्र')}</p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/" className="nav-link">{t('Home', 'होम')}</Link>
                <Link href="/apply" className="nav-link">{t('Apply Now', 'अभी आवेदन करें')}</Link>
                <Link href="/check-status" className="nav-link">{t('Check Status', 'स्थिति जांचें')}</Link>
                <Link href="/login" className="nav-link">{t('Login', 'लॉगिन')}</Link>
              </nav>
              <LanguageToggle />
            </div>
          </div>
        </header>

        <main className="px-6 py-12">
          <div className="mx-auto max-w-5xl">
            <div className="card">
              <div className="p-6 md:p-8">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {t('Admission Fee Payment', 'प्रवेश शुल्क भुगतान')}
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {t(
                      `Your application ${pendingTrackingNumber} is saved. Complete the ₹500 admission fee to submit it for review.`,
                      `आपका आवेदन ${pendingTrackingNumber} सहेज लिया गया है। समीक्षा हेतु जमा करने के लिए ₹500 प्रवेश शुल्क पूर्ण करें।`,
                    )}
                  </p>
                </div>

                <AdmissionFeeStep
                  applicationId={pendingApplicationId}
                  onSuccess={() => router.push(`/track/${pendingTrackingNumber}?paid=1`)}
                  onFailure={(reason) => setPaymentError(reason)}
                />

                {paymentError && (
                  <div
                    className="mt-4 p-4 rounded-lg border-l-4"
                    style={{
                      backgroundColor: 'var(--color-red-50, #fef2f2)',
                      borderLeftColor: 'var(--color-red-500, #ef4444)',
                    }}
                  >
                    <p className="text-sm font-medium" style={{ color: 'var(--color-red-700, #b91c1c)' }}>
                      {paymentError}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
          <Link href="/apply" className="flex items-center gap-3">
            <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            <div>
              <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
                {t('Girls Ashram Application', 'बालिका आश्रम आवेदन')}</h1>
              <p className="text-caption">{t('Application Form', 'आवेदन पत्र')}</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="nav-link">{t('Home', 'होम')}</Link>
              <Link href="/apply" className="nav-link">{t('Apply Now', 'अभी आवेदन करें')}</Link>
              <Link href="/check-status" className="nav-link">{t('Check Status', 'स्थिति जांचें')}</Link>
              <Link href="/login" className="nav-link">{t('Login', 'लॉगिन')}</Link>
            </nav>
            <LanguageToggle />
          </div>
        </div>
      </header>

      <main className="px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <FormWizard
            steps={wizardSteps}
            initialData={initialData}
            onSaveDraft={handleSaveDraft}
            onSubmit={handleSubmit}
            onSubmitLabel="Submit Application"
          />
        </div>
      </main>
    </div>
  );
}
