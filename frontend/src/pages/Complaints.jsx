import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiUpload } from 'react-icons/fi';
import SEO from '../components/ui/SEO.jsx';
import PageHero from '../components/layout/PageHero.jsx';
import { complaintsApi } from '../api/services.js';

const REQUEST_TYPES = ['مقترح', 'شكوى', 'استفسار', 'طلب تطوير خدمة'];

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
  const [form, setForm] = useState(initial);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

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
      await complaintsApi.create(fd, true);
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

  return (
    <>
      <SEO title="الاستعلامات والشكاوى" />
      <PageHero title="الاستعلامات والشكاوى" subtitle="نسعد بتلقي مقترحاتكم وشكاواكم واستفساراتكم" />
      <div className="container-page py-12">
        {done ? (
          <div className="card mx-auto max-w-xl p-10 text-center">
            <FiCheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <h2 className="text-2xl font-bold text-slate-900">تم استلام طلبك بنجاح</h2>
            <p className="mt-3 text-slate-600">سيتم مراجعة طلبك من قبل الإدارة والتواصل معك إذا لزم الأمر.</p>
            <button onClick={() => setDone(false)} className="btn-primary mt-6 px-6 py-2.5">
              إرسال طلب آخر
            </button>
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
                <label className="label">الجزئية / المركز *</label>
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
      </div>
    </>
  );
}
