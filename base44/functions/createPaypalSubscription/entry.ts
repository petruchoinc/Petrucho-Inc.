import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getPaypalBase, getAccessToken } from '../../shared/paypal.ts';

const TIERS = {
  tier3: { price: '3.00', name: 'Petrucho · Рядовой' },
  tier6: { price: '6.00', name: 'Petrucho · Боцман' },
  tier10: { price: '10.00', name: 'Petrucho · Капитан' },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json().catch(() => ({}));
    const tierKey = body.tier;
    const tier = TIERS[tierKey];
    if (!tier) return Response.json({ error: 'Invalid tier' }, { status: 400 });

    const token = await getAccessToken();
    const base = getPaypalBase();
    const returnUrl = Deno.env.get('PAYPAL_RETURN_URL') || 'https://petrucho.inc/subscribe/return';
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    let productRow = (await base44.asServiceRole.entities.PaypalPlan.filter({ tier: 'product' }))[0];
    let productId = productRow?.plan_id;
    if (!productId) {
      const pr = await fetch(`${base}/v1/catalogs/products`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: 'Petrucho Inc Subscription', type: 'SERVICE' }),
      });
      const pd = await pr.json();
      if (!pd.id) return Response.json({ error: 'PayPal product error', details: pd }, { status: 502 });
      productId = pd.id;
      await base44.asServiceRole.entities.PaypalPlan.create({ tier: 'product', plan_id: productId, price: 0 });
    }

    let planRow = (await base44.asServiceRole.entities.PaypalPlan.filter({ tier: tierKey }))[0];
    let planId = planRow?.plan_id;
    if (!planId) {
      const plRes = await fetch(`${base}/v1/billing/plans`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          product_id: productId,
          name: tier.name,
          status: 'ACTIVE',
          billing_cycles: [{
            frequency: { interval_unit: 'MONTH', interval_count: 1 },
            tenure_type: 'REGULAR',
            sequence: 1,
            total_cycles: 0,
            pricing_scheme: { fixed_price: { value: tier.price, currency_code: 'USD' } },
          }],
          payment_preferences: { auto_bill_outstanding: true, setup_fee_failure_action: 'CONTINUE', payment_failure_threshold: 2 },
        }),
      });
      const pd = await plRes.json();
      if (!pd.id) return Response.json({ error: 'PayPal plan error', details: pd }, { status: 502 });
      planId = pd.id;
      await base44.asServiceRole.entities.PaypalPlan.create({ tier: tierKey, plan_id: planId, price: parseFloat(tier.price) });
    }

    const subRes = await fetch(`${base}/v1/billing/subscriptions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        plan_id: planId,
        application_context: {
          brand_name: 'Petrucho Inc',
          return_url: returnUrl,
          cancel_url: returnUrl,
          user_action: 'SUBSCRIBE_NOW',
          shipping_preference: 'NO_SHIPPING',
        },
      }),
    });
    const sub = await subRes.json();
    if (!sub.id) return Response.json({ error: sub.message || 'PayPal subscription error', details: sub }, { status: 502 });
    const approveLink = (sub.links || []).find((l) => l.rel === 'approve');
    return Response.json({ approval_url: approveLink?.href, subscription_id: sub.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});