import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { localStore } from '@/api/localStoreClient';
import { ExternalLink, ArrowUpRight } from 'lucide-react';
import EditableText from '@/components/EditableText';
import { useAuth } from '@/lib/AuthContext';

export default function ResourceCoordinates() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [links, setLinks] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await localStore.entities.ResourceLink.list('-created_date', 100);
        setLinks(data);
      } catch {
        setLinks([]);
      }
    })();
    const unsub = localStore.entities.ResourceLink.subscribe(() => {
      localStore.entities.ResourceLink.list('-created_date', 100).then(setLinks).catch(() => {});
    });
    return unsub;
  }, []);

  return (
    <footer id="coordinates" className="bg-[color:var(--pi-ink)] text-[color:var(--pi-bg)]">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-10 md:py-28">
        <div className="mb-10 border-b border-[color:var(--pi-bg)]/30 pb-5">
          <span className="pi-mono-label text-[color:var(--pi-bg)]/60">/ внешние координаты</span>
          <EditableText
            id="coords.heading"
            defaultValue={'RESOURCE\nLINKS'}
            as="h2"
            className="pi-display mt-2 whitespace-pre-line text-[clamp(2rem,6vw,4.5rem)]"
          />
        </div>

        {links.length === 0 ? (
          <p className="font-mono text-sm text-[color:var(--pi-bg)]/50">
            координаты не заданы — добавьте ссылки через диспетчерскую.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((l) => (
              <a
                key={l.id}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group border border-[color:var(--pi-bg)]/40 p-5 transition-colors hover:bg-[color:var(--pi-bg)] hover:text-[color:var(--pi-ink)]"
              >
                <div className="flex items-start justify-between">
                  <span className="pi-mono-label">{l.label}</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
                {l.description && (
                  <p className="mt-3 font-mono text-xs opacity-70">{l.description}</p>
                )}
                <p className="mt-4 flex items-center gap-1 font-mono text-xs opacity-60">
                  <ExternalLink className="h-3 w-3" />
                  {l.url.replace(/^https?:\/\//, '').slice(0, 40)}
                </p>
              </a>
            ))}
          </div>
        )}

        <div className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-[color:var(--pi-bg)]/30 pt-8 sm:flex-row sm:items-center">
          <div>
            <p className="pi-display text-2xl">PETRUCHO INC.</p>
            <p className="pi-mono-label mt-1 text-[color:var(--pi-bg)]/50">
              <EditableText id="footer.tagline" defaultValue="абзационный диспетчинг" as="span" /> · {new Date().getFullYear()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/staff"
              className="pi-stamp border border-[color:var(--pi-bg)] px-5 py-2 text-[color:var(--pi-bg)] transition-transform hover:translate-x-0.5 hover:translate-y-0.5"
            >
              <span className="pi-mono-label">// сотрудники</span>
            </Link>
            {isAdmin && (
              <Link
                to="/manage"
                className="pi-stamp border border-[color:var(--pi-bg)] px-5 py-2 text-[color:var(--pi-bg)] transition-transform hover:translate-x-0.5 hover:translate-y-0.5"
              >
                <span className="pi-mono-label">// диспетчерская</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}