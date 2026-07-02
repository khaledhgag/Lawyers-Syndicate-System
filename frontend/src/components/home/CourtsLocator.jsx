import { useState, useMemo, useCallback } from 'react';
import { FiChevronDown, FiMapPin, FiExternalLink, FiSearch } from 'react-icons/fi';
import { courtsApi } from '../../api/services.js';
import useFetch from '../../hooks/useFetch.js';

export default function CourtsLocator() {
  const fetcher = useCallback(() => courtsApi.list(), []);
  const { data } = useFetch(fetcher);
  const courts = data?.data || [];

  const [degree, setDegree] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [courtId, setCourtId] = useState('');
  const [displayed, setDisplayed] = useState(null);

  // Cascading options derived from the full list
  const degrees = useMemo(() => [...new Set(courts.map((c) => c.degree))].sort(), [courts]);
  const governorates = useMemo(
    () => [...new Set(courts.filter((c) => !degree || c.degree === degree).map((c) => c.governorate))].sort(),
    [courts, degree]
  );
  const courtOptions = useMemo(
    () =>
      courts.filter(
        (c) => (!degree || c.degree === degree) && (!governorate || c.governorate === governorate)
      ),
    [courts, degree, governorate]
  );

  const onShow = () => {
    const court = courts.find((c) => c._id === courtId) || courtOptions[0] || null;
    setDisplayed(court);
  };

  const Select = ({ label, value, onChange, children, disabled }) => (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-200">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full appearance-none rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-gold-500 disabled:opacity-50 [&>option]:text-slate-800"
        >
          {children}
        </select>
        <FiChevronDown className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
      </div>
    </div>
  );

  return (
    <section className="bg-slate-50 py-16">
      <div className="container-page">
        <div className="grid items-stretch gap-0 overflow-hidden rounded-3xl shadow-card lg:grid-cols-3">
          {/* Search panel (appears on the right in RTL) */}
          <div className="flex flex-col bg-[#0a1730] p-6 sm:p-8">
            <div className="mb-5 border-b border-white/10 pb-4">
              <h2 className="text-2xl font-extrabold text-white">موقع المحاكم</h2>
              <p className="mt-1 text-sm text-slate-300">ابحث عن المحكمة لعرض موقعها على الخريطة</p>
            </div>

            <div className="space-y-4">
              <Select
                label="الدرجة"
                value={degree}
                onChange={(e) => { setDegree(e.target.value); setGovernorate(''); setCourtId(''); }}
              >
                <option value="">اختر الدرجة</option>
                {degrees.map((d) => <option key={d} value={d}>{d}</option>)}
              </Select>

              <Select
                label="المحافظة"
                value={governorate}
                onChange={(e) => { setGovernorate(e.target.value); setCourtId(''); }}
              >
                <option value="">اختر المحافظة</option>
                {governorates.map((g) => <option key={g} value={g}>{g}</option>)}
              </Select>

              <Select
                label="المحكمة"
                value={courtId}
                onChange={(e) => setCourtId(e.target.value)}
                disabled={courtOptions.length === 0}
              >
                <option value="">اختر المحكمة</option>
                {courtOptions.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </Select>
            </div>

            <button onClick={onShow} className="btn-gold mt-6 w-full py-3 text-base">
              <FiSearch /> عرض
            </button>
          </div>

          {/* Map (left in RTL, spans 2 cols) */}
          <div className="relative min-h-[420px] bg-slate-200 lg:col-span-2">
            {displayed?.mapEmbed ? (
              <iframe
                key={displayed._id}
                title={displayed.name}
                src={displayed.mapEmbed}
                className="h-full w-full"
                style={{ minHeight: 420 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full min-h-[420px] flex-col items-center justify-center gap-3 text-slate-500">
                <FiMapPin className="h-12 w-12 text-slate-300" />
                <p>اختر المحكمة ثم اضغط «عرض» لإظهار الموقع على الخريطة</p>
              </div>
            )}

            {displayed && (
              <div className="absolute bottom-4 right-4 left-4 rounded-xl bg-white/95 p-4 shadow-lg backdrop-blur sm:left-auto sm:max-w-sm">
                <h3 className="font-bold text-primary-900">{displayed.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{displayed.degree} - {displayed.governorate}</p>
                {displayed.address && (
                  <p className="mt-1 flex items-start gap-1 text-sm text-slate-600">
                    <FiMapPin className="mt-0.5 shrink-0 text-gold-500" /> {displayed.address}
                  </p>
                )}
                {displayed.mapLink && (
                  <a href={displayed.mapLink} target="_blank" rel="noopener noreferrer" className="btn-primary mt-3 w-full py-2 text-sm">
                    افتح في خرائط جوجل <FiExternalLink />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
