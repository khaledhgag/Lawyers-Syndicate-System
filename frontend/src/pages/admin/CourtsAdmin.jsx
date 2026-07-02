import { useState } from 'react';
import { FiEdit2, FiTrash2, FiMapPin } from 'react-icons/fi';
import { courtsApi } from '../../api/services.js';
import useCrud from '../../hooks/useCrud.js';
import Loader from '../../components/ui/Loader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { AdminHeader } from '../../components/admin/AdminShared.jsx';

const DEGREES = ['جزئية', 'ابتدائية', 'استئناف', 'النقض', 'إدارية', 'مجلس الدولة', 'الأسرة', 'اقتصادية'];
const empty = { name: '', degree: 'ابتدائية', governorate: '', address: '', mapEmbed: '', mapLink: '', order: 0 };

export default function CourtsAdmin() {
  const { items, loading, error, saving, save, remove, load } = useCrud(courtsApi);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);

  const openNew = () => { setForm(empty); setEditId(null); setOpen(true); };
  const openEdit = (c) => { setForm(c); setEditId(c._id); setOpen(true); };

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name, degree: form.degree, governorate: form.governorate,
      address: form.address, mapEmbed: form.mapEmbed, mapLink: form.mapLink, order: form.order,
    };
    if (await save(editId, payload, false)) setOpen(false);
  };

  return (
    <div>
      <AdminHeader title="إدارة المحاكم" count={items.length} onAdd={openNew} addLabel="إضافة محكمة" />
      {loading ? <Loader /> : error ? <ErrorState message={error} onRetry={load} /> : items.length === 0 ? (
        <EmptyState message="لا توجد محاكم" icon={FiMapPin} />
      ) : (
        <div className="space-y-3">
          {items.map((c) => (
            <div key={c._id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <h3 className="font-bold text-slate-900">{c.name}</h3>
                <p className="text-xs text-slate-400">
                  <span className="badge bg-primary-50 text-primary-700">{c.degree}</span>
                  <span className="mr-2">{c.governorate}{c.address ? ` — ${c.address}` : ''}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(c)} className="btn-outline px-3 py-1.5 text-xs"><FiEdit2 /> تعديل</button>
                <button onClick={() => remove(c._id)} className="btn-danger px-3 py-1.5 text-xs"><FiTrash2 /> حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'تعديل محكمة' : 'إضافة محكمة'}>
        <form onSubmit={submit} className="space-y-4">
          <div><label className="label">اسم المحكمة *</label><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">الدرجة *</label>
              <input className="input" list="degrees" required value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} />
              <datalist id="degrees">{DEGREES.map((d) => <option key={d} value={d} />)}</datalist>
            </div>
            <div><label className="label">المحافظة *</label><input className="input" required value={form.governorate} onChange={(e) => setForm({ ...form, governorate: e.target.value })} /></div>
          </div>
          <div><label className="label">العنوان</label><input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <div>
            <label className="label">رابط تضمين الخريطة (Google Maps embed src)</label>
            <input className="input" placeholder="https://www.google.com/maps?q=...&output=embed" value={form.mapEmbed} onChange={(e) => setForm({ ...form, mapEmbed: e.target.value })} />
            <p className="mt-1 text-xs text-slate-400">من خرائط جوجل: مشاركة ← تضمين خريطة ← انسخ رابط src، أو استخدم صيغة ‎?q=العنوان&output=embed</p>
          </div>
          <div><label className="label">رابط الفتح في خرائط جوجل</label><input className="input" placeholder="https://maps.google.com/?q=..." value={form.mapLink} onChange={(e) => setForm({ ...form, mapLink: e.target.value })} /></div>
          <div><label className="label">الترتيب</label><input type="number" className="input" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><button type="button" onClick={() => setOpen(false)} className="btn-outline">إلغاء</button><button disabled={saving} className="btn-primary">{saving ? 'جاري الحفظ...' : 'حفظ'}</button></div>
        </form>
      </Modal>
    </div>
  );
}
