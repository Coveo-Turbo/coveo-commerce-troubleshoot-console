type HostedPageLike = {
  id?: string;
  name?: string;
  lastModified?: string;
};

const DEFAULT_PLATFORM_BASE_URL = 'https://platform.cloud.coveo.com';
const HOSTED_PAGES_LIST_PER_PAGE = 100;
const HOSTED_PAGES_LIST_MAX_PAGES = 20;

function toString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function toArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function extractItems(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  const record = toRecord(payload);
  for (const key of ['items', 'results', 'entries', 'value', 'pages']) {
    const nested = toArray(record[key]);
    if (nested.length > 0) {
      return nested;
    }
  }

  return [];
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

  if (normalizedRegion === 'us' || normalizedRegion.startsWith('us-')) {
    return DEFAULT_PLATFORM_BASE_URL;
  }

  if (normalizedRegion === 'eu' || normalizedRegion.startsWith('eu-')) {
    return 'https://platform-eu.cloud.coveo.com';
  }

  if (normalizedRegion === 'ca' || normalizedRegion.startsWith('ca-')) {
    return 'https://platform-ca.cloud.coveo.com';
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

function parseErrorBody(errorBody: string) {
  let message = errorBody;
  let errorCode = '';

  try {
    const parsed = JSON.parse(errorBody) as Record<string, unknown>;
    if (typeof parsed.message === 'string') {
      message = parsed.message;
    }
    if (typeof parsed.errorCode === 'string') {
      errorCode = parsed.errorCode;
    }
  } catch {
    // Keep the raw body text when payload is not JSON.
  }

  return {
    message,
    errorCode,
  };
}

function parseAllowedRegionsFromErrorBody(errorBody: string) {
  const {message} = parseErrorBody(errorBody);
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

function isInvalidUriError(status: number, errorBody: string) {
  if (status !== 404) {
    return false;
  }

  const {message, errorCode} = parseErrorBody(errorBody);
  if (errorCode.toUpperCase() === 'INVALID_URI') {
    return true;
  }

  return /No resource found at the provided URI/i.test(message);
}

function isPageNameNotFoundError(status: number, errorBody: string) {
  if (status !== 404) {
    return false;
  }

  const {message} = parseErrorBody(errorBody);
  return /Page with name ['"].+['"] does not exist/i.test(message);
}

function normalizeHostedPages(payload: unknown): HostedPageLike[] {
  const items = extractItems(payload);
  const pages: HostedPageLike[] = [];

  for (const item of items) {
    if (!item || typeof item !== 'object') {
      continue;
    }

    const record = item as Record<string, unknown>;
    const id = toString(record.id);
    const name = toString(record.name);
    const lastModified = toString(record.lastModified);
    if (!id || !name) {
      continue;
    }

    pages.push({id, name, ...(lastModified ? {lastModified} : {})});
  }

  return pages;
}

function toEpochMillis(value: string) {
  const date = new Date(value);
  const epoch = date.getTime();
  return Number.isFinite(epoch) ? epoch : Number.NaN;
}

function pickExactHostedPageMatch(pages: HostedPageLike[], hostedPageName: string) {
  const exactMatches = pages.filter((page) => page.name === hostedPageName);
  if (exactMatches.length <= 1) {
    return {
      match: exactMatches[0],
      matchedCount: exactMatches.length,
    };
  }

  const sorted = [...exactMatches].sort((left, right) => {
    const leftEpoch = toEpochMillis(toString(left.lastModified));
    const rightEpoch = toEpochMillis(toString(right.lastModified));
    return (Number.isFinite(rightEpoch) ? rightEpoch : -Infinity) -
      (Number.isFinite(leftEpoch) ? leftEpoch : -Infinity);
  });

  return {
    match: sorted[0],
    matchedCount: exactMatches.length,
  };
}

function getNumber(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }

  return Number.NaN;
}

function hasMorePages(payload: unknown, pageIndex: number, pageSize: number) {
  const record = toRecord(payload);
  if (!record || Object.keys(record).length === 0) {
    return pageSize === HOSTED_PAGES_LIST_PER_PAGE;
  }

  const totalPages = getNumber(record, ['totalPages', 'pageCount', 'pagesCount']);
  if (Number.isFinite(totalPages)) {
    return pageIndex + 1 < totalPages;
  }

  const totalEntries = getNumber(record, ['totalEntries', 'totalResults', 'totalCount']);
  if (Number.isFinite(totalEntries)) {
    return (pageIndex + 1) * HOSTED_PAGES_LIST_PER_PAGE < totalEntries;
  }

  const explicitHasMore = record.hasMore;
  if (typeof explicitHasMore === 'boolean') {
    return explicitHasMore;
  }

  return pageSize === HOSTED_PAGES_LIST_PER_PAGE;
}

async function requestPlatform(params: {
  baseUrl: string;
  method: string;
  endpoint: string;
  accessToken: string;
}) {
  const response = await fetch(`${params.baseUrl}${params.endpoint}`, {
    method: params.method,
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (response.ok) {
    return {
      ok: true as const,
      status: response.status,
      body: await response.json(),
    };
  }

  return {
    ok: false as const,
    status: response.status,
    bodyText: await response.text(),
  };
}

async function lookupHostedPageIdFromProjectsPages(params: {
  organizationId: string;
  hostedPageName: string;
  accessToken: string;
  baseUrl: string;
  logger?: (message: string) => void;
}): Promise<{pageId: string | undefined; baseUrl: string; unsupportedEndpoint: boolean}> {
  let activeBaseUrl = params.baseUrl;

  attemptLoop: for (let attempt = 0; attempt < 2; attempt += 1) {
    const pages: HostedPageLike[] = [];

    for (let page = 0; page < HOSTED_PAGES_LIST_MAX_PAGES; page += 1) {
      const endpoint = `/rest/organizations/${params.organizationId}/hostedpages/projects/pages?order=asc&perPage=${HOSTED_PAGES_LIST_PER_PAGE}&page=${page}`;
      const response = await requestPlatform({
        baseUrl: activeBaseUrl,
        method: 'GET',
        endpoint,
        accessToken: params.accessToken,
      });

      if (!response.ok) {
        const retryBaseUrl = resolveRegionRetryBaseUrl({
          status: response.status,
          errorBody: response.bodyText,
          currentBaseUrl: activeBaseUrl,
        });
        if (retryBaseUrl) {
          params.logger?.(
            `[service] Hosted page lookup reported region mismatch; retrying GET ${endpoint} against ${retryBaseUrl}.`
          );
          activeBaseUrl = retryBaseUrl;
          continue attemptLoop;
        }

        if (isInvalidUriError(response.status, response.bodyText)) {
          params.logger?.(
            `[service] Hosted page lookup endpoint ${endpoint} is unavailable; falling back to /pages?name=.`
          );
          return {
            pageId: undefined,
            baseUrl: activeBaseUrl,
            unsupportedEndpoint: true,
          };
        }

        throw new Error(
          `Hosted page lookup failed (${response.status}) for ${endpoint}: ${response.bodyText}`
        );
      }

      const normalizedPages = normalizeHostedPages(response.body);
      pages.push(...normalizedPages);

      if (!hasMorePages(response.body, page, normalizedPages.length)) {
        const selection = pickExactHostedPageMatch(pages, params.hostedPageName);
        if ((selection.matchedCount ?? 0) > 1 && selection.match?.id) {
          params.logger?.(
            `[service] Hosted page lookup found ${selection.matchedCount} exact matches for "${params.hostedPageName}"; selecting most recently modified id "${selection.match.id}".`
          );
        }

        return {
          pageId: toString(selection.match?.id) || undefined,
          baseUrl: activeBaseUrl,
          unsupportedEndpoint: false,
        };
      }
    }

    const cappedSelection = pickExactHostedPageMatch(pages, params.hostedPageName);
    params.logger?.(
      `[service] Hosted page lookup reached page scan cap (${HOSTED_PAGES_LIST_MAX_PAGES} x ${HOSTED_PAGES_LIST_PER_PAGE}); using the best match from scanned pages.`
    );

    return {
      pageId: toString(cappedSelection.match?.id) || undefined,
      baseUrl: activeBaseUrl,
      unsupportedEndpoint: false,
    };
  }

  throw new Error('Hosted page lookup failed after retry attempts due to region mismatch.');
}

async function lookupHostedPageIdFromSearchPagesName(params: {
  organizationId: string;
  hostedPageName: string;
  accessToken: string;
  baseUrl: string;
  logger?: (message: string) => void;
}) {
  let activeBaseUrl = params.baseUrl;
  const endpoint = `/rest/organizations/${params.organizationId}/pages?name=${encodeURIComponent(params.hostedPageName)}`;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await requestPlatform({
      baseUrl: activeBaseUrl,
      method: 'GET',
      endpoint,
      accessToken: params.accessToken,
    });

    if (response.ok) {
      const pages = normalizeHostedPages(response.body);
      const selection = pickExactHostedPageMatch(pages, params.hostedPageName);
      if ((selection.matchedCount ?? 0) > 1 && selection.match?.id) {
        params.logger?.(
          `[service] Hosted page lookup found ${selection.matchedCount} exact matches for "${params.hostedPageName}"; selecting most recently modified id "${selection.match.id}".`
        );
      }

      return toString(selection.match?.id) || undefined;
    }

    const retryBaseUrl = resolveRegionRetryBaseUrl({
      status: response.status,
      errorBody: response.bodyText,
      currentBaseUrl: activeBaseUrl,
    });
    if (retryBaseUrl) {
      params.logger?.(
        `[service] Hosted page lookup reported region mismatch; retrying GET ${endpoint} against ${retryBaseUrl}.`
      );
      activeBaseUrl = retryBaseUrl;
      continue;
    }

    if (isPageNameNotFoundError(response.status, response.bodyText)) {
      return undefined;
    }

    throw new Error(
      `Hosted page lookup failed (${response.status}) for ${endpoint}: ${response.bodyText}`
    );
  }

  throw new Error(`Hosted page lookup failed after retry attempts for ${endpoint}.`);
}

export async function resolveHostedPageIdByName(params: {
  organizationId: string;
  accessToken: string;
  hostedPageName: string;
  region?: string;
  baseUrl?: string;
  logger?: (message: string) => void;
}): Promise<string | undefined> {
  const organizationId = toString(params.organizationId);
  const hostedPageName = toString(params.hostedPageName);
  const accessToken = toString(params.accessToken);

  if (!organizationId || !hostedPageName || !accessToken) {
    return undefined;
  }

  const resolvedBaseUrl = resolvePlatformBaseUrl(
    params.region,
    params.baseUrl || process.env.APP_PLATFORM_BASE_URL || process.env.COVEO_PLATFORM_BASE_URL
  );

  const primaryLookup = await lookupHostedPageIdFromProjectsPages({
    organizationId,
    hostedPageName,
    accessToken,
    baseUrl: resolvedBaseUrl,
    ...(params.logger ? {logger: params.logger} : {}),
  });

  if (!primaryLookup.unsupportedEndpoint) {
    return primaryLookup.pageId;
  }

  return lookupHostedPageIdFromSearchPagesName({
    organizationId,
    hostedPageName,
    accessToken,
    baseUrl: primaryLookup.baseUrl,
    ...(params.logger ? {logger: params.logger} : {}),
  });
}
