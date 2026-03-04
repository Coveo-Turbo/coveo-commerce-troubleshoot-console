import {spawnSync} from 'node:child_process';
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
import type {KeyStrategy, ResolvedTokens} from './types.js';

type ApiKeyLike = {
  id: string;
  displayName?: string;
  description?: string;
  value?: string;
  enabled?: boolean;
  status?: string;
  createdDate?: number;
  expirationDate?: number;
  privileges?: PrivilegeLike[];
};

type PrivilegeLike = {
  owner?: string;
  targetDomain?: string;
  targetId?: string;
  type?: string;
  level?: string;
};

type ApiKeyTemplateEligibilityLike = {
  id: string;
  canGenerate: boolean;
};

type PlatformClientLike = {
  apiKey: {
    list(): Promise<ApiKeyLike[]>;
    get(apiKeyId: string): Promise<ApiKeyLike>;
    create(
      model: {
        displayName: string;
        description: string;
        privileges?: PrivilegeLike[];
      },
      options?: {
        apiKeyTemplateId?: string;
      }
    ): Promise<ApiKeyLike>;
  };
  apiKeyTemplate: {
    listAPIKeysEligibility(): Promise<ApiKeyTemplateEligibilityLike[]>;
  };
  organization: {
    listApiKeysPrivileges(): Promise<PrivilegeLike[]>;
  };
};

type ManagedKeyCacheEntry = {
  keyId: string;
  token: string;
  updatedAt: number;
};

type ManagedKeyCache = {
  version: 1;
  organizations: Record<string, Record<string, ManagedKeyCacheEntry>>;
};

const require = createRequire(import.meta.url);

const ENGINE_KEY_PREFIX = 'ctc-engine-';
const CMH_KEY_PREFIX = 'ctc-cmh-';
const ENGINE_TEMPLATE_ID = 'AnonymousSearch';
const DEFAULT_PLATFORM_BASE_URL = 'https://platform.cloud.coveo.com';

function hasAllScope(text: string) {
  return (
    text.includes(' ALL ') ||
    text.endsWith(' ALL') ||
    text.includes(' TARGET_ALL ') ||
    text.includes(' TARGET ALL ') ||
    text.includes(' * ')
  );
}

const CMH_REQUIRED_PRIVILEGES = [
  {
    id: 'CATALOG_VIEW',
    label: 'Catalog - View',
    match(text: string) {
      return text.includes('CATALOG') && (text.includes('VIEW') || text.includes('READ'));
    },
  },
  {
    id: 'MERCHANDISING_HUB_VIEW_ALL',
    label: 'Merchandising Hub - View all',
    match(text: string) {
      return (
        text.includes('MERCHANDISING_HUB') &&
        (text.includes('VIEW_ALL') ||
          text.includes('VIEW ALL') ||
          text.includes('VIEWALL') ||
          ((text.includes('VIEW') || text.includes('READ')) && hasAllScope(` ${text} `)))
      );
    },
  },
  {
    id: 'PRODUCT_LISTING_VIEW',
    label: 'Product listing - View',
    match(text: string) {
      return (
        (text.includes('PRODUCT_LISTING') || text.includes('PRODUCT LISTING')) &&
        (text.includes('VIEW') || text.includes('READ'))
      );
    },
  },
  {
    id: 'ORGANIZATION_VIEW',
    label: 'Organization - View',
    match(text: string) {
      return text.includes('ORGANIZATION') && (text.includes('VIEW') || text.includes('READ'));
    },
  },
] as const;

function toString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function toArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function isMaskedAccessToken(value: string) {
  return value.includes('*');
}

function createEmptyManagedKeyCache(): ManagedKeyCache {
  return {
    version: 1,
    organizations: {},
  };
}

function toCacheEntry(value: unknown): ManagedKeyCacheEntry | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const keyId = toString(record.keyId);
  const token = toString(record.token);
  const updatedAtRaw = record.updatedAt;
  const updatedAt =
    typeof updatedAtRaw === 'number' && Number.isFinite(updatedAtRaw) ? updatedAtRaw : Date.now();

  if (!keyId || !token || isMaskedAccessToken(token)) {
    return null;
  }

  return {
    keyId,
    token,
    updatedAt,
  };
}

function normalizeManagedKeyCache(payload: unknown): ManagedKeyCache {
  if (!payload || typeof payload !== 'object') {
    return createEmptyManagedKeyCache();
  }

  const record = payload as Record<string, unknown>;
  const rawOrgs = record.organizations;
  if (!rawOrgs || typeof rawOrgs !== 'object') {
    return createEmptyManagedKeyCache();
  }

  const organizations: ManagedKeyCache['organizations'] = {};
  for (const [organizationId, entriesByDisplayName] of Object.entries(
    rawOrgs as Record<string, unknown>
  )) {
    if (!entriesByDisplayName || typeof entriesByDisplayName !== 'object') {
      continue;
    }

    const normalizedEntries: Record<string, ManagedKeyCacheEntry> = {};
    for (const [displayName, entry] of Object.entries(entriesByDisplayName as Record<string, unknown>)) {
      const normalizedEntry = toCacheEntry(entry);
      if (!normalizedEntry) {
        continue;
      }
      normalizedEntries[displayName] = normalizedEntry;
    }

    organizations[organizationId] = normalizedEntries;
  }

  return {
    version: 1,
    organizations,
  };
}

async function readManagedKeyCache(cacheFilePath?: string) {
  if (!cacheFilePath) {
    return createEmptyManagedKeyCache();
  }

  try {
    const raw = await fs.readFile(cacheFilePath, 'utf8');
    const parsed = JSON.parse(raw);
    return normalizeManagedKeyCache(parsed);
  } catch {
    return createEmptyManagedKeyCache();
  }
}

async function writeManagedKeyCache(cacheFilePath: string, cache: ManagedKeyCache) {
  await fs.mkdir(path.dirname(cacheFilePath), {recursive: true});
  await fs.writeFile(cacheFilePath, `${JSON.stringify(cache, null, 2)}\n`, {
    encoding: 'utf8',
    mode: 0o600,
  });
}

function getCachedToken(params: {
  cache: ManagedKeyCache;
  organizationId: string;
  displayName: string;
  keyId: string;
}) {
  const entry = params.cache.organizations[params.organizationId]?.[params.displayName];
  if (!entry) {
    return '';
  }

  if (entry.keyId !== params.keyId) {
    return '';
  }

  const token = toString(entry.token);
  return token && !isMaskedAccessToken(token) ? token : '';
}

function cacheToken(params: {
  cache: ManagedKeyCache;
  organizationId: string;
  displayName: string;
  keyId: string;
  token: string;
}) {
  const token = toString(params.token);
  if (!token || isMaskedAccessToken(token)) {
    return false;
  }

  const byOrganization =
    params.cache.organizations[params.organizationId] ??
    (params.cache.organizations[params.organizationId] = {});

  const existing = byOrganization[params.displayName];
  if (existing?.keyId === params.keyId && existing.token === token) {
    return false;
  }

  byOrganization[params.displayName] = {
    keyId: params.keyId,
    token,
    updatedAt: Date.now(),
  };
  return true;
}

function normalize(value: PrivilegeLike) {
  return `${value.owner ?? ''} ${value.targetDomain ?? ''} ${value.targetId ?? ''} ${value.type ?? ''} ${value.level ?? ''}`
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function isExecuteQueryPrivilege(value: PrivilegeLike) {
  const text = normalize(value);
  return text.includes('EXECUTE_QUERY') || text.includes('EXECUTE QUERY');
}

function hasUsableStatus(value: ApiKeyLike) {
  if (value.enabled === false) {
    return false;
  }

  const status = toString(value.status).toUpperCase();
  if (status.includes('DISABLED') || status.includes('EXPIRED') || status.includes('REVOKED')) {
    return false;
  }

  if (typeof value.expirationDate === 'number' && value.expirationDate > 0) {
    return value.expirationDate > Date.now();
  }

  return true;
}

function tryRequirePlatformClient(modulePath: string) {
  try {
    return require(modulePath);
  } catch {
    return null;
  }
}

function readGlobalNodeModulesPath() {
  const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(command, ['root', '-g'], {
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    return '';
  }

  return result.stdout.trim();
}

function resolvePlatformClientCtor() {
  const moduleCandidates = ['@coveo/platform-client'];
  const globalRoot = readGlobalNodeModulesPath();

  if (globalRoot) {
    moduleCandidates.push(path.join(globalRoot, '@coveo/platform-client'));
    moduleCandidates.push(path.join(globalRoot, '@coveo/cli/node_modules/@coveo/platform-client'));
  }

  for (const candidate of moduleCandidates) {
    const loaded = tryRequirePlatformClient(candidate);
    if (!loaded) {
      continue;
    }

    if (typeof loaded.PlatformClient === 'function') {
      return loaded.PlatformClient;
    }

    if (typeof loaded.default === 'function') {
      return loaded.default;
    }

    if (typeof loaded.default?.PlatformClient === 'function') {
      return loaded.default.PlatformClient;
    }
  }

  return null;
}

function isInvalidUrlClientError(error: unknown) {
  const message =
    error instanceof Error
      ? `${error.message} ${String((error as Error & {cause?: unknown}).cause ?? '')}`
      : String(error);

  return (
    message.includes('Failed to parse URL') ||
    message.includes('ERR_INVALID_URL') ||
    message.includes('Invalid URL')
  );
}

function isMissingApiKeyTemplateEndpointError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('apikeytemplates/privileges/eligibility') &&
    (message.includes('failed (404)') || message.includes('INVALID_URI'))
  );
}

function isRecoverableTemplateCreateError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('apiKeyTemplateId') ||
    message.includes('INVALID_URI') ||
    message.includes('INVALID_PARAMETER') ||
    message.includes('No resource found at the provided URI')
  );
}

function resolvePlatformBaseUrl(region?: string, overrideBaseUrl?: string) {
  const explicit = toString(overrideBaseUrl);
  if (explicit) {
    return explicit.replace(/\/+$/, '');
  }

  const normalizedRegion = toString(region).toLowerCase();
  if (!normalizedRegion) {
    return DEFAULT_PLATFORM_BASE_URL;
  }

  if (normalizedRegion === 'eu' || normalizedRegion.startsWith('eu-')) {
    return 'https://platform-eu.cloud.coveo.com';
  }

  if (
    normalizedRegion === 'au' ||
    normalizedRegion.startsWith('au-') ||
    normalizedRegion.startsWith('ap-') ||
    normalizedRegion.startsWith('apac')
  ) {
    return 'https://platform-au.cloud.coveo.com';
  }

  return DEFAULT_PLATFORM_BASE_URL;
}

function parseAllowedRegionsFromErrorBody(errorBody: string) {
  let message = errorBody;
  try {
    const parsed = JSON.parse(errorBody) as Record<string, unknown>;
    if (typeof parsed.message === 'string') {
      message = parsed.message;
    }
  } catch {
    // Keep raw body.
  }

  const match = message.match(/Allowed region\(s\): '\[([^\]]+)\]'/i);
  if (!match) {
    return [];
  }

  const allowedRegionList = match[1] ?? '';
  return allowedRegionList
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

function resolveRegionRetryBaseUrl(params: {
  status: number;
  errorBody: string;
  currentBaseUrl: string;
}) {
  if (params.status !== 400) {
    return '';
  }

  const allowedRegions = parseAllowedRegionsFromErrorBody(params.errorBody);
  for (const allowedRegion of allowedRegions) {
    const candidateBaseUrl = resolvePlatformBaseUrl(allowedRegion);
    if (candidateBaseUrl && candidateBaseUrl !== params.currentBaseUrl) {
      return candidateBaseUrl;
    }
  }

  return '';
}

function extractItems(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const record = payload as Record<string, unknown>;
  for (const key of ['items', 'results', 'entries', 'value']) {
    const nested = toArray(record[key]);
    if (nested.length > 0) {
      return nested;
    }
  }

  return [];
}

function createRestFallbackClient(params: {
  organizationId: string;
  accessToken: string;
  region?: string;
  baseUrl?: string;
  logger?: (message: string) => void;
}): PlatformClientLike {
  const org = params.organizationId;
  const initialBaseUrl = resolvePlatformBaseUrl(
    params.region,
    params.baseUrl || process.env.APP_PLATFORM_BASE_URL || process.env.COVEO_PLATFORM_BASE_URL
  );

  const request = async (method: string, endpoint: string, body?: unknown) => {
    let activeBaseUrl = initialBaseUrl;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      let response: Response;
      try {
        response = await fetch(`${activeBaseUrl}${endpoint}`, {
          method,
          headers: {
            Authorization: `Bearer ${params.accessToken}`,
            'Content-Type': 'application/json',
          },
          ...(body ? {body: JSON.stringify(body)} : {}),
        });
      } catch (error) {
        throw new Error(
          `Platform API ${method} ${endpoint} failed before response (network/DNS/proxy): ${String(error)}`
        );
      }

      if (response.ok) {
        if (response.status === 204) {
          return null;
        }

        return response.json();
      }

      const errorBody = await response.text();
      const retryBaseUrl = resolveRegionRetryBaseUrl({
        status: response.status,
        errorBody,
        currentBaseUrl: activeBaseUrl,
      });
      if (retryBaseUrl) {
        params.logger?.(
          `[service] Platform API reported region mismatch; retrying ${method} ${endpoint} against ${retryBaseUrl}.`
        );
        activeBaseUrl = retryBaseUrl;
        continue;
      }

      throw new Error(`Platform API ${method} ${endpoint} failed (${response.status}): ${errorBody}`);
    }

    throw new Error(`Platform API ${method} ${endpoint} failed after retry attempts.`);
  };

  return {
    apiKey: {
      list: async () => {
        const payload = await request('GET', `/rest/organizations/${org}/apikeys`);
        return extractItems(payload) as ApiKeyLike[];
      },
      get: async (apiKeyId: string) => {
        return (await request('GET', `/rest/organizations/${org}/apikeys/${apiKeyId}`)) as ApiKeyLike;
      },
      create: async (model, options) => {
        const templateParam = options?.apiKeyTemplateId
          ? `?apiKeyTemplateId=${encodeURIComponent(options.apiKeyTemplateId)}`
          : '';
        return (await request('POST', `/rest/organizations/${org}/apikeys${templateParam}`, model)) as ApiKeyLike;
      },
    },
    apiKeyTemplate: {
      listAPIKeysEligibility: async () => {
        const payload = await request(
          'GET',
          `/rest/organizations/${org}/apikeytemplates/privileges/eligibility`
        );
        return extractItems(payload) as ApiKeyTemplateEligibilityLike[];
      },
    },
    organization: {
      listApiKeysPrivileges: async () => {
        const payload = await request('GET', `/rest/organizations/${org}/privileges/apikeys`);
        return extractItems(payload) as PrivilegeLike[];
      },
    },
  };
}

async function buildClient(params: {
  organizationId: string;
  accessToken: string;
  region?: string;
  environment?: string;
  logger?: (message: string) => void;
}): Promise<PlatformClientLike> {
  const PlatformClientCtor = resolvePlatformClientCtor();

  if (PlatformClientCtor) {
    return new PlatformClientCtor({
      organizationId: params.organizationId,
      accessToken: () => params.accessToken,
      ...(params.region ? {region: params.region} : {}),
      ...(params.environment ? {environment: params.environment} : {}),
    }) as PlatformClientLike;
  }

  return createRestFallbackClient({
    organizationId: params.organizationId,
    accessToken: params.accessToken,
    ...(params.region ? {region: params.region} : {}),
    ...(params.logger ? {logger: params.logger} : {}),
  });
}

async function getKeyWithValue(client: PlatformClientLike, apiKey: ApiKeyLike) {
  const inlineValue = toString(apiKey.value);
  if (inlineValue && !isMaskedAccessToken(inlineValue)) {
    return apiKey;
  }

  const fetched = await client.apiKey.get(apiKey.id);
  const fetchedValue = toString(fetched.value);
  if (!fetchedValue || isMaskedAccessToken(fetchedValue)) {
    return null;
  }

  return fetched;
}

async function findReusableKey(
  client: PlatformClientLike,
  apiKeys: ApiKeyLike[],
  displayNamePrefix: string,
  options?: {
    organizationId?: string;
    keyCache?: ManagedKeyCache;
  }
): Promise<ApiKeyLike | null> {
  const candidates = apiKeys
    .filter((apiKey) => toString(apiKey.displayName).startsWith(displayNamePrefix))
    .filter(hasUsableStatus)
    .sort((left, right) => (right.createdDate ?? 0) - (left.createdDate ?? 0));

  for (const candidate of candidates) {
    const withValue = await getKeyWithValue(client, candidate);
    if (withValue) {
      return withValue;
    }

    const organizationId = toString(options?.organizationId);
    const displayName = toString(candidate.displayName);
    if (options?.keyCache && organizationId && displayName) {
      const cachedToken = getCachedToken({
        cache: options.keyCache,
        organizationId,
        displayName,
        keyId: candidate.id,
      });
      if (cachedToken) {
        return {
          ...candidate,
          value: cachedToken,
        };
      }
    }
  }

  return null;
}

async function createKeyFromTemplate(
  client: PlatformClientLike,
  params: {
    displayName: string;
    description: string;
    templateId: string;
  }
): Promise<ApiKeyLike | null> {
  const tryCreateFromTemplate = async () => {
    try {
      return await client.apiKey.create(
        {
          displayName: params.displayName,
          description: params.description,
        },
        {
          apiKeyTemplateId: params.templateId,
        }
      );
    } catch (error) {
      if (isRecoverableTemplateCreateError(error)) {
        return null;
      }
      throw error;
    }
  };

  let shouldTryDirectCreate = false;
  let eligibleTemplates: ApiKeyTemplateEligibilityLike[] = [];
  try {
    eligibleTemplates = await client.apiKeyTemplate.listAPIKeysEligibility();
  } catch (error) {
    if (!isMissingApiKeyTemplateEndpointError(error)) {
      throw error;
    }

    // Some organizations/environments do not expose template eligibility.
    // In that case, attempt direct template creation and fallback if unsupported.
    shouldTryDirectCreate = true;
  }

  if (shouldTryDirectCreate) {
    return tryCreateFromTemplate();
  }

  const template = eligibleTemplates.find(
    (candidate) => candidate.id === params.templateId && candidate.canGenerate
  );

  if (!template) {
    return null;
  }

  return tryCreateFromTemplate();
}

function summarizePrivileges(privileges: PrivilegeLike[]) {
  const families = new Set<string>();

  for (const privilege of privileges) {
    const text = normalize(privilege);
    if (text.includes('MERCHANDISING_HUB') || text.includes('MERCHANDISING HUB')) {
      families.add('MERCHANDISING_HUB');
    }
    if (text.includes('EXECUTE_QUERY') || text.includes('EXECUTE QUERY')) {
      families.add('EXECUTE_QUERY');
    }
    if (text.includes('CATALOG')) {
      families.add('CATALOG');
    }
    if (text.includes('PRODUCT_LISTING') || text.includes('PRODUCT LISTING')) {
      families.add('PRODUCT_LISTING');
    }
    if (text.includes('ORGANIZATION')) {
      families.add('ORGANIZATION');
    }
  }

  return Array.from(families);
}

function dedupePrivileges(privileges: PrivilegeLike[]) {
  const seen = new Set<string>();
  const output: PrivilegeLike[] = [];

  for (const privilege of privileges) {
    const key = normalize(privilege);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    output.push(privilege);
  }

  return output;
}

function resolveRequiredCmhPrivileges(availablePrivileges: PrivilegeLike[]) {
  const selected: PrivilegeLike[] = [];
  const missing: string[] = [];

  for (const requirement of CMH_REQUIRED_PRIVILEGES) {
    const matched = availablePrivileges.find((privilege) =>
      requirement.match(normalize(privilege))
    );

    if (!matched) {
      missing.push(requirement.label);
      continue;
    }

    selected.push(matched);
  }

  return {
    selected: dedupePrivileges(selected),
    missing,
  };
}

async function createEngineKey(
  client: PlatformClientLike,
  params: {
    organizationId: string;
    displayName: string;
  }
): Promise<ApiKeyLike> {
  const fromTemplate = await createKeyFromTemplate(client, {
    displayName: params.displayName,
    description: 'Commerce troubleshoot console engine key',
    templateId: ENGINE_TEMPLATE_ID,
  });

  if (fromTemplate) {
    return fromTemplate;
  }

  const availablePrivileges = await client.organization.listApiKeysPrivileges();
  const executeQueryPrivileges = availablePrivileges.filter(isExecuteQueryPrivilege);

  if (executeQueryPrivileges.length === 0) {
    const knownFamilies = summarizePrivileges(availablePrivileges);
    throw new Error(
      `Unable to create engine key for ${params.organizationId}: missing grantable EXECUTE_QUERY privileges. Available families: ${knownFamilies.join(', ') || 'none'}.`
    );
  }

  return client.apiKey.create({
    displayName: params.displayName,
    description: 'Commerce troubleshoot console engine key',
    privileges: executeQueryPrivileges,
  });
}

async function createCmhKey(
  client: PlatformClientLike,
  params: {
    organizationId: string;
    displayName: string;
  }
): Promise<ApiKeyLike> {
  const availablePrivileges = await client.organization.listApiKeysPrivileges();
  const {selected, missing} = resolveRequiredCmhPrivileges(availablePrivileges);

  if (missing.length > 0) {
    const knownFamilies = summarizePrivileges(availablePrivileges);
    throw new Error(
      `Unable to create CMH key for ${params.organizationId}: missing required privileges [${missing.join(', ')}]. Available families: ${knownFamilies.join(', ') || 'none'}.`
    );
  }

  return client.apiKey.create({
    displayName: params.displayName,
    description: 'Commerce troubleshoot console CMH key',
    privileges: selected,
  });
}

function assertAccessToken(value: ApiKeyLike | null, kind: 'engine' | 'cmh') {
  const token = toString(value?.value);
  if (!token) {
    throw new Error(`Unable to resolve ${kind} access token value from API key.`);
  }
  if (isMaskedAccessToken(token)) {
    throw new Error(
      `Unable to resolve ${kind} access token value from API key: received a masked value.`
    );
  }

  return token;
}

export async function resolveAccessTokens(params: {
  organizationId: string;
  accessToken: string;
  region?: string;
  environment?: string;
  cacheFilePath?: string;
  keyStrategy?: KeyStrategy;
  logger?: (message: string) => void;
  clientFactory?: (input: {
    organizationId: string;
    accessToken: string;
    region?: string;
    environment?: string;
  }) => Promise<PlatformClientLike> | PlatformClientLike;
}): Promise<ResolvedTokens> {
  const strategy = params.keyStrategy ?? {mode: 'managed'};
  const cacheFilePath = toString(params.cacheFilePath);
  const keyCache = await readManagedKeyCache(cacheFilePath || undefined);
  let cacheDirty = false;

  if (strategy.mode === 'provided') {
    const engine = toString(strategy.engineAccessToken);
    const cmh = toString(strategy.cmhAccessToken) || engine;

    if (!engine) {
      throw new Error('Provided strategy requires a non-empty engine access token.');
    }

    if (!cmh) {
      throw new Error('Provided strategy requires a non-empty CMH access token.');
    }
    if (isMaskedAccessToken(engine) || isMaskedAccessToken(cmh)) {
      throw new Error(
        'Provided strategy requires full (unmasked) API key values. A masked token was detected.'
      );
    }

    return {
      engineAccessToken: engine,
      cmhAccessToken: cmh,
      keyInfo: {
        created: false,
        reused: false,
        source: 'provided',
      },
    };
  }

  let client = await (params.clientFactory ?? buildClient)({
    organizationId: params.organizationId,
    accessToken: params.accessToken,
    ...(params.region ? {region: params.region} : {}),
    ...(params.environment ? {environment: params.environment} : {}),
  });

  const rotate = Boolean(strategy.rotate);
  const engineDisplayName = `${ENGINE_KEY_PREFIX}${params.organizationId}`;
  const cmhDisplayName = `${CMH_KEY_PREFIX}${params.organizationId}`;

  let apiKeys: ApiKeyLike[] = [];
  try {
    apiKeys = await client.apiKey.list();
  } catch (error) {
    if (!isInvalidUrlClientError(error)) {
      throw error;
    }

    params.logger?.(
      '[service] Platform client returned invalid URL shape, falling back to direct REST client.'
    );
    client = createRestFallbackClient({
      organizationId: params.organizationId,
      accessToken: params.accessToken,
      ...(params.region ? {region: params.region} : {}),
      ...(params.logger ? {logger: params.logger} : {}),
    });
    apiKeys = await client.apiKey.list();
  }

  const reusedEngine = rotate
    ? null
    : await findReusableKey(client, apiKeys, engineDisplayName, {
        organizationId: params.organizationId,
        keyCache,
      });
  const reusedCmh = rotate
    ? null
    : await findReusableKey(client, apiKeys, cmhDisplayName, {
        organizationId: params.organizationId,
        keyCache,
      });

  const engineKey =
    reusedEngine ??
    (await createEngineKey(client, {
      organizationId: params.organizationId,
      displayName: engineDisplayName,
    }));

  const cmhKey =
    reusedCmh ??
    (await createCmhKey(client, {
      organizationId: params.organizationId,
      displayName: cmhDisplayName,
    }));

  const resolvedEngineKey = await getKeyWithValue(client, engineKey);
  const resolvedCmhKey = await getKeyWithValue(client, cmhKey);

  const engineAccessToken = assertAccessToken(resolvedEngineKey, 'engine');
  const cmhAccessToken = assertAccessToken(resolvedCmhKey, 'cmh');

  const resolvedEngineKeyId = toString(resolvedEngineKey?.id);
  if (resolvedEngineKeyId) {
    cacheDirty =
      cacheToken({
        cache: keyCache,
        organizationId: params.organizationId,
        displayName: engineDisplayName,
        keyId: resolvedEngineKeyId,
        token: engineAccessToken,
      }) || cacheDirty;
  }

  const resolvedCmhKeyId = toString(resolvedCmhKey?.id);
  if (resolvedCmhKeyId) {
    cacheDirty =
      cacheToken({
        cache: keyCache,
        organizationId: params.organizationId,
        displayName: cmhDisplayName,
        keyId: resolvedCmhKeyId,
        token: cmhAccessToken,
      }) || cacheDirty;
  }

  if (cacheDirty && cacheFilePath) {
    await writeManagedKeyCache(cacheFilePath, keyCache);
    params.logger?.(`[service] managed key cache updated: ${cacheFilePath}`);
  }

  const created = !reusedEngine || !reusedCmh;
  const reused = Boolean(reusedEngine) || Boolean(reusedCmh);

  params.logger?.(
    `[service] key resolution completed: created=${String(created)} reused=${String(reused)}.`
  );

  return {
    engineAccessToken,
    cmhAccessToken,
    keyInfo: {
      created,
      reused,
      source: 'managed',
      ...(resolvedEngineKey?.id ? {engineKeyId: resolvedEngineKey.id} : {}),
      ...(resolvedCmhKey?.id ? {cmhKeyId: resolvedCmhKey.id} : {}),
    },
  };
}
