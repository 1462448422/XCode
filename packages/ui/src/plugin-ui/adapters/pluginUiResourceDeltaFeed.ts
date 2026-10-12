import { dispatchPluginUiResourceDelta } from "@/plugin-ui/app/pluginUiResourceNotificationBus.js";
import { buildPluginUiSessionKey, type PluginUiSessionScope } from "@/plugin-ui/contract.js";
import type { ConversationProjectionStore } from "@/v4/conversationProjectionStore.js";
import { useEffect } from "react";

/**
 * æä¸ä¸ªä¼è¯æå½± store ç live-only å¢éæ¥å°èµæºéç¥è·¯ç±è¡¨ã
 * åä¸ store å¯è½è¢« SessionPane ä¸å¤ä¸ªä¾§æ  tab åæ¶ææï¼æ store å¼ç¨è®¡æ°åªæä¸ä¸ªçå¬ï¼é¿åéå¤æéã
 */
const feeds = new Map<ConversationProjectionStore, { count: number; off: () => void }>();

export function attachPluginUiResourceDeltaFeed(
  store: ConversationProjectionStore,
  scope: PluginUiSessionScope,
): () => void {
  let entry = feeds.get(store);
  if (!entry) {
    const sessionKey = buildPluginUiSessionKey(scope);
    const off = store.onLiveDeltas((deltas) => {
      for (const delta of deltas) {
        if (
          delta.op === "pluginUi.resourceUpdated" ||
          delta.op === "pluginUi.resourceListChanged" ||
          delta.op === "pluginUi.appToolCall" ||
          delta.op === "pluginUi.instanceClosed"
        ) {
          dispatchPluginUiResourceDelta(sessionKey, delta);
        }
      }
    });
    entry = { count: 0, off };
    feeds.set(store, entry);
  }
  const active = entry;
  active.count += 1;
  return () => {
    active.count -= 1;
    if (active.count === 0 && feeds.get(store) === active) {
      active.off();
      feeds.delete(store);
    }
  };
}

export function usePluginUiResourceDeltaFeed(
  store: ConversationProjectionStore | null | undefined,
  scope: PluginUiSessionScope | null,
): void {
  const sessionKey = scope ? buildPluginUiSessionKey(scope) : null;
  useEffect(() => {
    if (!store || !scope) return;
    return attachPluginUiResourceDeltaFeed(store, scope);
    // scope æä¼è¯é®æ¯è¾ï¼SessionPane æ¯æ¬¡æ¸²æå¯è½æ°å»ºå¯¹è±¡ï¼ï¼ä¸æå¯¹è±¡æ¬èº«æ¾è¿ä¾èµã
  }, [store, sessionKey]);
}
