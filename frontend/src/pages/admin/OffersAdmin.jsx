import { useState } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { offersApi } from '../../api/services.js';
import useCrud from '../../hooks/useCrud.js';
import { fileUrl } from '../../api/axios.js';
import Loader from '../../components/ui/Loader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { AdminHeader, ImageInput } from '../../components/admin/AdminShared.jsx';
import { formatDate } from '../../utils/format.js';

const empty = { name: '', description: '', discount: '', expirationDate: '', image: null };
const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export default function OffersAdmin() {
  const { items, loading, error, saving, save, remove, load } = useCrud(offersApi);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);

  const openNew = () => { setForm(empty); setEditId(null); setOpen(true); };
  const openEdit = (o) => { setForm({ ...o, expirationDate: toDateInput(o.expirationDate), image: o.image }); setEditId(o._id); setOpen(true); };

  const submit = async (e) => {
    e.preventDefault();
    const payload = { name: form.name, description: form.description, discount: form.discount, expirationDate: form.expirationDate };
    if (form.image instanceof File) payload.image = form.image;
    if (await save(editId, payload, true)) setOpen(false);
  };

  return (
    <div>
      <AdminHeader title="إدارة العروض الحصرية" count={items.length} onAdd={openNew} addLabel="إضافة عرض" />
      {loading ? <Loader /> : error ? <ErrorState message={error} onRetry={load} /> : items.length === 0 ? (
        <EmptyState message="لا توجد عروض" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((o) => (
            <div key={o._id} className="card overflow-hidden">
              {o.image && <img src={fileUrl(o.image)} alt="" className="h-36 w-full object-cover" />}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">{o.name}</h3>
                  {o.discount && <span className="badge bg-gold-400/20 text-gold-600">{o.discount}</span>}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{o.description}</p>
                {o.expirationDate && <p className="mt-1 text-xs text-slate-400">ينتهي: {formatDate(o.expirationDate)}</p>}
                <div className="mt-3 flex gap-2">
                  <button onClick={() => openEdit(o)} className="btn-outline px-3 py-1.5 text-xs"><FiEdit2 /> تعديل</button>
                  <button onClick={() => remove(o._id)} className="btn-danger px-3 py-1.5 text-xs"><FiTrash2 /> حذف</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'تعديل عرض' : 'إضافة عرض'}>
        <form onSubmit={submit} className="space-y-4">
          <ImageInput value={form.image} onChange={(f) => setForm({ ...form, image: f })} />
          <div><label className="label">اسم العرض *</label><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="label">الوصف *</label><textarea className="input min-h-24" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">قيمة الخصم</label><input className="input" placeholder="مثال: 20%" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} /></div>
            <div><label className="label">تاريخ الانتهاء</label><input type="date" className="input" value={form.expirationDate} onChange={(e) => setForm({ ...form, expirationDate: e.target.value })} /></div>
          </div>
          <div className="flex justify-end gap-2"><button type="button" onClick={() => setOpen(false)} className="btn-outline">إلغاء</button><button disabled={saving} className="btn-primary">{saving ? 'جاري الحفظ...' : 'حفظ'}</button></div>
        </form>
      </Modal>
    </div>
  );
}
