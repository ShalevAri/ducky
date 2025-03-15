import { matchDuckling } from '../../ducklings'
import { type Bang } from '../../types/bangs'
import { type DuckyIsland } from '../../types/islands'
import { StorageService } from '../storage/StorageService'

export class RedirectService {
  private static instance: RedirectService
  private bangCache: Map<string, string | null>
  private ducklingMatchCache: Map<string, { bangCommand: string; remainingQuery: string } | null>
  private storage: StorageService

  private constructor() {
    this.bangCache = new Map()
    this.ducklingMatchCache = new Map()
    this.storage = StorageService.getInstance()
  }

  static getInstance(): RedirectService {
    if (!RedirectService.instance) {
      RedirectService.instance = new RedirectService()
    }
    return RedirectService.instance
  }

  private static readonly BANG_REGEX = /!(\S+)/i
  private static readonly BANG_REPLACE_REGEX = /!\S+\s*/i
  private static readonly FEELING_LUCKY_REGEX = /^!$/i

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
    if (!query) return null

    if (this.bangCache.has(query)) {
      return this.bangCache.get(query) ?? null
    }

    const bangMatch = RedirectService.BANG_REGEX.exec(query)

    if (bangMatch) {
      const bangWithIslandCandidate = bangMatch?.[1]?.toLowerCase() ?? ''

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

      const cleanQuery = query.replace(RedirectService.BANG_REPLACE_REGEX, '').trim()
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
  }

  doRedirect(
    defaultBang: Bang,
    duckyIslandKeys: string[],
    renderDefaultPage: () => void,
    duckyIslandsData?: Record<string, DuckyIsland>,
    bangs: Record<string, Bang>
  ): void {
    const url = new URL(window.location.href)
    const query = url.searchParams.get('q')?.trim() ?? ''

    if (!query) {
      renderDefaultPage()
      return
    }

    if (RedirectService.FEELING_LUCKY_REGEX.test(query)) {
      const searchUrl = this.getBangRedirectUrl(query.slice(1), defaultBang, {}, bangs)
      if (!searchUrl) return

      window.location.href = searchUrl
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
    if (!searchUrl) return

    window.location.replace(searchUrl)
  }
}
