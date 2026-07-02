import { useState, useEffect, useCallback } from 'react';

// Generic data-fetching hook with loading/error states.
// fetcher must be a stable function (wrap in useCallback) returning a promise.
export default function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const run = useCallback(() => {
    setLoading(true);
    setError(null);
    fetcher()
      .then((res) => setData(res))
      .catch((e) => setError(e?.response?.data?.message || 'حدث خطأ أثناء جلب البيانات'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  return { data, loading, error, refetch: run };
}
