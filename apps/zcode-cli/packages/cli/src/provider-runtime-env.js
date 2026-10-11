import { existsSync, realpathSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { materializeXCodeBuiltinProviderConfig, NodeXCodeBuiltinProviderConfigSource, PERSONAL_PROVIDER_CONFIG_FILE_NAME, resolveXCodeBuiltinCachePaths, resolveXCodeBuiltinClientPlatform, XCODE_BUILTIN_PROVIDER_BUNDLED_CONFIG_FILE_ENV, XCODE_BUILTIN_PROVIDER_CONFIG_FILE_ENV, XCODE_PERSONAL_PROVIDER_CONFIG_FILE_ENV, } from "@zcode/provider-node";
import { resolveRuntimeXCodeEndpointOrigin, XCODE_VERSION } from "@zcode/shared";
export const SEA_XCODE_BUILTIN_PROVIDER_CONFIG_ASSET_KEY = "zcode-provider/zcode-builtin.json";
export function createCliProviderRefreshReporter(stderr = process.stderr) {
    return {
        onBuiltinRefreshError(error) {
            stderr.write(`XCode Built-in 刷新失败: ${error instanceof Error ? error.message : "unknown error"}\n`);
        },
        onBuiltinRefreshResult(event) {
            // TTL 检查不是生产事件；成功更新才默认留痕，不能输出 CDN URL 查询参数或内容。
            if (event.result === "updated" || process.env.NODE_ENV !== "production") {
                stderr.write(`XCode Built-in ${event.result}${event.reason ? ` (${event.reason})` : ""}${event.revision === undefined ? "" : ` revision=${event.revision} source=CDN`}\n`);
            }
        },
    };
}
/** 为运行 Core 或写入模型选择的 CLI Entry 定位同一 Environment 的 Provider Config。 */
export async function prepareCliProviderRuntimeEnv(options) {
    if (!requiresProviderRuntime(options.argv))
        return {};
    const explicitXCodeBuiltin = options.env[XCODE_BUILTIN_PROVIDER_CONFIG_FILE_ENV]?.trim();
    const explicitPersonal = options.env[XCODE_PERSONAL_PROVIDER_CONFIG_FILE_ENV]?.trim();
    const dataBaseDir = options.dataBaseDir ?? options.env.XCODE_DATA_BASE_DIR?.trim() ?? homedir();
    if (explicitXCodeBuiltin && explicitPersonal) {
        return {
            [XCODE_BUILTIN_PROVIDER_CONFIG_FILE_ENV]: explicitXCodeBuiltin,
            [XCODE_PERSONAL_PROVIDER_CONFIG_FILE_ENV]: explicitPersonal,
        };
    }
    const zcodeBuiltinFilePath = explicitXCodeBuiltin ??
        (await resolveBundledXCodeBuiltinProviderConfig({
            dataBaseDir,
            entrypoint: options.entrypoint ?? process.argv[1],
            sea: options.sea ?? getSeaProviderConfigAssets(),
        }));
    const personalFilePath = explicitPersonal ?? join(dataBaseDir, ".xcode", "v2", PERSONAL_PROVIDER_CONFIG_FILE_NAME);
    const appVersion = options.appVersion ?? XCODE_VERSION;
    const platform = options.platform ?? resolveXCodeBuiltinClientPlatform();
    const zcodeEndpointOrigin = resolveRuntimeXCodeEndpointOrigin(options.env);
    const cachePaths = resolveXCodeBuiltinCachePaths({
        environmentConfigRoot: join(dataBaseDir, ".xcode", "v2"),
        platform,
        appVersion,
        zcodeEndpointOrigin,
    });
    const source = new NodeXCodeBuiltinProviderConfigSource({
        bundledFilePath: zcodeBuiltinFilePath,
        activeFilePath: cachePaths.activeFilePath,
        watch: false,
    });
    // 入口只准备资源和路径；下载由 Prompt/TUI 长生命周期 Runtime 持有并取消。
    try {
        await source.read();
    }
    finally {
        source.dispose();
    }
    return {
        [XCODE_BUILTIN_PROVIDER_CONFIG_FILE_ENV]: cachePaths.activeFilePath,
        [XCODE_BUILTIN_PROVIDER_BUNDLED_CONFIG_FILE_ENV]: zcodeBuiltinFilePath,
        [XCODE_PERSONAL_PROVIDER_CONFIG_FILE_ENV]: personalFilePath,
    };
}
function requiresProviderRuntime(argv) {
    if (argv.some((arg) => arg === "--help" || arg === "-h" || arg === "--version" || arg === "-v")) {
        return false;
    }
    if (argv.some((arg) => arg === "--prompt" ||
        arg.startsWith("--prompt=") ||
        arg === "--target" ||
        arg.startsWith("--target="))) {
        return true;
    }
    const command = argv[0];
    if (command === undefined || command.startsWith("-"))
        return true;
    return (command === "tui" ||
        command === "app-server" ||
        command === "agent-server" ||
        command === "login" ||
        command === "logout");
}
async function resolveBundledXCodeBuiltinProviderConfig(input) {
    if (input.sea?.isSea()) {
        const content = input.sea.getAsset(SEA_XCODE_BUILTIN_PROVIDER_CONFIG_ASSET_KEY, "utf8");
        return materializeXCodeBuiltinProviderConfig({
            environmentConfigRoot: join(input.dataBaseDir, ".xcode", "v2"),
            content,
        });
    }
    const entrypoint = input.entrypoint?.trim();
    if (!entrypoint)
        throw new Error("无法定位 CLI XCode Built-in Provider Config：缺少入口路径");
    // 全局 bin 可以是软链接，随包配置必须相对真实入口定位。
    const entryDirectory = dirname(realpathSync(resolve(entrypoint)));
    const candidates = [
        join(entryDirectory, "provider", "zcode-builtin.json"),
        resolve(entryDirectory, "../../../../../config/provider/zcode-builtin.json"),
    ];
    const candidate = candidates.find((filePath) => existsSync(filePath));
    if (candidate)
        return candidate;
    throw new Error(`无法定位 CLI XCode Built-in Provider Config：${candidates.join(", ")}`);
}
function getSeaProviderConfigAssets() {
    const getBuiltinModule = process.getBuiltinModule;
    return getBuiltinModule?.("node:sea");
}
