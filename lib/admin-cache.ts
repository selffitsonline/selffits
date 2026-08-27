type AdminCacheEntry = {
  data: any;
  timestamp: number;
};

const adminMemoryCache: Record<string, AdminCacheEntry> = {};
const ADMIN_CACHE_TTL_MS = 60 * 1000; // 60 seconds client cache TTL

export async function fetchAdminDataWithCache(
  cacheKey: string,
  fetcher: () => Promise<any>,
  forceRefresh: boolean = false
) {
  const now = Date.now();
  const existing = adminMemoryCache[cacheKey];

  if (!forceRefresh && existing && now - existing.timestamp < ADMIN_CACHE_TTL_MS) {
    return existing.data;
  }

  const freshData = await fetcher();
  if (freshData && freshData.success) {
    adminMemoryCache[cacheKey] = {
      data: freshData,
      timestamp: now,
    };
  }

  return freshData;
}

export function clearAdminCacheKey(cacheKey?: string) {
  if (cacheKey) {
    delete adminMemoryCache[cacheKey];
  } else {
    Object.keys(adminMemoryCache).forEach((key) => delete adminMemoryCache[key]);
  }
}
