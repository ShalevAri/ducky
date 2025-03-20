import { defaultIslands } from './islands.ts'
import { type DuckyIsland } from './types/islands.ts'
import { loadFromLocalStorage, saveToLocalStorage } from './utils/storage.ts'

export function loadDuckyIslands(): Record<string, DuckyIsland> {
  return loadFromLocalStorage('ducky-islands', {})
}

export function saveDuckyIslands(islands: Record<string, DuckyIsland>): void {
  saveToLocalStorage('ducky-islands', islands)
}

export function initializeIslands(): Record<string, DuckyIsland> {
  const duckyIslands = loadDuckyIslands()
  if (Object.keys(duckyIslands).length === 0) {
    defaultIslands.forEach((island) => {
      duckyIslands[island.key] = island
    })
    saveDuckyIslands(duckyIslands)
  }
  return duckyIslands
}

export function renderIslandsList(duckyIslands: Record<string, DuckyIsland>): string {
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
