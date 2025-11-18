import { FILTER_FLAG, filterSensitiveData } from './sensitiveFilter';

const DEFAULT_PARSE = 'json';

export async function apiRequest(resource, options = {}) {
  const {
    parse = DEFAULT_PARSE,
    filter = true,
    enabled = FILTER_FLAG,
    ...fetchOptions
  } = options;

  let response;

  try {
    response = await fetch(resource, fetchOptions);
  } catch (error) {
    error.message = `[apiRequest] ${error.message}`;
    throw error;
  }

  const payload = await parseResponseBody(response, parse);
  const data = filter && enabled ? filterSensitiveData(payload) : payload;

  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    url: response.url,
    data,
  };
}

export function unwrapResponse(summary, fallbackMessage = 'Request failed') {
  if (!summary) {
    throw new Error(fallbackMessage);
  }

  if (!summary.ok) {
    const error = new Error(summary.data?.message || fallbackMessage);
    error.status = summary.status;
    error.payload = summary.data;
    throw error;
  }

  return summary.data;
}

async function parseResponseBody(response, parse) {
  if (parse === 'raw') {
    return response;
  }

  if (parse === 'text') {
    return await response.text();
  }

  if (parse === 'blob') {
    return await response.blob();
  }

  if (parse === 'arrayBuffer') {
    return await response.arrayBuffer();
  }

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch (error) {
      console.warn('[apiRequest] Failed to parse JSON response:', error);
      return null;
    }
  }

  if (contentType.includes('text/')) {
    return await response.text();
  }

  return null;
}

