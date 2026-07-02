import { FiMapPin, FiPhone, FiMail, FiClock, FiExternalLink } from 'react-icons/fi';
import SEO from '../components/ui/SEO.jsx';
import PageHero from '../components/layout/PageHero.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { resolveMapEmbed } from '../utils/map.js';

export default function Contact() {
  const { settings } = useSettings();
  const s = settings || {};
  const mapSrc = resolveMapEmbed(s);

  const items = [
    { Icon: FiMapPin, label: 'العنوان', value: s.address },
    { Icon: FiPhone, label: 'الهاتف', value: s.phone },
    { Icon: FiMail, label: 'البريد الإلكتروني', value: s.email },
    { Icon: FiClock, label: 'مواعيد العمل', value: s.workingHours },
  ].filter((i) => i.value);

  return (
    <>
      <SEO title="تواصل معنا" />
      <PageHero title="تواصل معنا" subtitle="بيانات التواصل مع النقابة الفرعية" />
      <div className="container-page py-12">
        <div className="grid items-stretch gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            {items.map(({ Icon, label, value }) => (
              <div key={label} className="card flex items-start gap-4 p-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-sm text-slate-400">{label}</p>
                  <p className="font-semibold text-slate-800">{value}</p>
                </div>
              </div>
            ))}
            {s.googleMapsLink && (
              <a href={s.googleMapsLink} target="_blank" rel="noopener noreferrer" className="btn-primary w-full py-3">
                افتح الموقع في خرائط جوجل <FiExternalLink />
              </a>
            )}
          </div>

          <div className="card min-h-[360px] overflow-hidden">
            {mapSrc ? (
              <iframe
                title="map"
                src={mapSrc}
                className="h-full min-h-[360px] w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full min-h-[360px] items-center justify-center bg-slate-100 text-slate-400">
                لم يتم إضافة الخريطة بعد
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
