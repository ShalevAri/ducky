export interface Duckling {
  pattern: string // The pattern to match (e.g., "ducky")
  bangCommand: string // The bang command (e.g., "ghr")
  targetValue: string // The value to be used with the bang command (e.g., "shalevari/ducky")
  description: string // A description of what this duckling does
}

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

// Check if a query matches any duckling pattern
export function matchDuckling(query: string): { bangCommand: string; remainingQuery: string } | null {
  const ducklings = loadDucklings()

  for (const duckling of ducklings) {
    // Check if the query is exactly the pattern, or starts with the pattern followed by a space
    if (query === duckling.pattern || query.startsWith(duckling.pattern + ' ')) {
      // If the query is exactly the pattern, return the bang command with the targetValue
      if (query === duckling.pattern) {
        return { bangCommand: duckling.bangCommand, remainingQuery: duckling.targetValue }
      }

      // If the query starts with the pattern and has additional content
      if (query.startsWith(duckling.pattern + ' ')) {
        const additionalQuery = query.slice(duckling.pattern.length + 1)
        // Combine the targetValue with the additional query if needed
        const remainingQuery = duckling.targetValue + ' ' + additionalQuery
        return { bangCommand: duckling.bangCommand, remainingQuery }
      }
    }
  }

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
            <td>!${duckling.bangCommand}</td>
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
