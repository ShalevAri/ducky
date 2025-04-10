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
      <div class="table-wrapper">
        <div class="table-header">
          <h2>Islands</h2>
          <div class="table-actions">
            <button class="delete-all-islands action-button">Delete All</button>
          </div>
        </div>
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
                    <td class="prompt-cell">${island.prompt}</td>
                    <td>
                      <button class="edit-island" data-key="${island.key}">Edit</button>
                      <button class="delete-island" data-key="${island.key}">Delete</button>
                    </td>
                  </tr>
                `
              )
              .join('')}
          </tbody>
        </table>
      </div>
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
      if (duckyIslands[island.key]) {
        duckyIslands[island.key] = island
      } else {
        duckyIslands[island.key] = island
      }
      const islandsList = app.querySelector<HTMLDivElement>('.islands-list')
      if (islandsList) {
        islandsList.innerHTML = this.renderIslandsList(duckyIslands)
        this.attachIslandHandlers(app, duckyIslands, islandForm)
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

    this.attachIslandHandlers(app, duckyIslands, islandForm)
  }

  private attachIslandHandlers(
    app: HTMLDivElement,
    duckyIslands: Record<string, DuckyIsland>,
    islandForm: IslandForm
  ): void {
    this.attachIslandDeleteHandlers(app, duckyIslands)
    this.attachIslandEditHandlers(app, duckyIslands, islandForm)
    this.attachIslandDeleteAllHandler(app, duckyIslands)
  }

  private attachIslandEditHandlers(
    app: HTMLDivElement,
    duckyIslands: Record<string, DuckyIsland>,
    islandForm: IslandForm
  ): void {
    const editButtons = app.querySelectorAll<HTMLButtonElement>('.edit-island')
    editButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const key = button.dataset.key
        if (!key) return

        const island = duckyIslands[key]
        if (island) {
          islandForm.setEditMode(island)
        }
      })
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

  private attachIslandDeleteAllHandler(app: HTMLDivElement, duckyIslands: Record<string, DuckyIsland>): void {
    const deleteAllButton = app.querySelector<HTMLButtonElement>('.delete-all-islands')
    if (!deleteAllButton) return

    deleteAllButton.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete all islands? This action cannot be undone.')) {
        this.islandService.clearAllIslands()
        Object.keys(duckyIslands).forEach((key) => delete duckyIslands[key])
        const islandsList = app.querySelector<HTMLDivElement>('.islands-list')!
        islandsList.innerHTML = this.renderIslandsList(duckyIslands)
        const form = new IslandForm(
          app.querySelector('.island-form')!,
          app.querySelector('.island-form-container')!,
          app.querySelector('.add-island-button')!,
          app.querySelector('.cancel-button')!,
          (island) => {
            duckyIslands[island.key] = island
            islandsList.innerHTML = this.renderIslandsList(duckyIslands)
            this.attachIslandHandlers(app, duckyIslands, form)
          }
        )
        this.attachIslandHandlers(app, duckyIslands, form)
      }
    })
  }
}
