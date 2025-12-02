// Components
import { Header } from './components'

// API utilities
import { createApiClient, createApiService, handleApiError } from './api'

// Export all components
export {
  Header
}

// Export API utilities
export {
  createApiClient,
  createApiService,
  handleApiError
}

// Vue plugin
export default {
  install(app) {
    // Register all components globally
    app.component('SkyHeader', Header)
  }
}
