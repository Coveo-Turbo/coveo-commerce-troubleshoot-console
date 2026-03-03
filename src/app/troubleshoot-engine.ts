import {buildCommerceEngine} from '@coveo/headless/commerce';
import type {
  AdvancedContext,
  TrackingListing,
  TrackingLocale,
  TroubleshootMode,
} from '../types/troubleshoot';

type TroubleshootEngineParams = {
  organizationId: string;
  engineAccessToken: string;
  trackingId: string;
  mode: TroubleshootMode;
  locale: TrackingLocale;
  listing: TrackingListing | undefined;
  advancedContext: AdvancedContext;
};

const ATOMIC_SCRIPT_ID = 'coveo-atomic-commerce-esm';
const ATOMIC_THEME_ID = 'coveo-atomic-theme-css';
const ATOMIC_SCRIPT_URL = 'https://static.cloud.coveo.com/atomic/v3/atomic.esm.js';
const ATOMIC_THEME_URL = 'https://static.cloud.coveo.com/atomic/v3/themes/coveo.css';
const ATOMIC_LOAD_TIMEOUT_MS = 30_000;

let atomicLoadPromise: Promise<void> | null = null;
let atomicLoaderLastError = '';

function toRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

function toString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), timeoutMs);
    promise
      .then((value) => {
        window.clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        window.clearTimeout(timer);
        reject(error);
      });
  });
}

function buildRequestContext(
  mode: TroubleshootMode,
  locale: TrackingLocale,
  listing: TrackingListing | undefined,
  advancedContext: AdvancedContext
): {viewUrl: string; context: Record<string, unknown>; dictionaryFieldContext: Record<string, unknown>} {
  const custom = toRecord(advancedContext.custom);
  const customWithoutDictionaryFieldContext = {...custom};
  delete customWithoutDictionaryFieldContext.dictionaryFieldContext;

  const dictionaryFieldContext = {
    ...toRecord(custom.dictionaryFieldContext),
    ...toRecord(advancedContext.dictionaryFieldContext),
  };

  const viewUrl =
    mode === 'listing' ? toString(listing?.url) || locale.viewUrl : toString(locale.viewUrl);

  return {
    viewUrl,
    context: {
      ...customWithoutDictionaryFieldContext,
      language: locale.language,
      country: locale.country,
      currency: locale.currency,
      view: {
        url: viewUrl,
      },
    },
    dictionaryFieldContext,
  };
}

type PlatformRequestOptionsLike = {
  body?: unknown;
  [key: string]: unknown;
};

function parseRequestPayload(body: unknown): Record<string, unknown> | null {
  if (typeof body === 'string') {
    const trimmed = body.trim();
    if (!trimmed) {
      return {};
    }

    try {
      return toRecord(JSON.parse(trimmed));
    } catch {
      return null;
    }
  }

  if (typeof body === 'object' && body !== null && !Array.isArray(body)) {
    return toRecord(body);
  }

  return null;
}

function buildPreprocessRequest(
  locale: TrackingLocale,
  viewUrl: string,
  dictionaryFieldContext: Record<string, unknown>
) {
  return async (
    request: PlatformRequestOptionsLike,
    clientOrigin: string
  ): Promise<PlatformRequestOptionsLike> => {
    if (clientOrigin !== 'commerceApiFetch') {
      return request;
    }

    const payload = parseRequestPayload(request.body);
    if (!payload) {
      return request;
    }

    const payloadContext = toRecord(payload.context);

    const nextPayload: Record<string, unknown> = {
      ...payload,
      language: locale.language,
      country: locale.country,
      currency: locale.currency,
      context: {
        ...payloadContext,
        language: locale.language,
        country: locale.country,
        currency: locale.currency,
        view: {
          url: viewUrl,
        },
        dictionaryFieldContext: {
          ...toRecord(payloadContext.dictionaryFieldContext),
          ...dictionaryFieldContext,
        },
      },
    };

    return {
      ...request,
      body: JSON.stringify(nextPayload),
    };
  };
}

function ensureAtomicThemeLoaded(documentRef: Document) {
  const byId = documentRef.getElementById(ATOMIC_THEME_ID);
  const byHref = documentRef.querySelector<HTMLLinkElement>(`link[href="${ATOMIC_THEME_URL}"]`);

  if (byId || byHref) {
    if (!byId && byHref) {
      byHref.id = ATOMIC_THEME_ID;
    }
    return;
  }

  const link = documentRef.createElement('link');
  link.id = ATOMIC_THEME_ID;
  link.rel = 'stylesheet';
  link.href = ATOMIC_THEME_URL;
  documentRef.head.append(link);
}

function appendAtomicScript(documentRef: Document, src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = documentRef.createElement('script');
    script.id = ATOMIC_SCRIPT_ID;
    script.type = 'module';
    script.src = src;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.dataset.atomicStatus = 'loading';
    script.addEventListener(
      'load',
      () => {
        script.dataset.atomicStatus = 'loaded';
        resolve();
      },
      {once: true}
    );
    script.addEventListener(
      'error',
      () => {
        script.dataset.atomicStatus = 'error';
        reject(new Error('Failed to load Atomic script.'));
      },
      {once: true}
    );
    documentRef.head.append(script);
  });
}

function loadAtomicScript(documentRef: Document): Promise<void> {
  if (customElements.get('atomic-commerce-interface')) {
    return Promise.resolve();
  }

  const existingById = documentRef.getElementById(ATOMIC_SCRIPT_ID) as HTMLScriptElement | null;
  const existingBySrc = documentRef.querySelector<HTMLScriptElement>(
    `script[src^="${ATOMIC_SCRIPT_URL}"]`
  );
  const existing = existingById ?? existingBySrc;

  if (existing) {
    return Promise.resolve();
  }

  return appendAtomicScript(documentRef, ATOMIC_SCRIPT_URL);
}

export type AtomicAssetDiagnostics = {
  customElementDefined: boolean;
  searchElementDefined: boolean;
  scriptById: boolean;
  scriptBySrc: boolean;
  scriptStatus: string;
  scriptSrc: string;
  themeById: boolean;
  themeByHref: boolean;
  themeHref: string;
  loaderLastError: string;
};

export function getAtomicAssetDiagnostics(): AtomicAssetDiagnostics {
  if (typeof document === 'undefined') {
    return {
      customElementDefined: false,
      searchElementDefined: false,
      scriptById: false,
      scriptBySrc: false,
      scriptStatus: '',
      scriptSrc: '',
      themeById: false,
      themeByHref: false,
      themeHref: '',
      loaderLastError: atomicLoaderLastError,
    };
  }

  const scriptById = document.getElementById(ATOMIC_SCRIPT_ID) as HTMLScriptElement | null;
  const scriptBySrc =
    document.querySelector<HTMLScriptElement>(`script[src^="${ATOMIC_SCRIPT_URL}"]`) ?? null;

  const themeById = document.getElementById(ATOMIC_THEME_ID) as HTMLLinkElement | null;
  const themeByHref =
    document.querySelector<HTMLLinkElement>(`link[href="${ATOMIC_THEME_URL}"]`) ?? null;

  return {
    customElementDefined: Boolean(customElements.get('atomic-commerce-interface')),
    searchElementDefined: Boolean(customElements.get('atomic-search-interface')),
    scriptById: Boolean(scriptById),
    scriptBySrc: Boolean(scriptBySrc),
    scriptStatus: scriptById?.dataset.atomicStatus ?? scriptBySrc?.dataset.atomicStatus ?? '',
    scriptSrc: scriptById?.src ?? scriptBySrc?.src ?? '',
    themeById: Boolean(themeById),
    themeByHref: Boolean(themeByHref),
    themeHref: themeById?.href ?? themeByHref?.href ?? '',
    loaderLastError: atomicLoaderLastError,
  };
}

export async function ensureAtomicCommerceLoaded(): Promise<void> {
  if (typeof document === 'undefined') {
    return;
  }

  ensureAtomicThemeLoaded(document);

  if (customElements.get('atomic-commerce-interface')) {
    return;
  }

  if (!atomicLoadPromise) {
    atomicLoadPromise = (async () => {
      atomicLoaderLastError = '';
      await loadAtomicScript(document);

      await withTimeout(
        customElements.whenDefined('atomic-commerce-interface'),
        ATOMIC_LOAD_TIMEOUT_MS,
        'Atomic commerce components did not register in time.'
      );
    })().catch((error) => {
      atomicLoaderLastError = error instanceof Error ? error.message : String(error);
      atomicLoadPromise = null;
      throw error;
    });
  }

  await atomicLoadPromise;
}

export async function preloadHeadlessCommerce(): Promise<void> {
  return Promise.resolve();
}

export function createTroubleshootEngine(params: TroubleshootEngineParams) {
  const {viewUrl, context, dictionaryFieldContext} = buildRequestContext(
    params.mode,
    params.locale,
    params.listing,
    params.advancedContext
  );

  const configuration: any = {
    organizationId: params.organizationId,
    accessToken: params.engineAccessToken,
    analytics: {
      trackingId: params.trackingId,
    },
    context,
    preprocessRequest: buildPreprocessRequest(params.locale, viewUrl, dictionaryFieldContext),
  };

  if (params.mode === 'listing') {
    configuration.productListing = {
      url: viewUrl,
    };
  }

  return buildCommerceEngine({
    configuration,
  });
}

export type TroubleshootEngine = ReturnType<typeof createTroubleshootEngine>;
