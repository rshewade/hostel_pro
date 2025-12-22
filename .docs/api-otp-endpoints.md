# OTP API Endpoints Documentation

## Overview

Mock API endpoints for OTP (One-Time Password) verification flow during prototyping phase. These endpoints simulate SMS/Email OTP sending and verification without actually sending messages.

**Created**: 2025-12-22
**Phase**: Prototyping (db.json)
**Purpose**: Frontend development and testing

---

## Endpoints

### 1. POST `/api/otp/send`

Sends OTP to user's phone or email and returns a verification token.

#### Request

```typescript
POST /api/otp/send
Content-Type: application/json

{
  "phone"?: string,    // 10-digit mobile number (6-9 prefix)
  "email"?: string,    // Valid email address
  "vertical": string   // "boys-hostel" | "girls-ashram" | "dharamshala"
}
```

**Validation Rules**:
- Either `phone` OR `email` is required (not both)
- `vertical` is required
- Phone format: `^[6-9]\d{9}$` (10 digits starting with 6-9)
- Email format: Standard email regex

#### Response

**Success (200)**:
```json
{
  "success": true,
  "token": "base64-encoded-token",
  "expiresIn": 600,
  "message": "OTP sent to 9876543210. Check your SMS messages.",
  "devOTP": "123456"  // Only in development mode
}
```

**Error (400)**:
```json
{
  "message": "Either phone or email is required"
}
```

**Error (500)**:
```json
{
  "message": "Internal server error"
}
```

#### Mock Behavior

- Always generates OTP: `123456`
- Token contains: contact info, vertical, timestamp, OTP
- Logs OTP to console for development testing
- Simulates 500ms network delay
- No actual SMS/Email sent

#### Console Output

```
========================================
📱 MOCK OTP SENT
========================================
Contact: 9876543210
Vertical: boys-hostel
OTP Code: 123456
Token: eyJjb250YWN0Ij...
Expires In: 600 seconds (10 minutes)
========================================
```

---

### 2. POST `/api/otp/verify`

Verifies the OTP code and returns a session token if valid.

#### Request

```typescript
POST /api/otp/verify
Content-Type: application/json

{
  "code": string,        // 6-digit OTP
  "token": string,       // Token from /api/otp/send
  "attempts": number,    // Current attempt count (0-based)
  "userAgent"?: string   // Browser user agent
}
```

**Validation Rules**:
- `code` must be 6-digit number
- `token` is required and must be valid base64
- `attempts` must be < 3
- Token must not be expired (< 10 minutes old)

#### Response

**Success (200)**:
```json
{
  "success": true,
  "sessionToken": "base64-encoded-session-token",
  "message": "OTP verified successfully",
  "redirect": "/apply/boys-hostel/form"
}
```

**Error (400)**:
```json
{
  "message": "OTP must be a 6-digit number"
}
```

**Error (401)**:
```json
{
  "message": "Invalid OTP. 2 attempts remaining."
}
```

**Error (429)**:
```json
{
  "message": "Too many failed attempts. Please request a new OTP."
}
```

#### Mock Behavior

- Accepts OTP: `123456` (always valid in development)
- Validates token expiration (10 minutes)
- Tracks attempt count (max 3 attempts)
- Generates session token on success
- Simulates 300ms network delay
- Logs verification to console

#### Console Output

```
========================================
✅ OTP VERIFIED SUCCESSFULLY
========================================
Contact: 9876543210
Vertical: boys-hostel
Attempts: 1
User Agent: Mozilla/5.0...
Session Token: eyJjb250YWN0Ij...
========================================
```

---

### 3. POST `/api/otp/resend`

Resends OTP with a new token (rate-limited).

#### Request

```typescript
POST /api/otp/resend
Content-Type: application/json

{
  "token": string,    // Original token from /api/otp/send
  "reason": string    // "user_request" | "expired" | etc.
}
```

**Validation Rules**:
- `token` is required and must be valid
- Must wait 60 seconds between resend requests

#### Response

**Success (200)**:
```json
{
  "success": true,
  "token": "new-base64-encoded-token",
  "expiresIn": 600,
  "message": "New OTP sent to 9876543210",
  "devOTP": "123456"  // Only in development mode
}
```

**Error (401)**:
```json
{
  "message": "Invalid token"
}
```

**Error (429)**:
```json
{
  "message": "Please wait 45 seconds before requesting a new OTP"
}
```

#### Mock Behavior

- Generates new OTP: `123456`
- Creates new token with updated timestamp
- Rate limits: min 60 seconds between resends
- Simulates 500ms network delay
- Logs resend to console

#### Console Output

```
========================================
🔄 MOCK OTP RESENT
========================================
Contact: 9876543210
Vertical: boys-hostel
Reason: user_request
New OTP Code: 123456
New Token: eyJjb250YWN0Ij...
Expires In: 600 seconds (10 minutes)
========================================
```

---

## Frontend Integration

### Contact Page Flow

```typescript
// 1. Send OTP
const response = await fetch('/api/otp/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone: phoneNumber,  // OR email: emailAddress
    vertical: 'boys-hostel'
  })
});

const data = await response.json();

// 2. Navigate to verify page with token
window.location.href = `/apply/boys-hostel/verify?token=${encodeURIComponent(data.token)}`;
```

### Verify Page Flow

```typescript
// 1. Get token from URL
const token = new URLSearchParams(window.location.search).get('token');

// 2. Verify OTP
const response = await fetch('/api/otp/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: otp.join(''),
    token: token,
    attempts: attempts,
    userAgent: navigator.userAgent
  })
});

// 3. Navigate to form on success
if (response.ok) {
  window.location.href = '/apply/boys-hostel/form';
}
```

### Resend OTP Flow

```typescript
const response = await fetch('/api/otp/resend', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: currentToken,
    reason: 'user_request'
  })
});

const data = await response.json();
// Update token and reset timer
setCurrentToken(data.token);
setTimeLeft(600);
```

---

## Token Structure

### OTP Token (from /send and /resend)

```typescript
{
  contact: string,      // Phone or email
  vertical: string,     // Application vertical
  timestamp: number,    // Unix timestamp (ms)
  otp: string,         // Mock OTP code
  resent?: boolean     // True if from resend endpoint
}
```

### Session Token (from /verify)

```typescript
{
  contact: string,      // Phone or email
  vertical: string,     // Application vertical
  verified: true,       // Verification status
  timestamp: number,    // Unix timestamp (ms)
  sessionId: string    // Random session identifier
}
```

---

## Testing Guide

### Manual Testing

1. **Test OTP Send**:
   ```bash
   curl -X POST http://localhost:3000/api/otp/send \
     -H "Content-Type: application/json" \
     -d '{"phone":"9876543210","vertical":"boys-hostel"}'
   ```

2. **Test OTP Verify**:
   ```bash
   curl -X POST http://localhost:3000/api/otp/verify \
     -H "Content-Type: application/json" \
     -d '{"code":"123456","token":"<token-from-send>","attempts":0}'
   ```

3. **Test OTP Resend**:
   ```bash
   curl -X POST http://localhost:3000/api/otp/resend \
     -H "Content-Type: application/json" \
     -d '{"token":"<token-from-send>","reason":"user_request"}'
   ```

### Frontend Testing

1. Navigate to `/apply/boys-hostel/contact`
2. Enter phone number: `9876543210`
3. Click "Send OTP"
4. Check console for OTP code (always `123456`)
5. Enter OTP: `123456`
6. Click "Verify & Continue"
7. Should redirect to form page

### Test Cases

| Scenario | Input | Expected Result |
|----------|-------|----------------|
| Valid phone | 9876543210 | OTP sent, token returned |
| Invalid phone | 1234567890 | Error: Invalid format |
| Missing vertical | No vertical | Error: Vertical required |
| Valid OTP | 123456 | Verification success |
| Invalid OTP | 111111 | Error: Invalid OTP |
| Expired token | Old token | Error: OTP expired |
| Too many attempts | attempts >= 3 | Error: Too many attempts |
| Resend too soon | < 60 seconds | Error: Wait message |

---

## Production Implementation Notes

### When Moving to Production

These mock endpoints need to be replaced with:

1. **OTP Generation**:
   - Random 6-digit code generation
   - Store hashed OTP in database
   - Set expiration timestamp

2. **SMS/Email Integration**:
   - Integrate with Twilio/AWS SNS for SMS
   - Integrate with SendGrid/AWS SES for Email
   - Handle delivery failures

3. **Security**:
   - Rate limiting per contact (5 sends per hour)
   - Rate limiting per IP (10 sends per hour)
   - Attempt tracking in database
   - Token encryption with JWT
   - HTTPS only

4. **Database Schema**:
   ```sql
   CREATE TABLE otp_verifications (
     id UUID PRIMARY KEY,
     contact VARCHAR(255) NOT NULL,
     otp_hash VARCHAR(255) NOT NULL,
     vertical VARCHAR(50) NOT NULL,
     attempts INT DEFAULT 0,
     expires_at TIMESTAMP NOT NULL,
     verified_at TIMESTAMP,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

5. **Audit Logging**:
   - Log all OTP sends/verifications
   - Track IP addresses
   - Monitor for abuse patterns

---

## Error Handling

### Common Errors

| Error Code | Cause | Solution |
|------------|-------|----------|
| 400 | Invalid input | Check request format |
| 401 | Invalid OTP/token | Verify OTP code |
| 429 | Rate limit exceeded | Wait and retry |
| 500 | Server error | Check logs |

### Client-Side Handling

```typescript
try {
  const response = await fetch('/api/otp/send', {...});

  if (!response.ok) {
    const error = await response.json();
    setErrors([error.message]);
    return;
  }

  const data = await response.json();
  // Handle success
} catch (err) {
  setErrors(['Network error. Please try again.']);
}
```

---

## Files Modified/Created

### Created Files

1. `/frontend/src/app/api/otp/send/route.ts` - Send OTP endpoint
2. `/frontend/src/app/api/otp/verify/route.ts` - Verify OTP endpoint
3. `/frontend/src/app/api/otp/resend/route.ts` - Resend OTP endpoint

### Modified Files

1. `/frontend/src/app/apply/boys-hostel/contact/page.tsx`
   - Updated to pass token to verify page
   - Improved error handling

---

## Development Notes

- All endpoints log to console in development
- OTP is always `123456` for easy testing
- No actual messages sent
- No database persistence
- Rate limiting is mock (60 second minimum)

**Next Steps**:
- Test complete OTP flow
- Add form page for post-verification
- Implement session management
- Add proper error boundaries

---

**Status**: ✅ Complete - Ready for frontend testing
**Environment**: Development (Prototyping Phase)
**Version**: 1.0.0
