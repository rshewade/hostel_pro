# Applicant Registration & OTP Verification API Documentation

## Overview

This document provides comprehensive API guidance for implementing the applicant registration and OTP verification flow, including endpoint specifications, error handling, session management, and security considerations.

## API Endpoints

### 1. Send OTP

**Endpoint**: `POST /api/otp/send`

**Request Body**:
```json
{
  "phone": "9876543210", // Required if contactMethod is "phone"
  "email": "applicant@example.com", // Required if contactMethod is "email"
  "vertical": "boys-hostel" | "girls-ashram" | "dharamshala",
  "contactMethod": "phone" | "email"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": 600, // seconds
  "trackingId": "APP202512210001" // Optional: for tracking
  "token": "abc123def456..." // Session token for next step
}
```

**Error Responses**:

**400 Bad Request**:
```json
{
  "success": false,
  "error": "INVALID_PHONE",
  "message": "Please enter a valid 10-digit Indian mobile number"
}
```

**429 Too Many Requests**:
```json
{
  "success": false,
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many OTP requests. Please wait 10 minutes before trying again.",
  "retryAfter": 600 // seconds
}
```

**500 Server Error**:
```json
{
  "success": false,
  "error": "INTERNAL_ERROR",
  "message": "Unable to send OTP. Please try again later."
}
```

### 2. Verify OTP

**Endpoint**: `POST /api/otp/verify`

**Request Body**:
```json
{
  "code": "123456",
  "token": "abc123def456...", // From previous step
  "attempts": 1, // Optional: track attempt count
  "userAgent": "Mozilla/5.0..." // Optional: security tracking
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "sessionToken": "jwt_session_token_abc123...", // Short-lived session token (15 minutes)
  "expiresAt": "2025-12-21T18:30:00Z",
  "nextStep": "/apply/boys-hostel/form",
  "redirectUrl": "https://hostel.example.com/apply/boys-hostel/form"
}
```

**Error Responses**:

**400 Invalid OTP**:
```json
{
  "success": false,
  "error": "INVALID_OTP",
  "message": "The OTP you entered is invalid or expired",
  "remainingAttempts": 2
}
```

**403 Too Many Attempts**:
```json
{
  "success": false,
  "error": "MAX_ATTEMPTS_EXCEEDED",
  "message": "Maximum attempts exceeded. Please request a new OTP or contact support.",
  "lockoutTime": 900, // 15 minutes lockout
  "contactSupport": true
}
```

**410 Token Expired**:
```json
{
  "success": false,
  "error": "TOKEN_EXPIRED",
  "message": "Your session has expired. Please start over."
}
```

### 3. Resend OTP

**Endpoint**: `POST /api/otp/resend`

**Request Body**:
```json
{
  "token": "abc123def456...", // From previous OTP send
  "reason": "user_request" | "auto_resend" | "security_timeout"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "New OTP sent successfully",
  "expiresIn": 600,
  "trackingId": "APP202512210002",
  "token": "new_jwt_token_xyz789..."
}
```

## Error States & Handling

### Validation Errors

| Error Type | HTTP Status | User Message | Recovery Action |
|------------|-------------|-------------|----------------|
| Invalid Phone | 400 | "Please enter a valid 10-digit mobile number" | Show format hint |
| Missing Email | 400 | "Email address is required" | Highlight email field |
| Invalid Email | 400 | "Please enter a valid email address" | Show format hint |
| Network Error | 500+ | "Network error. Please try again." | Retry button, offline support |
| Rate Limit | 429 | "Too many requests. Wait 10 minutes." | Countdown timer, disable button |
| Server Error | 500 | "Service temporarily unavailable" | Retry with exponential backoff |

### OTP-Specific Errors

| Error | User Message | Technical Details |
|-------|-------------|------------------|
| Invalid Code | "The OTP you entered is incorrect" | Increment attempts counter |
| Expired Code | "OTP has expired (10 minutes)" | Clear input, show resend |
| Max Attempts | "Maximum 3 attempts exceeded" | Lockout 15 minutes, contact support |
| Session Timeout | "Session expired due to inactivity" | Redirect to start, clear local storage |

## Session Management

### Token Types

1. **Initial Token** (from OTP send):
   - Purpose: Link phone/email to OTP verification
   - Lifetime: 30 minutes
   - Single-use: Can be used only once for verification

2. **Session Token** (after OTP verify):
   - Purpose: Access application form without full authentication
   - Lifetime: 15 minutes
   - Auto-renew: Extend on user activity
   - Storage: Session storage (not persistent)

### Security Headers

```javascript
// API Security Headers
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'"
};
```

## Rate Limiting & Abuse Prevention

### Implementation Rules

```javascript
const rateLimitConfig = {
  // Per phone number
  otpSend: {
    maxRequests: 3,
    windowMinutes: 10,
    blockDurationMinutes: 10
  },
  // Per IP address
  ipDaily: {
    maxRequests: 50,
    windowHours: 24
  },
  // Per session
  verification: {
    maxAttempts: 3,
    lockoutMinutes: 15,
    cooldownMinutes: 5
  }
};
```

### Pseudo-Code Implementation

```javascript
// Database Schema (for reference)
const otpStore = {
  phone: String,
  email: String,
  otp: String,
  token: String,
  attempts: Number,
  expiresAt: Date,
  isVerified: Boolean,
  createdAt: Date
};

// Send OTP Implementation
async function sendOTP(req, res) {
  const { phone, email, vertical, contactMethod } = req.body;
  
  // Input validation
  const validationErrors = validateContactInput(phone, email, contactMethod);
  if (validationErrors.length > 0) {
    return res.status(400).json({
      success: false,
      error: validationErrors[0].code,
      message: validationErrors[0].message
    });
  }

  // Rate limiting check
  const rateLimitResult = await checkRateLimit(phone || email, req.ip);
  if (!rateLimitResult.allowed) {
    return res.status(429).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: rateLimitResult.message,
      retryAfter: rateLimitResult.retryAfter
    });
  }

  try {
    // Generate secure 6-digit OTP
    const otp = generateSecureOTP();
    const expiresAt = new Date(Date.now() + 600 * 1000);
    
    // Store OTP in database
    await storeOTP({
      phone: phone || null,
      email: email || null,
      otp: hashOTP(otp), // Store hashed version
      vertical,
      attempts: 1,
      expiresAt,
      isVerified: false
    });

    // Send OTP via appropriate channel
    if (contactMethod === 'phone') {
      await sendSMS(phone, otp);
    } else {
      await sendEmail(email, otp);
    }

    // Generate session token
    const token = generateSessionToken({ phone, email, vertical, purpose: 'otp_verification' });

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 600,
      trackingId: generateTrackingId(),
      token,
      expiresAt: expiresAt.toISOString()
    });

  } catch (error) {
    logger.error('OTP Send Error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Unable to send OTP. Please try again later.'
    });
  }
}

// Verify OTP Implementation
async function verifyOTP(req, res) {
  const { code, token, userAgent } = req.body;
  
  // Validate session token
  const sessionData = await validateSessionToken(token);
  if (!sessionData || sessionData.purpose !== 'otp_verification') {
    return res.status(410).json({
      success: false,
      error: 'TOKEN_EXPIRED',
      message: 'Your session has expired. Please start over.'
    });
  }

  // Check attempts
  if (sessionData.attempts >= 3) {
    return res.status(403).json({
      success: false,
      error: 'MAX_ATTEMPTS_EXCEEDED',
      message: 'Maximum attempts exceeded. Please request a new OTP or contact support.',
      lockoutTime: 900,
      contactSupport: true
    });
  }

  try {
    // Retrieve stored OTP
    const storedOTPData = await getOTP(sessionData.phone, sessionData.email);
    
    if (!storedOTPData || !storedOTPData.otp) {
      return res.status(400).json({
        success: false,
        error: 'OTP_NOT_FOUND',
        message: 'OTP not found for this contact.'
      });
    }

    // Check expiration
    if (Date.now() > storedOTPData.expiresAt) {
      return res.status(400).json({
        success: false,
        error: 'OTP_EXPIRED',
        message: 'OTP has expired. Please request a new OTP.'
      });
    }

    // Verify OTP
    const isValidOTP = await compareOTP(code, storedOTPData.otp);
    
    if (!isValidOTP) {
      // Increment attempts
      await incrementOTPAttempts(sessionData.phone, sessionData.email);
      
      return res.status(400).json({
        success: false,
        error: 'INVALID_OTP',
        message: 'The OTP you entered is invalid or expired',
        remainingAttempts: 3 - sessionData.attempts
      });
    }

    // Success - Mark as verified
    await markOTPVerified(sessionData.phone, sessionData.email);

    // Generate application session token
    const appToken = generateSessionToken({
      ...sessionData,
      purpose: 'application_form',
      permissions: ['submit_application', 'upload_documents'],
      expiresIn: 900 // 15 minutes
    });

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      sessionToken: appToken,
      expiresAt: new Date(Date.now() + 900 * 1000).toISOString(),
      nextStep: `/apply/${sessionData.vertical}/form`,
      redirectUrl: `${process.env.BASE_URL}/apply/${sessionData.vertical}/form`
    });

  } catch (error) {
    logger.error('OTP Verify Error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Unable to verify OTP. Please try again.'
    });
  }
}
```

## Integration Guidelines

### Frontend Implementation

```typescript
interface OTPService {
  sendOTP: (data: OTPSendRequest) => Promise<OTPResponse>;
  verifyOTP: (data: OTPVerifyRequest) => Promise<OTPVerifyResponse>;
  resendOTP: (token: string, reason?: string) => Promise<OTPResponse>;
}

// Error handling pattern
const handleOTPError = (error: APIError) => {
  switch (error.code) {
    case 'RATE_LIMIT_EXCEEDED':
      showRateLimitDialog(error.retryAfter);
      disableOTPSendButton(error.retryAfter);
      break;
    
    case 'MAX_ATTEMPTS_EXCEEDED':
      showLockoutMessage();
      redirectToContact();
      break;
    
    case 'TOKEN_EXPIRED':
      showExpiredMessage();
      redirectToStart();
      break;
    
    default:
      showGenericError(error.message);
      enableRetry();
  }
};
```

### Security Considerations

1. **OTP Security**
   - Use cryptographically secure random generation
   - Hash stored OTPs in database
   - Limit OTP lifetime to 10 minutes
   - Clear OTPs after verification

2. **Session Management**
   - Use short-lived tokens (15 minutes max)
   - Implement automatic timeout
   - Clear session storage on expiry

3. **Rate Limiting**
   - Per phone number: 3 requests per 10 minutes
   - Per IP: 50 requests per 24 hours
   - Progressive backoff for repeated failures

4. **Data Protection (DPDP Compliance)**
   - Log all OTP send/verify attempts
   - Include purpose and consent records
   - Auto-delete expired OTP data
   - Minimal data collection

### Testing Scenarios

1. **Happy Path**: 
   - Valid phone → OTP sent → OTP verified → Application form
   - Time: ~30 seconds end-to-end

2. **Error Paths**:
   - Invalid phone → Format error message
   - Rate limit → Countdown timer with retry
   - Expired OTP → Clear fields, show resend option
   - Max attempts → Lockout with support contact

3. **Edge Cases**:
   - Network disconnection during send → Retry mechanism
   - Page refresh during OTP → Restore from session storage
   - Multiple tabs → Sync state across tabs
   - Mobile paste support → Handle 6-digit paste

This API documentation provides comprehensive guidance for implementing secure, user-friendly OTP verification with proper error handling and security measures.