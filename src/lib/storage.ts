/**
 * Type-safe Chrome storage utilities
 * Supports both local and sync storage with automatic serialization
 */

export interface StorageSchema {
  settings: {
    enabled: boolean;
    theme: "light" | "dark" | "system";
    notifications: boolean;
  };
  userData: {
    lastVisit: number;
    visitCount: number;
  };
}

type StorageKey = keyof StorageSchema;
type StorageValue<K extends StorageKey> = StorageSchema[K];

/**
 * Get a value from chrome.storage.local
 */
export async function getStorage<K extends StorageKey>(
  key: K
): Promise<StorageValue<K> | undefined> {
  const result = await chrome.storage.local.get(key);
  return result[key] as StorageValue<K> | undefined;
}

/**
 * Set a value in chrome.storage.local
 */
export async function setStorage<K extends StorageKey>(
  key: K,
  value: StorageValue<K>
): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}

/**
 * Remove a value from chrome.storage.local
 */
export async function removeStorage<K extends StorageKey>(
  key: K
): Promise<void> {
  await chrome.storage.local.remove(key);
}

/**
 * Get all storage data
 */
export async function getAllStorage(): Promise<Partial<StorageSchema>> {
  return chrome.storage.local.get(null) as Promise<Partial<StorageSchema>>;
}

/**
 * Clear all storage data
 */
export async function clearStorage(): Promise<void> {
  await chrome.storage.local.clear();
}

/**
 * Listen for storage changes
 */
export function onStorageChange(
  callback: (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: string
  ) => void
): () => void {
  chrome.storage.onChanged.addListener(callback);
  return () => chrome.storage.onChanged.removeListener(callback);
}

/**
 * Default settings
 */
export const defaultSettings: StorageSchema["settings"] = {
  enabled: true,
  theme: "system",
  notifications: true,
};

/**
 * Initialize storage with default values if not set
 */
export async function initializeStorage(): Promise<void> {
  const settings = await getStorage("settings");
  if (!settings) {
    await setStorage("settings", defaultSettings);
  }

  const userData = await getStorage("userData");
  if (!userData) {
    await setStorage("userData", {
      lastVisit: Date.now(),
      visitCount: 0,
    });
  }
}
