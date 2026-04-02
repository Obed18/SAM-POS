import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_PREFIX = 'swiftpos_';
const STORAGE_VERSION_KEY = `${STORAGE_PREFIX}version`;
const CURRENT_VERSION = '1.0.0';

/**
 * Reads a value from localStorage with error handling.
 * Returns undefined if the key doesn't exist or parsing fails.
 */
function readFromStorage<T>(key: string): T | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (raw === null) return undefined;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[useLocalStorage] Failed to parse key "${key}":`, err);
    return undefined;
  }
}

/**
 * Writes a value to localStorage with error handling.
 */
function writeToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch (err) {
    console.warn(`[useLocalStorage] Failed to write key "${key}":`, err);
  }
}

/**
 * Removes a key from localStorage.
 */
function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch (err) {
    console.warn(`[useLocalStorage] Failed to remove key "${key}":`, err);
  }
}

/**
 * Custom hook that persists state to localStorage.
 *
 * @param key - The localStorage key (auto-prefixed with 'swiftpos_')
 * @param defaultValue - The fallback value when nothing is stored
 * @returns [value, setValue] - Standard state tuple with automatic persistence
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Initialize state: read from localStorage or use default
  const [state, setState] = useState<T>(() => {
    const stored = readFromStorage<T>(key);
    return stored !== undefined ? stored : defaultValue;
  });

  // Track whether this is the initial mount to avoid double-writing
  const isInitialMount = useRef(true);

  // Persist to localStorage whenever state changes (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    writeToStorage(key, state);
  }, [key, state]);

  return [state, setState];
}

/**
 * Returns the list of all SwiftPOS localStorage keys.
 */
export function getStorageKeys(): string[] {
  if (typeof window === 'undefined') return [];
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(STORAGE_PREFIX)) {
      keys.push(k);
    }
  }
  return keys;
}

/**
 * Calculates the total size of all SwiftPOS data in localStorage (in bytes).
 */
export function getStorageSize(): number {
  if (typeof window === 'undefined') return 0;
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(STORAGE_PREFIX)) {
      const v = localStorage.getItem(k) || '';
      total += k.length + v.length;
    }
  }
  // Each char is ~2 bytes in JS (UTF-16)
  return total * 2;
}

/**
 * Clears all SwiftPOS data from localStorage.
 */
export function clearAllStorage(): void {
  if (typeof window === 'undefined') return;
  const keys = getStorageKeys();
  keys.forEach((k) => {
    try {
      localStorage.removeItem(k);
    } catch (err) {
      console.warn(`[clearAllStorage] Failed to remove key "${k}":`, err);
    }
  });
}

/**
 * Exports all SwiftPOS data as a JSON string for backup.
 */
export function exportStorageData(): string {
  if (typeof window === 'undefined') return '{}';
  const data: Record<string, unknown> = {};
  const keys = getStorageKeys();
  keys.forEach((k) => {
    try {
      const raw = localStorage.getItem(k);
      if (raw !== null) {
        data[k] = JSON.parse(raw);
      }
    } catch {
      // skip unparseable
    }
  });
  return JSON.stringify(data, null, 2);
}

/**
 * Imports SwiftPOS data from a JSON string backup.
 */
export function importStorageData(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr) as Record<string, unknown>;
    Object.entries(data).forEach(([key, value]) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    });
    return true;
  } catch (err) {
    console.warn('[importStorageData] Failed to import:', err);
    return false;
  }
}

/**
 * Gets a human-readable storage size string.
 */
export function formatStorageSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Gets the last modified timestamp for SwiftPOS data.
 */
export function getLastModified(): string | null {
  return readFromStorage<string>('lastModified') ?? null;
}

/**
 * Updates the last modified timestamp.
 */
export function updateLastModified(): void {
  writeToStorage('lastModified', new Date().toISOString());
}
