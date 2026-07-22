import type {InteractiveProduct, Product} from '@coveo/headless/commerce';
import {
  DEFAULT_SIBLINGS_FIELD,
  findCurrentSibling,
  listenForSiblingSelection,
  logSiblingProductClick,
  parseStyleGroupSiblings,
  resolveInteractiveProduct,
  resolveProductContext,
  type StyleGroupSibling,
  type StyleGroupSiblingVariant,
} from './demo-product-sibling-data';

const TAG_NAME = 'demo-product-sibling-size-selector';
const DEFAULT_LABEL = 'ADD TO BAG:';
const STANDARD_SIZE_ORDER = ['xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl'];

type DemoDataLayerEvent = {
  event: 'add_to_cart';
  ecommerce: {
    items: Array<Record<string, string | number>>;
    value?: number;
  };
};

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export class DemoProductSiblingSizeSelector extends HTMLElement {
  private readonly shadow = this.attachShadow({mode: 'open'});
  private product: Product | null = null;
  private interactiveProduct: InteractiveProduct | null = null;
  private activeSibling: StyleGroupSibling | null = null;
  private selectedVariantId = '';
  private hoverTarget: HTMLElement | null = null;
  private removeSelectionListener: (() => void) | null = null;
  private removeVisibilityBindings: (() => void) | null = null;
  private restoreOverlayContainerPosition: (() => void) | null = null;

  public connectedCallback() {
    this.prepareInteractionTarget();
    this.bindVisibilityState();
    queueMicrotask(() => this.refresh());
  }

  public disconnectedCallback() {
    this.removeSelectionListener?.();
    this.removeVisibilityBindings?.();
    this.restoreOverlayContainerPosition?.();
    this.removeSelectionListener = null;
    this.removeVisibilityBindings = null;
    this.restoreOverlayContainerPosition = null;
  }

  private get label() {
    return this.getAttribute('label')?.trim() || DEFAULT_LABEL;
  }

  private prepareInteractionTarget() {
    const visual = this.closest<HTMLElement>('atomic-product-section-visual');
    this.hoverTarget = visual ?? this.closest<HTMLElement>('atomic-product') ?? this.parentElement;
    if (!visual || getComputedStyle(visual).position !== 'static') {
      return;
    }

    const originalPosition = visual.style.position;
    visual.style.position = 'relative';
    this.restoreOverlayContainerPosition = () => {
      visual.style.position = originalPosition;
    };
  }

  private bindVisibilityState() {
    const target = this.hoverTarget;
    if (!target) {
      return;
    }

    const show = () => this.setAttribute('data-visible', 'true');
    const hide = (event?: FocusEvent) => {
      if (event?.relatedTarget instanceof Node && target.contains(event.relatedTarget)) {
        return;
      }
      this.removeAttribute('data-visible');
    };
    target.addEventListener('mouseenter', show);
    target.addEventListener('mouseleave', hide);
    target.addEventListener('focusin', show);
    target.addEventListener('focusout', hide);
    target.addEventListener('touchstart', show, {passive: true});
    this.removeVisibilityBindings = () => {
      target.removeEventListener('mouseenter', show);
      target.removeEventListener('mouseleave', hide);
      target.removeEventListener('focusin', show);
      target.removeEventListener('focusout', hide);
      target.removeEventListener('touchstart', show);
    };
  }

  private refresh() {
    this.product = resolveProductContext(this);
    if (!this.product) {
      this.hide();
      return;
    }

    this.interactiveProduct = resolveInteractiveProduct(this);
    const field = this.getAttribute('field')?.trim() || DEFAULT_SIBLINGS_FIELD;
    this.setActiveSibling(findCurrentSibling(this.product, parseStyleGroupSiblings(this.product, field)));
    this.removeSelectionListener?.();
    this.removeSelectionListener = listenForSiblingSelection(this, this.product, (sibling) => {
      this.setActiveSibling(sibling);
    });
  }

  private setActiveSibling(sibling: StyleGroupSibling | null) {
    this.activeSibling = sibling;
    const variants = this.sortedVariants;
    this.selectedVariantId = variants[0]?.variantId || variants[0]?.sku || '';
    if (variants.length === 0) {
      this.hide();
      return;
    }

    this.hidden = false;
    this.render();
  }

  private get sortedVariants() {
    const seen = new Set<string>();
    return (this.activeSibling?.variants ?? [])
      .filter((variant) => {
        const key = variant.size.trim().toLowerCase();
        if (!key || seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      })
      .sort((left, right) => {
        const leftRank = STANDARD_SIZE_ORDER.indexOf(left.size.trim().toLowerCase());
        const rightRank = STANDARD_SIZE_ORDER.indexOf(right.size.trim().toLowerCase());
        return (leftRank < 0 ? Number.MAX_SAFE_INTEGER : leftRank) -
          (rightRank < 0 ? Number.MAX_SAFE_INTEGER : rightRank);
      });
  }

  private hide() {
    this.hidden = true;
    this.shadow.replaceChildren();
  }

  private pushAddToCart(variant: StyleGroupSiblingVariant) {
    if (!this.activeSibling) {
      return;
    }

    this.selectedVariantId = variant.variantId || variant.sku;
    this.setActiveState();
    const price = variant.price;
    const payload: DemoDataLayerEvent = {
      event: 'add_to_cart',
      ecommerce: {
        items: [
          {
            item_id: variant.sku || variant.variantId,
            item_name: this.activeSibling.title,
            item_group_id: this.activeSibling.productId,
            item_variant: [this.activeSibling.colourName, variant.size].filter(Boolean).join(' / '),
            quantity: 1,
            color: this.activeSibling.colourName,
            size: variant.size,
            ...(price === undefined ? {} : {price}),
          },
        ],
        ...(price === undefined ? {} : {value: price}),
      },
    };
    const dataLayer = window.dataLayer ?? [];
    dataLayer.push(payload);
    window.dataLayer = dataLayer;

    // Also emit the Coveo product-click analytics event for the selected color + size variant.
    logSiblingProductClick(this.interactiveProduct, this.product, this.activeSibling, variant);
  }

  private setActiveState() {
    for (const button of this.shadow.querySelectorAll<HTMLButtonElement>('button[data-variant-id]')) {
      const active = button.dataset.variantId === this.selectedVariantId;
      button.classList.toggle('size-active', active);
      button.setAttribute('aria-pressed', String(active));
    }
  }

  private bindEvents() {
    for (const button of this.shadow.querySelectorAll<HTMLButtonElement>('button[data-variant-id]')) {
      const variantId = button.dataset.variantId;
      const variant = this.sortedVariants.find((candidate) => (candidate.variantId || candidate.sku) === variantId);
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (variant) {
          this.pushAddToCart(variant);
        }
      });
    }
  }

  private render() {
    const variants = this.sortedVariants;
    this.shadow.innerHTML = `
      <style>
        :host { display: block; position: absolute; inset-inline: 0; bottom: 0; z-index: 1; max-height: 0; opacity: 0; overflow: hidden; pointer-events: none; transform: translateY(100%); transition: max-height 180ms ease, opacity 160ms ease, transform 180ms ease; }
        :host([data-visible='true']) { max-height: 8rem; opacity: 1; pointer-events: auto; transform: translateY(0); }
        @media (hover: none), (pointer: coarse) { :host { max-height: 8rem; opacity: 1; pointer-events: auto; transform: translateY(0); transition: none; } }
        .panel { pointer-events: auto; padding: .55rem .35rem .45rem; background: linear-gradient(to top, rgba(255,255,255,.98), rgba(255,255,255,.88)); text-align: center; }
        .label { color: #111827; font-size: .78rem; font-weight: 800; letter-spacing: .08em; margin-bottom: .3rem; text-transform: uppercase; }
        .sizes { display: flex; flex-wrap: wrap; justify-content: center; gap: .35rem .5rem; }
        .size { appearance: none; border: 0; background: transparent; color: #111827; cursor: pointer; font-size: .78rem; font-weight: 700; letter-spacing: .02em; min-inline-size: 1.8rem; padding: .12rem .1rem; text-transform: uppercase; transition: color 120ms ease, transform 120ms ease; }
        .size:hover { transform: translateY(-1px); }
        .size:focus-visible { outline: 2px solid #111827; outline-offset: 2px; }
        .size-active { color: #6b7280; }
      </style>
      <div class="panel" aria-label="Add to bag options">
        <div class="label">${escapeHtml(this.label)}</div>
        <div class="sizes" role="list">
          ${variants.map((variant) => {
            const id = variant.variantId || variant.sku;
            const active = id === this.selectedVariantId;
            return `<button type="button" class="size${active ? ' size-active' : ''}" data-variant-id="${escapeHtml(id)}" aria-label="Add size ${escapeHtml(variant.size)} to bag" aria-pressed="${String(active)}" title="Add size ${escapeHtml(variant.size)} to bag">${escapeHtml(variant.size)}</button>`;
          }).join('')}
        </div>
      </div>
    `;
    this.bindEvents();
  }
}

if (!customElements.get(TAG_NAME)) {
  customElements.define(TAG_NAME, DemoProductSiblingSizeSelector);
}
