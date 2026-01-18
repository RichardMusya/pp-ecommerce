import fetch from 'cross-fetch';

const PAYPAL_BASE = (env: string) =>
  env === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

export async function getAccessToken(clientId: string, clientSecret: string, env: string) {
  const base = PAYPAL_BASE(env);
  const resp = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  const data = await resp.json();
  return data.access_token as string;
}

export async function createPayPalOrder(accessToken: string, env: string, order: any) {
  const base = PAYPAL_BASE(env);
  const resp = await fetch(`${base}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(order)
  });
  return resp.json();
}

export async function capturePayPalOrder(accessToken: string, env: string, orderId: string) {
  const base = PAYPAL_BASE(env);
  const resp = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  return resp.json();
}
