'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import {
  ArrowLeft,
  ShoppingCart,
  ShieldAlert,
  Building2,
  CheckCircle2,
  Clock,
  Package,
  Calendar,
  Layers,
  Check,
  AlertTriangle,
} from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, organization } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/products/${id}`);
        if (res.success) {
          setProduct(res.data);
          setBatches(res.batches || []);
        }
      } catch (err) {
        console.error('Failed to load product detail', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const isApprovedOrg =
    (user?.role === 'organization' && organization?.verificationStatus === 'approved') ||
    user?.role === 'admin' ||
    user?.role === 'owner';

  const handleAddToCart = async () => {
    if (!product || !isApprovedOrg || product.stock < quantity) return;
    setIsAdding(true);
    const success = await addToCart(product._id, quantity);
    setIsAdding(false);
    if (success) {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500">Loading verified product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Product not found</h2>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-900 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Medical Catalog
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 sm:p-10">
          {/* Image Column */}
          <div className="flex flex-col items-center justify-center bg-slate-50 rounded-2xl p-8 border border-slate-100 min-h-[350px] relative">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="max-h-80 w-auto object-contain"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-400 font-bold text-xl">
                Rx
              </div>
            )}

            {product.prescriptionRequired && (
              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg bg-amber-500 text-white shadow-sm">
                <ShieldAlert className="w-4 h-4" />
                Prescription Required (Rx)
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="space-y-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                  {product.category}
                </span>
                <span className="text-xs font-mono text-slate-400">SKU: {product.sku}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {product.name}
              </h1>

              <p className="text-xs sm:text-sm text-slate-500">
                Manufacturer: <span className="font-bold text-slate-800">{product.manufacturer}</span>
              </p>

              <div className="flex items-baseline gap-3 pt-2">
                <span className="text-3xl font-black text-slate-900 font-mono">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-xs text-slate-500 font-medium">per {product.unit}</span>
              </div>

              {/* Stock Status Badge */}
              <div className="pt-1">
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                    <AlertTriangle className="w-3.5 h-3.5" /> Out of Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {product.stock} units available in depot
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-2">
                {product.description || 'Standard institutional clinical supply grade pharmaceutical formulation.'}
              </p>
            </div>

            {/* Ordering Section */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              {isApprovedOrg ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <label className="text-xs font-bold text-slate-700">Order Quantity:</label>
                    <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-bold"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={product.stock}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                        className="w-16 text-center text-xs font-bold py-1.5 border-x border-slate-200 focus:outline-none"
                      />
                      <button
                        onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                        className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-bold"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">
                      Subtotal: ${(product.price * quantity).toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || isAdding}
                    className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                      addedSuccess
                        ? 'bg-emerald-600 text-white'
                        : isOutOfStock
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-blue-900 hover:bg-blue-800 text-white'
                    }`}
                  >
                    {addedSuccess ? (
                      <>
                        <Check className="w-4 h-4" /> Added to Organization Cart!
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" /> Add to Supply Cart
                      </>
                    )}
                  </button>
                </div>
              ) : user && user.role === 'organization' && organization?.verificationStatus === 'pending' ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                  <p className="font-bold">Ordering Locked — Verification Pending</p>
                  <p>
                    Your organization registration for "{organization.name}" is awaiting administrator approval. You will receive an in-app notice once approved.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs space-y-2">
                  <p className="font-bold text-slate-900">Ordering Restricted to Verified Healthcare Organizations</p>
                  <p className="text-slate-500">
                    To place restocking orders for this medicine, please register your clinic, hospital, or pharmacy.
                  </p>
                  <Link
                    href="/organizations/register"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs"
                  >
                    <Building2 className="w-3.5 h-3.5" /> Register Organization
                  </Link>
                </div>
              )}

              {/* Clinical Warning Alert */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 leading-relaxed">
                <span className="font-semibold text-slate-700">Storage & Compliance Notice: </span>
                Store under controlled clinical room temperature (15°C – 25°C) away from moisture and direct sunlight.
              </div>
            </div>
          </div>
        </div>

        {/* Batch and Expiry Information Table (Section 7) */}
        {batches.length > 0 && (
          <div className="border-t border-slate-100 p-6 sm:p-8 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-600" /> Active Inventory Batches & Expiry Dates
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                    <th className="py-2 px-3">Batch Number</th>
                    <th className="py-2 px-3">Available Quantity</th>
                    <th className="py-2 px-3">Manufacturing Date</th>
                    <th className="py-2 px-3">Expiry Date</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {batches.map((batch) => {
                    const isExp = new Date(batch.expiryDate) < new Date();
                    return (
                      <tr key={batch._id} className="hover:bg-white/80">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{batch.batchNumber}</td>
                        <td className="py-2.5 px-3 font-bold">{batch.quantity} units</td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {batch.manufacturingDate ? new Date(batch.manufacturingDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-800">
                          {new Date(batch.expiryDate).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-3">
                          {isExp ? (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                              Expired
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              Valid Batch
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

