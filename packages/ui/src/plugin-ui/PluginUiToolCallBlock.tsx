import type { ToolCallBlockRenderContext } from "@/ToolCallBlocks/fileSummaryTypes.js";
import { McpToolCallBlock } from "@/ToolCallBlocks/renderers/mcp.js";
import { usePluginUiToolCallModel } from "@/plugin-ui/adapters/usePluginUiToolCallModel.js";
import { PluginUiToolCallView } from "@/plugin-ui/components/PluginUiToolCallBlock.js";
import { readPluginUiPresentation } from "@/plugin-ui/domain/readPluginUiPresentation.js";

/** å®¿ä¸»å·¥å·è¡æ¸²æææ§½ï¼æ®é MCP å¡çä½ä¸ºæ¨¡åå¤çå±ç¤ºä¾èµæ³¨å¥ã */
export function PluginUiToolCallBlock(context: ToolCallBlockRenderContext) {
  const model = usePluginUiToolCallModel(context);
  return <PluginUiToolCallView {...model} fallback={<McpToolCallBlock {...context} />} />;
}
export function shouldRenderPluginUi(
  context: Pick<ToolCallBlockRenderContext, "toolCallNode" | "pluginUi">,
): boolean {
  return Boolean(
    context.pluginUi?.scope.sessionId &&
    readPluginUiPresentation(context.toolCallNode.toolCall.raw),
  );
}
