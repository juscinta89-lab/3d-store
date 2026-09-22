export const money = value => `RM ${Number(value).toFixed(2)}`;
export function totals(data) {
  const cents = value => Math.round(Number(value || 0) * 100);
  const subtotal = data.items.reduce((sum, item) => sum + cents(item.price) * Number(item.quantity), 0);
  const discount = cents(data.discount);
  const shipping = cents(data.shipping);
  const total = subtotal - discount + shipping;
  return { subtotal: subtotal / 100, total: total / 100, balance: (total - cents(data.paid)) / 100 };
}
export function validateDocument(data) {
  if (!data.customerName.trim() || !data.businessName.trim() || !data.date) return 'Isi nama perniagaan, pelanggan dan tarikh.';
  if (!data.items.length || data.items.some(i => !i.name.trim() || !Number.isInteger(Number(i.quantity)) || Number(i.quantity) < 1 || !Number.isFinite(Number(i.price)) || Number(i.price) < 0 || i.price === '')) return 'Semak nama item, kuantiti dan harga.';
  if (['discount', 'shipping', 'paid'].some(key => !Number.isFinite(Number(data[key])) || Number(data[key]) < 0)) return 'Amaun mesti nombor positif atau sifar.';
  const calculated = totals(data);
  if (!Number.isSafeInteger(Math.round(calculated.subtotal * 100)) || Number(data.discount) > calculated.subtotal) return 'Diskaun tidak boleh melebihi subtotal; semak amaun item.';
  if (data.type === 'receipt' && (Number(data.paid) <= 0 || calculated.balance < 0 || !data.paymentMethod.trim())) return 'Resit memerlukan kaedah dan amaun bayaran yang diterima, tidak melebihi jumlah.';
  if (data.type === 'quotation' && (!data.validUntil || data.validUntil < data.date)) return 'Tarikh sah quotation mesti pada atau selepas tarikh dokumen.';
  return '';
}
