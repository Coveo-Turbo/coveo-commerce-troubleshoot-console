import {ProductTemplatesHelpers, type ChildProduct, type Product} from '@coveo/headless/commerce';

const TAG_NAME = 'demo-product-size-selector';
const DEFAULT_SIZE_FIELD = 'ec_size';
const DEFAULT_SWATCH_FIELD = 'swatch_hex';
const DEFAULT_LABEL = 'ADD TO BAG:';
const DEFAULT_BUTTON_LABEL = 'Add to bag';
const DEFAULT_TITLE_SIZE_VALUE = 'default title';
const MAX_PRODUCT_RESOLUTION_ATTEMPTS = 3;
const RESOLVE_PRODUCT_EVENT_NAME = 'atomic/resolveResult';
const STANDARD_SIZE_ORDER = ['xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl'] as const;

const STANDARD_SIZE_RANK = new Map<string, number>(
  STANDARD_SIZE_ORDER.map((size, index) => [size, index])
);

type ProductResolver = (product: Product) => void;
type SizeItem = {
  child: ChildProduct;
  discoveryIndex: number;
  key: string;
  label: string;
};

type DemoDataLayerItem = {
  item_id: string;
  item_name: string;
  item_brand?: string;
  item_category?: string;
  item_group_id?: string;
  item_variant: string;
  price?: number;
  quantity: number;
  color?: string;
  size?: string;
};

type DemoDataLayerEvent = {
  event: 'add_to_cart';
  ecommerce: {
    items: DemoDataLayerItem[];
    value?: number;
  };
};

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

function buildCustomEvent<T>(name: string, detail: T): CustomEvent<T> {
  return new CustomEvent(name, {
    detail,
    bubbles: true,
    cancelable: true,
    composed: true,
  });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function normalizeTextValue(value: unknown): string | null {
  if (Array.isArray(value)) {
    for (const candidate of value) {
      const normalizedCandidate = normalizeTextValue(candidate);

      if (normalizedCandidate) {
        return normalizedCandidate;
      }
    }

    return null;
  }

  if (typeof value !== 'string' && typeof value !== 'number') {
    return null;
  }

  const trimmed = `${value}`.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isMeaningfulSizeLabel(value: string | null): value is string {
  return Boolean(value && value.trim() && value.trim().toLowerCase() !== DEFAULT_TITLE_SIZE_VALUE);
}

function getStandardSizeRank(label: string): number {
  return STANDARD_SIZE_RANK.get(label.trim().toLowerCase()) ?? Number.POSITIVE_INFINITY;
}

function normalizeHexColor(value: unknown): string | null {
  const normalizedText = normalizeTextValue(value);

  if (!normalizedText) {
    return null;
  }

  const match = normalizedText.match(/^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  return match ? `#${match[1]}` : null;
}

function getProductProperty(product: Product | ChildProduct, property: string): unknown {
  return ProductTemplatesHelpers.getProductProperty(product, property);
}

function getProductTextValue(product: Product | ChildProduct, field: string): string | null {
  if (!field) {
    return null;
  }

  return normalizeTextValue(getProductProperty(product, field));
}

function getSwatchColor(product: Product | ChildProduct, field: string): string | null {
  if (!field) {
    return null;
  }

  return normalizeHexColor(getProductProperty(product, field));
}

function dedupeProducts(products: Array<Product | ChildProduct>): ChildProduct[] {
  const seen = new Set<string>();
  const deduped: ChildProduct[] = [];

  for (const product of products) {
    if (!product.permanentid || seen.has(product.permanentid)) {
      continue;
    }

    seen.add(product.permanentid);
    deduped.push(product as ChildProduct);
  }

  return deduped;
}

function getCanonicalVariantProducts(product: Product): ChildProduct[] {
  const children = product.children ?? [];

  if (children.length > 0) {
    return dedupeProducts(children);
  }

  return dedupeProducts([product]);
}

function getProductPrice(product: Product | ChildProduct): number | undefined {
  const promoPrice = product.ec_promo_price;
  if (typeof promoPrice === 'number') {
    return promoPrice;
  }

  const price = product.ec_price;
  return typeof price === 'number' ? price : undefined;
}

export class DemoProductSizeSelector extends HTMLElement {
  public static get observedAttributes() {
    return ['field', 'size-field', 'swatch-field', 'label'];
  }

  private readonly shadow = this.attachShadow({mode: 'open'});
  private currentProduct: Product | null = null;
  private sizes: SizeItem[] = [];
  private selectedSizeKey = '';
  private addToBagChild: ChildProduct | null = null;
  private hoverTarget: HTMLElement | null = null;
  private removeVisibilityBindings: (() => void) | null = null;
  private restoreOverlayContainerPosition: (() => void) | null = null;

  public connectedCallback() {
    this.prepareInteractionTarget();
    this.bindVisibilityState();
    queueMicrotask(() => this.refresh());
  }

  public disconnectedCallback() {
    this.removeVisibilityBindings?.();
    this.removeVisibilityBindings = null;
    this.restoreOverlayContainerPosition?.();
    this.restoreOverlayContainerPosition = null;
  }

  public attributeChangedCallback() {
    if (!this.isConnected) {
      return;
    }

    queueMicrotask(() => this.refresh());
  }

  private get field() {
    return this.getAttribute('field')?.trim() || this.getAttribute('size-field')?.trim() || DEFAULT_SIZE_FIELD;
  }

  private get swatchField() {
    return this.getAttribute('swatch-field')?.trim() || DEFAULT_SWATCH_FIELD;
  }

  private get label() {
    return this.getAttribute('label')?.trim() || DEFAULT_LABEL;
  }

  private prepareInteractionTarget() {
    const visualSection = this.closest<HTMLElement>('atomic-product-section-visual');

    this.hoverTarget = visualSection ?? this.closest<HTMLElement>('atomic-product') ?? this.parentElement;

    if (!visualSection || getComputedStyle(visualSection).position !== 'static') {
      return;
    }

    const originalPosition = visualSection.style.position;
    visualSection.style.position = 'relative';
    this.restoreOverlayContainerPosition = () => {
      visualSection.style.position = originalPosition;
    };
  }

  private setOverlayVisible(isVisible: boolean) {
    if (isVisible) {
      this.setAttribute('data-visible', 'true');
      return;
    }

    this.removeAttribute('data-visible');
  }

  private bindVisibilityState() {
    const hoverTarget =
      this.hoverTarget ??
      this.closest<HTMLElement>('atomic-product-section-visual') ??
      this.closest<HTMLElement>('atomic-product') ??
      this.parentElement;

    if (!hoverTarget || this.removeVisibilityBindings) {
      return;
    }

    this.hoverTarget = hoverTarget;

    const showOverlay = () => this.setOverlayVisible(true);
    const hideOverlay = (event?: FocusEvent) => {
      const relatedTarget = event?.relatedTarget;

      if (relatedTarget instanceof Node && hoverTarget.contains(relatedTarget)) {
        return;
      }

      this.setOverlayVisible(false);
    };

    hoverTarget.addEventListener('mouseenter', showOverlay);
    hoverTarget.addEventListener('mouseleave', hideOverlay);
    hoverTarget.addEventListener('focusin', showOverlay);
    hoverTarget.addEventListener('focusout', hideOverlay);
    hoverTarget.addEventListener('touchstart', showOverlay, {passive: true});

    this.removeVisibilityBindings = () => {
      hoverTarget.removeEventListener('mouseenter', showOverlay);
      hoverTarget.removeEventListener('mouseleave', hideOverlay);
      hoverTarget.removeEventListener('focusin', showOverlay);
      hoverTarget.removeEventListener('focusout', hideOverlay);
      hoverTarget.removeEventListener('touchstart', showOverlay);
    };
  }

  private resolveProductContext(): Product | null {
    let product: Product | null = null;

    this.dispatchEvent(
      buildCustomEvent<ProductResolver>(RESOLVE_PRODUCT_EVENT_NAME, (resolvedProduct) => {
        product = resolvedProduct;
      })
    );

    return product;
  }

  private getActiveSwatchProducts(product: Product): ChildProduct[] {
    const activeSwatchColor = getSwatchColor(product, this.swatchField);
    const products = getCanonicalVariantProducts(product);

    if (!activeSwatchColor) {
      return products;
    }

    const matchingProducts = products.filter(
      (child) => getSwatchColor(child, this.swatchField) === activeSwatchColor
    );

    return matchingProducts.length > 0 ? matchingProducts : products;
  }

  private buildSizeItems(products: ChildProduct[]): SizeItem[] {
    const sizeItems: SizeItem[] = [];
    const seen = new Set<string>();
    let discoveryIndex = 0;

    for (const child of products) {
      const sizeLabel = getProductTextValue(child, this.field);
      if (!isMeaningfulSizeLabel(sizeLabel)) {
        continue;
      }

      const key = sizeLabel.toLowerCase();
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      sizeItems.push({
        child,
        discoveryIndex,
        key,
        label: sizeLabel,
      });
      discoveryIndex += 1;
    }

    return sizeItems.sort((left, right) => {
      const leftRank = getStandardSizeRank(left.label);
      const rightRank = getStandardSizeRank(right.label);

      if (leftRank !== rightRank) {
        return leftRank - rightRank;
      }

      return left.discoveryIndex - right.discoveryIndex;
    });
  }

  private refresh(attempt = 0) {
    const product = this.resolveProductContext();

    if (!product) {
      if (attempt + 1 < MAX_PRODUCT_RESOLUTION_ATTEMPTS) {
        queueMicrotask(() => this.refresh(attempt + 1));
        return;
      }

      this.hidden = true;
      this.currentProduct = null;
      this.sizes = [];
      this.selectedSizeKey = '';
      this.shadow.replaceChildren();
      return;
    }

    this.currentProduct = product;
    const activeSwatchProducts = this.getActiveSwatchProducts(product);
    this.sizes = this.buildSizeItems(activeSwatchProducts);
    this.addToBagChild = activeSwatchProducts[0] ?? null;

    const currentSizeLabel = getProductTextValue(product, this.field);
    const selectedSizeKey = isMeaningfulSizeLabel(currentSizeLabel) ? currentSizeLabel.toLowerCase() : '';
    this.selectedSizeKey =
      this.sizes.find((sizeItem) => sizeItem.key === selectedSizeKey)?.key || this.sizes[0]?.key || '';

    if (this.sizes.length === 0 && !this.addToBagChild) {
      this.hidden = true;
      this.removeAttribute('data-has-sizes');
      this.addToBagChild = null;
      this.shadow.replaceChildren();
      return;
    }

    this.hidden = false;
    this.toggleAttribute('data-has-sizes', this.sizes.length > 0);
    this.render();
  }

  private createDataLayerPayload(child: ChildProduct, sizeLabel?: string): DemoDataLayerEvent {
    const price = getProductPrice(child);
    const itemVariant = [child.ec_color, sizeLabel].filter(Boolean).join(' / ') || child.ec_name || child.permanentid;

    const item: DemoDataLayerItem = {
      item_id: child.ec_product_id || child.permanentid,
      item_name: child.ec_name || this.currentProduct?.ec_name || child.permanentid,
      item_variant: itemVariant,
      quantity: 1,
      ...(sizeLabel ? {size: sizeLabel} : {}),
      ...(child.ec_brand ? {item_brand: child.ec_brand} : {}),
      ...(child.ec_category[0] ? {item_category: child.ec_category[0]} : {}),
      ...(child.ec_item_group_id ? {item_group_id: child.ec_item_group_id} : {}),
      ...(typeof price === 'number' ? {price} : {}),
      ...(child.ec_color ? {color: child.ec_color} : {}),
    };

    return {
      event: 'add_to_cart',
      ecommerce: {
        items: [item],
        ...(typeof price === 'number' ? {value: price} : {}),
      },
    };
  }

  private handleSizeClick(sizeKey: string) {
    const sizeItem = this.sizes.find((candidate) => candidate.key === sizeKey);

    if (!sizeItem) {
      return;
    }

    this.selectedSizeKey = sizeItem.key;
    this.setActiveState();

    const payload = this.createDataLayerPayload(sizeItem.child, sizeItem.label);
    const dataLayer = window.dataLayer ?? [];
    dataLayer.push(payload);
    window.dataLayer = dataLayer;
  }

  private handleAddToBagClick() {
    if (!this.addToBagChild) {
      return;
    }

    const payload = this.createDataLayerPayload(this.addToBagChild);
    const dataLayer = window.dataLayer ?? [];
    dataLayer.push(payload);
    window.dataLayer = dataLayer;
  }

  private setActiveState() {
    const buttons = this.shadow.querySelectorAll<HTMLButtonElement>('button[data-size-key]');

    for (const button of buttons) {
      const isActive = button.dataset.sizeKey === this.selectedSizeKey;
      button.classList.toggle('size-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    }
  }

  private bindSizeEvents() {
    const buttons = this.shadow.querySelectorAll<HTMLButtonElement>('button[data-size-key]');
    const addToBagButton = this.shadow.querySelector<HTMLButtonElement>('button[data-action="add-to-bag"]');

    for (const button of buttons) {
      const sizeKey = button.dataset.sizeKey;

      if (!sizeKey) {
        continue;
      }

      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.handleSizeClick(sizeKey);
      });
    }

    addToBagButton?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.handleAddToBagClick();
    });
  }

  private render() {
    const addToBagButtonLabel = this.addToBagChild?.ec_name?.trim()
      ? `Add ${this.addToBagChild.ec_name.trim()} to bag`
      : DEFAULT_BUTTON_LABEL;

    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
          position: absolute;
          inset-inline: 0;
          bottom: 0;
          z-index: 1;
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          pointer-events: none;
          transform: translateY(100%);
          transition:
            max-height 180ms ease,
            opacity 160ms ease,
            transform 180ms ease;
        }

        :host([data-visible='true']) {
          max-height: 8rem;
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0);
        }

        @media (hover: none), (pointer: coarse) {
          :host {
            max-height: 8rem;
            opacity: 1;
            pointer-events: auto;
            transform: translateY(0);
            transition: none;
          }
        }

        .panel {
          pointer-events: auto;
          padding: 0.55rem 0.35rem 0.45rem;
          background: linear-gradient(to top, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.88));
          text-align: center;
        }

        .label {
          color: #111827;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          margin-bottom: 0.3rem;
          text-transform: uppercase;
        }

        .sizes {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.35rem 0.5rem;
        }

        .cta-button,
        .size {
          appearance: none;
          border: 0;
          background: transparent;
          color: #111827;
          cursor: pointer;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          min-inline-size: 1.8rem;
          padding: 0.12rem 0.1rem;
          text-transform: uppercase;
          transition:
            color 120ms ease,
            opacity 120ms ease,
            transform 120ms ease;
        }

        .cta-button {
          background: rgba(17, 24, 39, 0.92);
          border-radius: 999px;
          color: #ffffff;
          min-inline-size: 8.5rem;
          padding: 0.5rem 1rem;
          text-transform: uppercase;
        }

        .cta-button:hover,
        .size:hover {
          transform: translateY(-1px);
        }

        .cta-button:focus-visible,
        .size:focus-visible {
          outline: 2px solid #111827;
          outline-offset: 2px;
        }

        .size-active {
          color: #6b7280;
        }

        @media (max-width: 640px) {
          .panel {
            padding-inline: 0.55rem;
          }

          .sizes {
            gap: 0.25rem 0.35rem;
          }

          .size {
            min-inline-size: 1.5rem;
          }
        }
      </style>
      <div class="panel" aria-label="Add to bag options">
        ${
          this.sizes.length > 0
            ? `
              <div class="label">${escapeHtml(this.label)}</div>
              <div class="sizes" role="list">
                ${this.sizes
                  .map((sizeItem) => {
                    const isActive = sizeItem.key === this.selectedSizeKey;
                    return `
                      <button
                        type="button"
                        class="size${isActive ? ' size-active' : ''}"
                        data-size-key="${escapeHtml(sizeItem.key)}"
                        aria-label="Add size ${escapeHtml(sizeItem.label)} to bag"
                        aria-pressed="${String(isActive)}"
                        title="Add size ${escapeHtml(sizeItem.label)} to bag"
                      >${escapeHtml(sizeItem.label)}</button>
                    `;
                  })
                  .join('')}
              </div>
            `
            : `
              <button
                type="button"
                class="cta-button"
                data-action="add-to-bag"
                aria-label="${escapeHtml(addToBagButtonLabel)}"
                title="${escapeHtml(addToBagButtonLabel)}"
              >${escapeHtml(DEFAULT_BUTTON_LABEL)}</button>
            `
        }
      </div>
    `;

    this.bindSizeEvents();
  }
}

if (!customElements.get(TAG_NAME)) {
  customElements.define(TAG_NAME, DemoProductSizeSelector);
}
