import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { FaBalanceScale } from 'react-icons/fa';
import { fileUrl } from '../../api/axios.js';

export default function Hero({ settings = {} }) {
  // Split the union name so the last two words get the gold shimmer
  const name = settings.unionName || 'نقابة محامين جنوب القليوبية';
  const words = name.trim().split(/\s+/);
  const lead = words.slice(0, -2).join(' ');
  const highlight = words.slice(-2).join(' ');

  return (
    <section className="relative overflow-hidden bg-[#081228] text-white">
      {/* Banner image */}
      {settings.banner && (
        <img src={fileUrl(settings.banner)} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}

      {/* Rich gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#081228]/95 via-[#0c1f45]/90 to-[#081228]/98" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(52,112,245,0.25),transparent_55%)]" />

      {/* Dotted pattern */}
      <div className="absolute inset-0 bg-dots opacity-60" />

      {/* Floating gold / blue glows */}
      <div className="animate-floaty pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-gold-500/20 blur-3xl" />
      <div className="animate-floaty2 pointer-events-none absolute right-0 top-1/3 h-80 w-80 rounded-full bg-primary-500/25 blur-3xl" />
      <div className="animate-floaty pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-gold-400/10 blur-3xl" />

      {/* Giant watermark scale */}
      <FaBalanceScale className="pointer-events-none absolute -bottom-10 left-4 text-[220px] text-white/[0.03] sm:text-[320px]" />

      {/* Content */}
      <div className="container-page relative flex flex-col items-center py-24 text-center sm:py-32">
        <span className="animate-hero mb-6 inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-500/10 px-5 py-2 text-sm font-semibold text-gold-300 shadow-[0_0_25px_rgba(212,175,55,0.15)] backdrop-blur">
          <FaBalanceScale className="h-4 w-4" /> البوابة الرسمية
        </span>

        <h1 className="animate-hero mx-auto max-w-4xl text-4xl font-extrabold leading-[1.2] text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.4)] sm:text-5xl lg:text-6xl" style={{ animationDelay: '0.1s' }}>
          {lead ? <>{lead} </> : null}
          <span className="text-shimmer">{highlight}</span>
        </h1>

        {/* decorative divider */}
        <div className="animate-hero mt-6 flex items-center gap-3" style={{ animationDelay: '0.2s' }}>
          <span className="h-px w-12 bg-gradient-to-l from-gold-500 to-transparent" />
          <FaBalanceScale className="h-4 w-4 text-gold-400" />
          <span className="h-px w-12 bg-gradient-to-r from-gold-500 to-transparent" />
        </div>

        <p className="animate-hero mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300" style={{ animationDelay: '0.3s' }}>
          {settings.aboutText
            ? settings.aboutText.slice(0, 155) + (settings.aboutText.length > 155 ? '…' : '')
            : 'منصة قانونية متكاملة تجمع خدمات النقابة، أحكام محكمة النقض، والندوات المهنية، في مكان واحد يخدم زملاءنا المحامين والمواطنين.'}
        </p>

        <div className="animate-hero mt-9 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: '0.4s' }}>
          <Link
            to="/services"
            className="btn-gold px-7 py-3 text-base shadow-[0_10px_30px_-8px_rgba(212,175,55,0.6)] transition hover:-translate-y-0.5"
          >
            تعرف على خدماتنا <FiArrowLeft />
          </Link>
          <Link
            to="/complaints"
            className="btn border border-white/20 bg-white/5 px-7 py-3 text-base text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/10"
          >
            تقديم شكوى أو استفسار
          </Link>
        </div>
      </div>

      {/* Curved bottom divider into the next section */}
      <svg className="relative block w-full text-slate-50" viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ height: 60 }}>
        <path fill="currentColor" d="M0,64 C360,0 1080,0 1440,64 L1440,80 L0,80 Z" />
      </svg>
    </section>
  );
}
