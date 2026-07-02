import { useState } from 'react';
import { FiEdit2, FiTrash2, FiFileText, FiExternalLink } from 'react-icons/fi';
import { lecturesApi } from '../../api/services.js';
import useCrud from '../../hooks/useCrud.js';
import { fileUrl } from '../../api/axios.js';
import Loader from '../../components/ui/Loader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { AdminHeader, ImageInput, FileInput } from '../../components/admin/AdminShared.jsx';
import { formatDate } from '../../utils/format.js';

const empty = { title: '', description: '', date: '', videoUrl: '', externalLink: '', image: null, pdf: null };
const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export default function LecturesAdmin() {
  const { items, loading, error, saving, save, remove, load } = useCrud(lecturesApi);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);

  const openNew = () => { setForm(empty); setEditId(null); setOpen(true); };
  const openEdit = (l) => { setForm({ ...l, date: toDateInput(l.date), image: l.image, pdf: l.pdf }); setEditId(l._id); setOpen(true); };

  const submit = async (e) => {
    e.preventDefault();
    const payload = { title: form.title, description: form.description, date: form.date, videoUrl: form.videoUrl, externalLink: form.externalLink };
    if (form.image instanceof File) payload.image = form.image;
    if (form.pdf instanceof File) payload.pdf = form.pdf;
    if (await save(editId, payload, true)) setOpen(false);
  };

  return (
    <div>
      <AdminHeader title="إدارة الندوات والمحاضرات" count={items.length} onAdd={openNew} addLabel="إضافة ندوة" />
      {loading ? <Loader /> : error ? <ErrorState message={error} onRetry={load} /> : items.length === 0 ? (
        <EmptyState message="لا توجد ندوات" />
      ) : (
        <div className="space-y-3">
          {items.map((l) => (
            <div key={l._id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                {l.image && <img src={fileUrl(l.image)} alt="" className="h-14 w-14 rounded-lg object-cover" />}
                <div>
                  <h3 className="font-bold text-slate-900">{l.title}</h3>
                  <p className="text-xs text-slate-400">{formatDate(l.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {l.pdf && <a href={fileUrl(l.pdf)} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-primary-600"><FiFileText /></a>}
                {l.externalLink && <a href={l.externalLink} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-primary-600"><FiExternalLink /></a>}
                <button onClick={() => openEdit(l)} className="btn-outline px-3 py-1.5 text-xs"><FiEdit2 /> تعديل</button>
                <button onClick={() => remove(l._id)} className="btn-danger px-3 py-1.5 text-xs"><FiTrash2 /> حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'تعديل ندوة' : 'إضافة ندوة'}>
        <form onSubmit={submit} className="space-y-4">
          <div><label className="label">العنوان *</label><input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><label className="label">الوصف *</label><textarea className="input min-h-24" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><label className="label">التاريخ *</label><input type="date" className="input" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <div><label className="label">رابط فيديو يوتيوب</label><input className="input" dir="ltr" placeholder="https://www.youtube.com/watch?v=..." value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} /></div>
          <div><label className="label">رابط خارجي (اختياري)</label><input className="input" value={form.externalLink} onChange={(e) => setForm({ ...form, externalLink: e.target.value })} /></div>
          <ImageInput label="صورة الغلاف (اختياري - تُستخدم صورة اليوتيوب تلقائياً لو فارغة)" value={form.image} onChange={(f) => setForm({ ...form, image: f })} />
          <FileInput label="ملف PDF (اختياري)" value={form.pdf} onChange={(f) => setForm({ ...form, pdf: f })} />
          <div className="flex justify-end gap-2"><button type="button" onClick={() => setOpen(false)} className="btn-outline">إلغاء</button><button disabled={saving} className="btn-primary">{saving ? 'جاري الحفظ...' : 'حفظ'}</button></div>
        </form>
      </Modal>
    </div>
  );
}
