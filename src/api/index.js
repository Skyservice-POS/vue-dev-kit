import axios from 'axios'

/**
 * Create a configured axios instance with interceptors
 * @param {Object} config - Configuration options
 * @param {string} config.baseURL - Base URL for API requests
 * @param {number} config.timeout - Request timeout in milliseconds
 * @param {Object} config.headers - Default headers
 * @param {Function} config.onRequest - Request interceptor callback
 * @param {Function} config.onResponse - Response interceptor callback
 * @param {Function} config.onError - Error handler callback
 * @returns {AxiosInstance}
 */
export function createApiClient(config = {}) {
  const {
    baseURL = '',
    timeout = 30000,
    headers = {},
    onRequest,
    onResponse,
    onError
  } = config

  const client = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  })

  // Request interceptor
  client.interceptors.request.use(
    (requestConfig) => {
      if (onRequest) {
        return onRequest(requestConfig)
      }
      return requestConfig
    },
    (error) => {
      if (onError) {
        onError(error)
      }
      return Promise.reject(error)
    }
  )

  // Response interceptor
  client.interceptors.response.use(
    (response) => {
      if (onResponse) {
        return onResponse(response)
      }
      return response
    },
    (error) => {
      if (onError) {
        onError(error)
      }
      return Promise.reject(error)
    }
  )

  return client
}

/**
 * Generic API service factory
 * @param {AxiosInstance} client - Axios instance
 * @param {string} endpoint - API endpoint
 * @returns {Object} CRUD methods
 */
export function createApiService(client, endpoint) {
  return {
    getAll: (params = {}) => client.get(endpoint, { params }),
    getById: (id, params = {}) => client.get(`${endpoint}/${id}`, { params }),
    create: (data) => client.post(endpoint, data),
    update: (id, data) => client.put(`${endpoint}/${id}`, data),
    patch: (id, data) => client.patch(`${endpoint}/${id}`, data),
    delete: (id) => client.delete(`${endpoint}/${id}`)
  }
}

/**
 * Handle API errors with consistent format
 * @param {Error} error - Axios error
 * @returns {Object} Formatted error object
 */
export function handleApiError(error) {
  if (error.response) {
    // Server responded with error status
    return {
      type: 'response',
      status: error.response.status,
      message: error.response.data?.message || error.message,
      data: error.response.data
    }
  } else if (error.request) {
    // Request was made but no response received
    return {
      type: 'network',
      status: null,
      message: 'Network error - no response received',
      data: null
    }
  } else {
    // Error in request setup
    return {
      type: 'setup',
      status: null,
      message: error.message,
      data: null
    }
  }
}

export default {
  createApiClient,
  createApiService,
  handleApiError
}
