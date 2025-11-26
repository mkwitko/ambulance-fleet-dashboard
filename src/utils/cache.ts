import { useState, useCallback } from "react";

export const CACHE_KEYS = {
  NOTIFICATIONS: "chats_notifications_enabled",
  VOLUME: "chats_volume_level",
  PREVIOUS_VOLUME: "chats_previous_volume",
} as const;

// Tipo das chaves
export type CacheKey = keyof typeof CACHE_KEYS;

// Tipo dos valores das chaves
export type CacheKeyValue = (typeof CACHE_KEYS)[CacheKey];

export const usePersistedState = (key: string, defaultValue: any) => {
  const [state, setState] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const setPersistedState = useCallback(
    (value: any) => {
      try {
        const valueToStore = typeof value === "function" ? value(state) : value;
        setState(valueToStore);
        localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, state]
  );

  return [state, setPersistedState];
};

export const getCachedItem = <T>(key: CacheKeyValue, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};

export const setCachedItem = (key: CacheKeyValue, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
};
