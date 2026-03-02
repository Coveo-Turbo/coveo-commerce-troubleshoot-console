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
};

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

function normalizeLocale(raw: Record<string, unknown>, defaults: CmhDefaults): TrackingLocale {
  const language = toString(raw.language) || defaults.language;
  const country = toString(raw.country) || defaults.country;
  const currency = toString(raw.currency) || defaults.currency;
  const id =
    toString(raw.id) ||
    `${language}-${country}-${currency}`.replace(/\s+/g, '-').toLowerCase();

  return {
    id,
    label:
      toString(raw.label) ||
      `${language.toUpperCase()}-${country.toUpperCase()} (${currency.toUpperCase()})`,
    language,
    country,
    currency,
    viewUrl: toString(raw.viewUrl) || toString(raw.url) || defaults.viewUrl,
  };
}

function normalizeListing(raw: Record<string, unknown>): TrackingListing | null {
  const id = toString(raw.id) || toString(raw.listingId);
  const label = toString(raw.label) || toString(raw.name) || id;
  const url = toString(raw.url) || toString(raw.path);

  if (!id || !url) {
    return null;
  }

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

export class CmhConfigService {
  private readonly organizationId: string;
  private readonly accessToken: string;
  private readonly defaults: CmhDefaults;
  private readonly fetchImpl: FetchLike;
  private readonly baseUrl: string;

  public constructor(options: CmhConfigServiceOptions) {
    this.organizationId = options.organizationId;
    this.accessToken = options.accessToken;
    this.defaults = options.defaults;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.baseUrl = options.baseUrl ?? 'https://platform.cloud.coveo.com';
  }

  public async getTrackingData(): Promise<TrackingData[]> {
    const primary = await this.fetchTrackingDataFromCatalogMappings();
    if (primary.length > 0) {
      return primary;
    }

    return this.fetchTrackingDataWithFallbackEndpoints();
  }

  private buildPath(path: string): string {
    return `${this.baseUrl}/rest/organizations/${this.organizationId}${path}`;
  }

  private async requestJson(path: string): Promise<unknown> {
    const response = await this.fetchImpl(this.buildPath(path), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CMH request failed (${response.status}) for ${path}`);
    }

    return response.json();
  }

  private parseTrackingCatalogMappings(payload: unknown): TrackingData[] {
    const rows = toArray(isRecord(payload) ? payload.items ?? payload : payload);
    if (rows.length === 0) {
      return [];
    }

    const byTracking = new Map<string, {locales: TrackingLocale[]; listings: TrackingListing[]}>();

    for (const item of rows) {
      if (!isRecord(item)) {
        continue;
      }

      const trackingId =
        toString(item.trackingId) ||
        toString(item.catalogId) ||
        toString(item.id) ||
        this.defaults.trackingId ||
        '';

      if (!trackingId) {
        continue;
      }

      const current = byTracking.get(trackingId) ?? {
        locales: [],
        listings: [],
      };

      const localeSource = toArray(item.locales ?? item.localeMappings);
      if (localeSource.length > 0) {
        for (const localeValue of localeSource) {
          if (!isRecord(localeValue)) {
            continue;
          }
          current.locales.push(normalizeLocale(localeValue, this.defaults));
        }
      } else if (item.language || item.country || item.currency) {
        current.locales.push(normalizeLocale(item, this.defaults));
      }

      const listingSource = toArray(item.listings ?? item.pages);
      for (const listingValue of listingSource) {
        if (!isRecord(listingValue)) {
          continue;
        }
        const listing = normalizeListing(listingValue);
        if (listing) {
          current.listings.push(listing);
        }
      }

      byTracking.set(trackingId, current);
    }

    return [...byTracking.entries()].map(([trackingId, data]) =>
      withDefaults(trackingId, this.defaults, data.locales, data.listings)
    );
  }

  private async fetchTrackingDataFromCatalogMappings(): Promise<TrackingData[]> {
    try {
      const payload = await this.requestJson('/trackingidcatalogmappings');
      return this.parseTrackingCatalogMappings(payload);
    } catch {
      return [];
    }
  }

  private parseTrackingFromConfigs(payload: unknown):
    | Array<{trackingId: string; locale?: TrackingLocale}>
    | [] {
    const rows = toArray(isRecord(payload) ? payload.items ?? payload : payload);
    const results: Array<{trackingId: string; locale?: TrackingLocale}> = [];

    for (const row of rows) {
      if (!isRecord(row)) {
        continue;
      }

      const trackingId = toString(row.trackingId);
      if (!trackingId) {
        continue;
      }

      const locale =
        row.language || row.country || row.currency
          ? normalizeLocale(row, this.defaults)
          : undefined;

      results.push({trackingId, locale});
    }

    return results;
  }

  private parseListingPages(payload: unknown):
    | Array<{trackingId: string; listing: TrackingListing}>
    | [] {
    const rows = toArray(isRecord(payload) ? payload.items ?? payload : payload);
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
        toString(row.trackingId) || this.defaults.trackingId || 'default-tracking-id';

      listings.push({trackingId, listing});
    }

    return listings;
  }

  private async fetchTrackingDataWithFallbackEndpoints(): Promise<TrackingData[]> {
    const [listingConfigurations, searchConfigurations, listingPages] = await Promise.allSettled([
      this.requestJson('/commerce/v2/configurations/listings?perPage=200'),
      this.requestJson('/commerce/v2/configurations/search?perPage=200'),
      this.requestJson('/commerce/v2/listings/pages?perPage=200'),
    ]);

    const trackingMap = new Map<string, {locales: TrackingLocale[]; listings: TrackingListing[]}>();

    const applyTrackingRow = (trackingId: string, locale?: TrackingLocale) => {
      const current = trackingMap.get(trackingId) ?? {
        locales: [],
        listings: [],
      };
      if (locale) {
        current.locales.push(locale);
      }
      trackingMap.set(trackingId, current);
    };

    if (listingConfigurations.status === 'fulfilled') {
      for (const row of this.parseTrackingFromConfigs(listingConfigurations.value)) {
        applyTrackingRow(row.trackingId, row.locale);
      }
    }

    if (searchConfigurations.status === 'fulfilled') {
      for (const row of this.parseTrackingFromConfigs(searchConfigurations.value)) {
        applyTrackingRow(row.trackingId, row.locale);
      }
    }

    if (listingPages.status === 'fulfilled') {
      for (const row of this.parseListingPages(listingPages.value)) {
        const current = trackingMap.get(row.trackingId) ?? {
          locales: [],
          listings: [],
        };
        current.listings.push(row.listing);
        trackingMap.set(row.trackingId, current);
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
