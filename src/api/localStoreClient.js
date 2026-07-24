import { localData } from '@/lib/local-data';

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';
const PAYPAL_SECRET = import.meta.env.VITE_PAYPAL_SECRET || '';
const PAYPAL_MODE = import.meta.env.VITE_PAYPAL_MODE || 'sandbox';
const PAYPAL_RETURN_URL = import.meta.env.VITE_PAYPAL_RETURN_URL || (typeof window !== 'undefined'
  ? `${window.location.origin}${window.location.pathname.replace(/\/?$/, '/') || '/'}#/subscribe/return`
  : '/#/subscribe/return');

const entityAdapter = (entityName) => ({
  list: (sortBy = 'created_date', limit = 200) => Promise.resolve(localData.list(entityName, sortBy, limit)),
  get: (id) => Promise.resolve(localData.get(entityName, id)),
  filter: (filters = {}) => Promise.resolve(localData.filter(entityName, filters)),
  create: (payload) => Promise.resolve(localData.create(entityName, payload)),
  update: (id, payload) => Promise.resolve(localData.update(entityName, id, payload)),
  updateMany: (filters = {}, updateFields = {}) => Promise.resolve(localData.updateMany(entityName, filters, updateFields)),
  delete: (id) => Promise.resolve(localData.delete(entityName, id)),
  bulkUpdate: (updates = []) => Promise.resolve(localData.bulkUpdate(entityName, updates)),
  subscribe: (callback) => localData.subscribe(entityName, callback),
});

const getCurrentLocationSearch = () => {
  if (typeof window === 'undefined') return '';

  if (window.location.search) {
    return window.location.search;
  }

  const hash = window.location.hash || '';
  const queryIndex = hash.indexOf('?');
  return queryIndex >= 0 ? hash.slice(queryIndex) : '';
};

const getAppBasePath = () => {
  if (typeof window === 'undefined') return '/';
  const pathname = window.location.pathname || '/';
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
};

const goToHashRoute = (route = '/') => {
  if (typeof window === 'undefined') return;
  const basePath = getAppBasePath();
  window.location.assign(`${window.location.origin}${basePath}#${route}`);
};

const getCurrentUserFromStorage = () => {
  if (typeof window === 'undefined') return { id: 'guest', email: 'guest@local', role: 'user' };

  const persisted = window.localStorage.getItem('petrucho_local_user');
  if (persisted) {
    try {
      return JSON.parse(persisted);
    } catch {
      window.localStorage.removeItem('petrucho_local_user');
    }
  }

  const params = new URLSearchParams(getCurrentLocationSearch());
  if (params.get('mode') === 'admin') {
    return { id: 'local-admin', email: 'admin@local', role: 'admin' };
  }

  return { id: 'guest', email: 'guest@local', role: 'user' };
};

const toDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.readAsDataURL(file);
  });

const localAuth = {
  async me() {
    return getCurrentUserFromStorage();
  },
  logout() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('petrucho_local_user');
    }
  },
  redirectToLogin() {
    if (typeof window !== 'undefined') {
      goToHashRoute('/login');
    }
  },
  loginViaEmailPassword(email, password) {
    const role = /admin/i.test(email) || /admin/i.test(password) ? 'admin' : 'user';
    const user = {
      id: role === 'admin' ? 'local-admin' : `user-${email || 'guest'}`,
      email: email || 'guest@local',
      role,
    };

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('petrucho_local_user', JSON.stringify(user));
    }

    return Promise.resolve(user);
  },
  loginWithProvider() {
    const user = getCurrentUserFromStorage();
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('petrucho_local_user', JSON.stringify(user));
    }
    return Promise.resolve(user);
  },
  register({ email }) {
    const user = {
      id: `user-${email || 'guest'}`,
      email: email || 'guest@local',
      role: 'user',
    };

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('petrucho_local_user', JSON.stringify(user));
    }

    return Promise.resolve(user);
  },
  verifyOtp({ email }) {
    const user = {
      id: `user-${email || 'guest'}`,
      email: email || 'guest@local',
      role: 'user',
    };

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('petrucho_local_user', JSON.stringify(user));
    }

    return Promise.resolve({ access_token: 'local', user });
  },
  resendOtp() {
    return Promise.resolve({});
  },
  resetPasswordRequest() {
    return Promise.resolve({});
  },
  resetPassword() {
    return Promise.resolve({});
  },
  setToken() {
    return Promise.resolve({});
  },
};

const localFunctions = {
  async invoke(name, payload = {}) {
    if (name === 'createPaypalSubscription') {
      const plan = localData.filter('PaypalPlan', { tier: payload.tier || 'product' })[0] || { tier: payload.tier || 'product', price: 0 };
      const price = Number(plan.price || 0);

      if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
        return {
          data: {
            approval_url: `/subscribe/return?subscription_id=${payload.tier || plan.tier || 'local'}`,
          },
        };
      }

      try {
        const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`);
        const response = await fetch(`https://api-m.${PAYPAL_MODE}.paypal.com/v2/checkout/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${auth}`,
          },
          body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [
              {
                amount: {
                  currency_code: 'USD',
                  value: String(price || 0),
                },
                description: `Petrucho subscription • ${plan.tier || payload.tier || 'local'}`,
              },
            ],
            application_context: {
              return_url: PAYPAL_RETURN_URL,
              cancel_url: PAYPAL_RETURN_URL,
              brand_name: 'Petrucho Inc.',
              shipping_preference: 'NO_SHIPPING',
            },
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create PayPal checkout order');
        }

        const data = await response.json();
        const approvalLink = data.links?.find((link) => link.rel === 'approve');

        return {
          data: {
            approval_url: approvalLink?.href || PAYPAL_RETURN_URL,
            order_id: data.id,
          },
        };
      } catch {
        return {
          data: {
            approval_url: `/subscribe/return?subscription_id=${payload.tier || plan.tier || 'local'}`,
          },
        };
      }
    }

    if (name === 'paypalReturn') {
      return { data: { active: true, subscription_id: payload.subscription_id } };
    }

    return { data: {} };
  },
};

const localIntegrations = {
  Core: {
    async UploadFile({ file }) {
      const fileUrl = await toDataUrl(file);
      return { file_url: fileUrl };
    },
  },
};

export const localStore = {
  entities: {
    Employee: entityAdapter('Employee'),
    PaypalPlan: entityAdapter('PaypalPlan'),
    PortfolioItem: entityAdapter('PortfolioItem'),
    ResourceLink: entityAdapter('ResourceLink'),
    SiteText: entityAdapter('SiteText'),
    Subscription: entityAdapter('Subscription'),
    Theme: entityAdapter('Theme'),
  },
  functions: localFunctions,
  auth: localAuth,
  integrations: localIntegrations,
};
