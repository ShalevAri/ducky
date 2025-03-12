export interface Duckling {
  pattern: string // The pattern to match (e.g., "shalevari/ducky")
  bangCommand: string // The bang command to apply (e.g., "ghr")
  description: string // A description of what this duckling does
}

// Load ducklings from localStorage
export function loadDucklings(): Duckling[] {
  const ducklings = localStorage.getItem('ducky-ducklings')
  if (!ducklings) return []
  try {
    return JSON.parse(ducklings)
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
    pattern: 'shalevari/ducky',
    bangCommand: 'ghr',
    description: 'Go to the Ducky GitHub repository'
  }
]

// Check if a query matches any duckling pattern
export function matchDuckling(query: string): { bangCommand: string; remainingQuery: string } | null {
  const ducklings = loadDucklings()

  for (const duckling of ducklings) {
    // Check if the query starts with, ends with, or equals the pattern
    if (
      query === duckling.pattern ||
      query.startsWith(duckling.pattern + ' ') ||
      query.endsWith(' ' + duckling.pattern)
    ) {
      // If the query is exactly the pattern, return the bang command with empty remaining query
      if (query === duckling.pattern) {
        return { bangCommand: duckling.bangCommand, remainingQuery: '' }
      }

      // If the query starts with the pattern
      if (query.startsWith(duckling.pattern + ' ')) {
        const remainingQuery = query.slice(duckling.pattern.length + 1)
        return { bangCommand: duckling.bangCommand, remainingQuery }
      }

      // If the query ends with the pattern
      if (query.endsWith(' ' + duckling.pattern)) {
        const remainingQuery = query.slice(0, query.length - duckling.pattern.length - 1)
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
