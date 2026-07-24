import { useEffect, useRef, useState } from 'react';
import { Image } from '@/components/ui/image';
import { ChevronDown } from 'lucide-react';
import EditableText from '@/components/EditableText';
import { useSiteText } from '@/lib/SiteTextContext';
import { safeUrl } from '@/lib/media';

const DEFAULT_HERO_URL =
  'https://plain-eeur-prod-public.komododecks.com/202607/20/lbtW3Ef6pSC1DMHzeRZg/image.jpg';

const DEFAULT_COLOR = '#E8E8E4';

const TITLE_PRESETS = [
  { key: 'solid', label: 'сплошной', apply: (c) => ({ color: c }) },
  { key: 'outline', label: 'контур', apply: (c) => ({ WebkitTextStroke: `2px ${c}`, color: 'transparent' }) },
  { key: 'ghost', label: 'призрак', apply: (c) => ({ color: c, opacity: 0.4 }) },
  { key: 'duo', label: 'двойной', apply: (c) => ({ WebkitTextStroke: `2px ${c}`, color: c, opacity: 0.9 }) },
  { key: 'shadow', label: 'с тенью', apply: (c) => ({ color: c, textShadow: '0 2px 16px rgba(0,0,0,0.55)' }) },
];

const COLOR_TARGETS = [
  { id: 'hero.title', label: 'Заголовок' },
  { id: 'hero.subtitle', label: 'Подпись' },
  { id: 'hero.archive', label: 'Архив' },
  { id: 'hero.coords', label: 'Координаты' },
  { id: 'hero.tagline', label: 'Тэглайн' },
  { id: 'hero.brand', label: 'inc.' },
];

export default function Hero() {
  const layerRef = useRef(null);
  const hero = useSiteText('hero.image_url', DEFAULT_HERO_URL);
  const blend = useSiteText('hero.blend', '1');
  const titleStyle = useSiteText('hero.title_style', 'solid');

  const titleColorStore = useSiteText('hero.title.color', DEFAULT_COLOR);
  const subtitleColorStore = useSiteText('hero.subtitle.color', DEFAULT_COLOR);
  const archiveColorStore = useSiteText('hero.archive.color', DEFAULT_COLOR);
  const coordsColorStore = useSiteText('hero.coords.color', DEFAULT_COLOR);
  const taglineColorStore = useSiteText('hero.tagline.color', DEFAULT_COLOR);
  const brandColorStore = useSiteText('hero.brand.color', DEFAULT_COLOR);

  const colorStores = {
    'hero.title': titleColorStore,
    'hero.subtitle': subtitleColorStore,
    'hero.archive': archiveColorStore,
    'hero.coords': coordsColorStore,
    'hero.tagline': taglineColorStore,
    'hero.brand': brandColorStore,
  };

  const [urlDraft, setUrlDraft] = useState(hero.value);
  const [colorDrafts, setColorDrafts] = useState({});

  useEffect(() => {
    if (hero.editMode) {
      setUrlDraft(hero.value);
      setColorDrafts(
        Object.fromEntries(Object.entries(colorStores).map(([k, v]) => [k, v.value]))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hero.editMode]);

  const getColor = (id) =>
    hero.editMode ? colorDrafts[id] ?? colorStores[id].value : colorStores[id].value;
  const setColor = (id, val) => setColorDrafts((d) => ({ ...d, [id]: val }));
  const commitColor = (id) => colorStores[id].save(getColor(id));

  const onMove = (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 26;
    const y = (e.clientY / window.innerHeight - 0.5) * 26;
    if (layerRef.current) {
      layerRef.current.style.transform = `scale(1.1) translate(${x}px, ${y}px)`;
    }
  };

  const blendMode = blend.value === '1' ? 'difference' : 'normal';
  const overlayStyle = (id) => ({ color: getColor(id), mixBlendMode: blendMode });
  const preset = TITLE_PRESETS.find((p) => p.key === titleStyle.value) || TITLE_PRESETS[0];
  const titleStyleObj = preset.apply(getColor('hero.title'));

  return (
    <section
      onMouseMove={onMove}
      className="relative flex h-[100svh] w-full items-center justify-center overflow-hidden border-b border-[color:var(--pi-ink)]"
    >
      <div ref={layerRef} className="absolute inset-0 transition-transform duration-500 ease-out will-change-transform">
        <Image src={safeUrl(hero.value)} className="h-full w-full object-cover" fittingType="fill" alt="Стальной баркас в норвежском фьорде" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--pi-bg)] via-transparent to-[color:var(--pi-bg)]/40" />

      {hero.editMode && (
        <div className="absolute left-1/2 top-20 z-20 max-h-[70vh] w-[min(92vw,30rem)] -translate-x-1/2 space-y-3 overflow-auto border border-[color:var(--pi-bg)] bg-[color:var(--pi-ink)]/85 p-4 backdrop-blur">
          <div>
            <label className="pi-mono-label text-[color:var(--pi-bg)]">url баркаса</label>
            <input
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              onBlur={() => hero.save(urlDraft)}
              className="mt-1 w-full border border-[color:var(--pi-bg)] bg-transparent px-3 py-2 font-mono text-xs text-[color:var(--pi-bg)] outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="pi-mono-label text-[color:var(--pi-bg)]">инверсия</label>
            <button
              onClick={() => blend.save(blend.value === '1' ? '0' : '1')}
              className={`pi-mono-label border px-2 py-1 ${
                blend.value === '1'
                  ? 'border-[color:var(--pi-bg)] bg-[color:var(--pi-bg)] text-[color:var(--pi-ink)]'
                  : 'border-[color:var(--pi-bg)] text-[color:var(--pi-bg)]'
              }`}
            >
              {blend.value === '1' ? 'вкл' : 'выкл'}
            </button>
          </div>

          <div>
            <label className="pi-mono-label text-[color:var(--pi-bg)]">тема заголовка</label>
            <div className="mt-1 flex flex-wrap gap-1">
              {TITLE_PRESETS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => titleStyle.save(p.key)}
                  className={`pi-mono-label border px-2 py-1 ${
                    titleStyle.value === p.key
                      ? 'border-[color:var(--pi-bg)] bg-[color:var(--pi-bg)] text-[color:var(--pi-ink)]'
                      : 'border-[color:var(--pi-bg)] text-[color:var(--pi-bg)]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="pi-mono-label text-[color:var(--pi-bg)]">цвета надписей</label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {COLOR_TARGETS.map((t) => (
                <div key={t.id} className="flex items-center gap-2 border border-[color:var(--pi-bg)]/40 px-2 py-1">
                  <input
                    type="color"
                    value={getColor(t.id)}
                    onChange={(e) => setColor(t.id, e.target.value)}
                    onBlur={() => commitColor(t.id)}
                    className="h-7 w-9 shrink-0 cursor-pointer border-0 bg-transparent p-0"
                  />
                  <span className="pi-mono-label truncate text-[color:var(--pi-bg)]">{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div
        className={`absolute inset-0 flex flex-col justify-between p-5 md:p-10 ${
          hero.editMode ? '' : 'pointer-events-none'
        }`}
      >
        <div className="flex items-start justify-between">
          <h1
            className="pi-display text-[clamp(2.5rem,9vw,9rem)]"
            style={{ ...titleStyleObj, mixBlendMode: blendMode }}
          >
            PETRU<span>CHO</span>
          </h1>
          <EditableText
            id="hero.brand"
            defaultValue="inc."
            as="span"
            className="pi-mono-label mt-2 hidden md:block"
            style={overlayStyle('hero.brand')}
          />
        </div>
        <div className="flex items-end justify-between">
          <EditableText
            id="hero.coords"
            defaultValue="// 59.91°N · 10.75°E"
            as="span"
            className="pi-mono-label"
            style={overlayStyle('hero.coords')}
          />
          <EditableText
            id="hero.tagline"
            defaultValue={'абзационный\nдиспетчинг'}
            as="span"
            className="pi-mono-label hidden whitespace-pre-line text-right sm:block"
            style={overlayStyle('hero.tagline')}
          />
        </div>
      </div>

      <div className="relative z-10 text-center">
        <EditableText
          id="hero.archive"
          defaultValue="living archive · v.∞"
          as="p"
          className="pi-mono-label mb-3"
          style={overlayStyle('hero.archive')}
        />
        <EditableText
          id="hero.subtitle"
          defaultValue="Стальные баркасы в виде норвежских карликов. Промышленная алхимия на пересечении дизеля и мифа."
          as="p"
          className="mx-auto max-w-md px-6 font-mono text-sm leading-relaxed md:text-base"
          style={overlayStyle('hero.subtitle')}
          multiline
        />
      </div>

      <a
        href="#manifest"
        className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1"
        style={overlayStyle('hero.title')}
      >
        <span className="pi-mono-label">scroll</span>
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </a>
    </section>
  );
}