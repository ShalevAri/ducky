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
      this.ducklingService.addDuckling(duckling)
      const ducklingsList = app.querySelector<HTMLDivElement>('.ducklings-list')
      if (ducklingsList) {
        ducklingsList.innerHTML = this.renderDucklingsList()
        this.attachDucklingDeleteHandlers(app)
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
}
