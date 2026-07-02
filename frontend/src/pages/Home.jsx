import { Link } from 'react-router-dom';
import { FiMapPin, FiExternalLink, FiArrowLeft } from 'react-icons/fi';
import SEO from '../components/ui/SEO.jsx';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import Loader from '../components/ui/Loader.jsx';
import Hero from '../components/home/Hero.jsx';
import CourtsLocator from '../components/home/CourtsLocator.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { boardMembersApi, servicesApi } from '../api/services.js';
import { fileUrl } from '../api/axios.js';
import { resolveMapEmbed } from '../utils/map.js';
import useFetch from '../hooks/useFetch.js';
import { useCallback } from 'react';

export default function Home() {
  const { settings } = useSettings();
  const s = settings || {};
  const mapSrc = resolveMapEmbed(s);

  const fetchHome = useCallback(
    () => Promise.all([boardMembersApi.list(), servicesApi.list()]),
    []
  );
  const { data, loading } = useFetch(fetchHome);
  const members = data?.[0]?.data || [];
  const services = data?.[1]?.data || [];

  return (
    <>
      <SEO title="الرئيسية" />

      {/* Hero */}
      <Hero settings={s} />

      {/* About */}
      <section className="container-page py-16">
        <SectionHeader title={s.aboutTitle || 'عن النقابة'} />
        <div className="mx-auto max-w-3xl text-center text-lg leading-9 text-slate-600">
          {s.aboutText || 'نقابة محامين جنوب القليوبية تعمل على خدمة السادة المحامين بالنقابة الفرعية وتقديم كافة الخدمات.'}
        </div>
      </section>

      {/* Services preview */}
      {services.length > 0 && (
        <section className="bg-white py-16">
          <div className="container-page">
            <SectionHeader title="ما تقدمه النقابة الفرعية" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.slice(0, 3).map((srv) => (
                <div key={srv._id} className="card overflow-hidden">
                  {srv.image && <img src={fileUrl(srv.image)} alt={srv.title} className="h-44 w-full object-cover" />}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-primary-900">{srv.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm text-slate-600">{srv.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link to="/services" className="btn-primary px-6 py-2.5">
                عرض كل الخدمات <FiArrowLeft />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Board members */}
      <section className="container-page py-16">
        <SectionHeader title="مجلس النقابة" subtitle="أعضاء مجلس النقابة الفرعية" />
        {loading ? (
          <Loader />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {members.map((m) => (
              <div key={m._id} className="card p-6 text-center">
                <div className="mx-auto mb-4 h-28 w-28 overflow-hidden rounded-full bg-primary-50 ring-4 ring-primary-100">
                  {m.photo ? (
                    <img src={fileUrl(m.photo)} alt={m.fullName} className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-3xl text-primary-300">👤</span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{m.fullName}</h3>
                <p className="mt-1 text-sm font-semibold text-gold-600">{m.position}</p>
                {m.bio && <p className="mt-2 line-clamp-3 text-sm text-slate-500">{m.bio}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Location */}
      {(s.address || s.googleMapsEmbed || s.googleMapsLink) && (
        <section className="bg-white py-16">
          <div className="container-page">
            <SectionHeader title="موقع النقابة" />
            <div className="grid items-stretch gap-6 lg:grid-cols-2">
              <div className="card flex flex-col justify-center gap-4 p-8">
                {s.address && (
                  <p className="flex items-start gap-3 text-lg text-slate-700">
                    <FiMapPin className="mt-1 shrink-0 text-gold-500" /> {s.address}
                  </p>
                )}
                {s.googleMapsLink && (
                  <a href={s.googleMapsLink} target="_blank" rel="noopener noreferrer" className="btn-primary w-fit px-5 py-2.5">
                    افتح في خرائط جوجل <FiExternalLink />
                  </a>
                )}
              </div>
              <div className="card overflow-hidden">
                {mapSrc ? (
                  <iframe
                    title="map"
                    src={mapSrc}
                    className="h-72 w-full lg:h-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex h-72 items-center justify-center bg-slate-100 text-slate-400">
                    لم يتم إضافة الخريطة بعد
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Courts locator */}
      <CourtsLocator />
    </>
  );
}
