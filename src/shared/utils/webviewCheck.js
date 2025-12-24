import parser from 'ua-parser-js'

export function webviewCheck() {
  // Check iOS webview
  if (window.webkit != null) {
    if (window.webkit.messageHandlers !== 'undefined') {
      try {
        var ua = parser(navigator.userAgent)
        if (ua.browser.name === 'WebKit') {
          return 'ios_webview'
        }
      } catch (err) {
        console.error(err)
      }
    }
  }

  // Check Android webview
  if (typeof Android !== 'undefined') {
    return 'android_webview'
  }

  // Check CEF webview
  if (typeof window.cefQuery !== 'undefined') {
    return 'cef_webview'
  }

  return 'browser'
}

export function isIosWebview() {
  return webviewCheck() === 'ios_webview'
}

export function isAndroidWebview() {
  return webviewCheck() === 'android_webview'
}

export function isCefWebview() {
  return webviewCheck() === 'cef_webview'
}

export function isWebview() {
  const check = webviewCheck()
  return check !== 'browser'
}
