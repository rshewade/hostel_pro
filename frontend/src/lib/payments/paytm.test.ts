import { describe, it, expect, vi } from 'vitest';

// vi.stubEnv must run BEFORE imports — the paytm module reads process.env at load time.
vi.stubEnv('PAYTM_ENV', 'staging');
vi.stubEnv('PAYTM_MID', 'TESTMID');
vi.stubEnv('PAYTM_MERCHANT_KEY', 'TESTKEY123456789');
vi.stubEnv('PAYTM_WEBSITE', 'WEBSTAGING');
vi.stubEnv('PAYTM_CALLBACK_URL', 'http://localhost:3000/cb');

import {
  getPaytmConfig,
  getPaytmBaseUrl,
  generateOrderId,
  generateChecksum,
  verifyChecksum,
} from './paytm';

describe('paytm config', () => {
  it('returns staging base URL when PAYTM_ENV=staging', () => {
    expect(getPaytmBaseUrl('staging')).toBe('https://securegw-stage.paytm.in');
  });

  it('reads MID and merchant key from env', () => {
    const cfg = getPaytmConfig();
    expect(cfg.mid).toBe('TESTMID');
    expect(cfg.merchantKey).toBe('TESTKEY123456789');
    expect(cfg.website).toBe('WEBSTAGING');
  });
});

describe('generateOrderId', () => {
  it('produces a unique order id of length <= 50', () => {
    const a = generateOrderId('app-uuid-1');
    const b = generateOrderId('app-uuid-1');
    expect(a).not.toBe(b);
    expect(a.length).toBeLessThanOrEqual(50);
    expect(a.startsWith('ADM')).toBe(true);
  });
});

describe('checksum round-trip', () => {
  it('generates and verifies a checksum for the same payload', async () => {
    const params = { ORDERID: 'ADM_TEST_1', MID: 'TESTMID', AMOUNT: '500.00' };
    const checksum = await generateChecksum(params);
    expect(typeof checksum).toBe('string');
    expect(checksum.length).toBeGreaterThan(0);
    const ok = await verifyChecksum(params, checksum);
    expect(ok).toBe(true);
  });

  it('rejects a tampered payload', async () => {
    const params = { ORDERID: 'ADM_TEST_2', MID: 'TESTMID', AMOUNT: '500.00' };
    const checksum = await generateChecksum(params);
    const tampered = { ...params, AMOUNT: '1.00' };
    const ok = await verifyChecksum(tampered, checksum);
    expect(ok).toBe(false);
  });
});
