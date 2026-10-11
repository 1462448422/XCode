// 自动生成：fork X 命名 → 1010 Z 命名兼容别名（勿手改）
import type {
  ZCodeBackgroundBashJob,
  ZCodeBackgroundBashJobStatus,
} from "../background-bash-jobs.js";
import {
  collectVisibleZCodeBackgroundBashJobs,
  getZCodeBackgroundBashJobElapsedMs,
  isActiveZCodeBackgroundBashJob,
  parseZCodeBackgroundBashJobs,
} from "../background-bash-jobs.js";

export const collectVisibleXCodeBackgroundBashJobs = collectVisibleZCodeBackgroundBashJobs;
export const getXCodeBackgroundBashJobElapsedMs = getZCodeBackgroundBashJobElapsedMs;
export const isActiveXCodeBackgroundBashJob = isActiveZCodeBackgroundBashJob;
export const parseXCodeBackgroundBashJobs = parseZCodeBackgroundBashJobs;
export type XCodeBackgroundBashJob = ZCodeBackgroundBashJob;
export type XCodeBackgroundBashJobStatus = ZCodeBackgroundBashJobStatus;
