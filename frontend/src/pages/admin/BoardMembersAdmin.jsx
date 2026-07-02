import { useState } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { boardMembersApi } from '../../api/services.js';
import useCrud from '../../hooks/useCrud.js';
import { fileUrl } from '../../api/axios.js';
import Loader from '../../components/ui/Loader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { AdminHeader, ImageInput } from '../../components/admin/AdminShared.jsx';

const empty = { fullName: '', position: '', bio: '', order: 0, photo: null };

export default function BoardMembersAdmin() {
  const { items, loading, error, saving, save, remove, load } = useCrud(boardMembersApi);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);

  const openNew = () => { setForm(empty); setEditId(null); setOpen(true); };
  const openEdit = (m) => { setForm({ ...m, photo: m.photo }); setEditId(m._id); setOpen(true); };

  const submit = async (e) => {
    e.preventDefault();
    const payload = { fullName: form.fullName, position: form.position, bio: form.bio, order: form.order };
    if (form.photo instanceof File) payload.photo = form.photo;
    if (await save(editId, payload, true)) setOpen(false);
  };

  return (
    <div>
      <AdminHeader title="أعضاء مجلس النقابة" count={items.length} onAdd={openNew} addLabel="إضافة عضو" />
      {loading ? <Loader /> : error ? <ErrorState message={error} onRetry={load} /> : items.length === 0 ? (
        <EmptyState message="لا يوجد أعضاء" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((m) => (
            <div key={m._id} className="card p-5 text-center">
              <div className="mx-auto mb-3 h-24 w-24 overflow-hidden rounded-full bg-primary-50">
                {m.photo ? <img src={fileUrl(m.photo)} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-3xl text-primary-300">👤</span>}
              </div>
              <h3 className="font-bold text-slate-900">{m.fullName}</h3>
              <p className="text-sm text-gold-600">{m.position}</p>
              <div className="mt-3 flex justify-center gap-2">
                <button onClick={() => openEdit(m)} className="btn-outline px-3 py-1.5 text-xs"><FiEdit2 /> تعديل</button>
                <button onClick={() => remove(m._id)} className="btn-danger px-3 py-1.5 text-xs"><FiTrash2 /> حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'تعديل عضو' : 'إضافة عضو'}>
        <form onSubmit={submit} className="space-y-4">
          <ImageInput label="الصورة الشخصية" value={form.photo} onChange={(f) => setForm({ ...form, photo: f })} />
          <div><label className="label">الاسم الكامل *</label><input className="input" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
          <div><label className="label">المنصب *</label><input className="input" required value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} /></div>
          <div><label className="label">نبذة مختصرة</label><textarea className="input min-h-24" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>
          <div><label className="label">الترتيب</label><input type="number" className="input" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><button type="button" onClick={() => setOpen(false)} className="btn-outline">إلغاء</button><button disabled={saving} className="btn-primary">{saving ? 'جاري الحفظ...' : 'حفظ'}</button></div>
        </form>
      </Modal>
    </div>
  );
}
