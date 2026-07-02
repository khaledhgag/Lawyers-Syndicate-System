import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { boardMembersApi } from '../../api/services.js';
import useCrud from '../../hooks/useCrud.js';
import { fileUrl } from '../../api/axios.js';
import Loader from '../../components/ui/Loader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { AdminHeader, ImageInput } from '../../components/admin/AdminShared.jsx';

const empty = { fullName: '', position: '', bio: '', photo: null };

export default function BoardMembersAdmin() {
  const { items, loading, error, saving, save, remove, load } = useCrud(boardMembersApi);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [moving, setMoving] = useState(false);

  const openNew = () => { setForm(empty); setEditId(null); setOpen(true); };
  const openEdit = (m) => { setForm({ ...m, photo: m.photo }); setEditId(m._id); setOpen(true); };

  const submit = async (e) => {
    e.preventDefault();
    const payload = { fullName: form.fullName, position: form.position, bio: form.bio };
    if (form.photo instanceof File) payload.photo = form.photo;
    if (await save(editId, payload, true)) setOpen(false);
  };

  // Move a member up/down and persist the new order (normalized to 0,1,2,...)
  const move = async (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= items.length || moving) return;
    const reordered = [...items];
    const [m] = reordered.splice(index, 1);
    reordered.splice(target, 0, m);
    setMoving(true);
    try {
      await Promise.all(
        reordered
          .map((it, i) => (it.order !== i ? boardMembersApi.update(it._id, { order: i }, false) : null))
          .filter(Boolean)
      );
      await load();
    } catch {
      toast.error('تعذر تغيير الترتيب');
    } finally {
      setMoving(false);
    }
  };

  return (
    <div>
      <AdminHeader title="أعضاء مجلس النقابة" count={items.length} onAdd={openNew} addLabel="إضافة عضو" />
      <p className="mb-4 -mt-2 text-sm text-slate-500">رتّب الأعضاء حسب الرتبة باستخدام سهمي ↑ ↓ — الترتيب يُحفظ تلقائياً ويظهر بنفس الشكل في الموقع.</p>

      {loading ? <Loader /> : error ? <ErrorState message={error} onRetry={load} /> : items.length === 0 ? (
        <EmptyState message="لا يوجد أعضاء" />
      ) : (
        <div className="space-y-2">
          {items.map((m, i) => (
            <div key={m._id} className={`card flex items-center gap-3 p-3 transition ${moving ? 'opacity-60' : ''}`}>
              {/* Order controls */}
              <div className="flex flex-col">
                <button onClick={() => move(i, -1)} disabled={i === 0 || moving} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-primary-600 disabled:opacity-30" title="لأعلى">
                  <FiChevronUp />
                </button>
                <button onClick={() => move(i, 1)} disabled={i === items.length - 1 || moving} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-primary-600 disabled:opacity-30" title="لأسفل">
                  <FiChevronDown />
                </button>
              </div>

              {/* Rank number */}
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-700 text-sm font-bold text-white">
                {i + 1}
              </span>

              {/* Photo */}
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-primary-50">
                {m.photo ? <img src={fileUrl(m.photo)} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-xl text-primary-300">👤</span>}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-bold text-slate-900">{m.fullName}</h3>
                <p className="truncate text-sm text-gold-600">{m.position}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
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
          <div><label className="label">المنصب *</label><input className="input" required placeholder="مثال: نقيب / أمين الصندوق / أمين عام" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} /></div>
          <div><label className="label">نبذة مختصرة</label><textarea className="input min-h-24" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>
          <p className="text-xs text-slate-400">💡 الترتيب يتم من القائمة بأسهم ↑ ↓ بعد الحفظ.</p>
          <div className="flex justify-end gap-2"><button type="button" onClick={() => setOpen(false)} className="btn-outline">إلغاء</button><button disabled={saving} className="btn-primary">{saving ? 'جاري الحفظ...' : 'حفظ'}</button></div>
        </form>
      </Modal>
    </div>
  );
}
