'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, ShieldAlert, Check } from 'lucide-react';

export interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    sku: string;
    category: string;
    manufacturer: string;
    unit: string;
    price: number;
    stock: number;
    image?: string;
    prescriptionRequired?: boolean;
    batchNumber?: string;
    expiryDate?: string;
  };
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { user, organization } = useAuth();
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isApprovedOrg =
    (user?.role === 'organization' && organization?.verificationStatus === 'approved') ||
    user?.role === 'admin' ||
    user?.role === 'owner';

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isApprovedOrg) {
      // If not approved org, can still add to local session cart or navigate
      addToCart(product._id, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
      return;
    }

    if (product.stock <= 0) return;

    setIsAdding(true);
    const success = await addToCart(product._id, 1);
    setIsAdding(false);
    if (success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    }
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col hover:shadow-md transition-all group">
      {/* Product Image */}
      <div className="relative h-44 bg-slate-50/80 flex items-center justify-center p-4">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-slate-200/70 flex items-center justify-center text-slate-400 font-bold text-sm">
            Rx
          </div>
        )}

        {/* Prescription Required Pill */}
        {product.prescriptionRequired && (
          <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-white shadow-xs">
            <ShieldAlert className="w-3 h-3" />
            Rx Required
          </span>
        )}
      </div>

      {/* Product Information matching template Screen 2 */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-teal-700 transition-colors">
            <Link href={`/products/${product._id}`}>{product.name}</Link>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium truncate">
            {product.unit || 'Standard Pack'}
          </p>

          <div className="mt-2 text-sm sm:text-base font-black text-slate-900">
            ৳ {product.price}
          </div>
        </div>

        {/* Add To Cart Button matching template */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAdding}
          className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs ${
            justAdded
              ? 'bg-emerald-600 text-white'
              : isOutOfStock
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-teal-700 hover:bg-teal-800 text-white'
          }`}
        >
          {justAdded ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Added</span>
            </>
          ) : isOutOfStock ? (
            <span>Out of Stock</span>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add To Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
