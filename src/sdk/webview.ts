import UAParser from 'ua-parser-js';

export type WebviewType = 'ios_webview' | 'android_webview' | 'cef_webview' | 'browser';

declare global {
  interface Window {
    webkit?: { messageHandlers?: unknown };
    cefQuery?: unknown;
  }
  // eslint-disable-next-line no-var
  var Android: unknown;
}

/** Detect the current webview host (iOS, Android, CEF) or plain browser. */
export function webviewCheck(): WebviewType {
  if (typeof window === 'undefined') return 'browser';

  if (window.webkit != null && window.webkit.messageHandlers !== undefined) {
    try {
      const ua = UAParser(navigator.userAgent);
      if (ua.browser.name === 'WebKit') return 'ios_webview';
    } catch (err) {
      console.error(err);
    }
  }

  if (typeof Android !== 'undefined') return 'android_webview';
  if (typeof window.cefQuery !== 'undefined') return 'cef_webview';

  return 'browser';
}

export function isIosWebview(): boolean {
  return webviewCheck() === 'ios_webview';
}

export function isAndroidWebview(): boolean {
  return webviewCheck() === 'android_webview';
}

export function isCefWebview(): boolean {
  return webviewCheck() === 'cef_webview';
}

export function isWebview(): boolean {
  return webviewCheck() !== 'browser';
}
