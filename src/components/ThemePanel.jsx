import { useState } from 'react';
import { useTheme } from '@/lib/ThemeContext';
import { SlidersHorizontal, X, Save, Trash2, Check } from 'lucide-react';

export default function ThemePanel() {
  const { active, themes, preview, saveTheme, activateTheme, deleteTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  const sliders = [
    { key: 'grain_intensity', label: 'Зерно', min: 0, max: 100, value: active.grain_intensity },
    { key: 'refraction_strength', label: 'Рефракция', min: 0, max: 100, value: active.refraction_strength },
    { key: 'grid_skew', label: 'Перекос сетки', min: -20, max: 20, value: active.grid_skew },
    { key: 'primary_hue', label: 'Оттенок', min: 0, max: 360, value: active.primary_hue },
  ];

  const save = async () => {
    await saveTheme(name || `Скин ${themes.length + 1}`, active);
    setName('');
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="pi-glass pi-stamp fixed bottom-5 right-5 z-[75] flex items-center gap-2 px-3 py-2 transition-transform hover:translate-x-0.5 hover:translate-y-0.5"
        aria-label="Открыть панель тем"
      >
        <SlidersHorizontal className="h-4 w-4" />
        <span className="pi-mono-label">morph</span>
      </button>

      {open && (
        <aside className="pi-glass fixed bottom-20 right-5 z-[75] w-[min(90vw,22rem)] border border-[color:var(--pi-ink)] p-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-[color:var(--pi-ink)] pb-3">
            <span className="pi-mono-label">morph interface</span>
            <button onClick={() => setOpen(false)} aria-label="Закрыть">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {sliders.map((s) => (
              <div key={s.key}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="pi-mono-label">{s.label}</span>
                  <span className="font-mono text-xs">{s.value}</span>
                </div>
                <input
                  type="range"
                  className="pi-range"
                  min={s.min}
                  max={s.max}
                  value={s.value}
                  onChange={(e) => preview({ [s.key]: Number(e.target.value) })}
                />
              </div>
            ))}
          </div>

          <div className="mt-5 flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Имя скина"
              className="w-full border border-[color:var(--pi-ink)] bg-transparent px-3 py-2 font-mono text-sm outline-none placeholder:text-[color:var(--pi-ghost)]"
            />
            <button
              onClick={save}
              className="flex items-center gap-1 border border-[color:var(--pi-ink)] bg-[color:var(--pi-ink)] px-3 py-2 text-[color:var(--pi-bg)] transition-opacity hover:opacity-80"
            >
              <Save className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 border-t border-[color:var(--pi-ink)] pt-3">
            <span className="pi-mono-label mb-2 block">сохранённые скины</span>
            <div className="max-h-44 space-y-1 overflow-auto">
              {themes.length === 0 && (
                <p className="font-mono text-xs text-[color:var(--pi-ghost)]">пока нет сохранённых тем</p>
              )}
              {themes.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-2 py-1">
                  <span className="truncate font-mono text-xs">{t.name}</span>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => activateTheme(t.id)}
                      className={`p-1 ${t.is_active ? 'text-[color:var(--pi-ink)]' : 'text-[color:var(--pi-ghost)]'}`}
                      aria-label="Применить"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteTheme(t.id)}
                      className="p-1 text-[color:var(--pi-ghost)] hover:text-[color:var(--pi-ink)]"
                      aria-label="Удалить"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      )}
    </>
  );
}