import { useCallback } from 'react';
import {
  FiUsers, FiBriefcase, FiTag, FiBookOpen, FiFileText, FiBook, FiLink, FiActivity, FiInbox,
} from 'react-icons/fi';
import { statsApi } from '../../api/services.js';
import useFetch from '../../hooks/useFetch.js';
import Loader from '../../components/ui/Loader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import { formatDateTime } from '../../utils/format.js';

const statusColors = {
  جديد: 'bg-blue-100 text-blue-700',
  'جاري المراجعة': 'bg-amber-100 text-amber-700',
  'تم الرد': 'bg-green-100 text-green-700',
  مغلق: 'bg-slate-200 text-slate-600',
};

export default function Dashboard() {
  const fetcher = useCallback(() => statsApi.get(), []);
  const { data, loading, error, refetch } = useFetch(fetcher);

  if (loading) return <Loader full />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const { counts, recentComplaints } = data.data;

  const cards = [
    { label: 'أعضاء المجلس', value: counts.boardMembers, Icon: FiUsers, color: 'bg-indigo-500' },
    { label: 'الخدمات', value: counts.services, Icon: FiBriefcase, color: 'bg-emerald-500' },
    { label: 'العروض', value: counts.offers, Icon: FiTag, color: 'bg-amber-500' },
    { label: 'الندوات', value: counts.lectures, Icon: FiBookOpen, color: 'bg-sky-500' },
    { label: 'أحكام النقض', value: counts.judgments, Icon: FiFileText, color: 'bg-rose-500' },
    { label: 'كتب قانونية', value: counts.books, Icon: FiBook, color: 'bg-cyan-500' },
    { label: 'التعاقدات', value: counts.contracts, Icon: FiBriefcase, color: 'bg-violet-500' },
    { label: 'المواقع الحكومية', value: counts.governmentLinks, Icon: FiLink, color: 'bg-teal-500' },
    { label: 'الأنشطة', value: counts.activities, Icon: FiActivity, color: 'bg-pink-500' },
    { label: 'إجمالي الطلبات', value: counts.complaints, Icon: FiInbox, color: 'bg-primary-600' },
    { label: 'طلبات جديدة', value: counts.newComplaints, Icon: FiInbox, color: 'bg-red-500' },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">لوحة الإحصائيات</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="card flex items-center gap-4 p-4">
            <span className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${c.color}`}>
              <c.Icon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">{(c.value ?? 0).toLocaleString('ar-EG')}</p>
              <p className="text-xs text-slate-500">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="card p-5">
          <h2 className="mb-4 font-bold text-slate-800">أحدث الطلبات والشكاوى</h2>
          <div className="divide-y divide-slate-100">
            {recentComplaints.length === 0 && <p className="text-sm text-slate-400">لا توجد طلبات</p>}
            {recentComplaints.map((c) => (
              <div key={c._id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{c.subject}</p>
                  <p className="text-xs text-slate-400">
                    {c.fullName} · {c.requestType} · {formatDateTime(c.createdAt)}
                  </p>
                </div>
                <span className={`badge ${statusColors[c.status]}`}>{c.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
