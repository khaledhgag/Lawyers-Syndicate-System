import { FiChevronRight, FiChevronLeft } from 'react-icons/fi';

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  // window of pages around current
  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  const Btn = ({ children, disabled, active, onClick }) => (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm transition ${
        active
          ? 'border-primary-700 bg-primary-700 text-white'
          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {/* RTL: "previous" points right */}
      <Btn disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <FiChevronRight />
      </Btn>
      {start > 1 && (
        <>
          <Btn onClick={() => onChange(1)}>1</Btn>
          {start > 2 && <span className="px-1 text-slate-400">…</span>}
        </>
      )}
      {pages.map((p) => (
        <Btn key={p} active={p === page} onClick={() => onChange(p)}>
          {p}
        </Btn>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-slate-400">…</span>}
          <Btn onClick={() => onChange(totalPages)}>{totalPages}</Btn>
        </>
      )}
      <Btn disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        <FiChevronLeft />
      </Btn>
    </div>
  );
}
