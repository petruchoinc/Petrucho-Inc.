import { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useSiteText, useSiteTextStore } from '@/lib/SiteTextContext';
import EditableText from '@/components/EditableText';

export default function Marketplace() {
  const market = useSiteText('marketplace.url', '');
  const { editMode } = useSiteTextStore();
  const [draft, setDraft] = useState(market.value);

  useEffect(() => {
    if (editMode) setDraft(market.value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode]);

  return (
    <section id="marketplace" className="border-b border-[color:var(--pi-ink)]">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-10 md:py-28">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-[color:var(--pi-ink)] pb-5">
          <div>
            <span className="pi-mono-label text-[color:var(--pi-ghost)]">/ коммерческий вектор</span>
            <EditableText
              id="marketplace.heading"
              defaultValue="Маркетплейс компании"
              as="h2"
              className="pi-display mt-2 text-[clamp(2rem,5vw,4rem)]"
            />
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
          <EditableText
            id="marketplace.body"
            defaultValue="Petrucho Inc. занимается разработкой своего маркетплейса с уникальными товарами, включающими баркасы и карликовые абзационные триггеры"
            as="p"
            className="max-w-2xl font-mono text-sm leading-relaxed text-[color:var(--pi-ink)]/85 md:text-base"
            multiline
          />

          <div className="flex flex-col items-start gap-4">
            {editMode && (
              <label className="w-full max-w-xs">
                <span className="pi-mono-label text-[color:var(--pi-ghost)]">ссылка кнопки</span>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={() => market.save(draft)}
                  className="mt-1 w-full border border-[color:var(--pi-ink)]/50 bg-transparent px-3 py-2 font-mono text-xs text-[color:var(--pi-ink)] outline-none"
                />
              </label>
            )}
            <a
              href={market.value || '#manifest'}
              target={market.value ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="pi-stamp group inline-flex items-center gap-2 border border-[color:var(--pi-ink)] bg-[color:var(--pi-ink)] px-6 py-3 font-display font-bold text-[color:var(--pi-bg)] transition-transform hover:translate-x-0.5 hover:translate-y-0.5"
            >
              Наш маркетплейс
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}