const DEFAULT_FILTER_TERMS = (process.env.NEXT_PUBLIC_ZABBIX_FILTER_TERMS || 'zabbix')
  .split(',')
  .map((term) => term.trim().toLowerCase())
  .filter(Boolean);

const REMOVED_TOKEN = Symbol('sensitive-filter-removed');

export const FILTER_FLAG =
  (process.env.NEXT_PUBLIC_ENABLE_ZABBIX_FILTER || 'true').toLowerCase() !== 'false';

export function containsBlockedTerm(value) {
  if (typeof value !== 'string' || !value) {
    return false;
  }

  const normalized = value.toLowerCase();
  return DEFAULT_FILTER_TERMS.some((term) => normalized.includes(term));
}

export function containsBlockedTermDeep(value, seen = new WeakSet()) {
  if (value == null) {
    return false;
  }

  if (typeof value === 'string') {
    return containsBlockedTerm(value);
  }

  if (typeof value !== 'object') {
    return false;
  }

  if (seen.has(value)) {
    return false;
  }
  seen.add(value);

  if (Array.isArray(value)) {
    return value.some((item) => containsBlockedTermDeep(item, seen));
  }

if (value instanceof Date || isBlobLike(value) || isFileLike(value)) {
    return false;
  }

  return Object.values(value).some((val) => containsBlockedTermDeep(val, seen));
}

export function filterSensitiveData(value, options = {}) {
  const { enabled = FILTER_FLAG } = options;

  if (!enabled || value === undefined) {
    return value;
  }

  const sanitized = sanitizeValue(value, new WeakSet());
  return sanitized === REMOVED_TOKEN ? null : sanitized;
}

function sanitizeValue(value, seen) {
  if (value == null) {
    return value;
  }

  if (typeof value === 'string') {
    return containsBlockedTerm(value) ? REMOVED_TOKEN : value;
  }

  if (typeof value !== 'object') {
    return value;
  }

  if (value instanceof Date || isBlobLike(value) || isFileLike(value)) {
    return value;
  }

  if (seen.has(value)) {
    return value;
  }
  seen.add(value);

  if (Array.isArray(value)) {
    const result = [];
    for (const item of value) {
      const sanitizedItem = sanitizeValue(item, seen);
      if (sanitizedItem !== REMOVED_TOKEN && sanitizedItem !== undefined) {
        result.push(sanitizedItem);
      }
    }
    return result;
  }

  const result = {};
  for (const [key, val] of Object.entries(value)) {
    const sanitizedVal = sanitizeValue(val, seen);
    if (sanitizedVal !== REMOVED_TOKEN && sanitizedVal !== undefined) {
      result[key] = sanitizedVal;
    }
  }

  return result;
}

function isBlobLike(value) {
  return typeof Blob !== 'undefined' && value instanceof Blob;
}

function isFileLike(value) {
  return typeof File !== 'undefined' && value instanceof File;
}

