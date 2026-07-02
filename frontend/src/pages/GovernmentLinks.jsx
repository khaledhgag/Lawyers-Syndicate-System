import { useCallback } from 'react';
import { FiExternalLink } from 'react-icons/fi';
import SEO from '../components/ui/SEO.jsx';
import PageHero from '../components/layout/PageHero.jsx';
import Loader from '../components/ui/Loader.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { governmentLinksApi } from '../api/services.js';
import useFetch from '../hooks/useFetch.js';

export default function GovernmentLinks() {
  const fetcher = useCallback(() => governmentLinksApi.list(), []);
  const { data, loading, error, refetch } = useFetch(fetcher);
  const items = data?.data || [];

  return (
    <>
      <SEO title="المواقع الحكومية" />
      <PageHero title="المواقع الحكومية" subtitle="روابط الجهات والمواقع الحكومية المهمة" />
      <div className="container-page py-12">
        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : items.length === 0 ? (
          <EmptyState message="لا توجد روابط متاحة حالياً" />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((g) => (
              <a
                key={g._id}
                href={g.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card group flex flex-col p-6 transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-lg"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-2xl">🏛️</span>
                  <FiExternalLink className="text-slate-300 transition group-hover:text-primary-600" />
                </div>
                <h3 className="text-lg font-bold text-primary-900">{g.name}</h3>
                {g.description && <p className="mt-2 flex-1 text-sm text-slate-600">{g.description}</p>}
                <span className="mt-4 text-sm font-semibold text-primary-700">زيارة الموقع ←</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
