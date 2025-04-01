import { DucklingService } from '../ducklings/DucklingService'
import { LoggingService } from '../logging/LoggingService'
import { StorageService } from '../storage/StorageService'

/**
 * Structure for a cache entry in the SuperCacheService
 */
export interface CacheEntry {
  /** The search query that was cached */
  query: string
  /** The URL that was generated/resolved for the query */
  url: string
  /** Timestamp when the entry was created */
  timestamp: number
}

/**
 * Advanced caching service for managing URL resolutions and search queries
 * Implements the Singleton pattern to ensure consistent caching across the application
 */
export class SuperCacheService {
  private static _instance: SuperCacheService | null = null
  private static readonly CACHE_KEY = 'ducky-super-cache'
  private static readonly MAX_ENTRIES = 100 // Store last 100 searches
  private static readonly CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000 // 7 days

  private cache: Map<string, CacheEntry>
  private storage: StorageService
  private logger: LoggingService
  private ducklingService: DucklingService

  /**
   * Private constructor to prevent direct instantiation
   * Initializes required services
   */
  private constructor() {
    this.cache = new Map()
    this.storage = StorageService.getInstance()
    this.logger = LoggingService.getInstance()
    this.ducklingService = DucklingService.getInstance()
    this.loadCache()
  }

  /**
   * Gets the singleton instance of SuperCacheService
   * @returns The SuperCacheService instance
   */
  public static getInstance(): SuperCacheService {
    SuperCacheService._instance ??= new SuperCacheService()
    return SuperCacheService._instance
  }

  isEnabled(): boolean {
    return this.storage.get('ENABLE_SUPER_CACHE', false)
  }

  get(query: string): string | null {
    if (!this.isEnabled()) {
      return null
    }

    // Check if there's a matching Duckling first
    const ducklingMatch = this.ducklingService.matchDuckling(query)
    if (ducklingMatch) {
      this.logger.debug('Duckling match found, bypassing cache', 'SuperCache', { query })
      return null
    }

    const entry = this.cache.get(query)
    if (!entry) {
      return null
    }

    if (Date.now() - entry.timestamp > SuperCacheService.CACHE_EXPIRY) {
      this.logger.debug('Cache entry expired', 'SuperCache', { query })
      this.cache.delete(query)
      return null
    }

    this.logger.debug('Cache hit', 'SuperCache', { query, url: entry.url })
    return entry.url
  }

  set(query: string, url: string): void {
    if (!this.isEnabled()) {
      return
    }

    const entry: CacheEntry = {
      query,
      url,
      timestamp: Date.now()
    }

    this.cache.set(query, entry)
    this.logger.debug('Cache entry set', 'SuperCache', { query, url })

    if (this.cache.size > SuperCacheService.MAX_ENTRIES) {
      let oldestKey = ''
      let oldestTimestamp = Infinity

      for (const [key, value] of this.cache.entries()) {
        if (value.timestamp < oldestTimestamp) {
          oldestTimestamp = value.timestamp
          oldestKey = key
        }
      }

      if (oldestKey) {
        this.cache.delete(oldestKey)
        this.logger.debug('Removed oldest cache entry', 'SuperCache', { query: oldestKey })
      }
    }

    this.saveCache()
  }

  clear(): void {
    this.cache.clear()
    this.saveCache()
    this.logger.info('Cache cleared', 'SuperCache')
  }

  private loadCache(): void {
    try {
      const cached = localStorage.getItem(SuperCacheService.CACHE_KEY)
      if (cached) {
        const entries = JSON.parse(cached) as CacheEntry[]
        entries.forEach((entry) => this.cache.set(entry.query, entry))
        this.logger.debug('Cache loaded from storage', 'SuperCache', { entryCount: entries.length })
      }
    } catch (error) {
      this.logger.error('Failed to load cache from storage', 'SuperCache', error)
      this.cache.clear()
    }
  }

  private saveCache(): void {
    try {
      const entries = Array.from(this.cache.values())
      localStorage.setItem(SuperCacheService.CACHE_KEY, JSON.stringify(entries))
      this.logger.debug('Cache saved to storage', 'SuperCache', { entryCount: entries.length })
    } catch (error) {
      this.logger.error('Failed to save cache to storage', 'SuperCache', error)
    }
  }
}
