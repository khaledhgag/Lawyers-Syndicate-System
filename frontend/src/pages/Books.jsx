import { useCallback, useEffect, useState } from 'react';
import { FiSearch, FiFilter, FiBook, FiDownload, FiEye, FiX } from 'react-icons/fi';
import SEO from '../components/ui/SEO.jsx';
import PageHero from '../components/layout/PageHero.jsx';
import Loader from '../components/ui/Loader.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import { booksApi } from '../api/services.js';
import { fileUrl } from '../api/axios.js';

const LIMIT = 12;

export default function Books() {
  const [filters, setFilters] = useState({ search: '', year: '', appealNumber: '' });
  const [applied, setApplied] = useState({ search: '', year: '', appealNumber: '' });
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ categories: [], years: [] });
  const [state, setState] = useState({ data: [], pagination: null, loading: true, error: null });
  const [viewer, setViewer] = useState(null);

  useEffect(() => {
    booksApi.meta().then((r) => setMeta(r)).catch(() => {});
  }, []);

  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    booksApi
      .list({ ...applied, page, limit: LIMIT })
      .then((r) => setState({ data: r.data, pagination: r.pagination, loading: false, error: null }))
      .catch((e) =>
        setState({ data: [], pagination: null, loading: false, error: e?.response?.data?.message || 'حدث خطأ' })
      );
  }, [applied, page]);

  useEffect(() => {
    load();
  }, [load]);

  const submitSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setApplied(filters);
  };

  const reset = () => {
    const empty = { search: '', year: '', appealNumber: '' };
    setFilters(empty);
    setApplied(empty);
    setPage(1);
  };

  const { data, pagination, loading, error } = state;

  return (
    <>
      <SEO title="كتب قانونية" description="مكتبة كتب ومراجع قانونية بتصنيفاتها المختلفة." />
      <PageHero title="كتب قانونية" subtitle="مكتبة شاملة للكتب والمراجع القانونية - بحث وتصفية حسب التصنيف والسنة" />

      <div className="container-page py-10">
        {/* Filters */}
        <form onSubmit={submitSearch} className="card mb-8 p-5">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className={meta.years.length ? 'lg:col-span-2' : 'lg:col-span-3'}>
              <label className="label">بحث</label>
              <div className="relative">
                <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="input pr-9"
                  placeholder="ابحث باسم الكتاب..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
            </div>
            {meta.years.length > 0 && (
              <div>
                <label className="label">السنة</label>
                <select className="input" value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })}>
                  <option value="">كل السنوات</option>
                  {meta.years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex items-end gap-2">
              <button type="submit" className="btn-primary flex-1 py-2.5">
                <FiFilter /> تطبيق
              </button>
              <button type="button" onClick={reset} className="btn-outline py-2.5">
                مسح
              </button>
            </div>
          </div>
        </form>

        {/* Results */}
        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : data.length === 0 ? (
          <EmptyState message="لا توجد كتب مطابقة لبحثك" icon={FiBook} />
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-500">
              إجمالي النتائج: <span className="font-bold text-slate-700">{pagination?.total?.toLocaleString('ar-EG')}</span>
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((b) => (
                <div key={b._id} className="card flex flex-col p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="badge bg-primary-50 text-primary-700">كتاب قانوني</span>
                    {b.year && <span className="text-xs text-slate-400">سنة {b.year}</span>}
                  </div>
                  <h3 className="font-bold text-slate-900 line-clamp-2">{b.title}</h3>
                  {b.appealNumber && <p className="mt-1 text-sm text-slate-500">رقم الطعن: {b.appealNumber}</p>}
                  {b.summary && <p className="mt-2 line-clamp-2 text-xs text-slate-500">{b.summary}</p>}
                  <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                    <button onClick={() => setViewer(b)} className="btn-primary flex-1 py-2 text-xs">
                      <FiEye /> عرض
                    </button>
                    <a href={fileUrl(b.pdf)} download className="btn-outline py-2 text-xs">
                      <FiDownload /> تحميل
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />
          </>
        )}
      </div>

      {/* PDF Viewer */}
      {viewer && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/80 p-4">
          <div className="mb-2 flex items-center justify-between text-white">
            <div>
              <h3 className="font-bold">{viewer.title}</h3>
              <p className="text-xs text-slate-300">
                {[viewer.appealNumber && `رقم الطعن: ${viewer.appealNumber}`, viewer.year && `سنة ${viewer.year}`]
                  .filter(Boolean)
                  .join(' - ')}
              </p>
            </div>
            <div className="flex gap-2">
              <a href={fileUrl(viewer.pdf)} download className="btn-gold py-2 text-xs">
                <FiDownload /> تحميل
              </a>
              <button onClick={() => setViewer(null)} className="btn-outline py-2 text-xs">
                <FiX /> إغلاق
              </button>
            </div>
          </div>
          {/\.pdf$/i.test(viewer.pdf) ? (
            <iframe title={viewer.title} src={fileUrl(viewer.pdf)} className="flex-1 rounded-lg bg-white" />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg bg-white p-6 text-center">
              <FiBook className="h-16 w-16 text-slate-300" />
              <p className="max-w-md text-slate-600">هذا ملف Word ولا يمكن معاينته داخل المتصفح مباشرة. اضغط بالأسفل لتحميله وفتحه على جهازك.</p>
              <a href={fileUrl(viewer.pdf)} download className="btn-primary px-6 py-2.5"><FiDownload /> تحميل الملف</a>
            </div>
          )}
        </div>
      )}
    </>
  );
}
