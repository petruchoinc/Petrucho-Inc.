import { useState } from 'react';
import { localStore } from '@/api/localStoreClient';
import EditableText from '@/components/EditableText';
import { Loader2 } from 'lucide-react';

const TIERS = [
  { key: 'tier3', price: 3, nameKey: 'pricing.tier3.name', descKey: 'pricing.tier3.desc', defaultName: 'Рядовой', defaultDesc: 'Доступ к живому архиву и обновлениям.' },
  { key: 'tier6', price: 6, nameKey: 'pricing.tier6.name', descKey: 'pricing.tier6.desc', defaultName: 'Боцман', defaultDesc: 'Архив, медиа-материалы и ранний доступ.' },
  { key: 'tier10', price: 10, nameKey: 'pricing.tier10.name', descKey: 'pricing.tier10.desc', defaultName: 'Капитан', defaultDesc: 'Полный доступ, эксклюзивы и голос в направлении.' },
];

export default function Pricing() {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const subscribe = async (tier) => {
    setError(null);
    setLoading(tier);
    try {
      const res = await localStore.functions.invoke('createPaypalSubscription', { tier });
      if (res.data?.approval_url) {
        window.location.href = res.data.approval_url;
      } else {
        setError('Не удалось получить ссылку PayPal.');
      }
    } catch (e) {
      setError(e?.response?.data?.error || 'Ошибка связи с PayPal.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <section id="pricing" className="border-b border-[color:var(--pi-ink)] px-5 py-20 md:px-10">
      <div className="mx-auto max-w-5xl">
        <EditableText id="pricing.title" defaultValue="Подписка" as="h2" className="pi-display mb-2 text-[clamp(2rem,6vw,4rem)]" />
        <EditableText id="pricing.subtitle" defaultValue="Три тарифа. Оплата через PayPal." as="p" className="pi-mono-label mb-12" />
        <div className="grid gap-6 md:grid-cols-3">
          {TIERS.map((t) => (
            <div key={t.key} className="pi-stamp flex flex-col gap-4 bg-[color:var(--pi-bg)] p-6">
              <EditableText id={t.nameKey} defaultValue={t.defaultName} as="h3" className="pi-display text-2xl" />
              <div className="flex items-baseline gap-1">
                <span className="pi-display text-4xl">${t.price}</span>
                <span className="pi-mono-label">/мес</span>
              </div>
              <EditableText id={t.descKey} defaultValue={t.defaultDesc} as="p" className="font-mono text-sm leading-relaxed" multiline />
              <button
                onClick={() => subscribe(t.key)}
                disabled={loading === t.key}
                className="pi-mono-label mt-auto border border-[color:var(--pi-ink)] bg-[color:var(--pi-ink)] px-4 py-3 text-[color:var(--pi-bg)] disabled:opacity-50"
              >
                {loading === t.key ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : 'Подписаться'}
              </button>
            </div>
          ))}
        </div>
        {error && <p className="pi-mono-label mt-6 text-[color:var(--pi-ink)]">{error}</p>}
      </div>
    </section>
  );
}