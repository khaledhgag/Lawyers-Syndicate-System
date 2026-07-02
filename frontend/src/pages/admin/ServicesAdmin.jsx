import { useState } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { servicesApi } from '../../api/services.js';
import useCrud from '../../hooks/useCrud.js';
import { fileUrl } from '../../api/axios.js';
import Loader from '../../components/ui/Loader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { AdminHeader, ImageInput } from '../../components/admin/AdminShared.jsx';

const empty = { title: '', description: '', details: '', order: 0, image: null };

export default function ServicesAdmin() {
  const { items, loading, error, saving, save, remove, load } = useCrud(servicesApi);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);

  const openNew = () => { setForm(empty); setEditId(null); setOpen(true); };
  const openEdit = (s) => { setForm({ ...s, image: s.image }); setEditId(s._id); setOpen(true); };

  const submit = async (e) => {
    e.preventDefault();
    const payload = { title: form.title, description: form.description, details: form.details, order: form.order };
    if (form.image instanceof File) payload.image = form.image;
    if (await save(editId, payload, true)) setOpen(false);
  };

  return (
    <div>
      <AdminHeader title="إدارة الخدمات" count={items.length} onAdd={openNew} addLabel="إضافة خدمة" />
      {loading ? <Loader /> : error ? <ErrorState message={error} onRetry={load} /> : items.length === 0 ? (
        <EmptyState message="لا توجد خدمات" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s) => (
            <div key={s._id} className="card overflow-hidden">
              {s.image && <img src={fileUrl(s.image)} alt="" className="h-36 w-full object-cover" />}
              <div className="p-4">
                <h3 className="font-bold text-slate-900">{s.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{s.description}</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => openEdit(s)} className="btn-outline px-3 py-1.5 text-xs"><FiEdit2 /> تعديل</button>
                  <button onClick={() => remove(s._id)} className="btn-danger px-3 py-1.5 text-xs"><FiTrash2 /> حذف</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'تعديل خدمة' : 'إضافة خدمة'}>
        <form onSubmit={submit} className="space-y-4">
          <ImageInput value={form.image} onChange={(f) => setForm({ ...form, image: f })} />
          <div><label className="label">العنوان *</label><input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><label className="label">الوصف *</label><textarea className="input min-h-20" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><label className="label">التفاصيل</label><textarea className="input min-h-28" value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} /></div>
          <div><label className="label">الترتيب</label><input type="number" className="input" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><button type="button" onClick={() => setOpen(false)} className="btn-outline">إلغاء</button><button disabled={saving} className="btn-primary">{saving ? 'جاري الحفظ...' : 'حفظ'}</button></div>
        </form>
      </Modal>
    </div>
  );
}
