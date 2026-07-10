import { useCallback, useState } from 'react';
import { FiCalendar } from 'react-icons/fi';
import SEO from '../components/ui/SEO.jsx';
import PageHero from '../components/layout/PageHero.jsx';
import Loader from '../components/ui/Loader.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { activitiesApi } from '../api/services.js';
import { fileUrl } from '../api/axios.js';
import useFetch from '../hooks/useFetch.js';
import { formatDate } from '../utils/format.js';

export default function Activities() {
  const [tab, setTab] = useState(''); // '' = all
  const [lightbox, setLightbox] = useState(null);

  const fetcher = useCallback(() => activitiesApi.list(), []);
  const { data, loading, error, refetch } = useFetch(fetcher);
  const all = data?.data || [];

  // Categories derived from the data itself
  const categories = [...new Set(all.map((a) => a.type).filter(Boolean))];
  const items = tab ? all.filter((a) => a.type === tab) : all;

  return (
    <>
      <SEO title="أنشطة النقابة" />
      <PageHero title="أنشطة النقابة" subtitle="أنشطة ورحلات وفعاليات النقابة للسادة المحامين" />
      <div className="container-page py-12">
        {/* Tabs — dynamic from categories */}
        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setTab('')}
              className={`rounded-full px-6 py-2.5 text-sm font-semibold transition ${
                tab === '' ? 'bg-primary-700 text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              الكل
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setTab(c)}
                className={`rounded-full px-6 py-2.5 text-sm font-semibold transition ${
                  tab === c ? 'bg-primary-700 text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : items.length === 0 ? (
          <EmptyState message="لا توجد أنشطة في هذا القسم حالياً" />
        ) : (
          <div className="space-y-10">
            {items.map((a) => (
              <div key={a._id} className="card overflow-hidden p-6">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xl font-bold text-primary-900">{a.title}</h3>
                  <span className="flex items-center gap-1 text-sm text-slate-500">
                    <FiCalendar /> {formatDate(a.date)}
                  </span>
                </div>
                <p className="leading-8 text-slate-600">{a.description}</p>
                {a.gallery?.length > 0 && (
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {a.gallery.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setLightbox(fileUrl(img))}
                        className="group relative aspect-video overflow-hidden rounded-xl"
                      >
                        <img
                          src={fileUrl(img)}
                          alt=""
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <img src={lightbox} alt="" className="max-h-[90vh] max-w-full rounded-lg" />
        </div>
      )}
    </>
  );
}
