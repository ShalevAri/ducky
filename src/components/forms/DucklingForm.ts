import { type Duckling } from '../../ducklings'
import { DucklingService } from '../../services/ducklings/DucklingService'
import { BaseForm } from './BaseForm'

/**
 * Form data structure for duckling creation/editing
 */
interface DucklingFormData {
  pattern: string
  bangCommand: string
  targetValue: string
  description: string
}

/**
 * Form component for managing ducklings
 * Extends BaseForm to provide duckling-specific form functionality
 */
export class DucklingForm extends BaseForm<DucklingFormData> {
  private ducklingService: DucklingService
  private addButton: HTMLButtonElement
  private cancelButton: HTMLButtonElement
  private onSave?: (duckling: Duckling) => void

  /**
   * Creates a new DucklingForm instance
   * @param formElement - The HTML form element
   * @param formContainer - The container div element
   * @param addButton - Button to trigger form display for adding a duckling
   * @param cancelButton - Button to cancel form submission
   * @param onSave - Optional callback function called when a duckling is saved
   */
  constructor(
    formElement: HTMLFormElement,
    formContainer: HTMLDivElement,
    addButton: HTMLButtonElement,
    cancelButton: HTMLButtonElement,
    onSave?: (duckling: Duckling) => void
  ) {
    super(formElement, formContainer)
    this.ducklingService = DucklingService.getInstance()
    this.addButton = addButton
    this.cancelButton = cancelButton
    this.onSave = onSave
    this.attachEventListeners()
  }

  private attachEventListeners(): void {
    this.addButton.addEventListener('click', () => {
      this.show()
    })

    this.cancelButton.addEventListener('click', () => {
      this.hide()
    })
  }

  protected handleSubmit(event: SubmitEvent): void {
    event.preventDefault()

    if (!this.validateForm()) {
      alert('All fields are required')
      return
    }

    const formData = this.getFormData()
    const bangCommand = formData.bangCommand.trim().replace(/^!/, '')
    const targetValue = formData.targetValue.trim()
    const isDirectUrl = targetValue.startsWith('http://') || targetValue.startsWith('https://')
    const finalBangCommand = isDirectUrl && !bangCommand ? 'raw' : bangCommand

    const duckling: Duckling = {
      pattern: formData.pattern,
      bangCommand: finalBangCommand,
      targetValue,
      description: formData.description
    }

    this.ducklingService.addDuckling(duckling)
    this.onSave?.(duckling)
    this.hide()
  }

  protected resetForm(): void {
    this.formElement.reset()
  }

  private validateForm(): boolean {
    const formData = this.getFormData()
    const requiredFields: (keyof DucklingFormData)[] = ['pattern', 'targetValue', 'description']

    if (!this.validateRequired(requiredFields)) {
      return false
    }

    const isDirectUrl = formData.targetValue.startsWith('http://') || formData.targetValue.startsWith('https://')
    if (!isDirectUrl && !formData.bangCommand) {
      alert('Bang command is required when not using a direct URL')
      return false
    }

    return true
  }
}
