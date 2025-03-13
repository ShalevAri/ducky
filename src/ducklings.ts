export interface Duckling {
  pattern: string // The pattern to match (e.g., "ducky")
  bangCommand: string // The bang command (e.g., "ghr")
  targetValue: string // The value to be used with the bang command (e.g., "shalevari/ducky")
  description: string // A description of what this duckling does
}

// Cache for duckling patterns to avoid repeated localStorage access
let ducklingsCache: Duckling[] | null = null
let ducklingMatchResultCache = new Map<string, { bangCommand: string; remainingQuery: string } | null>()

// Load ducklings from localStorage
export function loadDucklings(): Duckling[] {
  const ducklings = localStorage.getItem('ducky-ducklings')
  if (!ducklings) return []
  try {
    // Handle backward compatibility for older duckling format
    const parsedDucklings = JSON.parse(ducklings)
    return parsedDucklings.map((duckling: any) => {
      // If it's an old format duckling (no targetValue), set targetValue to pattern
      if (!duckling.targetValue) {
        return {
          ...duckling,
          targetValue: duckling.pattern
        }
      }
      return duckling
    })
  } catch (e) {
    console.error('Failed to parse ducklings', e)
    return []
  }
}

// Save ducklings to localStorage
export function saveDucklings(ducklings: Duckling[]): void {
  localStorage.setItem('ducky-ducklings', JSON.stringify(ducklings))
  // Clear cache when ducklings are updated
  ducklingsCache = null
  ducklingMatchResultCache.clear()
}

// Initial default ducklings
export const defaultDucklings: Duckling[] = [
  {
    pattern: 'ducky',
    bangCommand: 'ghr',
    targetValue: 'shalevari/ducky',
    description: 'Go to the Ducky GitHub repository'
  }
]

// Load ducklings with caching
function getCachedDucklings(): Duckling[] {
  if (ducklingsCache !== null) {
    return ducklingsCache
  }

  const ducklings = loadDucklings()
  ducklingsCache = ducklings
  return ducklings
}

// Check if a query matches any duckling pattern
export function matchDuckling(query: string): { bangCommand: string; remainingQuery: string } | null {
  // Check cache first
  if (ducklingMatchResultCache.has(query)) {
    return ducklingMatchResultCache.get(query) || null
  }

  const ducklings = getCachedDucklings()
  let result: { bangCommand: string; remainingQuery: string } | null = null

  // First, check for exact matches which are faster
  for (const duckling of ducklings) {
    if (query === duckling.pattern) {
      result = {
        bangCommand: duckling.bangCommand,
        remainingQuery: duckling.targetValue
      }
      ducklingMatchResultCache.set(query, result)
      return result
    }
  }

  // Then check prefix matches
  for (const duckling of ducklings) {
    if (query.startsWith(duckling.pattern + ' ')) {
      const additionalQuery = query.slice(duckling.pattern.length + 1)
      const remainingQuery = duckling.targetValue + ' ' + additionalQuery
      result = { bangCommand: duckling.bangCommand, remainingQuery }
      ducklingMatchResultCache.set(query, result)
      return result
    }
  }

  // Cache negative results too
  ducklingMatchResultCache.set(query, null)
  return null
}

// Render the ducklings management UI
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
