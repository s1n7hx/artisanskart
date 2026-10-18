/**
 * ArtisansKart - Razorpay Client Checkout Integration Helper
 *
 * Handles client-side opening of the Razorpay modal,
 * triggering the server order creation (/api/payment/create-order),
 * and verifying payment signatures (/api/payment/verify).
 */

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export interface RazorpayPaymentOptions {
  amount: number; // in INR
  orderNumber?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  description?: string;
  notes?: Record<string, string>;
  onSuccess: (paymentResult: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => void;
  onFailure?: (error: any) => void;
  onDismiss?: () => void;
}

export async function initiateRazorpayPayment(options: RazorpayPaymentOptions): Promise<void> {
  // 1. Create order on the server
  const response = await fetch('/api/payment/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: options.amount,
      orderNumber: options.orderNumber,
      receipt: options.orderNumber || `rcpt_${Date.now()}`,
      notes: {
        order_number: options.orderNumber || '',
        ...(options.notes || {}),
      },
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to initiate payment gateway order.');
  }

  const orderData = await response.json();
  const { orderId, amount, currency, keyId } = orderData;

  // 2. Ensure Razorpay checkout script is loaded
  if (typeof window.Razorpay === 'undefined') {
    await new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', () => reject(new Error('Razorpay SDK failed to load')));
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Razorpay SDK could not be loaded'));
      document.body.appendChild(script);
    });
  }

  // 3. Configure Razorpay modal options
  const rzpOptions = {
    key: keyId,
    amount: amount,
    currency: currency || 'INR',
    name: 'ArtisansKart.in',
    description: options.description || 'Handcrafted Artisan Crafts Purchase',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=256&q=80',
    order_id: orderId,
    prefill: {
      name: options.customerName || '',
      email: options.customerEmail || '',
      contact: options.customerPhone || '',
    },
    theme: {
      color: '#C86D51', // Terracotta ArtisansKart brand color
    },
    modal: {
      ondismiss: () => {
        if (options.onDismiss) {
          options.onDismiss();
        }
      },
    },
    handler: async (paymentResponse: any) => {
      // 4. Verify payment on server
      try {
        const verifyRes = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpayOrderId: paymentResponse.razorpay_order_id,
            razorpayPaymentId: paymentResponse.razorpay_payment_id,
            razorpaySignature: paymentResponse.razorpay_signature,
            orderNumber: options.orderNumber,
          }),
        });

        const verifyData = await verifyRes.json();
        if (verifyRes.ok && verifyData.verified) {
          options.onSuccess({
            razorpayOrderId: paymentResponse.razorpay_order_id,
            razorpayPaymentId: paymentResponse.razorpay_payment_id,
            razorpaySignature: paymentResponse.razorpay_signature,
          });
        } else {
          throw new Error(verifyData.error || 'Payment signature verification failed.');
        }
      } catch (err) {
        if (options.onFailure) {
          options.onFailure(err);
        }
      }
    },
  };

  const rzpInstance = new window.Razorpay(rzpOptions);
  rzpInstance.on('payment.failed', function (resp: any) {
    if (options.onFailure) {
      options.onFailure(resp.error);
    }
  });
  rzpInstance.open();
}
