import type {AdvancedContext, TroubleshootMode, TrackingLocale} from '../types/troubleshoot';
import '@coveo/headless';

type FetchLike = typeof fetch;

type ExecuteRequest = {
  mode: TroubleshootMode;
  trackingId: string;
  locale: TrackingLocale;
  advancedContext: AdvancedContext;
  listingId?: string;
  listingUrl?: string;
  query?: string;
};

type TroubleshootEngineOptions = {
  organizationId: string;
  engineAccessToken: string;
  baseUrl?: string;
  fetchImpl?: FetchLike;
};

export type ExecuteResult = {
  endpoint: string;
  request: Record<string, unknown>;
  response: unknown;
  status: number;
};

function normalizeRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

function mergeAdvancedContext(
  locale: TrackingLocale,
  advancedContext: AdvancedContext,
  mode: TroubleshootMode,
  listingUrl?: string
): Record<string, unknown> {
  const custom = normalizeRecord(advancedContext.custom);
  const dictionaryFieldContext = {
    ...normalizeRecord((custom as Record<string, unknown>).dictionaryFieldContext),
    ...normalizeRecord(advancedContext.dictionaryFieldContext),
  };

  const viewUrl = mode === 'listing' && listingUrl ? listingUrl : locale.viewUrl;

  return {
    ...custom,
    language: locale.language,
    country: locale.country,
    currency: locale.currency,
    view: {
      url: viewUrl,
    },
    dictionaryFieldContext,
  };
}

export async function preloadHeadlessCommerce(): Promise<void> {
  return Promise.resolve();
}

export function createTroubleshootEngine(options: TroubleshootEngineOptions) {
  const fetchImpl = options.fetchImpl ?? fetch;
  const baseUrl = options.baseUrl ?? 'https://platform.cloud.coveo.com';

  async function execute(request: ExecuteRequest): Promise<ExecuteResult> {
    const endpoint =
      request.mode === 'listing'
        ? `/rest/organizations/${options.organizationId}/commerce/v2/listing`
        : `/rest/organizations/${options.organizationId}/commerce/v2/search`;

    const body: Record<string, unknown> = {
      trackingId: request.trackingId,
      context: mergeAdvancedContext(
        request.locale,
        request.advancedContext,
        request.mode,
        request.listingUrl
      ),
    };

    if (request.mode === 'search') {
      body.query = request.query ?? '';
    } else {
      body.url = request.listingUrl ?? request.locale.viewUrl;
      if (request.listingId) {
        body.listingId = request.listingId;
      }
    }

    const response = await fetchImpl(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${options.engineAccessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get('content-type') ?? '';
    const responseBody = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      throw new Error(
        `ENGINE request failed (${response.status}) on ${endpoint}: ${JSON.stringify(responseBody)}`
      );
    }

    return {
      endpoint: `${baseUrl}${endpoint}`,
      request: body,
      response: responseBody,
      status: response.status,
    };
  }

  return {
    execute,
  };
}

export type TroubleshootEngine = ReturnType<typeof createTroubleshootEngine>;
