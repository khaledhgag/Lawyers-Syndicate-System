import { useCallback } from 'react';
import { FiCheckCircle, FiPhone } from 'react-icons/fi';
import SEO from '../components/ui/SEO.jsx';
import PageHero from '../components/layout/PageHero.jsx';
import Loader from '../components/ui/Loader.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { contractsApi } from '../api/services.js';
import { fileUrl } from '../api/axios.js';
import useFetch from '../hooks/useFetch.js';

export default function Contracts() {
  const fetcher = useCallback(() => contractsApi.list(), []);
  const { data, loading, error, refetch } = useFetch(fetcher);
  const items = data?.data || [];

  return (
    <>
      <SEO title="تعاقدات النقابة" />
      <PageHero title="تعاقدات النقابة" subtitle="الجهات المتعاقدة مع النقابة لخدمة السادة المحامين" />
      <div className="container-page py-12">
        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : items.length === 0 ? (
          <EmptyState message="لا توجد تعاقدات متاحة حالياً" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((c) => (
              <div key={c._id} className="card flex flex-col overflow-hidden">
                {c.image ? (
                  <img src={fileUrl(c.image)} alt={c.organizationName} className="h-44 w-full object-cover" />
                ) : (
                  <div className="flex h-44 items-center justify-center bg-primary-50 text-4xl text-primary-300">🤝</div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-bold text-primary-900">{c.organizationName}</h3>
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
