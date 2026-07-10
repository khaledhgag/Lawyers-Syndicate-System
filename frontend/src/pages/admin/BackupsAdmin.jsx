import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { FiDatabase, FiDownload, FiTrash2, FiRefreshCw, FiPlus, FiClock } from 'react-icons/fi';
import { backupsApi } from '../../api/services.js';
import Loader from '../../components/ui/Loader.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { formatDateTime } from '../../utils/format.js';

const formatSize = (bytes) => {
  if (!bytes) return '0 B';
  const mb = bytes / 1048576;
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
};

export default function BackupsAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [prog, setProg] = useState(null);
  const pollRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await backupsApi.list();
      setItems(r.data || []);
    } catch {
      toast.error('تعذر جلب النسخ الاحتياطية');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    return () => clearInterval(pollRef.current);
  }, []);

  const create = async () => {
    if (creating) return;
    setCreating(true);
    setProg({ running: true, percent: 0, processedFiles: 0, totalFiles: 0 });
    // Poll progress while the (possibly long) create request is in flight
    pollRef.current = setInterval(async () => {
      try {
        const p = await backupsApi.progress();
        setProg(p);
      } catch {
        /* ignore transient poll errors */
      }
    }, 1500);
    try {
      const res = await backupsApi.create();
      toast.success(`تم إنشاء النسخة (${formatSize(res.size)})`);
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'تعذر إنشاء النسخة الاحتياطية');
    } finally {
      clearInterval(pollRef.current);
      setCreating(false);
      setProg(null);
    }
  };

  const remove = async (filename) => {
    if (!window.confirm(`حذف النسخة الاحتياطية؟\n${filename}`)) return;
    try {
      await backupsApi.remove(filename);
      toast.success('تم الحذف');
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'تعذر الحذف');
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">
          النسخ الاحتياطية <span className="text-base font-normal text-slate-400">({items.length})</span>
        </h1>
        <div className="flex gap-2">
          <button onClick={load} disabled={loading} className="btn-outline px-4 py-2"><FiRefreshCw /> تحديث</button>
          <button onClick={create} disabled={creating} className="btn-primary px-4 py-2">
            <FiPlus /> {creating ? 'جاري الإنشاء...' : 'إنشاء نسخة احتياطية'}
          </button>
        </div>
      </div>

      <p className="mb-5 -mt-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
        💾 يتم ضغط كل الملفات المرفوعة (PDF/صور/Word) في ملف ZIP واحد. النسخ لا تُحذف تلقائياً — احذفها يدوياً عند الحاجة.
      </p>

      {/* Progress while creating */}
      {creating && prog && (
        <div className="card mb-5 p-5">
          <div className="mb-2 flex justify-between text-sm text-slate-600">
            <span>جاري ضغط الملفات...</span>
            <span>{prog.processedFiles?.toLocaleString('ar-EG') || 0} / {prog.totalFiles?.toLocaleString('ar-EG') || 0}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div className="h-3 rounded-full bg-primary-600 transition-all" style={{ width: `${prog.percent || 0}%` }} />
          </div>
          <p className="mt-1 text-left text-xs text-slate-400">{prog.percent || 0}%</p>
        </div>
      )}

      {loading ? (
        <Loader />
      ) : items.length === 0 ? (
        <EmptyState message="لا توجد نسخ احتياطية بعد" icon={FiDatabase} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-3 text-right">اسم الملف</th>
                <th className="p-3">الحجم</th>
                <th className="p-3">تاريخ الإنشاء</th>
                <th className="p-3">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((b) => (
                <tr key={b.filename} className="hover:bg-slate-50">
                  <td className="p-3 font-mono text-xs text-slate-700" dir="ltr">{b.filename}</td>
                  <td className="p-3 text-center font-semibold text-slate-700">{formatSize(b.size)}</td>
                  <td className="p-3 text-center text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1"><FiClock /> {formatDateTime(b.createdAt)}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-center gap-2">
                      <a href={backupsApi.downloadUrl(b.filename)} className="btn-outline px-3 py-1.5 text-xs"><FiDownload /> تحميل</a>
                      <button onClick={() => remove(b.filename)} className="btn-danger px-3 py-1.5 text-xs"><FiTrash2 /> حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
