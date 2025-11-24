/**
 * In-flight request deduplication cache
 * Prevents duplicate concurrent API calls for the same resource
 */

const requestCache = new Map();

/**
 * Get a cached in-flight request or fetch new data
 * @param {string} cacheKey - Unique identifier for the request
 * @param {Function} fetchFn - Async function that fetches the data
 * @param {number} ttlMs - Time to live for the cache entry (default: 30 seconds)
 * @returns {Promise} The result of fetchFn
 */
export const getCachedOrFetch = async (cacheKey, fetchFn, ttlMs = 30000) => {
  // Check if request is already in flight
  if (requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey);
  }

  // Create the fetch promise
  const fetchPromise = fetchFn().finally(() => {
    // Remove from cache after TTL
    setTimeout(() => requestCache.delete(cacheKey), ttlMs);
  });

  // Store in cache immediately to deduplicate concurrent requests
  requestCache.set(cacheKey, fetchPromise);

  return fetchPromise;
};

/**
 * Clear all cached requests
 */
export const clearRequestCache = () => {
  requestCache.clear();
};

/**
 * Clear a specific cache entry
 * @param {string} cacheKey - Key to clear
 */
export const clearCacheKey = (cacheKey) => {
  requestCache.delete(cacheKey);
};
