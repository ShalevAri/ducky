import { DucklingForm } from '../../../components/forms/DucklingForm'
import { type Duckling } from '../../../ducklings'
import { DucklingService } from '../../ducklings/DucklingService'
import { LoggingService } from '../../logging/LoggingService'

export class DucklingManager {
  private ducklingService: DucklingService
  private logger: LoggingService

  constructor() {
    this.ducklingService = DucklingService.getInstance()
    this.logger = LoggingService.getInstance()
  }

  renderDucklingsList(): string {
    const ducklings = this.ducklingService.loadDucklings()
    if (ducklings.length === 0) {
      return '<p>No ducklings created yet.</p>'
    }

    return `
      <div class="table-wrapper">
        <div class="table-header">
          <h2>Ducklings</h2>
          <div class="table-actions">
            <button class="delete-all-ducklings action-button">Delete All</button>
          </div>
        </div>
        <table class="ducklings-table">
          <thead>
            <tr>
              <th>Pattern</th>
              <th>Bang</th>
              <th>Target</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${ducklings
              .map(
                (duckling) => `
                  <tr>
                    <td>${duckling.pattern}</td>
                    <td>${duckling.bangCommand ? `!${duckling.bangCommand}` : 'Direct'}</td>
                    <td class="target-cell">${duckling.targetValue}</td>
                    <td class="prompt-cell">${duckling.description}</td>
                    <td>
                      <button class="edit-duckling" data-pattern="${duckling.pattern}">Edit</button>
                      <button class="delete-duckling" data-pattern="${duckling.pattern}">Delete</button>
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

  setupDucklingForm(app: HTMLDivElement): void {
    const addButton = app.querySelector<HTMLButtonElement>('.add-duckling-button')
    const formContainer = app.querySelector<HTMLDivElement>('.duckling-form-container')
    const form = app.querySelector<HTMLFormElement>('.duckling-form')
    const cancelButton = app.querySelector<HTMLButtonElement>('.duckling-cancel-button')

    if (!addButton || !formContainer || !form || !cancelButton) {
      this.logger.error('Failed to find duckling form elements')
      return
    }

    const ducklingForm = new DucklingForm(form, formContainer, addButton, cancelButton, (duckling) => {
      const ducklingsList = app.querySelector<HTMLDivElement>('.ducklings-list')
      if (ducklingsList) {
        ducklingsList.innerHTML = this.renderDucklingsList()
        this.attachDucklingHandlers(app, ducklingForm)
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

    this.attachDucklingHandlers(app, ducklingForm)
  }

  private attachDucklingHandlers(app: HTMLDivElement, ducklingForm: DucklingForm): void {
    this.attachDucklingDeleteHandlers(app)
    this.attachDucklingEditHandlers(app, ducklingForm)
    this.attachDucklingDeleteAllHandler(app)
  }

  private attachDucklingEditHandlers(app: HTMLDivElement, ducklingForm: DucklingForm): void {
    const editButtons = app.querySelectorAll<HTMLButtonElement>('.edit-duckling')
    editButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const pattern = button.dataset.pattern
        if (!pattern) return

        const duckling = this.ducklingService.getDuckling(pattern)
        if (duckling) {
          ducklingForm.setEditMode(duckling)
        }
      })
    })
  }

  attachDucklingDeleteHandlers(app: HTMLDivElement): void {
    const deleteButtons = app.querySelectorAll<HTMLButtonElement>('.delete-duckling')
    deleteButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const pattern = button.dataset.pattern
        if (!pattern) return

        this.ducklingService.removeDuckling(pattern)
        const ducklingsList = app.querySelector<HTMLDivElement>('.ducklings-list')!
        ducklingsList.innerHTML = this.renderDucklingsList()
        this.attachDucklingDeleteHandlers(app)
      })
    })
  }

  private attachDucklingDeleteAllHandler(app: HTMLDivElement): void {
    const deleteAllButton = app.querySelector<HTMLButtonElement>('.delete-all-ducklings')
    if (!deleteAllButton) return

    deleteAllButton.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete all ducklings? This action cannot be undone.')) {
        this.ducklingService.clearAllDucklings()
        const ducklingsList = app.querySelector<HTMLDivElement>('.ducklings-list')!
        ducklingsList.innerHTML = this.renderDucklingsList()
        const form = new DucklingForm(
          app.querySelector('.duckling-form')!,
          app.querySelector('.duckling-form-container')!,
          app.querySelector('.add-duckling-button')!,
          app.querySelector('.duckling-cancel-button')!,
          (duckling) => {
            this.ducklingService.addDuckling(duckling)
            ducklingsList.innerHTML = this.renderDucklingsList()
            this.attachDucklingHandlers(app, form)
          }
        )
        this.attachDucklingHandlers(app, form)
      }
    })
  }
}
