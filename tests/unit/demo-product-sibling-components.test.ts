// @vitest-environment jsdom

import type {Product} from '@coveo/headless/commerce';
import '../../src/components/demo-product-sibling-image';
import '../../src/components/demo-product-sibling-link';
import '../../src/components/demo-product-sibling-price';
import '../../src/components/demo-product-sibling-size-selector';
import '../../src/components/demo-product-sibling-swatches';
import {parseStyleGroupSiblings} from '../../src/components/demo-product-sibling-data';

const siblings = [
  {
    productId: 'gid://shopify/Product/8997353521321',
    handle: 'heritage-crew-tee-biscotti',
    title: 'Heritage Crew Tee - Biscotti',
    images: ['https://cdn.shopify.com/biscotti-front.jpg', 'https://cdn.shopify.com/biscotti-back.jpg'],
    variants: [
      {variantId: 'gid://shopify/ProductVariant/1', sku: 'HCT-BISC-S', price: 49.95, size: 'S'},
      {variantId: 'gid://shopify/ProductVariant/2', sku: 'HCT-BISC-M', price: 49.95, size: 'M'},
    ],
    colourName: 'Biscotti',
    colourCode: 'BISCOTTI',
    swatchHex: '#D6C1A7',
    styleCode: '2402015004',
  },
  {
    productId: 'gid://shopify/Product/8997353586857',
    handle: 'heritage-crew-tee-burnt-olive',
    title: 'Heritage Crew Tee - Burnt Olive',
    images: ['https://cdn.shopify.com/burnt-olive-front.jpg'],
    variants: [
      {variantId: 'gid://shopify/ProductVariant/3', sku: 'HCT-BROL-XS', price: 59.95, size: 'XS'},
      {variantId: 'gid://shopify/ProductVariant/4', sku: 'HCT-BROL-L', price: 59.95, size: 'L'},
    ],
    colourName: 'Burnt Olive',
    colourCode: 'BURNT_OLIVE',
    swatchHex: '#76654A',
    styleCode: '2402015004',
  },
];

function buildProduct(siblingsField: unknown = JSON.stringify(siblings)): Product {
  return {
    permanentid: 'gid://shopify/ProductVariant/2',
    clickUri: 'https://demo.myshopify.com/products/heritage-crew-tee-biscotti',
    ec_name: 'Heritage Crew Tee - Biscotti - M',
    ec_description: null,
    ec_brand: 'Demo Brand',
    ec_category: ['Tops'],
    ec_item_group_id: '8997353521321',
    ec_price: 49.95,
    ec_promo_price: null,
    ec_shortdesc: null,
    ec_thumbnails: [],
    ec_images: ['https://cdn.shopify.com/fallback.jpg'],
    ec_in_stock: true,
    ec_rating: null,
    ec_gender: null,
    ec_product_id: 'gid://shopify/Product/8997353521321',
    ec_color: 'Biscotti',
    ec_listing: null,
    additionalFields: {
      colour_code: 'BISCOTTI',
      swatch_hex: '#D6C1A7',
      style_group_siblings: siblingsField,
    },
    excerpt: null,
    children: [],
    totalNumberOfChildren: 0,
    position: 1,
    resultType: 'product' as never,
  } as Product;
}

function buildCard(product: Product) {
  const card = document.createElement('atomic-product');
  card.addEventListener('atomic/resolveResult', (event) => {
    (event as CustomEvent<(resolved: Product) => void>).detail(product);
  });

  const productClicks: Array<Record<string, unknown>> = [];
  const engine = {
    relay: {
      emit: vi.fn((name: string, payload: Record<string, unknown>) => {
        if (name === 'ec.productClick') {
          productClicks.push(payload);
        }
      }),
    },
    state: {
      commerceContext: {currency: 'CAD'},
      commerceSearch: {responseId: 'resp-1'},
    },
  };
  card.addEventListener('atomic/initializeComponent', (event) => {
    (event as CustomEvent<(bindings: {engine: typeof engine}) => void>).detail({engine});
  });

  const link = document.createElement('demo-product-sibling-link');
  const price = document.createElement('demo-product-sibling-price');
  const visual = document.createElement('atomic-product-section-visual');
  const visualContent = document.createElement('div');
  const visualRoot = visual.attachShadow({mode: 'open'});
  const image = document.createElement('demo-product-sibling-image');
  const sizeSelector = document.createElement('demo-product-sibling-size-selector');
  const children = document.createElement('atomic-product-section-children');
  const childrenContent = document.createElement('div');
  const childrenRoot = children.attachShadow({mode: 'open'});
  const swatches = document.createElement('demo-product-sibling-swatches');
  visualContent.append(image, sizeSelector);
  visualRoot.append(visualContent);
  childrenContent.append(swatches);
  childrenRoot.append(childrenContent);
  card.append(link, price, visual, children);
  document.body.append(card);

  return {card, image, link, price, sizeSelector, swatches, engine, productClicks};
}

async function flushMicrotasks() {
  await Promise.resolve();
  await Promise.resolve();
}

describe('sibling-aware product components', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    window.dataLayer = [];
  });

  it('parses JSON strings and array-wrapped JSON field values', () => {
    expect(parseStyleGroupSiblings(buildProduct())).toHaveLength(2);
    expect(parseStyleGroupSiblings(buildProduct([JSON.stringify(siblings)]))).toHaveLength(2);
    expect(parseStyleGroupSiblings(buildProduct('{not valid json'))).toEqual([]);
  });

  it('renders the current sibling and all available color swatches', async () => {
    const {image, link, price, sizeSelector, swatches} = buildCard(buildProduct());
    await flushMicrotasks();

    const swatchButtons = swatches.shadowRoot?.querySelectorAll<HTMLButtonElement>('button[data-product-id]');
    const imageElement = image.shadowRoot?.querySelector<HTMLImageElement>('img');
    const linkElement = link.shadowRoot?.querySelector<HTMLAnchorElement>('a');
    const priceElement = price.shadowRoot?.querySelector<HTMLElement>('.price');
    const sizeButtons = sizeSelector.shadowRoot?.querySelectorAll<HTMLButtonElement>('button[data-variant-id]');

    expect(swatchButtons).toHaveLength(2);
    expect(swatchButtons?.[0]?.getAttribute('aria-pressed')).toBe('true');
    expect(imageElement?.src).toBe('https://cdn.shopify.com/biscotti-front.jpg');
    expect(linkElement?.textContent).toBe('Heritage Crew Tee - Biscotti');
    expect(new URL(linkElement?.href ?? '').pathname).toBe('/products/heritage-crew-tee-biscotti');
    expect(priceElement?.textContent).toBe('$49.95');
    expect(Array.from(sizeButtons ?? []).map((button) => button.textContent?.trim())).toEqual(['S', 'M']);
  });

  it('updates the image, title link, and size SKUs when a sibling swatch is selected', async () => {
    const {image, link, price, sizeSelector, swatches} = buildCard(buildProduct());
    await flushMicrotasks();

    const swatchButtons = swatches.shadowRoot?.querySelectorAll<HTMLButtonElement>('button[data-product-id]');
    swatchButtons?.[1]?.click();

    const imageElement = image.shadowRoot?.querySelector<HTMLImageElement>('img');
    const imageLink = image.shadowRoot?.querySelector<HTMLAnchorElement>('a');
    const titleLink = link.shadowRoot?.querySelector<HTMLAnchorElement>('a');
    const priceElement = price.shadowRoot?.querySelector<HTMLElement>('.price');
    const sizeButtons = sizeSelector.shadowRoot?.querySelectorAll<HTMLButtonElement>('button[data-variant-id]');

    expect(swatchButtons?.[1]?.getAttribute('aria-pressed')).toBe('true');
    expect(imageElement?.src).toBe('https://cdn.shopify.com/burnt-olive-front.jpg');
    expect(new URL(imageLink?.href ?? '').pathname).toBe('/products/heritage-crew-tee-burnt-olive');
    expect(titleLink?.textContent).toBe('Heritage Crew Tee - Burnt Olive');
    expect(new URL(titleLink?.href ?? '').pathname).toBe('/products/heritage-crew-tee-burnt-olive');
    expect(priceElement?.textContent).toBe('$59.95');
    expect(Array.from(sizeButtons ?? []).map((button) => button.textContent?.trim())).toEqual(['XS', 'L']);

    sizeButtons?.[1]?.click();
    expect(window.dataLayer?.[0]).toMatchObject({
      event: 'add_to_cart',
      ecommerce: {
        value: 59.95,
        items: [
          {
            item_id: 'HCT-BROL-L',
            item_name: 'Heritage Crew Tee - Burnt Olive',
            item_group_id: 'gid://shopify/Product/8997353586857',
            item_variant: 'Burnt Olive / L',
            color: 'Burnt Olive',
            size: 'L',
          },
        ],
      },
    });
  });

  it('cycles through a sibling gallery and resets to the selected color first image', async () => {
    const {image, swatches} = buildCard(buildProduct());
    await flushMicrotasks();

    const nextImage = image.shadowRoot?.querySelector<HTMLButtonElement>('button[data-action="next-image"]');
    nextImage?.click();

    expect(image.shadowRoot?.querySelector<HTMLImageElement>('img')?.src).toBe(
      'https://cdn.shopify.com/biscotti-back.jpg'
    );
    expect(image.shadowRoot?.querySelector('.carousel-status')?.textContent).toBe('Showing image 2 of 2');
    const imageDots = image.shadowRoot?.querySelectorAll<HTMLButtonElement>('button[data-image-index]');
    expect(imageDots?.[1]?.getAttribute('aria-current')).toBe('true');

    image.shadowRoot
      ?.querySelector<HTMLElement>('.gallery')
      ?.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowRight', bubbles: true}));
    expect(image.shadowRoot?.querySelector<HTMLImageElement>('img')?.src).toBe(
      'https://cdn.shopify.com/biscotti-front.jpg'
    );

    const swatchButtons = swatches.shadowRoot?.querySelectorAll<HTMLButtonElement>('button[data-product-id]');
    swatchButtons?.[1]?.click();

    expect(image.shadowRoot?.querySelector<HTMLImageElement>('img')?.src).toBe(
      'https://cdn.shopify.com/burnt-olive-front.jpg'
    );
    expect(image.shadowRoot?.querySelector('button[data-action="next-image"]')).toBeNull();
  });

  it('emits an ec.productClick via relay when the title link is clicked', async () => {
    const {link, engine, productClicks} = buildCard(buildProduct());
    await flushMicrotasks();

    link.shadowRoot?.querySelector<HTMLAnchorElement>('a')?.dispatchEvent(
      new MouseEvent('click', {bubbles: true})
    );

    expect(engine.relay.emit).toHaveBeenCalledWith('ec.productClick', expect.anything());
    expect(productClicks[0]).toMatchObject({
      currency: 'CAD',
      responseId: 'resp-1',
      position: 1,
      product: {productId: 'gid://shopify/Product/8997353521321', name: 'Heritage Crew Tee - Biscotti'},
    });
  });

  it('emits a product-click on right-click (contextmenu) of the title link', async () => {
    const {link, productClicks} = buildCard(buildProduct());
    await flushMicrotasks();

    // Right-click fires contextmenu/mousedown (not click); it must still emit a product-click.
    link.shadowRoot?.querySelector<HTMLAnchorElement>('a')?.dispatchEvent(
      new MouseEvent('contextmenu', {bubbles: true, button: 2})
    );

    expect(productClicks.at(-1)?.product).toMatchObject({
      productId: 'gid://shopify/Product/8997353521321',
      name: 'Heritage Crew Tee - Biscotti',
    });
  });

  it('emits the selected sibling (not the initial product) after a swatch swap', async () => {
    const {link, swatches, productClicks} = buildCard(buildProduct());
    await flushMicrotasks();

    // Swap to Burnt Olive, then click the title link.
    swatches.shadowRoot?.querySelectorAll<HTMLButtonElement>('button[data-product-id]')?.[1]?.click();
    link.shadowRoot?.querySelector<HTMLAnchorElement>('a')?.dispatchEvent(
      new MouseEvent('click', {bubbles: true})
    );

    expect(productClicks.at(-1)?.product).toMatchObject({
      productId: 'gid://shopify/Product/8997353586857',
      name: 'Heritage Crew Tee - Burnt Olive',
    });
  });

  it('emits the selected color + size variant on add-to-bag in addition to the dataLayer event', async () => {
    const {sizeSelector, swatches, productClicks} = buildCard(buildProduct());
    await flushMicrotasks();

    // Swap to Burnt Olive, then add its XS variant to bag.
    swatches.shadowRoot?.querySelectorAll<HTMLButtonElement>('button[data-product-id]')?.[1]?.click();
    const sizeButtons = sizeSelector.shadowRoot?.querySelectorAll<HTMLButtonElement>('button[data-variant-id]');
    sizeButtons?.[0]?.click();

    expect((window.dataLayer ?? []).length).toBe(1);
    // Variant SKU is used as the productId so the click reflects color + size.
    expect(productClicks.at(-1)?.product).toMatchObject({
      productId: 'HCT-BROL-XS',
      name: 'Heritage Crew Tee - Burnt Olive',
    });
  });

  it('uses the product image as a fallback when sibling JSON is unavailable', async () => {
    const {image, swatches} = buildCard(buildProduct('invalid'));
    await flushMicrotasks();

    expect(swatches.hidden).toBe(true);
    expect(image.shadowRoot?.querySelector<HTMLImageElement>('img')?.src).toBe(
      'https://cdn.shopify.com/fallback.jpg'
    );
  });
});
