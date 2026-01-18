"use client";
import { useEffect, useRef, useState } from 'react';

type Props = {
  createOrderUrl: string; // endpoint to create PayPal order
  localOrderId?: string;
  cartId?: string | null;
};

export default function PayPalButton({ createOrderUrl, localOrderId, cartId }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if (!clientId) {
      console.error('Missing NEXT_PUBLIC_PAYPAL_CLIENT_ID');
      setError('Missing NEXT_PUBLIC_PAYPAL_CLIENT_ID');
      setLoaded(false);
      return;
    }

    const scriptId = 'paypal-js';
    if (!document.getElementById(scriptId)) {
      const s = document.createElement('script');
      s.id = scriptId;
      s.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
      s.addEventListener('load', () => setLoaded(true));
      s.addEventListener('error', (ev) => {
        console.error('PayPal SDK failed to load', ev);
        setError('Failed to load PayPal SDK');
      });
      document.body.appendChild(s);
    } else {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    const paypal = (window as any).paypal;
    if (!loaded && !paypal) return;
    if (!paypal) {
      setError('PayPal SDK loaded but `window.paypal` is not available');
      return;
    }
    paypal.Buttons({
      createOrder: async () => {
        const resp = await fetch(createOrderUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ localOrderId, cartId }) });
        const data = await resp.json();
        // assume server returns PayPal order id
        return data.id || data.result?.id || data.paypal?.id || data.paypal?.result?.id || data.paypal?.id;
      },
      onApprove: async (data: any, actions: any) => {
        // capture via server
        const resp = await fetch(`/api/paypal?action=capture`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: data.orderID, localOrderId, cartId }) });
        const capture = await resp.json();
        // handle UI redirect or success
        window.location.href = `/order/${localOrderId}`;
      }
    }).render(ref.current);
  }, [loaded, ref.current]);

  if (error) {
    return <div className="p-4 bg-red-50 border rounded">PayPal error: {error}</div>;
  }

  if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
    return <div className="p-4 bg-yellow-50 border rounded">PayPal is not configured for this environment.</div>;
  }

  if (!loaded) return <div className="p-4">Loading PayPal...</div>;

  return <div ref={ref} />;
}

