import { useCallback, useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { FaBalanceScale } from 'react-icons/fa';
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
              <div
                key={srv._id}
                className="group card relative flex flex-col overflow-hidden border-t-4 border-transparent transition hover:-translate-y-1.5 hover:border-gold-500 hover:shadow-xl"
              >
                {srv.image ? (
                  <div className="relative h-44 w-full overflow-hidden">
                    <img src={fileUrl(srv.image)} alt={srv.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                ) : (
                  <div className="relative flex h-44 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-primary-800 to-primary-600">
                    <FaBalanceScale className="text-6xl text-gold-300/40" />
                  </div>
                )}

                <div className="flex flex-1 flex-col p-6">
                  <span className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-gold-500/10 px-3 py-1 text-xs font-bold text-gold-600">
                    <FaBalanceScale className="h-3 w-3" /> خدمة نقابية
                  </span>
                  <h3 className="text-lg font-bold text-primary-900">{srv.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-7 text-slate-600 line-clamp-3">{srv.description}</p>
                  {srv.details && (
                    <button
                      onClick={() => setActive(srv)}
                      className="mt-4 inline-flex w-fit items-center gap-1 text-sm font-bold text-primary-700 transition group-hover:gap-2 hover:text-gold-600"
                    >
                      عرض التفاصيل <FiArrowLeft />
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
