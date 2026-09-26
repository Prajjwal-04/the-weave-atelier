/**
 * Razorpay Standard Web Checkout Integration
 * 
 * STEP 1: Backend creates order via POST /api/create-order
 * STEP 2: Frontend opens Razorpay Checkout modal with order_id
 * STEP 3: Frontend sends payment_id, order_id, signature to POST /api/verify-payment
 */

export interface RazorpayPaymentResult {
  success: boolean;
  transactionId: string;
  orderId?: string;
  signature?: string;
  provider: 'razorpay';
  message: string;
}

export interface RazorpayPaymentParams {
  amountUSD: number;
  currency: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  orderNumber: string;
  amountINR?: number;
  preferredMethod?: 'upi' | 'card' | 'netbanking' | 'wallet';
  upiVpa?: string;
  notes?: Record<string, string>;
}

export interface RazorpayBackendOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  error?: string;
}

export interface RazorpayVerificationResponse {
  success: boolean;
  message: string;
  order_id?: string;
  payment_id?: string;
}

export const paymentService = {
  /**
   * Retrieves Key ID for client-side checkout modal
   */
  getRazorpayKeyId(): string {
    const envKey = (import.meta.env.VITE_RAZORPAY_KEY_ID || '').trim();
    const storedKey = typeof window !== 'undefined' ? (localStorage.getItem('twa_razorpay_key_id') || '').trim() : '';
    // If a live key is configured via admin settings / localStorage, prioritize it
    if (storedKey.startsWith('rzp_live_')) return storedKey;
    if (envKey) return envKey;
    if (storedKey) return storedKey;
    return 'rzp_test_Td1Mb3cvIhQdLW';
  },

  setRazorpayKeyId(key: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('twa_razorpay_key_id', key.trim());
    }
  },

  isConfigured(): boolean {
    const key = this.getRazorpayKeyId();
    return Boolean(key && (key.startsWith('rzp_test_') || key.startsWith('rzp_live_')));
  },

  isLive(): boolean {
    return this.getRazorpayKeyId().startsWith('rzp_live_');
  },

  getStatus() {
    const key = this.getRazorpayKeyId();
    const isConfig = this.isConfigured();
    const isLiveMode = key.startsWith('rzp_live_');
    return {
      razorpayConfigured: isConfig,
      isLiveMode,
      razorpayKeyPrefix: isConfig ? key.substring(0, 8) + '...' : 'Not configured',
      isSandboxMode: !isLiveMode,
    };
  },

  /**
   * Ensure Razorpay checkout script is loaded
   */
  async loadRazorpaySdk(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    if ((window as any).Razorpay) return true;

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.warn('[Razorpay SDK] Failed to load remote script.');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  },

  /**
   * STEP 1 (Frontend to Backend): Create Order via POST /api/create-order
   */
  async createBackendOrder(params: {
    amountPaise: number;
    currency?: string;
    receipt: string;
    notes?: Record<string, string>;
  }): Promise<RazorpayBackendOrderResponse> {
    const response = await fetch('/api/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: params.amountPaise,
        currency: params.currency || 'INR',
        receipt: params.receipt,
        notes: params.notes,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error || `Failed to create Razorpay order (Status ${response.status})`);
    }

    return data;
  },

  /**
   * STEP 3 (Frontend to Backend): Verify Signature via POST /api/verify-payment
   */
  async verifyPaymentSignature(payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    order_number?: string;
    customer?: {
      name: string;
      email: string;
      phone?: string;
    };
    amountUSD?: number;
  }): Promise<RazorpayVerificationResponse> {
    const response = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Payment signature verification failed.');
    }

    return data;
  },

  /**
   * Full Razorpay Standard Checkout Flow:
   * 1. Call Backend /api/create-order
   * 2. Open Razorpay Modal with order_id
   * 3. On success, call Backend /api/verify-payment
   */
  async processPayment(params: RazorpayPaymentParams): Promise<RazorpayPaymentResult> {
    const keyId = this.getRazorpayKeyId();

    if (!keyId) {
      return {
        success: false,
        transactionId: '',
        provider: 'razorpay',
        message: 'Razorpay Key ID is not configured. Please check VITE_RAZORPAY_KEY_ID in .env.',
      };
    }

    // 1. Calculate amount in paise
    const amountINR = params.amountINR ?? Math.round(params.amountUSD * 84.0);
    const amountPaise = Math.max(100, Math.round(amountINR * 100)); // Minimum 100 paise

    // 2. Load SDK
    const isLoaded = await this.loadRazorpaySdk();
    if (!isLoaded || !(window as any).Razorpay) {
      return {
        success: false,
        transactionId: '',
        provider: 'razorpay',
        message: 'Razorpay SDK could not be loaded. Please check your internet connection.',
      };
    }

    // 3. STEP 1: Backend Call to Create Order
    let backendOrder: RazorpayBackendOrderResponse;
    try {
      backendOrder = await this.createBackendOrder({
        amountPaise,
        currency: 'INR',
        receipt: params.orderNumber,
        notes: {
          order_number: params.orderNumber,
          amount_usd: `$${params.amountUSD} USD`,
          ...params.notes,
        },
      });
    } catch (orderErr: any) {
      console.error('[Create Order Failed]:', orderErr);
      return {
        success: false,
        transactionId: '',
        provider: 'razorpay',
        message: orderErr.message || 'Could not initiate order with Razorpay.',
      };
    }

    // 4. STEP 2: Open Razorpay Checkout Modal
    return new Promise((resolve) => {
      try {
        const prefillData: Record<string, any> = {
          name: params.customer.name,
          email: params.customer.email,
          contact: params.customer.phone || '',
        };

        if (params.preferredMethod) {
          prefillData.method = params.preferredMethod;
        }

        if (params.upiVpa && params.upiVpa.trim()) {
          prefillData.vpa = params.upiVpa.trim();
        }

        const options: any = {
          key: keyId,
          amount: backendOrder.amount,
          currency: backendOrder.currency,
          name: 'Prasri Rugs',
          description: `Handcrafted Rug Order (${params.orderNumber})`,
          image: '/favicon.svg',
          order_id: backendOrder.order_id,
          prefill: prefillData,
          notes: {
            order_number: params.orderNumber,
            amount_usd: `$${params.amountUSD} USD`,
            selected_method: params.preferredMethod || 'all',
            ...(params.upiVpa ? { upi_id: params.upiVpa.trim() } : {}),
            ...params.notes,
          },
          theme: {
            color: '#1A1918',
            backdrop_color: 'rgba(26, 25, 24, 0.75)',
          },
          modal: {
            confirm_close: true,
            ondismiss: function () {
              resolve({
                success: false,
                transactionId: '',
                provider: 'razorpay',
                message: 'Payment session was closed before completion. No funds were deducted.',
              });
            },
          },
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            // 5. STEP 3: Backend Call to Verify Signature
            try {
              await paymentService.verifyPaymentSignature({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_number: params.orderNumber,
                customer: params.customer,
                amountUSD: params.amountUSD,
              });

              resolve({
                success: true,
                transactionId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                provider: 'razorpay',
                message: `Payment verified successfully via Razorpay (ID: ${response.razorpay_payment_id}).`,
              });
            } catch (verifyErr: any) {
              console.error('[Signature Verification Failed]:', verifyErr);
              resolve({
                success: false,
                transactionId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                provider: 'razorpay',
                message: verifyErr.message || 'Payment signature verification failed.',
              });
            }
          },
        };

        const rzp = new (window as any).Razorpay(options);

        // Handle payment.failed event
        rzp.on('payment.failed', function (resp: any) {
          console.error('[Razorpay Payment Failed]:', resp.error);
          resolve({
            success: false,
            transactionId: resp.error?.metadata?.payment_id || '',
            provider: 'razorpay',
            message: resp.error?.description || 'Payment was declined by bank or card issuer.',
          });
        });

        rzp.open();
      } catch (err: any) {
        console.error('[Razorpay Modal Launch Error]:', err);
        resolve({
          success: false,
          transactionId: '',
          provider: 'razorpay',
          message: err.message || 'Failed to display Razorpay payment window.',
        });
      }
    });
  },
};
