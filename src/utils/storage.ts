/**
 * Utility functions for working with localStorage
 */

/**
 * Load data from localStorage with error handling
 * @param key The localStorage key
 * @param defaultValue Default value to return if key doesn't exist or parsing fails
 * @returns The parsed data or the default value
 */
export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  const value = localStorage.getItem(key)
  if (!value) return defaultValue

  try {
    return JSON.parse(value) as T
  } catch (e) {
    console.error(`Failed to parse localStorage key ${key}`, e)
    return defaultValue
  }
}

/**
 * Save data to localStorage
 * @param key The localStorage key
 * @param value The value to save
 */
export function saveToLocalStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}
