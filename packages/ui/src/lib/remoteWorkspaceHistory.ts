/* eslint-disable max-lines -- è¿ç«¯ workspace åå²éä¸­ç»´æ¤æä¹åãå­æ®å MCP è·¯å¾æ å°åæ°æ®ï¼æåä¼æ©å¤§æ¢å¤é¾è·¯åå½é¢ã */
import type {
  AppSettings,
  PersistedWorkspaceSessionEntry,
  RemoteTarget,
  RemoteTargetSnapshot,
  RemoteWorkspaceSessionEntry,
} from "@zcode/shared";
import { buildServerRemoteWorkspaceIdentity } from "@zcode/shared";
import type { WindowTabState } from "@/store/tabStore.js";
import { isWorkspaceTab } from "@/store/tabStore.js";

const REMOTE_WORKSPACE_SESSION_LIMIT = 20;

interface RemoteWorkspaceSessionMutation {
  entry: RemoteWorkspaceSessionEntry;
  nextRemoteSessions: RemoteWorkspaceSessionEntry[];
  credentialsToSave: {
    key: string;
    value: string;
  }[];
  credentialKeysToDelete: string[];
}

interface RemoveRemoteWorkspaceSessionEntriesResult {
  nextRemoteSessions: RemoteWorkspaceSessionEntry[];
  credentialKeysToDelete: string[];
}

function buildRemoteWorkspacePasswordCredentialKey(workspaceKey: string): string {
  return `remote-workspace:${workspaceKey}:password`;
}

function buildRemoteWorkspacePrivateKeyPassphraseCredentialKey(workspaceKey: string): string {
  return `remote-workspace:${workspaceKey}:private-key-passphrase`;
}

function buildRemoteWorkspaceServerTokenCredentialKey(workspaceKey: string): string {
  return `remote-workspace:${workspaceKey}:server-token`;
}

function collectRemoteWorkspaceCredentialKeys(snapshot: RemoteTargetSnapshot): string[] {
  if (snapshot.kind === "ssh") {
    return [snapshot.passwordCredentialKey, snapshot.privateKeyPassphraseCredentialKey].filter(
      (key): key is string => typeof key === "string" && key.length > 0,
    );
  }

  if (snapshot.kind === "server") {
    return [snapshot.tokenCredentialKey].filter(
      (key): key is string => typeof key === "string" && key.length > 0,
    );
  }

  return [];
}

export function getWorkspaceDisplayLabel(workspacePath: string): string {
  const normalized = workspacePath.replace(/\\/g, "/");
  const segments = normalized.split("/").filter(Boolean);
  return segments[segments.length - 1] ?? workspacePath;
}

export function hasRemoteWorkspaceIdentity(entry: {
  remoteSessionId?: string;
  remoteTarget?: RemoteTarget;
  workspaceIdentity?: string;
}): boolean {
  return Boolean(entry.remoteSessionId || entry.remoteTarget || entry.workspaceIdentity);
}

export function isSshRemoteWorkspaceIdentity(workspaceIdentity?: string | null): boolean {
  return workspaceIdentity?.trim().startsWith("remote:ssh:") === true;
}

type WslRemoteTargetLike = Extract<RemoteTarget | RemoteTargetSnapshot, { kind: "wsl" }>;

function getWslRemoteTargetUser(target: WslRemoteTargetLike): string | undefined {
  return target.user?.trim() || undefined;
}

function formatWslRemoteTargetAuthority(target: WslRemoteTargetLike): string {
  const user = getWslRemoteTargetUser(target);
  if (target.distro) {
    return user ? `wsl:${target.distro}:${user}` : `wsl:${target.distro}`;
  }

  return user ? `wsl:default:${user}` : "wsl";
}

function getServerRemoteTargetDisplayName(
  target: Extract<RemoteTarget | RemoteTargetSnapshot, { kind: "server" }>,
): string {
  return target.name?.trim() || target.serverId?.trim() || formatServerRemoteTargetHost(target);
}

function formatServerRemoteTargetHost(
  target: Extract<RemoteTarget | RemoteTargetSnapshot, { kind: "server" }>,
): string {
  try {
    return new URL(target.url.trim()).host;
  } catch {
    return target.url.trim();
  }
}

export function formatRemoteWorkspaceTargetSubtitle(
  target: RemoteTarget | RemoteTargetSnapshot,
): string {
  switch (target.kind) {
    case "ssh":
      return `SSH Â· ${target.username}@${target.host}${target.port ? `:${target.port}` : ""}`;
    case "wsl": {
      const user = getWslRemoteTargetUser(target);
      return ["WSL", target.distro, user].filter(Boolean).join(" Â· ");
    }
    case "docker":
      return `Docker Â· ${target.container}`;
    case "server":
      return `Server Â· ${getServerRemoteTargetDisplayName(target)}`;
  }
}

export function formatRemoteWorkspaceHeaderHostLabel(
  target: RemoteTarget | RemoteTargetSnapshot,
): string {
  switch (target.kind) {
    case "ssh":
      return target.port && target.port !== 22 ? `${target.host}:${target.port}` : target.host;
    case "wsl":
      return formatWslRemoteTargetAuthority(target);
    case "docker":
      return `docker:${target.container}`;
    case "server":
      return formatServerRemoteTargetHost(target);
  }
}

export function formatRemoteWorkspaceDisplayLabel(
  label: string,
  target?: RemoteTarget | RemoteTargetSnapshot,
): string {
  if (target?.kind !== "ssh") {
    return label;
  }

  const sshConfigAlias = target.sshConfigAlias?.trim();
  return sshConfigAlias ? `${label} [SSH: ${sshConfigAlias}]` : label;
}

function normalizeWorkspacePathForIdentity(path: string): string {
  // è¿ç¨ç®å½å¯è½åºç°ç¬¦å·é¾æ¥å«åï¼ä¾å¦ /dev ä¸ /home/devï¼ã
  // èº«ä»½è®¡ç®åç»ä¸ååéç¬¦å½ä¸åä¸æ¶å°¾ææ æ¸çï¼é¿ååä¸è·¯å¾ææ¬åªå£°å¯¼è´èº«ä»½æ¼ç§»ã
  const normalized = path.replace(/\\/g, "/").replace(/\/+$/, "");
  return normalized.length > 0 ? normalized : "/";
}

function getRemoteWorkspaceAuthorityKey(target: RemoteTarget | RemoteTargetSnapshot): string {
  switch (target.kind) {
    case "ssh": {
      const normalizedHost = target.host.trim().toLowerCase();
      const normalizedUsername = target.username.trim();
      const normalizedPort = target.port ?? 22;
      return ["ssh", normalizedHost, normalizedPort, normalizedUsername].join(":");
    }
    case "wsl": {
      // WSL é»è®¤ç¨æ·ä¸ root/å¶ä»æ¾å¼ç¨æ·çæä»¶æéè¾¹çä¸åï¼
      // workspace identity å¿é¡»åºåæ¾å¼ userï¼é¿å sessionãç¼å­åéåä¸²ç¨ã
      const user = getWslRemoteTargetUser(target);
      const base = ["wsl", target.distro ?? "default"];
      return user ? [...base, user].join(":") : base.join(":");
    }
    case "docker":
      return ["docker", target.container].join(":");
    case "server": {
      const identity = buildServerRemoteWorkspaceIdentity({
        serverId: getServerRemoteTargetIdentityId(target),
        workspacePath: "/",
      });
      return identity.slice("remote:".length, -":/".length);
    }
  }
}

export function buildRemoteWorkspaceIdentity(
  workspacePath: string,
  target: RemoteTarget | RemoteTargetSnapshot,
): string {
  if (target.kind === "server") {
    return buildServerRemoteWorkspaceIdentity({
      serverId: getServerRemoteTargetIdentityId(target),
      workspacePath,
    });
  }

  const authority = getRemoteWorkspaceAuthorityKey(target);
  const normalizedPath = normalizeWorkspacePathForIdentity(workspacePath);
  return `remote:${authority}:${normalizedPath}`;
}

function getServerRemoteTargetIdentityId(
  target: Extract<RemoteTarget | RemoteTargetSnapshot, { kind: "server" }>,
): string {
  return target.serverId?.trim() || target.name?.trim() || formatServerRemoteTargetHost(target);
}

export function resolveRemoteWorkspaceSessionIdentity(
  entry: Pick<RemoteWorkspaceSessionEntry, "workspacePath" | "target" | "workspaceIdentity">,
): string {
  return entry.workspaceIdentity || buildRemoteWorkspaceIdentity(entry.workspacePath, entry.target);
}

export function buildWorkspaceSessionKey(entry: {
  workspacePath: string;
  workspaceIdentity?: string;
}): string {
  return entry.workspaceIdentity?.trim() || entry.workspacePath;
}

function normalizeOptionalPath(path: string | undefined): string | undefined {
  const trimmed = path?.trim();
  return trimmed ? trimmed : undefined;
}

export function findMatchingRemoteWorkspaceSessionEntry(
  sessions: RemoteWorkspaceSessionEntry[],
  workspacePath: string,
  target: RemoteTarget | RemoteTargetSnapshot,
): RemoteWorkspaceSessionEntry | null {
  const workspaceIdentity = buildRemoteWorkspaceIdentity(workspacePath, target);
  return (
    sessions.find((entry) => resolveRemoteWorkspaceSessionIdentity(entry) === workspaceIdentity) ??
    null
  );
}

export function createRemoteTargetSnapshot(
  workspaceKey: string,
  target: RemoteTarget,
  previousSnapshot?: RemoteTargetSnapshot,
): RemoteTargetSnapshot {
  switch (target.kind) {
    case "ssh":
      return {
        kind: "ssh",
        host: target.host,
        port: target.port,
        username: target.username,
        ...(target.sshConfigAlias?.trim() ? { sshConfigAlias: target.sshConfigAlias.trim() } : {}),
        assetInstallMode: target.assetInstallMode,
        privateKeyPath: target.privateKeyPath,
        passwordCredentialKey:
          target.password && target.password.length > 0
            ? previousSnapshot?.kind === "ssh" && previousSnapshot.passwordCredentialKey
              ? previousSnapshot.passwordCredentialKey
              : buildRemoteWorkspacePasswordCredentialKey(workspaceKey)
            : undefined,
        privateKeyPassphraseCredentialKey:
          target.privateKeyPassphrase && target.privateKeyPassphrase.length > 0
            ? previousSnapshot?.kind === "ssh" && previousSnapshot.privateKeyPassphraseCredentialKey
              ? previousSnapshot.privateKeyPassphraseCredentialKey
              : buildRemoteWorkspacePrivateKeyPassphraseCredentialKey(workspaceKey)
            : undefined,
      };
    case "wsl": {
      const user = target.user?.trim();
      return {
        kind: "wsl",
        distro: target.distro,
        ...(user ? { user } : {}),
      };
    }
    case "docker":
      return {
        kind: "docker",
        container: target.container,
      };
    case "server":
      return {
        kind: "server",
        url: target.url,
        ...(target.name?.trim() ? { name: target.name.trim() } : {}),
        ...(target.workspacePath?.trim() ? { workspacePath: target.workspacePath.trim() } : {}),
        ...(target.serverId?.trim() ? { serverId: target.serverId.trim() } : {}),
        tokenCredentialKey:
          target.token && target.token.length > 0
            ? previousSnapshot?.kind === "server" && previousSnapshot.tokenCredentialKey
              ? previousSnapshot.tokenCredentialKey
              : buildRemoteWorkspaceServerTokenCredentialKey(workspaceKey)
            : undefined,
      };
  }
}

export function createRemoteTargetFromSnapshot(
  snapshot: RemoteTargetSnapshot,
  credentials: {
    password: string | null;
    privateKeyPassphrase: string | null;
    token?: string | null;
  },
): RemoteTarget {
  switch (snapshot.kind) {
    case "ssh":
      return {
        kind: "ssh",
        host: snapshot.host,
        port: snapshot.port,
        username: snapshot.username,
        ...(snapshot.sshConfigAlias ? { sshConfigAlias: snapshot.sshConfigAlias } : {}),
        ...(snapshot.assetInstallMode ? { assetInstallMode: snapshot.assetInstallMode } : {}),
        ...(snapshot.privateKeyPath ? { privateKeyPath: snapshot.privateKeyPath } : {}),
        ...(credentials.password ? { password: credentials.password } : {}),
        ...(credentials.privateKeyPassphrase
          ? { privateKeyPassphrase: credentials.privateKeyPassphrase }
          : {}),
      };
    case "wsl":
      return {
        kind: "wsl",
        distro: snapshot.distro,
        ...(snapshot.user ? { user: snapshot.user } : {}),
      };
    case "docker":
      return {
        kind: "docker",
        container: snapshot.container,
      };
    case "server":
      return {
        kind: "server",
        url: snapshot.url,
        ...(snapshot.name ? { name: snapshot.name } : {}),
        ...(snapshot.workspacePath ? { workspacePath: snapshot.workspacePath } : {}),
        ...(snapshot.serverId ? { serverId: snapshot.serverId } : {}),
        ...(credentials.token ? { token: credentials.token } : {}),
      };
  }
}

export function upsertRemoteWorkspaceSessionEntries(
  sessions: RemoteWorkspaceSessionEntry[],
  nextEntry: RemoteWorkspaceSessionEntry,
): RemoteWorkspaceSessionEntry[] {
  const nextWorkspaceKey = buildWorkspaceSessionKey(nextEntry);
  return [
    nextEntry,
    ...sessions.filter((entry) => buildWorkspaceSessionKey(entry) !== nextWorkspaceKey),
  ]
    .sort((left, right) => right.lastOpenedAt - left.lastOpenedAt)
    .slice(0, REMOTE_WORKSPACE_SESSION_LIMIT);
}

export function removeRemoteWorkspaceSessionEntries(
  sessions: readonly RemoteWorkspaceSessionEntry[],
  workspaceKeys: readonly string[],
): RemoveRemoteWorkspaceSessionEntriesResult {
  const workspaceKeySet = new Set(
    workspaceKeys.map((workspaceKey) => workspaceKey.trim()).filter(Boolean),
  );
  const credentialKeysToDelete = new Set<string>();
  const nextRemoteSessions: RemoteWorkspaceSessionEntry[] = [];

  for (const session of sessions) {
    const sessionWorkspaceKey = buildWorkspaceSessionKey(session);
    if (!workspaceKeySet.has(sessionWorkspaceKey)) {
      nextRemoteSessions.push(session);
      continue;
    }

    for (const credentialKey of collectRemoteWorkspaceCredentialKeys(session.target)) {
      credentialKeysToDelete.add(credentialKey);
    }
  }

  return {
    nextRemoteSessions,
    credentialKeysToDelete: [...credentialKeysToDelete],
  };
}

export function buildRemoteWorkspaceSessionMutation(params: {
  remoteSessions: RemoteWorkspaceSessionEntry[];
  workspacePath: string;
  localWorkspacePath?: string;
  workspaceIdentity?: string;
  target: RemoteTarget;
  lastConnectionStatus: RemoteWorkspaceSessionEntry["lastConnectionStatus"];
  lastConnectionError?: string;
  touchOpenedAt: boolean;
}): RemoteWorkspaceSessionMutation {
  const currentEntry =
    findMatchingRemoteWorkspaceSessionEntry(
      params.remoteSessions,
      params.workspacePath,
      params.target,
    ) ?? null;
  const resolvedWorkspaceIdentity =
    params.workspaceIdentity ??
    currentEntry?.workspaceIdentity ??
    buildRemoteWorkspaceIdentity(params.workspacePath, params.target);
  const workspaceKey = resolvedWorkspaceIdentity?.trim() || params.workspacePath;
  const nextSnapshot =
    params.lastConnectionStatus === "failed" && currentEntry
      ? currentEntry.target
      : createRemoteTargetSnapshot(workspaceKey, params.target, currentEntry?.target);
  const localWorkspacePath = normalizeOptionalPath(
    params.localWorkspacePath ?? currentEntry?.localWorkspacePath,
  );
  const nextEntry: RemoteWorkspaceSessionEntry = {
    kind: "remote",
    workspacePath: params.workspacePath,
    // filesystem MCP åæ­¥éè¦ç¨âæ¬æº workspace -> è¿ç«¯ workspaceâæ å°ã
    // è¿ç«¯åå²ä¹ååªä¿å­è¿ç«¯è·¯å¾ï¼å·²è¿æ¥åç Settings/Header å¥å£æ æ³åæ¢å¤æ¬æºåºåè·¯å¾ã
    ...(localWorkspacePath ? { localWorkspacePath } : {}),
    workspaceIdentity: resolvedWorkspaceIdentity,
    target: nextSnapshot,
    lastOpenedAt: params.touchOpenedAt ? Date.now() : (currentEntry?.lastOpenedAt ?? Date.now()),
    lastConnectionStatus: params.lastConnectionStatus,
    lastConnectionError:
      params.lastConnectionStatus === "failed"
        ? (params.lastConnectionError ?? currentEntry?.lastConnectionError)
        : undefined,
  };
  const nextRemoteSessions = upsertRemoteWorkspaceSessionEntries(params.remoteSessions, nextEntry);
  const nextRemoteWorkspaceKeys = new Set(
    nextRemoteSessions.map((entry) => buildWorkspaceSessionKey(entry)),
  );
  const credentialKeysToDelete = new Set<string>();
  const previousCredentialKeys = new Set(
    currentEntry ? collectRemoteWorkspaceCredentialKeys(currentEntry.target) : [],
  );
  const nextCredentialKeys = new Set(collectRemoteWorkspaceCredentialKeys(nextSnapshot));

  for (const previousCredentialKey of previousCredentialKeys) {
    if (!nextCredentialKeys.has(previousCredentialKey)) {
      credentialKeysToDelete.add(previousCredentialKey);
    }
  }

  for (const removedEntry of params.remoteSessions) {
    if (nextRemoteWorkspaceKeys.has(buildWorkspaceSessionKey(removedEntry))) {
      continue;
    }

    for (const credentialKey of collectRemoteWorkspaceCredentialKeys(removedEntry.target)) {
      credentialKeysToDelete.add(credentialKey);
    }
  }

  const credentialsToSave: { key: string; value: string }[] = [];

  if (
    params.target.kind === "ssh" &&
    nextSnapshot.kind === "ssh" &&
    params.target.password &&
    nextSnapshot.passwordCredentialKey
  ) {
    credentialsToSave.push({
      key: nextSnapshot.passwordCredentialKey,
      value: params.target.password,
    });
  }

  if (
    params.target.kind === "ssh" &&
    nextSnapshot.kind === "ssh" &&
    params.target.privateKeyPassphrase &&
    nextSnapshot.privateKeyPassphraseCredentialKey
  ) {
    credentialsToSave.push({
      key: nextSnapshot.privateKeyPassphraseCredentialKey,
      value: params.target.privateKeyPassphrase,
    });
  }

  if (
    params.target.kind === "server" &&
    nextSnapshot.kind === "server" &&
    params.target.token &&
    nextSnapshot.tokenCredentialKey
  ) {
    credentialsToSave.push({
      key: nextSnapshot.tokenCredentialKey,
      value: params.target.token,
    });
  }

  return {
    entry: nextEntry,
    nextRemoteSessions,
    credentialsToSave,
    credentialKeysToDelete: [...credentialKeysToDelete],
  };
}

export function buildPersistedWorkspaceSessionEntries(
  tabs: WindowTabState[],
  remoteSessionsByWorkspaceKey: ReadonlyMap<string, RemoteWorkspaceSessionEntry>,
): PersistedWorkspaceSessionEntry[] {
  return tabs.reduce<PersistedWorkspaceSessionEntry[]>((entries, tab) => {
    if (!isWorkspaceTab(tab)) {
      return entries;
    }

    if (hasRemoteWorkspaceIdentity(tab)) {
      const workspaceKey = buildWorkspaceSessionKey(tab);
      const remoteEntry = remoteSessionsByWorkspaceKey.get(workspaceKey);

      // lastWorkspaceSession ç°å¨æ¯è¿ç«¯ workspace çå¯ä¸æä¹åæ¥æºã
      // å¦æè¿éå ä¸º tab æ­è¿å°±æ remote é¡¹æ¼æï¼ä¸æ¬¡å¯å¨ä¼ç´æ¥ä¸¢å¤±âæå¨éè¿âçå¥å£ã
      // å æ­¤åªè¦å½å tab å·æè¿ç«¯èº«ä»½ï¼å°±å¿é¡»ååå®æ´ remote æ¡ç®ã
      if (!remoteEntry) {
        return entries;
      }

      entries.push(remoteEntry);
      return entries;
    }

    entries.push({
      kind: "local",
      workspacePath: tab.workspacePath,
      ...(tab.workspacePurpose
        ? { workspacePurpose: tab.workspacePurpose }
        : {}),
    });
    return entries;
  }, []);
}

export function readPersistedWorkspaceSessionEntries(
  settings: Pick<AppSettings, "lastWorkspaceSession">,
): PersistedWorkspaceSessionEntry[] {
  return settings.lastWorkspaceSession ?? [];
}

export function getRemoteWorkspaceSessionEntries(
  settings: Pick<AppSettings, "lastWorkspaceSession">,
): RemoteWorkspaceSessionEntry[] {
  return (settings.lastWorkspaceSession ?? []).flatMap((entry) =>
    entry.kind === "remote" ? [entry] : [],
  );
}

export function buildRemoteWorkspaceSessionEntryMap(
  entries: readonly RemoteWorkspaceSessionEntry[],
): Map<string, RemoteWorkspaceSessionEntry> {
  return new Map(entries.map((entry) => [buildWorkspaceSessionKey(entry), entry] as const));
}
