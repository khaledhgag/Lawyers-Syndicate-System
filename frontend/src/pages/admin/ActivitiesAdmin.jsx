import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { activitiesApi } from '../../api/services.js';
import useCrud from '../../hooks/useCrud.js';
import { fileUrl } from '../../api/axios.js';
import Loader from '../../components/ui/Loader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { AdminHeader } from '../../components/admin/AdminShared.jsx';
import { formatDate, formatDateTime } from '../../utils/format.js';

const empty = { title: '', description: '', date: '', type: '' };
const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export default function ActivitiesAdmin() {
  const { items, loading, error, save, remove, load } = useCrud(activitiesApi);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [existing, setExisting] = useState([]); // existing gallery urls
  const [removeImages, setRemoveImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  const openNew = () => { setForm(empty); setEditId(null); setExisting([]); setRemoveImages([]); setNewFiles([]); setOpen(true); };
  const openEdit = (a) => {
    setForm({ title: a.title, description: a.description, date: toDateInput(a.date), type: a.type });
    setEditId(a._id); setExisting(a.gallery || []); setRemoveImages([]); setNewFiles([]); setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      ['title', 'description', 'date', 'type'].forEach((k) => fd.append(k, form[k]));
      removeImages.forEach((img) => fd.append('removeImages', img));
      newFiles.forEach((f) => fd.append('gallery', f));
      if (editId) await activitiesApi.update(editId, fd, true);
      else await activitiesApi.create(fd, true);
      toast.success(editId ? 'تم التحديث' : 'تمت الإضافة');
      setOpen(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'تعذر الحفظ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <AdminHeader title="إدارة الأنشطة" count={items.length} onAdd={openNew} addLabel="إضافة نشاط" />
      {loading ? <Loader /> : error ? <ErrorState message={error} onRetry={load} /> : items.length === 0 ? (
        <EmptyState message="لا توجد أنشطة" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((a) => (
            <div key={a._id} className="card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="badge bg-primary-50 text-primary-700">{a.type}</span>
                  <h3 className="mt-1 font-bold text-slate-900">{a.title}</h3>
                  <p className="text-xs text-slate-400">تاريخ النشاط: {formatDate(a.date)} · {a.gallery?.length || 0} صورة</p>
                  <p className="mt-1 text-xs text-slate-400">تاريخ الإضافة: {formatDateTime(a.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(a)} className="btn-outline px-3 py-1.5 text-xs"><FiEdit2 /></button>
                  <button onClick={() => remove(a._id)} className="btn-danger px-3 py-1.5 text-xs"><FiTrash2 /></button>
                </div>
              </div>
              {a.gallery?.length > 0 && (
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {a.gallery.slice(0, 6).map((g, i) => <img key={i} src={fileUrl(g)} alt="" className="h-16 w-16 shrink-0 rounded object-cover" />)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'تعديل نشاط' : 'إضافة نشاط'} size="lg">
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">العنوان *</label><input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div>
              <label className="label">التصنيف *</label>
              <input
                className="input"
                required
                list="activity-types"
                placeholder="اكتب تصنيفاً جديداً أو اختر موجوداً"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              />
              <datalist id="activity-types">
                {[...new Set(['رحلات النقابة', 'الأنشطة الاجتماعية', ...items.map((a) => a.type)])].filter(Boolean).map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>
          </div>
          <div><label className="label">التاريخ *</label><input type="date" className="input" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <div><label className="label">الوصف *</label><textarea className="input min-h-24" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>

          {existing.length > 0 && (
            <div>
              <label className="label">الصور الحالية</label>
              <div className="flex flex-wrap gap-2">
                {existing.filter((g) => !removeImages.includes(g)).map((g, i) => (
                  <div key={i} className="relative">
                    <img src={fileUrl(g)} alt="" className="h-20 w-20 rounded-lg object-cover" />
                    <button type="button" onClick={() => setRemoveImages((r) => [...r, g])} className="absolute -left-1 -top-1 rounded-full bg-red-600 p-0.5 text-white"><FiX className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="label">إضافة صور للمعرض</label>
            <input type="file" accept="image/*" multiple className="input" onChange={(e) => setNewFiles([...e.target.files])} />
            {newFiles.length > 0 && <p className="mt-1 text-xs text-slate-400">تم اختيار {newFiles.length} صورة</p>}
          </div>

          <div className="flex justify-end gap-2"><button type="button" onClick={() => setOpen(false)} className="btn-outline">إلغاء</button><button disabled={saving} className="btn-primary">{saving ? 'جاري الحفظ...' : 'حفظ'}</button></div>
        </form>
      </Modal>
    </div>
  );
}
