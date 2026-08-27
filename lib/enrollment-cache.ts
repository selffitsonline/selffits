import { getStudentEnrollmentAction } from "@/actions/payments.actions";

type CachedEnrollmentData = {
  data: any;
  timestamp: number;
};

let memoryCache: CachedEnrollmentData | null = null;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

export async function fetchStudentEnrollmentWithCache(forceRefresh: boolean = false) {
  const now = Date.now();

  if (!forceRefresh && memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return memoryCache.data;
  }

  const freshData = await getStudentEnrollmentAction();
  if (freshData && freshData.success) {
    memoryCache = {
      data: freshData,
      timestamp: now,
    };
  }

  return freshData;
}

export function clearStudentEnrollmentCache() {
  memoryCache = null;
}
