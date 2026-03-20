import { isInIframe } from './webviewCheck'

const TIMEOUT = 3000
let counter = 0
let _senderId = null

function generateRequestId() {
  return `req_${++counter}_${Date.now()}`
}

function generateAppId() {
  return 'APP_' + Math.random().toString(36).slice(2, 10)
}

export function setSenderId(id) {
  _senderId = id
}

export function getSenderId() {
  if (!_senderId) {
    _senderId = generateAppId()
  }
  return _senderId
}

export function sendToParent(message) {
  if (!isInIframe()) {
    console.log('[parentBridge] not in iframe, skip sendToParent')
    return
  }
  const msg = {
    ...message,
    sender: getSenderId(),
    target: message.target || 'DASHBOARD',
  }
  console.log('[parentBridge] sendToParent:', msg)
  window.parent.postMessage(msg, '*')
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
      const d = event.data
      if (d?.type === 'DATA_RESPONSE') {
        console.log('[parentBridge] DATA_RESPONSE received:', { requestId: d.requestId, expectedId: requestId, target: d.target, sender: d.sender, hasData: d.data != null })
      }
      if (
        d?.type === 'DATA_RESPONSE' &&
        d?.requestId === requestId &&
        (!d.target || d.target === getSenderId())
      ) {
        clearTimeout(timeout)
        window.removeEventListener('message', handler)
        resolve(d.data ?? null)
      }
    }

    window.addEventListener('message', handler)

    sendToParent({
      type: 'DATA_REQUEST',
      requestId,
      source,
      key,
    })
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
