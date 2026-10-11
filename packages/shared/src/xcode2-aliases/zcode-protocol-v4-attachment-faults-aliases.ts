// 自动生成：fork X 命名 → 1010 Z 命名兼容别名（勿手改）
import type {
  ZCodeAttachmentFaultCode,
} from "../zcode-protocol-v4/attachment-faults.js";
import {
  isZCodeAttachmentFaultCode,
  readZCodeAttachmentFaultCode,
  ZCODE_ATTACHMENT_FAULT_CODES,
  ZCodeAttachmentFaultError,
} from "../zcode-protocol-v4/attachment-faults.js";

export const isXCodeAttachmentFaultCode = isZCodeAttachmentFaultCode;
export const readXCodeAttachmentFaultCode = readZCodeAttachmentFaultCode;
export const XCODE_ATTACHMENT_FAULT_CODES = ZCODE_ATTACHMENT_FAULT_CODES;
export type XCodeAttachmentFaultCode = ZCodeAttachmentFaultCode;
export const XCodeAttachmentFaultError = ZCodeAttachmentFaultError;
