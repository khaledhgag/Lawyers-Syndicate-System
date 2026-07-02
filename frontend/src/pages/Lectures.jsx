import { useCallback, useState } from 'react';
import { FiCalendar, FiExternalLink, FiFileText, FiPlay } from 'react-icons/fi';
import SEO from '../components/ui/SEO.jsx';
import PageHero from '../components/layout/PageHero.jsx';
import Loader from '../components/ui/Loader.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Modal from '../components/ui/Modal.jsx';
import { lecturesApi } from '../api/services.js';
import { fileUrl } from '../api/axios.js';
import useFetch from '../hooks/useFetch.js';
import { formatDate } from '../utils/format.js';
import { youtubeEmbed, youtubeThumb } from '../utils/youtube.js';

export default function Lectures() {
  const fetcher = useCallback(() => lecturesApi.list(), []);
  const { data, loading, error, refetch } = useFetch(fetcher);
  const [playing, setPlaying] = useState(null);
  const items = data?.data || [];

  return (
    <>
      <SEO title="الندوات والمحاضرات" />
      <PageHero title="الندوات والمحاضرات" subtitle="فعاليات وندوات ومحاضرات النقابة بالفيديو" />
      <div className="container-page py-12">
        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : items.length === 0 ? (
          <EmptyState message="لا توجد ندوات متاحة حالياً" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((l) => {
              const embed = youtubeEmbed(l.videoUrl);
              const thumb = l.image ? fileUrl(l.image) : youtubeThumb(l.videoUrl);
              return (
                <div key={l._id} className="card flex flex-col overflow-hidden">
                  {/* Thumbnail with play overlay */}
                  <button
                    type="button"
                    onClick={() => embed && setPlaying(l)}
                    className="group relative block aspect-video w-full overflow-hidden bg-slate-900"
                    disabled={!embed}
                  >
                    {thumb ? (
                      <img src={thumb} alt={l.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary-50 text-4xl text-primary-300">🎓</div>
                    )}
                    {embed && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/25 transition group-hover:bg-black/40">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition group-hover:scale-110">
                          <FiPlay className="mr-0.5 h-6 w-6" />
                        </span>
                      </span>
                    )}
                  </button>

                  <div className="flex flex-1 flex-col p-5">
                    <span className="mb-2 flex items-center gap-1 text-xs text-slate-500">
                      <FiCalendar /> {formatDate(l.date)}
                    </span>
                    <h3 className="text-lg font-bold text-primary-900">{l.title}</h3>
                    <p className="mt-2 flex-1 line-clamp-3 text-sm text-slate-600">{l.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {embed && (
                        <button onClick={() => setPlaying(l)} className="btn-primary">
                          <FiPlay /> مشاهدة الفيديو
                        </button>
                      )}
                      {l.pdf && (
                        <a href={fileUrl(l.pdf)} target="_blank" rel="noopener noreferrer" className="btn-outline">
                          <FiFileText /> ملف PDF
                        </a>
                      )}
                      {l.externalLink && (
                        <a href={l.externalLink} target="_blank" rel="noopener noreferrer" className="btn-outline">
                          <FiExternalLink /> رابط
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Video player modal */}
      <Modal open={!!playing} onClose={() => setPlaying(null)} title={playing?.title} size="lg">
        {playing && (
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
            <iframe
              title={playing.title}
              src={youtubeEmbed(playing.videoUrl) + '?autoplay=1&rel=0'}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </Modal>
    </>
  );
}
