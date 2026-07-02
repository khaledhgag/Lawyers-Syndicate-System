import { useCallback } from 'react';
import { FiTag, FiCalendar } from 'react-icons/fi';
import SEO from '../components/ui/SEO.jsx';
import PageHero from '../components/layout/PageHero.jsx';
import Loader from '../components/ui/Loader.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { offersApi } from '../api/services.js';
import { fileUrl } from '../api/axios.js';
import useFetch from '../hooks/useFetch.js';
import { formatDate } from '../utils/format.js';

export default function Offers() {
  const fetcher = useCallback(() => offersApi.list(), []);
  const { data, loading, error, refetch } = useFetch(fetcher);
  const items = data?.data || [];

  return (
    <>
      <SEO title="العروض الحصرية" />
      <PageHero title="العروض الحصرية" subtitle="عروض وخصومات حصرية للسادة المحامين" />
      <div className="container-page py-12">
        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : items.length === 0 ? (
          <EmptyState message="لا توجد عروض متاحة حالياً" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((o) => {
              const expired = o.expirationDate && new Date(o.expirationDate) < new Date();
              return (
                <div key={o._id} className="card relative flex flex-col overflow-hidden">
                  {o.discount && (
                    <span className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-gold-500 px-3 py-1 text-sm font-bold text-white shadow">
                      <FiTag /> {o.discount}
                    </span>
                  )}
                  {o.image ? (
                    <img src={fileUrl(o.image)} alt={o.name} className="h-48 w-full object-cover" />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-gold-400/10 text-5xl text-gold-500">🏷️</div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-bold text-primary-900">{o.name}</h3>
                    <p className="mt-2 flex-1 text-sm text-slate-600">{o.description}</p>
                    <div className="mt-4 flex items-center justify-between text-xs">
                      {o.expirationDate && (
                        <span className="flex items-center gap-1 text-slate-500">
                          <FiCalendar /> ينتهي: {formatDate(o.expirationDate)}
                        </span>
                      )}
                      <span className={`badge ${expired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {expired ? 'منتهي' : 'ساري'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
