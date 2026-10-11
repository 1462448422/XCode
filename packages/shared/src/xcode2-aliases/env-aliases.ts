// 自动生成：fork X 命名 → 1010 Z 命名兼容别名（勿手改）
import type {
  ZCodeEnv,
  ZCodeProductFlavor,
} from "../env.js";
import {
  mapZCodeEnvToArmsRumEnv,
  normalizeZCodeEnv,
  normalizeZCodeProductFlavor,
  RUNTIME_ZCODE_DEBUG,
  ZCODE_APP_VERSION_ENV,
  ZCODE_ARMS_RUM_ENDPOINT,
  ZCODE_BUILD_COMMIT_ID_ENV,
  ZCODE_ENV,
  ZCODE_PRODUCT_FLAVOR,
  ZCODE_TELEMETRY_REPORT_ENDPOINT,
} from "../env.js";

export const mapXCodeEnvToArmsRumEnv = mapZCodeEnvToArmsRumEnv;
export const normalizeXCodeEnv = normalizeZCodeEnv;
export const normalizeXCodeProductFlavor = normalizeZCodeProductFlavor;
export const RUNTIME_XCODE_DEBUG = RUNTIME_ZCODE_DEBUG;
export const XCODE_APP_VERSION_ENV = ZCODE_APP_VERSION_ENV;
export const XCODE_ARMS_RUM_ENDPOINT = ZCODE_ARMS_RUM_ENDPOINT;
export const XCODE_BUILD_COMMIT_ID_ENV = ZCODE_BUILD_COMMIT_ID_ENV;
export const XCODE_ENV = ZCODE_ENV;
export const XCODE_PRODUCT_FLAVOR = ZCODE_PRODUCT_FLAVOR;
export const XCODE_TELEMETRY_REPORT_ENDPOINT = ZCODE_TELEMETRY_REPORT_ENDPOINT;
export type XCodeEnv = ZCodeEnv;
export type XCodeProductFlavor = ZCodeProductFlavor;
