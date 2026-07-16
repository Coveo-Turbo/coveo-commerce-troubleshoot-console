// @vitest-environment jsdom

import type {ChildProduct, Product} from '@coveo/headless/commerce';
import '../../src/components/demo-product-color-swatches';

const COMPONENT_TAG = 'demo-product-color-swatches';

function createSwatchElement(field = 'swatch_hex') {
  const element = document.createElement(COMPONENT_TAG);
  element.setAttribute('field', field);
  return element;
}

function buildChildProduct(
  permanentid: string,
  swatchHex: string,
  overrides: Partial<ChildProduct> = {}
): ChildProduct {
  return {
    permanentid,
    clickUri: `/products/${permanentid}`,
    ec_name: overrides.ec_name ?? permanentid,
    ec_description: null,
    ec_brand: null,
    ec_category: [],
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
      ...(overrides.additionalFields ?? {}),
    },
    excerpt: null,
    resultType: 'child' as never,
    ...overrides,
  };
}

function buildProduct(children: ChildProduct[]): Product {
  return {
    ...buildChildProduct('parent', '#112233', {
      ec_name: 'Parent',
      ec_color: 'Olive',
    }),
    children,
    totalNumberOfChildren: 4,
    position: 1,
    resultType: 'product' as never,
  } as Product;
}

async function flushMicrotasks() {
  await Promise.resolve();
  await Promise.resolve();
}

describe('demo-product-color-swatches', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders unique swatches from swatchHex and shows the extra-count badge', async () => {
    const product = buildProduct([
      buildChildProduct('parent', '#112233', {
        ec_name: 'Parent',
        ec_color: 'Olive',
      }),
      buildChildProduct('blue', '#2f80ed', {
        ec_name: 'Blue tee',
        ec_color: 'Blue',
      }),
      buildChildProduct('tan', '#b08968', {
        ec_name: 'Tan tee',
        ec_color: 'Tan',
      }),
    ]);

    const host = document.createElement('div');
    host.addEventListener('atomic/resolveResult', (event) => {
      (event as CustomEvent<(value: Product) => void>).detail(product);
    });

    const element = createSwatchElement();
    element.setAttribute('max-visible', '2');
    host.append(element);
    document.body.append(host);

    await flushMicrotasks();

    const swatches = Array.from(
      element.shadowRoot?.querySelectorAll<HTMLButtonElement>('button[data-child-id]') ?? []
    );
    const count = element.shadowRoot?.querySelector<HTMLButtonElement>('button[data-action="open-product-page"]');

    expect(swatches).toHaveLength(2);
    expect(swatches[0]?.dataset.childId).toBe('parent');
    expect(swatches[0]?.getAttribute('aria-pressed')).toBe('true');
    expect(count?.textContent).toBe('+1');
  });

  it('groups duplicate swatches and dispatches the first product from that group on hover', async () => {
    const product = buildProduct([
      buildChildProduct('parent', '#112233', {
        ec_name: 'Parent',
        ec_color: 'Olive',
      }),
      buildChildProduct('blue-s', '#2f80ed', {
        ec_name: 'Blue tee small',
        ec_color: 'Blue',
      }),
      buildChildProduct('blue-m', '#2f80ed', {
        ec_name: 'Blue tee medium',
        ec_color: 'Blue',
      }),
    ]);

    const host = document.createElement('div');
    host.addEventListener('atomic/resolveResult', (event) => {
      (event as CustomEvent<(value: Product) => void>).detail(product);
    });

    const selectChildSpy = vi.fn();
    host.addEventListener('atomic/selectChildProduct', selectChildSpy);

    const element = createSwatchElement();
    host.append(element);
    document.body.append(host);

    await flushMicrotasks();

    const swatches = Array.from(
      element.shadowRoot?.querySelectorAll<HTMLButtonElement>('button[data-child-id]') ?? []
    );
    swatches[1]?.dispatchEvent(new MouseEvent('mouseenter'));

    expect(selectChildSpy).toHaveBeenCalledTimes(1);
    expect(swatches).toHaveLength(2);
    expect((selectChildSpy.mock.calls[0]?.[0] as CustomEvent<{child: ChildProduct}>).detail.child.permanentid).toBe(
      'blue-s'
    );
    expect(swatches[1]?.getAttribute('aria-pressed')).toBe('true');
  });

  it('uses the field attribute to resolve swatch colors', async () => {
    const product = buildProduct([
      buildChildProduct('parent', '#112233', {
        ec_name: 'Parent',
        ec_color: 'Olive',
        additionalFields: {
          swatchHex: '#112233',
        },
      }),
      buildChildProduct('blue', '#2f80ed', {
        ec_name: 'Blue tee',
        ec_color: 'Blue',
        additionalFields: {
          swatchHex: '#2f80ed',
        },
      }),
    ]);

    const host = document.createElement('div');
    host.addEventListener('atomic/resolveResult', (event) => {
      (event as CustomEvent<(value: Product) => void>).detail(product);
    });

    const element = createSwatchElement('swatchHex');
    host.append(element);
    document.body.append(host);

    await flushMicrotasks();

    const swatches = Array.from(
      element.shadowRoot?.querySelectorAll<HTMLButtonElement>('button[data-child-id]') ?? []
    );

    expect(swatches).toHaveLength(2);
    expect(swatches[0]?.dataset.swatchColor).toBe('#112233');
    expect(swatches[1]?.dataset.swatchColor).toBe('#2f80ed');
  });

  it('falls back to the legacy swatch-field attribute and default swatch_hex field', async () => {
    const product = buildProduct([
      buildChildProduct('parent', '#112233', {
        ec_name: 'Parent',
        ec_color: 'Olive',
      }),
      buildChildProduct('blue', '#2f80ed', {
        ec_name: 'Blue tee',
        ec_color: 'Blue',
      }),
    ]);

    const host = document.createElement('div');
    host.addEventListener('atomic/resolveResult', (event) => {
      (event as CustomEvent<(value: Product) => void>).detail(product);
    });

    const legacyElement = document.createElement(COMPONENT_TAG);
    legacyElement.setAttribute('swatch-field', 'swatch_hex');
    host.append(legacyElement);

    const defaultElement = document.createElement(COMPONENT_TAG);
    host.append(defaultElement);
    document.body.append(host);

    await flushMicrotasks();

    const legacySwatches = Array.from(
      legacyElement.shadowRoot?.querySelectorAll<HTMLButtonElement>('button[data-child-id]') ?? []
    );
    const defaultSwatches = Array.from(
      defaultElement.shadowRoot?.querySelectorAll<HTMLButtonElement>('button[data-child-id]') ?? []
    );

    expect(legacySwatches).toHaveLength(2);
    expect(defaultSwatches).toHaveLength(2);
  });

  it('supports swatch values returned as arrays', async () => {
    const product = buildProduct([
      buildChildProduct('parent', '#112233', {
        ec_name: 'Parent',
        ec_color: 'Olive',
        additionalFields: {
          swatch_hex: ['#112233'],
        },
      }),
      buildChildProduct('blue', '#2f80ed', {
        ec_name: 'Blue tee',
        ec_color: 'Blue',
        additionalFields: {
          swatch_hex: ['#2f80ed'],
        },
      }),
    ]);

    const host = document.createElement('div');
    host.addEventListener('atomic/resolveResult', (event) => {
      (event as CustomEvent<(value: Product) => void>).detail(product);
    });

    const element = createSwatchElement();
    host.append(element);
    document.body.append(host);

    await flushMicrotasks();

    const swatches = Array.from(
      element.shadowRoot?.querySelectorAll<HTMLButtonElement>('button[data-child-id]') ?? []
    );

    expect(swatches).toHaveLength(2);
  });

  it('keeps swatch order stable after promoting a child to parent', async () => {
    const originalChildren = [
      buildChildProduct('parent', '#112233', {
        ec_name: 'Parent',
        ec_color: 'Olive',
      }),
      buildChildProduct('blue-s', '#2f80ed', {
        ec_name: 'Blue tee small',
        ec_color: 'Blue',
      }),
      buildChildProduct('tan', '#b08968', {
        ec_name: 'Tan tee',
        ec_color: 'Tan',
      }),
    ];

    let currentProduct = buildProduct(originalChildren);

    const host = document.createElement('div');
    host.addEventListener('atomic/resolveResult', (event) => {
      (event as CustomEvent<(value: Product) => void>).detail(currentProduct);
    });

    const element = createSwatchElement() as HTMLElement & {refresh: () => void};
    host.append(element);
    document.body.append(host);

    await flushMicrotasks();

    const initialSwatches = Array.from(
      element.shadowRoot?.querySelectorAll<HTMLButtonElement>('button[data-child-id]') ?? []
    );
    expect(initialSwatches.map((swatch) => swatch.dataset.childId)).toEqual(['parent', 'blue-s', 'tan']);

    currentProduct = {
      ...buildChildProduct('blue-s', '#2f80ed', {
        ec_name: 'Blue tee small',
        ec_color: 'Blue',
      }),
      children: originalChildren,
      totalNumberOfChildren: originalChildren.length,
      position: 1,
      resultType: 'product' as never,
    } as Product;

    element.refresh();

    const promotedSwatches = Array.from(
      element.shadowRoot?.querySelectorAll<HTMLButtonElement>('button[data-child-id]') ?? []
    );
    expect(promotedSwatches.map((swatch) => swatch.dataset.childId)).toEqual(['parent', 'blue-s', 'tan']);
  });

  it('opens the product page when clicking the overflow button', async () => {
    const product = buildProduct([
      buildChildProduct('parent', '#112233', {
        ec_name: 'Parent',
        ec_color: 'Olive',
      }),
      buildChildProduct('blue', '#2f80ed', {
        ec_name: 'Blue tee',
        ec_color: 'Blue',
      }),
      buildChildProduct('tan', '#b08968', {
        ec_name: 'Tan tee',
        ec_color: 'Tan',
      }),
    ]);

    const atomicProduct = document.createElement('atomic-product') as HTMLElement & {
      clickLinkContainer: ReturnType<typeof vi.fn>;
    };
    atomicProduct.clickLinkContainer = vi.fn();
    atomicProduct.addEventListener('atomic/resolveResult', (event) => {
      (event as CustomEvent<(value: Product) => void>).detail(product);
    });

    const element = createSwatchElement();
    element.setAttribute('max-visible', '2');
    atomicProduct.append(element);
    document.body.append(atomicProduct);

    await flushMicrotasks();

    const button = element.shadowRoot?.querySelector<HTMLButtonElement>('button[data-action="open-product-page"]');
    button?.click();

    expect(atomicProduct.clickLinkContainer).toHaveBeenCalledTimes(1);
  });
});
