import { genUiReferenceSchema, type GenUiReference } from "@zcode/shared/gen-ui";
import {
  extractAssistantDirectives,
  findAssistantDirectivePrefixStart,
  findMarkdownCodeRanges,
  findUnclosedAssistantDirectiveStart,
} from "../../lib/assistantDirectiveParser.js";
export type GenUiPart =
  | { kind: "text"; text: string }
  | { kind: "ui"; reference: GenUiReference; offset: number }
  | { kind: "pending" | "invalid" };
interface ReferenceCandidate {
  start: number;
  end: number;
  decode(): unknown;
}
// å¼ç¨å­æ®µåä¸ºå­ç¬¦ä¸²ï¼å®æ´å­ç¬¦ä¸²åä»å¯è½åå¨ keyãåå·ãvalue æéå·å¤ã
// ä»è¯å« JSON åæ°åç¼ï¼ä¸è½æç¼ºå¤±å³æ¬å·ååºç°çæ®éæ­£æä¸èµ·éèã
const jsonString = String.raw`"(?:[^"\\\r\n]|\\.)*"`;
const jsonParameterPrefix = new RegExp(
  String.raw`^\s*(?:${jsonString}\s*:\s*${jsonString}\s*,\s*)*(?:${jsonString}(?:\s*:\s*(?:${jsonString})?)?)?\s*$`,
);
export function projectGenUiReferences(text: string, completed: boolean): GenUiPart[] {
  const ranges = findMarkdownCodeRanges(text);
  const parts: GenUiPart[] = [];
  // å®éæ¨¡åå³ä½¿è¯»å° Unicode ç¤ºä¾ä¹ä¼è¾åº ::visualizeï¼å¤ç¨æ¢æåæ°è§£æåç»ä¸æ ¡éªï¼
  // é¿åæ­£æè¢«å½ä½æ®éæå­ï¼ä¹é¿åç»è¿ä»£ç åºæé¤ãå®æé¨æ§ææ§è¡ç«¯è·¯å¾çº¦æã
  const candidates: ReferenceCandidate[] = extractAssistantDirectives(text, "visualize").map(
    (directive) => ({
      ...directive,
      // å®éåå¤ä¼ä¿ç skill ç JSON åæ°ä½è¾åº ::visualize åç¼ï¼éç¨ directive
      // åªè§£æ key=valueï¼éå¨ Gen UI åè§£ç  JSONï¼åèµ°åä¸ä¸¥æ ¼ schemaï¼ä¸è½æ¾å®½å¶ä»æä»¤ã
      decode: () =>
        directive.parameters ?? JSON.parse(directive.raw.slice(directive.raw.indexOf("{"))),
    }),
  );
  const unclosed = findUnclosedAssistantDirectiveStart(text, "visualize", ranges, {
    isParameterPrefix: (source) => jsonParameterPrefix.test(source),
  });
  if (unclosed !== null) candidates.push({ start: unclosed, end: text.length, decode: () => null });
  for (const match of text.matchAll(/îvisualizeî/gu)) {
    const start = match.index;
    const end = text.indexOf("î", start + match[0].length);
    candidates.push({
      start,
      end: end < 0 ? text.length : end + 1,
      decode: () => (end < 0 ? null : JSON.parse(text.slice(start + match[0].length, end))),
    });
  }
  let cursor = 0;
  for (const candidate of candidates.sort((left, right) => left.start - right.start)) {
    const { start, end } = candidate;
    if (ranges.some(([from, to]) => start >= from && start < to) || start < cursor) continue;
    if (start > cursor) parts.push({ kind: "text", text: text.slice(cursor, start) });
    cursor = end;
    if (!completed) {
      parts.push({ kind: "pending" });
      continue;
    }
    try {
      const reference = genUiReferenceSchema.parse(candidate.decode());
      parts.push({ kind: "ui", reference, offset: start });
    } catch {
      parts.push({ kind: "invalid" });
    }
  }
  let tailEnd = text.length;
  if (!completed) {
    const prefix = findAssistantDirectivePrefixStart(text, ["visualize"], ranges);
    if (prefix !== null && prefix >= cursor) tailEnd = prefix;
    const index = text.lastIndexOf("î");
    if (
      index >= cursor &&
      !ranges.some(([from, to]) => index >= from && index < to) &&
      "îvisualizeî".startsWith(text.slice(index))
    )
      tailEnd = Math.min(tailEnd, index);
  }
  const tail = text.slice(cursor, tailEnd);
  if (tail) parts.push({ kind: "text", text: tail });
  return parts;
}
