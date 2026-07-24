import { useEffect, useState } from 'react';
import { localStore } from '@/api/localStoreClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Trash2, Plus } from 'lucide-react';

export default function LinkManager() {
  const { toast } = useToast();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ label: '', url: '', description: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const data = await localStore.entities.ResourceLink.list('-created_date', 100);
      setLinks(data);
    } catch {
      setLinks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!form.label || !form.url) {
      toast({ title: 'Заполните метку и ссылку', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await localStore.entities.ResourceLink.create(form);
      setForm({ label: '', url: '', description: '' });
      toast({ title: 'Ссылка добавлена' });
      load();
    } catch (err) {
      toast({ title: 'Ошибка', description: String(err), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    await localStore.entities.ResourceLink.delete(id);
    load();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
      <form onSubmit={add} className="space-y-4 border border-[color:var(--pi-ink)] p-5">
        <span className="pi-mono-label border-b border-[color:var(--pi-ink)] pb-3 block">
          новая координата
        </span>
        <div>
          <label className="pi-mono-label mb-1 block text-[color:var(--pi-ghost)]">метка *</label>
          <input
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            className="w-full border border-[color:var(--pi-ink)] bg-transparent px-3 py-2 font-mono text-sm outline-none"
          />
        </div>
        <div>
          <label className="pi-mono-label mb-1 block text-[color:var(--pi-ghost)]">ссылка *</label>
          <input
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://"
            className="w-full border border-[color:var(--pi-ink)] bg-transparent px-3 py-2 font-mono text-sm outline-none placeholder:text-[color:var(--pi-ghost)]"
          />
        </div>
        <div>
          <label className="pi-mono-label mb-1 block text-[color:var(--pi-ghost)]">описание</label>
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-[color:var(--pi-ink)] bg-transparent px-3 py-2 font-mono text-sm outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="pi-stamp flex w-full items-center justify-center gap-2 border border-[color:var(--pi-ink)] bg-[color:var(--pi-ink)] py-3 text-[color:var(--pi-bg)] transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          <span className="pi-mono-label">добавить</span>
        </button>
      </form>

      <div>
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-[color:var(--pi-ghost)]" />
          </div>
        ) : links.length === 0 ? (
          <div className="border border-dashed border-[color:var(--pi-ghost)] py-16 text-center">
            <span className="pi-mono-label text-[color:var(--pi-ghost)]">координат нет</span>
          </div>
        ) : (
          <div className="space-y-2">
            {links.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between gap-4 border border-[color:var(--pi-ink)] px-4 py-3"
              >
                <div className="min-w-0">
                  <span className="pi-mono-label">{l.label}</span>
                  {l.description && (
                    <p className="mt-1 truncate font-mono text-xs text-[color:var(--pi-ghost)]">
                      {l.description}
                    </p>
                  )}
                  <p className="truncate font-mono text-xs text-[color:var(--pi-ghost)]">{l.url}</p>
                </div>
                <button
                  onClick={() => remove(l.id)}
                  className="shrink-0 border border-[color:var(--pi-ink)] px-2 py-1.5"
                  aria-label="Удалить"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}