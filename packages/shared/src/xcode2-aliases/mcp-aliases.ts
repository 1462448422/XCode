// 自动生成：fork X 命名 → 1010 Z 命名兼容别名（勿手改）
import type {
  ZCodeAgentMcpServer,
  ZCodeMcpServer,
} from "../mcp.js";
import {
  convertToZCodeAgentMcpServer,
  isZCodeCuaMcpCommand,
  isZCodeCuaMcpPackageArg,
  ZCODE_CUA_OFFICIAL_MCP_NAMESPACE_NAME,
  ZCODE_CUA_OFFICIAL_PLUGIN_ID,
  ZCODE_PLUGIN_ID_ENV_KEY,
} from "../mcp.js";

export const convertToXCodeAgentMcpServer = convertToZCodeAgentMcpServer;
export const isXCodeCuaMcpCommand = isZCodeCuaMcpCommand;
export const isXCodeCuaMcpPackageArg = isZCodeCuaMcpPackageArg;
export const XCODE_CUA_OFFICIAL_MCP_NAMESPACE_NAME = ZCODE_CUA_OFFICIAL_MCP_NAMESPACE_NAME;
export const XCODE_CUA_OFFICIAL_PLUGIN_ID = ZCODE_CUA_OFFICIAL_PLUGIN_ID;
export const XCODE_PLUGIN_ID_ENV_KEY = ZCODE_PLUGIN_ID_ENV_KEY;
export type XCodeAgentMcpServer = ZCodeAgentMcpServer;
export type XCodeMcpServer = ZCodeMcpServer;
