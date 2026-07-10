import { useCallback, useState } from 'react';
import { FiExternalLink } from 'react-icons/fi';
import SEO from '../components/ui/SEO.jsx';
import PageHero from '../components/layout/PageHero.jsx';
import Loader from '../components/ui/Loader.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { governmentLinksApi } from '../api/services.js';
import { fileUrl } from '../api/axios.js';
import { faviconUrl } from '../utils/favicon.js';
import useFetch from '../hooks/useFetch.js';

// Shows the site's logo: a custom uploaded icon if present, otherwise the
// auto-fetched favicon, falling back to a building emoji if the image fails.
function SiteLogo({ link }) {
  const [failed, setFailed] = useState(false);
  const src = link.icon ? fileUrl(link.icon) : faviconUrl(link.url);
  if (failed || !src) {
    return <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-2xl">🏛️</span>;
  }
  return (
    <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-slate-100">
      <img src={src} alt="" className="h-8 w-8 object-contain" onError={() => setFailed(true)} />
    </span>
  );
}

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
                  <SiteLogo link={g} />
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
