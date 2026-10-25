'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '../../lib/api';
import { ProductCard } from '../../components/ProductCard';
import {
  Thermometer,
  Activity,
  Heart,
  Droplets,
  Shield,
  Sparkles,
  FlaskConical,
  Pill,
  Layers,
  Cpu,
  Stethoscope,
  Sparkle,
  Package,
  Search,
  ChevronRight,
} from 'lucide-react';

const CATEGORY_LIST = [
  { name: 'All Categories', slug: 'All', icon: Layers },
  { name: 'Cold & Cough', slug: 'cold-cough-fever', icon: Thermometer },
  { name: 'Gastric & Digestive', slug: 'gastric-digestive', icon: Activity },
  { name: 'Blood Pressure', slug: 'cardiovascular', icon: Heart },
  { name: 'Diabetes', slug: 'diabetes-care', icon: Droplets },
  { name: 'First Aid', slug: 'first-aid', icon: Shield },
  { name: 'Creams & Ointments', slug: 'skin-care-ointments', icon: Sparkles },
  { name: 'Syrups', slug: 'syrups-liquids', icon: FlaskConical },
  { name: 'Tablets & Capsules', slug: 'tablets-capsules', icon: Pill },
  { name: 'Masks', slug: 'protective-equipment', icon: Shield },
  { name: 'Thermometers', slug: 'monitoring-devices', icon: Thermometer },
  { name: 'Gloves', slug: 'syringes-gloves-disposables', icon: Layers },
  { name: 'Medical Equipment', slug: 'medical-devices', icon: Stethoscope },
  { name: 'Hygiene Supplies', slug: 'sanitizers-hygiene', icon: Sparkle },
  { name: 'Other Supplies', slug: 'other-medical-supplies', icon: Package },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [search, setSearch] = useState<string>(initialSearch);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync category from URL param if changes
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
    const q = searchParams.get('search');
    if (q) setSearch(q);
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'All') {
        params.append('category', selectedCategory);
      }
      if (search.trim()) params.append('search', search.trim());

      const res = await api.get(`/products?${params.toString()}`);
      if (res.success) {
        setProducts(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Categories List matching template Screen 2 */}
        <aside className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900 mb-3 px-2">Categories</h2>
          <nav className="space-y-0.5">
            {CATEGORY_LIST.map((cat) => {
              const Icon = cat.icon;
              const isSelected =
                selectedCategory === cat.slug ||
                (cat.slug === 'All' && (!selectedCategory || selectedCategory === 'All'));

              return (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all text-left ${
                    isSelected
                      ? 'bg-teal-50 text-teal-800 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-teal-700' : 'text-slate-400'}`} />
                  <span className="truncate">{cat.name}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Column: Promotional Banner + Products Grid */}
        <main className="lg:col-span-9 space-y-6">
          {/* Top Promotional Banner matching template Screen 2 */}
          <div className="bg-gradient-to-r from-[#d9f2ef] via-[#e5f7f5] to-[#f4fbfb] rounded-2xl p-6 sm:p-8 border border-teal-100 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xs overflow-hidden">
            <div className="space-y-2 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Stay Safe <br />
                Stay Healthy
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Quality masks for your protection
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setSelectedCategory('protective-equipment')}
                  className="px-5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-sm transition-all"
                >
                  Shop Now
                </button>
              </div>
            </div>

            <div className="w-44 sm:w-56 h-32 sm:h-36 flex items-center justify-center shrink-0">
              <img
                src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80"
                alt="Protective Mask"
                className="max-h-full object-contain filter drop-shadow-md rounded-xl"
              />
            </div>
          </div>

          {/* Section Header: Featured Products */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Featured Products</h3>
              {search && (
                <p className="text-xs text-slate-500">
                  Showing results for &ldquo;{search}&rdquo;
                </p>
              )}
            </div>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearch('');
              }}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800"
            >
              View All
            </button>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-64 bg-slate-200/60 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <p className="text-slate-600 text-sm font-medium">No medical products found matching this filter.</p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearch('');
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-teal-700 rounded-lg"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 text-center text-xs text-slate-400">
          Loading catalog...
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
