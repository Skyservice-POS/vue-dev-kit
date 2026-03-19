import { isInIframe } from './webviewCheck'

const TIMEOUT = 3000
let counter = 0

function generateRequestId() {
  return `req_${++counter}_${Date.now()}`
}

function requestFromParent(source, key) {
  if (!isInIframe()) return Promise.resolve(null)

  return new Promise((resolve) => {
    const requestId = generateRequestId()

    const timeout = setTimeout(() => {
      window.removeEventListener('message', handler)
      resolve(null)
    }, TIMEOUT)

    function handler(event) {
      if (
        event.data?.type === 'DATA_RESPONSE' &&
        event.data?.requestId === requestId
      ) {
        clearTimeout(timeout)
        window.removeEventListener('message', handler)
        resolve(event.data.data ?? null)
      }
    }

    window.addEventListener('message', handler)

    window.parent.postMessage(
      { type: 'DATA_REQUEST', requestId, source, key },
      '*',
    )
  })
}

export function getParentLocalStorage(key) {
  return requestFromParent('localStorage', key)
}

export function getParentStoreValue(key) {
  return requestFromParent('store', key)
}

export function getParentWindowValue(key) {
  return requestFromParent('window', key)
}
