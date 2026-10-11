// 自动生成：fork X 命名 → 1010 Z 命名兼容别名（勿手改）
import type {
  ZCodeKnownToolName,
  ZCodeToolFamily,
} from "../tool-identity.js";
import {
  getZCodeToolFamilyForName,
  isZCodeFileContentWriteToolName,
  isZCodeToolFamily,
  normalizeZCodeToolName,
  ZCODE_KNOWN_TOOL_NAMES,
} from "../tool-identity.js";

export const getXCodeToolFamilyForName = getZCodeToolFamilyForName;
export const isXCodeFileContentWriteToolName = isZCodeFileContentWriteToolName;
export const isXCodeToolFamily = isZCodeToolFamily;
export const normalizeXCodeToolName = normalizeZCodeToolName;
export const XCODE_KNOWN_TOOL_NAMES = ZCODE_KNOWN_TOOL_NAMES;
export type XCodeKnownToolName = ZCodeKnownToolName;
export type XCodeToolFamily = ZCodeToolFamily;
