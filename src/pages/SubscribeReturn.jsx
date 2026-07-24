import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { localStore } from '@/api/localStoreClient';
import { Check, Loader2, X } from 'lucide-react';

export default function SubscribeReturn() {
  const [state, setState] = useState('loading');
  const urlParams = new URLSearchParams(window.location.search);
  const subscriptionId = urlParams.get('subscription_id');

  useEffect(() => {
    if (!subscriptionId) { setState('error'); return; }
    localStore.functions.invoke('paypalReturn', { subscription_id: subscriptionId })
      .then((res) => setState(res.data?.active ? 'success' : 'pending'))
      .catch(() => setState('error'));
  }, [subscriptionId]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 px-5 text-center">
      {state === 'loading' && (
        <>
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="pi-mono-label">Проверка подписки…</p>
        </>
      )}
      {state === 'success' && (
        <>
          <Check className="h-12 w-12" />
          <h1 className="pi-display text-3xl">Подписка активна</h1>
          <Link to="/" className="pi-mono-label underline">На главную</Link>
        </>
      )}
      {state === 'pending' && (
        <>
          <p className="pi-mono-label">Подписка обрабатывается</p>
          <Link to="/" className="pi-mono-label underline">На главную</Link>
        </>
      )}
      {state === 'error' && (
        <>
          <X className="h-12 w-12" />
          <p className="pi-mono-label">Не удалось подтвердить подписку</p>
          <Link to="/" className="pi-mono-label underline">На главную</Link>
        </>
      )}
    </div>
  );
}