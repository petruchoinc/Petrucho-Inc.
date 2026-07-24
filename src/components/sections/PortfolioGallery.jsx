import { useEffect, useState } from 'react';
import { localStore } from '@/api/localStoreClient';
import PortfolioCard from '../PortfolioCard';
import { Loader2 } from 'lucide-react';

const PAGE = 9;

export default function PortfolioGallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(PAGE);

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
    const unsub = localStore.entities.PortfolioItem.subscribe(() => load());
    return unsub;
  }, []);

  return (
    <section id="ledger" className="border-b border-[color:var(--pi-ink)]">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-10 md:py-28">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-[color:var(--pi-ink)] pb-5">
          <div>
            <span className="pi-mono-label text-[color:var(--pi-ghost)]">/ бесконечный реестр</span>
            <h2 className="pi-display mt-2 text-[clamp(2.2rem,6vw,5rem)]">
              INFINITE<br />LEDGER
            </h2>
          </div>
          <span className="pi-mono-label text-[color:var(--pi-ghost)]">
            {items.length} единиц груза
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-[color:var(--pi-ghost)]" />
          </div>
        ) : items.length === 0 ? (
          <div className="border border-dashed border-[color:var(--pi-ghost)] py-24 text-center">
            <p className="pi-mono-label text-[color:var(--pi-ghost)]">реестр пуст</p>
            <p className="mt-2 font-mono text-xs text-[color:var(--pi-ghost)]">
              добавьте первый артефакт через диспетчерскую
            </p>
          </div>
        ) : (
          <>
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
              {items.slice(0, visible).map((item, i) => (
                <PortfolioCard key={item.id} item={item} index={i} />
              ))}
            </div>
            {visible < items.length && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => setVisible((v) => v + PAGE)}
                  className="pi-stamp border border-[color:var(--pi-ink)] px-8 py-3 transition-transform hover:translate-x-0.5 hover:translate-y-0.5"
                >
                  <span className="pi-mono-label">загрузить ещё</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}