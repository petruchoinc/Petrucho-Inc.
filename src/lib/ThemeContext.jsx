import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { localStore } from '@/api/localStoreClient';

const ThemeContext = createContext(null);

const DEFAULT = {
  grain_intensity: 40,
  refraction_strength: 30,
  grid_skew: 0,
  primary_hue: 0,
};

export function applyThemeVars(t) {
  const vars = { ...DEFAULT, ...t };
  const root = document.documentElement;
  root.style.setProperty('--pi-grain', String(vars.grain_intensity / 100));
  root.style.setProperty('--pi-refract', `${Math.round(vars.refraction_strength / 6)}px`);
  root.style.setProperty('--pi-skew', `${vars.grid_skew}deg`);
  root.style.setProperty('--pi-hue', `${vars.primary_hue}deg`);
}

export function ThemeProvider({ children }) {
  const [active, setActive] = useState(DEFAULT);
  const [themes, setThemes] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const apply = useCallback((t) => {
    applyThemeVars(t);
    setActive({ ...DEFAULT, ...t });
  }, []);

  const refresh = useCallback(async () => {
    try {
      const list = await localStore.entities.Theme.list('-created_date', 50);
      setThemes(list);
      const activeT = list.find((t) => t.is_active);
      apply(activeT || DEFAULT);
    } catch {
      apply(DEFAULT);
    } finally {
      setLoaded(true);
    }
  }, [apply]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const preview = useCallback(
    (partial) => apply({ ...active, ...partial }),
    [active, apply]
  );

  const saveTheme = useCallback(
    async (name, vars) => {
      await localStore.entities.Theme.updateMany({}, { $set: { is_active: false } });
      const created = await localStore.entities.Theme.create({ ...vars, name, is_active: true });
      await refresh();
      return created;
    },
    [refresh]
  );

  const activateTheme = useCallback(
    async (id) => {
      await localStore.entities.Theme.updateMany({}, { $set: { is_active: false } });
      await localStore.entities.Theme.update(id, { is_active: true });
      await refresh();
    },
    [refresh]
  );

  const deleteTheme = useCallback(
    async (id) => {
      await localStore.entities.Theme.delete(id);
      await refresh();
    },
    [refresh]
  );

  return (
    <ThemeContext.Provider
      value={{ active, themes, loaded, preview, saveTheme, activateTheme, deleteTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}