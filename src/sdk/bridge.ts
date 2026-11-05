import type {
  DashboardModalKey,
  DashboardModalResult,
  DashboardModals,
  DashboardModalsAvailability,
} from './types';

const BRIDGE_ID = 'DASHBOARD';
const DEFAULT_TIMEOUT = 5000;
// Скільки чекаємо підтвердження на `back`, перш ніж вважати дашборд застарілим і вийти на головну.
// Помітно менше за DEFAULT_TIMEOUT: це реакція на клік, її користувач чекає з пальцем на екрані.
const BACK_ACK_TIMEOUT = 700;
// Скільки openModal чекає підтвердження. Без нього вважаємо, що дашборд про модалки не знає.
const MODAL_ACK_TIMEOUT = 1500;

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

/** Wait for the Dashboard's answer to one request. Resolves to null on timeout. */
function awaitResponse<T = unknown>(requestId: string, timeout: number): Promise<T | null> {
  const mySenderId = getSenderId();

  return new Promise((resolve) => {
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
  });
}

function request<T = unknown>(
  source: 'localStorage' | 'store' | 'window',
  key: string,
  timeout = DEFAULT_TIMEOUT,
): Promise<T | null> {
  if (!isInsideIframe()) return Promise.resolve(null);

  const requestId = generateRequestId();
  const response = awaitResponse<T>(requestId, timeout);
  send({ type: 'DATA_REQUEST', requestId, source, key });
  return response;
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

/**
 * Ask Dashboard to step one page back through its own navigation history.
 *
 * The app cannot see the host's URL, so it cannot know where "back" leads — the Dashboard can.
 * Resolves to `true` once the host confirms it handled the step, `false` when it did not:
 * not in an iframe, or a Dashboard too old to know the message. Fall back to `exit()` on `false`.
 */
export function goBack(timeout = BACK_ACK_TIMEOUT): Promise<boolean> {
  if (!isInsideIframe()) return Promise.resolve(false);

  const requestId = generateRequestId();
  const ack = awaitResponse<{ ok?: boolean }>(requestId, timeout);
  send({ type: 'back', requestId });
  return ack.then((data) => data?.ok === true);
}

// ─── Dashboard modals ───

/**
 * Open a Dashboard modal (receipt, inventory, …) over the iframe and wait until it is closed.
 *
 * Two answers from the host: an immediate ack (`{ ok: true }` or `{ ok: false, reason }`), then
 * `modalClosed` with the result. Never rejects — a refusal resolves as `status: 'refused'`:
 * `not_in_iframe`, `no_response` (a Dashboard too old to know modals), or the host's reason.
 *
 * @example
 * const result = await openModal('coming.create', { tradepointId }, { warehouseId, supplierOrderId })
 * if (result.status === 'done') reload()
 */
export function openModal<K extends DashboardModalKey>(
  key: K,
  context: DashboardModals[K]['context'],
  params: DashboardModals[K]['params'],
  options: { ackTimeout?: number } = {},
): Promise<DashboardModalResult<K>> {
  if (!isInsideIframe()) return Promise.resolve({ status: 'refused', reason: 'not_in_iframe' });

  const requestId = generateRequestId();
  const mySenderId = getSenderId();

  return new Promise((resolve) => {
    let acknowledged = false;

    const timer = setTimeout(() => {
      if (!acknowledged) finish({ status: 'refused', reason: 'no_response' });
    }, options.ackTimeout ?? MODAL_ACK_TIMEOUT);

    function finish(result: DashboardModalResult<K>) {
      clearTimeout(timer);
      window.removeEventListener('message', handler);
      resolve(result);
    }

    function handler(event: MessageEvent) {
      // Лише батьківське вікно (подію без source — напр. у тестах — не відкидаємо) і лише наш запит
      if (event.source && event.source !== window.parent) return;

      const d = event.data;
      if (d?.requestId !== requestId || (d.target && d.target !== mySenderId)) return;

      if (d.type === 'DATA_RESPONSE') {
        const ack = d.data ?? {};
        if (ack.ok === true) {
          acknowledged = true;
          clearTimeout(timer);
          return;
        }
        finish({
          status: 'refused',
          reason: String(ack.reason ?? 'unknown_modal'),
          field: typeof ack.field === 'string' ? ack.field : undefined,
        });
        return;
      }

      if (d.type === 'modalClosed') {
        const data = d.data ?? {};
        if (d.status === 'done') {
          finish({ status: 'done', data: data as DashboardModals[K]['data'] });
        } else if (d.status === 'error') {
          finish({
            status: 'error',
            reason: String(data.reason ?? 'unknown'),
            ...(typeof data.error === 'string' ? { error: data.error } : {}),
            ...(typeof data.message === 'string' ? { message: data.message } : {}),
          });
        } else {
          finish({ status: 'cancelled' });
        }
      }
    }

    window.addEventListener('message', handler);
    send({ type: 'openModal', requestId, key, context, params });
  });
}

/**
 * Which modals this Dashboard knows and whether the current user may open them —
 * to decide whether to show a button. Resolves to `null` outside an iframe or when the
 * host did not answer (too old to know modals).
 */
export function getModals(timeout = MODAL_ACK_TIMEOUT): Promise<DashboardModalsAvailability | null> {
  if (!isInsideIframe()) return Promise.resolve(null);

  const requestId = generateRequestId();
  const response = awaitResponse<DashboardModalsAvailability>(requestId, timeout);
  send({ type: 'getModals', requestId });
  return response;
}

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
