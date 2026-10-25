'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import { ProductCard } from '../../../components/ProductCard';
import { api } from '../../../lib/api';
import { Search, Filter, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '../../../context/CartContext';

export default function OrganizationCatalogPage() {
  const { itemCount } = useCart();
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products?limit=50'),
        ]);
        if (catRes.success) setCategories(catRes.data || []);
        if (prodRes.success) setProducts(prodRes.data || []);
      } catch (err) {
        console.error('Failed to load restock catalog', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const fetchFiltered = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (search.trim()) params.append('search', search.trim());
      const res = await api.get(`/products?${params.toString()}`);
      if (res.success) setProducts(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiltered();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFiltered();
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar type="organization" />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Hospital & Pharmacy Restock Catalog
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Select verified medicines and clinical disposables. Live inventory counts are guaranteed at checkout.
            </p>
          </div>

          <Link
            href="/organization/cart"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Go to Order Cart ({itemCount})</span>
          </Link>
        </div>

        {/* Filter controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search generic, brand name, manufacturer or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
                selectedCategory === 'All'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Supplies
            </button>
            {categories.map((c) => (
              <button
                key={c._id}
                onClick={() => setSelectedCategory(c.name)}
                className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
                  selectedCategory === c.name
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="h-72 bg-white rounded-2xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-2">
            <p className="text-xs font-bold text-slate-700">No products matched your criteria</p>
            <p className="text-xs text-slate-500">
              Need an unlisted pharmaceutical? Use the "Request a New Product" feature.
            </p>
            <Link
              href="/organization/requests"
              className="inline-block mt-2 px-3.5 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-bold"
            >
              Request Custom Item
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

