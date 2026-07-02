import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FiSearch, FiTrash2, FiEye, FiPaperclip } from 'react-icons/fi';
import { complaintsApi } from '../../api/services.js';
import { fileUrl } from '../../api/axios.js';
import Loader from '../../components/ui/Loader.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { STATUS_COLORS } from '../../components/admin/AdminShared.jsx';
import { formatDateTime } from '../../utils/format.js';

const STATUSES = ['جديد', 'جاري المراجعة', 'تم الرد', 'مغلق'];
const TYPES = ['مقترح', 'شكوى', 'استفسار', 'طلب تطوير خدمة'];
const LIMIT = 15;

export default function ComplaintsAdmin() {
  const [filters, setFilters] = useState({ search: '', status: '', requestType: '' });
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ data: [], pagination: null, loading: true });
  const [active, setActive] = useState(null);
  const [notes, setNotes] = useState('');

  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true }));
    complaintsApi
      .list({ ...filters, page, limit: LIMIT })
      .then((r) => setState({ data: r.data, pagination: r.pagination, loading: false }))
      .catch(() => setState({ data: [], pagination: null, loading: false }));
  }, [filters, page]);

  useEffect(() => { load(); }, [load]);

  const openDetail = (c) => { setActive(c); setNotes(c.adminNotes || ''); };

  const updateStatus = async (id, status) => {
    await complaintsApi.update(id, { status });
    toast.success('تم تحديث الحالة');
    load();
    if (active?._id === id) setActive({ ...active, status });
  };

  const saveNotes = async () => {
    await complaintsApi.update(active._id, { adminNotes: notes });
    toast.success('تم حفظ الملاحظات');
    load();
  };

  const removeOne = async (id) => {
    if (!window.confirm('تأكيد حذف الطلب؟')) return;
    await complaintsApi.remove(id);
    toast.success('تم الحذف');
    setActive(null);
    load();
  };

  const { data, pagination, loading } = state;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">
        الشكاوى والطلبات {pagination && <span className="text-base font-normal text-slate-400">({pagination.total})</span>}
      </h1>

      <div className="card mb-5 grid gap-3 p-4 md:grid-cols-4">
        <div className="relative md:col-span-2">
          <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pr-9" placeholder="بحث بالاسم أو رقم القيد أو الهاتف" value={filters.search} onChange={(e) => { setPage(1); setFilters({ ...filters, search: e.target.value }); }} />
        </div>
        <select className="input" value={filters.status} onChange={(e) => { setPage(1); setFilters({ ...filters, status: e.target.value }); }}>
          <option value="">كل الحالات</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="input" value={filters.requestType} onChange={(e) => { setPage(1); setFilters({ ...filters, requestType: e.target.value }); }}>
          <option value="">كل الأنواع</option>
          {TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>

      {loading ? <Loader /> : data.length === 0 ? <EmptyState message="لا توجد طلبات" /> : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-3 text-right">العنوان</th>
                <th className="p-3">النوع</th>
                <th className="p-3">مقدم الطلب</th>
                <th className="p-3">التاريخ</th>
                <th className="p-3">الحالة</th>
                <th className="p-3">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50">
                  <td className="p-3 font-medium text-slate-800">{c.subject}{c.attachment && <FiPaperclip className="mr-1 inline text-slate-400" />}</td>
                  <td className="p-3 text-center text-slate-500">{c.requestType}</td>
                  <td className="p-3 text-center text-slate-500">{c.fullName}</td>
                  <td className="p-3 text-center text-xs text-slate-400">{formatDateTime(c.createdAt)}</td>
                  <td className="p-3 text-center">
                    <select value={c.status} onChange={(e) => updateStatus(c._id, e.target.value)} className={`rounded-full border-0 px-2 py-1 text-xs font-semibold ${STATUS_COLORS[c.status]}`}>
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => openDetail(c)} className="text-slate-400 hover:text-primary-600"><FiEye /></button>
                      <button onClick={() => removeOne(c._id)} className="text-slate-400 hover:text-red-600"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pagination && <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />}

      <Modal open={!!active} onClose={() => setActive(null)} title="تفاصيل الطلب" size="lg">
        {active && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <Field label="نوع الطلب" value={active.requestType} />
              <Field label="الحالة" value={active.status} />
              <Field label="الاسم رباعي" value={active.fullName} />
              <Field label="رقم القيد" value={active.membershipNumber} />
              <Field label="الجزئية" value={active.center} />
              <Field label="رقم الهاتف" value={active.phone} />
              <Field label="الرغبة في التواصل" value={active.wantsContact ? 'نعم' : 'لا'} />
              <Field label="تاريخ الإرسال" value={formatDateTime(active.createdAt)} />
            </div>
            <Field label="عنوان الطلب" value={active.subject} />
            <div>
              <p className="text-xs text-slate-400">تفاصيل الطلب</p>
              <p className="whitespace-pre-line rounded-lg bg-slate-50 p-3 leading-7 text-slate-700">{active.details}</p>
            </div>
            {active.attachment && (
              <a href={fileUrl(active.attachment)} target="_blank" rel="noreferrer" className="btn-outline w-fit"><FiPaperclip /> عرض المرفق</a>
            )}
            <div>
              <label className="label">ملاحظات الإدارة</label>
              <textarea className="input min-h-20" value={notes} onChange={(e) => setNotes(e.target.value)} />
              <button onClick={saveNotes} className="btn-primary mt-2">حفظ الملاحظات</button>
            </div>
            <div>
              <label className="label">تغيير الحالة</label>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button key={s} onClick={() => updateStatus(active._id, s)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${active.status === s ? 'ring-2 ring-primary-500' : ''} ${STATUS_COLORS[s]}`}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs text-slate-400">{label}</p>
    <p className="font-semibold text-slate-700">{value}</p>
  </div>
);
