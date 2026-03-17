type PlatformErrorDetails = {
  message: string;
  errorCode: string;
};

const DEFAULT_PLATFORM_BASE_URL = 'https://platform.cloud.coveo.com';

function toString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export function resolvePlatformBaseUrl(region?: string, overrideBaseUrl?: string) {
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

export function parsePlatformErrorBody(errorBody: string): PlatformErrorDetails {
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
  const {message} = parsePlatformErrorBody(errorBody);
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

export function resolveRegionRetryBaseUrl(params: {
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

export async function requestPlatformJson<T = unknown>(params: {
  baseUrl: string;
  method: string;
  endpoint: string;
  accessToken: string;
  body?: unknown;
}) {
  const response = await fetch(`${params.baseUrl}${params.endpoint}`, {
    method: params.method,
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      Accept: 'application/json',
      ...(params.body !== undefined ? {'Content-Type': 'application/json'} : {}),
    },
    ...(params.body !== undefined ? {body: JSON.stringify(params.body)} : {}),
  });

  if (response.ok) {
    const bodyText = await response.text();
    if (!bodyText) {
      return {
        ok: true as const,
        status: response.status,
        body: undefined as T,
      };
    }

    try {
      return {
        ok: true as const,
        status: response.status,
        body: JSON.parse(bodyText) as T,
      };
    } catch {
      return {
        ok: true as const,
        status: response.status,
        body: bodyText as T,
      };
    }
  }

  return {
    ok: false as const,
    status: response.status,
    bodyText: await response.text(),
  };
}
