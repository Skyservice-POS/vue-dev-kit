import { DefineComponent, Plugin } from 'vue'
import { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

// ============ Components ============

export interface HeaderProps {
  title?: string
  subtitle?: string
  showBackButton?: boolean
  backButtonTitle?: string
}

export interface HeaderEmits {
  (e: 'back'): void
}

export interface HeaderSlots {
  'back-icon'?: () => any
  'title'?: () => any
  'subtitle'?: () => any
  'actions'?: () => any
}

declare const Header: DefineComponent<
  HeaderProps,
  {},
  {},
  {},
  {},
  {},
  {},
  HeaderEmits
>

// ============ API Utilities ============

export interface ApiClientConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
  onRequest?: (config: AxiosRequestConfig) => AxiosRequestConfig
  onResponse?: (response: AxiosResponse) => AxiosResponse
  onError?: (error: AxiosError) => void
}

export interface ApiError {
  type: 'response' | 'network' | 'setup'
  status: number | null
  message: string
  data: any
}

export interface ApiService<T = any> {
  getAll: (params?: Record<string, any>) => Promise<AxiosResponse<T[]>>
  getById: (id: string | number, params?: Record<string, any>) => Promise<AxiosResponse<T>>
  create: (data: Partial<T>) => Promise<AxiosResponse<T>>
  update: (id: string | number, data: Partial<T>) => Promise<AxiosResponse<T>>
  patch: (id: string | number, data: Partial<T>) => Promise<AxiosResponse<T>>
  delete: (id: string | number) => Promise<AxiosResponse<void>>
}

export function createApiClient(config?: ApiClientConfig): AxiosInstance
export function createApiService<T = any>(client: AxiosInstance, endpoint: string): ApiService<T>
export function handleApiError(error: AxiosError): ApiError

// ============ Plugin ============

declare const plugin: Plugin

export { Header }
export default plugin
