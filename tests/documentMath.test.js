import test from 'node:test';
import assert from 'node:assert/strict';
import { totals, validateDocument } from '../src/documentMath.js';
const base = () => ({ type: 'receipt', businessName: '3D STORE', customerName: 'Customer', date: '2026-09-22', validUntil: '2026-09-30', items: [{ name: 'Print', quantity: 3, price: 0.1 }], discount: 0.1, shipping: 5, paid: 2, paymentMethod: 'Transfer' });
test('currency calculation includes discount, delivery and partial payment', () => {
  assert.deepEqual(totals(base()), { subtotal: 0.3, total: 5.2, balance: 3.2 });
  assert.equal(validateDocument(base()), '');
});
test('receipt requires actual payment and rejects overpayment', () => {
  for (const paid of [0, -1, 6, Infinity]) assert.ok(validateDocument({ ...base(), paid }));
});
test('invalid line items and excessive discounts are rejected', () => {
  for (const quantity of [0, -1, 1.5, Infinity]) assert.ok(validateDocument({ ...base(), items: [{ name: 'Print', price: 1, quantity }] }));
  assert.ok(validateDocument({ ...base(), discount: 1 }));
  assert.ok(validateDocument({ ...base(), items: [] }));
});
test('quotation allows no payment but must have valid expiry', () => {
  assert.equal(validateDocument({ ...base(), type: 'quotation', paid: 0, paymentMethod: '' }), '');
  assert.ok(validateDocument({ ...base(), type: 'quotation', validUntil: '2026-09-21' }));
});
