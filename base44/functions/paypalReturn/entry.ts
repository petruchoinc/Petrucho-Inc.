import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getPaypalBase, getAccessToken } from '../../shared/paypal.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json().catch(() => ({}));
    const subscriptionId = body.subscription_id;
    if (!subscriptionId) return Response.json({ error: 'Missing subscription_id' }, { status: 400 });

    const token = await getAccessToken();
    const base = getPaypalBase();
    const res = await fetch(`${base}/v1/billing/subscriptions/${subscriptionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const sub = await res.json();
    if (sub.status !== 'ACTIVE') {
      return Response.json({ active: false, status: sub.status });
    }

    const existing = await base44.asServiceRole.entities.Subscription.filter({ paypal_subscription_id: subscriptionId });
    if (existing.length === 0) {
      const planRow = (await base44.asServiceRole.entities.PaypalPlan.filter({ plan_id: sub.plan_id }))[0];
      await base44.asServiceRole.entities.Subscription.create({
        user_id: '',
        subscriber_email: sub.subscriber?.email_address || '',
        tier: planRow?.tier || '',
        price: planRow?.price || 0,
        status: 'active',
        paypal_subscription_id: subscriptionId,
      });
    }
    return Response.json({ active: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});