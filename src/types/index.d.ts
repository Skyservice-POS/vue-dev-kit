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
