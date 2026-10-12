import {
  normalizeAgentProviderToXCodeAgent,
  normalizeAgentProvidersToXCodeAgent,
  type XCodeProvider,
  type AppSettings,
} from "@zcode/shared";
const INSTALLABLE_AGENT_CLI_PROVIDERS: XCodeProvider[] = [];

export type BuiltinAgentCliStatus =
  | "enabled"
  | "enabling"
  | "disabling"
  | "disabled";

function normalizeEnabledBuiltinAgentCliProviders(
  providers?: ReadonlyArray<XCodeProvider>,
): XCodeProvider[] {
  return normalizeAgentProvidersToXCodeAgent(providers);
}

export function getEnabledBuiltinAgentCliProviders(
  settings: Pick<AppSettings, "enabledBuiltinAgentCliProviders"> | null | undefined,
): XCodeProvider[] {
  return normalizeEnabledBuiltinAgentCliProviders(
    settings?.enabledBuiltinAgentCliProviders,
  );
}

export function requiresBuiltinAgentCliInstall(provider: XCodeProvider): boolean {
  return INSTALLABLE_AGENT_CLI_PROVIDERS.includes(provider);
}

export function resolveBuiltinAgentCliStatus(params: {
  provider: XCodeProvider;
  enabledProviders: readonly XCodeProvider[];
  enablingProvider: XCodeProvider | null;
  disablingProvider: XCodeProvider | null;
}): BuiltinAgentCliStatus {
  // Bugfix: éå®è£ååç½® agent provider å·²ç»ç±å½åè¿è¡æ¶æä¾ï¼ä¸ä¾èµ settings.enabledBuiltinAgentCliProvidersã
  // è¿éç»ä¸è¿å enabledï¼é¿åè®¾ç½®ç¼ºçãç­æ´æ°ææ§éç½®æ glm è¯¯å¤æ disabled å¹¶éä½åéå¥å£ã
  if (!requiresBuiltinAgentCliInstall(params.provider)) {
    return "enabled";
  }

  if (params.enablingProvider === params.provider) {
    return "enabling";
  }

  if (params.disablingProvider === params.provider) {
    return "disabling";
  }

  return params.enabledProviders.includes(params.provider) ? "enabled" : "disabled";
}

export function getEffectiveBuiltinAgentCliProvider(
  _settings: Pick<AppSettings, "enabledBuiltinAgentCliProviders"> | null | undefined,
  provider: XCodeProvider,
): XCodeProvider {
  // Bugfix: workspace/store éç selectedProvider å¯è½æ®çæ§ä¸æ¹ providerã
  // å¦æ UI ç»§ç»­ç´æ¥æ¶è´¹è¿ä¸ªå¼ï¼èååä»»å¡åå»ºä¼ææ§ agent å½ä½å¯ç¨ç¶æã
  // è¿éç»ä¸åéå°å§ç»å¯ç¨ç glmï¼é¿å UI ç¶æå agent server åä¸äºå®æºååã
  return normalizeAgentProviderToXCodeAgent(provider);
}
