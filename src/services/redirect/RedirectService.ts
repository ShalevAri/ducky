import { matchDuckling } from '../../ducklings'
import { bangs } from '../../hashbang'
import { type Bang } from '../../types/bangs'
import { type DuckyIsland } from '../../types/islands'
import { PerformanceMonitor } from '../../utils/performance'
import { SuperCacheService } from '../cache/SuperCacheService'
import { StorageService } from '../storage/StorageService'
import { renderRedirectPage } from '../ui/RedirectPage'

export class RedirectService {
  private static instance: RedirectService
  private bangCache: Map<string, string | null>
  private ducklingMatchCache: Map<string, { bangCommand: string; remainingQuery: string } | null>
  private performanceMonitor: PerformanceMonitor
  private superCache: SuperCacheService
  private storage: StorageService

  private constructor() {
    this.bangCache = new Map()
    this.ducklingMatchCache = new Map()
    this.performanceMonitor = PerformanceMonitor.getInstance()
    this.superCache = SuperCacheService.getInstance()
    this.storage = StorageService.getInstance()
  }

  static getInstance(): RedirectService {
    if (!RedirectService.instance) {
      RedirectService.instance = new RedirectService()
    }
    return RedirectService.instance
  }

  private static readonly BANG_REGEX = /!(\S+)|(\S+)!/i
  private static readonly BANG_REPLACE_REGEX = /!(\S+)\s*|(\S+)!\s*/i
  private static readonly FEELING_LUCKY_REGEX = /^!$/i
  private static readonly DOUBLE_BANG_REGEX = /^!!\s*(?:(\.\w+)\s+)?(\S+?)\/(\S+)/i

  updateRecentBangs(bangName: string): void {
    if (!bangName) return

    let recentBangs = this.storage.get<string[]>('recent-bangs', [])

    const index = recentBangs.indexOf(bangName)
    if (index > -1) {
      recentBangs.splice(index, 1)
    }

    recentBangs.unshift(bangName)
    recentBangs = recentBangs.slice(0, 5)

    this.storage.set('recent-bangs', recentBangs)
  }

  getBangRedirectUrl(
    query: string,
    defaultBang: Bang,
    duckyIslands: Record<string, DuckyIsland>,
    bangs: Record<string, Bang>
  ): string | null {
    const startTime = performance.now()
    let result: string | null = null

    try {
      if (!query) return null

      const doubleBangMatch = RedirectService.DOUBLE_BANG_REGEX.exec(query)
      if (doubleBangMatch) {
        const specifiedTld = doubleBangMatch[1]
        const domainPart = doubleBangMatch[2]
        const path = doubleBangMatch[3]

        if (domainPart && path) {
          const tld = specifiedTld || '.com'
          const result = `https://${domainPart}${tld}/${path}`
          this.bangCache.set(query, result)
          return result
        }
      }

      if (this.bangCache.has(query)) {
        result = this.bangCache.get(query) ?? null
        return result
      }

      const bangMatch = RedirectService.BANG_REGEX.exec(query)

      if (bangMatch) {
        const bangWithIslandCandidate = (bangMatch?.[1] || bangMatch?.[2])?.toLowerCase() ?? ''

        let bangCandidate = bangWithIslandCandidate
        let islandKey = ''
        let injectionPrompt = ''

        for (const key of Object.keys(duckyIslands)) {
          if (bangWithIslandCandidate.endsWith(key) && bangWithIslandCandidate.length > key.length) {
            bangCandidate = bangWithIslandCandidate.slice(0, -key.length)
            islandKey = key
            injectionPrompt = duckyIslands[key].prompt
            break
          }
        }

        const selectedBang = bangs[bangCandidate] ?? defaultBang

        if (bangCandidate && bangs[bangCandidate]) {
          setTimeout(() => this.updateRecentBangs(bangCandidate), 0)
        }

        let cleanQuery: string
        if (bangMatch[1]) {
          cleanQuery = query.replace(RedirectService.BANG_REPLACE_REGEX, '').trim()
        } else {
          cleanQuery = query.replace(bangWithIslandCandidate + '!', '').trim()
        }

        if (cleanQuery === '') {
          const result = selectedBang ? `https://${selectedBang.d}` : null
          this.bangCache.set(query, result)
          return result
        }

        const finalQuery = islandKey ? `${injectionPrompt}${cleanQuery}` : cleanQuery
        const searchUrl = selectedBang.u.replace('{{{s}}}', encodeURIComponent(finalQuery).replace(/%2F/g, '/'))

        if (!searchUrl) return null

        this.bangCache.set(query, searchUrl)
        return searchUrl
      } else {
        let ducklingMatch = this.ducklingMatchCache.get(query)

        if (!ducklingMatch) {
          ducklingMatch = matchDuckling(query)
          this.ducklingMatchCache.set(query, ducklingMatch)
        }

        if (ducklingMatch) {
          const { bangCommand, remainingQuery } = ducklingMatch

          if (bangCommand === 'raw') {
            this.bangCache.set(query, remainingQuery)
            return remainingQuery
          }

          if (bangCommand === 'none') {
            const searchUrl = defaultBang.u.replace('{{{s}}}', encodeURIComponent(remainingQuery).replace(/%2F/g, '/'))
            this.bangCache.set(query, searchUrl)
            return searchUrl
          }

          if (!bangs[bangCommand]) {
            const searchUrl = defaultBang.u.replace('{{{s}}}', encodeURIComponent(query).replace(/%2F/g, '/'))
            this.bangCache.set(query, searchUrl)
            return searchUrl
          }

          setTimeout(() => this.updateRecentBangs(bangCommand), 0)

          const searchUrl = bangs[bangCommand].u.replace(
            '{{{s}}}',
            encodeURIComponent(remainingQuery).replace(/%2F/g, '/')
          )
          this.bangCache.set(query, searchUrl)
          return searchUrl
        }

        const searchUrl = defaultBang.u.replace('{{{s}}}', encodeURIComponent(query).replace(/%2F/g, '/'))
        this.bangCache.set(query, searchUrl)
        return searchUrl
      }
    } finally {
      const duration = performance.now() - startTime
      if (result) {
        this.performanceMonitor.recordTiming(result, duration)
      }
    }
  }

  doRedirect(
    defaultBang: Bang,
    duckyIslandKeys: string[],
    renderDefaultPage: () => void,
    duckyIslandsData: Record<string, DuckyIsland> | undefined,
    bangs: Record<string, Bang>
  ): void {
    const startTime = performance.now()

    try {
      const url = new URL(window.location.href)
      const query = url.searchParams.get('q')?.trim() ?? ''

      if (!query) {
        renderDefaultPage()
        return
      }

      if (query !== '!!' && query.trim() !== '') {
        localStorage.setItem('last-search', query)
      }

      if (query === '!!') {
        const lastSearch = localStorage.getItem('last-search')
        if (lastSearch) {
          window.location.href = `${window.location.origin}${window.location.pathname}?q=${encodeURIComponent(lastSearch)}`
          return
        }
      }

      const cachedUrl = this.superCache.get(query)
      if (cachedUrl) {
        renderRedirectPage(cachedUrl)
        return
      }

      if (RedirectService.FEELING_LUCKY_REGEX.test(query)) {
        const searchUrl = this.getBangRedirectUrl(query.slice(1), defaultBang, {}, bangs)
        if (!searchUrl) {
          return
        }

        this.superCache.set(query, searchUrl)
        renderRedirectPage(searchUrl)
        return
      }

      const duckyIslands =
        duckyIslandsData ??
        duckyIslandKeys.reduce(
          (acc, key) => {
            acc[key] = { key, name: key, prompt: '' }
            return acc
          },
          {} as Record<string, DuckyIsland>
        )

      const searchUrl = this.getBangRedirectUrl(query, defaultBang, duckyIslands, bangs)

      if (!searchUrl) {
        return
      }

      this.superCache.set(query, searchUrl)
      renderRedirectPage(searchUrl)
    } finally {
      const duration = performance.now() - startTime
      this.performanceMonitor.recordTiming('Redirect Operation', duration)
    }
  }
}
