import employeeCsv from '../../data/Employee_export.csv?raw';
import paypalPlanCsv from '../../data/PaypalPlan_export.csv?raw';
import portfolioItemCsv from '../../data/PortfolioItem_export.csv?raw';
import resourceLinkCsv from '../../data/ResourceLink_export.csv?raw';
import siteTextCsv from '../../data/SiteText_export.csv?raw';
import subscriptionCsv from '../../data/Subscription_export.csv?raw';
import themeCsv from '../../data/Theme_export.csv?raw';

const STORAGE_KEY = 'petrucho_local_store_v1';
const EVENT_NAME = 'petrucho-local-store';

const ENTITY_IMPORTS = {
  Employee: employeeCsv,
  PaypalPlan: paypalPlanCsv,
  PortfolioItem: portfolioItemCsv,
  ResourceLink: resourceLinkCsv,
  SiteText: siteTextCsv,
  Subscription: subscriptionCsv,
  Theme: themeCsv,
};

const asBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return value;
};

const asJsonArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    return JSON.parse(value);
  } catch {
    return value
      .split('|')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
};

const parseCsvRow = (line) => {
  const row = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  row.push(current);
  return row.map((value) => value.trim());
};

const parseCsv = (csvContent) => {
  const lines = csvContent
    .replace(/\r/g, '')
    .split('\n')
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) return [];

  const headers = parseCsvRow(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvRow(line);
    const record = {};
    headers.forEach((header, index) => {
      const rawValue = values[index] ?? '';
      const normalizedValue = rawValue;
      if (header === 'external_links') {
        record[header] = asJsonArray(normalizedValue);
      } else if (header === 'is_sample') {
        record[header] = asBoolean(normalizedValue);
      } else {
        record[header] = normalizedValue;
      }
    });
    return record;
  });
};

const readLocalStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeLocalStorage = (value) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: value }));
};

const createDefaultData = () => {
  const seed = {};
  Object.entries(ENTITY_IMPORTS).forEach(([entity, csvContent]) => {
    seed[entity] = parseCsv(csvContent).map((record, index) => ({
      ...record,
      id: record.id || `${entity.toLowerCase()}-${index + 1}`,
    }));
  });
  return seed;
};

const getStore = () => {
  const existing = readLocalStorage();
  if (existing) {
    return existing;
  }

  const seedData = createDefaultData();
  writeLocalStorage(seedData);
  return seedData;
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const makeId = (prefix = 'item') => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const sortByField = (records, sortBy = 'created_date', direction = 'desc') => {
  const next = clone(records);
  const multiplier = direction === 'asc' ? 1 : -1;

  return next.sort((left, right) => {
    const leftValue = left?.[sortBy] || '';
    const rightValue = right?.[sortBy] || '';
    if (leftValue === rightValue) return 0;
    return (leftValue > rightValue ? 1 : -1) * multiplier;
  });
};

const listen = (entity, callback) => {
  if (typeof window === 'undefined') return () => {};
  const handler = (event) => {
    const payload = event?.detail || readLocalStorage() || {};
    if (entity && payload[entity] !== undefined) {
      callback(payload[entity]);
    }
  };
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
};

export const localDataStore = {
  read(entity) {
    return clone(getStore()[entity] || []);
  },
  list(entity, sortBy = 'created_date', limit = 200) {
    const records = this.read(entity);
    const sorted = sortByField(records, sortBy, 'desc');
    return limit ? sorted.slice(0, limit) : sorted;
  },
  get(entity, id) {
    const records = this.read(entity);
    return records.find((record) => record.id === id) || null;
  },
  filter(entity, filters = {}) {
    const records = this.read(entity);
    return records.filter((record) =>
      Object.entries(filters).every(([field, value]) => record[field] === value)
    );
  },
  create(entity, payload) {
    const store = getStore();
    const next = clone(store[entity] || []);
    const created = {
      ...payload,
      id: payload.id || makeId(entity.toLowerCase()),
      created_date: payload.created_date || new Date().toISOString(),
      updated_date: payload.updated_date || new Date().toISOString(),
      created_by_id: payload.created_by_id || 'local',
    };
    next.push(created);
    store[entity] = next;
    writeLocalStorage(store);
    return created;
  },
  update(entity, id, payload) {
    const store = getStore();
    const next = clone(store[entity] || []);
    const index = next.findIndex((record) => record.id === id);
    if (index === -1) {
      throw new Error(`${entity} row with id ${id} was not found`);
    }
    next[index] = {
      ...next[index],
      ...payload,
      updated_date: new Date().toISOString(),
    };
    store[entity] = next;
    writeLocalStorage(store);
    return next[index];
  },
  updateMany(entity, filters = {}, updateFields = {}) {
    const store = getStore();
    const next = clone(store[entity] || []);
    const patch = updateFields.$set || updateFields;
    const updated = next.map((record) => {
      const matches = Object.entries(filters).every(([field, value]) => record[field] === value);
      return matches ? { ...record, ...patch, updated_date: new Date().toISOString() } : record;
    });
    store[entity] = updated;
    writeLocalStorage(store);
    return updated;
  },
  delete(entity, id) {
    const store = getStore();
    const next = clone(store[entity] || []).filter((record) => record.id !== id);
    store[entity] = next;
    writeLocalStorage(store);
    return true;
  },
  bulkUpdate(entity, updates) {
    const store = getStore();
    const next = clone(store[entity] || []);
    updates.forEach((update) => {
      const index = next.findIndex((record) => record.id === update.id);
      if (index !== -1) {
        next[index] = { ...next[index], ...update, updated_date: new Date().toISOString() };
      }
    });
    store[entity] = next;
    writeLocalStorage(store);
    return next;
  },
  subscribe(entity, callback) {
    return listen(entity, callback);
  },
  reset() {
    const seed = createDefaultData();
    writeLocalStorage(seed);
    return seed;
  },
};

export const localData = {
  ...localDataStore,
  getByKey(entity, key) {
    const records = this.read(entity);
    return records.find((record) => record.key === key) || undefined;
  },
};
