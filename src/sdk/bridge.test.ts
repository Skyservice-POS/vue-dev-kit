import { describe, it, expect, vi, afterEach } from 'vitest';
import { goBack } from './bridge';

type PostedMessage = { type?: string; requestId?: string };

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
