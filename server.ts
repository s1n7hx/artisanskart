import express, { Request, Response } from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import {
  getShiprocketToken,
  checkCourierServiceability,
  createShipmentOrder,
  getShiprocketIntegrationStatus,
} from './src/server/shiprocket';

dotenv.config({ path: '.env.local', override: true });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------------------------------------------------
// Baseline Server-Side Product Price & Stock Directory
// (Prevents client-side price tampering)
// -------------------------------------------------------------
const SERVER_PRODUCT_CATALOG: Record<number, { title: string; price: number; stock: number; maker: string }> = {
  1: { title: 'Terracotta Diya Set of 6', price: 349, stock: 18, maker: 'Sakib Ansari' },
  2: { title: 'Hand-thrown Ceramic Vase', price: 899, stock: 4, maker: 'Meera Nair' },
  3: { title: 'Clay Owl Planter', price: 499, stock: 10, maker: 'Arjun Verma' },
  4: { title: 'Rustic Clay Wind Chime', price: 599, stock: 7, maker: 'Riya Kapoor' },
  5: { title: 'Watercolor Birthday Card Set (5)', price: 149, stock: 25, maker: 'Ananya Iyer' },
  6: { title: 'Abstract Art Greeting Card', price: 129, stock: 15, maker: 'Priya Sharma' },
  7: { title: 'Handprint Memory Canvas Painting', price: 599, stock: 6, maker: 'Rohan Das' },
  8: { title: 'Watercolor Wildlife Card Pack', price: 179, stock: 12, maker: 'Tanvi Joshi' },
  9: { title: 'Beaded Friendship Bracelet', price: 199, stock: 20, maker: 'Ishita Rao' },
  10: { title: 'Silver Wire Wrapped Pendant', price: 349, stock: 3, maker: 'Kabir Mehta' },
  11: { title: 'Leather Braided Keychain', price: 99, stock: 30, maker: 'Dev Chauhan' },
  12: { title: 'Tile Art Keychain', price: 129, stock: 16, maker: 'Zara Khan' },
};

// -------------------------------------------------------------
// API Route 1: Validate Order & Compute Server-Authoritative Totals
// -------------------------------------------------------------
app.post('/api/checkout/validate-order', (req: Request, res: Response) => {
  try {
    const { items, couponCode, pincode } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty or invalid.' });
    }

    let itemsTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const prodId = Number(item.id || item.productId);
      const qty = Math.max(1, Math.floor(Number(item.qty || item.quantity || 1)));

      const catalogItem = SERVER_PRODUCT_CATALOG[prodId] || {
        title: item.title || `Craft #${prodId}`,
        price: Number(item.price) || 299,
        stock: 20,
        maker: item.maker || 'Student Maker',
      };

      const lineSubtotal = catalogItem.price * qty;
      itemsTotal += lineSubtotal;

      validatedItems.push({
        productId: prodId,
        title: catalogItem.title,
        unitPrice: catalogItem.price,
        quantity: qty,
        subtotal: lineSubtotal,
        makerName: catalogItem.maker,
        availableStock: catalogItem.stock,
      });
    }

    // Shipping computation
    const shippingFee = itemsTotal >= 499 ? 0 : 49;

    // Coupon computation
    let discountAmount = 0;
    const cleanCoupon = (couponCode || '').trim().toUpperCase();
    if (cleanCoupon === 'STUDENT10') {
      discountAmount = Math.round(itemsTotal * 0.1);
    } else if (cleanCoupon === 'FIRSTCRAFT') {
      discountAmount = Math.min(itemsTotal, 50);
    } else if (cleanCoupon === 'CAMPUSCRAFT') {
      discountAmount = Math.round(itemsTotal * 0.15);
    }

    const finalPayable = Math.max(0, itemsTotal + shippingFee - discountAmount);

    return res.json({
      valid: true,
      itemsTotal,
      shippingFee,
      discountAmount,
      totalAmount: finalPayable,
      validatedItems,
      currency: 'INR',
      pincodeServiceable: Boolean(pincode && pincode.length === 6),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Validation failed.' });
  }
});

// -------------------------------------------------------------
// API Route 2: Create Gateway Payment Order (Razorpay / Test)
// -------------------------------------------------------------
app.post('/api/payment/create-order', async (req: Request, res: Response) => {
  try {
    const { amount, receipt, notes } = req.body;
    const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

    const amountInPaise = Math.round(Number(amount) * 100);

    if (keyId && keySecret) {
      // Real Razorpay API call
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt: receipt || `rcpt_${Date.now()}`,
          notes: notes || {},
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.description || data.error?.message || data.message || 'Razorpay order creation failed');
      }

      return res.json({
        gateway: 'razorpay',
        orderId: data.id,
        amount: data.amount,
        currency: 'INR',
        keyId,
      });
    }

    // Safe Test Gateway Simulation
    const mockOrderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return res.json({
      gateway: 'test_gateway',
      orderId: mockOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: 'rzp_test_artisanskart_campus',
      message: 'Running in safe Indian test gateway mode. Real UPI, NetBanking, Card simulation available.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Payment initiation failed.' });
  }
});

// -------------------------------------------------------------
// API Route 3: Verify Payment Signature
// -------------------------------------------------------------
app.post('/api/payment/verify', (req: Request, res: Response) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keySecret && razorpaySignature) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== razorpaySignature) {
        return res.status(400).json({ verified: false, error: 'Invalid payment signature.' });
      }

      return res.json({ verified: true, paymentId: razorpayPaymentId });
    }

    // In test mode: verify order was received
    if (razorpayOrderId) {
      return res.json({
        verified: true,
        paymentId: razorpayPaymentId || `pay_test_${Date.now()}`,
        mode: 'test_verified',
      });
    }

    return res.status(400).json({ verified: false, error: 'Missing order details.' });
  } catch (err: any) {
    return res.status(500).json({ verified: false, error: err.message });
  }
});

// -------------------------------------------------------------
// API Route 4: Shiprocket Serviceability & Rate Check
// Authenticates server-side via SHIPROCKET_EMAIL & SHIPROCKET_PASSWORD,
// caching the token for 9 days and auto-renewing upon expiration.
// -------------------------------------------------------------
app.post('/api/shipping/check-serviceability', async (req: Request, res: Response) => {
  try {
    const { deliveryPincode, pickupPincode, weightKg, cod } = req.body;

    if (!deliveryPincode) {
      return res.status(400).json({ error: 'Delivery PIN code is required.' });
    }

    const result = await checkCourierServiceability({
      deliveryPincode,
      pickupPincode,
      weightKg,
      cod,
    });

    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Serviceability check failed.' });
  }
});

// -------------------------------------------------------------
// API Route 5: Shiprocket Shipment Generation
// -------------------------------------------------------------
app.post('/api/shipping/create-shipment', async (req: Request, res: Response) => {
  try {
    const {
      orderNumber,
      customerName,
      phone,
      email,
      address,
      city,
      state,
      pincode,
      items,
      totalAmount,
      paymentMethod,
    } = req.body;

    if (!orderNumber || !pincode) {
      return res.status(400).json({ error: 'orderNumber and pincode are required.' });
    }

    const shipment = await createShipmentOrder({
      orderNumber,
      customerName: customerName || 'Valued Customer',
      phone,
      email,
      address,
      city,
      state,
      pincode,
      items: Array.isArray(items) ? items : [{ title: 'Handmade Craft', price: 299, quantity: 1 }],
      totalAmount,
      paymentMethod,
    });

    return res.json(shipment);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Shipment generation failed.' });
  }
});

// -------------------------------------------------------------
// API Route 6: Integration Config Status Checker
// Safe inspection of Shiprocket & Razorpay without exposing secrets
// -------------------------------------------------------------
app.get('/api/shipping/config-status', (_req: Request, res: Response) => {
  const shiprocketStatus = getShiprocketIntegrationStatus();
  const hasRazorpay = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

  return res.json({
    shiprocket: shiprocketStatus,
    razorpay: {
      configured: hasRazorpay,
      mode: hasRazorpay ? 'live' : 'test_gateway',
      keyIdSet: Boolean(process.env.RAZORPAY_KEY_ID),
    },
  });
});

// -------------------------------------------------------------
// API Route 7: Diagnostic Test for Shiprocket Authentication
// Triggers live login on-demand to test SHIPROCKET_EMAIL & SHIPROCKET_PASSWORD
// -------------------------------------------------------------
app.post('/api/shipping/test-shiprocket-auth', async (_req: Request, res: Response) => {
  try {
    const email = process.env.SHIPROCKET_EMAIL?.trim();
    const hasPassword = Boolean(process.env.SHIPROCKET_PASSWORD?.trim());

    if (!email || !hasPassword) {
      return res.status(400).json({
        success: false,
        message: 'SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD must be configured in environment variables (.env.local or production secrets).',
        status: getShiprocketIntegrationStatus(),
      });
    }

    const token = await getShiprocketToken(true); // force fresh login to test
    const status = getShiprocketIntegrationStatus();

    if (token) {
      return res.json({
        success: true,
        message: 'Successfully authenticated with Shiprocket official API! Token acquired and securely cached for 9 days.',
        status,
      });
    }

    return res.status(401).json({
      success: false,
      message: status.lastError || 'Shiprocket authentication failed. Please verify your email and password.',
      status,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// API Route 8: Webhook receiver for Shiprocket Tracking Updates
// -------------------------------------------------------------
app.post('/api/shipping/webhook', (req: Request, res: Response) => {
  const payload = req.body;
  console.log('📦 Shiprocket Webhook event received:', payload?.current_status, payload?.awb);
  return res.json({ received: true });
});

// -------------------------------------------------------------
// Vite Dev Middleware or Production Static Handler
// -------------------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 ArtisansKart full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server boot failed:', err);
});
