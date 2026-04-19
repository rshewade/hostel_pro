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
};

type Room = {
  id: string;
  room_number: string;
  vertical: string;
  floor: number;
  capacity: number;
};

type InventoryItem = {
  id: string;
  name: string;
  expected_quantity: number;
  verified: boolean;
  actual_quantity: number;
  notes: string;
};

const DEFAULT_INVENTORY: Omit<InventoryItem, 'verified' | 'actual_quantity' | 'notes'>[] = [
  { id: 'bed', name: 'Bed with Mattress', expected_quantity: 1 },
  { id: 'table', name: 'Study Table', expected_quantity: 1 },
  { id: 'chair', name: 'Chair', expected_quantity: 1 },
  { id: 'cupboard', name: 'Cupboard', expected_quantity: 1 },
  { id: 'fan', name: 'Ceiling Fan', expected_quantity: 1 },
  { id: 'light', name: 'Light Fixture', expected_quantity: 1 },
  { id: 'windows', name: 'Windows (Working)', expected_quantity: 1 },
  { id: 'door_lock', name: 'Door Lock', expected_quantity: 1 },
];

export default function CheckInPage() {
  const { t } = useLanguage();
  const [allocation, setAllocation] = useState<Allocation | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Checklist states
  const [inventory, setInventory] = useState<InventoryItem[]>(() =>
    DEFAULT_INVENTORY.map((item) => ({
      ...item,
      verified: false,
      actual_quantity: item.expected_quantity,
      notes: '',
    }))
  );
  const [roomConditionOk, setRoomConditionOk] = useState(false);
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState('');
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
      setError('Please login to complete check-in.');
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
      const allocationsData = allocationsResult.data || allocationsResult || [];

      const studentAllocation = (Array.isArray(allocationsData) ? allocationsData : []).find(
        (a: any) => (a.student_user_id === studentId || a.student_id === studentId) && a.status === 'ACTIVE'
      );

      if (!studentAllocation) {
        setError('No room allocation found.');
        setLoading(false);
        return;
      }

      if (studentAllocation.check_in_confirmed) {
        // Redirect to room page if already checked in
        window.location.href = '/dashboard/student/room';
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
    } catch (err) {
      console.error('Error fetching allocation data:', err);
      setError('Failed to load room information.');
    } finally {
      setLoading(false);
    }
  };

  const handleInventoryToggle = (id: string) => {
    setInventory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, verified: !item.verified } : item))
    );
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    setInventory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, actual_quantity: Math.max(0, quantity) } : item))
    );
  };

  const handleNotesChange = (id: string, notes: string) => {
    setInventory((prev) => prev.map((item) => (item.id === id ? { ...item, notes } : item)));
  };

  const handleSubmitCheckIn = async () => {
    // Validation
    const unverifiedItems = inventory.filter((item) => !item.verified);
    if (unverifiedItems.length > 0) {
      setError('Please verify all inventory items before proceeding.');
      return;
    }

    if (!roomConditionOk) {
      setError('Please confirm the room condition is acceptable.');
      return;
    }

    if (!rulesAccepted) {
      setError('Please accept the room rules and regulations.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // In production, this would call a dedicated check-in API endpoint
      // For now, we'll update the allocation directly
      const response = await fetch(`/api/allocations/${allocation?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          check_in_confirmed: true,
          check_in_confirmed_at: new Date().toISOString(),
          inventory_acknowledged: true,
          inventory_acknowledged_at: new Date().toISOString(),
          notes: additionalNotes,
          metadata: { check_in_inventory: inventory },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to confirm check-in');
      }

      // Redirect to room page on success
      window.location.href = '/dashboard/student/room?checked_in=true';
    } catch (err) {
      console.error('Error submitting check-in:', err);
      setError('Failed to complete check-in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <div className="text-center">
          <div className="text-heading-3 mb-2" style={{ color: 'var(--text-primary)' }}>
            {t('Loading...', 'लोड हो रहा है...')}
          </div>
          <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
            {t('Preparing check-in process', 'चेक-इन प्रक्रिया तैयार हो रही है')}
          </p>
        </div>
      </div>
    );
  }

  if (error && !allocation) {
    return (
      <div className="min-h-screen p-6" style={{ background: 'var(--bg-page)' }}>
        <div className="max-w-2xl mx-auto">
          <div className="p-6 rounded-lg border border-red-200 bg-red-50">
            <h2 className="text-heading-3 text-red-700 mb-2">{t('Unable to Process Check-in', 'चेक-इन संसाधित करने में असमर्थ')}</h2>
            <p className="text-body text-red-600">{error}</p>
            <Button
              variant="primary"
              size="md"
              onClick={() => (window.location.href = '/dashboard/student/room')}
              className="mt-4"
            >
              {t('Go Back', 'वापस जाएं')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const allItemsVerified = inventory.every((item) => item.verified);
  const canSubmit = allItemsVerified && roomConditionOk && rulesAccepted && !submitting;

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--bg-page)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {t('Room Check-in', 'कमरा चेक-इन')}
          </h1>
          <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
            {t(`Complete the inventory verification and confirm your check-in for Room ${room?.room_number}`, `कमरा ${room?.room_number} के लिए इन्वेंटरी सत्यापन पूरा करें और अपने चेक-इन की पुष्टि करें`)}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--surface-primary)' }}>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-body-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                {t('Progress', 'प्रगति')}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--surface-secondary)' }}>
                  <div
                    className="h-2 rounded-full bg-blue-500 transition-all"
                    style={{
                      width: `${
                        ((inventory.filter((i) => i.verified).length / inventory.length) * 100 +
                          (roomConditionOk ? 20 : 0) +
                          (rulesAccepted ? 20 : 0)) /
                        1.4
                      }%`,
                    }}
                  />
                </div>
                <div className="text-body-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {Math.round(
                    ((inventory.filter((i) => i.verified).length / inventory.length) * 100 +
                      (roomConditionOk ? 20 : 0) +
                      (rulesAccepted ? 20 : 0)) /
                      1.4
                  )}
                  %
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50">
            <p className="text-body text-red-700">{error}</p>
          </div>
        )}

        {/* Inventory Checklist */}
        <div className="mb-6 p-6 rounded-lg" style={{ background: 'var(--surface-primary)' }}>
          <h2 className="text-heading-2 mb-4" style={{ color: 'var(--text-primary)' }}>
            {t('Inventory Verification', 'इन्वेंटरी सत्यापन')}
          </h2>
          <p className="text-body mb-4" style={{ color: 'var(--text-secondary)' }}>
            {t('Please verify all items are present and in good condition. Report any discrepancies in the notes.', 'कृपया सत्यापित करें कि सभी वस्तुएं मौजूद हैं और अच्छी स्थिति में हैं। किसी भी विसंगति की रिपोर्ट नोट्स में करें।')}
          </p>

          <div className="space-y-4">
            {inventory.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  item.verified ? 'border-green-500 bg-green-50' : ''
                }`}
                style={{
                  borderColor: item.verified ? undefined : 'var(--border-primary)',
                  background: item.verified ? undefined : 'var(--surface-secondary)',
                }}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={item.verified}
                    onChange={() => handleInventoryToggle(item.id)}
                    className="mt-1 w-5 h-5 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                        {item.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                          {t('Quantity', 'मात्रा')}:
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={item.actual_quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 rounded border text-center"
                          style={{
                            borderColor: 'var(--border-primary)',
                            background: 'var(--surface-primary)',
                            color: 'var(--text-primary)',
                          }}
                        />
                        <span className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                          / {item.expected_quantity}
                        </span>
                      </div>
                    </div>

                    {item.actual_quantity !== item.expected_quantity && (
                      <div className="mb-2 text-body-sm text-orange-600">
                        ⚠️ Quantity mismatch - please add notes below
                      </div>
                    )}

                    <input
                      type="text"
                      placeholder="Add notes if there are any issues..."
                      value={item.notes}
                      onChange={(e) => handleNotesChange(item.id, e.target.value)}
                      className="w-full px-3 py-2 rounded border text-body-sm"
                      style={{
                        borderColor: 'var(--border-primary)',
                        background: 'var(--surface-primary)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Room Condition Confirmation */}
        <div className="mb-6 p-6 rounded-lg" style={{ background: 'var(--surface-primary)' }}>
          <h2 className="text-heading-3 mb-4" style={{ color: 'var(--text-primary)' }}>
            {t('Room Condition', 'कमरे की स्थिति')}
          </h2>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={roomConditionOk}
              onChange={(e) => setRoomConditionOk(e.target.checked)}
              className="mt-1 w-5 h-5 cursor-pointer"
            />
            <div>
              <div className="text-body font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                {t('I confirm that the room is in acceptable condition', 'मैं पुष्टि करता/करती हूं कि कमरा स्वीकार्य स्थिति में है')}
              </div>
              <div className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                {t('The room is clean, all fixtures are working, and there are no visible damages that were not reported above.', 'कमरा साफ है, सभी फिक्सचर काम कर रहे हैं, और ऊपर रिपोर्ट नहीं किए गए कोई दृश्य नुकसान नहीं हैं।')}
              </div>
            </div>
          </label>
        </div>

        {/* Rules and Regulations */}
        <div className="mb-6 p-6 rounded-lg" style={{ background: 'var(--surface-primary)' }}>
          <h2 className="text-heading-3 mb-4" style={{ color: 'var(--text-primary)' }}>
            {t('Rules and Regulations', 'नियम और विनियम')}
          </h2>

          <div className="mb-4 p-4 rounded-lg" style={{ background: 'var(--surface-secondary)' }}>
            <ul className="space-y-2 text-body-sm" style={{ color: 'var(--text-primary)' }}>
              <li>• Keep the room clean and maintain proper hygiene</li>
              <li>• No smoking or consumption of alcohol/drugs in the premises</li>
              <li>• Respect quiet hours (10 PM - 6 AM)</li>
              <li>• Report any damages or maintenance issues immediately</li>
              <li>• Do not make structural changes without permission</li>
              <li>• Visitors must follow hostel guidelines</li>
              <li>• You are responsible for room items during your stay</li>
            </ul>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={rulesAccepted}
              onChange={(e) => setRulesAccepted(e.target.checked)}
              className="mt-1 w-5 h-5 cursor-pointer"
            />
            <div>
              <div className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                {t('I accept and agree to follow all room rules and regulations', 'मैं सभी कमरे के नियमों और विनियमों का पालन करने के लिए स्वीकार करता/करती हूं और सहमत हूं')}
              </div>
            </div>
          </label>
        </div>

        {/* Additional Notes */}
        <div className="mb-6 p-6 rounded-lg" style={{ background: 'var(--surface-primary)' }}>
          <h2 className="text-heading-3 mb-4" style={{ color: 'var(--text-primary)' }}>
            {t('Additional Notes (Optional)', 'अतिरिक्त नोट्स (वैकल्पिक)')}
          </h2>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder={t('Any other observations or requests...', 'कोई अन्य अवलोकन या अनुरोध...')}
            rows={4}
            className="w-full px-3 py-2 rounded border"
            style={{
              borderColor: 'var(--border-primary)',
              background: 'var(--surface-secondary)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmitCheckIn}
            disabled={!canSubmit}
            loading={submitting}
            fullWidth
          >
            {submitting ? t('Confirming Check-in...', 'चेक-इन की पुष्टि हो रही है...') : t('Confirm Check-in', 'चेक-इन की पुष्टि करें')}
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => (window.location.href = '/dashboard/student/room')}
            disabled={submitting}
          >
            {t('Cancel', 'रद्द करें')}
          </Button>
        </div>

        {!canSubmit && !submitting && (
          <div className="mt-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
            <p className="text-body-sm text-yellow-700">
              {t('Please complete all verifications to proceed with check-in', 'चेक-इन के साथ आगे बढ़ने के लिए कृपया सभी सत्यापन पूरे करें')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
