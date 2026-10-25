'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '../../../components/Sidebar';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';
import { ProductCard } from '../../../components/ProductCard';
import {
  Package,
  Droplets,
  ShoppingCart,
  HeartHandshake,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function UserDashboardPage() {
  const { user } = useAuth();
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const prodRes = await api.get('/products?limit=4');
        if (prodRes.success && prodRes.data) {
          setRecentProducts(prodRes.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar type="user" />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-6xl">
        {/* Welcome Header matching template Screen 3 */}
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Hello, {user?.name || 'Rahim Ahmed'} 👋
          </h1>
          <p className="text-xs text-slate-500">Welcome to MediStock</p>
        </div>

        {/* 3 Quick Action Cards matching template Screen 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Browse Products */}
          <Link
            href="/products"
            className="bg-white rounded-2xl p-4 border border-slate-200/90 hover:border-teal-300 hover:shadow-sm transition-all flex items-center gap-3.5 group"
          >
            <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="overflow-hidden">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                Browse Products
              </h3>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                Shop essential healthcare products
              </p>
            </div>
          </Link>

          {/* Card 2: Blood Donation */}
          <Link
            href="/blood-donation"
            className="bg-white rounded-2xl p-4 border border-slate-200/90 hover:border-rose-300 hover:shadow-sm transition-all flex items-center gap-3.5 group"
          >
            <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Droplets className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="overflow-hidden">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                Blood Donation
              </h3>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                Donate or request blood
              </p>
            </div>
          </Link>

          {/* Card 3: My Orders */}
          <Link
            href="/organization/orders"
            className="bg-white rounded-2xl p-4 border border-slate-200/90 hover:border-emerald-300 hover:shadow-sm transition-all flex items-center gap-3.5 group"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ShoppingCart className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="overflow-hidden">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                My Orders
              </h3>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                Track your orders
              </p>
            </div>
          </Link>
        </div>

        {/* Recent Products Section matching template Screen 3 */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900">Recent Products</h2>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 bg-slate-200/60 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {recentProducts.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          )}
        </div>

        {/* Donate Blood Save Lives Banner matching template Screen 3 */}
        <div className="bg-gradient-to-r from-rose-50/80 via-[#fff5f5] to-orange-50/60 rounded-2xl p-6 sm:p-7 border border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xs">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Donate Blood Save Lives
            </h3>
            <p className="text-xs text-slate-600">
              Be a hero. Donate blood. Every drop brings hope.
            </p>
            <div className="pt-2">
              <Link
                href="/blood-donation"
                className="inline-block px-5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-sm transition-all"
              >
                Donate Now
              </Link>
            </div>
          </div>

          <div className="w-32 sm:w-40 h-24 flex items-center justify-center shrink-0">
            <div className="w-20 h-20 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shadow-sm">
              <HeartHandshake className="w-10 h-10 stroke-[2.2]" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
