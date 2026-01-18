"use client";
import { useState, useEffect } from 'react';
import PayPalButton from '../../components/PayPalButton';
import { useSession, signIn } from 'next-auth/react';
import PageNav from '../../components/PageNav';

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const [step, setStep] = useState(1);
  const [localOrderId, setLocalOrderId] = useState<string | null>(null);
  const [address, setAddress] = useState({ line1: '', city: '', region: '', postal: '', country: 'US' });
  const [cart, setCart] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const r = await fetch('/api/cart');
      const j = await r.json();
      setCart(j);
    }
    load();
  }, []);

  async function createOrder() {
    if (!cart) return;
    // require user to be signed in before creating an order / proceeding to payment
    if (!session) {
      // prompt sign-in (will redirect to provider/login flow)
      signIn();
      return;
    }
    // validate stock server-side
    let vj: any = null;
    try {
      const val = await fetch('/api/checkout/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: cart.items }) });
      if (!val.ok) {
        const txt = await val.text();
        alert('Validation failed: ' + (txt || val.statusText));
        return;
      }
      try {
        vj = await val.json();
      } catch (e) {
        const txt = await val.text().catch(() => '');
        alert('Validation failed: ' + (txt || 'Invalid response from server'));
        return;
      }
    } catch (e) {
      alert('Validation request failed: ' + (e as any).message);
      return;
    }
    if (!vj || !vj.ok) {
      alert('Validation failed: ' + (vj?.message || 'Stock issue'));
      return;
    }

    // create order server-side using inline items
    const resp = await fetch('/api/checkout/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: cart.items, cartId: cart.cartId }) });
    const data = await resp.json();
    setLocalOrderId(data.localOrderId);
    setStep(3);
  }

  if (!cart) return <div>Loading...</div>;

  const items = cart.items || [];
  const subtotal = items.reduce((s: number, it: any) => s + (it.price || it.product?.price || 0) * it.quantity, 0);

  return (
    <div>
      <PageNav />
      <h1 className="text-xl font-semibold">Checkout</h1>
      <div className="mt-4">
        {step === 1 && (
          <div>
            <h2 className="font-medium">1. Shipping address</h2>
            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-2 mt-2">
              <input className="w-full p-2 border rounded" placeholder="Address line 1" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <input className="p-2 border rounded" placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                <input className="p-2 border rounded" placeholder="Region" value={address.region} onChange={(e) => setAddress({ ...address, region: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input className="p-2 border rounded" placeholder="Postal" value={address.postal} onChange={(e) => setAddress({ ...address, postal: e.target.value })} />
                <input className="p-2 border rounded" placeholder="Country" value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} />
              </div>
              <div className="mt-2">
                <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Continue</button>
              </div>
            </form>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-medium">2. Shipping method</h2>
            <div className="mt-2">
              <label className="flex items-center space-x-2"><input type="radio" name="ship" defaultChecked /> <span>Standard - $5.00</span></label>
            </div>
            <div className="mt-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => createOrder()}>Proceed to Payment</button>
              <button className="ml-2 px-4 py-2" onClick={() => setStep(1)}>Back</button>
            </div>
            <div className="mt-4 bg-white p-4 rounded">
              <h3 className="font-medium">Order Summary</h3>
              <div className="mt-2">
                {items.map((it: any) => (
                  <div key={it.id} className="flex justify-between py-1"><span>{it.product?.name} x{it.quantity}</span><span>${(((it.price || it.product?.price) * it.quantity) / 100).toFixed(2)}</span></div>
                ))}
                <div className="flex justify-between border-t pt-2 mt-2"><span>Subtotal</span><span>${(subtotal/100).toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="font-medium">3. Payment</h2>
            {localOrderId ? (
              <div className="mt-4">
                <PayPalButton createOrderUrl="/api/checkout/create-paypal" localOrderId={localOrderId} cartId={cart.cartId} />
              </div>
            ) : (
              <p>Preparing payment...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
