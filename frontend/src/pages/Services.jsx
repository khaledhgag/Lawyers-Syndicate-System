import { useCallback, useState } from 'react';
import SEO from '../components/ui/SEO.jsx';
import PageHero from '../components/layout/PageHero.jsx';
import Loader from '../components/ui/Loader.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Modal from '../components/ui/Modal.jsx';
import { servicesApi } from '../api/services.js';
import { fileUrl } from '../api/axios.js';
import useFetch from '../hooks/useFetch.js';

export default function Services() {
  const fetcher = useCallback(() => servicesApi.list(), []);
  const { data, loading, error, refetch } = useFetch(fetcher);
  const [active, setActive] = useState(null);
  const items = data?.data || [];

  return (
    <>
      <SEO title="ما تقدمه النقابة الفرعية" />
      <PageHero title="ما تقدمه النقابة الفرعية" subtitle="الخدمات التي تقدمها النقابة لخدمة السادة المحامين" />
      <div className="container-page py-12">
        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : items.length === 0 ? (
          <EmptyState message="لا توجد خدمات متاحة حالياً" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((srv) => (
              <div key={srv._id} className="card flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
                {srv.image ? (
                  <img src={fileUrl(srv.image)} alt={srv.title} className="h-48 w-full object-cover" />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-primary-50 text-5xl text-primary-300">⚖</div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-bold text-primary-900">{srv.title}</h3>
                  <p className="mt-2 flex-1 line-clamp-3 text-sm text-slate-600">{srv.description}</p>
                  {srv.details && (
                    <button onClick={() => setActive(srv)} className="btn-outline mt-4 w-fit">
                      التفاصيل
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={!!active} onClose={() => setActive(null)} title={active?.title}>
        {active?.image && <img src={fileUrl(active.image)} alt="" className="mb-4 h-56 w-full rounded-xl object-cover" />}
        <p className="mb-3 font-semibold text-slate-700">{active?.description}</p>
        <p className="whitespace-pre-line leading-8 text-slate-600">{active?.details}</p>
      </Modal>
    </>
  );
}
