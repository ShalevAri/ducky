// @ts-expect-error: Unused imports
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { loadFromLocalStorage, saveToLocalStorage } from '../../utils/storage'

/**
 * Service for managing application storage
 * Provides a unified interface for caching and persistent storage operations
 * Implements the Singleton pattern to ensure consistent storage access
 */
export class StorageService {
  private static instance: StorageService
  private cache: Map<string, unknown>

  /**
   * Private constructor to prevent direct instantiation
   * Initializes the in-memory cache
   */
  private constructor() {
    this.cache = new Map()
  }

  /**
   * Gets the singleton instance of StorageService
   * @returns The StorageService instance
   */
  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService()
    }
    return StorageService.instance
  }

  get<T>(key: string, defaultValue: T): T {
    if (this.cache.has(key)) {
      return this.cache.get(key) as T
    }

    try {
      const value = localStorage.getItem(key)
      if (value === null) {
        this.cache.set(key, defaultValue)
        return defaultValue
      }

      const parsedValue = JSON.parse(value) as T
      this.cache.set(key, parsedValue)
      return parsedValue
    } catch (error) {
      console.error(`StorageService: Error getting value for key '${key}'`, error)
      this.cache.set(key, defaultValue)
      return defaultValue
    }
  }

  set<T>(key: string, value: T): void {
    try {
      this.cache.set(key, value)
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`StorageService: Error setting value for key '${key}'`, error)
    }
  }

  remove(key: string): void {
    this.cache.delete(key)
    localStorage.removeItem(key)
  }

  clear(): void {
    this.cache.clear()
    localStorage.clear()
  }

  has(key: string): boolean {
    return this.cache.has(key) || localStorage.getItem(key) !== null
  }
}
