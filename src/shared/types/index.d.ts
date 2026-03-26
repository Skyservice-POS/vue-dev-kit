import { DefineComponent } from 'vue'

// ============ Components ============

export interface HeaderDropdownItem {
  name: string
  path: string
  lastVisit: number
}

export interface HeaderProps {
  title?: string
  subtitle?: string
  showBackButton?: boolean
  backButtonTitle?: string
  backEvent?: (() => void) | null
  dropdownItems?: HeaderDropdownItem[]
  dropdownTitle?: string
  visitLabel?: string
}

export interface HeaderEmits {
  'back': () => void
  'navigate': (path: string) => void
}

export interface HeaderSlots {
  'default'?: () => any
  'title'?: () => any
  'subtitle'?: () => any
}

export declare const Header: DefineComponent<HeaderProps>

// Dialog component
export interface DialogProps {
  modelValue?: boolean
  title?: string
  subtitle?: string
  zIndex?: number | string
  closeText?: string
  closeOnEsc?: boolean
  mode?: 'next' | 'classic' | null
}

export interface DialogSlots {
  'default'?: () => any
  'buttons'?: () => any
}

export interface DialogEmits {
  'update:modelValue': (value: boolean) => void
  'close': () => void
  'save': () => void
}

export declare const Dialog: DefineComponent<DialogProps>

// SkyButton component
export interface SkyButtonProps {
  variant?: 'primary' | 'danger' | 'secondary' | 'outline'
  loading?: boolean
  disabled?: boolean
  block?: boolean
  icon?: boolean
}

export interface SkyButtonSlots {
  'default'?: () => any
}

export declare const SkyButton: DefineComponent<SkyButtonProps>
