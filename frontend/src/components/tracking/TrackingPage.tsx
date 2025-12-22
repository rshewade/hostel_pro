import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

type ApplicationStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'INTERVIEW_SCHEDULED' | 'INTERVIEW_COMPLETED' | 'PROVISIONALLY_APPROVED' | 'FINAL_APPROVED' | 'REJECTED';

interface TimelineStep {
  step: number;
  title: string;
  description?: string;
  completed?: boolean;
  date?: string;
  time?: string;
  status?: ApplicationStatus;
}

interface TrackingData {
  trackingNumber: string;
  applicantName: string;
  vertical: string;
  appliedDate: string;
  currentStatus: ApplicationStatus;
  interviewDetails?: {
    mode: 'ONLINE' | 'PHYSICAL';
    date?: string;
    time?: string;
    venue?: string;
    meetingLink?: string;
    status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
    countdown?: {
      days?: number;
      hours?: number;
      minutes?: number;
    };
  };
  documentsRequired?: boolean;
  actions?: {
    canReupload: boolean;
    canConfirmInterview?: boolean;
    canDownloadLetter?: boolean;
    canWithdraw?: boolean;
  };
}

interface TrackingPageProps {
  trackingId: string;
}

export const TrackingPage: React.FC<TrackingPageProps> = ({ trackingId }) => {
  // Mock data - in real implementation, this would come from API
  const [trackingData, setTrackingData] = React.useState<TrackingData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate API call to fetch tracking data
    setTimeout(() => {
      const mockData: TrackingData = {
        trackingNumber: trackingId.toUpperCase(),
        applicantName: 'Rahul Kumar Sharma',
        vertical: 'BOYS_HOSTEL',
        appliedDate: '2024-12-15',
        currentStatus: 'UNDER_REVIEW',
        interviewDetails: {
          mode: 'ONLINE',
          date: '2025-01-10',
          time: '10:00 AM',
          venue: 'Google Meet - https://meet.google.com/xyz-abc123',
          meetingLink: 'https://meet.google.com/xyz-abc123',
          status: 'UPCOMING',
          countdown: {
            days: 2,
            hours: 14,
            minutes: 30
          }
        },
        documentsRequired: true,
        actions: {
          canReupload: true,
          canConfirmInterview: true,
          canDownloadLetter: false
        }
      };
      
      setTrackingData(mockData);
      setIsLoading(false);
    }, 1000);

  const getStatusColor = (status: ApplicationStatus): string => {
    switch (status) {
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800';
      case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800';
      case 'INTERVIEW_SCHEDULED': return 'bg-orange-100 text-orange-800';
      case 'INTERVIEW_COMPLETED': return 'bg-green-100 text-green-800';
      case 'PROVISIONALLY_APPROVED': return 'bg-purple-100 text-purple-800';
      case 'FINAL_APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status: ApplicationStatus): { text: string; color: string } => {
    switch (status) {
      case 'SUBMITTED': return { text: 'Submitted', color: 'bg-blue-500' };
      case 'UNDER_REVIEW': return { text: 'Under Review', color: 'bg-yellow-500' };
      case 'INTERVIEW_SCHEDULED': return { text: 'Interview Scheduled', color: 'bg-orange-500' };
      case 'INTERVIEW_COMPLETED': return { text: 'Interview Completed', color: 'bg-green-500' };
      case 'PROVISIONALLY_APPROVED': return { text: 'Provisionally Approved', color: 'bg-purple-500' };
      case 'FINAL_APPROVED': return { text: 'Final Approved', color: 'bg-green-500' };
      case 'REJECTED': return { text: 'Rejected', color: 'bg-red-500' };
      default: return { text: 'Unknown', color: 'bg-gray-500' };
    }
  };

  const timelineSteps: TimelineStep[] = [
    { step: 1, title: 'Submitted', description: 'Application submitted successfully' },
    { step: 2, title: 'Under Review', description: 'Application is being reviewed by committee' },
    { step: 3, title: 'Interview', description: 'Interview scheduled with superintendent' },
    { step: 4, title: 'Decision', description: 'Final decision by trustee' },
    { step: 5, title: 'Result', description: `Application ${trackingData?.currentStatus === 'FINAL_APPROVED' ? 'approved' : 'rejected'}` }
  ];

  const getStepStatus = (step: number): 'completed' | 'current' | 'upcoming' => {
    const currentStatusStep = timelineSteps.findIndex(s => s.title.toLowerCase().includes(trackingData?.currentStatus?.toLowerCase() || ''));
    return {
      completed: step < currentStatusStep,
      current: step === currentStatusStep,
      upcoming: step > currentStatusStep
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-200"></div>
      </div>
    );
  }

  if (!trackingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <div className="text-center p-8">
            <div className="text-red-600 text-lg mb-4">⚠️ Tracking ID not found</div>
            <p className="text-gray-600">Please check your tracking ID and try again.</p>
            <Button onClick={() => window.history.back()} className="mt-4">Go Back</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-xl font-semibold text-gray-900">Application Tracking</div>
              </div>
              <Button variant="ghost" onClick={() => window.history.back()}>Back to Home</Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-6 py-8">
          {/* Applicant Summary */}
          <Card className="lg:col-span-2">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Summary</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Tracking Number</p>
                    <p className="font-medium text-gray-900">{trackingData.trackingNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Applicant Name</p>
                    <p className="font-medium text-gray-900">{trackingData.applicantName}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Vertical</p>
                    <p className="font-medium text-gray-900">{trackingData.vertical}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Applied Date</p>
                    <p className="font-medium text-gray-900">{trackingData.appliedDate}</p>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Status</h3>
                <div className="relative">
                  {/* Desktop: Horizontal Timeline */}
                  <div className="hidden lg:block">
                    <div className="absolute top-8 left-0 right-0 h-1 bg-blue-200"></div>
                    <div className="flex justify-between items-center relative">
                      {timelineSteps.map((step, index) => {
                        const status = getStepStatus(step.step);
                        return (
                          <div key={step.step} className="flex flex-col items-center">
                            <div 
                              className={cn(
                                'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold',
                                status.completed ? 'bg-green-500' : status.current ? 'bg-blue-500' : status.upcoming ? 'bg-gray-400' : 'bg-gray-200'
                              )}
                            >
                              {status.completed ? '✓' : step.step}
                            </div>
                            <div className="ml-4 text-center">
                              <div className="text-sm font-medium text-gray-900">{step.title}</div>
                              {step.description && (
                                <div className="text-xs text-gray-600 mt-1">{step.description}</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mobile: Vertical Timeline */}
                  <div className="lg:hidden space-y-4">
                    {timelineSteps.map((step, index) => {
                      const status = getStepStatus(step.step);
                      return (
                        <div key={step.step} className={cn('flex items-start p-4', status.completed ? 'bg-green-50' : status.current ? 'bg-blue-50' : status.upcoming ? 'bg-gray-50' : 'bg-gray-100')}>
                          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0', status.completed ? 'bg-green-500' : status.current ? 'bg-blue-500' : status.upcoming ? 'bg-gray-400' : 'bg-gray-300')}>
                            {status.completed ? '✓' : step.step}
                          </div>
                          <div className="ml-4 flex-grow">
                            <div className="text-sm font-medium text-gray-900">{step.title}</div>
                            {step.description && (
                              <div className="text-xs text-gray-600 mt-1">{step.description}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Interview Details */}
          {trackingData.interviewDetails && (
            <Card className="lg:col-span-1">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Mode</p>
                      <p className="font-medium text-gray-900">
                        {trackingData.interviewDetails.mode === 'ONLINE' ? 'Online Interview' : 'Physical Interview'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-medium text-gray-900">
                        {trackingData.interviewDetails.date} at {trackingData.interviewDetails.time}
                      </p>
                    </div>
                  </div>

                  {trackingData.interviewDetails.venue && (
                    <div>
                      <p className="text-sm text-gray-600">Venue</p>
                      <p className="font-medium text-gray-900">{trackingData.interviewDetails.venue}</p>
                    </div>
                  )}

                  {trackingData.interviewDetails.meetingLink && (
                    <div>
                      <p className="text-sm text-gray-600">Meeting Link</p>
                      <a 
                        href={trackingData.interviewDetails.meetingLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:text-blue-800 underline"
                      >
                        {trackingData.interviewDetails.meetingLink}
                      </a>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge {...getStatusBadge(trackingData.interviewDetails.status)} />
                  </div>

                  {trackingData.interviewDetails.countdown && (
                    <div>
                      <p className="text-sm text-gray-600">Time Until Interview</p>
                      <p className="font-medium text-orange-600">
                        {trackingData.interviewDetails.countdown.days} days, {trackingData.interviewDetails.countdown.hours} hours, {trackingData.interviewDetails.countdown.minutes} minutes
                      </p>
                    </div>
                  )}
                </div>

                {/* Interview Status Actions */}
                {trackingData.interviewDetails.status === 'UPCOMING' && trackingData.actions?.canConfirmInterview && (
                  <div className="mt-6">
                    <Button className="w-full">
                      Confirm Interview Slot
                    </Button>
                  </div>
                )}

                {trackingData.interviewDetails.status === 'COMPLETED' && (
                  <div className="mt-6">
                    <Badge text="Completed" color="bg-green-500" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Prompts */}
          <Card className="lg:col-span-1">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              
              {/* Alert for Document Re-upload */}
              {trackingData.documentsRequired && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v6a2 2 0 00-2 2h10a2 2 0 002 2v4a2 2 0 01-2 2h12a2 2 0 002-2v8a2 2 0 011-2h6a2 2 0 011-2h2a2 2 0 01-1v2a1 1 0 01-1h2m-2 2v4a1 1 0 01-1h3m10-11l2 9-1a1 1 0 002-2h2a1 1 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Document Re-upload Required</p>
                      <p className="text-sm text-gray-600 mt-1">Please upload updated documents to continue processing</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Download Provisional Letter */}
              {trackingData.actions?.canDownloadLetter && (
                <Button className="w-full mb-4">
                  Download Provisional Letter
                </Button>
              )}

              {/* Withdraw Application */}
              {trackingData.actions?.canWithdraw && (
                <Button variant="outline" className="w-full">
                  Withdraw Application
                </Button>
              )}

              {/* Contact Support */}
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600">
            For assistance, please contact the admissions office at +91 22 2414 1234
          </p>
        </div>
      </div>
    </div>
  );
};