import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { XCodeProvider } from "@zcode/shared";
import { logger } from "@/logger.js";
import { shouldEnableWorkspaceRpc } from "@/lib/workspaceRpcAvailability.js";
import { useXCodeTaskService } from "@/hooks/useXCodeTaskService.js";
import { useRemoteWorkspaceSessionStore } from "@/store/remoteWorkspaceSessionStore.js";
import { useResolvedRemoteWorkspaceSessionId } from "@/hooks/useResolvedRemoteWorkspaceSessionId.js";
import type { IXCodeTaskService } from "@zcode/services";

interface WorkspaceProviderConfigFileState {
  path: string | null;
  exists: boolean;
  loading: boolean;
  error: string | null;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message || error.name || String(error);
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  return String(error);
}

const INITIAL_STATE: WorkspaceProviderConfigFileState = {
  path: null,
  exists: false,
  loading: true,
  error: null,
};

type WorkspaceProviderConfigServiceScope = "workspace" | "base";

export function resolveWorkspaceProviderConfigZCodeService(params: {
  configuredServiceScope: WorkspaceProviderConfigServiceScope;
  workspaceZCodeService: IXCodeTaskService;
  baseZCodeService: IXCodeTaskService | null;
  remoteSessionId: string | null;
}): IXCodeTaskService | null {
  if (params.configuredServiceScope === "workspace") {
    return params.workspaceZCodeService;
  }

  if (params.baseZCodeService) {
    return params.baseZCodeService;
  }

  // Bugfix: è¿ç¨ workspace ä¸å¦æè¯¯åéå° workspaceZCodeServiceï¼
  // âåå¾éç½®âä¼è¯»å°è¿ç«¯ç»å¯¹è·¯å¾ï¼å¦ /root/...ï¼ï¼æ¬æºæ æ³æ­£ç¡®æå¼ã
  // è¿éå¨è¿ç¨ä¼è¯éä¸¥æ ¼è¦æ± baseZCodeServiceï¼å°±ç»ªååç­å¾ï¼ä¸ååé©èµ°éè¯¯ fallbackã
  if (params.remoteSessionId) {
    return null;
  }

  return params.workspaceZCodeService;
}

/**
 * è¯»åå½å workspace + provider çä¸»éç½®æä»¶è·¯å¾ã
 *
 * ç»ä¸éè¿ zcodeTaskService è·åè·¯å¾è§åï¼é¿å UI å±æ¼æ¥ provider éç½®è·¯å¾ã
 */
export function useWorkspaceProviderConfigFile(
  workspacePath: string,
  provider: XCodeProvider,
  preferredRemoteSessionId?: string | null,
  workspaceIdentity?: string,
  options?: {
    serviceScope?: "workspace" | "base";
    enabled?: boolean;
  },
) {
  const workspaceZCodeService = useXCodeTaskService(
    workspacePath,
    preferredRemoteSessionId,
    workspaceIdentity,
  );
  const configuredServiceScope = options?.serviceScope ?? "workspace";
  const enabled = options?.enabled ?? true;
  const remoteSessionId = useResolvedRemoteWorkspaceSessionId(
    workspacePath,
    preferredRemoteSessionId,
    workspaceIdentity,
  );
  const baseZCodeService = useRemoteWorkspaceSessionStore(
    (state) => state.baseServices?.zcodeTaskService ?? null,
  );
  const workspaceRpcEnabled = shouldEnableWorkspaceRpc({
    workspaceIdentity,
    remoteSessionId,
  });
  const zcodeTaskService = resolveWorkspaceProviderConfigZCodeService({
    configuredServiceScope,
    workspaceZCodeService,
    baseZCodeService,
    remoteSessionId,
  });
  const zcodeServiceScope =
    configuredServiceScope === "base"
      ? "base"
      : remoteSessionId && workspaceZCodeService !== baseZCodeService
        ? "remote"
        : "base";
  const [state, setState] =
    useState<WorkspaceProviderConfigFileState>(INITIAL_STATE);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const requestVersionRef = useRef(0);

  const refresh = useCallback(() => {
    setRefreshVersion((current) => current + 1);
  }, []);

  useEffect(() => {
    let disposed = false;

    if (!workspacePath || !enabled || !workspaceRpcEnabled) {
      requestVersionRef.current += 1;
      // Bugfix: æ¢å¤æ­è¿è¿ç«¯ workspace æ¶ï¼provider éç½®è·¯å¾è¯»åä¸è½æ¢å¨ remote session
      // ç»å®åè®¿é®æ­è¿ä»£çï¼å¦åä¼æ XCODE_REMOTE_WORKSPACE_DISCONNECTED è®°å½æéç½®è¯»åå¤±è´¥ã
      setState({
        path: null,
        exists: false,
        loading: false,
        error: null,
      });
      return () => {
        disposed = true;
      };
    }

    if (!zcodeTaskService) {
      requestVersionRef.current += 1;
      setState({
        path: null,
        exists: false,
        loading: true,
        error: null,
      });
      return () => {
        disposed = true;
      };
    }

    const requestVersion = requestVersionRef.current + 1;
    requestVersionRef.current = requestVersion;

    // Bugfix: provider åæ¢æ¶å¦æä¿çæ§ pathï¼ç¨æ·ä¼å¨æ°è¯·æ±è¿ååè¯¯ç¹å°ä¸ä¸ä¸ª provider çéç½®æä»¶ã
    // è¿éå¨åèµ·è¯·æ±æ¶ç«å³æ¸ç©º path/existsï¼éå requestVersion ä»æ¥åææ°ååºï¼é¿åæ§ç»æååã
    setState({
      path: null,
      exists: false,
      loading: true,
      error: null,
    });

    logger.info(
      `[useWorkspaceProviderConfigFile] å¼å§è¯»å provider éç½®è·¯å¾ workspace=${workspacePath} provider=${provider} scope=${zcodeServiceScope} session=${remoteSessionId ?? "none"}`,
    );

    void zcodeTaskService
      .getWorkspaceProviderConfigFile({
        workspacePath,
        ...(workspaceIdentity ? { workspaceIdentity } : {}),
        provider,
      })
      .then((result) => {
        if (disposed || requestVersionRef.current !== requestVersion) {
          return;
        }

        logger.info(
          `[useWorkspaceProviderConfigFile] è¯»å provider éç½®è·¯å¾æå workspace=${workspacePath} provider=${provider} scope=${zcodeServiceScope} session=${remoteSessionId ?? "none"} exists=${result.exists} path=${result.path}`,
        );

        setState({
          path: result.path,
          exists: result.exists,
          loading: false,
          error: null,
        });
      })
      .catch((error: unknown) => {
        if (disposed || requestVersionRef.current !== requestVersion) {
          return;
        }

        const message = getErrorMessage(error);
        logger.warn("[useWorkspaceProviderConfigFile] è¯»å provider éç½®è·¯å¾å¤±è´¥", {
          workspacePath,
          provider,
          scope: zcodeServiceScope,
          remoteSessionId,
          error: message,
        });
        setState({
          path: null,
          exists: false,
          loading: false,
          error: message,
        });
      });

    return () => {
      disposed = true;
    };
  }, [
    zcodeTaskService,
    zcodeServiceScope,
    enabled,
    provider,
    refreshVersion,
    remoteSessionId,
    workspaceIdentity,
    workspacePath,
    workspaceRpcEnabled,
  ]);

  // Bugfix: provider éç½®ç¶æä¼ç»§ç»­ä½ä¸º Shell/Header/Menu props éä¼ ã
  // å­æ®µæªåæ¶å¤ç¨è¿åå¯¹è±¡ï¼é¿åç¶çº§æ å³éæ¸²è®©ä¸æ¸¸ memo ç»ä»¶è¯¯å¤éç½®ç¶æååã
  return useMemo(
    () => ({
      ...state,
      refresh,
    }),
    [refresh, state],
  );
}
