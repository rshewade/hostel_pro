import PaytmChecksum from 'paytmchecksum';
import { randomBytes } from 'crypto';

export interface PaytmConfig {
  env: 'staging' | 'production';
  mid: string;
  merchantKey: string;
  website: string;
  callbackUrl: string;
}

export function getPaytmConfig(): PaytmConfig {
  const env = (process.env.PAYTM_ENV || 'staging') as 'staging' | 'production';
  const mid = process.env.PAYTM_MID || '';
  const merchantKey = process.env.PAYTM_MERCHANT_KEY || '';
  const website = process.env.PAYTM_WEBSITE || (env === 'production' ? 'DEFAULT' : 'WEBSTAGING');
  const callbackUrl = process.env.PAYTM_CALLBACK_URL || '';
  if (!mid || !merchantKey) {
    throw new Error('Paytm env vars not configured: PAYTM_MID and PAYTM_MERCHANT_KEY required');
  }
  return { env, mid, merchantKey, website, callbackUrl };
}

export function getPaytmBaseUrl(): string {
  const env = process.env.PAYTM_ENV || 'staging';
  return env === 'production'
    ? 'https://securegw.paytm.in'
    : 'https://securegw-stage.paytm.in';
}

export function generateOrderId(applicationId: string): string {
  const short = applicationId.replace(/-/g, '').slice(0, 12);
  const ts = Date.now().toString(36);
  const rand = randomBytes(2).toString('hex');
  return `ADM_${short}_${ts}_${rand}`.slice(0, 50);
}

export async function generateChecksum(params: Record<string, string>): Promise<string> {
  const { merchantKey } = getPaytmConfig();
  return PaytmChecksum.generateSignature(params, merchantKey);
}

export async function verifyChecksum(
  params: Record<string, string>,
  checksum: string,
): Promise<boolean> {
  const { merchantKey } = getPaytmConfig();
  return PaytmChecksum.verifySignature(params, merchantKey, checksum);
}

export interface InitiateTxnResponse {
  txnToken: string;
  orderId: string;
}

export async function initiateTransaction(opts: {
  orderId: string;
  amount: number;
  customerId: string;
  callbackUrl?: string;
}): Promise<InitiateTxnResponse> {
  const cfg = getPaytmConfig();
  const body = {
    requestType: 'Payment',
    mid: cfg.mid,
    websiteName: cfg.website,
    orderId: opts.orderId,
    callbackUrl: opts.callbackUrl || cfg.callbackUrl,
    txnAmount: { value: opts.amount.toFixed(2), currency: 'INR' },
    userInfo: { custId: opts.customerId },
  };
  const checksum = await PaytmChecksum.generateSignature(JSON.stringify(body), cfg.merchantKey);
  const url = `${getPaytmBaseUrl()}/theia/api/v1/initiateTransaction?mid=${cfg.mid}&orderId=${opts.orderId}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body, head: { signature: checksum } }),
  });
  const json = await res.json();
  if (json?.body?.resultInfo?.resultStatus !== 'S') {
    throw new Error(`Paytm initiate failed: ${json?.body?.resultInfo?.resultMsg || 'unknown'}`);
  }
  return { txnToken: json.body.txnToken, orderId: opts.orderId };
}

export async function queryTransactionStatus(orderId: string): Promise<any> {
  const cfg = getPaytmConfig();
  const body = { mid: cfg.mid, orderId };
  const checksum = await PaytmChecksum.generateSignature(JSON.stringify(body), cfg.merchantKey);
  const url = `${getPaytmBaseUrl()}/v3/order/status`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body, head: { signature: checksum } }),
  });
  return res.json();
}
