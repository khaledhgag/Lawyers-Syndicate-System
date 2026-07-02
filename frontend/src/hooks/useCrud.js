import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

// Manages list + create/update/delete state for an admin resource api.
// api must expose list/create/update/remove. listParams default to { all: true }.
export default function useCrud(api, listParams = { all: true }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .list(listParams)
      .then((r) => setItems(r.data))
      .catch((e) => setError(e?.response?.data?.message || 'حدث خطأ أثناء جلب البيانات'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // payload: object; if hasFiles, build FormData
  const buildForm = (payload) => {
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (Array.isArray(v)) v.forEach((item) => fd.append(k, item));
      else fd.append(k, v);
    });
    return fd;
  };

  const save = async (id, payload, hasFiles) => {
    setSaving(true);
    try {
      const body = hasFiles ? buildForm(payload) : payload;
      if (id) await api.update(id, body, hasFiles);
      else await api.create(body, hasFiles);
      toast.success(id ? 'تم التحديث بنجاح' : 'تمت الإضافة بنجاح');
      load();
      return true;
    } catch (e) {
      toast.error(e?.response?.data?.message || 'تعذر الحفظ');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    try {
      await api.remove(id);
      toast.success('تم الحذف بنجاح');
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'تعذر الحذف');
    }
  };

  return { items, loading, error, saving, load, save, remove };
}
