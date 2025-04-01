/**
 * Abstract base class for form handling
 * Provides common functionality for form management including submission, visibility, and data handling
 * @template T - The type of data the form handles
 */
export abstract class BaseForm<T> {
  protected formElement: HTMLFormElement
  protected formContainer: HTMLDivElement
  protected isVisible = false

  /**
   * Creates a new BaseForm instance
   * @param formElement - The HTML form element to manage
   * @param formContainer - The container div element that wraps the form
   */
  constructor(formElement: HTMLFormElement, formContainer: HTMLDivElement) {
    this.formElement = formElement
    this.formContainer = formContainer
    this.attachBaseEventListeners()
  }

  /**
   * Abstract method to handle form submission
   * Must be implemented by derived classes
   * @param event - The submit event object
   */
  protected abstract handleSubmit(event: SubmitEvent): void

  /**
   * Resets the form to its initial state
   */
  protected resetForm(): void {
    this.formElement.reset()
  }

  /**
   * Attaches base event listeners to the form
   * Currently handles the submit event
   */
  protected attachBaseEventListeners(): void {
    this.formElement.addEventListener('submit', (e) => {
      e.preventDefault()
      this.handleSubmit(e)
    })
  }

  /**
   * Makes the form visible
   */
  show(): void {
    this.formContainer.style.display = 'block'
    this.isVisible = true
  }

  /**
   * Hides the form and resets its contents
   */
  hide(): void {
    this.formContainer.style.display = 'none'
    this.isVisible = false
    this.resetForm()
  }

  /**
   * Toggles the form's visibility
   */
  toggle(): void {
    if (this.isVisible) {
      this.hide()
    } else {
      this.show()
    }
  }

  /**
   * Extracts form data from the form element
   * @returns An object containing the form data
   */
  protected getFormData(): T {
    const formData = new FormData(this.formElement)
    const data: Record<string, string> = {}

    formData.forEach((value, key) => {
      if (typeof value === 'string') {
        data[key] = value.trim()
      }
    })

    return data as unknown as T
  }

  /**
   * Sets form field values
   * @param data - Partial form data to set
   */
  protected setFormData(data: Partial<T>): void {
    Object.entries(data).forEach(([key, value]) => {
      const element = this.formElement.elements.namedItem(key) as HTMLInputElement | HTMLTextAreaElement | null
      if (element) {
        element.value = String(value)
      }
    })
  }

  /**
   * Validates required fields in the form
   * @param fields - Array of field keys that are required
   * @returns true if all required fields have values, false otherwise
   */
  protected validateRequired(fields: (keyof T)[]): boolean {
    const data = this.getFormData()
    return fields.every((field) => {
      const value = data[field]
      return value !== undefined && value !== ''
    })
  }
}
