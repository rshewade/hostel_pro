'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components';
import { useLanguage } from '@/contexts/LanguageContext';

// Types
type Allocation = {
  id: string;
  student_id: string;
  room_id: string;
  allocated_at: string;
  status: 'ACTIVE' | 'VACATED';
  check_in_confirmed: boolean;
  check_in_confirmed_at?: string;
  notes?: string;
};

type Room = {
  id: string;
  room_number: string;
  vertical: string;
  floor: number;
  capacity: number;
  occupied_count: number;
  amenities?: string[];
};

type Roommate = {
  id: string;
  full_name: string;
  bed_number: number;
  check_in_confirmed: boolean;
};

export default function StudentRoomPage() {
  const { t } = useLanguage();
  const [allocation, setAllocation] = useState<Allocation | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    // Get student ID from localStorage (stored during login)
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('authToken');

    if (userId) {
      setStudentId(userId);
    } else if (token) {
      try {
        // Fallback: try to decode from JWT token
        if (token.includes('.')) {
          const payload = token.split('.')[1];
          const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
          const tokenData = JSON.parse(atob(base64));
          setStudentId(tokenData.sub);
        } else {
          const tokenData = JSON.parse(atob(token));
          setStudentId(tokenData.userId);
        }
      } catch (e) {
        console.error('Error decoding token:', e);
        setError('Authentication error. Please login again.');
      }
    } else {
      setError('Please login to view room details.');
    }
  }, []);

  useEffect(() => {
    if (studentId) {
      fetchAllocationData();
    }
  }, [studentId]);

  const fetchAllocationData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch student's allocation
      const token = localStorage.getItem('authToken');
      const authHeaders: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};
      const allocationsResponse = await fetch(`/api/allocations?student_id=${studentId}`, { headers: authHeaders });
      const allocationsResult = await allocationsResponse.json();
      // API returns { success: true, data: [...] }
      const allocationsData = allocationsResult.data || allocationsResult || [];

      const studentAllocation = (Array.isArray(allocationsData) ? allocationsData : []).find(
        (a: any) => (a.student_user_id === studentId || a.student_id === studentId) && a.status === 'ACTIVE'
      );

      if (!studentAllocation) {
        setError('No room allocation found. Please contact the administrator.');
        setLoading(false);
        return;
      }

      setAllocation(studentAllocation);

      // Fetch room details
      const roomsResponse = await fetch('/api/rooms', { headers: authHeaders });
      const roomsResult = await roomsResponse.json();
      const roomsList = roomsResult.data || roomsResult || [];
      const roomData = (Array.isArray(roomsList) ? roomsList : []).find((r: Room) => r.id === studentAllocation.room_id);

      if (roomData) {
        setRoom(roomData);
      }

      // Fetch roommates (other students in the same room)
      const allRoomAllocations = (Array.isArray(allocationsData) ? allocationsData : []).filter(
        (a: any) => a.room_id === studentAllocation.room_id && a.status === 'ACTIVE'
      );

      const roommatesData = await Promise.all(
        allRoomAllocations
          .filter((a: any) => (a.student_user_id || a.student_id) !== studentId)
          .map(async (allocation: any, index: number) => {
            try {
              const oderId = allocation.student_user_id || allocation.student_id;
              const response = await fetch(`/api/users/profile?user_id=${oderId}`, { headers: authHeaders });
              if (response.ok) {
                const data = await response.json();
                const userData = data.data || data;
                return {
                  id: oderId,
                  full_name: userData.full_name || userData.profile?.full_name || 'Student',
                  bed_number: index + 2,
                  check_in_confirmed: allocation.check_in_confirmed || false,
                };
              }
            } catch (err) {
              console.error('Error fetching roommate:', err);
            }
            const oderId2 = allocation.student_user_id || allocation.student_id;
            return {
              id: oderId2,
              full_name: 'Student',
              bed_number: index + 2,
              check_in_confirmed: allocation.check_in_confirmed || false,
            };
          })
      );

      setRoommates(roommatesData);
    } catch (err) {
      console.error('Error fetching allocation data:', err);
      setError('Failed to load room information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInClick = () => {
    // Navigate to check-in confirmation page (to be implemented)
    window.location.href = '/dashboard/student/room/check-in';
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <div className="text-center">
          <div className="text-heading-3 mb-2" style={{ color: 'var(--text-primary)' }}>
            {t('Loading...', 'लोड हो रहा है...')}
          </div>
          <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
            {t('Fetching your room details', 'आपके कमरे का विवरण प्राप्त हो रहा है')}
          </p>
        </div>
      </div>
    );
  }

  if (error || !allocation || !room) {
    return (
      <div className="min-h-screen p-6" style={{ background: 'var(--bg-page)' }}>
        <div className="max-w-2xl mx-auto">
          <div className="p-6 rounded-lg border border-red-200 bg-red-50">
            <h2 className="text-heading-3 text-red-700 mb-2">{t('Unable to Load Room Information', 'कमरे की जानकारी लोड करने में असमर्थ')}</h2>
            <p className="text-body text-red-600">{error || 'Room information not available'}</p>
            <Button variant="primary" size="md" onClick={fetchAllocationData} className="mt-4">
              {t('Retry', 'पुनः प्रयास करें')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const availableAmenities = room.amenities || ['Bed', 'Study Table', 'Cupboard', 'Chair', 'Ceiling Fan'];
  const checkInStatus = allocation.check_in_confirmed ? 'Confirmed' : 'Pending';

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--bg-page)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {t('My Room', 'मेरा कमरा')}
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            {t('View your room details and check-in status', 'अपने कमरे का विवरण और चेक-इन स्थिति देखें')}
          </p>
        </div>

        {/* Check-in Status Banner */}
        {!allocation.check_in_confirmed && (
          <div className="mb-6 p-4 rounded-lg border-l-4 border-yellow-500 bg-yellow-50">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-heading-4 text-yellow-800 mb-1">{t('Check-in Required', 'चेक-इन आवश्यक')}</h3>
                <p className="text-body-sm text-yellow-700">
                  {t('You have been allocated a room. Please complete your check-in to confirm your occupancy.', 'आपको एक कमरा आवंटित किया गया है। कृपया अपनी अधिवास पुष्टि करने के लिए चेक-इन पूरा करें।')}
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={handleCheckInClick}>
                {t('Check In Now', 'अभी चेक-इन करें')}
              </Button>
            </div>
          </div>
        )}

        {allocation.check_in_confirmed && (
          <div className="mb-6 p-4 rounded-lg border-l-4 border-green-500 bg-green-50">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-heading-4 text-green-800 mb-1">{t('Check-in Confirmed', 'चेक-इन पुष्टि')}</h3>
                <p className="text-body-sm text-green-700">
                  You checked in on {new Date(allocation.check_in_confirmed_at!).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="text-2xl">✓</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Room Details Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-lg" style={{ background: 'var(--surface-primary)' }}>
              <h2 className="text-heading-2 mb-4" style={{ color: 'var(--text-primary)' }}>
                {t('Room Details', 'कमरे का विवरण')}
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-body-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                    {t('Room Number', 'कमरा नंबर')}
                  </div>
                  <div className="text-heading-3" style={{ color: 'var(--text-primary)' }}>
                    {room.room_number}
                  </div>
                </div>

                <div>
                  <div className="text-body-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                    {t('Floor', 'मंजिल')}
                  </div>
                  <div className="text-heading-3" style={{ color: 'var(--text-primary)' }}>
                    {room.floor}
                  </div>
                </div>

                <div>
                  <div className="text-body-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                    {t('Vertical', 'वर्टिकल')}
                  </div>
                  <div className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                    {room.vertical.replace('_', ' ')}
                  </div>
                </div>

                <div>
                  <div className="text-body-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                    {t('Capacity', 'क्षमता')}
                  </div>
                  <div className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                    {room.capacity} beds
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="text-body-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                    {t('Allocated On', 'आवंटन तिथि')}
                  </div>
                  <div className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                    {new Date(allocation.allocated_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-heading-4 mb-3" style={{ color: 'var(--text-primary)' }}>
                  {t('Room Amenities', 'कमरे की सुविधाएं')}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {availableAmenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 rounded"
                      style={{ background: 'var(--surface-secondary)' }}
                    >
                      <span className="text-green-600">✓</span>
                      <span className="text-body-sm" style={{ color: 'var(--text-primary)' }}>
                        {amenity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {allocation.notes && (
                <div className="mt-6 p-4 rounded-lg" style={{ background: 'var(--surface-secondary)' }}>
                  <h3 className="text-body font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    {t('Special Notes', 'विशेष नोट्स')}
                  </h3>
                  <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                    {allocation.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Roommates Card */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-lg sticky top-6" style={{ background: 'var(--surface-primary)' }}>
              <h2 className="text-heading-3 mb-4" style={{ color: 'var(--text-primary)' }}>
                {t('Roommates', 'रूममेट')}
              </h2>

              {roommates.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🚪</div>
                  <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                    {t('No other roommates yet', 'अभी तक कोई अन्य रूममेट नहीं')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {roommates.map((roommate) => (
                    <div
                      key={roommate.id}
                      className="p-3 rounded-lg border"
                      style={{
                        background: 'var(--surface-secondary)',
                        borderColor: 'var(--border-primary)',
                      }}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                          {roommate.full_name}
                        </div>
                        {roommate.check_in_confirmed && (
                          <span className="text-green-600 text-sm">✓</span>
                        )}
                      </div>
                      <div className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                        Bed {roommate.bed_number}
                      </div>
                      <div className="text-body-sm mt-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs ${
                            roommate.check_in_confirmed
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {roommate.check_in_confirmed ? t('Checked In', 'चेक-इन हो गया') : t('Not Checked In', 'चेक-इन नहीं हुआ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Room Occupancy */}
              <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                <div className="text-body-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  {t('Room Occupancy', 'कमरे की अधिभोग')}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--surface-secondary)' }}>
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${(room.occupied_count / room.capacity) * 100}%` }}
                    />
                  </div>
                  <div className="text-body-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {room.occupied_count} / {room.capacity}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          {!allocation.check_in_confirmed && (
            <Button variant="primary" size="md" onClick={handleCheckInClick}>
              {t('Complete Check-in', 'चेक-इन पूरा करें')}
            </Button>
          )}
          <Button variant="secondary" size="md" onClick={fetchAllocationData}>
            {t('Refresh Data', 'डेटा रिफ्रेश करें')}
          </Button>
        </div>
      </div>
    </div>
  );
}
