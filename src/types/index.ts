export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'AUD' | 'CAD';

export interface CurrencyRate {
  symbol: string;
  rate: number; // multiplier relative to USD (USD = 1)
  prefix: boolean;
  code: Currency;
  name: string;
}

export type Technique = 'Hand-Tufted' | 'Hand-Knotted' | 'Flatweave';

export type Material = 
  | 'Blended Wool' 
  | '100% Pure Wool' 
  | 'Wool & Botanical Silk' 
  | 'New Zealand Wool & Viscose'
  | 'Highland Wool';

export type RugShape = 'Rectangular' | 'Runner' | 'Round' | 'Oval' | 'Custom';

export type CollectionSlug = 
  | 'modern-forms' 
  | 'quiet-neutrals' 
  | 'botanical-studies' 
  | 'heritage-reimagined' 
  | 'texture-sculpture' 
  | 'hand-knotted-collection';

export interface ProductVariant {
  id: string;
  size: string; // e.g. "5' × 8' (152 × 244 cm)"
  dimensionsFt: string; // "5' × 8'"
  sku: string;
  priceUSD: number;
  inventory: number; // 0 = sold out, 1 = last one available
  isReadyToShip: boolean;
  productionTimeWeeks?: string;
  weightKg: number;
}

export type ImageViewType =
  | 'full'
  | 'room'
  | 'living-room'
  | 'bedroom'
  | 'reading-nook'
  | 'dining'
  | 'entryway'
  | 'texture'
  | 'detail'
  | 'backing'
  | 'corner'
  | 'artisan-loom';

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  viewType: ImageViewType;
  label: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  collection: string;
  collectionSlug: CollectionSlug;
  technique: Technique;
  techniqueDescription: string;
  material: Material;
  materialComposition: string;
  colors: string[];
  pileHeight: string;
  knotDensity?: string;
  origin: string;
  description: string;
  designStory: string;
  craftNotes: string;
  careSummary: string;
  featured: boolean;
  bestSeller: boolean;
  isNew: boolean;
  isReadyToShip: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface CartItem {
  productId: string;
  productSlug: string;
  productName: string;
  productImage: string;
  variantId: string;
  size: string;
  sku: string;
  priceUSD: number;
  technique: Technique;
  isReadyToShip: boolean;
  estimatedDispatch: string;
  quantity: number;
}

export interface CustomQuoteRequest {
  id: string;
  referenceNumber: string;
  createdAt: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  shape: RugShape;
  length: number;
  width: number;
  unit: 'feet' | 'cm';
  technique: Technique;
  material: Material;
  pileDepth: string;
  colorPreference: string;
  estimatedPriceUSD: { min: number; max: number };
  roomType: string;
  notes?: string;
  status: 'Received' | 'Reviewing' | 'Quotation Sent' | 'Production Scheduled';
}

export type OrderStatus = 
  | 'ORDER PLACED' 
  | 'PROCESSING' 
  | 'IN PRODUCTION' 
  | 'QUALITY CHECK' 
  | 'DISPATCHED' 
  | 'IN TRANSIT' 
  | 'DELIVERED';

export interface OrderTimelineEvent {
  title: string;
  date: string;
  description: string;
  completed: boolean;
  current?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "TWA-2026-8491"
  date: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    address: string;
    apartment?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  shippingMethod: {
    name: string;
    estimatedDays: string;
    costUSD: number;
  };
  items: CartItem[];
  currency: Currency;
  subtotalUSD: number;
  shippingUSD: number;
  taxUSD: number;
  totalUSD: number;
  status: OrderStatus;
  carrier: string;
  trackingNumber: string;
  estimatedDeliveryDate: string;
  isMadeToOrder: boolean;
  timeline: OrderTimelineEvent[];
  paymentProvider?: string;
  paymentId?: string;
}

export interface JournalArticle {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  readTime: string;
  publishedDate: string;
  heroImage: string;
  author: string;
  authorRole: string;
  excerpt: string;
  sections: {
    heading?: string;
    body: string[];
    quote?: string;
    image?: {
      url: string;
      caption: string;
    };
  }[];
}
