import { IslandForm } from '../../../components/forms/IslandForm'
import { type DuckyIsland } from '../../../types/islands'
import { IslandService } from '../../islands/IslandService'
import { LoggingService } from '../../logging/LoggingService'

export class IslandManager {
  private islandService: IslandService
  private logger: LoggingService

  constructor() {
    this.islandService = IslandService.getInstance()
    this.logger = LoggingService.getInstance()
  }

  renderIslandsList(duckyIslands: Record<string, DuckyIsland>): string {
    const islands = Object.values(duckyIslands)
    if (islands.length === 0) {
      return '<p>No islands created yet.</p>'
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
                <tr>
                  <td>!*${island.key}</td>
                  <td>${island.name}</td>
                  <td>${island.prompt}</td>
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

  setupIslandForm(app: HTMLDivElement, duckyIslands: Record<string, DuckyIsland>): void {
    const addButton = app.querySelector<HTMLButtonElement>('.add-island-button')
    const formContainer = app.querySelector<HTMLDivElement>('.island-form-container')
    const form = app.querySelector<HTMLFormElement>('.island-form')
    const cancelButton = app.querySelector<HTMLButtonElement>('.cancel-button')

    if (!addButton || !formContainer || !form || !cancelButton) {
      this.logger.error('Failed to find island form elements')
      return
    }

    const islandForm = new IslandForm(form, formContainer, addButton, cancelButton, (island) => {
      this.islandService.addIsland(island)
      const islandsList = app.querySelector<HTMLDivElement>('.islands-list')
      if (islandsList) {
        islandsList.innerHTML = this.renderIslandsList(duckyIslands)
        this.attachIslandDeleteHandlers(app, duckyIslands)
      }
    })

    addButton.addEventListener('click', () => {
      formContainer.style.display = 'block'
      addButton.style.display = 'none'
    })

    cancelButton.addEventListener('click', () => {
      formContainer.style.display = 'none'
      addButton.style.display = 'block'
      form.reset()
    })
  }

  attachIslandDeleteHandlers(app: HTMLDivElement, duckyIslands: Record<string, DuckyIsland>): void {
    const deleteButtons = app.querySelectorAll<HTMLButtonElement>('.delete-island')
    deleteButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const key = button.dataset.key
        if (!key) return

        this.islandService.removeIsland(key)
        delete duckyIslands[key]
        const islandsList = app.querySelector<HTMLDivElement>('.islands-list')!
        islandsList.innerHTML = this.renderIslandsList(duckyIslands)
        this.attachIslandDeleteHandlers(app, duckyIslands)
      })
    })
  }
}
