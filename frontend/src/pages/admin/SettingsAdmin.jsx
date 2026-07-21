import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { settingsApi } from '../../api/services.js';
import { useSettings } from '../../context/SettingsContext.jsx';
import Loader from '../../components/ui/Loader.jsx';
import { ImageInput } from '../../components/admin/AdminShared.jsx';

const SOCIAL_FIELDS = [
  { key: 'facebook', label: 'Facebook' },
  { key: 'twitter', label: 'X / Twitter' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'telegram', label: 'Telegram' },
];

export default function SettingsAdmin() {
  const { refresh } = useSettings();
  const [form, setForm] = useState(null);
  const [logo, setLogo] = useState(null);
  const [banner, setBanner] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsApi.get().then((r) => setForm(r.data)).catch(() => toast.error('تعذر جلب الإعدادات'));
  }, []);

  if (!form) return <Loader full />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setSocial = (k) => (e) => setForm({ ...form, social: { ...form.social, [k]: e.target.value } });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      ['unionName', 'aboutTitle', 'aboutText', 'address', 'googleMapsLink', 'googleMapsEmbed', 'phone', 'email', 'workingHours', 'whatsappNumber', 'whatsappMessage'].forEach((k) => fd.append(k, form[k] || ''));
      Object.entries(form.social || {}).forEach(([k, v]) => fd.append(`social.${k}`, v || ''));
      if (logo instanceof File) fd.append('logo', logo);
      else if (logo === '') fd.append('logo', '');
      if (banner instanceof File) fd.append('banner', banner);
      else if (banner === '') fd.append('banner', '');
      await settingsApi.update(fd);
      toast.success('تم حفظ الإعدادات');
      const updated = await settingsApi.get();
      setForm(updated.data);
      setLogo(null);
      setBanner(null);
      refresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'تعذر الحفظ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">إعدادات الموقع</h1>
      <form onSubmit={submit} className="space-y-6">
        <div className="card p-5">
          <h2 className="mb-4 font-bold text-slate-800">معلومات عامة</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <ImageInput label="شعار النقابة" value={logo !== null ? logo : form.logo} onChange={setLogo} />
            <ImageInput label="صورة البانر الرئيسية" value={banner !== null ? banner : form.banner} onChange={setBanner} />
            <div className="md:col-span-2"><label className="label">اسم النقابة</label><input className="input" value={form.unionName} onChange={set('unionName')} /></div>
            <div><label className="label">عنوان قسم "عن النقابة"</label><input className="input" value={form.aboutTitle} onChange={set('aboutTitle')} /></div>
            <div className="md:col-span-2"><label className="label">نص "عن النقابة"</label><textarea className="input min-h-28" value={form.aboutText} onChange={set('aboutText')} /></div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 font-bold text-slate-800">بيانات التواصل والموقع</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div><label className="label">العنوان</label><input className="input" value={form.address} onChange={set('address')} /></div>
            <div><label className="label">رقم الهاتف</label><input className="input" value={form.phone} onChange={set('phone')} /></div>
            <div><label className="label">البريد الإلكتروني</label><input className="input" value={form.email} onChange={set('email')} /></div>
            <div><label className="label">مواعيد العمل</label><input className="input" value={form.workingHours} onChange={set('workingHours')} /></div>
            <div><label className="label">رابط خرائط جوجل</label><input className="input" placeholder="https://maps.google.com/..." value={form.googleMapsLink} onChange={set('googleMapsLink')} /></div>
            <div><label className="label">رابط تضمين الخريطة (Embed src)</label><input className="input" placeholder="https://www.google.com/maps/embed?..." value={form.googleMapsEmbed} onChange={set('googleMapsEmbed')} /></div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-1 font-bold text-slate-800">زر واتساب العائم</h2>
          <p className="mb-4 text-xs text-slate-500">يظهر زر واتساب أخضر ثابت أسفل يسار الموقع. عند الضغط عليه تُفتح محادثة برسالة جاهزة تُعرّفك أن الزائر جاء من الموقع.</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">رقم واتساب (بصيغة دولية)</label>
              <input dir="ltr" className="input text-left" placeholder="201001234567" value={form.whatsappNumber || ''} onChange={set('whatsappNumber')} />
              <p className="mt-1 text-xs text-slate-400">مثال: 201001234567 (كود مصر 20 بدون + أو صفر). اتركه فارغاً لإخفاء الزر.</p>
            </div>
            <div>
              <label className="label">الرسالة الجاهزة</label>
              <textarea className="input min-h-20" value={form.whatsappMessage || ''} onChange={set('whatsappMessage')} placeholder="السلام عليكم، تواصلت معكم من خلال الموقع الإلكتروني..." />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 font-bold text-slate-800">روابط التواصل الاجتماعي</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {SOCIAL_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input
                  className="input"
                  dir="ltr"
                  placeholder={key === 'twitter' ? 'https://x.com/...' : key === 'telegram' ? 'https://t.me/...' : 'https://...'}
                  value={form.social?.[key] || ''}
                  onChange={setSocial(key)}
                />
              </div>
            ))}
          </div>
        </div>

        <button disabled={saving} className="btn-primary px-8 py-3">{saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}</button>
      </form>
    </div>
  );
}
