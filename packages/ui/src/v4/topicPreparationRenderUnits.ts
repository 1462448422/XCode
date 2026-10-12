import type { BotTopicPreparation as Preparation } from "@zcode/shared";
import type { ConversationRow } from "@zcode/shared/zcode-protocol-v4";
import type { ConversationTurnRenderUnit } from "@/v4/conversationTurnRenderUnits.js";

export function pendingTopicPreparations(
  items: readonly Preparation[],
  rows: readonly ConversationRow[],
) {
  const acceptedIds = new Set<string>();
  for (const row of rows) {
    if (row.kind !== "userInput" || !row.botGroupSource) continue;
    acceptedIds.add(row.botGroupSource.messageId);
    for (const message of row.botGroupSource.messages ?? []) acceptedIds.add(message.messageId);
  }
  // å¤±è´¥ææä¸åæå½±ä¸ºä¸´æ¶æ¶æ¯ï¼è¿åæ¥æºä¸èµ·ç§»é¤ï¼é¿åæ®çç©ºç½è½®æ¬¡æéè¯¯åã
  return items.filter((item) => item.status !== "failed" && !acceptedIds.has(item.messageId));
}

/** åå¤æ¶æ¯è¿å¥ç°æè½®æ¬¡çæ¶æ¯æµåæµé«/æ»å¨é¾è·¯ï¼ä¸ä¼ªé  CLI accepted rowã */
export function withTopicPreparationMessages(
  units: ConversationTurnRenderUnit[],
  rows: readonly ConversationRow[],
  items: readonly Preparation[],
): ConversationTurnRenderUnit[] {
  const pending = pendingTopicPreparations(items, rows);
  if (!pending.length) return units;
  const last = units.at(-1);
  if (last) return [...units.slice(0, -1), { ...last, topicPreparations: pending }];
  // å°æ  CLI æ¶æ¯æ¶åªåå»ºæ¬å°å±ç¤ºååï¼ä¸äº§çä»»å¡ãè½®æ¬¡æå¯ç¼è¾çåæ¶æ¯ã
  return [
    {
      key: "topic-preparation",
      turnId: "topic-preparation",
      topicPreparations: pending,
      visibleUserInputs: [],
      assistantWorkRows: [],
      assistantHistoryRows: [],
      assistantFollowingRows: [],
      assistantTailRows: [],
      browserTurnEndRows: [],
      hookInvocations: [],
      assistantTextRows: [],
      leadingBoundaryRows: [],
      flowItems: [],
      renderRows: [],
      isLastTurn: true,
      isRunning: false,
      assistantHistoryDefaultOpen: false,
      timelineOnly: true,
    },
  ];
}
