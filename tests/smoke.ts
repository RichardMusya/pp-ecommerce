import fetch from 'cross-fetch';

async function run() {
  const base = 'http://localhost:3000';
  try {
    const r1 = await fetch(base + '/');
    console.log('/', r1.status);
    const r2 = await fetch(base + '/api/admin/discounts');
    console.log('/api/admin/discounts', r2.status);
    const r3 = await fetch(base + '/api/cart');
    console.log('/api/cart', r3.status);
  } catch (e) {
    console.error('Smoke tests failed', e);
    process.exit(1);
  }
}

run();
