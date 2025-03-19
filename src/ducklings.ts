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
    pattern: 'amazon',
    bangCommand: 'raw',
    targetValue: 'https://amazon.com/',
    description: 'Navigate to Amazon'
  },
  {
    pattern: 'caniuse',
    bangCommand: 'raw',
    targetValue: 'https://caniuse.com/',
    description: 'Check browser compatibility for HTML, CSS, and JavaScript features'
  },
  {
    pattern: 'chatgpt',
    bangCommand: 'raw',
    targetValue: 'https://chat.openai.com/',
    description: 'Navigate to ChatGPT'
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
    pattern: 'drive',
    bangCommand: 'raw',
    targetValue: 'https://drive.google.com/',
    description: 'Navigate to Google Drive'
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
    pattern: 'gitlab',
    bangCommand: 'raw',
    targetValue: 'https://gitlab.com/',
    description: 'Navigate to GitLab website'
  },
  {
    pattern: 'gmail',
    bangCommand: 'raw',
    targetValue: 'https://mail.google.com/',
    description: 'Navigate to Gmail'
  },
  {
    pattern: 'jujutsu',
    bangCommand: 'ghr',
    targetValue: 'jj-vcs/jj',
    description: 'Navigate to Jujutsu'
  },
  {
    pattern: 'linkedin',
    bangCommand: 'raw',
    targetValue: 'https://linkedin.com/',
    description: 'Navigate to LinkedIn'
  },
  {
    pattern: 'mdn',
    bangCommand: 'raw',
    targetValue: 'https://developer.mozilla.org/',
    description: 'Navigate to Mozilla Developer Network (MDN) documentation'
  },
  {
    pattern: 'nextjs',
    bangCommand: 'raw',
    targetValue: 'https://nextjs.org/docs',
    description: 'Navigate to Next.js documentation'
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
    pattern: 'react',
    bangCommand: 'raw',
    targetValue: 'https://react.dev/',
    description: 'Navigate to React documentation'
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
    pattern: 'spotify',
    bangCommand: 'raw',
    targetValue: 'https://open.spotify.com/',
    description: 'Navigate to Spotify'
  },
  {
    pattern: 'stackoverflow',
    bangCommand: 'raw',
    targetValue: 'https://stackoverflow.com/',
    description: 'Search Stack Overflow for programming questions'
  },
  {
    pattern: 't3',
    bangCommand: 'raw',
    targetValue: 'https://t3.chat/chat',
    description: 'Navigate to the T3 Chat website'
  },
  {
    pattern: 'tailwind',
    bangCommand: 'raw',
    targetValue: 'https://tailwindcss.com/docs',
    description: 'Navigate to Tailwind CSS documentation'
  },
  {
    pattern: 'twitter',
    bangCommand: 'raw',
    targetValue: 'https://twitter.com/',
    description: 'Navigate to Twitter/X'
  },
  {
    pattern: 'typescript',
    bangCommand: 'raw',
    targetValue: 'https://www.typescriptlang.org/docs/',
    description: 'Navigate to TypeScript documentation'
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
  },
  {
    pattern: 'vscode',
    bangCommand: 'raw',
    targetValue: 'https://code.visualstudio.com/',
    description: 'Navigate to Visual Studio Code website'
  },
  {
    pattern: 'youtube',
    bangCommand: 'raw',
    targetValue: 'https://youtube.com/',
    description: 'Navigate to YouTube'
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

  // Check if the query is a single word
  const isSingleWord = !query.includes(' ')

  // Check for exact matches only for single word queries
  if (isSingleWord) {
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
  }

  // Then check for pattern + space matches, but only if the pattern isn't just part of a multi-word query
  for (const duckling of ducklings) {
    console.log(
      `Checking prefix match: '${query}' startsWith '${duckling.pattern} '`,
      query.startsWith(duckling.pattern + ' ')
    )
    // Only match if the pattern is followed by a space or it's an exact match (already checked above)
    if (query.startsWith(duckling.pattern + ' ')) {
      const additionalQuery = query.slice(duckling.pattern.length + 1)

      // If the additional query contains another Duckling's pattern, don't match this as a Duckling+space
      // This is to prevent matching "github vs gitlab" as a "github" Duckling + "vs gitlab" search
      if (isSingleWord || !ducklings.some((d) => additionalQuery.includes(d.pattern))) {
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
