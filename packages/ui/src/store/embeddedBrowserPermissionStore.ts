import { create } from "zustand";
import type { EmbeddedBrowserPermissionPromptEvent } from "@zcode/shared";

/**
 * åç½®æµè§å¨æéå¼¹çªéåï¼main ç» IPC æ¨éè¯·æ±ï¼ç¨æ·æä½åç±ç»ä»¶åä¼ å³ç­å¹¶åºéã
 * main ä¾§å·²åå origin+æéå»éä¸ 10s è¶æ¶ï¼è¿éåªè´è´£æ¸²æææéã
 */
interface EmbeddedBrowserPermissionState {
  prompts: EmbeddedBrowserPermissionPromptEvent[];
  receivePrompt: (event: EmbeddedBrowserPermissionPromptEvent) => void;
  /** åä¸ requestId è¢« main è¶æ¶ç»ç®åï¼renderer ä¾§åæ­¥åºéï¼ä¸ä¸æ¬¡æ¨éä¸åå½±åï¼ã */
  dropPrompt: (requestId: string) => void;
}

export const useEmbeddedBrowserPermissionStore = create<EmbeddedBrowserPermissionState>((set) => ({
  prompts: [],
  // å requestId çæ¨éæ¯åè¡¨ç­æ´æ°ï¼èçæ«æ/USB æä¸¾è¿ç»­ fireï¼ï¼æ¿æ¢èéè¿½å ã
  receivePrompt: (event) =>
    set((state) => ({
      prompts: state.prompts.some((prompt) => prompt.requestId === event.requestId)
        ? state.prompts.map((prompt) => (prompt.requestId === event.requestId ? event : prompt))
        : [...state.prompts, event],
    })),
  dropPrompt: (requestId) =>
    set((state) => ({ prompts: state.prompts.filter((prompt) => prompt.requestId !== requestId) })),
}));
