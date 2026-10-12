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

  try {
    const res = await fetch(`/api/postal/lookup/${cleanPin}`, {
      headers: { Accept: 'application/json' },
    });

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

    return {
      success: false,
      pincode: cleanPin,
      localities: [],
      postOffices: [],
      errorCode: data.errorCode || (res.status === 404 ? 'PINCODE_NOT_FOUND' : 'LOOKUP_FAILED'),
      message: data.message || (res.status === 404 ? 'PIN code not found in postal registry.' : 'Postal directory lookup failed.'),
    };
  } catch (err: any) {
    return {
      success: false,
      pincode: cleanPin,
      localities: [],
      postOffices: [],
      errorCode: 'LOOKUP_FAILED',
      message: 'Network error connecting to postal directory. Please retry.',
    };
  }
}

// -------------------------------------------------------------
// Separate Courier Serviceability Check (Shiprocket)
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
        verifiedSource: 'official_postal_shiprocket',
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

export function validateCouponCode(code: string, subtotal: number): CouponValidationResult {
  const clean = code.trim().toUpperCase();
  if (!clean) {
    return { isValid: false, code: '', discountAmount: 0, message: '' };
  }

  if (clean === 'STUDENT10') {
    const discount = Math.round(subtotal * 0.1);
    return {
      isValid: true,
      code: clean,
      discountAmount: discount,
      message: `10% Student Art Patron discount applied (₹${discount} saved)!`,
    };
  }

  if (clean === 'FIRSTCRAFT') {
    const discount = Math.min(subtotal, 50);
    return {
      isValid: true,
      code: clean,
      discountAmount: discount,
      message: `₹50 Welcome gift applied!`,
    };
  }

  if (clean === 'CAMPUSCRAFT') {
    const discount = Math.round(subtotal * 0.15);
    return {
      isValid: true,
      code: clean,
      discountAmount: discount,
      message: `15% Campus Craft Pass discount applied!`,
    };
  }

  return {
    isValid: false,
    code: clean,
    discountAmount: 0,
    message: 'Invalid or expired coupon code. Try STUDENT10 or FIRSTCRAFT.',
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
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

export function saveStoredOrders(orders: Order[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders));
  } catch {}
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
    deadline: orderData.deadline || `${deadlineDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} (3 Days Prep)`,
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
    trackingAwb: orderData.trackingAwb || `SR-AK-${Math.floor(100000 + Math.random() * 900000)}`,
    courierName: orderData.courierName || 'BlueDart / Delhivery Eco',
    createdAt: new Date().toISOString(),
    items: orderData.items || [],
    makerId: orderData.makerId || orderData.items?.[0]?.makerId,
    makerName: orderData.makerName || orderData.items?.[0]?.makerName || 'Student Maker',
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
        note: 'Order placed by customer and sent to artisan studio',
        createdAt: new Date().toISOString(),
      },
    ],
  };

  // 1. Save to local store
  const existing = getStoredOrders();
  const updated = [fullOrder, ...existing.filter((o) => o.orderNumber !== fullOrder.orderNumber)];
  saveStoredOrders(updated);

  // 2. Try inserting into Supabase orders & order_items tables
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
    console.warn('Notice saving order to Supabase (using persistent local storage):', err);
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
}): Promise<{ success: boolean; status: OrderStatus; error?: string }> {
  const { orderId, orderNumber, currentStatus, newStatus, actorRole, actorName, note, parcelWeightKg, parcelDimensions, rejectionReason, confirmedPrepDays } = params;

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

    return { success: true, status: newStatus };
  } catch (err: any) {
    return { success: false, status: currentStatus, error: err.message };
  }
}

// -------------------------------------------------------------
// Shiprocket & Razorpay Integration Configuration Status
// -------------------------------------------------------------
export interface IntegrationConfigStatus {
  shiprocket: {
    isConfigured: boolean;
    mode: 'live' | 'setup_required';
    credentialsPresent: { email: boolean; password: boolean };
    description: string;
  };
  razorpay: {
    isConfigured: boolean;
    mode: 'live' | 'test_gateway';
    credentialsPresent: { keyId: boolean; keySecret: boolean };
    description: string;
  };
}

export async function fetchIntegrationConfigStatus() {
  try {
    const res = await fetch('/api/shipping/config-status');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Could not fetch server-side shipping config status:', err);
  }

  return {
    shiprocket: {
      configured: false,
      mode: 'simulation',
      authMechanism: 'automatic_server_login_and_auto_renewal',
      tokenRequiredInEnv: false,
      authenticated: false,
      tokenCached: false,
      tokenExpiresInHours: null,
      emailMasked: null,
      companyName: null,
      lastError: null,
    },
    razorpay: {
      configured: false,
      mode: 'test_gateway',
      keyIdSet: false,
    },
  };
}

export function checkIntegrationsConfigStatus(): IntegrationConfigStatus {
  const shiprocketEmail = typeof process !== 'undefined' ? process.env?.SHIPROCKET_EMAIL : undefined;
  const shiprocketPass = typeof process !== 'undefined' ? process.env?.SHIPROCKET_PASSWORD : undefined;
  const razorpayKey = typeof process !== 'undefined' ? process.env?.RAZORPAY_KEY_ID : undefined;
  const razorpaySecret = typeof process !== 'undefined' ? process.env?.RAZORPAY_KEY_SECRET : undefined;

  const srConfigured = Boolean(shiprocketEmail && shiprocketPass);
  const rzConfigured = Boolean(razorpayKey && razorpaySecret);

  return {
    shiprocket: {
      isConfigured: srConfigured,
      mode: srConfigured ? 'live' : 'setup_required',
      credentialsPresent: {
        email: Boolean(shiprocketEmail),
        password: Boolean(shiprocketPass),
      },
      description: srConfigured
        ? 'Connected to live Shiprocket fulfillment API (Auto-login & token auto-renewal active)'
        : 'Credentials pending in environment variables (SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD). Running in verified simulation mode with active PIN code serviceability.',
    },
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
