import type {AppRuntimeConfig} from '../types/app-config';
import type {TrackingData, TrackingListing, TrackingLocale} from '../types/troubleshoot';

type FetchLike = typeof fetch;

type CmhDefaults = AppRuntimeConfig['defaults'];

type CmhConfigServiceOptions = {
  organizationId: string;
  accessToken: string;
  defaults: CmhDefaults;
  baseUrl?: string;
  fetchImpl?: FetchLike;
  requestTimeoutMs?: number;
};

type TrackingBucket = {
  locales: TrackingLocale[];
  listings: TrackingListing[];
};

export type CmhRequestTraceEntry = {
  path: string;
  status: number | null;
  ok: boolean;
  error: string;
};

const PAGE_SIZE = 200;
const MAX_PAGES = 50;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function toString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function uniqueById<T extends {id: string}>(items: T[]): T[] {
  const seen = new Set<string>();
  const unique: T[] = [];

  for (const item of items) {
    if (!item.id || seen.has(item.id)) {
      continue;
    }

    seen.add(item.id);
    unique.push(item);
  }

  return unique;
}

function fallbackLocale(defaults: CmhDefaults): TrackingLocale {
  const id = `${defaults.language}-${defaults.country}-${defaults.currency}`.toLowerCase();
  return {
    id,
    label: `${defaults.language.toUpperCase()}-${defaults.country.toUpperCase()} (${defaults.currency.toUpperCase()})`,
    language: defaults.language,
    country: defaults.country,
    currency: defaults.currency,
    viewUrl: defaults.viewUrl,
  };
}

function normalizeLocaleString(locale: string): {language?: string; country?: string} {
  const trimmed = locale.trim();
  if (!trimmed) {
    return {};
  }

  const parts = trimmed.replace('_', '-').split('-').filter(Boolean);
  const normalized: {language?: string; country?: string} = {};
  if (parts[0]) {
    normalized.language = parts[0].toLowerCase();
  }
  if (parts[1]) {
    normalized.country = parts[1].toUpperCase();
  }

  return normalized;
}

function normalizeLocale(raw: Record<string, unknown>, defaults: CmhDefaults): TrackingLocale {
  const nestedLocale = isRecord(raw.locale) ? raw.locale : undefined;
  const localeString = toString(raw.locale);
  const localeFromString = normalizeLocaleString(localeString);

  const language =
    toString(raw.language) ||
    toString(raw.lang) ||
    toString(raw.localeLanguage) ||
    toString(nestedLocale?.language) ||
    localeFromString.language ||
    defaults.language;

  const country =
    toString(raw.country) ||
    toString(raw.region) ||
    toString(raw.market) ||
    toString(raw.localeCountry) ||
    toString(nestedLocale?.country) ||
    localeFromString.country ||
    defaults.country;

  const currency =
    toString(raw.currency) ||
    toString(raw.currencyCode) ||
    toString(raw.localeCurrency) ||
    toString(nestedLocale?.currency) ||
    defaults.currency;

  const id =
    toString(raw.id) ||
    toString(raw.localeId) ||
    `${language}-${country}-${currency}`.replace(/\s+/g, '-').toLowerCase();

  const label =
    toString(raw.label) ||
    toString(raw.name) ||
    `${language.toUpperCase()}-${country.toUpperCase()} (${currency.toUpperCase()})`;

  return {
    id,
    label,
    language,
    country,
    currency,
    viewUrl:
      toString(raw.viewUrl) ||
      toString(raw.viewURL) ||
      toString(raw.searchPageUri) ||
      toString(raw.pageUrl) ||
      toString(raw.url) ||
      defaults.viewUrl,
  };
}

function deriveListingIdFromUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) {
    return '';
  }

  const withoutProtocol = trimmed.replace(/^[a-z]+:\/\/[^/]+/i, '');
  const normalized = withoutProtocol
    .replace(/[?#].*$/, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  return normalized || 'listing';
}

function normalizeListing(raw: Record<string, unknown>): TrackingListing | null {
  const idCandidate =
    toString(raw.id) ||
    toString(raw.listingId) ||
    toString(raw.listingID) ||
    toString(raw.pageId) ||
    toString(raw.slug);
  const matching = isRecord(raw.matching) ? raw.matching : undefined;
  const patternUrls = toArray(raw.patterns)
    .map((pattern) => (isRecord(pattern) ? toString(pattern.url) : ''))
    .filter((value) => value.length > 0);

  const candidateUrls = [
    toString(raw.url),
    toString(raw.path),
    toString(raw.pageUrl),
    toString(raw.listingUrl),
    toString(raw.pageUri),
    toString(raw.uri),
    toString(raw.urlPath),
    toString(raw.relativeUrl),
    toString(raw.href),
    toString(matching?.url),
    ...patternUrls,
  ].filter((value) => value.length > 0);

  const url = candidateUrls[0] ?? '';
  if (!url) {
    return null;
  }

  const id = idCandidate || deriveListingIdFromUrl(url);
  const label = toString(raw.label) || toString(raw.name) || toString(raw.listingName) || id;

  return {
    id,
    label,
    url,
  };
}

function withDefaults(
  trackingId: string,
  defaults: CmhDefaults,
  locales: TrackingLocale[],
  listings: TrackingListing[]
): TrackingData {
  return {
    trackingId,
    locales: locales.length > 0 ? uniqueById(locales) : [fallbackLocale(defaults)],
    listings: uniqueById(listings),
  };
}

function extractRows(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!isRecord(payload)) {
    return [];
  }

  const candidateKeys = ['items', 'results', 'entries', 'data', 'value'];
  for (const key of candidateKeys) {
    const rows = toArray(payload[key]);
    if (rows.length > 0) {
      return rows;
    }
  }

  return toArray(payload);
}

function mergeTrackingData(sources: TrackingData[][], defaults: CmhDefaults): TrackingData[] {
  const byTracking = new Map<string, TrackingBucket>();

  for (const source of sources) {
    for (const entry of source) {
      const trackingId = toString(entry.trackingId);
      if (!trackingId) {
        continue;
      }

      const current = byTracking.get(trackingId) ?? {
        locales: [],
        listings: [],
      };

      current.locales.push(...entry.locales);
      current.listings.push(...entry.listings);

      byTracking.set(trackingId, current);
    }
  }

  if (byTracking.size === 0 && defaults.trackingId) {
    return [
      {
        trackingId: defaults.trackingId,
        locales: [fallbackLocale(defaults)],
        listings: [],
      },
    ];
  }

  return [...byTracking.entries()].map(([trackingId, bucket]) =>
    withDefaults(trackingId, defaults, bucket.locales, bucket.listings)
  );
}

function hasLocaleFields(candidate: Record<string, unknown>): boolean {
  return Boolean(
    candidate.language ||
      candidate.country ||
      candidate.currency ||
      candidate.locale ||
      candidate.localeLanguage ||
      candidate.localeCountry ||
      candidate.localeCurrency
  );
}

export class CmhConfigService {
  private readonly organizationId: string;
  private readonly accessToken: string;
  private readonly defaults: CmhDefaults;
  private readonly fetchImpl: FetchLike;
  private readonly baseUrl: string;
  private readonly requestTimeoutMs: number;
  private requestTrace: CmhRequestTraceEntry[] = [];

  public constructor(options: CmhConfigServiceOptions) {
    this.organizationId = options.organizationId;
    this.accessToken = options.accessToken;
    this.defaults = options.defaults;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.baseUrl = options.baseUrl ?? 'https://platform.cloud.coveo.com';
    this.requestTimeoutMs = options.requestTimeoutMs ?? 10_000;
  }

  public async getTrackingData(): Promise<TrackingData[]> {
    this.requestTrace = [];

    const primary = await this.fetchTrackingDataFromCatalogMappings();
    const discoveredTrackingIds = new Set<string>(
      primary.map((entry) => toString(entry.trackingId)).filter((trackingId) => trackingId.length > 0)
    );
    if (this.defaults.trackingId) {
      discoveredTrackingIds.add(this.defaults.trackingId);
    }

    const fallback = await this.fetchTrackingDataFromListingPages([...discoveredTrackingIds]);

    return mergeTrackingData([primary, fallback], this.defaults);
  }

  public getRequestTrace(): CmhRequestTraceEntry[] {
    return [...this.requestTrace];
  }

  private buildPath(path: string): string {
    return `${this.baseUrl}/rest/organizations/${this.organizationId}${path}`;
  }

  private withTrackingId(path: string, trackingId: string): string {
    const separator = path.includes('?') ? '&' : '?';
    return `${path}${separator}trackingId=${encodeURIComponent(trackingId)}`;
  }

  private async requestJson(path: string): Promise<unknown> {
    const controller = new AbortController();
    const timeout = globalThis.setTimeout(() => controller.abort(), this.requestTimeoutMs);

    let response: Response;
    try {
      response = await this.fetchImpl.call(globalThis, this.buildPath(path), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          Accept: 'application/json',
        },
        signal: controller.signal,
      });
    } catch (error) {
      this.requestTrace.push({
        path,
        status: null,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`CMH request timed out after ${this.requestTimeoutMs}ms for ${path}`);
      }
      throw error;
    } finally {
      globalThis.clearTimeout(timeout);
    }

    if (!response.ok) {
      this.requestTrace.push({
        path,
        status: response.status,
        ok: false,
        error: `CMH request failed (${response.status})`,
      });
      throw new Error(`CMH request failed (${response.status}) for ${path}`);
    }

    this.requestTrace.push({
      path,
      status: response.status,
      ok: true,
      error: '',
    });

    return response.json();
  }

  private readNumericField(payload: unknown, keys: string[]): number | null {
    if (!isRecord(payload)) {
      return null;
    }

    for (const key of keys) {
      const value = payload[key];
      if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
      }
    }

    return null;
  }

  private async requestAllPages(basePath: string): Promise<unknown[]> {
    const firstPayload = await this.requestJson(basePath);
    const rows: unknown[] = [...extractRows(firstPayload)];
    const totalPages = this.readNumericField(firstPayload, ['totalPages']);
    if (!totalPages || totalPages <= 1) {
      return rows;
    }

    const separator = basePath.includes('?') ? '&' : '?';
    const pageNumber = this.readNumericField(firstPayload, ['page', 'pageNumber', 'currentPage']);
    const oneBasedPage = pageNumber === null ? true : pageNumber >= 1;
    const currentPage = pageNumber ?? 1;
    const lastPage = oneBasedPage ? totalPages : totalPages - 1;

    let fetchedPages = 1;
    for (let page = currentPage + 1; page <= lastPage && fetchedPages < MAX_PAGES; page += 1) {
      const pagePath = `${basePath}${separator}page=${page}&perPage=${PAGE_SIZE}`;
      const payload = await this.requestJson(pagePath);
      const pageRows = extractRows(payload);
      if (pageRows.length === 0) {
        break;
      }
      rows.push(...pageRows);
      fetchedPages += 1;
    }

    return rows;
  }

  private parseTrackingCatalogMappings(payload: unknown): TrackingData[] {
    const rows = extractRows(payload);
    if (rows.length === 0) {
      return [];
    }

    const byTracking = new Map<string, TrackingBucket>();

    const apply = (trackingId: string, locale?: TrackingLocale, listing?: TrackingListing) => {
      const trimmedTrackingId = toString(trackingId);
      if (!trimmedTrackingId) {
        return;
      }

      const current = byTracking.get(trimmedTrackingId) ?? {
        locales: [],
        listings: [],
      };

      if (locale) {
        current.locales.push(locale);
      }

      if (listing) {
        current.listings.push(listing);
      }

      byTracking.set(trimmedTrackingId, current);
    };

    const visit = (entry: Record<string, unknown>, parentTrackingId = '', depth = 0) => {
      if (depth > 4) {
        return;
      }

      const trackingId =
        toString(entry.trackingId) ||
        toString(entry.trackingID) ||
        toString(entry.catalogId) ||
        toString(entry.catalogID) ||
        parentTrackingId ||
        '';

      if (trackingId) {
        // Keep tracking IDs even when locale/listing details are sparse.
        apply(trackingId);
      }

      if (trackingId && hasLocaleFields(entry)) {
        apply(trackingId, normalizeLocale(entry, this.defaults));
      }

      const directListing = normalizeListing(entry);
      if (trackingId && directListing) {
        apply(trackingId, undefined, directListing);
      }

      const localeArrays = [
        entry.locales,
        entry.localeMappings,
        entry.trackingIdToCatalogMapping,
        entry.catalogLocales,
        entry.localeConfigurations,
      ];

      for (const localeArray of localeArrays) {
        for (const localeEntry of toArray(localeArray)) {
          if (!isRecord(localeEntry)) {
            continue;
          }

          const localeTrackingId =
            toString(localeEntry.trackingId) || toString(localeEntry.catalogId) || trackingId;

          if (!localeTrackingId) {
            continue;
          }

          apply(localeTrackingId, normalizeLocale(localeEntry, this.defaults));

          const listing = normalizeListing(localeEntry);
          if (listing) {
            apply(localeTrackingId, undefined, listing);
          }
        }
      }

      const listingArrays = [entry.listings, entry.pages, entry.listingPages];
      for (const listingArray of listingArrays) {
        for (const listingEntry of toArray(listingArray)) {
          if (!isRecord(listingEntry)) {
            continue;
          }

          const listingTrackingId =
            toString(listingEntry.trackingId) || toString(listingEntry.catalogId) || trackingId;

          if (!listingTrackingId) {
            continue;
          }

          const listing = normalizeListing(listingEntry);
          if (listing) {
            apply(listingTrackingId, undefined, listing);
          }
        }
      }

      const nestedArrays = [
        entry.mappings,
        entry.catalogMappings,
        entry.trackingIdCatalogMappings,
        entry.items,
      ];

      for (const nestedArray of nestedArrays) {
        for (const nested of toArray(nestedArray)) {
          if (isRecord(nested)) {
            visit(nested, trackingId, depth + 1);
          }
        }
      }
    };

    for (const row of rows) {
      if (isRecord(row)) {
        visit(row);
      }
    }

    return [...byTracking.entries()].map(([trackingId, data]) =>
      withDefaults(trackingId, this.defaults, data.locales, data.listings)
    );
  }

  private async fetchTrackingDataFromCatalogMappings(): Promise<TrackingData[]> {
    try {
      const rows = await this.requestAllPages('/trackingidcatalogmappings');
      return this.parseTrackingCatalogMappings({items: rows});
    } catch {
      return [];
    }
  }

  private parseListingPages(
    payload: unknown,
    fallbackTrackingId = ''
  ): Array<{trackingId: string; listing: TrackingListing}> {
    const rows = extractRows(payload);
    const listings: Array<{trackingId: string; listing: TrackingListing}> = [];

    for (const row of rows) {
      if (!isRecord(row)) {
        continue;
      }

      const listing = normalizeListing(row);
      if (!listing) {
        continue;
      }

      const trackingId =
        toString(row.trackingId) ||
        toString(row.catalogId) ||
        fallbackTrackingId ||
        this.defaults.trackingId ||
        '';

      if (!trackingId) {
        continue;
      }

      listings.push({trackingId, listing});
    }

    return listings;
  }

  private async fetchTrackingDataFromListingPages(scopedTrackingIds: string[]): Promise<TrackingData[]> {
    const trackingMap = new Map<string, TrackingBucket>();

    const applyListingRow = (trackingId: string, listing: TrackingListing) => {
      const current = trackingMap.get(trackingId) ?? {
        locales: [],
        listings: [],
      };
      current.listings.push(listing);
      trackingMap.set(trackingId, current);
    };

    const scopedResults = await Promise.allSettled(
      scopedTrackingIds
        .map((trackingId) => toString(trackingId))
        .filter((trackingId) => trackingId.length > 0)
        .map(async (trackingId) => {
          const rows = await this.requestAllPages(this.withTrackingId('/commerce/v2/listings/pages', trackingId));
          return {trackingId, rows};
        })
    );

    for (const result of scopedResults) {
      if (result.status !== 'fulfilled') {
        continue;
      }

      for (const row of this.parseListingPages({items: result.value.rows}, result.value.trackingId)) {
        applyListingRow(row.trackingId, row.listing);
      }
    }

    if (trackingMap.size === 0 && this.defaults.trackingId) {
      trackingMap.set(this.defaults.trackingId, {
        locales: [fallbackLocale(this.defaults)],
        listings: [],
      });
    }

    return [...trackingMap.entries()].map(([trackingId, data]) =>
      withDefaults(trackingId, this.defaults, data.locales, data.listings)
    );
  }
}
