// 自动生成：fork X 命名 → 1010 Z 命名兼容别名（勿手改）
import type {
  ZCodeBackgroundTaskControlItem,
  ZCodeBackgroundTaskControlStatus,
} from "../background-task-controls.js";
import {
  collectVisibleZCodeBackgroundTaskControlItems,
  getZCodeBackgroundTaskControlItemElapsedMs,
  isActiveZCodeBackgroundTaskControlItem,
  parseZCodeBackgroundTaskControlItems,
  resolveZCodeBackgroundTaskControlKind,
} from "../background-task-controls.js";

export const collectVisibleXCodeBackgroundTaskControlItems = collectVisibleZCodeBackgroundTaskControlItems;
export const getXCodeBackgroundTaskControlItemElapsedMs = getZCodeBackgroundTaskControlItemElapsedMs;
export const isActiveXCodeBackgroundTaskControlItem = isActiveZCodeBackgroundTaskControlItem;
export const parseXCodeBackgroundTaskControlItems = parseZCodeBackgroundTaskControlItems;
export const resolveXCodeBackgroundTaskControlKind = resolveZCodeBackgroundTaskControlKind;
export type XCodeBackgroundTaskControlItem = ZCodeBackgroundTaskControlItem;
export type XCodeBackgroundTaskControlStatus = ZCodeBackgroundTaskControlStatus;
