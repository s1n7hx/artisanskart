import {
  Product,
  Order,
  CustomerAddress,
  OrderItemSnapshot,
  PaymentMethod,
  PaymentStatus,
  OrderStatus,
  PincodeIntelligence,
  PostalLookupResult,
  CourierServiceabilityResult,
  PostalOfficeRecord,
  getProductSlug,
  slugify,
} from '../types';
import { supabase } from './supabase';

// -------------------------------------------------------------
// Product Lookup Helper (by slug or numeric ID)
// -------------------------------------------------------------
export function findProductBySlugOrId(products: Product[], identifier: string | undefined): Product | null {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();

  // Try direct numeric ID
  const asNumber = Number(clean);
  if (!isNaN(asNumber)) {
    const byId = products.find((p) => p.id === asNumber);
    if (byId) return byId;
  }

  // Try exact slug
  const bySlug = products.find((p) => (p.slug || '').toLowerCase() === clean);
  if (bySlug) return bySlug;

  // Try generated slug matching
  const byGeneratedSlug = products.find((p) => getProductSlug(p).toLowerCase() === clean);
  if (byGeneratedSlug) return byGeneratedSlug;

  // Try trailing ID pattern: "terracotta-diya-set-of-6-1" -> ID 1
  const match = clean.match(/-(\d+)$/);
  if (match) {
    const parsedId = Number(match[1]);
    const found = products.find((p) => p.id === parsedId);
    if (found) return found;
  }

  // Fallback: title starts with or includes slugified name
  const byTitleMatch = products.find((p) => slugify(p.title) === clean || clean.includes(slugify(p.title)));
  return byTitleMatch || null;
}

// -------------------------------------------------------------
// Indian Postal PIN Code Serviceability Engine
// -------------------------------------------------------------
export interface PincodeServiceabilityResult {
  pincode: string;
  isServiceable: boolean;
  city: string;
  state: string;
  courierName?: string;
  estimatedDays?: number;
  estimatedDeliveryText?: string;
  codAvailable?: boolean;
  isExpressAvailable?: boolean;
  message: string;
  localities?: string[];
  postOffices?: PostalOfficeRecord[];
  errorCode?: string;
}

// -------------------------------------------------------------
// Authentic Postal PIN Code Lookup across all of India
// Queries server endpoint backed by official India Post directory.
// Never assumes location from prefixes or previous addresses.
// -------------------------------------------------------------
export async function lookupPostalPincode(pincode: string): Promise<PostalLookupResult> {
  const cleanPin = (pincode || '').replace(/\D/g, '').slice(0, 6);

  if (cleanPin.length !== 6 || !/^[1-9][0-9]{5}$/.test(cleanPin)) {
    return {
      success: false,
      pincode: cleanPin,
      localities: [],
      postOffices: [],
      errorCode: 'INVALID_PINCODE',
      message: 'Invalid PIN code. Must be 6 numeric digits starting with 1-9.',
    };
  }

  // 1. Try backend API with 5-second timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`/api/postal/lookup/${cleanPin}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.success) {
      return {
        success: true,
        pincode: cleanPin,
        district: data.district,
        state: data.state,
        country: data.country || 'India',
        primaryLocality: data.primaryLocality,
        localities: Array.isArray(data.localities) ? data.localities : [data.primaryLocality],
        postOffices: Array.isArray(data.postOffices) ? data.postOffices : [],
        multipleOffices: Boolean(data.multipleOffices),
      };
    }

    if (res.status === 404) {
      return {
        success: false,
        pincode: cleanPin,
        localities: [],
        postOffices: [],
        errorCode: 'PINCODE_NOT_FOUND',
        message: 'PIN code not found in postal registry.',
      };
    }
  } catch (err: any) {
    // Backend lookup failed or timed out, proceed to fallback API
  }

  // 2. Fallback API: Direct call to https://api.postalpincode.in/pincode/{cleanPin} with 5s timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const directRes = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (directRes.ok) {
      const postalData = await directRes.json();
      if (Array.isArray(postalData) && postalData[0]) {
        const entry = postalData[0];
        if (entry.Status === 'Success' && Array.isArray(entry.PostOffice) && entry.PostOffice.length > 0) {
          const offices = entry.PostOffice;
          const deliveryOffice = offices.find((o: any) => o.DeliveryStatus === 'Delivery') || offices[0];
          const district = (deliveryOffice.District || offices[0].District || '').trim();
          const state = (deliveryOffice.State || offices[0].State || '').trim();
          const country = (deliveryOffice.Country || offices[0].Country || 'India').trim();

          const localities = Array.from(
            new Set(offices.map((o: any) => (o.Name || '').trim()).filter(Boolean))
          ) as string[];

          const primaryLocality = deliveryOffice.Name ? deliveryOffice.Name.trim() : (localities[0] || district);

          const postOffices = offices.map((o: any) => ({
            name: (o.Name || '').trim(),
            branchType: o.BranchType || '',
            deliveryStatus: o.DeliveryStatus || '',
            district: (o.District || district).trim(),
            state: (o.State || state).trim(),
          }));

          return {
            success: true,
            pincode: cleanPin,
            district,
            state,
            country,
            primaryLocality,
            localities,
            postOffices,
            multipleOffices: localities.length > 1,
          };
        } else if (entry.Status === 'Error' || (entry.Message && entry.Message.toLowerCase().includes('no records found'))) {
          return {
            success: false,
            pincode: cleanPin,
            localities: [],
            postOffices: [],
            errorCode: 'PINCODE_NOT_FOUND',
            message: 'PIN code not found in postal registry.',
          };
        }
      }
    }
  } catch (err: any) {
    // Direct API also failed or timed out
  }

  // 3. Graceful manual fallback: keep form usable and allow manual entry
  return {
    success: false,
    pincode: cleanPin,
    localities: [],
    postOffices: [],
    errorCode: 'LOOKUP_FAILED',
    message: 'Unable to auto-fill address details. Please fill them manually.',
  };
}

// -------------------------------------------------------------
// Separate Courier Serviceability Check (NimbusPost)
// Never assumes a PIN is serviceable or invents fake couriers.
// -------------------------------------------------------------
export async function checkCourierAvailability(params: {
  deliveryPincode: string;
  pickupPincode?: string;
  weightKg?: number;
  cod?: boolean;
}): Promise<CourierServiceabilityResult> {
  const cleanPin = (params.deliveryPincode || '').replace(/\D/g, '').slice(0, 6);

  if (cleanPin.length !== 6 || !/^[1-9][0-9]{5}$/.test(cleanPin)) {
    return {
      checked: false,
      serviceable: false,
      courierAvailable: false,
      pincode: cleanPin,
      courierOptions: [],
      message: 'Invalid PIN code for courier check.',
    };
  }

  try {
    const res = await fetch('/api/shipping/check-serviceability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deliveryPincode: cleanPin,
        pickupPincode: params.pickupPincode || '110016',
        weightKg: params.weightKg || 0.5,
        cod: params.cod !== false ? 1 : 0,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        checked: true,
        serviceable: Boolean(data.serviceable),
        courierAvailable: Boolean(data.carrierAvailable),
        pincode: cleanPin,
        originPincode: data.pickup_postcode || params.pickupPincode,
        courierName: data.recommended_courier,
        courierOptions: Array.isArray(data.couriers)
          ? data.couriers.map((c: any) => ({
              courierId: c.courier_company_id,
              name: c.courier_name,
              rate: Math.round(Number(c.rate) || 49),
              etd: c.etd || '3-4 business days',
              cod: Boolean(c.cod),
            }))
          : [],
        rate: data.rate,
        etd: data.etd,
        codAvailable: Boolean(data.cod_available),
        message: data.message || (data.serviceable ? 'Courier delivery available' : 'Outside courier delivery area'),
      };
    }

    return {
      checked: true,
      serviceable: false,
      courierAvailable: false,
      pincode: cleanPin,
      courierOptions: [],
      message: 'Courier serviceability check was unable to reach courier network.',
    };
  } catch (err: any) {
    return {
      checked: false,
      serviceable: false,
      courierAvailable: false,
      pincode: cleanPin,
      courierOptions: [],
      message: 'Could not connect to courier serviceability provider.',
    };
  }
}

// -------------------------------------------------------------
// Compatibility Wrapper: Pure real lookup without mock fallback
// -------------------------------------------------------------
export async function checkPincodeServiceability(pincode: string): Promise<PincodeServiceabilityResult> {
  const postal = await lookupPostalPincode(pincode);
  if (!postal.success) {
    return {
      pincode,
      isServiceable: false,
      city: '',
      state: '',
      message: postal.message || 'Invalid or unverified PIN code',
      errorCode: postal.errorCode,
    };
  }

  const courier = await checkCourierAvailability({ deliveryPincode: postal.pincode });
  return {
    pincode: postal.pincode,
    isServiceable: courier.serviceable,
    city: postal.district || postal.primaryLocality || '',
    state: postal.state || '',
    courierName: courier.courierName,
    estimatedDays: courier.estimatedDays,
    estimatedDeliveryText: courier.etd,
    codAvailable: courier.codAvailable,
    message: courier.serviceable && courier.courierName
      ? `Delivery to ${postal.primaryLocality}, ${postal.district}, ${postal.state} via ${courier.courierName}`
      : courier.courierAvailable
      ? `PIN ${postal.pincode} (${postal.district}, ${postal.state}) is outside our courier delivery network.`
      : `Verified: ${postal.primaryLocality}, ${postal.district}, ${postal.state}. Courier service unconfirmed.`,
    localities: postal.localities,
    postOffices: postal.postOffices,
  };
}

// -------------------------------------------------------------
// Combined Pincode Intelligence (Official Postal + Courier)
// -------------------------------------------------------------
export async function fetchPincodeIntelligence(
  pincode: string,
  pickupPincode: string = '110016'
): Promise<PincodeIntelligence> {
  const cleanPin = (pincode || '').replace(/\D/g, '').slice(0, 6);

  if (cleanPin.length !== 6 || !/^[1-9][0-9]{5}$/.test(cleanPin)) {
    return {
      pincode: cleanPin,
      isServiceable: false,
      locality: '',
      district: '',
      state: '',
      courierOptions: [],
      recommendedCourier: '',
      estimatedDelivery: '',
      estimatedDays: 0,
      shippingFee: 49,
      codAvailable: false,
      message: 'Please enter a valid 6-digit Indian Postal PIN code.',
      originPincode: pickupPincode,
      verifiedSource: 'verified_postal_registry',
    };
  }

  try {
    const res = await fetch('/api/shipping/pincode-intel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pincode: cleanPin,
        pickupPincode,
        weightKg: 0.5,
        cod: true,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.success) {
      return {
        pincode: cleanPin,
        isServiceable: Boolean(data.isServiceable),
        locality: data.locality || '',
        district: data.district || '',
        state: data.state || '',
        courierOptions: data.courierOptions || [],
        recommendedCourier: data.recommendedCourier || '',
        estimatedDelivery: data.estimatedDelivery || '',
        estimatedDays: data.estimatedDays || 0,
        shippingFee: data.shippingFee || 49,
        codAvailable: Boolean(data.codAvailable),
        message: data.message || `Delivery to ${data.district}, ${data.state}`,
        originPincode: data.originPincode || pickupPincode,
        verifiedSource: 'official_postal_nimbuspost',
        localities: data.localities,
        postOffices: data.postOffices,
      };
    }

    return {
      pincode: cleanPin,
      isServiceable: false,
      locality: '',
      district: '',
      state: '',
      courierOptions: [],
      recommendedCourier: '',
      estimatedDelivery: '',
      estimatedDays: 0,
      shippingFee: 49,
      codAvailable: false,
      message: data.message || 'PIN code not found in Indian postal registry.',
      originPincode: pickupPincode,
      verifiedSource: 'verified_postal_registry',
    };
  } catch (err: any) {
    return {
      pincode: cleanPin,
      isServiceable: false,
      locality: '',
      district: '',
      state: '',
      courierOptions: [],
      recommendedCourier: '',
      estimatedDelivery: '',
      estimatedDays: 0,
      shippingFee: 49,
      codAvailable: false,
      message: 'Postal directory lookup service is currently unreachable.',
      originPincode: pickupPincode,
      verifiedSource: 'verified_postal_registry',
    };
  }
}

// -------------------------------------------------------------
// Shipping Charges & Coupon Discounts
// -------------------------------------------------------------
export function calculateShippingFee(itemsTotal: number): number {
  if (itemsTotal <= 0) return 0;
  if (itemsTotal >= 499) return 0; // Free shipping over ₹499
  return 49; // Flat ₹49 eco-friendly delivery
}

export interface CouponValidationResult {
  isValid: boolean;
  code: string;
  discountAmount: number;
  message: string;
}

export async function validateCouponCodeAsync(code: string, subtotal: number): Promise<CouponValidationResult> {
  const clean = code.trim().toUpperCase();
  if (!clean) {
    return { isValid: false, code: '', discountAmount: 0, message: '' };
  }

  try {
    const res = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: clean, subtotal }),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        isValid: Boolean(data.valid),
        code: clean,
        discountAmount: data.discountAmount || 0,
        message: data.message || '',
      };
    }
  } catch {}

  // Fallback to local evaluation
  return validateCouponCode(code, subtotal);
}

export function validateCouponCode(code: string, subtotal: number): CouponValidationResult {
  const clean = code.trim().toUpperCase();
  if (!clean) {
    return { isValid: false, code: '', discountAmount: 0, message: '' };
  }

  if (clean === 'WELCOME10') {
    const minOrder = 499;
    if (subtotal < minOrder) {
      return {
        isValid: false,
        code: clean,
        discountAmount: 0,
        message: `WELCOME10 requires a minimum order of ₹${minOrder}. Current: ₹${subtotal}.`,
      };
    }
    const discount = Math.min(100, Math.round(subtotal * 0.1));
    return {
      isValid: true,
      code: clean,
      discountAmount: discount,
      message: `10% welcome discount applied (₹${discount} saved)!`,
    };
  }

  if (clean === 'CREATOR50') {
    const minOrder = 399;
    if (subtotal < minOrder) {
      return {
        isValid: false,
        code: clean,
        discountAmount: 0,
        message: `CREATOR50 requires a minimum order of ₹${minOrder}. Current: ₹${subtotal}.`,
      };
    }
    const discount = Math.min(50, subtotal);
    return {
      isValid: true,
      code: clean,
      discountAmount: discount,
      message: `₹50 creator support discount applied!`,
    };
  }

  if (clean === 'HANDMADE15') {
    const minOrder = 999;
    if (subtotal < minOrder) {
      return {
        isValid: false,
        code: clean,
        discountAmount: 0,
        message: `HANDMADE15 requires a minimum order of ₹${minOrder}. Current: ₹${subtotal}.`,
      };
    }
    const discount = Math.min(200, Math.round(subtotal * 0.15));
    return {
      isValid: true,
      code: clean,
      discountAmount: discount,
      message: `15% Handmade Patron discount applied (₹${discount} saved)!`,
    };
  }

  if (clean === 'MAKER10' || clean === 'ARTISAN10') {
    const minOrder = 299;
    if (subtotal < minOrder) {
      return {
        isValid: false,
        code: clean,
        discountAmount: 0,
        message: `${clean} requires a minimum order of ₹${minOrder}. Current: ₹${subtotal}.`,
      };
    }
    const discount = Math.min(100, Math.round(subtotal * 0.1));
    return {
      isValid: true,
      code: clean,
      discountAmount: discount,
      message: `10% Independent Maker discount applied (₹${discount} saved)!`,
    };
  }

  if (clean === 'FIRSTCRAFT') {
    const minOrder = 349;
    if (subtotal < minOrder) {
      return {
        isValid: false,
        code: clean,
        discountAmount: 0,
        message: `FIRSTCRAFT requires a minimum order of ₹${minOrder}. Current: ₹${subtotal}.`,
      };
    }
    const discount = Math.min(50, subtotal);
    return {
      isValid: true,
      code: clean,
      discountAmount: discount,
      message: `₹50 First craft promotion applied!`,
    };
  }

  if (clean === 'STUDIOCRAFT') {
    const minOrder = 499;
    if (subtotal < minOrder) {
      return {
        isValid: false,
        code: clean,
        discountAmount: 0,
        message: `STUDIOCRAFT requires a minimum order of ₹${minOrder}. Current: ₹${subtotal}.`,
      };
    }
    const discount = Math.min(150, Math.round(subtotal * 0.15));
    return {
      isValid: true,
      code: clean,
      discountAmount: discount,
      message: `15% Studio Craft discount applied (₹${discount} saved)!`,
    };
  }

  return {
    isValid: false,
    code: clean,
    discountAmount: 0,
    message: 'Invalid or expired coupon code. Available offers: WELCOME10 (min ₹499), CREATOR50 (min ₹399), MAKER10 (min ₹299).',
  };
}

// -------------------------------------------------------------
// Saved Customer Addresses (Supabase + LocalStorage Fallback)
// -------------------------------------------------------------
const LOCAL_STORAGE_ADDRESSES_KEY = 'artisanskart_saved_addresses_v1';

export async function fetchCustomerAddresses(userId?: string): Promise<CustomerAddress[]> {
  const localList: CustomerAddress[] = (() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ADDRESSES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })();

  if (!userId) return localList;

  try {
    const { data, error } = await supabase
      .from('customer_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });

    if (error || !data || data.length === 0) {
      return localList;
    }

    const mapped: CustomerAddress[] = data.map((d) => ({
      id: d.id,
      userId: d.user_id,
      fullName: d.full_name,
      phone: d.phone,
      pincode: d.pincode,
      buildingHouse: d.building_house,
      streetAddress: d.street_address,
      landmark: d.landmark,
      city: d.city,
      state: d.state,
      country: d.country || 'India',
      isDefault: d.is_default,
    }));

    return mapped;
  } catch {
    return localList;
  }
}

export async function saveCustomerAddress(addr: CustomerAddress): Promise<CustomerAddress> {
  // Always update local cache
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_ADDRESSES_KEY);
    const list: CustomerAddress[] = saved ? JSON.parse(saved) : [];
    const idx = list.findIndex((a) => a.id === addr.id);
    if (idx >= 0) {
      list[idx] = addr;
    } else {
      list.unshift(addr);
    }
    localStorage.setItem(LOCAL_STORAGE_ADDRESSES_KEY, JSON.stringify(list));
  } catch {}

  if (!addr.userId) return addr;

  try {
    const payload = {
      user_id: addr.userId,
      full_name: addr.fullName,
      phone: addr.phone,
      pincode: addr.pincode,
      building_house: addr.buildingHouse,
      street_address: addr.streetAddress,
      landmark: addr.landmark || '',
      city: addr.city,
      state: addr.state,
      country: addr.country || 'India',
      is_default: addr.isDefault || false,
    };

    const { data, error } = await supabase
      .from('customer_addresses')
      .upsert(payload)
      .select()
      .single();

    if (!error && data) {
      return {
        ...addr,
        id: data.id,
      };
    }
  } catch {}

  return addr;
}

// -------------------------------------------------------------
// Orders Management (Supabase + LocalStorage Fallback)
// -------------------------------------------------------------
const LOCAL_STORAGE_ORDERS_KEY = 'artisanskart_all_orders_v2';

export function getStoredOrders(): Order[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    if (saved) {
      const parsed: Order[] = JSON.parse(saved);
      // Purge fake demo order records safely
      return parsed.filter((o) => !o.orderNumber?.startsWith('AK-2026-0842'));
    }
  } catch {}
  return [];
}

export function saveStoredOrders(orders: Order[]): void {
  try {
    const genuine = orders.filter((o) => !o.orderNumber?.startsWith('AK-2026-0842'));
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(genuine));
  } catch {}
}

export interface ProductReviewItem {
  id: string;
  productId: number;
  userId?: string;
  reviewerName: string;
  rating: number;
  reviewTitle?: string;
  comment: string;
  createdAt: string;
  verifiedPurchase?: boolean;
}

export function getProductReviews(productId: number): ProductReviewItem[] {
  try {
    const saved = localStorage.getItem(`artisanskart_reviews_${productId}`);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

export function saveProductReview(review: ProductReviewItem): void {
  try {
    const current = getProductReviews(review.productId);
    const updated = [review, ...current];
    localStorage.setItem(`artisanskart_reviews_${review.productId}`, JSON.stringify(updated));
  } catch {}
}

export async function fetchServerOrders(): Promise<Order[]> {
  try {
    const res = await fetch('/api/orders');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.orders)) {
        saveStoredOrders(data.orders);
        return data.orders;
      }
    }
  } catch (err) {
    console.warn('Notice fetching orders from server:', err);
  }
  return getStoredOrders();
}

export async function createOrderRecord(orderData: Partial<Order>): Promise<Order> {
  const orderNumber = orderData.orderNumber || `AK-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  const deadlineDate = new Date();
  deadlineDate.setDate(deadlineDate.getDate() + 3);
  const acceptanceDeadlineDate = new Date();
  acceptanceDeadlineDate.setHours(acceptanceDeadlineDate.getHours() + 24);

  const fullOrder: Order = {
    id: Date.now(),
    orderNumber,
    city: orderData.shippingAddress ? `${orderData.shippingAddress.city}, ${orderData.shippingAddress.state}` : orderData.city || 'India',
    product: orderData.items && orderData.items.length > 0 ? orderData.items.map((i) => `${i.title} (×${i.quantity})`).join(', ') : orderData.product || 'Handmade Craft',
    qty: orderData.items ? orderData.items.reduce((s, i) => s + i.quantity, 0) : orderData.qty || 1,
    deadline: orderData.deadline || deadlineDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    status: (orderData.status || 'awaiting_maker_acceptance') as OrderStatus,
    amount: orderData.amount || 0,
    itemsTotal: orderData.itemsTotal || orderData.amount || 0,
    shippingFee: orderData.shippingFee || 0,
    discountAmount: orderData.discountAmount || 0,
    customerName: orderData.customerName || 'Customer',
    customerEmail: orderData.customerEmail,
    customerPhone: orderData.customerPhone || '',
    shippingAddress: orderData.shippingAddress,
    paymentStatus: (orderData.paymentStatus || 'paid') as PaymentStatus,
    paymentMethod: (orderData.paymentMethod || 'razorpay') as PaymentMethod,
    trackingAwb: orderData.trackingAwb || `NP-${Math.floor(100000 + Math.random() * 900000)}`,
    courierName: orderData.courierName || 'NimbusPost Express Partner',
    createdAt: new Date().toISOString(),
    items: orderData.items || [],
    makerId: orderData.makerId || orderData.items?.[0]?.makerId,
    makerName: orderData.makerName || orderData.items?.[0]?.makerName || 'Artisan Creator',
    pickupPincode: orderData.pickupPincode || '110016',
    acceptanceDeadline: acceptanceDeadlineDate.toISOString(),
    statusHistory: [
      {
        id: `init_${Date.now()}`,
        orderId: Date.now(),
        fromStatus: undefined,
        toStatus: (orderData.status || 'awaiting_maker_acceptance') as OrderStatus,
        actorName: orderData.customerName || 'Customer',
        actorRole: 'customer',
        note: 'Order placed by customer and routed to maker studio',
        createdAt: new Date().toISOString(),
      },
    ],
  };

  // 1. Immediately post to central server persistent database
  try {
    const serverRes = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullOrder),
    });
    if (serverRes.ok) {
      const serverData = await serverRes.json();
      if (serverData.order) {
        Object.assign(fullOrder, serverData.order);
      }
    }
  } catch (err) {
    console.warn('Notice sending order to central server:', err);
  }

  // 2. Save to local store for instant offline feedback
  const existing = getStoredOrders();
  const updated = [fullOrder, ...existing.filter((o) => o.orderNumber !== fullOrder.orderNumber)];
  saveStoredOrders(updated);

  // 3. Try inserting into Supabase orders & order_items tables
  try {
    const orderPayload = {
      order_number: fullOrder.orderNumber,
      customer_name: fullOrder.customerName,
      customer_email: fullOrder.customerEmail,
      customer_phone: fullOrder.customerPhone,
      shipping_address: fullOrder.shippingAddress || {},
      items_total: fullOrder.itemsTotal,
      shipping_fee: fullOrder.shippingFee,
      discount_amount: fullOrder.discountAmount,
      total_amount: fullOrder.amount,
      status: fullOrder.status,
      payment_status: fullOrder.paymentStatus,
      payment_method: fullOrder.paymentMethod,
      tracking_awb: fullOrder.trackingAwb,
      courier_name: fullOrder.courierName,
      created_at: fullOrder.createdAt,
    };

    const { data: dbOrder, error: orderErr } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select()
      .single();

    if (!orderErr && dbOrder && fullOrder.items && fullOrder.items.length > 0) {
      const itemsPayload = fullOrder.items.map((item) => ({
        order_id: dbOrder.id,
        product_id: item.productId,
        title: item.title,
        image_url: item.imageUrl,
        unit_price: item.unitPrice,
        quantity: item.quantity,
        subtotal: item.subtotal,
        maker_name: item.makerName,
        maker_id: item.makerId,
        maker_earning_percent: item.makerEarningPercent || 65,
        maker_share_amount: item.makerShareAmount || Math.round(item.subtotal * 0.65),
        production_status: 'pending',
      }));

      await supabase.from('order_items').insert(itemsPayload);
    }
  } catch (err) {
    console.warn('Notice saving order to Supabase:', err);
  }

  return fullOrder;
}

// -------------------------------------------------------------
// Server-Enforced Lifecycle Transition with Audit Trail
// -------------------------------------------------------------
export async function updateOrderStatusWithLifecycle(params: {
  orderId: string | number;
  orderNumber?: string;
  currentStatus: OrderStatus;
  newStatus: OrderStatus;
  actorRole: string;
  actorName: string;
  note?: string;
  parcelWeightKg?: number;
  parcelDimensions?: string;
  rejectionReason?: string;
  confirmedPrepDays?: number;
  makerId?: string;
  courierName?: string;
  trackingAwb?: string;
}): Promise<{ success: boolean; status: OrderStatus; order?: Order; error?: string }> {
  const { orderId, orderNumber, currentStatus, newStatus, actorRole, actorName, note, parcelWeightKg, parcelDimensions, rejectionReason, confirmedPrepDays, makerId, courierName, trackingAwb } = params;

  try {
    const res = await fetch('/api/orders/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        status: currentStatus,
        error: data.error || `Transition from ${currentStatus} to ${newStatus} is not permitted.`,
      };
    }

    // Update local storage orders
    const stored = getStoredOrders();
    const updated = stored.map((o) => {
      if (o.id === Number(orderId) || o.orderNumber === orderNumber) {
        const hist = o.statusHistory || [];
        if (data.auditEntry) hist.push(data.auditEntry);
        return {
          ...o,
          status: newStatus,
          rejectionReason: rejectionReason || o.rejectionReason,
          confirmedPrepDays: confirmedPrepDays || o.confirmedPrepDays,
          parcelWeightKg: parcelWeightKg || o.parcelWeightKg,
          parcelDimensions: parcelDimensions || o.parcelDimensions,
          courierName: courierName || o.courierName,
          trackingAwb: trackingAwb || o.trackingAwb,
          makerId: makerId || o.makerId,
          makerName: actorRole === 'maker' && actorName ? actorName : o.makerName,
          statusHistory: hist,
          updatedAt: new Date().toISOString(),
        };
      }
      return o;
    });
    saveStoredOrders(updated);

    // Sync to Supabase
    try {
      if (orderNumber) {
        await supabase
          .from('orders')
          .update({
            status: newStatus,
            rejection_reason: rejectionReason,
            confirmed_prep_days: confirmedPrepDays,
            parcel_weight_kg: parcelWeightKg,
            parcel_dimensions: parcelDimensions,
            updated_at: new Date().toISOString(),
          })
          .eq('order_number', orderNumber);
      }
    } catch {}

    return { success: true, status: newStatus, order: data.order };
  } catch (err: any) {
    return { success: false, status: currentStatus, error: err.message };
  }
}

export interface IntegrationConfigStatus {
  razorpay: {
    isConfigured: boolean;
    mode: 'live' | 'test_gateway';
    credentialsPresent: { keyId: boolean; keySecret: boolean };
    description: string;
  };
}

export function checkIntegrationsConfigStatus(): IntegrationConfigStatus {
  const razorpayKey = typeof process !== 'undefined' ? process.env?.RAZORPAY_KEY_ID : undefined;
  const razorpaySecret = typeof process !== 'undefined' ? process.env?.RAZORPAY_KEY_SECRET : undefined;

  const rzConfigured = Boolean(razorpayKey && razorpaySecret);

  return {
    razorpay: {
      isConfigured: rzConfigured,
      mode: rzConfigured ? 'live' : 'test_gateway',
      credentialsPresent: {
        keyId: Boolean(razorpayKey),
        keySecret: Boolean(razorpaySecret),
      },
      description: rzConfigured
        ? 'Connected to live Razorpay gateway'
        : 'Running in safe Indian test payment gateway (UPI, QR, NetBanking & Cards simulation). To activate live charges, configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.',
    },
  };
}
