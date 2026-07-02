export default function PageHero({ title, subtitle }) {
  return (
    <div className="bg-gradient-to-l from-primary-900 to-primary-700 py-12 text-center text-white">
      <div className="container-page">
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">{title}</h1>
        {subtitle && <p className="mx-auto mt-3 max-w-2xl text-primary-100">{subtitle}</p>}
        <span className="mx-auto mt-4 block h-1 w-20 rounded bg-gold-500" />
      </div>
    </div>
  );
}
