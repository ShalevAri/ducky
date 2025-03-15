export abstract class BaseForm<T> {
  protected formElement: HTMLFormElement
  protected formContainer: HTMLDivElement
  protected isVisible = false

  constructor(formElement: HTMLFormElement, formContainer: HTMLDivElement) {
    this.formElement = formElement
    this.formContainer = formContainer
    this.attachBaseEventListeners()
  }

  protected abstract handleSubmit(event: SubmitEvent): void
  protected abstract resetForm(): void

  protected attachBaseEventListeners(): void {
    this.formElement.addEventListener('submit', (e) => {
      e.preventDefault()
      this.handleSubmit(e)
    })
  }

  show(): void {
    this.formContainer.style.display = 'block'
    this.isVisible = true
  }

  hide(): void {
    this.formContainer.style.display = 'none'
    this.isVisible = false
    this.resetForm()
  }

  toggle(): void {
    if (this.isVisible) {
      this.hide()
    } else {
      this.show()
    }
  }

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

  protected setFormData(data: Partial<T>): void {
    Object.entries(data).forEach(([key, value]) => {
      const element = this.formElement.elements.namedItem(key) as HTMLInputElement | HTMLTextAreaElement | null
      if (element) {
        element.value = String(value)
      }
    })
  }

  protected validateRequired(fields: (keyof T)[]): boolean {
    const data = this.getFormData()
    return fields.every((field) => {
      const value = data[field]
      return value !== undefined && value !== ''
    })
  }
}
