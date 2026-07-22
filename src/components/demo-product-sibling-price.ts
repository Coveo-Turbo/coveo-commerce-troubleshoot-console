import type {Product} from '@coveo/headless/commerce';
import {
  DEFAULT_SIBLINGS_FIELD,
  findCurrentSibling,
  listenForSiblingSelection,
  parseStyleGroupSiblings,
  resolveProductContext,
  type StyleGroupSibling,
} from './demo-product-sibling-data';

const TAG_NAME = 'demo-product-sibling-price';
const DEFAULT_CURRENCY = 'USD';
const DEFAULT_LOCALE = 'en-US';

function getPrices(sibling: StyleGroupSibling | null): number[] {
  if (!sibling) {
    return [];
  }

  return [...new Set(sibling.variants.flatMap((variant) => (variant.price === undefined ? [] : [variant.price])))]
    .filter((price) => Number.isFinite(price))
    .sort((left, right) => left - right);
}

export class DemoProductSiblingPrice extends HTMLElement {
  private readonly shadow = this.attachShadow({mode: 'open'});
  private product: Product | null = null;
  private activeSibling: StyleGroupSibling | null = null;
  private removeSelectionListener: (() => void) | null = null;

  public connectedCallback() {
    queueMicrotask(() => this.refresh());
  }

  public disconnectedCallback() {
    this.removeSelectionListener?.();
    this.removeSelectionListener = null;
  }

  private get currency() {
    const currency = this.getAttribute('currency')?.trim().toUpperCase();
    return currency && /^[A-Z]{3}$/.test(currency) ? currency : DEFAULT_CURRENCY;
  }

  private get locale() {
    return this.getAttribute('locale')?.trim() || DEFAULT_LOCALE;
  }

  private refresh() {
    this.product = resolveProductContext(this);
    if (!this.product) {
      this.hidden = true;
      return;
    }

    const field = this.getAttribute('field')?.trim() || DEFAULT_SIBLINGS_FIELD;
    this.activeSibling = findCurrentSibling(this.product, parseStyleGroupSiblings(this.product, field));
    this.removeSelectionListener?.();
    this.removeSelectionListener = listenForSiblingSelection(this, this.product, (sibling) => {
      this.activeSibling = sibling;
      this.render();
    });
    this.render();
  }

  private get prices() {
    const siblingPrices = getPrices(this.activeSibling);
    if (siblingPrices.length > 0) {
      return siblingPrices;
    }

    const fallbackPrice = this.product?.ec_promo_price ?? this.product?.ec_price;
    return typeof fallbackPrice === 'number' && Number.isFinite(fallbackPrice) ? [fallbackPrice] : [];
  }

  private format(price: number) {
    return new Intl.NumberFormat(this.locale, {
      style: 'currency',
      currency: this.currency,
    }).format(price);
  }

  private render() {
    const prices = this.prices;
    if (prices.length === 0) {
      this.hidden = true;
      this.shadow.replaceChildren();
      return;
    }

    this.hidden = false;
    const priceText = prices.length === 1 ? this.format(prices[0] as number) : `From ${this.format(prices[0] as number)}`;
    const price = document.createElement('span');
    price.className = 'price';
    price.textContent = priceText;
    price.setAttribute('aria-label', priceText);

    const style = document.createElement('style');
    style.textContent = ':host { display: block; } .price { color: #111827; font-size: 1.125rem; font-weight: 700; line-height: 1.5; }';
    this.shadow.replaceChildren(style, price);
  }
}

if (!customElements.get(TAG_NAME)) {
  customElements.define(TAG_NAME, DemoProductSiblingPrice);
}
