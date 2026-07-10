import { useCallback, useMemo, useState } from 'react';
import { FiCalendar, FiCheckCircle, FiPhone } from 'react-icons/fi';
import SEO from '../components/ui/SEO.jsx';
import PageHero from '../components/layout/PageHero.jsx';
import Loader from '../components/ui/Loader.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { contractsApi } from '../api/services.js';
import { fileUrl } from '../api/axios.js';
import useFetch from '../hooks/useFetch.js';
import { formatDate } from '../utils/format.js';

export default function Contracts() {
  const [sort, setSort] = useState('order');
  const fetcher = useCallback(() => contractsApi.list(), []);
  const { data, loading, error, refetch } = useFetch(fetcher);
  const items = useMemo(() => {
    const source = data?.data || [];
    return [...source].sort((a, b) => {
      if (sort === 'order') {
        const firstOrder = Number(a.order ?? 0);
        const secondOrder = Number(b.order ?? 0);
        if (firstOrder !== secondOrder) return firstOrder - secondOrder;
      }
      const first = new Date(a.createdAt || 0).getTime();
      const second = new Date(b.createdAt || 0).getTime();
      return sort === 'oldest' ? first - second : second - first;
    });
  }, [data, sort]);

  return (
    <>
      <SEO title="تعاقدات النقابة" />
      <PageHero title="تعاقدات النقابة" subtitle="الجهات المتعاقدة مع النقابة لخدمة السادة المحامين" />
      <div className="container-page py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-700">ترتيب التعاقدات</p>
          <select className="input max-w-xs" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="order">ترتيب الأماكن</option>
            <option value="newest">الأحدث للأقدم</option>
            <option value="oldest">الأقدم للأحدث</option>
          </select>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : items.length === 0 ? (
          <EmptyState message="لا توجد تعاقدات متاحة حالياً" />
        ) : (
          <div className="grid gap-7 lg:grid-cols-2">
            {items.map((c) => (
              <div key={c._id} className="card flex flex-col overflow-hidden">
                {c.image ? (
                  <img src={fileUrl(c.image)} alt={c.organizationName} className="h-72 w-full object-cover sm:h-80" />
                ) : (
                  <div className="flex h-72 items-center justify-center bg-primary-50 text-5xl text-primary-300 sm:h-80">🤝</div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-xl font-bold text-primary-900">{c.organizationName}</h3>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <FiCalendar /> تاريخ الإضافة: {formatDate(c.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{c.description}</p>
                  {c.benefits && (
                    <p className="mt-3 flex items-start gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                      <FiCheckCircle className="mt-0.5 shrink-0" /> {c.benefits}
                    </p>
                  )}
                  {c.contactInfo && (
                    <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <FiPhone className="text-gold-500" /> {c.contactInfo}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
