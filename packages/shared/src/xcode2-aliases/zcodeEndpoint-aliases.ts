// 自动生成：fork X 命名 → 1010 Z 命名兼容别名（勿手改）
import type {
  RuntimeZCodeEndpointEnv,
  ZCodeEndpointUrls,
} from "../zcodeEndpoint.js";
import {
  buildRuntimeZCodeApiUrl,
  buildRuntimeZCodeEndpointUrls,
  buildZCodeEndpointUrls,
  DEFAULT_ZCODE_ENDPOINT_ORIGIN,
  normalizeZCodeEndpointOrigin,
  resolveRuntimeZCodeEndpointOrigin,
  resolveRuntimeZCodeEnv,
  resolveZCodeEndpointOrigin,
  rewriteZCodeEndpointUrl,
} from "../zcodeEndpoint.js";

export const buildRuntimeXCodeApiUrl = buildRuntimeZCodeApiUrl;
export const buildRuntimeXCodeEndpointUrls = buildRuntimeZCodeEndpointUrls;
export const buildXCodeEndpointUrls = buildZCodeEndpointUrls;
export const DEFAULT_XCODE_ENDPOINT_ORIGIN = DEFAULT_ZCODE_ENDPOINT_ORIGIN;
export const normalizeXCodeEndpointOrigin = normalizeZCodeEndpointOrigin;
export const resolveRuntimeXCodeEndpointOrigin = resolveRuntimeZCodeEndpointOrigin;
export const resolveRuntimeXCodeEnv = resolveRuntimeZCodeEnv;
export const resolveXCodeEndpointOrigin = resolveZCodeEndpointOrigin;
export const rewriteXCodeEndpointUrl = rewriteZCodeEndpointUrl;
export type RuntimeXCodeEndpointEnv = RuntimeZCodeEndpointEnv;
export type XCodeEndpointUrls = ZCodeEndpointUrls;
