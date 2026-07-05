import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiSearch, FiBook, FiPlus, FiUploadCloud } from 'react-icons/fi';
import { booksApi } from '../../api/services.js';
import { fileUrl } from '../../api/axios.js';
import Loader from '../../components/ui/Loader.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { FileInput } from '../../components/admin/AdminShared.jsx';

const LIMIT = 15;
const CATEGORIES = ['جنائي', 'مدني'];
const BATCH = 25; // files per request during bulk upload
const empty = { title: '', appealNumber: '', year: new Date().getFullYear(), category: 'جنائي', summary: '', pdf: null };

export default function BooksAdmin() {
  const [filters, setFilters] = useState({ search: '', category: '', year: '' });
  const [applied, setApplied] = useState({ search: '', category: '', year: '' });
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ data: [], pagination: null, loading: true });
  const [meta, setMeta] = useState({ categories: [], years: [] });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState([]);

  // Bulk upload state
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkCategory, setBulkCategory] = useState('جنائي');
  const [bulkFiles, setBulkFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  useEffect(() => { booksApi.meta().then(setMeta).catch(() => {}); }, []);

  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true }));
    booksApi
      .list({ ...applied, all: true, page, limit: LIMIT })
      .then((r) => setState({ data: r.data, pagination: r.pagination, loading: false }))
      .catch(() => setState({ data: [], pagination: null, loading: false }));
  }, [applied, page]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setForm(empty); setEditId(null); setOpen(true); };
  const openEdit = (b) => { setForm({ ...b, pdf: b.pdf }); setEditId(b._id); setOpen(true); };

  const submit = async (e) => {
    e.preventDefault();
    if (!editId && !(form.pdf instanceof File)) return toast.error('ملف PDF مطلوب');
    setSaving(true);
    try {
      const fd = new FormData();
      ['title', 'appealNumber', 'year', 'category', 'summary'].forEach((k) => fd.append(k, form[k]));
      if (form.pdf instanceof File) fd.append('pdf', form.pdf);
      if (editId) await booksApi.update(editId, fd, true);
      else await booksApi.create(fd, true);
      toast.success(editId ? 'تم التحديث' : 'تمت الإضافة');
      setOpen(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'تعذر الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const removeOne = async (id) => {
    if (!window.confirm('تأكيد حذف الكتاب؟')) return;
    await booksApi.remove(id);
    toast.success('تم الحذف');
    load();
  };

  const bulkDelete = async () => {
    if (!selected.length) return;
    if (!window.confirm(`حذف ${selected.length} كتاب؟`)) return;
    await booksApi.bulkDelete(selected);
    toast.success('تم الحذف');
    setSelected([]);
    load();
  };

  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  // Upload many PDFs in batches to avoid huge single requests
  const runBulkUpload = async () => {
    if (!bulkFiles.length) return toast.error('اختر ملفات أولاً');
    setUploading(true);
    setProgress({ done: 0, total: bulkFiles.length });
    let ok = 0;
    let failed = 0;
    try {
      for (let i = 0; i < bulkFiles.length; i += BATCH) {
        const chunk = bulkFiles.slice(i, i + BATCH);
        const fd = new FormData();
        fd.append('category', bulkCategory);
        chunk.forEach((f) => fd.append('files', f));
        try {
          const res = await booksApi.bulkUpload(fd);
          ok += res.count || chunk.length;
        } catch {
          failed += chunk.length;
        }
        setProgress({ done: Math.min(i + BATCH, bulkFiles.length), total: bulkFiles.length });
      }
      toast.success(`تم رفع ${ok} ملف${failed ? ` (فشل ${failed})` : ''}`);
      setBulkOpen(false);
      setBulkFiles([]);
      load();
      booksApi.meta().then(setMeta).catch(() => {});
    } finally {
      setUploading(false);
    }
  };

  const { data, pagination, loading } = state;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">
          كتب النقض {pagination && <span className="text-base font-normal text-slate-400">({pagination.total.toLocaleString('ar-EG')})</span>}
        </h1>
        <div className="flex gap-2">
          {selected.length > 0 && (
            <button onClick={bulkDelete} className="btn-danger px-4 py-2"><FiTrash2 /> حذف المحدد ({selected.length})</button>
          )}
          <button onClick={() => { setBulkFiles([]); setBulkOpen(true); }} className="btn-gold px-4 py-2"><FiUploadCloud /> رفع دفعة</button>
          <button onClick={openNew} className="btn-primary px-4 py-2"><FiPlus /> إضافة كتاب</button>
        </div>
      </div>

      {/* Filters */}
      <form
        onSubmit={(e) => { e.preventDefault(); setPage(1); setApplied(filters); }}
        className="card mb-5 grid gap-3 p-4 md:grid-cols-4"
      >
        <div className="relative md:col-span-2">
          <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pr-9" placeholder="بحث بالعنوان أو رقم الطعن" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        </div>
        <select className="input" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
          <option value="">كل التصنيفات</option>
          {meta.categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <div className="flex gap-2">
          <select className="input" value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })}>
            <option value="">كل السنوات</option>
            {meta.years.map((y) => <option key={y}>{y}</option>)}
          </select>
          <button className="btn-primary px-4">بحث</button>
        </div>
      </form>

      {loading ? <Loader /> : data.length === 0 ? <EmptyState message="لا توجد كتب" icon={FiBook} /> : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-3"><input type="checkbox" onChange={(e) => setSelected(e.target.checked ? data.map((d) => d._id) : [])} checked={selected.length === data.length && data.length > 0} /></th>
                <th className="p-3 text-right">العنوان</th>
                <th className="p-3">رقم الطعن</th>
                <th className="p-3">السنة</th>
                <th className="p-3">التصنيف</th>
                <th className="p-3">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((b) => (
                <tr key={b._id} className="hover:bg-slate-50">
                  <td className="p-3 text-center"><input type="checkbox" checked={selected.includes(b._id)} onChange={() => toggle(b._id)} /></td>
                  <td className="p-3 font-medium text-slate-800">{b.title}</td>
                  <td className="p-3 text-center text-slate-500">{b.appealNumber}</td>
                  <td className="p-3 text-center text-slate-500">{b.year}</td>
                  <td className="p-3 text-center"><span className="badge bg-primary-50 text-primary-700">{b.category}</span></td>
                  <td className="p-3">
                    <div className="flex justify-center gap-2">
                      <a href={fileUrl(b.pdf)} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-primary-600"><FiBook /></a>
                      <button onClick={() => openEdit(b)} className="text-slate-400 hover:text-primary-600"><FiEdit2 /></button>
                      <button onClick={() => removeOne(b._id)} className="text-slate-400 hover:text-red-600"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pagination && <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />}

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'تعديل كتاب' : 'إضافة كتاب'}>
        <form onSubmit={submit} className="space-y-4">
          <div><label className="label">عنوان الكتاب *</label><input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="label">رقم الطعن</label><input className="input" value={form.appealNumber} onChange={(e) => setForm({ ...form, appealNumber: e.target.value })} /></div>
            <div><label className="label">السنة</label><input type="number" className="input" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} /></div>
            <div>
              <label className="label">التصنيف *</label>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div><label className="label">ملخص / وصف (اختياري)</label><textarea className="input min-h-20" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></div>
          <FileInput label="ملف PDF *" value={form.pdf} onChange={(f) => setForm({ ...form, pdf: f })} />
          <div className="flex justify-end gap-2"><button type="button" onClick={() => setOpen(false)} className="btn-outline">إلغاء</button><button disabled={saving} className="btn-primary">{saving ? 'جاري الحفظ...' : 'حفظ'}</button></div>
        </form>
      </Modal>

      {/* Bulk upload modal */}
      <Modal open={bulkOpen} onClose={() => !uploading && setBulkOpen(false)} title="رفع دفعة من الكتب">
        <div className="space-y-4">
          <div>
            <label className="label">التصنيف *</label>
            <select className="input" value={bulkCategory} onChange={(e) => setBulkCategory(e.target.value)} disabled={uploading}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">اختر ملفات PDF (يمكن اختيار عدد كبير مرة واحدة)</label>
            <input
              type="file"
              accept="application/pdf"
              multiple
              disabled={uploading}
              className="input"
              onChange={(e) => setBulkFiles([...e.target.files])}
            />
            {bulkFiles.length > 0 && (
              <p className="mt-1 text-sm text-slate-500">تم اختيار <span className="font-bold text-slate-700">{bulkFiles.length}</span> ملف — سيُرفع كل ملف باسمه ويُصنّف كـ «{bulkCategory}».</p>
            )}
          </div>

          {uploading && (
            <div>
              <div className="mb-1 flex justify-between text-xs text-slate-500">
                <span>جاري الرفع...</span>
                <span>{progress.done} / {progress.total}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-primary-600 transition-all" style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }} />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setBulkOpen(false)} disabled={uploading} className="btn-outline">إلغاء</button>
            <button onClick={runBulkUpload} disabled={uploading || !bulkFiles.length} className="btn-gold">
              {uploading ? 'جاري الرفع...' : `رفع ${bulkFiles.length || ''} ملف`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
