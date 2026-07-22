import type {Product} from '@coveo/headless/commerce';
import {
  DEFAULT_SIBLINGS_FIELD,
  dispatchSiblingSelection,
  findCurrentSibling,
  getSiblingProductUrl,
  parseStyleGroupSiblings,
  resolveProductContext,
  type StyleGroupSibling,
} from './demo-product-sibling-data';

const TAG_NAME = 'demo-product-sibling-swatches';
const DEFAULT_MAX_VISIBLE = 5;
const MAX_PRODUCT_RESOLUTION_ATTEMPTS = 3;

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export class DemoProductSiblingSwatches extends HTMLElement {
  public static get observedAttributes() {
    return ['field', 'max-visible'];
  }

  private readonly shadow = this.attachShadow({mode: 'open'});
  private currentProduct: Product | null = null;
  private siblings: StyleGroupSibling[] = [];
  private activeProductId = '';

  public connectedCallback() {
    queueMicrotask(() => this.refresh());
  }

  public attributeChangedCallback() {
    if (this.isConnected) {
      queueMicrotask(() => this.refresh());
    }
  }

  private get field() {
    return this.getAttribute('field')?.trim() || DEFAULT_SIBLINGS_FIELD;
  }

  private get maxVisible() {
    const value = Number.parseInt(this.getAttribute('max-visible') ?? '', 10);
    return Number.isFinite(value) && value > 0 ? value : DEFAULT_MAX_VISIBLE;
  }

  private refresh(attempt = 0) {
    const product = resolveProductContext(this);
    if (!product) {
      if (attempt + 1 < MAX_PRODUCT_RESOLUTION_ATTEMPTS) {
        queueMicrotask(() => this.refresh(attempt + 1));
        return;
      }
      this.hide();
      return;
    }

    this.currentProduct = product;
    this.siblings = parseStyleGroupSiblings(product, this.field).filter((sibling) => sibling.swatchHex);
    this.activeProductId = findCurrentSibling(product, this.siblings)?.productId ?? this.siblings[0]?.productId ?? '';

    if (this.siblings.length <= 1) {
      this.hide();
      return;
    }

    this.hidden = false;
    this.render();
  }

  private hide() {
    this.hidden = true;
    this.siblings = [];
    this.activeProductId = '';
    this.shadow.replaceChildren();
  }

  private selectSibling(productId: string) {
    const sibling = this.siblings.find((candidate) => candidate.productId === productId);
    if (!sibling || sibling.productId === this.activeProductId) {
      return;
    }

    this.activeProductId = sibling.productId;
    this.setActiveState();
    if (this.currentProduct) {
      dispatchSiblingSelection(this, this.currentProduct, sibling);
    }
  }

  private setActiveState() {
    for (const button of this.shadow.querySelectorAll<HTMLButtonElement>('button[data-product-id]')) {
      const active = button.dataset.productId === this.activeProductId;
      button.classList.toggle('swatch-active', active);
      button.setAttribute('aria-pressed', String(active));
    }
  }

  private openSelectedProduct() {
    if (!this.currentProduct) {
      return;
    }

    const sibling = this.siblings.find((candidate) => candidate.productId === this.activeProductId);
    if (sibling) {
      window.location.assign(getSiblingProductUrl(this.currentProduct, sibling));
    }
  }

  private bindEvents() {
    for (const button of this.shadow.querySelectorAll<HTMLButtonElement>('button[data-product-id]')) {
      const productId = button.dataset.productId;
      if (!productId) {
        continue;
      }

      button.addEventListener('mouseenter', () => this.selectSibling(productId));
      button.addEventListener('focus', () => this.selectSibling(productId));
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.selectSibling(productId);
      });
      button.addEventListener('touchstart', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.selectSibling(productId);
      });
    }

    this.shadow.querySelector<HTMLButtonElement>('button[data-action="open-product-page"]')?.addEventListener(
      'click',
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.openSelectedProduct();
      }
    );
  }

  private render() {
    const visible = this.siblings.slice(0, this.maxVisible);
    const hiddenCount = this.siblings.length - visible.length;

    this.shadow.innerHTML = `
      <style>
        :host { display: block; }
        .swatches { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; min-height: 2rem; }
        .swatch { inline-size: 2rem; block-size: 2rem; border-radius: .4rem; border: 1px solid #d1d5db; background: var(--swatch-color); padding: 0; cursor: pointer; transition: transform 120ms ease, border-color 120ms ease, box-shadow 120ms ease, outline-color 120ms ease; }
        .swatch:hover { transform: translateY(-1px); }
        .swatch:focus-visible { outline: 2px solid #0d6efd; outline-offset: 2px; }
        .swatch-active { border-color: #0d6efd; outline: 2px solid #0d6efd; outline-offset: 1px; }
        .count-button { appearance: none; border: 0; background: transparent; color: #374151; padding: 0; cursor: pointer; font-size: .9rem; font-weight: 600; line-height: 1; }
        .count-button:hover, .count-button:focus-visible { color: #0d6efd; }
      </style>
      <div class="swatches" aria-label="Available colors" role="list">
        ${visible
          .map((sibling) => {
            const label = escapeHtml(sibling.colourName || sibling.title || 'Color option');
            const active = sibling.productId === this.activeProductId;
            return `<button type="button" class="swatch${active ? ' swatch-active' : ''}" data-product-id="${escapeHtml(sibling.productId)}" aria-label="Show ${label}" aria-pressed="${String(active)}" title="${label}" style="--swatch-color: ${sibling.swatchHex}"></button>`;
          })
          .join('')}
        ${hiddenCount > 0 ? `<button type="button" class="count-button" data-action="open-product-page" aria-label="View ${hiddenCount} more colors" title="View more colors">+${hiddenCount}</button>` : ''}
      </div>
    `;
    this.bindEvents();
  }
}

if (!customElements.get(TAG_NAME)) {
  customElements.define(TAG_NAME, DemoProductSiblingSwatches);
}
