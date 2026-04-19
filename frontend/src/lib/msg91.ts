import { logger } from './logger';

/**
 * MSG91 OTP API client.
 *
 * MSG91 handles OTP generation, delivery (SMS/Voice), and verification.
 * In development mode, all calls are skipped and a hardcoded OTP '123456' is assumed.
 *
 * Required env vars:
 *   MSG91_AUTH_KEY   – API auth key from MSG91 dashboard
 *   MSG91_TEMPLATE_ID – DLT-approved OTP template ID
 *
 * @see https://docs.msg91.com/reference/send-otp
 */

const MSG91_BASE_URL = 'https://control.msg91.com/api/v5';

function getConfig() {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;

  if (!authKey || !templateId) {
    throw new Error(
      'MSG91 configuration missing. Set MSG91_AUTH_KEY and MSG91_TEMPLATE_ID in .env'
    );
  }

  return { authKey, templateId };
}

function isDev(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Format phone number to international format for MSG91.
 * MSG91 expects country code prefix (e.g., 91XXXXXXXXXX for India).
 */
function formatPhone(phone: string): string {
  // Strip any spaces, dashes, or + prefix
  const cleaned = phone.replace(/[\s\-+]/g, '');

  // If already has country code (91 prefix and 12 digits), return as-is
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return cleaned;
  }

  // Indian 10-digit number — prepend 91
  if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
    return `91${cleaned}`;
  }

  return cleaned;
}

export interface Msg91Response {
  success: boolean;
  message: string;
  type?: string;
  request_id?: string;
}

/**
 * Send OTP via MSG91.
 * MSG91 generates the OTP internally and sends it via SMS.
 *
 * @param phone - 10-digit Indian mobile number
 * @param email - Optional email for OTP delivery (MSG91 supports email channel)
 */
export async function sendOtp(
  phone?: string,
  email?: string
): Promise<Msg91Response> {
  if (isDev()) {
    logger.info('MSG91: Dev mode — skipping OTP send', { phone, email });
    return { success: true, message: 'OTP sent (dev mode)', type: 'success' };
  }

  const { authKey, templateId } = getConfig();
  const formattedPhone = phone ? formatPhone(phone) : undefined;

  const body: Record<string, unknown> = {
    template_id: templateId,
    mobile: formattedPhone,
    otp_length: 6,
    otp_expiry: 5, // minutes
  };

  // MSG91 supports email channel alongside SMS
  if (email) {
    body.email = email;
  }

  try {
    const response = await fetch(`${MSG91_BASE_URL}/otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authkey: authKey,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok || data.type === 'error') {
      logger.error('MSG91: OTP send failed', {
        status: response.status,
        response: data,
      });
      return {
        success: false,
        message: data.message || 'Failed to send OTP',
        type: data.type,
        request_id: data.request_id,
      };
    }

    logger.info('MSG91: OTP sent successfully', {
      phone: formattedPhone,
      request_id: data.request_id,
    });

    return {
      success: true,
      message: data.message || 'OTP sent successfully',
      type: data.type,
      request_id: data.request_id,
    };
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    logger.error('MSG91: OTP send request failed', { error: errMsg });
    return { success: false, message: `MSG91 API error: ${errMsg}` };
  }
}

/**
 * Verify OTP via MSG91.
 * MSG91 checks the OTP it generated internally.
 *
 * @param phone - 10-digit Indian mobile number
 * @param otp - 6-digit OTP entered by user
 */
export async function verifyOtp(
  phone: string,
  otp: string
): Promise<Msg91Response> {
  if (isDev()) {
    const isValid = otp === '123456';
    logger.info('MSG91: Dev mode — verifying OTP', { phone, isValid });
    return isValid
      ? { success: true, message: 'OTP verified (dev mode)', type: 'success' }
      : { success: false, message: 'Invalid OTP', type: 'error' };
  }

  const { authKey } = getConfig();
  const formattedPhone = formatPhone(phone);

  try {
    const url = `${MSG91_BASE_URL}/otp/verify?mobile=${formattedPhone}&otp=${otp}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        authkey: authKey,
      },
    });

    const data = await response.json();

    if (!response.ok || data.type === 'error') {
      logger.error('MSG91: OTP verify failed', {
        status: response.status,
        response: data,
      });
      return {
        success: false,
        message: data.message || 'OTP verification failed',
        type: data.type,
      };
    }

    logger.info('MSG91: OTP verified successfully', { phone: formattedPhone });

    return {
      success: true,
      message: data.message || 'OTP verified successfully',
      type: data.type,
    };
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    logger.error('MSG91: OTP verify request failed', { error: errMsg });
    return { success: false, message: `MSG91 API error: ${errMsg}` };
  }
}

/**
 * Resend/Retry OTP via MSG91.
 * MSG91 resends the same OTP through the specified channel.
 *
 * @param phone - 10-digit Indian mobile number
 * @param retryType - Channel to retry: 'text' (SMS), 'voice', or 'email'
 */
export async function resendOtp(
  phone: string,
  retryType: 'text' | 'voice' | 'email' = 'text'
): Promise<Msg91Response> {
  if (isDev()) {
    logger.info('MSG91: Dev mode — skipping OTP resend', { phone, retryType });
    return { success: true, message: 'OTP resent (dev mode)', type: 'success' };
  }

  const { authKey } = getConfig();
  const formattedPhone = formatPhone(phone);

  try {
    const url = `${MSG91_BASE_URL}/otp/retry?mobile=${formattedPhone}&retrytype=${retryType}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        authkey: authKey,
      },
    });

    const data = await response.json();

    if (!response.ok || data.type === 'error') {
      logger.error('MSG91: OTP resend failed', {
        status: response.status,
        response: data,
      });
      return {
        success: false,
        message: data.message || 'Failed to resend OTP',
        type: data.type,
      };
    }

    logger.info('MSG91: OTP resent successfully', {
      phone: formattedPhone,
      retryType,
    });

    return {
      success: true,
      message: data.message || 'OTP resent successfully',
      type: data.type,
    };
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    logger.error('MSG91: OTP resend request failed', { error: errMsg });
    return { success: false, message: `MSG91 API error: ${errMsg}` };
  }
}
