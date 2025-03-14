import { loadFromLocalStorage, saveToLocalStorage } from './utils/storage.ts'

export interface Duckling {
  pattern: string // The pattern to match (e.g., "ducky")
  bangCommand: string // The bang command (e.g., "ghr")
  targetValue: string // The value to be used with the bang command (e.g., "shalevari/ducky")
  description: string // A description of what this duckling does
}

let ducklingsCache: Duckling[] | null = null
const CACHE_SIZE_LIMIT = 100
const ducklingMatchResultCache = new Map<string, { bangCommand: string; remainingQuery: string } | null>()

export function loadDucklings(): Duckling[] {
  const ducklings = loadFromLocalStorage<Duckling[]>('ducky-ducklings', [])
  // Migrate old ducklings that don't have targetValue
  return ducklings.map((duckling: Duckling) => {
    if (!duckling.targetValue) {
      return {
        ...duckling,
        targetValue: duckling.pattern
      }
    }
    return duckling
  })
}

export function saveDucklings(ducklings: Duckling[]): void {
  saveToLocalStorage('ducky-ducklings', ducklings)
  ducklingsCache = null
  ducklingMatchResultCache.clear()
}

export const defaultDucklings: Duckling[] = [
  {
    pattern: 'ducky',
    bangCommand: 'ghr',
    targetValue: 'ShalevAri/ducky',
    description: 'Go to the Ducky GitHub repository'
  },
  {
    pattern: 'unduck',
    bangCommand: 'ghr',
    targetValue: 't3dotgg/unduck',
    description: 'Go to the unduck GitHub repository'
  },
  {
    pattern: 'duckylocal',
    bangCommand: 'raw',
    targetValue: 'http://localhost:49152/',
    description: 'Navigate to the local Ducky server'
  },
  {
    pattern: 'github',
    bangCommand: 'raw',
    targetValue: 'https://github.com/',
    description: 'Navigate to the GitHub website'
  },
  {
    pattern: 't3',
    bangCommand: 'raw',
    targetValue: 'https://t3.chat/chat',
    description: 'Navigate to the T3 Chat website'
  },
  {
    pattern: 'posthog',
    bangCommand: 'raw',
    targetValue: 'https://posthog.com/',
    description: 'Navigate to the PostHog website'
  },
  {
    pattern: 'vercel',
    bangCommand: 'raw',
    targetValue: 'https://vercel.com/',
    description: 'Navigate to the Vercel website'
  },
  {
    pattern: 'shadcn',
    bangCommand: 'raw',
    targetValue: 'https://ui.shadcn.com/',
    description: 'Navigate to the Shadcn UI website'
  },
  {
    pattern: '21st',
    bangCommand: 'raw',
    targetValue: 'https://21st.co/',
    description: 'Navigate to the 21st website'
  }
]

function getCachedDucklings(): Duckling[] {
  if (ducklingsCache !== null) {
    return ducklingsCache
  }

  const ducklings = loadDucklings()
  ducklingsCache = ducklings
  return ducklings
}

export function matchDuckling(query: string): { bangCommand: string; remainingQuery: string } | null {
  if (ducklingMatchResultCache.has(query)) {
    return ducklingMatchResultCache.get(query) ?? null
  }

  const ducklings = getCachedDucklings()
  let result: { bangCommand: string; remainingQuery: string } | null = null

  for (const duckling of ducklings) {
    if (query === duckling.pattern) {
      result = {
        bangCommand: duckling.bangCommand,
        remainingQuery: duckling.targetValue
      }
      if (ducklingMatchResultCache.size >= CACHE_SIZE_LIMIT) {
        const firstKey = Array.from(ducklingMatchResultCache.keys())[0]
        if (firstKey) {
          ducklingMatchResultCache.delete(firstKey)
        }
      }
      ducklingMatchResultCache.set(query, result)
      return result
    }
  }

  for (const duckling of ducklings) {
    if (query.startsWith(duckling.pattern + ' ')) {
      const additionalQuery = query.slice(duckling.pattern.length + 1)
      const remainingQuery = duckling.targetValue + ' ' + additionalQuery
      result = { bangCommand: duckling.bangCommand, remainingQuery }
      if (ducklingMatchResultCache.size >= CACHE_SIZE_LIMIT) {
        const firstKey = Array.from(ducklingMatchResultCache.keys())[0]
        if (firstKey) {
          ducklingMatchResultCache.delete(firstKey)
        }
      }
      ducklingMatchResultCache.set(query, result)
      return result
    }
  }

  if (ducklingMatchResultCache.size >= CACHE_SIZE_LIMIT) {
    const firstKey = Array.from(ducklingMatchResultCache.keys())[0]
    if (firstKey) {
      ducklingMatchResultCache.delete(firstKey)
    }
  }
  ducklingMatchResultCache.set(query, null)
  return null
}

export function renderDucklingsList(): string {
  const ducklings = loadDucklings()

  if (ducklings.length === 0) {
    return '<p>No ducklings created yet.</p>'
  }

  return `
    <table class="ducklings-table">
      <thead>
        <tr>
          <th>Pattern</th>
          <th>Bang Command</th>
          <th>Target Value</th>
          <th>Description</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${ducklings
          .map(
            (duckling) => `
          <tr data-pattern="${duckling.pattern}">
            <td>${duckling.pattern}</td>
            <td>${duckling.bangCommand === 'raw' ? 'Direct URL' : '!' + duckling.bangCommand}</td>
            <td>${duckling.targetValue}</td>
            <td>${duckling.description}</td>
            <td>
              <button class="delete-duckling" data-pattern="${duckling.pattern}">Delete</button>
            </td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `
}
