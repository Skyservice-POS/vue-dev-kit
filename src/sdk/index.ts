// Bridge — postMessage communication with Dashboard (iframe only)
export {
  navigate,
  exit,
  getBack,
  getStoreData,
  getLocalStorageData,
  getWindowData,
  getCompany,
  getUser,
  getToken,
  getLang,
  getProductCategories,
  setLocalStorage,
  setRocketMode,
  trackVisit,
  openExternalLink,
  openCrispChat,
  notify,
  notifyError,
  notifyWarn,
  isInsideIframe,
  isInIframe,
  onMessage,
  setSenderId,
  getSenderId,
} from './bridge';

// Webview detection
export {
  webviewCheck,
  isIosWebview,
  isAndroidWebview,
  isCefWebview,
  isWebview,
} from './webview';
export type { WebviewType } from './webview';

// API — HTTP client for Skyservice API (works anywhere)
export { SkyserviceAPI } from './api';
export type { SkyserviceAPIConfig } from './api';

// Types
export type {
  Tradepoint,
  TradepointWorkDay,
  Category,
  RawCategory,
  Product,
  RawProduct,
} from './types';
