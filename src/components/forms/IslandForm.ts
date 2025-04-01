import { IslandService } from '../../services/islands/IslandService'
import { type DuckyIsland } from '../../types/islands'
import { BaseForm } from './BaseForm'

interface IslandFormData {
  key: string
  name: string
  prompt: string
}

export class IslandForm extends BaseForm<IslandFormData> {
  private islandService: IslandService
  private addButton: HTMLButtonElement
  private cancelButton: HTMLButtonElement
  private onSave?: (island: DuckyIsland) => void
  private isEditing = false
  private editingKey: string | null = null

  constructor(
    formElement: HTMLFormElement,
    formContainer: HTMLDivElement,
    addButton: HTMLButtonElement,
    cancelButton: HTMLButtonElement,
    onSave?: (island: DuckyIsland) => void
  ) {
    super(formElement, formContainer)
    this.islandService = IslandService.getInstance()
    this.addButton = addButton
    this.cancelButton = cancelButton
    this.onSave = onSave
    this.attachEventListeners()
  }

  private attachEventListeners(): void {
    this.addButton.addEventListener('click', () => {
      this.show()
      this.addButton.style.display = 'none'
    })

    this.cancelButton.addEventListener('click', () => {
      this.hide()
      this.addButton.style.display = 'block'
    })
  }

  setEditMode(island: DuckyIsland): void {
    this.isEditing = true
    this.editingKey = island.key
    this.setFormData({
      key: island.key,
      name: island.name,
      prompt: island.prompt
    })
    this.show()
    const keyInput = this.formElement.querySelector<HTMLInputElement>('#island-key')
    if (keyInput) {
      keyInput.readOnly = true
    }
    const submitButton = this.formElement.querySelector<HTMLButtonElement>('.save-button')
    if (submitButton) {
      submitButton.textContent = 'Update Island'
    }
  }

  protected handleSubmit(event: SubmitEvent): void {
    event.preventDefault()

    if (!this.validateForm()) {
      alert('All fields are required')
      return
    }

    const formData = this.getFormData()
    const island: DuckyIsland = {
      key: formData.key,
      name: formData.name,
      prompt: formData.prompt
    }

    if (this.isEditing && this.editingKey) {
      this.islandService.updateIsland(this.editingKey, island)
    } else {
      const existingIsland = this.islandService.getIsland(island.key)
      if (existingIsland) {
        alert(`Island with suffix "${island.key}" already exists. Please choose a different suffix.`)
        return
      }
      this.islandService.addIsland(island)
    }

    this.onSave?.(island)
    this.resetForm()
    this.hide()
    this.addButton.style.display = 'block'
  }

  protected resetForm(): void {
    super.resetForm()
    this.isEditing = false
    this.editingKey = null
    const keyInput = this.formElement.querySelector<HTMLInputElement>('#island-key')
    if (keyInput) {
      keyInput.readOnly = false
    }
    const submitButton = this.formElement.querySelector<HTMLButtonElement>('.save-button')
    if (submitButton) {
      submitButton.textContent = 'Save Island'
    }
  }

  private validateForm(): boolean {
    return this.validateRequired(['key', 'name', 'prompt'])
  }

  show(): void {
    super.show()
    this.addButton.style.display = 'none'
  }

  hide(): void {
    super.hide()
    this.addButton.style.display = 'block'
  }
}
