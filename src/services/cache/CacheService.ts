import { BaseSingleton } from '../base/BaseSingleton'

interface CacheEntry<T> {
  value: T
  expiresAt?: number
}

interface CacheOptions {
  expiryMs?: number
  persistent?: boolean
}

export class CacheService extends BaseSingleton<CacheService> {
  private memoryCache = new Map<string, CacheEntry<unknown>>()
  private static readonly DEFAULT_EXPIRY = 7 * 24 * 60 * 60 * 1000 // 7 days

  protected constructor() {
    super()
    this.loadPersistedCache()
  }

  get<T>(key: string, defaultValue: T, options: CacheOptions = {}): T {
    const memoryCacheEntry = this.memoryCache.get(key) as CacheEntry<T> | undefined
    if (memoryCacheEntry) {
      if (!memoryCacheEntry.expiresAt || memoryCacheEntry.expiresAt > Date.now()) {
        return memoryCacheEntry.value
      }
      this.memoryCache.delete(key)
    }

    if (options.persistent) {
      try {
        const persistedValue = localStorage.getItem(key)
        if (persistedValue) {
          const entry = JSON.parse(persistedValue) as CacheEntry<T>
          if (!entry.expiresAt || entry.expiresAt > Date.now()) {
            this.memoryCache.set(key, entry)
            return entry.value
          }
          localStorage.removeItem(key)
        }
      } catch (error) {
        console.error(`CacheService: Error reading from persistent storage for key '${key}'`, error)
      }
    }

    return defaultValue
  }

  set<T>(key: string, value: T, options: CacheOptions = {}): void {
    const entry: CacheEntry<T> = {
      value,
      expiresAt: options.expiryMs ? Date.now() + options.expiryMs : undefined
    }

    this.memoryCache.set(key, entry)

    if (options.persistent) {
      try {
        localStorage.setItem(key, JSON.stringify(entry))
      } catch (error) {
        console.error(`CacheService: Error writing to persistent storage for key '${key}'`, error)
      }
    }
  }

  remove(key: string): void {
    this.memoryCache.delete(key)
    localStorage.removeItem(key)
  }

  clear(): void {
    this.memoryCache.clear()
    localStorage.clear()
  }

  private loadPersistedCache(): void {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          const value = localStorage.getItem(key)
          if (value) {
            const entry = JSON.parse(value) as CacheEntry<unknown>
            if (!entry.expiresAt || entry.expiresAt > Date.now()) {
              this.memoryCache.set(key, entry)
            } else {
              localStorage.removeItem(key)
            }
          }
        }
      }
    } catch (error) {
      console.error('CacheService: Error loading persisted cache', error)
    }
  }
}
