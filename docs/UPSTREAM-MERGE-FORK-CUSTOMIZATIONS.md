# B 类：fork 定制文件（刻意保留，不合入 1010）

判据：xcode2 内容（反向词表归一后）与 fork 原版一致，但与 1010 不同 —— 
即 0924 基线已等于 1010，而 fork 在其之上有意偏离。共 **138** 个。

| 文件 | fork 独有行 | 1010 独有行 | fork 定制方向 | 典型定制代码 |
|---|---:|---:|---|---|
| `packages/ui/src/useTheme.ts` | 302 | 3 | 主题皮肤 | import {<br>DEFAULT_SKIN_IMAGE, |
| `packages/services/src/model-provider/providerFacadeServices.ts` | 268 | 1 | Qoder/CodeBuddy 接入、营销/活动 | import {<br>isApiKeyAccess, |
| `packages/services/src/oauth/repo/oauthCredentialRepo.ts` | 162 | 0 | 多账号 OAuth、账号级 Device-Mid | const ACTIVE_ACCOUNT_KEY = "oauth:active_account";<br>const ACCOUNT_LIST_KEY = "oauth:account_list"; |
| `packages/services/src/onboarding/onboardingRecordService.ts` | 117 | 4 | 营销/活动 | import { copyFile, mkdir, readFile, readdir, rm, stat } from "node:fs/promises";<br>import { readFileSync, writeFileSync } from "node:fs"; |
| `packages/services/src/oauth/oauthService.ts` | 76 | 34 | 多账号 OAuth、账号级 Device-Mid | import { OAuthCredentialRepo, type OAuthAccountEntry } from "./repo/oauthCredentialRepo.js<br>/** 激活账号变更（登录/切换/登出）时回调，host 用它刷新 active account 供 deviceMid 等使用。 */ |
| `packages/ui/src/settings/MigrationSection.tsx` | 63 | 132 | — | import { Check, DatabaseBackup, Loader2, TriangleAlert } from "lucide-react";<br>import { ZCodeMigrationSection } from "@/settings/ZCodeMigrationSection.js"; |
| `packages/ui/src/settings/model-provider-section/ProviderFormControls.tsx` | 54 | 1 | Qoder/CodeBuddy 接入 | import { Checkbox } from "@/components/ui/checkbox.js";<br>import { |
| `packages/shared/src/model-provider-types.ts` | 45 | 0 | Qoder/CodeBuddy 接入 | /**<br>*/ |
| `packages/provider/src/config-service.ts` | 40 | 7 | — | );<br>membership?.inheritedModelIds ?? |
| `packages/ui/src/settings/MigrationCandidatesCard.tsx` | 33 | 18 | — | const KNOWN_REASON_MESSAGE_IDS: Record<string, string> = {<br>session_not_found_or_workspace_mismatch: |
| `packages/services/src/providers/sourceHeaders.ts` | 23 | 11 | 多账号 OAuth、账号级 Device-Mid | /** 当前激活账号引用（provider:identity）；设置时读取该账号的独立 X-Device-Mid。 */<br>accountRef?: string; |
| `apps/zcode-cli/packages/core/src/context/sections/identity.ts` | 17 | 5 | — | const OFFICIAL_SECURITY_NOTICE =<br>const identityLines = ["", intro].join("\n"); |
| `apps/zcode-cli/packages/adapters/src/model/failure-provider-business-codes.ts` | 16 | 0 | Qoder/CodeBuddy 接入 | PROVIDER_BUSINESS_CODE_MAPPINGS.set(code, TERMINAL_RATE_LIMIT_MAPPING);<br>PROVIDER_BUSINESS_CODE_MAPPINGS.set(code, TERMINAL_BUSINESS_MAPPING); |
| `packages/provider-node/src/endpoint-scoped-zcode-builtin-source.ts` | 16 | 16 | — | normalizeXCodeBuiltinEndpointOrigin,<br>XCodeBuiltinRemoteSynchronizer, |
| `apps/zcode-cli/packages/core/src/context/sections/cli-prefix.ts` | 14 | 0 | — | const OFFICIAL_CLI_PREFIX_PROMPT = "You are ZCode, an interactive coding agent";<br>return { |
| `packages/provider-node/src/provider-config-runtime.ts` | 14 | 14 | — | EndpointScopedXCodeBuiltinSource,<br>type EndpointScopedXCodeBuiltinSourceOptions, |
| `packages/provider-node/src/zcode-builtin-provider-config-source.ts` | 14 | 14 | — | decodeXCodeBuiltinRelease,<br>encodeXCodeBuiltinRelease, |
| `packages/ui/src/components/ai-elements/message.tsx` | 14 | 14 | — | import { createXCodeFileCitationRemarkPlugin } from "@/lib/zcodeFileCitationRemarkPlugin.j<br>renderXCodeFileCitations?: boolean; |
| `packages/ui/src/lib/modelSelectionGroups.ts` | 14 | 1 | Qoder/CodeBuddy 接入 | import {<br>parseQoderModelMeta, |
| `packages/services/src/model-provider/providerRuntime.ts` | 13 | 1 | Qoder/CodeBuddy 接入 | import type { ProviderSettingsUpstreamModelsFetcher } from "./upstreamModelListFetcher.js"<br>import type { QoderProStatusGatewayFetcher } from "./providerFacadeServices.js"; |
| `packages/desktop/src/main/desktopCuaPermissionIpc.ts` | 11 | 11 | — | let cachedXCodeIcon: Electron.NativeImage \| null = null;<br>function resolveXCodeIcon(): Electron.NativeImage { |
| `packages/provider/src/config/provider-config.ts` | 11 | 0 | — | readonly upstreamModelIdFilter?: ProviderConfigObject["upstreamModelIdFilter"];<br>readonly requestProfile?: ProviderConfigObject["requestProfile"]; |
| `packages/services/src/oauth/oauth.ts` | 11 | 0 | 多账号 OAuth、账号级 Device-Mid | import type { OAuthAccountEntry } from "./repo/oauthCredentialRepo.js";<br>/** 获取已登录账号列表（多账号）。 */ |
| `apps/zcode-cli/packages/core/src/tool/registry.ts` | 10 | 1 | — | const exact = this.tools.get(this.aliases.get(name) ?? name);<br>if (exact) return exact; |
| `packages/provider-node/src/zcode-builtin-release.ts` | 10 | 10 | — | export const XCODE_BUILTIN_RELEASE_SCHEMA_VERSION = 1 as const;<br>export interface XCodeBuiltinConfigContent { |
| `packages/services/src/providers/api/apiEndpoints.ts` | 10 | 0 | 营销/活动 | process.env,<br>); |
| `packages/services/src/setting/settingService.ts` | 10 | 6 | 主题皮肤 | return join(resolveUserHomeDir(), ".xcode", "v2");<br>const nextSettings = { ...current, ...validatedPatch }; |
| `packages/ui/src/v4/composer/composerSubmissionConfig.ts` | 10 | 1 | godmode 越狱 | import {<br>submissionModeSchema, |
| `packages/provider-node/src/zcode-builtin-remote-synchronizer.ts` | 9 | 9 | — | export type XCodeBuiltinRefreshResult =<br>export interface XCodeBuiltinRemoteSynchronizerOptions { |
| `packages/desktop/src/main/aboutWindow.ts` | 8 | 15 | — | // ZCode fork：关于窗口品牌图标（用户提供的 X 位图，base64 内联以适配 inline html）。<br>const ABOUT_LOGO_DATA_URI = |
| `packages/provider-node/src/zcode-builtin-cache-paths.ts` | 8 | 8 | — | export interface XCodeBuiltinCachePathOptions {<br>export interface XCodeBuiltinCachePaths { |
| `packages/shared/src/zcode-protocol-v4/core.ts` | 8 | 0 | godmode 越狱 | .object({<br>}) |
| `apps/zcode-cli/packages/contracts/src/tools/saved-workflow.ts` | 7 | 7 | — | export const SAVED_WORKFLOW_PROJECT_DIR = ".xcode/workflows";<br>* `.xcode/workflows/`（用户保存的定义）的兄弟目录，机器自有、自带 `.gitignore: *`。 |
| `packages/provider-node/src/zcode-builtin-provider-config-materializer.ts` | 6 | 6 | — | decodeXCodeBuiltinRelease,<br>serializeXCodeBuiltinRelease, |
| `packages/services/src/commands/commandsService.ts` | 6 | 6 | — | userDirectorySegments: [".xcode", "commands"],<br>workspaceDirectorySegments: [".xcode", "commands"], |
| `packages/ui/src/hooks/useModelProviders.ts` | 6 | 0 | — | );<br>// 从上游拉取模型列表（Host 直连 HTTP），不依赖 workspace/agent 进程。 |
| `apps/zcode-cli/packages/dynamic-workflow-runtime/src/child-entry-file.ts` | 5 | 5 | — | * `<cwd>/.xcode/workflow-runs/<runId>.mjs`，spawn 时命令行只剩这条路径。<br>*   - 位置 `.xcode/workflow-runs/`，与项目级 saved workflow 的 `.xcode/workflows/` 同级不混放； |
| `packages/services/src/onboarding/onboardingRecord.ts` | 5 | 0 | — | import type { JobSnapshot } from "./backgroundJobRegistry.js";<br>/** 从 ~/.zcode 迁移用户数据到 ~/.xcode（跳过账号凭证与运行时文件：credentials*、*.sqlite/-wal/-shm；配置合并覆盖）。 */ |
| `packages/shared/src/workspace-hook-config.ts` | 5 | 5 | — | export type WorkspaceHookConfigFileKind = "zcode.json" \| ".xcode/config.json" \| "explici<br>join(directory, ".xcode", "config.json"), |
| `packages/ui/src/v4/ConversationShareReadonlyTimeline.tsx` | 5 | 5 | — | // 取舍：这里只校验形状（.xcode-share/<dir>/shared-artifacts/<file> 四段），刻意不把<br>// .xcode-share/*/shared-artifacts/ 内，无越权读放大。 |
| `packages/provider-node/src/zcode-builtin-download.ts` | 4 | 4 | — | import { decodeXCodeBuiltinRelease, type ZCodeBuiltinRelease } from "./zcode-builtin-relea<br>export interface XCodeBuiltinDownloadOptions { |
| `packages/ui/src/root/zcodeJwtInvalidRestartMarker.ts` | 4 | 4 | — | const XCODE_JWT_INVALID_RESTART_MARKER_KEY = "zcode:auth:jwt-invalid-restart";<br>resolveStorage(storage)?.setItem(XCODE_JWT_INVALID_RESTART_MARKER_KEY, "1"); |
| `packages/ui/src/settings/saved-workflows/useSavedWorkflowsDirectoryWatch.ts` | 4 | 4 | — | return `${trimmed}${separator}.xcode${separator}workflows`;<br>* 项目组传 `workspacePath`（拼出 `<ws>/.xcode/workflows`）；全局组传 `directory`（协议 list 回的 |
| `apps/zcode-cli/packages/adapters/src/commands/roots.ts` | 3 | 3 | — | const ZCODE_DIR = ".xcode";<br>// 合并而不是 fallback：兼容 `.agents` 命令和原生 `.xcode` 命令需要同时可见。 |
| `apps/zcode-cli/packages/adapters/src/skills/roots.ts` | 3 | 3 | — | const ZCODE_DIR = ".xcode";<br>// 合并而不是 fallback：用户可能同时安装原生 `.xcode` skill 和兼容 `.agents` skill。 |
| `apps/zcode-cli/packages/cli/src/provider-runtime-env.ts` | 3 | 3 | — | explicitPersonal ?? join(dataBaseDir, ".xcode", "v2", PERSONAL_PROVIDER_CONFIG_FILE_NAME);<br>environmentConfigRoot: join(dataBaseDir, ".xcode", "v2"), |
| `packages/services/src/hooks/hooksService.ts` | 3 | 3 | — | return workspacePath ? join(baseDir, ".xcode") : join(baseDir, ".xcode", "cli");<br>: join(home, ".xcode"); |
| `packages/services/src/skill-sync/skillSyncService.ts` | 3 | 3 | — | return join(resolveUserHomeDir(), ".xcode", "skills");<br>// 远端 SkillsService 会同时读取用户级 .xcode/skills 和 .agents/skills。 |
| `packages/services/src/skills/skills.ts` | 3 | 3 | — | /** 将指定 skill 复制到通用目录（.xcode/skills），成功后返回新 skill 的路径。 */<br>/** 从通用目录中移除指定 skill（仅当 skill 位于 .xcode/skills 时有效）。 */ |
| `packages/services/src/subagents/subagentStorage.ts` | 3 | 3 | — | return join(workspacePath, ".xcode", "agents");<br>: "~/.xcode"; |
| `packages/ui/src/DesktopWindowFrame.tsx` | 3 | 0 | — | // Codex 主题包的 [data-ds-part="root"] 描述应用根的背景与文字色，<br>// 挂点就是这层外壳（皮肤激活时引擎已把它设成透图）。 |
| `packages/ui/src/settingsCodePreview.tsx` | 3 | 0 | 主题皮肤 | import { CustomSkinSetting } from "@/settings/CustomSkinSetting.js";<br>{/* 原生换肤——底座主题 + token 覆盖 + 背景图。 */} |
| `packages/ui/src/store/hooksStore.ts` | 3 | 3 | — | function buildXCodeHookLocation(<br>location: buildXCodeHookLocation(workspacePath, config.storageLevel), |
| `apps/zcode-cli/packages/adapters/src/config/config-factory.ts` | 2 | 2 | — | /** Path to user config file (default: ~/.xcode/cli/config.json) */<br>* 2. User config file (~/.xcode/cli/config.json) |
| `apps/zcode-cli/packages/adapters/src/model/runner-debug.ts` | 2 | 2 | — | // 这里保持历史语义：开发态写 ~/.xcode/cli/debug，生产态写 ~/.xcode/cli/rollout。<br>return join(homedir(), ".xcode", "cli", isDev ? "debug" : "rollout"); |
| `apps/zcode-cli/packages/adapters/src/storage/workspace-hook-trust-store.ts` | 2 | 2 | — | options.userConfigPath ?? join(home, ".xcode", "cli", "config.json"),<br>const storageRoot = configured ? resolveTrustedUserPath(configured, home) : join(home, ".x |
| `apps/zcode-cli/packages/bootstrap/src/app/script-workflow-tool-port.ts` | 2 | 2 | — | join(deps.workingDirectory, ".xcode", "workflows", fileName),<br>join(homedir(), ".xcode", "workflows", fileName), |
| `apps/zcode-cli/packages/bootstrap/src/app/script-workflow-utils.ts` | 2 | 2 | — | if (isWithin(scriptPath, join(workingDirectory, ".xcode", "workflows"))) return "project";<br>if (isWithin(scriptPath, join(homedir(), ".xcode", "workflows"))) return "user"; |
| `apps/zcode-cli/packages/cli/src/plugins-command-shared.ts` | 2 | 2 | — | * 避免 `xcode plugins list` 这类轻命令把整个 bootstrap 图提前拉起来。<br>/** `xcode plugins` 子命令专属旗标；由 run.ts 的全局解析器收集后原样透传。 */ |
| `apps/zcode-cli/packages/cli/src/plugins-command.ts` | 2 | 2 | — | const PLUGINS_COMMAND_USAGE = `Usage: xcode plugins <command> [options]<br>Scopes: user (default), project. \`xcode plugin\` is an alias of \`xcode plugins\`.`; |
| `apps/zcode-cli/packages/contracts/src/config/index.ts` | 2 | 2 | — | dir: "~/.xcode",<br>sessionDbPath: "~/.xcode/cli/db/db.sqlite", |
| `apps/zcode-cli/packages/core/src/tool/handlers/saved-workflows/store.ts` | 2 | 2 | — | * 项目档落在会话工作目录的 `.xcode/workflows/`，全局档落在家目录的 `~/.xcode/workflows/`。<br>// ENOTDIR：路径中间有一段是文件（`.xcode/workflows` 被人建成了文件）。对查找而言与 |
| `apps/zcode-cli/packages/debug/server/sources.ts` | 2 | 2 | — | return join(homedir(), ".xcode", "cli", "log");<br>return join(homedir(), ".xcode", "cli", "db", "db.sqlite"); |
| `packages/server/src/remote/zcodeAgentBundleWrapper.ts` | 2 | 2 | — | 'runtime_root="${ZCODE_SERVER_RUNTIME_ROOT:-$HOME/.xcode/server}"',<br>`exec "$runtime_root/node" "$HOME/.xcode/server/agents/${runtimeResourceDir}/${REMOTE_AGEN |
| `packages/services/src/plugin-sync/pluginSyncService.ts` | 2 | 2 | — | return join(resolveUserHomeDir(), ".xcode", "cli", "config.json");<br>return join(resolveUserHomeDir(), ".xcode", "plugins"); |
| `packages/services/src/zcode-agent/modelTrajectoryFileTail.ts` | 2 | 2 | — | join(homedir(), ".xcode", "cli"),<br>join(getDataBaseDir(), ".xcode", "cli"), |
| `packages/shared/src/zcode-source-headers.ts` | 2 | 0 | 营销/活动 | // 操作系统为 zcode.z.ai（ZCode 平台），线上 HTTP 头必须保持 X-ZCode- 前缀，<br>// 服务器据此识别客户端版本并决定资源位下发（含营销投放）。fork 换肤不能改这个头名。 |
| `packages/ui/src/feedback/feedbackSubmitDescription.ts` | 2 | 2 | — | const FEEDBACK_XCODE_AGENT_LABEL = "ZCode Agent";<br>`当前 Agent: ${FEEDBACK_XCODE_AGENT_LABEL}`, |
| `packages/ui/src/feedback/feedbackSubmitSubmission.ts` | 2 | 2 | — | const FEEDBACK_XCODE_AGENT_LABEL = "ZCode Agent";<br>agentProvider: FEEDBACK_XCODE_AGENT_LABEL, |
| `packages/ui/src/lib/patchDiffPreview.ts` | 2 | 2 | — | const FALLBACK_TRUNCATED_MARKER_PREFIX = "\\ __XCODE_DIFF_TRUNCATED__:";<br>const FALLBACK_TRUNCATED_MARKER_REGEX = /^\\ __XCODE_DIFF_TRUNCATED__:(\d+)$/; |
| `packages/ui/src/root/botsTaskStreamBroadcast.ts` | 2 | 2 | — | function isXCodeStreamEvent(value: unknown): value is ZCodeStreamEvent {<br>isXCodeStreamEvent(value.event) && |
| `packages/ui/src/settings/model-provider-section/ProviderDraftSave.ts` | 2 | 1 | — | import { DEFAULT_PERSONAL_PROVIDER_API_FORMAT } from "./constants.js";<br>!readOnlyEndpoints && draft.apiFormat !== (provider.config.api?.type ?? DEFAULT_PERSONAL_P |
| `packages/ui/src/store/mcpStoreMigration.ts` | 2 | 2 | — | function isXCodeAgentUserServer(server: NativeMcpServerRecord): boolean {<br>nativeServers.filter(isXCodeAgentUserServer).map((server) => server.name), |
| `packages/ui/src/store/zcodeSessionStore.ts` | 2 | 2 | — | type XCodeSessionStoreE2EBridge = typeof useZCodeSessionStore;<br>__zcodeSessionStoreE2E?: XCodeSessionStoreE2EBridge; |
| `packages/ui/src/WindowsTopLeftLogo.tsx` | 2 | 2 | — | import appLogoUrl from "@/assets/X.svg";<br>src={appLogoUrl} |
| `packages/zcode-server-cli/src/cli.ts` | 2 | 2 | — | return env.XCODE_SERVER_SKIP_SERVICE_REGISTRATION !== "1";<br>process.env.XCODE_LEGACY_CLI_ENTRY?.trim() \|\| |
| `packages/zcode-server-cli/src/packaging/nodeDistMirror.ts` | 2 | 2 | — | * 与 `.gitlab/ci/00-workflow.yml` 的 `XCODE_NODE_DIST_MIRROR` CI 变量、<br>const mirror = env.XCODE_NODE_DIST_MIRROR?.trim(); |
| `apps/zcode-cli/packages/adapters/src/auth/shared-credentials.ts` | 1 | 1 | — | return join(resolveUserPath(baseDir), ".xcode", "v2", "credentials.json"); |
| `apps/zcode-cli/packages/adapters/src/config/file-config.adapter.ts` | 1 | 1 | — | const DEFAULT_BASE_DIR = "~/.xcode/cli"; |
| `apps/zcode-cli/packages/adapters/src/config/project-config.adapter.ts` | 1 | 1 | — | return basename(configDirectory) === ".xcode" ? dirname(configDirectory) : configDirectory |
| `apps/zcode-cli/packages/adapters/src/context/index.ts` | 1 | 1 | — | const filePath = join(resolveUserHomeDir(env), ".xcode", "AGENTS.md"); |
| `apps/zcode-cli/packages/adapters/src/exec/execution-utils.ts` | 1 | 1 | — | const storageRoot = processEnv.ZCODE_STORAGE_DIR?.trim() \|\| join(homedir(), ".xcode"); |
| `apps/zcode-cli/packages/adapters/src/logging/index.ts` | 1 | 1 | — | return join(homedir(), ".xcode", "cli", "log"); |
| `apps/zcode-cli/packages/adapters/src/skills/index.ts` | 1 | 1 | — | // UI 可能把 symlink 目标真实路径写入 config，而 agent 从 ~/.xcode/skills 的链接路径扫描。 |
| `apps/zcode-cli/packages/adapters/src/storage/session-store/paths.ts` | 1 | 1 | — | return join(homedir(), ".xcode", "cli", "db", "db.sqlite"); |
| `apps/zcode-cli/packages/adapters/src/workflow/index.ts` | 1 | 1 | — | const DEFAULT_WORKFLOW_ROOT = join(homedir(), ".xcode", "cli", "workflows"); |
| `apps/zcode-cli/packages/bootstrap/src/zcode-protocol/mcp.ts` | 1 | 1 | — | // 设置页的本地 MCP 列表由 desktop main 解析 `.xcode` / `.agents` fallback， |
| `apps/zcode-cli/packages/cli/src/clipboard-image.ts` | 1 | 1 | — | const storageRoot = processEnv.ZCODE_STORAGE_DIR?.trim() \|\| join(homedir(), ".xcode"); |
| `apps/zcode-cli/packages/cli/src/commands-command.ts` | 1 | 1 | — | const COMMANDS_COMMAND_USAGE = "Usage: xcode commands [list\|inspect <name>]"; |
| `apps/zcode-cli/packages/cli/src/dwf-child-command.ts` | 1 | 1 | — | * 32,767 字符），harness 写一份自包含的入口文件 `<cwd>/.xcode/workflow-runs/<runId>.mjs`，argv |
| `apps/zcode-cli/packages/cli/src/login-command.ts` | 1 | 1 | — | throw new Error("Usage: xcode login [zai\|bigmodel] [--no-browser]"); |
| `apps/zcode-cli/packages/cli/src/skills-command.ts` | 1 | 1 | — | const SKILLS_COMMAND_USAGE = "Usage: xcode skills [list\|inspect <name>]"; |
| `apps/zcode-cli/packages/contracts/src/hooks/workspace-hook-trust.ts` | 1 | 1 | — | configFileKind: z.enum(["zcode.json", ".xcode/config.json", "explicit"]), |
| `apps/zcode-cli/packages/contracts/src/tools/workflow.ts` | 1 | 1 | — | "Name of a predefined workflow (built-in or from .xcode/workflows/). Resolves to a self-co |
| `apps/zcode-cli/packages/core/src/context/sections/workflow-actor.ts` | 1 | 3 | — | import { buildHarnessBlock } from "./identity.js"; |
| `apps/zcode-cli/packages/core/src/tool/handlers/list-saved-workflows.ts` | 1 | 1 | — | `Lists the dynamic workflows saved in this project (\`${SAVED_WORKFLOW_PROJECT_DIR}/\`, ke |
| `apps/zcode-cli/packages/telemetry/src/bootstrap.ts` | 1 | 1 | godmode/telemetry | : join(homedir(), ".xcode", "v2", "telemetry-state.json"); |
| `packages/desktop/src/host/browserRecordingArtifactMaterializer.ts` | 1 | 1 | — | const stagingPath = `${targetPath}.xcode-recording-${randomUUID()}.tmp`; |
| `packages/desktop/src/main/desktopFinderOpenFolderWorkflow.ts` | 1 | 1 | — | const WORKFLOW_BUNDLE_ID = "dev.xcode.app.finder-open-workflow"; |
| `packages/provider-node/src/runtime-paths.ts` | 1 | 1 | — | "XCODE_BUILTIN_PROVIDER_BUNDLED_CONFIG_FILE"; |
| `packages/server/buildRemoteValidation.ts` | 1 | 1 | — | // remote deploy 只会上传单个 zcode-server.cjs 到 ~/.xcode/server/。 |
| `packages/server/src/remote/deployShared.ts` | 1 | 1 | — | export const REMOTE_BASE = "~/.xcode/server"; |
| `packages/server/src/remote/docker-backend.ts` | 1 | 1 | — | // 如果直接写入 `~/.xcode/server/...` 这类首次连接路径，上传会因为目录不存在而失败。 |
| `packages/services/src/git/repo/gitCheckpointRepo.ts` | 1 | 1 | — | `xcode checkpoint ${params.checkpointId}`, |
| `packages/services/src/remote-sync/remoteSyncWriteAccess.ts` | 1 | 1 | — | const markerPath = join(directoryPath, `.xcode-sync-preflight-${process.pid}-${randomUUID( |
| `packages/services/src/zcode-agent/modelTrajectory.ts` | 1 | 1 | — | * 解析 ~/.xcode/cli/{debug,rollout} 下的 model-io JSONL，按 sessionId 还原某个 task 的模型调用轨迹。 |
| `packages/shared/src/onboardingRecord.ts` | 1 | 1 | — | * - 独立本地 JSON（~/.xcode/v2/onboarding-record.json），不混入 AppSettings； |
| `packages/shared/src/runtimeEnv.ts` | 1 | 1 | — | // 解析全局 ~/.xcode/cli/config.json 里的 `zcode-cua` server 之前就会先 sanitize process.env，导致 |
| `packages/shared/src/skill-scan-policy.ts` | 1 | 1 | — | * 技能目录（含 ~/.xcode/skills 等）下默认不进入以 . 开头的子目录， |
| `packages/shared/src/skills-types.ts` | 1 | 1 | — | * 软链导入的技能里 `path` 是 realpath 后的目标文件，`sourcePath` 才指向 `~/.xcode/skills/<name>` 下的链接本体， |
| `packages/shared/src/storage.ts` | 1 | 1 | — | /** 两个数据根：用户家目录下的 .xcode，以及「数据存储路径」下的 .xcode。 */ |
| `packages/shared/src/workspace-hook-mutation.ts` | 1 | 1 | — | source.configFileKind !== ".xcode/config.json" \|\| |
| `packages/ui/src/assets.d.ts` | 1 | 0 | — | declare module "*.jpg"; |
| `packages/ui/src/components/ui/dialog.tsx` | 1 | 0 | — | data-ds-part="dialog" |
| `packages/ui/src/lib/windowsFileLinkEscapeRemarkPlugin.ts` | 1 | 1 | — | * `[x](C:\Users\developer\.xcode\a.png)` 在 remark-parse 阶段就会把 `\.` |
| `packages/ui/src/lib/zcodeFileCitationRemarkPlugin.ts` | 1 | 1 | — | export function createXCodeFileCitationRemarkPlugin( |
| `packages/ui/src/onboarding/OccupationOnboarding.tsx` | 1 | 0 | — | import { DesktopCommandIds } from "@zcode/shared"; |
| `packages/ui/src/settings/saved-workflows/useSavedWorkflowGlobalGroup.ts` | 1 | 1 | — | // 目录监听：list 回的绝对目录（`~/.xcode/workflows`）本机可直接 watch。 |
| `packages/ui/src/store/zcodeSessionStoreTaskSlice.ts` | 1 | 1 | — | // 完整错误对象之前只放在 ChatView/useXCodeChat 的本地 state。 |
| `packages/ui/src/UpdateStatusDialog.tsx` | 1 | 1 | — | const marker = "__XCODE_UPDATE_VERSION__"; |
| `packages/ui/src/v4/ConversationDraftSuggestedPrompts.tsx` | 1 | 1 | — | <ul className="m-0 flex list-none flex-col p-0" data-ds-part="home-hero"> |
| `packages/ui/src/WorkspaceSidebar/WorkspaceSidebarCollapsedRail.tsx` | 1 | 1 | — | import appLogoUrl from "@/assets/X.svg"; |
| `packages/desktop/src/main/zcodeDataSizeWorker.ts` | 0 | 0 | — | — |
| `packages/desktop/src/main/zcodeDataSizeWorkerClient.ts` | 0 | 0 | — | — |
| `packages/ui/src/app-shell/useWorkspaceSessionReload.ts` | 0 | 0 | — | — |
| `packages/ui/src/hooks/useWorkspacePrepare.ts` | 0 | 0 | — | — |
| `packages/ui/src/hooks/workspacePrepareRpc.ts` | 0 | 0 | — | — |
| `packages/ui/src/hooks/workspaceTaskListOptimisticOverlay.ts` | 0 | 0 | — | — |
| `packages/ui/src/lib/launchToInputReport.ts` | 0 | 0 | — | — |
| `packages/ui/src/lib/productDocs.ts` | 0 | 0 | — | — |
| `packages/ui/src/lib/remoteWorkspaceSessionRuntime.ts` | 0 | 0 | — | — |
| `packages/ui/src/onboarding/OccupationOnboardingVisual.tsx` | 0 | 0 | — | — |
| `packages/ui/src/store/index.ts` | 0 | 0 | — | — |
| `packages/ui/src/store/zcodeSessionStoreNavigation.ts` | 0 | 0 | — | — |
| `packages/ui/src/v4/conversationShareMarkdown.ts` | 0 | 0 | — | — |
| `packages/web/src/auth/webAuthService.ts` | 0 | 0 | — | — |
| `packages/web/src/env.d.ts` | 0 | 0 | — | — |
| `packages/zcode-server-cli/src/server-core/serverIdentity.ts` | 0 | 0 | — | — |