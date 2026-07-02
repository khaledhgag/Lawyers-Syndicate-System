export default function SectionHeader({ title, subtitle, center = true }) {
  return (
    <div className={`mb-8 ${center ? 'text-center' : ''}`}>
      <h2 className="section-title">
        {title}
        <span className="mt-2 block h-1 w-16 rounded bg-gold-500 mx-auto" />
      </h2>
      {subtitle && <p className="mt-3 text-slate-500 max-w-2xl mx-auto">{subtitle}</p>}
    </div>
  );
}
