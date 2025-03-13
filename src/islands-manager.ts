import { defaultIslands } from './islands.ts'
import { DuckyIsland } from './types/islands.ts'
import { loadFromLocalStorage, saveToLocalStorage } from './utils/storage.ts'

/**
 * Load islands from local storage
 */
export function loadDuckyIslands(): { [key: string]: DuckyIsland } {
  return loadFromLocalStorage('ducky-islands', {})
}

/**
 * Save islands to local storage
 */
export function saveDuckyIslands(islands: { [key: string]: DuckyIsland }): void {
  saveToLocalStorage('ducky-islands', islands)
}

/**
 * Initialize islands with defaults if none exist
 */
export function initializeIslands(): { [key: string]: DuckyIsland } {
  const duckyIslands = loadDuckyIslands()
  if (Object.keys(duckyIslands).length === 0) {
    defaultIslands.forEach((island) => {
      duckyIslands[island.key] = island
    })
    saveDuckyIslands(duckyIslands)
  }
  return duckyIslands
}

/**
 * Render the islands list as HTML
 */
export function renderIslandsList(duckyIslands: { [key: string]: DuckyIsland }): string {
  const islands = Object.values(duckyIslands)
  if (islands.length === 0) {
    return '<p>No custom islands created yet.</p>'
  }

  return `
    <table class="islands-table">
      <thead>
        <tr>
          <th>Suffix</th>
          <th>Name</th>
          <th>Prompt</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${islands
          .map(
            (island) => `
          <tr data-key="${island.key}">
            <td>${island.key}</td>
            <td>${island.name}</td>
            <td class="prompt-cell">${island.prompt}</td>
            <td>
              <button class="delete-island" data-key="${island.key}">Delete</button>
            </td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `
}
