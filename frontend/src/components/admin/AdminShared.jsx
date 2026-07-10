import { FiPlus, FiUpload, FiX } from 'react-icons/fi';
import { fileUrl } from '../../api/axios.js';

export function AdminHeader({ title, count, onAdd, addLabel = 'إضافة جديد', children }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold text-slate-900">
        {title}
        {count != null && <span className="mr-2 text-base font-normal text-slate-400">({count})</span>}
      </h1>
      <div className="flex items-center gap-2">
        {children}
        {onAdd && (
          <button onClick={onAdd} className="btn-primary px-4 py-2">
            <FiPlus /> {addLabel}
          </button>
        )}
      </div>
    </div>
  );
}

// Single image picker with preview. value can be an existing url or a File.
// Removing calls onChange('') so forms can send an explicit "clear" signal.
export function ImageInput({ label = 'الصورة', value, onChange, accept = 'image/*' }) {
  const preview = value instanceof File ? URL.createObjectURL(value) : value ? fileUrl(value) : '';
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-center gap-3">
        <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <FiUpload className="text-slate-300" />}
          {preview && (
            <button
              type="button"
              onClick={() => onChange('')}
              title="حذف الصورة"
              className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700"
            >
              <FiX className="h-3 w-3" />
            </button>
          )}
        </div>
        <label className="btn-outline cursor-pointer">
          {preview ? 'تغيير الصورة' : 'اختر صورة'}
          <input type="file" accept={accept} className="hidden" onChange={(e) => e.target.files[0] && onChange(e.target.files[0])} />
        </label>
      </div>
    </div>
  );
}

// File (pdf) picker showing chosen name / existing
export function FileInput({ label, value, onChange, accept = 'application/pdf' }) {
  const name = value instanceof File ? value.name : value ? 'ملف حالي مرفوع' : '';
  return (
    <div>
      <label className="label">{label}</label>
      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-2.5 text-sm text-slate-500 hover:bg-slate-50">
        <FiUpload />
        <span className="truncate">{name || 'اختر ملف'}</span>
        <input type="file" accept={accept} className="hidden" onChange={(e) => onChange(e.target.files[0])} />
      </label>
    </div>
  );
}

export const STATUS_COLORS = {
  جديد: 'bg-blue-100 text-blue-700',
  'جاري المراجعة': 'bg-amber-100 text-amber-700',
  'تم الرد': 'bg-green-100 text-green-700',
  مغلق: 'bg-slate-200 text-slate-600',
};
