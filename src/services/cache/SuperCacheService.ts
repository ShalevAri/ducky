export interface CacheEntry {
  query: string
  url: string
  timestamp: number
}

export class SuperCacheService {
  private static instance: SuperCacheService
  private static readonly CACHE_KEY = 'ducky-super-cache'
  private static readonly MAX_ENTRIES = 100 // Store last 100 searches
  private static readonly CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000 // 7 days

  private cache: Map<string, CacheEntry>

  private constructor() {
    this.cache = new Map()
    this.loadCache()
  }

  public static getInstance(): SuperCacheService {
    if (!SuperCacheService.instance) {
      SuperCacheService.instance = new SuperCacheService()
    }
    return SuperCacheService.instance
  }

  public isEnabled(): boolean {
    return localStorage.getItem('ENABLE_SUPER_CACHE') === 'true'
  }

  public getCachedUrl(query: string): string | null {
    if (!this.isEnabled()) return null

    const entry = this.cache.get(query)
    if (!entry) return null

    // Check if cache entry is expired
    if (Date.now() - entry.timestamp > SuperCacheService.CACHE_EXPIRY) {
      this.cache.delete(query)
      this.saveCache()
      return null
    }

    return entry.url
  }

  public cacheUrl(query: string, url: string): void {
    if (!this.isEnabled()) return

    // Remove oldest entry if cache is full
    if (this.cache.size >= SuperCacheService.MAX_ENTRIES) {
      const oldestKey = Array.from(this.cache.keys())[0]
      this.cache.delete(oldestKey)
    }

    this.cache.set(query, {
      query,
      url,
      timestamp: Date.now()
    })

    this.saveCache()
  }

  private loadCache(): void {
    try {
      const cached = localStorage.getItem(SuperCacheService.CACHE_KEY)
      if (cached) {
        const entries = JSON.parse(cached) as CacheEntry[]
        entries.forEach((entry) => this.cache.set(entry.query, entry))
      }
    } catch (e) {
      console.error('Failed to load super cache:', e)
      this.cache.clear()
    }
  }

  private saveCache(): void {
    try {
      const entries = Array.from(this.cache.values())
      localStorage.setItem(SuperCacheService.CACHE_KEY, JSON.stringify(entries))
    } catch (e) {
      console.error('Failed to save super cache:', e)
    }
  }
}
