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

  if (ducklings.length === 0) {
    return [...defaultDucklings]
  }

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
    pattern: 'clerk',
    bangCommand: 'raw',
    targetValue: 'https://clerk.com/',
    description: 'Navigate to Clerk'
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
    pattern: 'nixpkgs',
    bangCommand: 'raw',
    targetValue: 'https://search.nixos.org/packages',
    description: 'Search Nix Packages'
  },
  {
    pattern: 'npm',
    bangCommand: 'raw',
    targetValue: 'https://www.npmjs.com/',
    description: 'Search NPM packages'
  },
  {
    pattern: 'ollama',
    bangCommand: 'raw',
    targetValue: 'https://ollama.com/',
    description: 'Navigate to Ollama'
  },
  {
    pattern: 'posthog',
    bangCommand: 'raw',
    targetValue: 'https://posthog.com/',
    description: 'Navigate to the PostHog website'
  },
  {
    pattern: 'protondb',
    bangCommand: 'raw',
    targetValue: 'https://www.protondb.com/',
    description: 'Navigate to ProtonDB'
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
    return ducklingsCache
  }

  const ducklings = loadDucklings()
  ducklingsCache = ducklings
  return ducklings
}

export function matchDuckling(query: string): { bangCommand: string; remainingQuery: string } | null {
  if (ducklingMatchResultCache.has(query)) {
    const cachedResult = ducklingMatchResultCache.get(query)
    return cachedResult ?? null
  }

  if (query.startsWith('\\')) {
    const searchQuery = query.slice(1)
    const result = {
      bangCommand: 'none',
      remainingQuery: searchQuery
    }

    if (ducklingMatchResultCache.size >= CACHE_SIZE_LIMIT) {
      const firstKey = Array.from(ducklingMatchResultCache.keys())[0]
      ducklingMatchResultCache.delete(firstKey)
    }

    ducklingMatchResultCache.set(query, result)
    return result
  }

  const ducklings = getCachedDucklings()
  let result: { bangCommand: string; remainingQuery: string } | null = null

  const isSingleWord = !query.includes(' ')

  if (isSingleWord) {
    for (const duckling of ducklings) {
      if (query === duckling.pattern) {
        result = {
          bangCommand: duckling.bangCommand,
          remainingQuery: duckling.targetValue
        }

        if (ducklingMatchResultCache.size >= CACHE_SIZE_LIMIT) {
          const firstKey = Array.from(ducklingMatchResultCache.keys())[0]
          ducklingMatchResultCache.delete(firstKey)
        }

        ducklingMatchResultCache.set(query, result)
        return result
      }
    }
  }

  for (const duckling of ducklings) {
    if (query.startsWith(duckling.pattern + ' ')) {
      const additionalQuery = query.slice(duckling.pattern.length + 1)

      if (isSingleWord || !ducklings.some((d) => additionalQuery.includes(d.pattern))) {
        const remainingQuery = duckling.targetValue + ' ' + additionalQuery
        result = { bangCommand: duckling.bangCommand, remainingQuery }

        if (ducklingMatchResultCache.size >= CACHE_SIZE_LIMIT) {
          const firstKey = Array.from(ducklingMatchResultCache.keys())[0]
          ducklingMatchResultCache.delete(firstKey)
        }

        ducklingMatchResultCache.set(query, result)
        return result
      }
    }
  }

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
