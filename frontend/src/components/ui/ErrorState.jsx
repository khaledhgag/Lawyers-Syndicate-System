import { FiAlertTriangle } from 'react-icons/fi';

export default function ErrorState({ message = 'حدث خطأ أثناء جلب البيانات', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-100 bg-red-50 py-12 text-center">
      <FiAlertTriangle className="h-10 w-10 text-red-400" />
      <p className="text-red-600">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-outline">
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}
