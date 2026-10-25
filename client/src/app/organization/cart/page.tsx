'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sidebar } from '../../../components/Sidebar';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { api } from '../../../lib/api';
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Package,
} from 'lucide-react';

export default function OrganizationCartPage() {
  const router = useRouter();
  const { user, organization } = useAuth();
  const { items, totalAmount, updateQuantity, removeFromCart, clearCart, refreshCart } = useCart();

  const [deliveryAddress, setDeliveryAddress] = useState(organization?.address || '');
  const [city, setCity] = useState(organization?.city || 'Dhaka');
  const [contactNumber, setContactNumber] = useState(organization?.contactNumber || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isApproved = organization?.verificationStatus === 'approved';

  const hasOutOfStock = items.some((item) => item.isOutOfStock);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (hasOutOfStock) {
      setErrorMsg('Please adjust or remove items exceeding current warehouse stock before ordering.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      const res = await api.post('/orders/checkout', {
        deliveryAddress,
        city,
        contactNumber,
      });

      if (res.success && res.order) {
        await refreshCart();
        router.push(`/organization/orders/${res.order._id}?created=true`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Checkout failed. Please review stock availability.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar type="organization" />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Restock Cart & Place Supply Order
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review requisition line items and submit clinical procurement.
          </p>
        </div>

        {!isApproved && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Ordering is disabled because your organization verification is {organization?.verificationStatus || 'pending'}.
            </span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 mx-auto flex items-center justify-center">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Your restocking cart is empty</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add products from the catalog to build an institutional restock order.
            </p>
            <Link
              href="/organization/catalog"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-all"
            >
              <Package className="w-4 h-4" /> Browse Restock Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items Table */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Order Items ({items.length})
                </span>
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {items.map((item, idx) => {
                  const prod = item.product;
                  if (!prod) return null;
                  return (
                    <div key={idx} className="p-4 sm:p-5 flex items-center gap-4 hover:bg-slate-50/50">
                      <div className="w-16 h-16 rounded-xl bg-slate-50 p-2 border border-slate-100 shrink-0 flex items-center justify-center">
                        {prod.image ? (
                          <img src={prod.image} alt={prod.name} className="max-h-full object-contain" />
                        ) : (
                          <span className="font-bold text-xs text-slate-400">Rx</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-semibold text-teal-600 uppercase tracking-wider">
                          {prod.category}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {prod.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-mono">SKU: {prod.sku}</p>

                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-slate-900 font-mono">
                            ৳ {prod.price}
                          </span>
                          <span className="text-[10px] text-slate-400">/ {prod.unit}</span>
                          {item.isOutOfStock && (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                              Stock Alert: Only {prod.stock} Left!
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-slate-200 rounded-xl bg-white shrink-0">
                        <button
                          onClick={() => updateQuantity(prod._id, Math.max(1, item.quantity - 1))}
                          className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(prod._id, item.quantity + 1)}
                          className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                        >
                          +
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right w-20 shrink-0">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 font-mono block">
                          ৳ {item.subtotal?.toLocaleString()}
                        </span>
                        <button
                          onClick={() => removeFromCart(prod._id)}
                          className="text-[11px] text-slate-400 hover:text-rose-600 mt-1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Checkout Form */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-5 h-fit">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                Order Delivery & Confirmation
              </h3>

              <form onSubmit={handleCheckout} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Delivery Facility Name
                  </label>
                  <input
                    type="text"
                    disabled
                    value={organization?.name || 'Healthcare Facility'}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Emergency Dispatch Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Clinical Delivery Address
                  </label>
                  <input
                    type="text"
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                {/* Subtotal Calculation */}
                <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Line Subtotal:</span>
                    <span className="font-mono font-semibold">৳ {totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Clinical Restock Logistics:</span>
                    <span>FREE</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-900">
                    <span>Total Order Amount:</span>
                    <span className="font-mono text-teal-700">৳ {totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!isApproved || isSubmitting || hasOutOfStock}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                    !isApproved || hasOutOfStock
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-900 hover:bg-blue-800 text-white'
                  }`}
                >
                  {isSubmitting ? (
                    'Reserving Stock...'
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Submit Restocking Order
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

