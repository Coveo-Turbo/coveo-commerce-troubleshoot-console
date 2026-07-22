import {ProductTemplatesHelpers, type InteractiveProduct, type Product} from '@coveo/headless/commerce';

export const DEFAULT_SIBLINGS_FIELD = 'style_group_siblings';
export const SELECT_SIBLING_EVENT_NAME = 'demo/selectSiblingProduct';
export const RESOLVE_PRODUCT_EVENT_NAME = 'atomic/resolveResult';
// Same context event atomic-product-link uses to obtain the InteractiveProduct controller.
export const RESOLVE_INTERACTIVE_PRODUCT_EVENT_NAME = 'atomic/resolveInteractiveResult';

export type StyleGroupSiblingVariant = {
  variantId: string;
  sku: string;
  price?: number;
  size: string;
};

export type StyleGroupSibling = {
  productId: string;
  handle: string;
  title: string;
  images: string[];
  variants: StyleGroupSiblingVariant[];
  colourName: string;
  colourCode: string;
  swatchHex: string;
  styleCode: string;
};

export type SelectSiblingEventDetail = {
  sibling: StyleGroupSibling;
  sourceProductId: string;
};

type ProductResolver = (product: Product) => void;

function asString(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' ? `${value}`.trim() : '';
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(asString).filter(Boolean);
}

function asPrice(value: unknown): number | undefined {
  const price = typeof value === 'number' ? value : Number.parseFloat(asString(value));
  return Number.isFinite(price) ? price : undefined;
}

function normalizeHexColor(value: unknown): string {
  const match = asString(value).match(/^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  return match ? `#${match[1]}` : '';
}

function parseVariant(value: unknown): StyleGroupSiblingVariant | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const variantId = asString(candidate.variantId);
  const sku = asString(candidate.sku);
  const size = asString(candidate.size);

  if (!variantId && !sku) {
    return null;
  }

  const variant: StyleGroupSiblingVariant = {
    variantId,
    sku,
    size,
  };
  const price = asPrice(candidate.price);
  if (price !== undefined) {
    variant.price = price;
  }

  return variant;
}

function parseSibling(value: unknown): StyleGroupSibling | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const productId = asString(candidate.productId);
  const handle = asString(candidate.handle);

  if (!productId && !handle) {
    return null;
  }

  return {
    productId,
    handle,
    title: asString(candidate.title),
    images: asStringArray(candidate.images),
    variants: Array.isArray(candidate.variants)
      ? candidate.variants.map(parseVariant).filter((variant): variant is StyleGroupSiblingVariant => Boolean(variant))
      : [],
    colourName: asString(candidate.colourName),
    colourCode: asString(candidate.colourCode),
    swatchHex: normalizeHexColor(candidate.swatchHex),
    styleCode: asString(candidate.styleCode),
  };
}

function parseJsonCandidate(value: unknown): unknown[] {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return Array.isArray(value) && value.some((candidate) => typeof candidate === 'object') ? value : [];
}

export function getProductProperty(product: Product, field: string): unknown {
  return ProductTemplatesHelpers.getProductProperty(product, field);
}

export function parseStyleGroupSiblings(product: Product, field = DEFAULT_SIBLINGS_FIELD): StyleGroupSibling[] {
  const rawValue = getProductProperty(product, field);
  const candidates = Array.isArray(rawValue) && rawValue.every((candidate) => typeof candidate === 'string')
    ? rawValue.flatMap(parseJsonCandidate)
    : parseJsonCandidate(rawValue);
  const seen = new Set<string>();

  return candidates.reduce<StyleGroupSibling[]>((siblings, candidate) => {
    const sibling = parseSibling(candidate);
    const key = sibling ? sibling.productId || sibling.handle : '';

    if (!sibling || !key || seen.has(key)) {
      return siblings;
    }

    seen.add(key);
    siblings.push(sibling);
    return siblings;
  }, []);
}

function normalizedIdentifier(value: unknown): string {
  const normalized = asString(value).toLowerCase();
  return normalized.split('/').filter(Boolean).at(-1) ?? normalized;
}

function getHandleFromClickUri(clickUri: string): string {
  const match = clickUri.match(/\/products\/([^/?#]+)/i);
  return match?.[1] ? decodeURIComponent(match[1]).toLowerCase() : '';
}

function getProductTextProperty(product: Product, fields: string[]): string {
  for (const field of fields) {
    const value = getProductProperty(product, field);
    const candidate = Array.isArray(value) ? value.map(asString).find(Boolean) ?? '' : asString(value);
    if (candidate) {
      return candidate;
    }
  }

  return '';
}

export function findCurrentSibling(product: Product, siblings: StyleGroupSibling[]): StyleGroupSibling | null {
  if (siblings.length === 0) {
    return null;
  }

  const identifiers = [product.ec_product_id, product.permanentid].map(normalizedIdentifier).filter(Boolean);
  const byId = siblings.find((sibling) => identifiers.includes(normalizedIdentifier(sibling.productId)));
  if (byId) {
    return byId;
  }

  const currentHandle = getHandleFromClickUri(product.clickUri ?? '');
  const byHandle = siblings.find((sibling) => sibling.handle.toLowerCase() === currentHandle);
  if (byHandle) {
    return byHandle;
  }

  const colourCode = getProductTextProperty(product, ['colour_code']).toLowerCase();
  const byColourCode = siblings.find((sibling) => sibling.colourCode.toLowerCase() === colourCode);
  if (colourCode && byColourCode) {
    return byColourCode;
  }

  const swatchHex = normalizeHexColor(getProductTextProperty(product, ['swatch_hex'])).toLowerCase();
  const bySwatch = siblings.find((sibling) => sibling.swatchHex.toLowerCase() === swatchHex);
  if (swatchHex && bySwatch) {
    return bySwatch;
  }

  const colourName = getProductTextProperty(product, ['colour_name', 'ec_color']).toLowerCase();
  return siblings.find((sibling) => sibling.colourName.toLowerCase() === colourName) ?? siblings[0] ?? null;
}

export function resolveProductContext(element: HTMLElement): Product | null {
  let product: Product | null = null;

  element.dispatchEvent(
    new CustomEvent<ProductResolver>(RESOLVE_PRODUCT_EVENT_NAME, {
      detail: (resolvedProduct) => {
        product = resolvedProduct;
      },
      bubbles: true,
      cancelable: true,
      composed: true,
    })
  );

  return product;
}

/**
 * Resolves the `InteractiveProduct` controller from the parent `atomic-product`, using the same
 * `atomic/resolveInteractiveResult` context event that `atomic-product-link` relies on. Returns
 * null when the component is not hosted inside an Atomic product (e.g., in isolated tests).
 */
export function resolveInteractiveProduct(element: HTMLElement): InteractiveProduct | null {
  let interactiveProduct: InteractiveProduct | null = null;

  element.dispatchEvent(
    new CustomEvent<(value: InteractiveProduct) => void>(RESOLVE_INTERACTIVE_PRODUCT_EVENT_NAME, {
      detail: (resolved) => {
        interactiveProduct = resolved;
      },
      bubbles: true,
      cancelable: true,
      composed: true,
    })
  );

  return interactiveProduct;
}

/**
 * Binds Coveo product-click analytics to an anchor, mirroring Atomic's `bindAnalyticsToLink`:
 * `click`/`contextmenu`/`mousedown`/`mouseup` trigger `select()`, `touchstart` begins a delayed
 * select, and `touchend` cancels it. Propagation is stopped so the host card does not double-handle
 * the interaction. Returns a cleanup function.
 */
export function bindProductClickAnalytics(
  anchor: HTMLAnchorElement,
  interactiveProduct: InteractiveProduct | null,
  options: {stopPropagation?: boolean} = {}
): () => void {
  const stopPropagation = options.stopPropagation !== false;

  const run = (event: Event, action?: () => void) => {
    if (stopPropagation) {
      event.stopPropagation();
    }
    action?.();
  };

  const onSelect = (event: Event) => run(event, interactiveProduct ? () => interactiveProduct.select() : undefined);
  const onBeginDelayedSelect = (event: Event) =>
    run(event, interactiveProduct ? () => interactiveProduct.beginDelayedSelect() : undefined);
  const onCancelPendingSelect = (event: Event) =>
    run(event, interactiveProduct ? () => interactiveProduct.cancelPendingSelect() : undefined);

  const selectEvents = ['click', 'contextmenu', 'mousedown', 'mouseup'] as const;
  for (const name of selectEvents) {
    anchor.addEventListener(name, onSelect);
  }
  anchor.addEventListener('touchstart', onBeginDelayedSelect, {passive: true});
  anchor.addEventListener('touchend', onCancelPendingSelect, {passive: true});

  return () => {
    for (const name of selectEvents) {
      anchor.removeEventListener(name, onSelect);
    }
    anchor.removeEventListener('touchstart', onBeginDelayedSelect);
    anchor.removeEventListener('touchend', onCancelPendingSelect);
  };
}

export function getProductCard(element: HTMLElement): HTMLElement | null {
  return element.closest<HTMLElement>('atomic-product');
}

export function getProductIdentity(product: Product): string {
  return normalizedIdentifier(product.ec_product_id || product.permanentid);
}

export function dispatchSiblingSelection(
  element: HTMLElement,
  sourceProduct: Product,
  sibling: StyleGroupSibling
): void {
  element.dispatchEvent(
    new CustomEvent<SelectSiblingEventDetail>(SELECT_SIBLING_EVENT_NAME, {
      detail: {
        sibling,
        sourceProductId: getProductIdentity(sourceProduct),
      },
      bubbles: true,
      composed: true,
    })
  );
}

export function listenForSiblingSelection(
  element: HTMLElement,
  product: Product,
  listener: (sibling: StyleGroupSibling) => void
): () => void {
  const productIdentity = getProductIdentity(product);
  const eventListener: EventListener = (event) => {
    const detail = (event as CustomEvent<SelectSiblingEventDetail>).detail;
    if (detail.sourceProductId === productIdentity) {
      listener(detail.sibling);
    }
  };
  document.addEventListener(SELECT_SIBLING_EVENT_NAME, eventListener);
  return () => document.removeEventListener(SELECT_SIBLING_EVENT_NAME, eventListener);
}

export function getSiblingProductUrl(product: Product, sibling: StyleGroupSibling): string {
  const encodedHandle = encodeURIComponent(sibling.handle);
  const clickUri = product.clickUri?.trim();

  if (!clickUri) {
    return `/products/${encodedHandle}`;
  }

  const replaced = clickUri.replace(/(\/products\/)[^/?#]+/i, `$1${encodedHandle}`);
  return replaced === clickUri ? `/products/${encodedHandle}` : replaced;
}

export function getProductFallbackImages(product: Product): string[] {
  for (const field of ['ec_images', 'ec_thumbnails', 'imageurl']) {
    const value = getProductProperty(product, field);
    const images = Array.isArray(value) ? value.map(asString).filter(Boolean) : [asString(value)].filter(Boolean);
    if (images.length > 0) {
      return images;
    }
  }

  return [];
}
