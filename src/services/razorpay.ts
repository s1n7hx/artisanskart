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

function showSimulatedRazorpayModal(
  options: RazorpayPaymentOptions,
  orderId: string,
  amountInRupees: number,
  onComplete: (paymentId: string) => void,
  onCancel: () => void
): void {
  // Clean up any existing test payment modal
  const existing = document.getElementById('artisanskart-test-payment-modal');
  if (existing) existing.remove();

  const modalContainer = document.createElement('div');
  modalContainer.id = 'artisanskart-test-payment-modal';
  modalContainer.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in';

  modalContainer.innerHTML = `
    <div class="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden text-[#1E293B] font-sans">
      <!-- Header -->
      <div class="bg-gradient-to-r from-[#C85A32] to-[#B04A25] p-5 text-white flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-black text-lg">
            AK
          </div>
          <div>
            <h3 class="font-bold text-sm tracking-wide">ArtisansKart Secure Pay</h3>
            <p class="text-[11px] text-white/80 font-mono">Order #${options.orderNumber || orderId.slice(0, 10)}</p>
          </div>
        </div>
        <span class="bg-white/20 text-white text-[10px] uppercase font-bold px-2.5 py-1 rounded-full tracking-wider border border-white/30">
          Sandbox Test
        </span>
      </div>

      <!-- Amount Banner -->
      <div class="bg-[#FAF9F6] px-6 py-4 border-b border-[#e7e0d8] flex items-center justify-between">
        <div>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payable Amount</span>
          <p class="text-2xl font-black text-[#1E293B]">₹${amountInRupees.toLocaleString('en-IN')}</p>
        </div>
        <div class="text-right">
          <span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            SSL 256-Bit Encrypted
          </span>
        </div>
      </div>

      <!-- Payment Methods Selection Simulation -->
      <div class="p-6 space-y-4">
        <p class="text-xs font-semibold text-slate-500">
          Select simulation payment method (no real money deducted):
        </p>

        <div class="space-y-2 text-xs">
          <label class="flex items-center gap-3 p-3 rounded-2xl border-2 border-[#C85A32] bg-[#C85A32]/5 cursor-pointer">
            <input type="radio" name="sim_pay_method" checked class="text-[#C85A32]" />
            <div class="flex-1 flex items-center justify-between">
              <span class="font-bold text-slate-800">Instant UPI (GPay / PhonePe / Paytm / BHIM)</span>
              <span class="text-[10px] bg-[#C85A32]/10 text-[#C85A32] px-2 py-0.5 rounded font-bold">Fastest</span>
            </div>
          </label>

          <label class="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 hover:border-slate-300 cursor-pointer">
            <input type="radio" name="sim_pay_method" class="text-[#C85A32]" />
            <div class="flex-1 flex items-center justify-between">
              <span class="font-bold text-slate-700">Cards (RuPay, Visa, Mastercard)</span>
              <span class="text-[10px] text-slate-400">Zero Convenience Fee</span>
            </div>
          </label>

          <label class="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 hover:border-slate-300 cursor-pointer">
            <input type="radio" name="sim_pay_method" class="text-[#C85A32]" />
            <div class="flex-1 flex items-center justify-between">
              <span class="font-bold text-slate-700">NetBanking (SBI, HDFC, ICICI, Axis)</span>
              <span class="text-[10px] text-slate-400">All Indian Banks</span>
            </div>
          </label>
        </div>

        <div class="bg-amber-50 rounded-2xl p-3 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
          <strong>Safe Simulation Mode:</strong> Live Razorpay credentials are currently running in secure test sandbox. Clicking approve verifies this transaction and routes the order directly to the artisan maker.
        </div>

        <!-- Action Buttons -->
        <div class="pt-2 flex flex-col gap-2">
          <button
            id="sim-pay-approve-btn"
            type="button"
            class="w-full py-3.5 px-4 rounded-2xl bg-[#C85A32] hover:bg-[#B04A25] text-white font-black text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Approve &amp; Pay ₹${amountInRupees.toLocaleString('en-IN')}</span>
          </button>
          <button
            id="sim-pay-cancel-btn"
            type="button"
            class="w-full py-2.5 px-4 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-semibold transition cursor-pointer"
          >
            Cancel &amp; Return to Cart
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modalContainer);

  const approveBtn = modalContainer.querySelector('#sim-pay-approve-btn');
  const cancelBtn = modalContainer.querySelector('#sim-pay-cancel-btn');

  approveBtn?.addEventListener('click', () => {
    approveBtn.setAttribute('disabled', 'true');
    approveBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Verifying Transaction...
    `;

    setTimeout(() => {
      const simPaymentId = `pay_sim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      modalContainer.remove();
      onComplete(simPaymentId);
    }, 600);
  });

  cancelBtn?.addEventListener('click', () => {
    modalContainer.remove();
    onCancel();
  });
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
    const errorMessage =
      typeof errData.error === 'string'
        ? errData.error
        : errData.error?.description || errData.message || 'Failed to initiate payment gateway order.';
    throw new Error(errorMessage);
  }

  const orderData = await response.json();
  const { orderId, amount, currency, keyId, gateway } = orderData;

  // 2. Check if we are running with configured Razorpay keys or in safe test sandbox
  const isTestGateway = gateway === 'test_gateway' || !keyId || keyId === 'rzp_test_artisanskart_hub';

  if (isTestGateway) {
    if (keyId?.startsWith('rzp_live_') || (import.meta as any).env?.PROD) {
      throw new Error('Simulated payment fallback is strictly disabled for live production payments. Please check gateway configuration.');
    }

    // Launch responsive sandbox simulator overlay
    showSimulatedRazorpayModal(
      options,
      orderId,
      options.amount,
      async (simulatedPaymentId: string) => {
        try {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpayOrderId: orderId,
              razorpayPaymentId: simulatedPaymentId,
              razorpaySignature: `sim_sig_${Date.now()}`,
              orderNumber: options.orderNumber,
            }),
          });

          const verifyData = await verifyRes.json().catch(() => ({}));
          if (verifyRes.ok && verifyData.verified) {
            options.onSuccess({
              razorpayOrderId: orderId,
              razorpayPaymentId: simulatedPaymentId,
              razorpaySignature: `sim_sig_${Date.now()}`,
            });
          } else {
            const errorMsg = verifyData.error || 'Payment verification failed on the server.';
            if (options.onFailure) {
              options.onFailure(new Error(errorMsg));
            }
          }
        } catch (e: any) {
          if (options.onFailure) {
            options.onFailure(e || new Error('Network error verifying payment.'));
          }
        }
      },
      () => {
        if (options.onDismiss) options.onDismiss();
      }
    );
    return;
  }

  // 3. For live production Razorpay credentials, ensure checkout script is loaded
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

  // 4. Configure Razorpay modal options
  const rzpOptions = {
    key: keyId,
    amount: amount,
    currency: currency || 'INR',
    name: 'ArtisansKart',
    description: options.description || 'Handcrafted Artisan Crafts Purchase',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=256&q=80',
    order_id: orderId,
    prefill: {
      name: options.customerName || '',
      email: options.customerEmail || '',
      contact: options.customerPhone || '',
    },
    theme: {
      color: '#C86D51',
    },
    modal: {
      ondismiss: () => {
        if (options.onDismiss) {
          options.onDismiss();
        }
      },
    },
    handler: async (paymentResponse: any) => {
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
    // Record failure on the server to maintain audit integrity
    fetch('/api/payment/record-failure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber: options.orderNumber,
        error: resp.error,
      }),
    }).catch(() => {});

    if (options.onFailure) {
      options.onFailure(resp.error || new Error('Payment attempt failed.'));
    }
  });
  rzpInstance.open();
}
