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
  console.log(`Loading ducklings from localStorage`)
  const ducklings = loadFromLocalStorage<Duckling[]>('ducky-ducklings', [])
  console.log(`Loaded ${ducklings.length} ducklings from localStorage`)

  // If no ducklings are loaded, initialize with default ducklings
  if (ducklings.length === 0) {
    console.log(`No ducklings found, returning default ducklings`)
    return [...defaultDucklings]
  }

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
    pattern: '21st',
    bangCommand: 'raw',
    targetValue: 'https://21st.dev/?tab=components&sort=recommended',
    description: 'Navigate to the 21st website'
  },
  {
    pattern: 'codepen',
    bangCommand: 'raw',
    targetValue: 'https://codepen.io/',
    description: 'Navigate to CodePen'
  },
  {
    pattern: 'cursor',
    bangCommand: 'raw',
    targetValue: 'https://cursor.com/',
    description: 'Navigate to Cursor'
  },
  {
    pattern: 'devdocs',
    bangCommand: 'raw',
    targetValue: 'https://devdocs.io/',
    description: 'Search DevDocs API documentation'
  },
  {
    pattern: 'ducky',
    bangCommand: 'ghr',
    targetValue: 'ShalevAri/ducky',
    description: 'Go to the Ducky GitHub repository'
  },
  {
    pattern: 'duckylocal',
    bangCommand: 'raw',
    targetValue: 'http://localhost:49152/',
    description: 'Navigate to the local Ducky server'
  },
  {
    pattern: 'figma',
    bangCommand: 'raw',
    targetValue: 'https://figma.com/',
    description: 'Navigate to Figma'
  },
  {
    pattern: 'github',
    bangCommand: 'raw',
    targetValue: 'https://github.com/',
    description: 'Navigate to the GitHub website'
  },
  {
    pattern: 'mdn',
    bangCommand: 'raw',
    targetValue: 'https://developer.mozilla.org/',
    description: 'Navigate to Mozilla Developer Network (MDN) documentation'
  },
  {
    pattern: 'npm',
    bangCommand: 'raw',
    targetValue: 'https://www.npmjs.com/',
    description: 'Search NPM packages'
  },
  {
    pattern: 'posthog',
    bangCommand: 'raw',
    targetValue: 'https://posthog.com/',
    description: 'Navigate to the PostHog website'
  },
  {
    pattern: 'reddit',
    bangCommand: 'raw',
    targetValue: 'https://reddit.com/',
    description: 'Navigate to the Reddit website'
  },
  {
    pattern: 'shadcn',
    bangCommand: 'raw',
    targetValue: 'https://ui.shadcn.com/',
    description: 'Navigate to the Shadcn UI website'
  },
  {
    pattern: 't3',
    bangCommand: 'raw',
    targetValue: 'https://t3.chat/chat',
    description: 'Navigate to the T3 Chat website'
  },
  {
    pattern: 'unduck',
    bangCommand: 'ghr',
    targetValue: 't3dotgg/unduck',
    description: 'Go to the unduck GitHub repository'
  },
  {
    pattern: 'vercel',
    bangCommand: 'raw',
    targetValue: 'https://vercel.com/',
    description: 'Navigate to the Vercel website'
  }
]

function getCachedDucklings(): Duckling[] {
  if (ducklingsCache !== null) {
    console.log(`Using cached ducklings (${ducklingsCache.length} items)`)
    return ducklingsCache
  }

  console.log(`No duckling cache found, loading from storage`)
  const ducklings = loadDucklings()
  ducklingsCache = ducklings
  return ducklings
}

export function matchDuckling(query: string): { bangCommand: string; remainingQuery: string } | null {
  // Debug issues with duckling matching
  console.log(`Duckling match attempt for: '${query}'`)

  // Check cache but leave debugging in place
  if (ducklingMatchResultCache.has(query)) {
    const cachedResult = ducklingMatchResultCache.get(query)
    console.log(`Using cached result for '${query}':`, cachedResult)
    return cachedResult ?? null
  }

  // If the query starts with a backslash, strip it and use default search
  if (query.startsWith('\\')) {
    const searchQuery = query.slice(1) // Remove the backslash
    const result = {
      bangCommand: 'none', // Special marker for default search
      remainingQuery: searchQuery // The query without the backslash
    }
    console.log(`Backslash search result:`, result)

    // Manage cache size
    if (ducklingMatchResultCache.size >= CACHE_SIZE_LIMIT) {
      const firstKey = Array.from(ducklingMatchResultCache.keys())[0]
      ducklingMatchResultCache.delete(firstKey)
    }

    ducklingMatchResultCache.set(query, result)
    return result
  }

  const ducklings = getCachedDucklings()
  console.log(
    `Loaded ${ducklings.length} ducklings with patterns:`,
    ducklings.map((d) => d.pattern)
  )
  let result: { bangCommand: string; remainingQuery: string } | null = null

  // Check for exact matches first
  for (const duckling of ducklings) {
    console.log(`Checking exact match: '${query}' === '${duckling.pattern}'`, query === duckling.pattern)
    if (query === duckling.pattern) {
      result = {
        bangCommand: duckling.bangCommand,
        remainingQuery: duckling.targetValue
      }
      console.log(`Exact match found:`, result)

      // Manage cache size
      if (ducklingMatchResultCache.size >= CACHE_SIZE_LIMIT) {
        const firstKey = Array.from(ducklingMatchResultCache.keys())[0]
        ducklingMatchResultCache.delete(firstKey)
      }

      ducklingMatchResultCache.set(query, result)
      return result
    }
  }

  // Then check for pattern + space matches
  for (const duckling of ducklings) {
    console.log(
      `Checking prefix match: '${query}' startsWith '${duckling.pattern} '`,
      query.startsWith(duckling.pattern + ' ')
    )
    if (query.startsWith(duckling.pattern + ' ')) {
      const additionalQuery = query.slice(duckling.pattern.length + 1)
      const remainingQuery = duckling.targetValue + ' ' + additionalQuery
      result = { bangCommand: duckling.bangCommand, remainingQuery }
      console.log(`Prefix match found:`, result)

      // Manage cache size
      if (ducklingMatchResultCache.size >= CACHE_SIZE_LIMIT) {
        const firstKey = Array.from(ducklingMatchResultCache.keys())[0]
        ducklingMatchResultCache.delete(firstKey)
      }

      ducklingMatchResultCache.set(query, result)
      return result
    }
  }

  console.log(`No duckling match found for: '${query}'`)

  // Manage cache size
  if (ducklingMatchResultCache.size >= CACHE_SIZE_LIMIT) {
    const firstKey = Array.from(ducklingMatchResultCache.keys())[0]
    ducklingMatchResultCache.delete(firstKey)
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
