import { DefineComponent } from 'vue'

// ============ Components ============

export interface HeaderProps {
  title?: string
  subtitle?: string
  showBackButton?: boolean
  backButtonTitle?: string
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
  enableAnimation?: boolean
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
