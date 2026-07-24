import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { localStore } from '@/api/localStoreClient';
import { Image } from '@/components/ui/image';
import { safeUrl } from '@/lib/media';
import { ArrowLeft, ExternalLink, Loader2, Music } from 'lucide-react';

export default function ArtifactDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await localStore.entities.PortfolioItem.get(id);
        setItem(data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[color:var(--pi-ghost)]" />
      </div>
    );
  }

  if (notFound || !item) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="pi-mono-label text-[color:var(--pi-ghost)]">артефакт не найден</p>
        <Link to="/" className="pi-stamp border border-[color:var(--pi-ink)] px-5 py-2">
          <span className="pi-mono-label">← в реестр</span>
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="border-b border-[color:var(--pi-ink)] px-5 py-4 md:px-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 border border-[color:var(--pi-ink)] px-4 py-2 transition-transform hover:translate-x-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pi-ink)]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="pi-mono-label">в реестр</span>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2">
        {/* media */}
        <div className="sticky top-0 flex min-h-[50vh] items-center justify-center border-b border-[color:var(--pi-ink)] bg-[color:var(--pi-ink)] p-6 lg:min-h-screen lg:border-b-0 lg:border-r">
          {item.media_type === 'image' && item.media_url && (
            <div className="h-[70vh] w-full">
              <Image src={safeUrl(item.media_url)} className="h-full w-full object-contain" fittingType="fit" alt={item.title} />
            </div>
          )}
          {item.media_type === 'video' && item.media_url && (
            <video src={item.media_url} controls className="max-h-[80vh] w-full" />
          )}
          {item.media_type === 'audio' && (
            <div className="w-full max-w-md text-[color:var(--pi-bg)]">
              <Music className="mx-auto mb-6 h-12 w-12" />
              <audio src={item.media_url} controls className="w-full" />
            </div>
          )}
          {item.media_type === 'text' && (
            <div className="max-h-[80vh] w-full max-w-md overflow-auto whitespace-pre-wrap font-mono text-sm text-[color:var(--pi-bg)]">
              {item.text_content}
            </div>
          )}
          {!item.media_url && item.media_type !== 'text' && (
            <p className="pi-mono-label text-[color:var(--pi-bg)]/50">медиа отсутствует</p>
          )}
        </div>

        {/* manifest */}
        <div className="px-5 py-12 md:px-10 md:py-16">
          <div className="flex items-center gap-3">
            <span className="pi-mono-label border border-[color:var(--pi-ink)] px-2 py-1">
              {item.media_type}
            </span>
            {item.category && (
              <span className="pi-mono-label text-[color:var(--pi-ghost)]">{item.category}</span>
            )}
          </div>

          <h1 className="pi-display mt-6 text-[clamp(2.4rem,6vw,5rem)]">{item.title}</h1>

          {item.description && (
            <p className="mt-6 max-w-xl font-mono text-sm leading-relaxed text-[color:var(--pi-ink)]/80">
              {item.description}
            </p>
          )}

          {item.text_content && item.media_type !== 'text' && (
            <div className="mt-8 border-t border-[color:var(--pi-ink)] pt-6">
              <span className="pi-mono-label text-[color:var(--pi-ghost)]">/ текст</span>
              <div className="mt-3 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                {item.text_content}
              </div>
            </div>
          )}

          {item.external_links?.length > 0 && (
            <div className="mt-10 border-t border-[color:var(--pi-ink)] pt-6">
              <span className="pi-mono-label text-[color:var(--pi-ghost)]">/ внешние координаты</span>
              <div className="mt-4 space-y-3">
                {item.external_links.map((l, i) => (
                  <a
                    key={i}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between border border-[color:var(--pi-ink)] px-4 py-3 transition-transform hover:translate-x-1"
                  >
                    <span className="pi-mono-label">{l.label || l.url}</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <p className="pi-mono-label mt-12 text-[color:var(--pi-ghost)]">
            занесено в реестр ·{' '}
            {item.created_date ? new Date(item.created_date).toLocaleDateString('ru-RU') : '—'}
          </p>
        </div>
      </div>
    </main>
  );
}