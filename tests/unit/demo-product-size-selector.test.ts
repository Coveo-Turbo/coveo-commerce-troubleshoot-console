// @vitest-environment jsdom

import type {ChildProduct, Product} from '@coveo/headless/commerce';
import '../../src/components/demo-product-size-selector';

const COMPONENT_TAG = 'demo-product-size-selector';

function createSizeElement(field = 'ec_size', swatchField = 'swatch_hex') {
  const element = document.createElement(COMPONENT_TAG) as HTMLElement & {refresh: () => void};
  element.setAttribute('field', field);
  element.setAttribute('swatch-field', swatchField);
  return element;
}

function buildChildProduct(
  permanentid: string,
  swatchHex: string,
  size: string,
  overrides: Partial<ChildProduct> = {}
): ChildProduct {
  const {additionalFields: overrideAdditionalFields, ...restOverrides} = overrides;

  return {
    permanentid,
    clickUri: `/products/${permanentid}`,
    ec_name: overrides.ec_name ?? permanentid,
    ec_description: null,
    ec_brand: null,
    ec_category: ['Tops'],
    ec_item_group_id: 'group-1',
    ec_price: 49.95,
    ec_promo_price: null,
    ec_shortdesc: null,
    ec_thumbnails: [],
    ec_images: [],
    ec_in_stock: true,
    ec_rating: null,
    ec_gender: null,
    ec_product_id: permanentid,
    ec_color: overrides.ec_color ?? permanentid,
    ec_listing: null,
    additionalFields: {
      swatch_hex: swatchHex,
      ec_size: size,
      ...(overrideAdditionalFields ?? {}),
    },
    excerpt: null,
    resultType: 'child' as never,
    ...restOverrides,
  };
}

function buildProduct(children: ChildProduct[]): Product {
  return {
    ...buildChildProduct('olive-s', '#556b2f', 'S', {
      ec_name: 'Crew Tee Olive',
      ec_color: 'Olive',
      ec_brand: 'Demo Brand',
    }),
    children,
    totalNumberOfChildren: children.length,
    position: 1,
    resultType: 'product' as never,
  } as Product;
}

async function flushMicrotasks() {
  await Promise.resolve();
  await Promise.resolve();
}

describe('demo-product-size-selector', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    window.dataLayer = [];
  });

  it('renders unique sizes for the currently selected swatch group', async () => {
    const product = buildProduct([
      buildChildProduct('olive-s', '#556b2f', 'S', {
        ec_name: 'Crew Tee Olive Small',
        ec_color: 'Olive',
      }),
      buildChildProduct('olive-m', '#556b2f', 'M', {
        ec_name: 'Crew Tee Olive Medium',
        ec_color: 'Olive',
      }),
      buildChildProduct('blue-l', '#2f80ed', 'L', {
        ec_name: 'Crew Tee Blue Large',
        ec_color: 'Blue',
      }),
    ]);

    const host = document.createElement('div');
    host.addEventListener('atomic/resolveResult', (event) => {
      (event as CustomEvent<(value: Product) => void>).detail(product);
    });

    const visual = document.createElement('atomic-product-section-visual');
    const element = createSizeElement();
    visual.append(element);
    host.append(visual);
    document.body.append(host);

    await flushMicrotasks();

    const sizes = Array.from(
      element.shadowRoot?.querySelectorAll<HTMLButtonElement>('button[data-size-key]') ?? []
    );

    expect(sizes.map((size) => size.textContent?.trim())).toEqual(['S', 'M']);
    expect(sizes[0]?.getAttribute('aria-pressed')).toBe('true');
  });

  it('pushes an add_to_cart payload to dataLayer when a size is clicked', async () => {
    const product = buildProduct([
      buildChildProduct('olive-s', '#556b2f', 'S', {
        ec_name: 'Crew Tee Olive Small',
        ec_color: 'Olive',
      }),
      buildChildProduct('olive-m', '#556b2f', 'M', {
        ec_name: 'Crew Tee Olive Medium',
        ec_color: 'Olive',
      }),
    ]);

    const host = document.createElement('div');
    host.addEventListener('atomic/resolveResult', (event) => {
      (event as CustomEvent<(value: Product) => void>).detail(product);
    });

    const visual = document.createElement('atomic-product-section-visual');
    const element = createSizeElement();
    visual.append(element);
    host.append(visual);
    document.body.append(host);

    await flushMicrotasks();

    const sizes = Array.from(
      element.shadowRoot?.querySelectorAll<HTMLButtonElement>('button[data-size-key]') ?? []
    );
    sizes[1]?.click();

    expect(window.dataLayer).toHaveLength(1);
    expect(window.dataLayer?.[0]).toMatchObject({
      event: 'add_to_cart',
      ecommerce: {
        items: [
          {
            item_id: 'olive-m',
            item_name: 'Crew Tee Olive Medium',
            size: 'M',
            color: 'Olive',
            quantity: 1,
          },
        ],
      },
    });
    expect(sizes[1]?.getAttribute('aria-pressed')).toBe('true');
  });

  it('reveals the add-to-bag panel when the image area is hovered', async () => {
    const product = buildProduct([
      buildChildProduct('olive-s', '#556b2f', 'S', {
        ec_name: 'Crew Tee Olive Small',
        ec_color: 'Olive',
      }),
      buildChildProduct('olive-m', '#556b2f', 'M', {
        ec_name: 'Crew Tee Olive Medium',
        ec_color: 'Olive',
      }),
    ]);

    const host = document.createElement('atomic-product');
    host.addEventListener('atomic/resolveResult', (event) => {
      (event as CustomEvent<(value: Product) => void>).detail(product);
    });

    const visual = document.createElement('atomic-product-section-visual');
    const element = createSizeElement();
    visual.append(element);
    host.append(visual);
    document.body.append(host);

    await flushMicrotasks();

    expect(element.hidden).toBe(false);
    expect(element.hasAttribute('data-visible')).toBe(false);
    expect(element.shadowRoot?.querySelector('button[data-size-key]')).not.toBeNull();
    expect(visual.style.position).toBe('relative');

    visual.dispatchEvent(new MouseEvent('mouseenter', {bubbles: true}));
    expect(element.getAttribute('data-visible')).toBe('true');

    visual.dispatchEvent(new MouseEvent('mouseleave', {bubbles: true}));
    expect(element.hasAttribute('data-visible')).toBe(false);
  });

  it('updates visible sizes when the promoted product changes swatch group', async () => {
    const originalChildren = [
      buildChildProduct('olive-s', '#556b2f', 'S', {
        ec_name: 'Crew Tee Olive Small',
        ec_color: 'Olive',
      }),
      buildChildProduct('olive-m', '#556b2f', 'M', {
        ec_name: 'Crew Tee Olive Medium',
        ec_color: 'Olive',
      }),
      buildChildProduct('blue-l', '#2f80ed', 'L', {
        ec_name: 'Crew Tee Blue Large',
        ec_color: 'Blue',
      }),
    ];

    let currentProduct = buildProduct(originalChildren);

    const host = document.createElement('div');
    host.addEventListener('atomic/resolveResult', (event) => {
      (event as CustomEvent<(value: Product) => void>).detail(currentProduct);
    });

    const visual = document.createElement('atomic-product-section-visual');
    const element = createSizeElement();
    visual.append(element);
    host.append(visual);
    document.body.append(host);

    await flushMicrotasks();

    currentProduct = {
      ...buildChildProduct('blue-l', '#2f80ed', 'L', {
        ec_name: 'Crew Tee Blue Large',
        ec_color: 'Blue',
      }),
      children: originalChildren,
      totalNumberOfChildren: originalChildren.length,
      position: 1,
      resultType: 'product' as never,
    } as Product;

    element.refresh();

    const sizes = Array.from(
      element.shadowRoot?.querySelectorAll<HTMLButtonElement>('button[data-size-key]') ?? []
    );

    expect(sizes.map((size) => size.textContent?.trim())).toEqual(['L']);
  });

  it('supports size values returned as arrays', async () => {
    const product = buildProduct([
      buildChildProduct('olive-s', '#556b2f', 'S', {
        ec_name: 'Crew Tee Olive Small',
        ec_color: 'Olive',
        additionalFields: {
          ec_size: ['S'],
        },
      }),
      buildChildProduct('olive-m', '#556b2f', 'M', {
        ec_name: 'Crew Tee Olive Medium',
        ec_color: 'Olive',
        additionalFields: {
          ec_size: ['M'],
        },
      }),
    ]);

    const host = document.createElement('div');
    host.addEventListener('atomic/resolveResult', (event) => {
      (event as CustomEvent<(value: Product) => void>).detail(product);
    });

    const visual = document.createElement('atomic-product-section-visual');
    const element = createSizeElement();
    visual.append(element);
    host.append(visual);
    document.body.append(host);

    await flushMicrotasks();

    const sizes = Array.from(
      element.shadowRoot?.querySelectorAll<HTMLButtonElement>('button[data-size-key]') ?? []
    );

    expect(sizes).toHaveLength(2);
  });

  it('renders standard apparel sizes in canonical order', async () => {
    const product = buildProduct([
      buildChildProduct('olive-xl', '#556b2f', 'XL', {
        ec_name: 'Crew Tee Olive XL',
        ec_color: 'Olive',
      }),
      buildChildProduct('olive-s', '#556b2f', 'S', {
        ec_name: 'Crew Tee Olive S',
        ec_color: 'Olive',
      }),
      buildChildProduct('olive-xs', '#556b2f', 'XS', {
        ec_name: 'Crew Tee Olive XS',
        ec_color: 'Olive',
      }),
      buildChildProduct('olive-m', '#556b2f', 'M', {
        ec_name: 'Crew Tee Olive M',
        ec_color: 'Olive',
      }),
      buildChildProduct('olive-xxs', '#556b2f', 'XXS', {
        ec_name: 'Crew Tee Olive XXS',
        ec_color: 'Olive',
      }),
      buildChildProduct('olive-l', '#556b2f', 'L', {
        ec_name: 'Crew Tee Olive L',
        ec_color: 'Olive',
      }),
      buildChildProduct('olive-xxl', '#556b2f', 'XXL', {
        ec_name: 'Crew Tee Olive XXL',
        ec_color: 'Olive',
      }),
    ]);

    const host = document.createElement('div');
    host.addEventListener('atomic/resolveResult', (event) => {
      (event as CustomEvent<(value: Product) => void>).detail(product);
    });

    const visual = document.createElement('atomic-product-section-visual');
    const element = createSizeElement();
    visual.append(element);
    host.append(visual);
    document.body.append(host);

    await flushMicrotasks();

    const sizes = Array.from(
      element.shadowRoot?.querySelectorAll<HTMLButtonElement>('button[data-size-key]') ?? []
    );

    expect(sizes.map((size) => size.textContent?.trim())).toEqual([
      'XXS',
      'XS',
      'S',
      'M',
      'L',
      'XL',
      'XXL',
    ]);
  });

  it('renders a single add to bag button when the size is Default Title', async () => {
    const product = buildProduct([
      buildChildProduct('olive-default', '#556b2f', 'Default Title', {
        ec_name: 'Crew Tee Olive',
        ec_color: 'Olive',
      }),
    ]);

    const host = document.createElement('div');
    host.addEventListener('atomic/resolveResult', (event) => {
      (event as CustomEvent<(value: Product) => void>).detail(product);
    });

    const visual = document.createElement('atomic-product-section-visual');
    const element = createSizeElement();
    visual.append(element);
    host.append(visual);
    document.body.append(host);

    await flushMicrotasks();

    const sizeButtons = Array.from(
      element.shadowRoot?.querySelectorAll<HTMLButtonElement>('button[data-size-key]') ?? []
    );
    const addToBagButton = element.shadowRoot?.querySelector<HTMLButtonElement>(
      'button[data-action="add-to-bag"]'
    );

    expect(element.hidden).toBe(false);
    expect(element.getAttribute('data-has-sizes')).toBe(null);
    expect(sizeButtons).toHaveLength(0);
    expect(addToBagButton?.textContent?.trim()).toBe('Add to bag');
  });

  it('keeps the no-variant add to bag button visible without card hover', async () => {
    const product = buildProduct([
      buildChildProduct('olive-default', '#556b2f', 'Default Title', {
        ec_name: 'Crew Tee Olive',
        ec_color: 'Olive',
      }),
    ]);

    const host = document.createElement('atomic-product');
    host.addEventListener('atomic/resolveResult', (event) => {
      (event as CustomEvent<(value: Product) => void>).detail(product);
    });

    const visual = document.createElement('atomic-product-section-visual');
    const element = createSizeElement();
    visual.append(element);
    host.append(visual);
    document.body.append(host);

    await flushMicrotasks();

    expect(element.hasAttribute('data-visible')).toBe(false);
    expect(element.shadowRoot?.querySelector('button[data-action="add-to-bag"]')).not.toBeNull();
  });

  it('pushes an add_to_cart payload without size when there is no real size variant', async () => {
    const product = buildProduct([
      buildChildProduct('olive-default', '#556b2f', 'Default Title', {
        ec_name: 'Crew Tee Olive',
        ec_color: 'Olive',
      }),
    ]);

    const host = document.createElement('div');
    host.addEventListener('atomic/resolveResult', (event) => {
      (event as CustomEvent<(value: Product) => void>).detail(product);
    });

    const visual = document.createElement('atomic-product-section-visual');
    const element = createSizeElement();
    visual.append(element);
    host.append(visual);
    document.body.append(host);

    await flushMicrotasks();

    const addToBagButton = element.shadowRoot?.querySelector<HTMLButtonElement>(
      'button[data-action="add-to-bag"]'
    );
    addToBagButton?.click();

    expect(window.dataLayer).toHaveLength(1);
    expect(window.dataLayer?.[0]).toMatchObject({
      event: 'add_to_cart',
      ecommerce: {
        items: [
          {
            item_id: 'olive-default',
            item_name: 'Crew Tee Olive',
            color: 'Olive',
            quantity: 1,
          },
        ],
      },
    });
    expect(window.dataLayer?.[0]).not.toHaveProperty('ecommerce.items.0.size');
  });
});
