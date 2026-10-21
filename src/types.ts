export interface ProductImage {
  url: string;
  alt?: string;
  is_primary?: boolean;
  order?: number;
}

export interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  maker: string;
  cls: string;
  school: string;
  image: string; // Designated primary image URL
  images?: string[]; // Array of additional/all gallery image URLs
  gallery?: ProductImage[]; // Detailed gallery records
  stock: string;
  description?: string;
  wpId?: number | string;
  source?: 'wordpress' | 'custom' | 'default';
  updatedAt?: string;

  // Professional specifications
  originalPrice?: number;
  materials?: string;
  dimensions?: string;
  weight?: string;
  careInstructions?: string;
  inStockCount?: number;
  slug?: string;
  makerId?: string;
  featured?: boolean;
  variants?: ProductVariant[];
  prepTimeDays?: number;
  originCity?: string;
  pickupPincode?: string;
  isMadeToOrder?: boolean;
  color?: string;
  weightKg?: number;
  isMakerOnly?: boolean;
}

export interface CustomerAddress {
  id: string;
  userId?: string;
  fullName: string;
  phone: string;
  pincode: string;
  buildingHouse: string;
  streetAddress: string;
  landmark?: string;
  city: string;
  state: string;
  country: string;
  isDefault?: boolean;
}

export interface OrderItemSnapshot {
  productId: number;
  title: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  makerName: string;
  makerId?: string;
  makerShareAmount?: number;
  makerEarningPercent?: number;
  variantName?: string;
  productionStatus?: 'pending' | 'in_production' | 'ready_for_pickup' | 'completed';
}

export interface ProductVariant {
  id: string;
  name: string;
  price?: number;
  inStock?: boolean;
  sku?: string;
}

export type OrderStatus =
  | 'order_placed'
  | 'awaiting_maker_acceptance'
  | 'accepted'
  | 'in_production'
  | 'quality_check'
  | 'ready_to_pack'
  | 'packed'
  | 'ready_to_ship'
  | 'shipment_booked'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'maker_rejected'
  | 'acceptance_timed_out'
  | 'cancelled'
  | 'shipment_failed'
  | 'delivery_exception'
  | 'ndr'
  | 'rto'
  | 'return_requested'
  | 'returned'
  | 'payment_failed'
  // Legacy compatibility:
  | 'new'
  | 'ready'
  | 'completed';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cod';
export type PaymentMethod = 'razorpay' | 'upi' | 'card' | 'netbanking' | 'cod' | 'test_gateway';

export interface OrderStatusHistoryItem {
  id: string;
  orderId: string | number;
  fromStatus?: string;
  toStatus: OrderStatus;
  actorId?: string;
  actorName: string;
  actorRole: string;
  note?: string;
  createdAt: string;
}

export interface MakerPickupLocation {
  id: string;
  makerId: string;
  locationNickname: string;
  pincode: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  contactPerson: string;
  contactPhone: string;
  isVerifiedByAdmin?: boolean;
}

export interface CourierOption {
  courierId?: number | string;
  name: string;
  rate: number;
  etd: string;
  cod: boolean;
  isExpress?: boolean;
}

export interface PostalOfficeRecord {
  name: string;
  branchType: string;
  deliveryStatus: string;
  district: string;
  state: string;
  circle?: string;
  block?: string;
}

export interface PostalLookupResult {
  success: boolean;
  pincode: string;
  district?: string;
  state?: string;
  country?: string;
  primaryLocality?: string;
  localities: string[];
  postOffices: PostalOfficeRecord[];
  multipleOffices?: boolean;
  errorCode?: 'INVALID_PINCODE' | 'PINCODE_NOT_FOUND' | 'LOOKUP_FAILED';
  message?: string;
}

export interface CourierServiceabilityResult {
  checked: boolean;
  serviceable: boolean;
  courierAvailable: boolean;
  pincode: string;
  originPincode?: string;
  courierName?: string;
  courierOptions: CourierOption[];
  recommendedCourier?: string;
  rate?: number;
  etd?: string;
  estimatedDays?: number;
  codAvailable?: boolean;
  message?: string;
}

export interface PincodeIntelligence {
  pincode: string;
  isServiceable: boolean;
  locality: string;
  district: string;
  state: string;
  officeName?: string;
  courierOptions: CourierOption[];
  recommendedCourier: string;
  estimatedDelivery: string;
  estimatedDays: number;
  shippingFee: number;
  codAvailable: boolean;
  message: string;
  originPincode: string;
  verifiedSource: 'official_postal_nimbuspost' | 'nimbuspost_api' | 'official_postal_shiprocket' | 'shiprocket_api' | 'verified_postal_registry';
  localities?: string[];
  postOffices?: PostalOfficeRecord[];
}

export interface Order {
  id: number;
  orderNumber?: string;
  city: string;
  product: string; // comma-separated or primary title for backward compat
  qty: number;
  deadline: string;
  status: OrderStatus;
  amount: number;
  items?: OrderItemSnapshot[];
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: CustomerAddress;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  trackingAwb?: string;
  courierName?: string;
  shipmentId?: string;
  nimbuspostOrderId?: string | number;
  nimbuspostShipmentId?: string | number;
  estimatedDelivery?: string;
  createdAt?: string;
  updatedAt?: string;
  itemsTotal?: number;
  shippingFee?: number;
  packagingFee?: number;
  discountAmount?: number;
  // Professional maker & shipment fields
  makerId?: string;
  makerName?: string;
  pickupPincode?: string;
  acceptanceDeadline?: string;
  acceptedAt?: string;
  rejectionReason?: string;
  confirmedPrepDays?: number;
  parcelWeightKg?: number;
  parcelDimensions?: string;
  statusHistory?: OrderStatusHistoryItem[];
}

export interface CartItem {
  id: number;
  qty: number;
  selectedOptions?: Record<string, string>;
}

export interface CollectionItem {
  n: string;
  cat: string;
  title: string;
  desc: string;
  img1: string;
  img2: string;
  img3: string;
  category: string;
}

export interface HowItWorksItem {
  n: string;
  t: string;
  d: string;
}

export interface ToastItem {
  id: number;
  message: string;
  icon: string;
}

export interface HeroContent {
  badgeText: string;
  headlineLine1: string;
  headlineLine2: string;
  headlineLine3: string;
  subhead: string;
  mainImage: string;
  leftImage: string;
  rightImage: string;
  mainTag: string;
  leftTag: string;
  rightTag: string;
}

export interface AnimationSettings {
  marqueeSpeed: 'slow' | 'normal' | 'fast' | 'paused';
  enableMagnet: boolean;
  enableFloatingBadges: boolean;
  enableScrollReveal: boolean;
}

export type UserRole = 'master_admin' | 'admin' | 'maker' | 'customer';
export type UserStatus = 'approved' | 'pending' | 'rejected';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  status?: UserStatus;
  school?: string;
  grade?: string;
  bio?: string;
  payoutUpi?: string;
  createdAt?: string;
}

/**
 * Privacy helper: masks email addresses so personal and user emails are never exposed.
 * If the email belongs to Master Admin, it masks as 'Master Admin (Protected)' or masked identifier.
 */
export function maskEmail(email?: string | null, isMaster?: boolean): string {
  if (!email || typeof email !== 'string') return '';
  const trimmed = email.trim();
  if (isMaster || trimmed.toLowerCase() === 'ssumollah@gmail.com') {
    return 'Master Admin (Protected)';
  }
  const atIndex = trimmed.indexOf('@');
  if (atIndex <= 0) return '••••••••';
  const namePart = trimmed.slice(0, atIndex);
  const domainPart = trimmed.slice(atIndex + 1);

  let maskedName: string;
  if (namePart.length <= 2) {
    maskedName = namePart[0] + '•'.repeat(Math.max(1, namePart.length - 1));
  } else {
    maskedName = namePart[0] + '•'.repeat(Math.min(5, namePart.length - 2)) + namePart[namePart.length - 1];
  }

  const dotIndex = domainPart.lastIndexOf('.');
  let maskedDomain: string;
  if (dotIndex > 0) {
    const dName = domainPart.slice(0, dotIndex);
    const dExt = domainPart.slice(dotIndex);
    const mD = dName.length <= 2 ? dName[0] + '•' : dName[0] + '•••' + dName[dName.length - 1];
    maskedDomain = `${mD}${dExt}`;
  } else {
    maskedDomain = '••••.com';
  }

  return `${maskedName}@${maskedDomain}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export function getProductSlug(product: { id: number; title: string; slug?: string }): string {
  if (product.slug) return product.slug;
  return `${slugify(product.title)}-${product.id}`;
}

