import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { localStore } from '@/api/localStoreClient';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/AuthContext';
import ArtifactForm from '@/components/manage/ArtifactForm';
import LinkManager from '@/components/manage/LinkManager';
import { ArrowLeft, Pencil, Trash2, Loader2 } from 'lucide-react';

export default function Manage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [tab, setTab] = useState('artifacts');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    try {
      const data = await localStore.entities.PortfolioItem.list('-created_date', 200);
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    await localStore.entities.PortfolioItem.delete(id);
    toast({ title: 'Удалено' });
    load();
  };

  if (user?.role !== 'admin') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
        <p className="pi-display text-3xl">ДОСТУП ОГРАНИЧЕН</p>
        <Link to="/" className="pi-mono-label border border-[color:var(--pi-ink)] px-5 py-2">// на сайт</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <header className="flex items-center justify-between border-b border-[color:var(--pi-ink)] px-5 py-4 md:px-10">
        <Link to="/" className="inline-flex items-center gap-2 border border-[color:var(--pi-ink)] px-4 py-2 transition-transform hover:translate-x-0.5">
          <ArrowLeft className="h-4 w-4" />
          <span className="pi-mono-label">на сайт</span>
        </Link>
        <span className="pi-display text-xl">DISPATCH CONSOLE</span>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10 md:px-10">
        <div className="mb-8 flex gap-2 border-b border-[color:var(--pi-ink)] pb-3">
          {[
            { key: 'artifacts', label: 'Артефакты' },
            { key: 'links', label: 'Ссылки на ресурсы' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pi-mono-label border border-[color:var(--pi-ink)] px-4 py-2 transition-colors ${
                tab === t.key ? 'bg-[color:var(--pi-ink)] text-[color:var(--pi-bg)]' : 'hover:bg-[color:var(--pi-ink)]/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'artifacts' ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
            <div className="lg:sticky lg:top-6 lg:self-start">
              <ArtifactForm
                key={editing?.id ?? 'new'}
                editing={editing}
                onSaved={() => {
                  setEditing(null);
                  load();
                }}
                onCancel={() => setEditing(null)}
              />
            </div>
            <div>
              {loading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-5 w-5 animate-spin text-[color:var(--pi-ghost)]" />
                </div>
              ) : items.length === 0 ? (
                <div className="border border-dashed border-[color:var(--pi-ghost)] py-16 text-center">
                  <span className="pi-mono-label text-[color:var(--pi-ghost)]">реестр пуст</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((it) => (
                    <div
                      key={it.id}
                      className="flex items-center justify-between gap-3 border border-[color:var(--pi-ink)] px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="pi-mono-label border border-[color:var(--pi-ink)] px-2 py-1">
                          {it.media_type}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-display font-bold">{it.title}</p>
                          {it.category && (
                            <p className="pi-mono-label text-[color:var(--pi-ghost)]">{it.category}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Link
                          to={`/artifact/${it.id}`}
                          className="border border-[color:var(--pi-ink)] px-2 py-1.5 pi-mono-label"
                        >
                          открыть
                        </Link>
                        <button
                          onClick={() => setEditing(it)}
                          className="border border-[color:var(--pi-ink)] px-2 py-1.5"
                          aria-label="Редактировать"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => remove(it.id)}
                          className="border border-[color:var(--pi-ink)] px-2 py-1.5"
                          aria-label="Удалить"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <LinkManager />
        )}
      </div>
    </main>
  );
}