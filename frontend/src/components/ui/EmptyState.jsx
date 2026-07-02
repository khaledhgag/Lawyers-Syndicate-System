import { FiInbox } from 'react-icons/fi';

export default function EmptyState({ message = 'لا توجد بيانات لعرضها', icon: Icon = FiInbox }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
      <Icon className="h-12 w-12 text-slate-300" />
      <p className="text-slate-500">{message}</p>
    </div>
  );
}
