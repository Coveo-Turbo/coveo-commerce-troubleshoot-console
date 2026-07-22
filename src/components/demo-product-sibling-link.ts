import type {InteractiveProduct, Product} from '@coveo/headless/commerce';
import {
  bindProductClickAnalytics,
  DEFAULT_SIBLINGS_FIELD,
  findCurrentSibling,
  getSiblingProductUrl,
  listenForSiblingSelection,
  logSiblingProductClick,
  parseStyleGroupSiblings,
  resolveInteractiveProduct,
  resolveProductContext,
  type StyleGroupSibling,
} from './demo-product-sibling-data';

const TAG_NAME = 'demo-product-sibling-link';

export class DemoProductSiblingLink extends HTMLElement {
  private readonly shadow = this.attachShadow({mode: 'open'});
  private product: Product | null = null;
  private interactiveProduct: InteractiveProduct | null = null;
  private activeSibling: StyleGroupSibling | null = null;
  private removeSelectionListener: (() => void) | null = null;
  private removeLinkAnalytics: (() => void) | null = null;

  public connectedCallback() {
    queueMicrotask(() => this.refresh());
  }

  public disconnectedCallback() {
    this.removeSelectionListener?.();
    this.removeSelectionListener = null;
    this.removeLinkAnalytics?.();
    this.removeLinkAnalytics = null;
  }

  private refresh() {
    this.product = resolveProductContext(this);
    if (!this.product) {
      this.hidden = true;
      return;
    }

    this.interactiveProduct = resolveInteractiveProduct(this);
    const field = this.getAttribute('field')?.trim() || DEFAULT_SIBLINGS_FIELD;
    this.activeSibling = findCurrentSibling(this.product, parseStyleGroupSiblings(this.product, field));
    this.removeSelectionListener?.();
    this.removeSelectionListener = listenForSiblingSelection(this, this.product, (sibling) => {
      this.activeSibling = sibling;
      this.render();
    });
    this.hidden = false;
    this.render();
  }

  private render() {
    if (!this.product) {
      return;
    }

    const anchor = document.createElement('a');
    anchor.href = this.activeSibling ? getSiblingProductUrl(this.product, this.activeSibling) : this.product.clickUri;
    anchor.textContent = this.activeSibling?.title || this.product.ec_name || '';

    // Emit Coveo product-click analytics for the currently selected sibling color.
    this.removeLinkAnalytics?.();
    this.removeLinkAnalytics = bindProductClickAnalytics(anchor, () =>
      logSiblingProductClick(this.interactiveProduct, this.product, this.activeSibling)
    );

    const style = document.createElement('style');
    style.textContent = ':host { display: block; } a { color: inherit; font: inherit; font-weight: inherit; text-decoration: none; } a:hover { text-decoration: underline; } a:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }';
    this.shadow.replaceChildren(style, anchor);
  }
}

if (!customElements.get(TAG_NAME)) {
  customElements.define(TAG_NAME, DemoProductSiblingLink);
}
