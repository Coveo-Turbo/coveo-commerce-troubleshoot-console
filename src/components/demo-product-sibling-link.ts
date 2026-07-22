import type {Product} from '@coveo/headless/commerce';
import {
  DEFAULT_SIBLINGS_FIELD,
  findCurrentSibling,
  getSiblingProductUrl,
  listenForSiblingSelection,
  parseStyleGroupSiblings,
  resolveProductContext,
  type StyleGroupSibling,
} from './demo-product-sibling-data';

const TAG_NAME = 'demo-product-sibling-link';

export class DemoProductSiblingLink extends HTMLElement {
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
    anchor.addEventListener('click', (event) => event.stopPropagation());

    const style = document.createElement('style');
    style.textContent = ':host { display: block; } a { color: inherit; font: inherit; font-weight: inherit; text-decoration: none; } a:hover { text-decoration: underline; } a:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }';
    this.shadow.replaceChildren(style, anchor);
  }
}

if (!customElements.get(TAG_NAME)) {
  customElements.define(TAG_NAME, DemoProductSiblingLink);
}
