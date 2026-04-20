const BRIDGE_ID = 'DASHBOARD';
const DEFAULT_TIMEOUT = 5000;

let requestCounter = 0;
let _senderId: string | null = null;

function generateRequestId(): string {
  return `sdk_${Date.now()}_${++requestCounter}`;
}

function generateAppId(): string {
  return 'APP_' + Math.random().toString(36).slice(2, 10);
}

/** Set a custom sender id. Dashboard uses it to route responses back to the right mini-app. */
export function setSenderId(id: string): void {
  _senderId = id;
}

/** Get current sender id (auto-generates a random one on first call). */
export function getSenderId(): string {
  if (!_senderId) {
    _senderId = generateAppId();
  }
  return _senderId;
}

function send(message: Record<string, unknown>): void {
  window.parent.postMessage(
    {
      ...message,
      sender: getSenderId(),
      target: (message.target as string | undefined) || BRIDGE_ID,
    },
    '*',
  );
}

function request<T = unknown>(
  source: 'localStorage' | 'store' | 'window',
  key: string,
  timeout = DEFAULT_TIMEOUT,
): Promise<T | null> {
  if (!isInsideIframe()) return Promise.resolve(null);

  return new Promise((resolve) => {
    const requestId = generateRequestId();
    const mySenderId = getSenderId();

    const timer = setTimeout(() => {
      window.removeEventListener('message', handler);
      resolve(null);
    }, timeout);

    function handler(event: MessageEvent) {
      const d = event.data;
      if (
        d?.type === 'DATA_RESPONSE' &&
        d?.requestId === requestId &&
        (!d.target || d.target === mySenderId)
      ) {
        clearTimeout(timer);
        window.removeEventListener('message', handler);
        resolve((d.data ?? null) as T | null);
      }
    }

    window.addEventListener('message', handler);
    send({ type: 'DATA_REQUEST', requestId, source, key });
  });
}

// ─── Navigation ───

/** Navigate Dashboard to a given path. */
export function navigate(path: string): void {
  send({ type: 'navigate', path });
}

/** Exit current iframe app and return to Dashboard home. */
export function exit(): void {
  send({ type: 'exit' });
}

/** Alias for exit(). */
export const getBack = exit;

// ─── Data requests ───

/** Get a value from Dashboard's Vuex store by dot-notated key. Resolves to null on timeout or when not in iframe. */
export function getStoreData<T = unknown>(key: string): Promise<T | null> {
  return request<T>('store', key);
}

/** Get a value from Dashboard's localStorage. Resolves to null on timeout or when not in iframe. */
export function getLocalStorageData<T = unknown>(key: string): Promise<T | null> {
  return request<T>('localStorage', key);
}

/** Get a value from Dashboard's window object. Resolves to null on timeout or when not in iframe. */
export function getWindowData<T = unknown>(key: string): Promise<T | null> {
  return request<T>('window', key);
}

// ─── Convenience data getters ───

export function getCompany(): Promise<Record<string, unknown> | null> {
  return getStoreData('company');
}

export function getUser(): Promise<Record<string, unknown> | null> {
  return getStoreData('user');
}

export function getToken(): Promise<string | null> {
  return getLocalStorageData<string>('token');
}

export function getLang(): Promise<string | null> {
  return getLocalStorageData<string>('lang');
}

export function getProductCategories(): Promise<unknown[] | null> {
  return getStoreData<unknown[]>('productCategories');
}

// ─── Actions ───

/** Set a key in Dashboard's localStorage. */
export function setLocalStorage(key: string, value: unknown): void {
  send({ type: 'setLocalStorage', key, value });
}

/** Toggle rocket mode in Dashboard. */
export function setRocketMode(value: boolean): void {
  send({ type: 'setRocketMode', value });
}

/** Track a page visit for analytics. */
export function trackVisit(name: string, path?: string): void {
  send({ type: 'trackVisit', name, path });
}

/** Open an external link (handles webview bridges). */
export function openExternalLink(url: string): void {
  send({ type: 'openExternalLink', url });
}

/** Open Crisp support chat. */
export function openCrispChat(): void {
  send({ type: 'openCrispChat' });
}

// ─── Notifications ───

/** Show a success notification in Dashboard. */
export function notify(text: string): void {
  send({ type: 'notification', text });
}

/** Show an error notification in Dashboard. */
export function notifyError(text: string): void {
  send({ type: 'notification', text, variant: 'error' });
}

/** Show a warning notification in Dashboard. */
export function notifyWarn(text: string): void {
  send({ type: 'notification', text, variant: 'warn' });
}

// ─── Utilities ───

/** Check if the current window is running inside an iframe (cross-origin safe). */
export function isInsideIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

/** Alias for isInsideIframe(). */
export const isInIframe = isInsideIframe;

/** Listen for raw messages from Dashboard. */
export function onMessage(callback: (data: unknown) => void): () => void {
  function handler(event: MessageEvent) {
    if (event.data?.sender === BRIDGE_ID) {
      callback(event.data);
    }
  }
  window.addEventListener('message', handler);
  return () => window.removeEventListener('message', handler);
}
