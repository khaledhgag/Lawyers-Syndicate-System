import { useEffect, useState } from 'react';
import { FiEdit2, FiTrash2, FiExternalLink } from 'react-icons/fi';
import { governmentLinksApi } from '../../api/services.js';
import useCrud from '../../hooks/useCrud.js';
import { fileUrl } from '../../api/axios.js';
import { faviconUrl } from '../../utils/favicon.js';
import Loader from '../../components/ui/Loader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { AdminHeader, ImageInput } from '../../components/admin/AdminShared.jsx';

const empty = { name: '', description: '', url: '', order: 0, icon: null };
const MAX_ICON_SIZE = 700 * 1024;

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

function LinkLogo({ link }) {
  const [failed, setFailed] = useState(false);
  const src = link.icon ? fileUrl(link.icon) : faviconUrl(link.url);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed || !src) {
    return <span className="text-xl">🏛️</span>;
  }

  return <img src={src} alt="" className="h-8 w-8 object-contain" onError={() => setFailed(true)} />;
}

export default function GovernmentLinksAdmin() {
  const { items, loading, error, saving, save, remove, load } = useCrud(governmentLinksApi);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);

  const openNew = () => { setForm(empty); setEditId(null); setOpen(true); };
  const openEdit = (g) => { setForm({ ...g, icon: g.icon || '' }); setEditId(g._id); setOpen(true); };

  const submit = async (e) => {
    e.preventDefault();
    const payload = { name: form.name, description: form.description, url: form.url, order: form.order };
    if (form.icon instanceof File) {
      if (form.icon.size > MAX_ICON_SIZE) {
        alert('حجم اللوجو كبير. اختار صورة أقل من 700KB.');
        return;
      }
      payload.icon = await fileToDataUrl(form.icon);
    }
    else if (form.icon === '') payload.icon = '';
    if (await save(editId, payload, false)) setOpen(false);
  };

  return (
    <div>
      <AdminHeader title="إدارة المواقع الحكومية" count={items.length} onAdd={openNew} addLabel="إضافة رابط" />
      {loading ? <Loader /> : error ? <ErrorState message={error} onRetry={load} /> : items.length === 0 ? (
        <EmptyState message="لا توجد روابط" />
      ) : (
        <div className="space-y-3">
          {items.map((g) => (
            <div key={g._id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-slate-100">
                  <LinkLogo link={g} />
                </span>
                <div>
                  <h3 className="flex items-center gap-2 font-bold text-slate-900">{g.name} <a href={g.url} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-primary-600"><FiExternalLink /></a></h3>
                  <p className="text-xs text-slate-400">{g.url}</p>
                  <p className="mt-1 text-xs text-slate-400">{g.icon ? 'لوجو يدوي' : 'لوجو تلقائي'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(g)} className="btn-outline px-3 py-1.5 text-xs"><FiEdit2 /> تعديل</button>
                <button onClick={() => remove(g._id)} className="btn-danger px-3 py-1.5 text-xs"><FiTrash2 /> حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'تعديل رابط' : 'إضافة رابط'}>
        <form onSubmit={submit} className="space-y-4">
          <ImageInput label="اللوجو اليدوي (اختياري)" value={form.icon} onChange={(f) => setForm({ ...form, icon: f })} />
          <p className="-mt-2 text-xs text-slate-400">لو سيبته فاضي هيظهر اللوجو التلقائي من رابط الموقع.</p>
          <div><label className="label">اسم الموقع *</label><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="label">الوصف</label><textarea className="input min-h-20" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><label className="label">الرابط *</label><input className="input" required placeholder="https://" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} /></div>
          <div><label className="label">الترتيب</label><input type="number" className="input" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><button type="button" onClick={() => setOpen(false)} className="btn-outline">إلغاء</button><button disabled={saving} className="btn-primary">{saving ? 'جاري الحفظ...' : 'حفظ'}</button></div>
        </form>
      </Modal>
    </div>
  );
}
