import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiUpload, FiSearch, FiClock } from 'react-icons/fi';
import SEO from '../components/ui/SEO.jsx';
import PageHero from '../components/layout/PageHero.jsx';
import { complaintsApi } from '../api/services.js';
import { formatDateTime } from '../utils/format.js';

const REQUEST_TYPES = ['مقترح', 'شكوى', 'استفسار', 'طلب تطوير خدمة'];

const STATUS_COLORS = {
  جديد: 'bg-blue-100 text-blue-700',
  'جاري المراجعة': 'bg-amber-100 text-amber-700',
  'تم الرد': 'bg-green-100 text-green-700',
  مغلق: 'bg-slate-200 text-slate-600',
};

const initial = {
  requestType: 'استفسار',
  fullName: '',
  membershipNumber: '',
  center: '',
  phone: '',
  subject: '',
  details: '',
  wantsContact: 'لا',
  agreed: false,
};

export default function Complaints() {
  const [mode, setMode] = useState('new'); // 'new' | 'track'
  const [form, setForm] = useState(initial);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [ticket, setTicket] = useState('');

  // Tracking state
  const [trackInput, setTrackInput] = useState('');
  const [tracking, setTracking] = useState(false);
  const [trackResult, setTrackResult] = useState(null);
  const [trackError, setTrackError] = useState('');

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.agreed) return toast.error('يجب الموافقة على الشروط قبل الإرسال');
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'wantsContact') fd.append(k, v === 'نعم');
        else fd.append(k, v);
      });
      if (file) fd.append('attachment', file);
      const res = await complaintsApi.create(fd, true);
      setTicket(res?.data?.ticketNumber || '');
      setDone(true);
      setForm(initial);
      setFile(null);
      toast.success('تم إرسال طلبك بنجاح');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'تعذر إرسال الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  const doTrack = async (e) => {
    e.preventDefault();
    if (!trackInput.trim()) return;
    setTracking(true);
    setTrackError('');
    setTrackResult(null);
    try {
      const r = await complaintsApi.track(trackInput.trim());
      setTrackResult(r.data);
    } catch (err) {
      setTrackError(err?.response?.data?.message || 'لا يوجد طلب بهذا الرقم المرجعي');
    } finally {
      setTracking(false);
    }
  };

  return (
    <>
      <SEO title="الاستعلامات والشكاوى" />
      <PageHero title="الاستعلامات والشكاوى" subtitle="نسعد بتلقي مقترحاتكم وشكاواكم واستفساراتكم" />
      <div className="container-page py-12">
        {done ? (
          <div className="card mx-auto max-w-xl p-10 text-center">
            <FiCheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <h2 className="text-2xl font-bold text-slate-900">تم استلام طلبك بنجاح</h2>
            <p className="mt-3 text-slate-600">احتفظ بالرقم المرجعي التالي لمتابعة حالة طلبك:</p>
            {ticket && (
              <div className="mx-auto mt-4 w-fit rounded-xl border-2 border-dashed border-primary-300 bg-primary-50 px-6 py-3 text-2xl font-extrabold tracking-widest text-primary-800" dir="ltr">
                {ticket}
              </div>
            )}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button onClick={() => setDone(false)} className="btn-outline px-6 py-2.5">إرسال طلب آخر</button>
              {ticket && (
                <button
                  onClick={() => { setMode('track'); setTrackInput(ticket); setTrackResult(null); setTrackError(''); setDone(false); }}
                  className="btn-primary px-6 py-2.5"
                >
                  تتبّع هذا الطلب
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Mode switch */}
            <div className="mb-8 flex justify-center gap-2">
              <button
                onClick={() => setMode('new')}
                className={`rounded-full px-6 py-2.5 text-sm font-semibold transition ${mode === 'new' ? 'bg-primary-700 text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
              >
                تقديم طلب
              </button>
              <button
                onClick={() => setMode('track')}
                className={`rounded-full px-6 py-2.5 text-sm font-semibold transition ${mode === 'track' ? 'bg-primary-700 text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
              >
                تتبّع طلب سابق
              </button>
            </div>

            {mode === 'track' ? (
              <div className="mx-auto max-w-xl">
                <form onSubmit={doTrack} className="card p-6">
                  <label className="label">أدخل الرقم المرجعي لطلبك</label>
                  <div className="flex gap-2">
                    <input
                      className="input flex-1"
                      dir="ltr"
                      placeholder="SQ-2026-00042"
                      value={trackInput}
                      onChange={(e) => setTrackInput(e.target.value)}
                    />
                    <button disabled={tracking} className="btn-primary px-5">
                      <FiSearch /> {tracking ? '...' : 'بحث'}
                    </button>
                  </div>
                  {trackError && <p className="mt-3 text-sm text-red-600">{trackError}</p>}
                </form>

                {trackResult && (
                  <div className="card mt-5 p-6">
                    <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <p className="text-xs text-slate-400">الرقم المرجعي</p>
                        <p className="font-bold text-primary-800" dir="ltr">{trackResult.ticketNumber}</p>
                      </div>
                      <span className={`badge ${STATUS_COLORS[trackResult.status] || 'bg-slate-100 text-slate-600'}`}>
                        {trackResult.status}
                      </span>
                    </div>
                    <dl className="space-y-3 text-sm">
                      <div className="flex justify-between"><dt className="text-slate-500">نوع الطلب</dt><dd className="font-semibold text-slate-800">{trackResult.requestType}</dd></div>
                      <div className="flex justify-between"><dt className="text-slate-500">العنوان</dt><dd className="font-semibold text-slate-800">{trackResult.subject}</dd></div>
                      <div className="flex justify-between"><dt className="text-slate-500">مقدّم الطلب</dt><dd className="font-semibold text-slate-800">{trackResult.fullName}</dd></div>
                      <div className="flex items-center justify-between"><dt className="flex items-center gap-1 text-slate-500"><FiClock /> تاريخ التقديم</dt><dd className="text-slate-600">{formatDateTime(trackResult.createdAt)}</dd></div>
                    </dl>
                    {trackResult.adminNotes && (
                      <div className="mt-4 rounded-lg bg-green-50 p-4">
                        <p className="mb-1 text-xs font-bold text-green-700">رد الإدارة</p>
                        <p className="whitespace-pre-line text-sm leading-7 text-slate-700">{trackResult.adminNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
          <form onSubmit={submit} className="card mx-auto max-w-3xl p-6 sm:p-8">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="label">نوع الطلب *</label>
                <div className="flex flex-wrap gap-2">
                  {REQUEST_TYPES.map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setForm((f) => ({ ...f, requestType: t }))}
                      className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                        form.requestType === t
                          ? 'border-primary-700 bg-primary-700 text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">الاسم رباعي *</label>
                <input className="input" required value={form.fullName} onChange={set('fullName')} />
              </div>
              <div>
                <label className="label">رقم القيد *</label>
                <input className="input" required value={form.membershipNumber} onChange={set('membershipNumber')} />
              </div>
              <div>
                <label className="label">الجزئية *</label>
                <input className="input" required value={form.center} onChange={set('center')} />
              </div>
              <div>
                <label className="label">رقم الهاتف *</label>
                <input className="input" required value={form.phone} onChange={set('phone')} inputMode="tel" />
              </div>
              <div className="md:col-span-2">
                <label className="label">عنوان الطلب *</label>
                <input className="input" required value={form.subject} onChange={set('subject')} />
              </div>
              <div className="md:col-span-2">
                <label className="label">تفاصيل الطلب *</label>
                <textarea className="input min-h-32" required value={form.details} onChange={set('details')} />
              </div>

              <div className="md:col-span-2">
                <label className="label">إرفاق ملف (اختياري)</label>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 hover:bg-slate-50">
                  <FiUpload />
                  <span>{file ? file.name : 'اختر ملفاً (صورة أو PDF)'}</span>
                  <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files[0])} />
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="label">هل ترغب في التواصل معك بعد دراسة الطلب؟</label>
                <div className="flex gap-4">
                  {['نعم', 'لا'].map((v) => (
                    <label key={v} className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="wantsContact"
                        checked={form.wantsContact === v}
                        onChange={() => setForm((f) => ({ ...f, wantsContact: v }))}
                      />
                      {v}
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-start gap-2 text-sm text-slate-600">
                  <input type="checkbox" className="mt-1" checked={form.agreed} onChange={set('agreed')} />
                  أقر بأن البيانات المدخلة صحيحة وأوافق على معالجتها من قبل النقابة لدراسة الطلب.
                </label>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full py-3">
              {submitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
            </button>
          </form>
            )}
          </>
        )}
      </div>
    </>
  );
}
