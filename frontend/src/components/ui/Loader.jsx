export default function Loader({ label = 'جاري التحميل...', full = false }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${full ? 'min-h-[60vh]' : 'py-12'}`}>
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-700" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
