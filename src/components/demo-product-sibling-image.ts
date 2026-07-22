import type {Product} from '@coveo/headless/commerce';
import {
  bindProductClickAnalytics,
  DEFAULT_SIBLINGS_FIELD,
  findCurrentSibling,
  getProductFallbackImages,
  getSiblingProductUrl,
  listenForSiblingSelection,
  logSiblingProductClick,
  parseStyleGroupSiblings,
  resolveCommerceEngine,
  resolveProductContext,
  type StyleGroupSibling,
} from './demo-product-sibling-data';

const TAG_NAME = 'demo-product-sibling-image';

export class DemoProductSiblingImage extends HTMLElement {
  private readonly shadow = this.attachShadow({mode: 'open'});
  private product: Product | null = null;
  private activeSibling: StyleGroupSibling | null = null;
  private activeImageIndex = 0;
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

    const field = this.getAttribute('field')?.trim() || DEFAULT_SIBLINGS_FIELD;
    this.activeSibling = findCurrentSibling(this.product, parseStyleGroupSiblings(this.product, field));
    this.activeImageIndex = 0;
    this.removeSelectionListener?.();
    this.removeSelectionListener = listenForSiblingSelection(this, this.product, (sibling) => {
      this.activeSibling = sibling;
      this.activeImageIndex = 0;
      this.render();
    });
    this.render();
  }

  private get images(): string[] {
    if (!this.product) {
      return [];
    }

    return this.activeSibling?.images.length ? this.activeSibling.images : getProductFallbackImages(this.product);
  }

  private selectImage(index: number, focusAction?: 'previous-image' | 'next-image') {
    const images = this.images;
    if (images.length <= 1) {
      return;
    }

    this.activeImageIndex = (index + images.length) % images.length;
    this.render();
    if (focusAction) {
      queueMicrotask(() => {
        this.shadow.querySelector<HTMLButtonElement>(`button[data-action="${focusAction}"]`)?.focus();
      });
    }
  }

  private render() {
    if (!this.product) {
      return;
    }

    const images = this.images;
    const src = images[this.activeImageIndex];
    if (!src) {
      this.hidden = true;
      this.shadow.replaceChildren();
      return;
    }

    this.hidden = false;
    const href = this.activeSibling ? getSiblingProductUrl(this.product, this.activeSibling) : this.product.clickUri;
    const alt = this.activeSibling?.title || this.product.ec_name || '';
    const gallery = document.createElement('div');
    gallery.className = 'gallery';
    gallery.tabIndex = 0;
    gallery.setAttribute('role', 'region');
    gallery.setAttribute('aria-roledescription', 'carousel');
    gallery.setAttribute('aria-label', `${alt} image gallery`);
    gallery.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        this.selectImage(this.activeImageIndex - 1, 'previous-image');
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        this.selectImage(this.activeImageIndex + 1, 'next-image');
      }
    });
    const link = document.createElement('a');
    link.href = href || '#';
    this.removeLinkAnalytics?.();
    this.removeLinkAnalytics = bindProductClickAnalytics(link, () =>
      logSiblingProductClick(resolveCommerceEngine(this), this.product, this.activeSibling)
    );

    const image = document.createElement('img');
    image.src = src;
    image.alt = alt;
    image.loading = 'lazy';
    image.setAttribute('aria-label', images.length > 1 ? `${alt}, image ${this.activeImageIndex + 1} of ${images.length}` : alt);
    link.append(image);
    gallery.append(link);

    if (images.length > 1) {
      const previousButton = document.createElement('button');
      previousButton.type = 'button';
      previousButton.className = 'carousel-control carousel-previous';
      previousButton.dataset.action = 'previous-image';
      previousButton.setAttribute('aria-label', 'Show previous product image');
      previousButton.textContent = '\u2039';
      previousButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.selectImage(this.activeImageIndex - 1, 'previous-image');
      });

      const nextButton = document.createElement('button');
      nextButton.type = 'button';
      nextButton.className = 'carousel-control carousel-next';
      nextButton.dataset.action = 'next-image';
      nextButton.setAttribute('aria-label', 'Show next product image');
      nextButton.textContent = '\u203a';
      nextButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.selectImage(this.activeImageIndex + 1, 'next-image');
      });

      const pagination = document.createElement('div');
      pagination.className = 'carousel-pagination';
      pagination.setAttribute('aria-label', 'Select product image');
      images.forEach((_, index) => {
        const dot = document.createElement('button');
        const active = index === this.activeImageIndex;
        dot.type = 'button';
        dot.className = `carousel-dot${active ? ' carousel-dot-active' : ''}`;
        dot.dataset.imageIndex = String(index);
        dot.setAttribute('aria-label', `Show product image ${index + 1} of ${images.length}`);
        dot.setAttribute('aria-current', active ? 'true' : 'false');
        dot.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          this.selectImage(index);
        });
        pagination.append(dot);
      });

      const status = document.createElement('span');
      status.className = 'carousel-status';
      status.setAttribute('aria-live', 'polite');
      status.textContent = `Showing image ${this.activeImageIndex + 1} of ${images.length}`;
      gallery.append(previousButton, nextButton, pagination, status);
    }

    const style = document.createElement('style');
    style.textContent = `
      :host { display: block; inline-size: 100%; }
      .gallery { position: relative; inline-size: 100%; aspect-ratio: 1 / 1; outline: none; }
      .gallery:focus-visible { outline: 2px solid #111827; outline-offset: 2px; }
      a { display: block; inline-size: 100%; block-size: 100%; }
      img { display: block; inline-size: 100%; block-size: 100%; object-fit: var(--demo-sibling-image-fit, cover); object-position: center; }
      .carousel-control { appearance: none; display: grid; position: absolute; inset-block-start: 50%; z-index: 1; inline-size: 2.25rem; block-size: 2.25rem; place-items: center; border: 1px solid rgb(17 24 39 / 18%); border-radius: 999px; background: rgb(255 255 255 / 92%); color: #111827; cursor: pointer; font-size: 1.35rem; line-height: 1; opacity: 0; transform: translateY(-50%); transition: opacity 120ms ease, background 120ms ease, transform 120ms ease; }
      .carousel-previous { inset-inline-start: .5rem; }
      .carousel-next { inset-inline-end: .5rem; }
      .gallery:hover .carousel-control, .carousel-control:focus-visible { opacity: 1; }
      .carousel-control:hover { background: #fff; transform: translateY(-50%) scale(1.05); }
      .carousel-control:focus-visible { outline: 2px solid #111827; outline-offset: 2px; }
      .carousel-pagination { display: flex; position: absolute; inset-inline-start: 50%; inset-block-end: .6rem; z-index: 1; gap: .35rem; transform: translateX(-50%); }
      .carousel-dot { appearance: none; inline-size: .45rem; block-size: .45rem; border: 1px solid rgb(17 24 39 / 35%); border-radius: 999px; background: rgb(255 255 255 / 85%); cursor: pointer; padding: 0; transition: background 120ms ease, transform 120ms ease; }
      .carousel-dot:hover, .carousel-dot:focus-visible { transform: scale(1.25); }
      .carousel-dot-active { background: #111827; border-color: #111827; }
      .carousel-dot:focus-visible { outline: 2px solid #111827; outline-offset: 2px; }
      .carousel-status { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap; }
      @media (hover: none), (pointer: coarse) { .carousel-control { opacity: 1; } }
    `;
    this.shadow.replaceChildren(style, gallery);
  }
}

if (!customElements.get(TAG_NAME)) {
  customElements.define(TAG_NAME, DemoProductSiblingImage);
}
