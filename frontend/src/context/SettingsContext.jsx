import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { settingsApi } from '../api/services.js';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await settingsApi.get();
      setSettings(res.data);
    } catch {
      /* ignore - site still renders */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <SettingsContext.Provider value={{ settings, loading, refresh }}>{children}</SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
