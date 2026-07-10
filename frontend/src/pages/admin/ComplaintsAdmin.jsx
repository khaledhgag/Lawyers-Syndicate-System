import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FiSearch, FiTrash2, FiEye, FiPaperclip, FiPrinter, FiDownload, FiVideo } from 'react-icons/fi';
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
    setActive({ ...active, adminNotes: notes });
    load();
  };

  const printReceipt = () => {
    if (!active) return;
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(buildReceiptHtml(active, notes));
    win.document.close();
    win.focus();
    win.print();
  };

  const downloadReceipt = () => {
    if (!active) return;
    const blob = new Blob([buildReceiptHtml(active, notes)], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `complaint-${active.ticketNumber || active._id}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
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
                <th className="p-3">الرقم المرجعي</th>
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
                  <td className="p-3 text-center font-mono text-xs text-primary-700" dir="ltr">{c.ticketNumber || '—'}</td>
                  <td className="p-3 font-medium text-slate-800">
                    {c.subject}
                    {getComplaintAttachments(c).length > 0 && <FiPaperclip className="mr-1 inline text-slate-400" />}
                    {c.video && <FiVideo className="mr-1 inline text-slate-400" />}
                  </td>
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
            <div className="flex flex-wrap justify-end gap-2">
              <button onClick={printReceipt} className="btn-outline">
                <FiPrinter /> طباعة الإيصال
              </button>
              <button onClick={downloadReceipt} className="btn-primary">
                <FiDownload /> تحميل الإيصال
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <p className="text-xs text-slate-400">إيصال شكوى / طلب</p>
                  <h3 className="mt-1 text-xl font-bold text-primary-900">{active.subject}</h3>
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-400">الرقم المرجعي</p>
                  <p className="font-mono text-lg font-bold text-primary-700" dir="ltr">{active.ticketNumber || '—'}</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <ReceiptField label="مقدم الطلب" value={active.fullName} />
                <ReceiptField label="نوع الطلب" value={active.requestType} />
                <ReceiptField label="الحالة" value={active.status} />
                <ReceiptField label="تاريخ الإرسال" value={formatDateTime(active.createdAt)} />
                <ReceiptField label="رقم القيد" value={active.membershipNumber} />
                <ReceiptField label="الجزئية" value={active.center} />
                <ReceiptField label="رقم الهاتف" value={active.phone} />
                <ReceiptField label="الرغبة في التواصل" value={active.wantsContact ? 'نعم' : 'لا'} />
              </div>
              <div className="mt-4">
                <p className="text-xs text-slate-400">تفاصيل الشكوى</p>
                <p className="mt-1 whitespace-pre-line rounded-lg bg-slate-50 p-3 leading-7 text-slate-700">{active.details}</p>
              </div>
              {notes && (
                <div className="mt-4">
                  <p className="text-xs text-slate-400">ملاحظات الإدارة</p>
                  <p className="mt-1 whitespace-pre-line rounded-lg bg-primary-50 p-3 leading-7 text-primary-900">{notes}</p>
                </div>
              )}
            </div>

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
            {(getComplaintAttachments(active).length > 0 || active.video) && (
              <div>
                <p className="mb-2 text-xs text-slate-400">المرفقات</p>
                <div className="flex flex-wrap gap-2">
                  {getComplaintAttachments(active).map((attachment, index) => (
                    <a key={attachment} href={fileUrl(attachment)} target="_blank" rel="noreferrer" className="btn-outline w-fit">
                      <FiPaperclip /> ملف {index + 1}
                    </a>
                  ))}
                  {active.video && (
                    <a href={fileUrl(active.video)} target="_blank" rel="noreferrer" className="btn-outline w-fit">
                      <FiVideo /> عرض الفيديو
                    </a>
                  )}
                </div>
              </div>
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
    <p className="font-semibold text-slate-700">{value || '—'}</p>
  </div>
);

const ReceiptField = ({ label, value }) => (
  <div className="rounded-lg bg-slate-50 p-3">
    <p className="text-xs text-slate-400">{label}</p>
    <p className="mt-1 font-semibold text-slate-800">{value || '—'}</p>
  </div>
);

const getComplaintAttachments = (item) => {
  const attachments = Array.isArray(item?.attachments) ? item.attachments.filter(Boolean) : [];
  if (item?.attachment && !attachments.includes(item.attachment)) attachments.unshift(item.attachment);
  return attachments;
};

const escapeHtml = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const buildReceiptHtml = (item, adminNotes = '') => {
  const field = (label, value) => `
    <div class="field">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value || '—')}</strong>
    </div>
  `;

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>إيصال شكوى ${escapeHtml(item.ticketNumber || '')}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; background: #f8fafc; color: #0f172a; font-family: Tahoma, Arial, sans-serif; }
    .page { width: min(840px, 100%); margin: 24px auto; background: #fff; border: 1px solid #e2e8f0; padding: 32px; }
    .header { display: flex; justify-content: space-between; gap: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
    .muted { color: #64748b; font-size: 13px; }
    h1 { margin: 6px 0 0; font-size: 26px; color: #123c69; }
    .ticket { text-align: left; }
    .ticket strong { display: block; color: #123c69; direction: ltr; font-size: 22px; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 22px; }
    .field { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; }
    .field span { display: block; color: #64748b; font-size: 12px; margin-bottom: 6px; }
    .field strong { font-size: 15px; }
    .section { margin-top: 22px; }
    .box { white-space: pre-line; line-height: 1.9; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; background: #fff; }
    .footer { margin-top: 28px; display: flex; justify-content: space-between; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 16px; }
    @media print {
      body { background: #fff; }
      .page { margin: 0; width: 100%; border: 0; }
    }
  </style>
</head>
<body>
  <main class="page">
    <header class="header">
      <div>
        <p class="muted">نقابة المحامين - إيصال شكوى / طلب</p>
        <h1>${escapeHtml(item.subject)}</h1>
      </div>
      <div class="ticket">
        <span class="muted">الرقم المرجعي</span>
        <strong>${escapeHtml(item.ticketNumber || '—')}</strong>
      </div>
    </header>
    <section class="grid">
      ${field('مقدم الطلب', item.fullName)}
      ${field('نوع الطلب', item.requestType)}
      ${field('الحالة', item.status)}
      ${field('تاريخ الإرسال', formatDateTime(item.createdAt))}
      ${field('رقم القيد', item.membershipNumber)}
      ${field('الجزئية', item.center)}
      ${field('رقم الهاتف', item.phone)}
      ${field('الرغبة في التواصل', item.wantsContact ? 'نعم' : 'لا')}
    </section>
    <section class="section">
      <p class="muted">تفاصيل الشكوى</p>
      <div class="box">${escapeHtml(item.details)}</div>
    </section>
    <section class="section">
      <p class="muted">ملاحظات الإدارة</p>
      <div class="box">${escapeHtml(adminNotes || item.adminNotes || '—')}</div>
    </section>
    <footer class="footer">
      <span>تم إنشاء الإيصال من لوحة الإدارة</span>
      <span>${escapeHtml(formatDateTime(new Date()))}</span>
    </footer>
  </main>
</body>
</html>`;
};
