import { matchDuckling } from './ducklings.ts'
import { bangs } from './hashbang.ts'
import { type Bang } from './types/bangs.ts'
import { type DuckyIsland } from './types/islands.ts'
import { loadFromLocalStorage, saveToLocalStorage } from './utils/storage.ts'

// Cache for bang redirects
const bangRedirectCache = new Map<string, string | null>()
const ducklingMatchCache = new Map<string, { bangCommand: string; remainingQuery: string } | null>()

// Regular expressions for bang detection
export const BANG_REGEX = /!(\S+)/i
export const FEELING_LUCKY_REGEX = /!(?:\s|$)/i
export const BANG_REPLACE_REGEX = /!\S+\s*/i

/**
 * Updates the list of recently used bangs
 */
export function updateRecentBangs(bangName: string): void {
  if (!bangName) return

  let recentBangs = loadFromLocalStorage('recent-bangs', [] as string[])

  const index = recentBangs.indexOf(bangName)
  if (index > -1) {
    recentBangs.splice(index, 1)
  }

  recentBangs.unshift(bangName)
  recentBangs = recentBangs.slice(0, 5)

  saveToLocalStorage('recent-bangs', recentBangs)
}

/**
 * Returns the redirect URL for a bang search
 */
export function getBangRedirectUrl(
  query: string,
  defaultBang: Bang,
  duckyIslands: Record<string, DuckyIsland>
): string | null {
  if (!query) {
    return null
  }
  if (bangRedirectCache.has(query)) {
    const cachedResult = bangRedirectCache.get(query)
    return cachedResult !== undefined ? cachedResult : null
  }

  const bangMatch = BANG_REGEX.exec(query)

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
      setTimeout(() => updateRecentBangs(bangCandidate), 0)
    }

    const cleanQuery = query.replace(BANG_REPLACE_REGEX, '').trim()
    if (cleanQuery === '') {
      const result = selectedBang ? `https://${selectedBang.d}` : null
      bangRedirectCache.set(query, result)
      return result
    }

    const finalQuery = islandKey ? `${injectionPrompt}${cleanQuery}` : cleanQuery

    const searchUrl = selectedBang.u.replace('{{{s}}}', encodeURIComponent(finalQuery).replace(/%2F/g, '/'))
    if (!searchUrl) return null

    bangRedirectCache.set(query, searchUrl)
    return searchUrl
  } else {
    let ducklingMatch
    if (ducklingMatchCache.has(query)) {
      ducklingMatch = ducklingMatchCache.get(query)
    } else {
      ducklingMatch = matchDuckling(query)
      ducklingMatchCache.set(query, ducklingMatch)
    }

    if (ducklingMatch) {
      const { bangCommand, remainingQuery } = ducklingMatch

      if (bangCommand === 'raw') {
        bangRedirectCache.set(query, remainingQuery)
        return remainingQuery
      }

      if (!bangs[bangCommand]) {
        const searchUrl = defaultBang.u.replace('{{{s}}}', encodeURIComponent(query).replace(/%2F/g, '/'))
        bangRedirectCache.set(query, searchUrl)
        return searchUrl
      }
      setTimeout(() => updateRecentBangs(bangCommand), 0)

      const searchUrl = bangs[bangCommand].u.replace('{{{s}}}', encodeURIComponent(remainingQuery).replace(/%2F/g, '/'))
      bangRedirectCache.set(query, searchUrl)
      return searchUrl
    }

    const searchUrl = defaultBang.u.replace('{{{s}}}', encodeURIComponent(query).replace(/%2F/g, '/'))
    bangRedirectCache.set(query, searchUrl)
    return searchUrl
  }
}

/**
 * Returns the redirect URL for a 'feeling lucky' search
 */
export function feelingLuckyRedirect(query: string): string {
  const cacheKey = `lucky:${query}`
  if (bangRedirectCache.has(cacheKey)) {
    return bangRedirectCache.get(cacheKey)!
  }

  const cleanQuery = query.replace('!', '').trim()
  const url = `https://duckduckgo.com/?q=!ducky+${encodeURIComponent(cleanQuery)}`

  bangRedirectCache.set(cacheKey, url)
  return url
}

/**
 * Performs the redirect based on the current URL query
 */
export function doRedirect(
  defaultBang: { u: string },
  duckyIslandKeys: string[],
  renderDefaultPage: () => void,
  duckyIslandsData?: Record<string, DuckyIsland>
): void {
  const url = new URL(window.location.href)
  const query = url.searchParams.get('q')?.trim() ?? ''
  if (!query) {
    renderDefaultPage()
    return
  }

  const isLucky = FEELING_LUCKY_REGEX.test(query)
  if (isLucky) {
    const searchUrl = feelingLuckyRedirect(query)
    if (!searchUrl) return

    window.location.href = searchUrl
    return
  }

  // If we have the duckyIslandsData, use it directly
  // Otherwise, convert the array of keys to an empty record
  const duckyIslands =
    duckyIslandsData ??
    duckyIslandKeys.reduce(
      (acc, key) => {
        acc[key] = { key, name: key, prompt: '' }
        return acc
      },
      {} as Record<string, DuckyIsland>
    )

  const searchUrl = getBangRedirectUrl(query, defaultBang as Bang, duckyIslands)
  if (!searchUrl) return

  window.location.replace(searchUrl)
}
