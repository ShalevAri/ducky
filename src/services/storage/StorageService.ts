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
    console.log(`StorageService: Getting value for key '${key}'`)

    if (this.cache.has(key)) {
      console.log(`StorageService: Using cached value for key '${key}'`)
      return this.cache.get(key) as T
    }

    try {
      const value = localStorage.getItem(key)
      if (value === null) {
        console.log(`StorageService: No value found for key '${key}', using default`)
        this.cache.set(key, defaultValue)
        return defaultValue
      }

      const parsedValue = JSON.parse(value) as T
      console.log(`StorageService: Successfully retrieved value for key '${key}'`)
      this.cache.set(key, parsedValue)
      return parsedValue
    } catch (error) {
      console.error(`StorageService: Error getting value for key '${key}'`, error)
      this.cache.set(key, defaultValue)
      return defaultValue
    }
  }

  set<T>(key: string, value: T): void {
    console.log(`StorageService: Setting value for key '${key}'`)
    try {
      this.cache.set(key, value)
      localStorage.setItem(key, JSON.stringify(value))
      console.log(`StorageService: Successfully set value for key '${key}'`)
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
