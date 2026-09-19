import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Check, ShieldCheck, Truck, Clock, Printer, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { orderService } from '../services/orderService';
import { Order } from '../types';

export const OrderConfirmationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('orderNumber') || '';
  const { getOrder, isLoggedIn } = useAuth();
  const { formatPrice } = useCurrency();
  const [order, setOrder] = useState<Order | null>(() => (orderNumber ? getOrder(orderNumber) || null : null));

  useEffect(() => {
    if (orderNumber) {
      const existing = getOrder(orderNumber);
      if (existing) {
        setOrder(existing);
      } else {
        orderService.getOrderByNumber(orderNumber).then((found) => {
          if (found) setOrder(found);
        });
      }
    }
  }, [orderNumber, getOrder]);

  if (!orderNumber) {
    return (
      <div className="pt-36 pb-28 text-center bg-atelier-ivory min-h-screen px-4">
        <div className="max-w-md mx-auto space-y-6 bg-atelier-cream border border-atelier-parchment p-10 shadow-subtle">
          <div className="text-[10px] tracking-widest uppercase text-atelier-taupe font-mono">
            Atelier Order Verification
          </div>
          <h1 className="font-serif text-3xl text-atelier-softblack font-light">
            No Order Reference Provided
          </h1>
          <p className="text-xs text-atelier-charcoal font-light leading-relaxed">
            Please check your email for your order reference code, or look up your handcrafted shipment directly.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/order-tracking"
              className="w-full sm:w-auto px-6 py-3 bg-atelier-softblack text-atelier-parchment text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-colors font-medium"
            >
              Track an Order
            </Link>
            <Link
              to="/shop"
              className="w-full sm:w-auto px-6 py-3 bg-atelier-ivory border border-atelier-parchment text-atelier-softblack text-xs tracking-widest uppercase hover:border-black transition-colors"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 sm:pt-28 pb-24 bg-atelier-ivory min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Success Banner */}
        <div className="text-center space-y-4 py-8 border-b border-atelier-parchment">
          <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center">
            <Check size={32} />
          </div>

          <div className="text-[10px] tracking-widest uppercase text-atelier-taupe font-mono">
            Transaction Authorized & Verified
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl text-atelier-softblack font-light tracking-tight">
            Thank You for Your Order
          </h1>

          <p className="text-sm text-atelier-charcoal font-light max-w-lg mx-auto leading-relaxed">
            Your handmade rug order has been registered directly at our Bhadohi studio in Uttar Pradesh, India.
          </p>

          <div className="inline-flex items-center space-x-2 bg-atelier-cream border border-atelier-parchment px-6 py-2.5 rounded text-xs font-mono text-atelier-softblack">
            <span>Order Number:</span>
            <span className="font-bold text-sm">{orderNumber}</span>
          </div>
        </div>

        {/* Order Details Card */}
        {order && (
          <div className="bg-atelier-cream border border-atelier-parchment p-8 sm:p-10 space-y-8 shadow-subtle">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-atelier-parchment pb-6 gap-4">
              <div>
                <div className="text-xs text-atelier-taupe">Date Placed</div>
                <div className="font-medium text-sm text-atelier-softblack">{order.date}</div>
              </div>
              <div>
                <div className="text-xs text-atelier-taupe">Delivery Carrier</div>
                <div className="font-medium text-sm text-atelier-softblack">{order.carrier}</div>
              </div>
              <div>
                <div className="text-xs text-atelier-taupe">Air Tracking Code</div>
                <div className="font-mono text-sm text-atelier-darkbrown font-bold">{order.trackingNumber}</div>
              </div>
              <div>
                <div className="text-xs text-atelier-taupe">Estimated Delivery</div>
                <div className="font-medium text-sm text-atelier-softblack">{order.estimatedDeliveryDate}</div>
              </div>
              <div>
                <div className="text-xs text-atelier-taupe">Payment Status</div>
                <div className="inline-flex items-center text-xs font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-0.5">
                  <Check size={12} className="mr-1 text-emerald-600" />
                  <span>{order.paymentProvider || 'Razorpay Verified'}</span>
                </div>
                {order.paymentId && (
                  <div className="text-[10px] text-atelier-taupe font-mono mt-0.5 truncate max-w-[160px]">
                    ID: {order.paymentId}
                  </div>
                )}
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-4">
              <h3 className="font-serif text-xl text-atelier-softblack font-normal">
                Ordered Pieces
              </h3>

              <div className="divide-y divide-atelier-parchment border-y border-atelier-parchment">
                {order.items.map((item) => (
                  <div key={item.variantId} className="py-4 flex items-center space-x-4">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-16 h-20 object-cover bg-atelier-ivory border border-atelier-parchment"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-base text-atelier-softblack font-medium">
                        {item.productName}
                      </h4>
                      <div className="text-xs text-atelier-taupe">
                        Dimensions: {item.size} · SKU: {item.sku}
                      </div>
                      <div className="text-[11px] text-atelier-charcoal mt-1">
                        Status:{' '}
                        <span className="font-medium">
                          {item.isReadyToShip ? 'Ready to Ship · Conditioning' : 'Made to Order · Loom Scheduled'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-medium text-atelier-softblack">
                        {formatPrice(item.priceUSD * item.quantity)}
                      </div>
                      <div className="text-[10px] text-atelier-taupe">Qty: {item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address & Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-2">
              <div className="space-y-2 text-xs text-atelier-charcoal font-light leading-relaxed">
                <div className="text-[10px] tracking-widest uppercase text-atelier-taupe font-medium">
                  Destination Address
                </div>
                <div className="font-medium text-atelier-softblack">
                  {order.customer.firstName} {order.customer.lastName}
                </div>
                <div>{order.shippingAddress.address} {order.shippingAddress.apartment}</div>
                <div>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </div>
                <div>{order.shippingAddress.country}</div>
                <div className="text-atelier-taupe pt-1">{order.customer.email} · {order.customer.phone}</div>
              </div>

              <div className="space-y-2 text-xs text-atelier-charcoal font-light leading-relaxed sm:text-right">
                <div className="text-[10px] tracking-widest uppercase text-atelier-taupe font-medium">
                  Financial Summary
                </div>
                <div className="flex justify-between sm:justify-end sm:space-x-8">
                  <span>Subtotal:</span>
                  <span className="font-mono text-atelier-softblack">{formatPrice(order.subtotalUSD)}</span>
                </div>
                <div className="flex justify-between sm:justify-end sm:space-x-8">
                  <span>Air Courier:</span>
                  <span className="font-mono text-atelier-softblack">
                    {order.shippingUSD === 0 ? 'Complimentary' : formatPrice(order.shippingUSD)}
                  </span>
                </div>
                <div className="flex justify-between sm:justify-end sm:space-x-8 font-medium font-serif text-lg text-atelier-softblack border-t border-atelier-parchment pt-2 mt-2">
                  <span>Paid in Full:</span>
                  <span className="font-mono text-atelier-darkbrown font-bold">{formatPrice(order.totalUSD)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-atelier-parchment gap-4">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center text-xs text-atelier-charcoal hover:text-black underline"
              >
                <Printer size={13} className="mr-1.5" />
                <span>Print Receipt & Customs Invoice</span>
              </button>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <Link
                  to={`/order-tracking?orderNumber=${orderNumber}`}
                  className="flex-1 sm:flex-initial px-6 py-3 bg-atelier-softblack text-atelier-parchment text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-colors font-medium flex items-center justify-center"
                >
                  <span>Track Production & Air Transit</span>
                  <ArrowRight size={13} className="ml-2" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Seamless Guest-to-Account Banner */}
        {!isLoggedIn && order && (
          <div className="bg-atelier-cream border border-atelier-parchment p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-subtle">
            <div className="space-y-1.5 max-w-lg">
              <div className="text-[10px] tracking-widest uppercase text-atelier-taupe font-mono">
                Complimentary Atelier Membership
              </div>
              <h3 className="font-serif text-xl text-atelier-softblack font-normal">
                Save Your Details for Seamless Tracking
              </h3>
              <p className="text-xs text-atelier-charcoal font-light leading-relaxed">
                Connect an account with <span className="font-medium text-atelier-softblack">{order.customer.email}</span> using Google or email. This order will automatically sync to your private dashboard.
              </p>
            </div>

            <Link
              to={`/account?email=${encodeURIComponent(order.customer.email)}`}
              className="w-full sm:w-auto px-6 py-3 bg-atelier-softblack text-atelier-parchment text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-colors font-medium flex items-center justify-center whitespace-nowrap"
            >
              <span>Save & Link Account</span>
              <ArrowRight size={13} className="ml-2" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
