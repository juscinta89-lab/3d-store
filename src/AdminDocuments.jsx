import React, { useEffect, useRef, useState } from 'react';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { money, totals, validateDocument } from './documentMath';
import './documents.css';

const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const emptyItem = () => ({ name: '', quantity: 1, price: 0, notes: '' });
const fresh = () => ({ type: 'quotation', date: today(), validUntil: today(), businessName: '3D STORE', businessAddress: 'Kuala Krai, Kelantan', businessPhone: '60194155722', customerName: '', phone: '', address: '', orderId: '', items: [emptyItem()], discount: 0, shipping: 0, paid: 0, paymentMethod: '', notes: '' });
const inputClass = 'w-full border border-slate-200 rounded-xl p-2.5 bg-white text-sm';
function Field({ label, value, onChange, ...props }) {
  return <label className="block text-xs font-medium text-slate-600">{label}<input className={`${inputClass} mt-1`} value={value} onChange={e => onChange(e.target.value)} {...props} /></label>;
}
export default function AdminDocuments({ user, orders, products }) {
  const [draft, setDraft] = useState(fresh);
  const [records, setRecords] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const pending = useRef(null);
  const busy = useRef(false);
  useEffect(() => {
    if (user?.role !== 'admin') return;
    return onSnapshot(collection(db, 'adminDocuments'), snapshot => {
      setRecords(snapshot.docs.map(d => ({ ...d.data(), id: d.id })).sort((a,b) => b.createdAt.localeCompare(a.createdAt)));
      setLoading(false); setLoadError('');
    }, () => { setLoading(false); setLoadError('Muat rekod gagal. Semak sambungan dan kebenaran Firebase untuk adminDocuments.'); });
  }, [user?.uid, user?.role]);
  if (user?.role !== 'admin') return null;
  const change = (key, value) => { pending.current = null; setDraft(d => ({ ...d, [key]: value })); setSelected(null); setError(''); };
  const changeItem = (index, key, value) => change('items', draft.items.map((item,i) => i === index ? { ...item, [key]: value } : item));

  const save = async event => {
    event.preventDefault();
    if (busy.current) return;
    const message = validateDocument(draft);
    if (message) { setError(message); return; }
    busy.current = true; setSaving(true); setError('');
    const reference = pending.current?.reference || doc(collection(db, 'adminDocuments'));
    const data = pending.current?.data || { ...draft, ...totals({ ...draft, paid: draft.type === 'receipt' ? draft.paid : 0 }), paid: draft.type === 'receipt' ? Number(draft.paid) : 0, discount: Number(draft.discount), shipping: Number(draft.shipping), items: draft.items.map(i => ({ ...i, price: Number(i.price), quantity: Number(i.quantity) })), number: `${draft.type === 'receipt' ? 'RCT' : 'QUO'}-${draft.date.replaceAll('-', '')}-${reference.id}`, createdAt: new Date().toISOString(), createdBy: user.uid };
    pending.current = { reference, data };
    try { await setDoc(reference, data); setSelected({ ...data, id: reference.id }); pending.current = null; }
    catch { setError('Dokumen belum disimpan. Semak sambungan dan kebenaran Firebase, kemudian cuba semula.'); }
    finally { busy.current = false; setSaving(false); }
  };
  const reset = () => { pending.current = null; setDraft(fresh()); setSelected(null); setError(''); };
  const shown = selected || draft;
  const shownTotals = totals(shown);
  return <div className="document-page max-w-6xl mx-auto px-4 py-8">
    <div className="document-controls mb-6"><h1 className="text-2xl font-semibold">Resit & Quotation</h1><p className="text-sm text-slate-500 mt-1">Sediakan dokumen pelanggan untuk produk dan servis cetakan 3D.</p></div>
    <div className="document-controls grid lg:grid-cols-[1fr_280px] gap-6">
      <form onSubmit={save} className="bg-white border rounded-2xl p-5 space-y-5">
        <div className="flex justify-between items-center"><h2 className="font-semibold">{selected ? 'Dokumen disimpan' : 'Dokumen baharu'}</h2><button type="button" disabled={saving} onClick={reset} className="text-blue-600 text-sm">+ Dokumen baharu</button></div>
        <fieldset disabled={saving || !!selected} className="space-y-5 disabled:opacity-60">
          <div className="grid sm:grid-cols-2 gap-4"><label className="text-xs">Jenis dokumen<select className={`${inputClass} mt-1`} value={draft.type} onChange={e => change('type', e.target.value)}><option value="quotation">Quotation / Sebut Harga</option><option value="receipt">Resit Bayaran</option></select></label><Field label="Tarikh" type="date" required value={draft.date} onChange={v => change('date',v)} />{draft.type === 'quotation' && <Field label="Sah sehingga" type="date" required min={draft.date} value={draft.validUntil} onChange={v => change('validUntil',v)} />}</div>
          <label className="block text-xs">Isi daripada tempahan (pilihan)<select className={`${inputClass} mt-1`} value="" onChange={e => { const order = orders.find(o => o.id === e.target.value); if (!order) return; pending.current = null; setDraft(d => ({ ...d, customerName: order.customerName || '', phone: order.phone || '', address: order.address || '', orderId: order.orderId || '', items: (order.items || []).map(i => ({ name: i.name, price: i.price, quantity: i.quantity, notes: i.notes || '' })), shipping: order.shippingFee || 0, discount: order.discountAmount || 0, paid: 0 })); }}><option value="">Pilih tempahan…</option>{orders.map(o => <option key={o.id} value={o.id}>{o.orderId} — {o.customerName}</option>)}</select></label>
          <div className="grid sm:grid-cols-2 gap-4">{[['businessName','Nama perniagaan'],['businessPhone','Telefon perniagaan'],['businessAddress','Alamat perniagaan'],['customerName','Nama pelanggan'],['phone','Telefon pelanggan'],['address','Alamat pelanggan'],['orderId','Rujukan tempahan']].map(([key,label]) => <Field key={key} label={label} required={['businessName','customerName'].includes(key)} value={draft[key]} onChange={v => change(key,v)} />)}</div>
          <div className="space-y-3"><h3 className="font-semibold text-sm">Item / Servis</h3>{draft.items.map((item,index) => <div key={index} className="bg-slate-50 rounded-xl p-3 space-y-2"><div className="grid sm:grid-cols-[1fr_90px_110px] gap-2"><Field label="Keterangan" required value={item.name} onChange={v => changeItem(index,'name',v)} /><Field label="Kuantiti" type="number" min="1" step="1" required value={item.quantity} onChange={v => changeItem(index,'quantity',v)} /><Field label="Harga (RM)" type="number" min="0" step="0.01" required value={item.price} onChange={v => changeItem(index,'price',v)} /></div><Field label="Nota cetakan / spesifikasi" value={item.notes} onChange={v => changeItem(index,'notes',v)} /><button type="button" disabled={draft.items.length === 1} className="text-xs text-red-600 disabled:opacity-40" onClick={() => change('items',draft.items.filter((_,i) => i !== index))}>Buang item {index+1}</button></div>)}<div className="flex flex-wrap gap-3"><button type="button" onClick={() => change('items',[...draft.items,emptyItem()])} className="text-sm text-blue-600">+ Item manual</button><select aria-label="Tambah produk" className="border rounded-lg p-2 text-xs max-w-full" value="" onChange={e => { const p = products.find(p => p.id === e.target.value); if (p) change('items',[...draft.items.filter(i => i.name || Number(i.price)),{ name:p.name, price:p.price, quantity:1, notes:'' }]); }}><option value="">+ Pilih produk…</option>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div></div>
          <div className="grid sm:grid-cols-2 gap-4">{[['discount','Diskaun (RM)'],['shipping','Penghantaran (RM)'],...(draft.type === 'receipt' ? [['paid','Bayaran diterima (RM)']] : [])].map(([key,label]) => <Field key={key} label={label} type="number" min="0" step="0.01" required value={draft[key]} onChange={v => change(key,v)} />)}{draft.type === 'receipt' && <Field label="Kaedah / rujukan bayaran" required value={draft.paymentMethod} onChange={v => change('paymentMethod',v)} />}</div>
          <label className="block text-xs">Nota / syarat<textarea className={`${inputClass} mt-1`} rows="3" value={draft.notes} onChange={e => change('notes',e.target.value)} /></label>
        </fieldset>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {selected ? <div className="flex flex-wrap items-center gap-3"><span role="status" className="text-green-700 text-sm">Dokumen disimpan.</span><button type="button" onClick={() => window.print()} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm">Cetak / Simpan PDF</button></div> : <button disabled={saving} className="bg-blue-600 text-white px-5 py-3 rounded-xl text-sm disabled:opacity-50">{saving ? 'Menyimpan…' : 'Simpan dokumen'}</button>}
      </form>
      <aside className="bg-white border rounded-2xl p-4 h-fit"><h2 className="font-semibold mb-3">Rekod dokumen</h2><input aria-label="Cari dokumen" className={inputClass} placeholder="Nama atau nombor…" value={search} onChange={e => setSearch(e.target.value)} />{loadError && <p role="alert" className="text-red-600 text-xs mt-3">{loadError}</p>}{loading && <p className="text-xs mt-3">Memuatkan…</p>}{!loading && !loadError && !records.length && <p className="text-xs text-slate-500 mt-3">Belum ada dokumen.</p>}<div className="max-h-96 overflow-auto mt-3 space-y-2">{records.filter(r => `${r.number} ${r.customerName}`.toLowerCase().includes(search.toLowerCase())).map(r => <button key={r.id} type="button" disabled={saving} onClick={() => { if (!selected && (draft.customerName || draft.items.some(i => i.name)) && !window.confirm('Buka rekod dan tinggalkan draf yang belum disimpan?')) return; setSelected(r); setDraft(r); setError(''); pending.current = null; }} className="block w-full text-left bg-slate-50 rounded-xl p-3 text-xs break-words"><strong>{r.type === 'receipt' ? 'Resit' : 'Quotation'} · {r.customerName}</strong><p className="text-slate-500 mt-1">{r.number}</p><p className="mt-1">{r.date} · {money(r.total)}</p></button>)}</div></aside>
    </div>
    <article className="document-paper bg-white border rounded-2xl p-6 sm:p-10 mt-8 text-sm">
      <header className="flex flex-wrap justify-between gap-5 border-b-2 border-slate-900 pb-6"><div><h2 className="text-3xl font-bold text-blue-600">{shown.businessName}</h2><p className="whitespace-pre-wrap mt-2">{shown.businessAddress}</p><p>{shown.businessPhone}</p></div><div className="sm:text-right"><h2 className="text-xl font-semibold">{shown.type === 'receipt' ? 'RESIT BAYARAN' : 'QUOTATION / SEBUT HARGA'}</h2><p className="text-xs break-all mt-2">{selected ? shown.number : 'DRAF — BELUM DISIMPAN'}</p><p>Tarikh: {shown.date}</p>{shown.type === 'quotation' && <p>Sah sehingga: {shown.validUntil}</p>}</div></header>
      <div className="my-6"><p className="text-slate-500 text-xs">Kepada</p><strong>{shown.customerName || 'Nama pelanggan'}</strong><p>{shown.phone}</p><p className="whitespace-pre-wrap">{shown.address}</p>{shown.orderId && <p className="mt-2">Rujukan: {shown.orderId}</p>}</div>
      <div className="overflow-x-auto"><table className="w-full text-left document-items"><thead><tr className="border-b"><th>Keterangan</th><th>Kuantiti</th><th>Harga</th><th>Jumlah</th></tr></thead><tbody>{shown.items.map((i,index) => <tr key={index} className="border-b"><td className="py-3"><strong>{i.name || 'Item'}</strong><p className="text-xs text-slate-500 whitespace-pre-wrap">{i.notes}</p></td><td>{i.quantity}</td><td className="whitespace-nowrap">{money(i.price)}</td><td className="whitespace-nowrap">{money(Math.round(Number(i.price)*100)*Number(i.quantity)/100)}</td></tr>)}</tbody></table></div>
      <dl className="ml-auto max-w-sm mt-6 space-y-2">{[['Subtotal',shownTotals.subtotal],['Diskaun',-Number(shown.discount)],['Penghantaran',shown.shipping],['Jumlah',shownTotals.total],...(shown.type === 'receipt' ? [['Bayaran diterima',shown.paid],['Baki',shownTotals.balance]] : [])].map(([label,value]) => <div className="flex justify-between gap-3" key={label}><dt>{label}</dt><dd className="font-semibold">{money(value)}</dd></div>)}</dl>
      {shown.type === 'receipt' && <p className="mt-5">Kaedah / rujukan bayaran: {shown.paymentMethod}</p>}
      {shown.notes && <p className="whitespace-pre-wrap mt-6">{shown.notes}</p>}
      <footer className="border-t mt-10 pt-4 text-xs text-slate-500"><p>{shown.type === 'quotation' ? 'Sebut harga ini bukan bukti pembayaran.' : 'Terima kasih atas bayaran anda.'}</p><p>Dokumen dijana oleh 3D Store.</p></footer>
    </article>
  </div>;
}
