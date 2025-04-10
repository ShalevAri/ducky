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
  private isEditing = false
  private editingPattern: string | null = null

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

    // Add event listener for the pattern input
    const patternInput = this.formElement.querySelector<HTMLInputElement>('#duckling-pattern')
    const descriptionInput = this.formElement.querySelector<HTMLInputElement>('#duckling-description')

    if (patternInput && descriptionInput) {
      patternInput.addEventListener('input', () => {
        const patternValue = patternInput.value.trim()
        if (patternValue) {
          descriptionInput.placeholder = `Navigate to the ${patternValue} website`
        } else {
          // Reset to default placeholder if needed, or leave blank
          descriptionInput.placeholder = "Describe the duckling's purpose" // Or your desired default
        }
      })
    }
  }

  setEditMode(duckling: Duckling): void {
    this.isEditing = true
    this.editingPattern = duckling.pattern
    this.setFormData({
      pattern: duckling.pattern,
      bangCommand: duckling.bangCommand,
      targetValue: duckling.targetValue,
      description: duckling.description
    })
    this.show()
    const patternInput = this.formElement.querySelector<HTMLInputElement>('#duckling-pattern')
    if (patternInput) {
      patternInput.readOnly = true
    }
    const submitButton = this.formElement.querySelector<HTMLButtonElement>('.duckling-save-button')
    if (submitButton) {
      submitButton.textContent = 'Update Duckling'
    }
  }

  protected handleSubmit(event: SubmitEvent): void {
    event.preventDefault()

    if (!this.validateForm()) {
      alert('All fields are required except possibly Bang Command')
      return
    }

    const formData = this.getFormData()

    // If description is empty, use the dynamic placeholder text
    if (!formData.description.trim()) {
      formData.description = `Navigate to the ${formData.pattern} website`
    }

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

    if (this.isEditing) {
      const ducklings = this.ducklingService.loadDucklings()
      const index = ducklings.findIndex((d) => d.pattern === this.editingPattern)
      if (index !== -1) {
        ducklings[index] = duckling
        this.ducklingService.saveDucklings(ducklings)
      }
    } else {
      const ducklings = this.ducklingService.loadDucklings()
      const existingDuckling = ducklings.find((d) => d.pattern === duckling.pattern)
      if (existingDuckling) {
        alert(`Duckling with pattern "${duckling.pattern}" already exists. Please choose a different pattern.`)
        return
      }
      this.ducklingService.addDuckling(duckling)
    }

    this.onSave?.(duckling)
    this.resetForm()
    this.hide()
  }

  protected resetForm(): void {
    super.resetForm()
    this.isEditing = false
    this.editingPattern = null
    const patternInput = this.formElement.querySelector<HTMLInputElement>('#duckling-pattern')
    const descriptionInput = this.formElement.querySelector<HTMLInputElement>('#duckling-description') // Get description input

    if (patternInput) {
      patternInput.readOnly = false
    }
    // Reset description placeholder on form reset
    if (descriptionInput) {
      descriptionInput.placeholder = "Describe the duckling's purpose" // Reset to default
    }
    const submitButton = this.formElement.querySelector<HTMLButtonElement>('.duckling-save-button')
    if (submitButton) {
      submitButton.textContent = 'Save Duckling'
    }
  }

  private validateForm(): boolean {
    const formData = this.getFormData()
    // Description is no longer strictly required as it can be auto-generated
    const requiredFields: (keyof DucklingFormData)[] = ['pattern', 'targetValue']

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
