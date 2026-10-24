const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

const BASE_URL = 'http://localhost:5000';

test.describe('--- COMPREHENSIVE END-TO-END QA & SECURITY AUDIT SUITE ---', () => {

  // ==========================================
  // SECTION 1: PUBLIC DISCOVERY & CATALOG APIS
  // ==========================================
  test('PUBLIC API: Root health check returns 200 and operational status', async () => {
    const res = await fetch(`${BASE_URL}/`);
    assert.equal(res.status, 200);
    const text = await res.text();
    assert.match(text, /SOVRA/i);
  });

  test('PUBLIC API: Product catalog endpoint returns non-empty list with valid schema', async () => {
    const res = await fetch(`${BASE_URL}/api/products`);
    assert.equal(res.status, 200);
    const data = await res.json();
    const products = Array.isArray(data) ? data : data.products;
    assert.ok(Array.isArray(products), 'Products response must be an array or contain products array');
    assert.ok(products.length > 0, 'Catalog must contain products');

    // Verify product structure integrity
    const p = products[0];
    assert.ok(p._id, 'Product must have an _id');
    assert.ok(typeof p.name === 'string', 'Product must have a string name');
    assert.ok(typeof p.price === 'number', 'Product price must be a number');
    assert.ok(p.price > 0, 'Product price must be positive');
    assert.ok(typeof p.stock === 'number', 'Product stock must be a number');
    assert.ok(p.stock >= 0, 'Product stock must never be negative');
  });

  test('PUBLIC API: Single product retrieval by ID returns matching product details', async () => {
    const catalogRes = await fetch(`${BASE_URL}/api/products`);
    const catalog = await catalogRes.json();
    const products = Array.isArray(catalog) ? catalog : catalog.products;
    const sampleProduct = products[0];

    const res = await fetch(`${BASE_URL}/api/products/${sampleProduct._id}`);
    assert.equal(res.status, 200);
    const fetched = await res.json();
    assert.equal(fetched._id, sampleProduct._id);
    assert.equal(fetched.name, sampleProduct.name);
    assert.equal(fetched.price, sampleProduct.price);
  });

  test('PUBLIC API: Non-existent product ID returns 404', async () => {
    const fakeId = '666666666666666666666666';
    const res = await fetch(`${BASE_URL}/api/products/${fakeId}`);
    assert.equal(res.status, 404);
  });

  test('PUBLIC API: Active promotional vouchers endpoint responds with valid list', async () => {
    const res = await fetch(`${BASE_URL}/api/promos/active`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data), 'Promos endpoint must return an array');
  });

  test('PUBLIC API: Categories endpoint responds with valid list', async () => {
    const catRes = await fetch(`${BASE_URL}/api/categories`);
    assert.equal(catRes.status, 200);
    const categories = await catRes.json();
    assert.ok(Array.isArray(categories), 'Categories must be an array');
  });

  test('AUTH GUARD: Unauthenticated access to /api/materials is rejected with 401', async () => {
    const matRes = await fetch(`${BASE_URL}/api/materials`);
    assert.equal(matRes.status, 401, 'Materials management is restricted to authorized administrators');
  });

  // ==========================================
  // SECTION 2: ACCESS CONTROL & AUTH BOUNDARIES
  // ==========================================
  test('AUTH GUARD: Unauthenticated requests to /api/orders are rejected with 401', async () => {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderItems: [] }),
    });
    assert.equal(res.status, 401, 'Unauthenticated order creation must be rejected');
  });

  test('AUTH GUARD: Unauthenticated requests to /api/orders/myorders are rejected with 401', async () => {
    const res = await fetch(`${BASE_URL}/api/orders/myorders`);
    assert.equal(res.status, 401);
  });

  test('AUTH GUARD: Unauthenticated requests to payment endpoints are rejected with 401', async () => {
    const configRes = await fetch(`${BASE_URL}/api/payment/config`);
    assert.equal(configRes.status, 401);

    const createRes = await fetch(`${BASE_URL}/api/payment/create-order/666666666666666666666666`, {
      method: 'POST',
    });
    assert.equal(createRes.status, 401);

    const verifyRes = await fetch(`${BASE_URL}/api/payment/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(verifyRes.status, 401);
  });

  test('AUTH GUARD: Invalid JWT tokens are strictly rejected with 401', async () => {
    const res = await fetch(`${BASE_URL}/api/payment/config`, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.invalidsignature',
      },
    });
    assert.equal(res.status, 401);
  });

  // ==========================================
  // SECTION 3: WEBHOOK CRYPTOGRAPHY & SECURITY
  // ==========================================
  test('WEBHOOK SECURITY: Missing or forged x-razorpay-signature is rejected with 400', async () => {
    const payload = JSON.stringify({ event: 'payment.captured' });

    // Missing signature
    const missingRes = await fetch(`${BASE_URL}/api/payment/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    });
    assert.equal(missingRes.status, 400);

    // Forged signature
    const forgedRes = await fetch(`${BASE_URL}/api/payment/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': 'forged_fake_signature_999',
      },
      body: payload,
    });
    assert.equal(forgedRes.status, 400);
  });

  test('WEBHOOK SECURITY: Authentically signed webhook payload returns 200 OK', async () => {
    const payload = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_TEST_WEBHOOK_001',
            order_id: 'order_TEST_WH_001',
            status: 'captured',
          },
        },
      },
    });

    const signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || 'SovraWebhookSecretSecurity2026')
      .update(payload)
      .digest('hex');

    const res = await fetch(`${BASE_URL}/api/payment/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': signature,
      },
      body: payload,
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.status, 'ok');
  });

  // ==========================================
  // SECTION 4: SECURITY HEADERS & INPUT SANITIZATION
  // ==========================================
  test('SECURITY HEADERS: Helmet protection headers are present on API responses', async () => {
    const res = await fetch(`${BASE_URL}/api/products`);
    assert.ok(res.headers.get('x-content-type-options'), 'X-Content-Type-Options must be set');
    assert.ok(res.headers.get('x-dns-prefetch-control'), 'X-DNS-Prefetch-Control must be set');
  });

  test('SECURITY INJECTION: Malicious NoSQL injection query payload is safely handled', async () => {
    // Attempting query injection: { "$gt": "" }
    const res = await fetch(`${BASE_URL}/api/products?category[$gt]=`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    // Should safely respond without crashing or leaking database internals (200, 304, or 400)
    assert.ok([200, 304, 400].includes(res.status), `Unexpected status ${res.status}`);
  });

  test('CORS GATEWAY: Preflight OPTIONS request returns 204 with authorized headers', async () => {
    const res = await fetch(`${BASE_URL}/api/products`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST',
      },
    });
    assert.equal(res.status, 204);
    assert.equal(res.headers.get('access-control-allow-origin'), 'http://localhost:5173');
  });

});
