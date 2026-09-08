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

// Гроші — значок валюти й форматування суми (без Vue, доступно й з Vue 2)
export { formatMoney, currencyIcon, CURRENCY_ICONS } from './money';
export type { FormatMoneyOptions } from './money';

// Types
export type {
  Tradepoint,
  TradepointWorkDay,
  Category,
  RawCategory,
  Product,
  RawProduct,
  AppIntegration,
  PermsMap,
} from './types';
