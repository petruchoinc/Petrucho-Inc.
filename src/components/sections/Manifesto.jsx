import EditableText from '@/components/EditableText';

const LOGS = [
  'RESOURCE // DIESEL-7',
  'DISPATCH 14:02',
  'BARKASSE K-3 LOADED',
  'FJORD FOG 0.8',
  'DWARF CARVING INTACT',
  'STEEL GRADE S355',
  'COORD 59.91N 10.75E',
  'HALLUCINATION STABLE',
];

export default function Manifesto() {
  return (
    <section id="manifest" className="border-b border-[color:var(--pi-ink)]">
      <div className="overflow-hidden border-b border-[color:var(--pi-ink)] bg-[color:var(--pi-ink)] py-2 text-[color:var(--pi-bg)]">
        <div className="pi-ticker flex w-max gap-8 whitespace-nowrap">
          {[...LOGS, ...LOGS].map((l, i) => (
            <span key={i} className="pi-mono-label">
              {l}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-12 md:px-10 md:py-32">
        <div className="md:col-span-4">
          <EditableText
            id="manifest.label"
            defaultValue="/ манифест"
            as="span"
            className="pi-mono-label text-[color:var(--pi-ghost)]"
          />
        </div>
        <div className="md:col-span-8">
          <EditableText
            id="manifest.heading"
            defaultValue="Petrucho Inc. — компания, основанная на абзационном диспетчинге."
            as="p"
            className="pi-display text-[clamp(2rem,5vw,4.2rem)]"
          />
          <div className="mt-10 max-w-xl space-y-4 font-mono text-sm leading-relaxed text-[color:var(--pi-ink)]/80">
            <EditableText
              id="manifest.p1"
              defaultValue="Сотрудничая со множеством дизельных ресурсов, корпорация стремится реализовать стальные баркасы в виде норвежских карликов — монументальные объекты на стыке древней скандинавской мифологии и технологий XX века."
              as="p"
              className="block"
              multiline
            />
            <EditableText
              id="manifest.p2"
              defaultValue="Этот архив — живой. Он постоянно пополняется артефактами: изображениями, текстами, видео и звуком. Каждый объект — грузовая единица, доставленная из фьорда в реестр."
              as="p"
              className="block"
              multiline
            />
          </div>
        </div>
      </div>
    </section>
  );
}