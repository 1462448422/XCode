import { useCallback, useEffect, useRef, useState } from "react";
import type { EmbeddedBrowserSitePermissionsSnapshot } from "@zcode/shared";
import { usePlatform } from "@/hooks/usePlatform.js";
import { logger } from "@/logger.js";

type WriteOperation =
  | { kind: "set"; permission: string; state: "allow" | "deny" | "ask" }
  | { kind: "reset" };
type WriteState =
  | { status: "idle" }
  | { status: "pending" | "failed" | "succeeded"; operation: WriteOperation };

/** main ç«ç¹æé store æ¯å¯ä¸ææç¶ææºï¼hook åªææè¯»åæå½±åç¨æ·æä½çè¿åº¦ã */
export function useBrowserSitePermissions(origin: string, enabled: boolean) {
  const platform = usePlatform();
  const [states, setStates] = useState<Record<string, "allow" | "deny"> | null>(null);
  const [error, setError] = useState(false);
  const [writeState, setWrite] = useState<WriteState>({ status: "idle" });
  const pendingWrite = useRef<WriteOperation | null>(null);
  const generation = useRef(0);
  const supported =
    !!platform.getEmbeddedBrowserSitePermissions &&
    !!platform.setEmbeddedBrowserSitePermission &&
    !!platform.resetEmbeddedBrowserSitePermission;

  useEffect(() => {
    setWrite({ status: "idle" });
    // éèæ ç­¾ä¸åæ¶å·²æäº¤åå¥ï¼åªæç®æ ç«ç¹/å¹³å°æ´æ¢æå¸è½½æè®©æ§æä½å¤±å» UI å½å±ã
    return () => {
      pendingWrite.current = null;
    };
  }, [origin, platform]);

  const refresh = useCallback(async () => {
    if (!enabled || !platform.getEmbeddedBrowserSitePermissions) return;
    const current = ++generation.current;
    try {
      const snapshot: EmbeddedBrowserSitePermissionsSnapshot =
        await platform.getEmbeddedBrowserSitePermissions();
      if (current !== generation.current) return;
      setStates(snapshot[origin] ?? {});
      setError(false);
    } catch (cause) {
      if (current !== generation.current) return;
      setError(true);
      logger.warn("[browser-permissions] settings read failed", cause);
    }
  }, [enabled, origin, platform]);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
    return () => {
      generation.current++;
    };
  }, [enabled, origin, platform, refresh]);

  async function run(operation: WriteOperation) {
    if (!enabled || !supported || pendingWrite.current) return;
    // React ç¶æå°æªæ¸²ææ¶ä¹åªæ¥åä¸æ¬¡ç¹å»ï¼è¯¥å¼ç¨åæ¶æ è¯å¼æ­¥å®ææå±çæä½ã
    pendingWrite.current = operation;
    setWrite({ status: "pending", operation });
    try {
      if (operation.kind === "reset") {
        await platform.resetEmbeddedBrowserSitePermission!({ origin });
      } else {
        await platform.setEmbeddedBrowserSitePermission!({
          origin,
          permission: operation.permission,
          state: operation.state,
        });
      }
    } catch (cause) {
      logger.warn("[browser-permissions] settings write failed", cause);
      if (pendingWrite.current === operation) {
        pendingWrite.current = null;
        setWrite({ status: "failed", operation });
      }
      return;
    }
    if (pendingWrite.current !== operation) return;
    // åå¥åéè¯»çå¤±è´¥å±äºä¸åæä½ãå·²æååå¥ä¸è½å è¯»åå¤±è´¥è¢«åæ¬¡æäº¤ã
    await refresh();
    if (pendingWrite.current !== operation) return;
    pendingWrite.current = null;
    setWrite({ status: "succeeded", operation });
  }

  return {
    states,
    error,
    refresh,
    supported,
    write: writeState,
    setPermission: (permission: string, setting: "ask" | "allow" | "block") =>
      run({ kind: "set", permission, state: setting === "block" ? "deny" : setting }),
    reset: () => run({ kind: "reset" }),
    retryWrite: async () => {
      if (writeState.status === "failed") await run(writeState.operation);
    },
  };
}
