import { db } from "./db";

export interface StoredDeviceToken {
  token: string;
  userId: string;
  role: string;
  platform: "ios" | "android";
  deviceId?: string;
  createdAt: string;
  lastUsedAt: string;
}

const SETTINGS_KEY = "mobile_push_device_tokens";

// In-memory cache to optimize read latency and simplify unit/integration testing
const memoryTokenStore: Map<string, StoredDeviceToken> = new Map();
let isCacheHydrated = false;

/**
 * Hydrates the memory cache from the persistent PostgreSQL database store.
 */
async function hydrateCache(): Promise<void> {
  if (isCacheHydrated) return;

  try {
    const record = await db.websiteSettings.findUnique({
      where: { key: SETTINGS_KEY },
    });

    if (record && typeof record.value === "object" && record.value !== null) {
      const rawMap = record.value as unknown as Record<string, StoredDeviceToken>;
      for (const [token, data] of Object.entries(rawMap)) {
        if (data && data.userId && data.token) {
          memoryTokenStore.set(token, data);
        }
      }
    }
    isCacheHydrated = true;
  } catch (err) {
    // If database is not reachable during isolated tests, proceed with memory cache
    isCacheHydrated = true;
  }
}

/**
 * Persists the current token store into the PostgreSQL database.
 */
async function flushToDb(): Promise<void> {
  try {
    const serializable: Record<string, StoredDeviceToken> = {};
    for (const [token, data] of memoryTokenStore.entries()) {
      serializable[token] = data;
    }

    await db.websiteSettings.upsert({
      where: { key: SETTINGS_KEY },
      update: { value: serializable as any },
      create: { key: SETTINGS_KEY, value: serializable as any },
    });
  } catch (err) {
    console.error("DeviceTokenStore.flushToDb error:", err);
  }
}

export const DeviceTokenStore = {
  /**
   * Registers or refreshes a device token for an authenticated user.
   * If the token was previously registered to another user (e.g., account switch on same device),
   * ownership is re-assigned to the current user to prevent notification leakage.
   */
  async registerToken(params: {
    userId: string;
    role: string;
    token: string;
    platform: "ios" | "android";
    deviceId?: string;
  }): Promise<StoredDeviceToken> {
    await hydrateCache();

    const now = new Date().toISOString();
    const existing = memoryTokenStore.get(params.token);

    const entry: StoredDeviceToken = {
      token: params.token,
      userId: params.userId,
      role: params.role,
      platform: params.platform,
      deviceId: params.deviceId || existing?.deviceId,
      createdAt: existing ? existing.createdAt : now,
      lastUsedAt: now,
    };

    memoryTokenStore.set(params.token, entry);
    await flushToDb();
    return entry;
  },

  /**
   * Unregisters a device token (e.g. on user logout).
   * Verifies that the token belongs to the requesting user.
   */
  async unregisterToken(token: string, userId: string): Promise<boolean> {
    await hydrateCache();

    const existing = memoryTokenStore.get(token);
    if (!existing) {
      return false;
    }

    // Only allow unregistering if the token matches the user
    if (existing.userId === userId) {
      memoryTokenStore.delete(token);
      await flushToDb();
      return true;
    }

    return false;
  },

  /**
   * Unregisters all tokens for a given user (e.g. when an account is blocked or deleted).
   */
  async unregisterAllUserTokens(userId: string): Promise<number> {
    await hydrateCache();

    let removed = 0;
    for (const [token, data] of Array.from(memoryTokenStore.entries())) {
      if (data.userId === userId) {
        memoryTokenStore.delete(token);
        removed++;
      }
    }

    if (removed > 0) {
      await flushToDb();
    }
    return removed;
  },

  /**
   * Retrieves all active device tokens registered to a specific user.
   */
  async getUserTokens(userId: string): Promise<StoredDeviceToken[]> {
    await hydrateCache();

    const tokens: StoredDeviceToken[] = [];
    for (const data of memoryTokenStore.values()) {
      if (data.userId === userId) {
        tokens.push(data);
      }
    }
    return tokens;
  },

  /**
   * Retrieves all active device tokens for a collection of user IDs.
   */
  async getUsersTokens(userIds: string[]): Promise<StoredDeviceToken[]> {
    await hydrateCache();

    const idSet = new Set(userIds);
    const tokens: StoredDeviceToken[] = [];
    for (const data of memoryTokenStore.values()) {
      if (idSet.has(data.userId)) {
        tokens.push(data);
      }
    }
    return tokens;
  },

  /**
   * Retrieves all registered device tokens in the system.
   */
  async getAllTokens(): Promise<StoredDeviceToken[]> {
    await hydrateCache();
    return Array.from(memoryTokenStore.values());
  },

  /**
   * Removes invalid, expired, or unregistered tokens reported by FCM/APNs.
   */
  async pruneInvalidTokens(invalidTokens: string[]): Promise<number> {
    await hydrateCache();

    let count = 0;
    for (const token of invalidTokens) {
      if (memoryTokenStore.delete(token)) {
        count++;
      }
    }

    if (count > 0) {
      await flushToDb();
    }
    return count;
  },

  /**
   * Testing helper: clears all tokens in memory and resets state.
   */
  async _resetForTesting(): Promise<void> {
    memoryTokenStore.clear();
    isCacheHydrated = true;
    await flushToDb();
  },
};
