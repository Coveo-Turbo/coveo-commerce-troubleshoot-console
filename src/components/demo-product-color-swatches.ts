import { ProductTemplatesHelpers, type ChildProduct, type Product } from '@coveo/headless/commerce';

const TAG_NAME = 'demo-product-color-swatches';
const DEFAULT_SWATCH_FIELD = 'swatch_hex';
const DEFAULT_MAX_VISIBLE = 5;
const MAX_PRODUCT_RESOLUTION_ATTEMPTS = 3;
const RESOLVE_PRODUCT_EVENT_NAME = 'atomic/resolveResult';
const SELECT_CHILD_PRODUCT_EVENT_NAME = 'atomic/selectChildProduct';

type ProductResolver = (product: Product) => void;
type SelectChildProductEventDetail = {
  child: ChildProduct;
};
type SwatchItem = {
  child: ChildProduct;
  color: string;
  label: string;
};

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

function normalizeHexColor(value: unknown): string | null {
  if (Array.isArray(value)) {
    for (const candidate of value) {
      const normalizedCandidate = normalizeHexColor(candidate);

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
  const match = trimmed.match(/^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);

  return match ? `#${match[1]}` : null;
}

function getProductProperty(product: Product | ChildProduct, property: string): unknown {
  return ProductTemplatesHelpers.getProductProperty(product, property);
}

function getSwatchColor(product: Product | ChildProduct, field: string): string | null {
  if (!field) {
    return null;
  }

  return normalizeHexColor(getProductProperty(product, field));
}

function getSwatchLabel(product: Product | ChildProduct): string {
  const color = getProductProperty(product, 'ec_color');

  if (typeof color === 'string' && color.trim()) {
    return color.trim();
  }

  return product.ec_name?.trim() || 'Color option';
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

function getCanonicalSwatchProducts(product: Product): ChildProduct[] {
  const children = product.children ?? [];

  if (children.length > 0) {
    return dedupeProducts(children);
  }

  return dedupeProducts([product]);
}

export class DemoProductColorSwatches extends HTMLElement {
  public static get observedAttributes() {
    return ['field', 'swatch-field', 'max-visible'];
  }

  private readonly shadow = this.attachShadow({ mode: 'open' });
  private activeSwatchColor = '';
  private currentProduct: Product | null = null;
  private swatches: SwatchItem[] = [];

  public connectedCallback() {
    queueMicrotask(() => this.refresh());
  }

  public attributeChangedCallback() {
    if (!this.isConnected) {
      return;
    }

    queueMicrotask(() => this.refresh());
  }

  private get field() {
    return (
      this.getAttribute('field')?.trim() ||
      this.getAttribute('swatch-field')?.trim() ||
      DEFAULT_SWATCH_FIELD
    );
  }

  private get maxVisible() {
    const rawValue = Number.parseInt(this.getAttribute('max-visible') ?? '', 10);

    return Number.isFinite(rawValue) && rawValue > 0 ? rawValue : DEFAULT_MAX_VISIBLE;
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

  private buildSwatchItems(product: Product): SwatchItem[] {
    const products = getCanonicalSwatchProducts(product);
    const groupedSwatches = new Map<string, SwatchItem>();

    for (const child of products) {
      const color = getSwatchColor(child, this.field);

      if (!color || groupedSwatches.has(color)) {
        continue;
      }

      groupedSwatches.set(color, {
        child,
        color,
        label: getSwatchLabel(child),
      });
    }

    return [...groupedSwatches.values()];
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
      this.swatches = [];
      this.activeSwatchColor = '';
      this.shadow.replaceChildren();
      return;
    }

    this.currentProduct = product;
    this.activeSwatchColor = getSwatchColor(product, this.field) ?? '';
    this.swatches = this.buildSwatchItems(product);

    if (this.swatches.length <= 1) {
      this.hidden = true;
      this.shadow.replaceChildren();
      return;
    }

    this.hidden = false;
    this.render();
  }

  private setActiveState() {
    const buttons = this.shadow.querySelectorAll<HTMLButtonElement>('button[data-child-id]');

    for (const button of buttons) {
      const isActive = button.dataset.swatchColor === this.activeSwatchColor;
      button.classList.toggle('swatch-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    }
  }

  private selectChild(childId: string) {
    const swatch = this.swatches.find((candidate) => candidate.child.permanentid === childId);

    if (!swatch || swatch.color === this.activeSwatchColor) {
      return;
    }

    this.activeSwatchColor = swatch.color;
    this.setActiveState();
    this.dispatchEvent(
      buildCustomEvent<SelectChildProductEventDetail>(SELECT_CHILD_PRODUCT_EVENT_NAME, {
        child: swatch.child,
      })
    );
  }

  private bindSwatchEvents() {
    const buttons = this.shadow.querySelectorAll<HTMLButtonElement>('button[data-child-id]');
    const overflowButton = this.shadow.querySelector<HTMLButtonElement>('button[data-action="open-product-page"]');

    for (const button of buttons) {
      const childId = button.dataset.childId;

      if (!childId) {
        continue;
      }

      button.addEventListener('mouseenter', () => this.selectChild(childId));
      button.addEventListener('focus', () => this.selectChild(childId));
      button.addEventListener('touchstart', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.selectChild(childId);
      });
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.selectChild(childId);
      });
    }

    overflowButton?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.openProductPage();
    });
  }

  private openProductPage() {
    const atomicProduct = this.closest<HTMLElement & {clickLinkContainer?: () => void}>('atomic-product');

    if (typeof atomicProduct?.clickLinkContainer === 'function') {
      atomicProduct.clickLinkContainer();
      return;
    }

    if (this.currentProduct?.clickUri) {
      window.location.assign(this.currentProduct.clickUri);
    }
  }

  private render() {
    const visibleSwatches = this.swatches.slice(0, this.maxVisible);
    const hiddenCount = Math.max(0, this.swatches.length - visibleSwatches.length);

    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .swatches {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
          min-height: 1.25rem;
        }

        .swatch {
          inline-size: 1rem;
          block-size: 1rem;
          border-radius: 999px;
          border: 1px solid #d1d5db;
          background: var(--swatch-color);
          padding: 0;
          cursor: pointer;
          transition:
            transform 120ms ease,
            border-color 120ms ease,
            box-shadow 120ms ease;
        }

        .swatch:hover {
          transform: translateY(-1px);
        }

        .swatch:focus-visible {
          outline: 2px solid #111827;
          outline-offset: 2px;
        }

        .swatch-active {
          border-color: #111827;
          box-shadow:
            0 0 0 1.5px #ffffff,
            0 0 0 3px #111827;
        }

        .count {
          color: #374151;
          font-size: 0.875rem;
          font-weight: 600;
          line-height: 1;
        }

        .count-button {
          appearance: none;
          border: 0;
          background: transparent;
          padding: 0;
          cursor: pointer;
        }

        .count-button:hover,
        .count-button:focus-visible {
          color: #111827;
        }
      </style>
      <div class="swatches" aria-label="Available colors" role="list">
        ${visibleSwatches
          .map((swatch) => {
            const childId = escapeHtml(swatch.child.permanentid);
            const label = escapeHtml(swatch.label);
            const isActive = swatch.color === this.activeSwatchColor;
            return `
              <button
                type="button"
                class="swatch${isActive ? ' swatch-active' : ''}"
                data-child-id="${childId}"
                data-swatch-color="${swatch.color}"
                aria-label="Show ${label}"
                aria-pressed="${String(isActive)}"
                title="${label}"
                style="--swatch-color: ${swatch.color};"
              ></button>
            `;
          })
          .join('')}
        ${
          hiddenCount > 0
            ? `
              <button
                type="button"
                class="count count-button"
                data-action="open-product-page"
                aria-label="View ${hiddenCount} more colors"
                title="View more colors"
              >+${hiddenCount}</button>
            `
            : ''
        }
      </div>
    `;

    this.bindSwatchEvents();
  }
}

if (!customElements.get(TAG_NAME)) {
  customElements.define(TAG_NAME, DemoProductColorSwatches);
}
