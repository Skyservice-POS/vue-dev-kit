import { describe, it, expect, vi, afterEach } from 'vitest';
import { getModals, goBack, openModal } from './bridge';

type PostedMessage = {
  type?: string;
  requestId?: string;
  key?: string;
  context?: unknown;
  params?: unknown;
  target?: string;
};

/**
 * `isInsideIframe()` порівнює `window.self` з `window.top`, а `send()` пише в `window.parent` —
 * підміняємо обидва, щоб модуль повірив, що він усередині дашборда.
 */
function mockIframe(): PostedMessage[] {
  const posted: PostedMessage[] = [];
  Object.defineProperty(window, 'top', { value: {}, configurable: true });
  Object.defineProperty(window, 'parent', {
    value: { postMessage: (msg: PostedMessage) => posted.push(msg) },
    configurable: true,
  });
  return posted;
}

function respondTo(requestId: string | undefined, data: unknown) {
  window.dispatchEvent(
    new MessageEvent('message', { data: { type: 'DATA_RESPONSE', requestId, data } }),
  );
}

afterEach(() => {
  Object.defineProperty(window, 'top', { value: window, configurable: true });
  Object.defineProperty(window, 'parent', { value: window, configurable: true });
  vi.useRealTimers();
});

describe('goBack', () => {
  it('поза iframe одразу віддає false і нічого не шле', async () => {
    await expect(goBack()).resolves.toBe(false);
  });

  it('шле `back` і віддає true, коли дашборд підтвердив крок назад', async () => {
    const posted = mockIframe();

    const result = goBack();
    expect(posted).toHaveLength(1);
    expect(posted[0].type).toBe('back');

    respondTo(posted[0].requestId, { ok: true });
    await expect(result).resolves.toBe(true);
  });

  it('ігнорує відповідь на чужий запит', async () => {
    vi.useFakeTimers();
    const posted = mockIframe();

    const result = goBack();
    respondTo('sdk_someone_else', { ok: true });
    vi.advanceTimersByTime(700);

    await expect(result).resolves.toBe(false);
  });

  it('віддає false, коли старий дашборд не відповів за таймаут', async () => {
    vi.useFakeTimers();
    mockIframe();

    const result = goBack();
    vi.advanceTimersByTime(700);

    await expect(result).resolves.toBe(false);
  });
});

function closeModal(requestId: string | undefined, status: string, data?: unknown) {
  window.dispatchEvent(new MessageEvent('message', { data: { type: 'modalClosed', requestId, status, data } }));
}

describe('openModal', () => {
  const open = () => openModal('coming.create', { tradepointId: 5 }, { warehouseId: 12, supplierOrderId: 345 });

  it('поза iframe одразу відмовляє з not_in_iframe і нічого не шле', async () => {
    await expect(open()).resolves.toEqual({ status: 'refused', reason: 'not_in_iframe' });
  });

  it('шле openModal з ключем, контекстом і параметрами дашборду', () => {
    const posted = mockIframe();

    open();
    expect(posted).toHaveLength(1);
    expect(posted[0]).toMatchObject({
      type: 'openModal',
      key: 'coming.create',
      context: { tradepointId: 5 },
      params: { warehouseId: 12, supplierOrderId: 345 },
      target: 'DASHBOARD',
    });
    expect(posted[0].requestId).toBeTruthy();
  });

  it('після ack чекає на modalClosed і віддає done з даними', async () => {
    vi.useFakeTimers();
    const posted = mockIframe();

    const result = open();
    respondTo(posted[0].requestId, { ok: true });
    // Модалку тримають відкритою довше за таймаут підтвердження — це не має перетворитись на no_response
    vi.advanceTimersByTime(60_000);
    closeModal(posted[0].requestId, 'done', { documentId: 9876 });

    await expect(result).resolves.toEqual({ status: 'done', data: { documentId: 9876 } });
  });

  it('віддає cancelled, коли модалку закрили без результату', async () => {
    const posted = mockIframe();

    const result = open();
    respondTo(posted[0].requestId, { ok: true });
    closeModal(posted[0].requestId, 'cancelled');

    await expect(result).resolves.toEqual({ status: 'cancelled' });
  });

  it('віддає error із причиною модалки', async () => {
    const posted = mockIframe();

    const result = open();
    respondTo(posted[0].requestId, { ok: true });
    closeModal(posted[0].requestId, 'error', { reason: 'order_unavailable' });

    await expect(result).resolves.toEqual({ status: 'error', reason: 'order_unavailable' });
  });

  it('віддає refused із причиною й полем, коли дашборд відмовив', async () => {
    const posted = mockIframe();

    const result = open();
    respondTo(posted[0].requestId, { ok: false, reason: 'invalid_params', field: 'params.warehouseId' });

    await expect(result).resolves.toEqual({
      status: 'refused',
      reason: 'invalid_params',
      field: 'params.warehouseId',
    });
  });

  it('віддає no_response, коли старий дашборд не підтвердив за таймаут', async () => {
    vi.useFakeTimers();
    mockIframe();

    const result = open();
    vi.advanceTimersByTime(1500);

    await expect(result).resolves.toEqual({ status: 'refused', reason: 'no_response' });
  });

  it('ігнорує відповіді на чужий запит', async () => {
    vi.useFakeTimers();
    const posted = mockIframe();

    const result = open();
    respondTo('sdk_someone_else', { ok: true });
    closeModal('sdk_someone_else', 'done', { documentId: 1 });
    vi.advanceTimersByTime(1500);

    await expect(result).resolves.toEqual({ status: 'refused', reason: 'no_response' });
    expect(posted).toHaveLength(1);
  });
});

describe('getModals', () => {
  it('поза iframe віддає null', async () => {
    await expect(getModals()).resolves.toBeNull();
  });

  it('шле getModals і віддає перелік дашборду', async () => {
    const posted = mockIframe();

    const result = getModals();
    expect(posted[0].type).toBe('getModals');
    respondTo(posted[0].requestId, { 'coming.create': { allowed: true } });

    await expect(result).resolves.toEqual({ 'coming.create': { allowed: true } });
  });

  it('віддає null, коли старий дашборд не відповів', async () => {
    vi.useFakeTimers();
    mockIframe();

    const result = getModals();
    vi.advanceTimersByTime(1500);

    await expect(result).resolves.toBeNull();
  });
});
