import { useState } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { contractsApi } from '../../api/services.js';
import useCrud from '../../hooks/useCrud.js';
import { fileUrl } from '../../api/axios.js';
import Loader from '../../components/ui/Loader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { AdminHeader, ImageInput } from '../../components/admin/AdminShared.jsx';

const empty = { organizationName: '', description: '', benefits: '', contactInfo: '', order: 0, image: null };

export default function ContractsAdmin() {
  const { items, loading, error, saving, save, remove, load } = useCrud(contractsApi);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);

  const openNew = () => { setForm(empty); setEditId(null); setOpen(true); };
  const openEdit = (c) => { setForm({ ...c, image: c.image }); setEditId(c._id); setOpen(true); };

  const submit = async (e) => {
    e.preventDefault();
    const payload = { organizationName: form.organizationName, description: form.description, benefits: form.benefits, contactInfo: form.contactInfo, order: form.order };
    if (form.image instanceof File) payload.image = form.image;
    if (await save(editId, payload, true)) setOpen(false);
  };

  return (
    <div>
      <AdminHeader title="إدارة التعاقدات" count={items.length} onAdd={openNew} addLabel="إضافة تعاقد" />
      {loading ? <Loader /> : error ? <ErrorState message={error} onRetry={load} /> : items.length === 0 ? (
        <EmptyState message="لا توجد تعاقدات" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <div key={c._id} className="card overflow-hidden">
              {c.image && <img src={fileUrl(c.image)} alt="" className="h-36 w-full object-cover" />}
              <div className="p-4">
                <h3 className="font-bold text-slate-900">{c.organizationName}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{c.description}</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => openEdit(c)} className="btn-outline px-3 py-1.5 text-xs"><FiEdit2 /> تعديل</button>
                  <button onClick={() => remove(c._id)} className="btn-danger px-3 py-1.5 text-xs"><FiTrash2 /> حذف</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'تعديل تعاقد' : 'إضافة تعاقد'}>
        <form onSubmit={submit} className="space-y-4">
          <ImageInput value={form.image} onChange={(f) => setForm({ ...form, image: f })} />
          <div><label className="label">اسم الجهة *</label><input className="input" required value={form.organizationName} onChange={(e) => setForm({ ...form, organizationName: e.target.value })} /></div>
          <div><label className="label">الوصف *</label><textarea className="input min-h-20" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><label className="label">المميزات</label><textarea className="input min-h-20" value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} /></div>
          <div><label className="label">بيانات التواصل</label><input className="input" value={form.contactInfo} onChange={(e) => setForm({ ...form, contactInfo: e.target.value })} /></div>
          <div><label className="label">الترتيب</label><input type="number" className="input" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><button type="button" onClick={() => setOpen(false)} className="btn-outline">إلغاء</button><button disabled={saving} className="btn-primary">{saving ? 'جاري الحفظ...' : 'حفظ'}</button></div>
        </form>
      </Modal>
    </div>
  );
}
