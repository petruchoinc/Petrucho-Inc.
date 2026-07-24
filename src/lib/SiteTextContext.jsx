import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { localStore } from '@/api/localStoreClient';

const SiteTextContext = createContext(null);

export function SiteTextProvider({ children }) {
  const [map, setMap] = useState({});
  const [editMode, setEditMode] = useState(false);

  const load = useCallback(async () => {
    try {
      const list = await localStore.entities.SiteText.list();
      const m = {};
      list.forEach((t) => {
        m[t.key] = t.value;
      });
      setMap(m);
    } catch {
      setMap({});
    }
  }, []);

  useEffect(() => {
    load();
    const unsub = localStore.entities.SiteText.subscribe(() => load());
    return unsub;
  }, [load]);

  const getText = useCallback(
    (key, def) => (map[key] !== undefined ? map[key] : def),
    [map]
  );

  const saveText = useCallback(async (key, value) => {
    setMap((m) => ({ ...m, [key]: value }));
    try {
      const existing = await localStore.entities.SiteText.filter({ key });
      if (existing.length > 0) {
        await localStore.entities.SiteText.update(existing[0].id, { value });
      } else {
        await localStore.entities.SiteText.create({ key, value });
      }
    } catch {
      /* noop */
    }
  }, []);

  return (
    <SiteTextContext.Provider value={{ getText, saveText, editMode, setEditMode, reload: load }}>
      {children}
    </SiteTextContext.Provider>
  );
}

export function useSiteText(key, def) {
  const ctx = useContext(SiteTextContext);
  if (!ctx) throw new Error('useSiteText must be used within SiteTextProvider');
  return {
    value: ctx.getText(key, def),
    save: (v) => ctx.saveText(key, v),
    editMode: ctx.editMode,
  };
}

export function useSiteTextStore() {
  const ctx = useContext(SiteTextContext);
  if (!ctx) throw new Error('useSiteTextStore must be used within SiteTextProvider');
  return { editMode: ctx.editMode, setEditMode: ctx.setEditMode, reload: ctx.reload };
}