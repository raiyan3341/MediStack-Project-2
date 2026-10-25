'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';
import { ProductCard } from '../components/ProductCard';
import {
  Activity,
  Heart,
  Droplets,
  Shield,
  Thermometer,
  Pill,
  Sparkles,
  ArrowRight,
  Package,
  Layers,
  HeartHandshake,
  Stethoscope,
  ChevronRight,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setIsLoading(true);
        const prodRes = await api.get('/products?limit=8');
        if (prodRes.success && prodRes.data) {
          setFeaturedProducts(prodRes.data);
        }
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadHomeData();
  }, []);

  // 5 Feature Service Cards matching template Screen 1
  const featureServices = [
    {
      title: 'Medicines',
      sub: 'Tablets, Syrups, Capsules',
      icon: Pill,
      iconBg: 'bg-teal-50 text-teal-600 border-teal-200',
      href: '/products?category=tablets-capsules',
    },
    {
      title: 'Medical Supplies',
      sub: 'Masks, Gloves, Equipment',
      icon: Package,
      iconBg: 'bg-blue-50 text-blue-600 border-blue-200',
      href: '/products?category=protective-equipment',
    },
    {
      title: 'Personal Care',
      sub: 'Creams, Hygiene, etc.',
      icon: Sparkles,
      iconBg: 'bg-purple-50 text-purple-600 border-purple-200',
      href: '/products?category=skin-care-ointments',
    },
    {
      title: 'Health Devices',
      sub: 'Thermometers, BP Monitor',
      icon: Stethoscope,
      iconBg: 'bg-cyan-50 text-cyan-600 border-cyan-200',
      href: '/products?category=monitoring-devices',
    },
    {
      title: 'Blood Donation',
      sub: 'Donate or Find Donors',
      icon: HeartHandshake,
      iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
      href: '/blood-donation',
    },
  ];

  // 8 Popular Categories matching template Screen 1
  const popularCategories = [
    { name: 'Cold & Cough', slug: 'cold-cough-fever', icon: Thermometer, color: 'text-cyan-600 bg-cyan-50' },
    { name: 'Gastric & Digestive', slug: 'gastric-digestive', icon: Activity, color: 'text-teal-600 bg-teal-50' },
    { name: 'Blood Pressure', slug: 'cardiovascular', icon: Heart, color: 'text-rose-600 bg-rose-50' },
    { name: 'Diabetes', slug: 'diabetes-care', icon: Droplets, color: 'text-blue-600 bg-blue-50' },
    { name: 'First Aid', slug: 'first-aid', icon: Shield, color: 'text-amber-600 bg-amber-50' },
    { name: 'Creams & Ointments', slug: 'skin-care-ointments', icon: Sparkles, color: 'text-purple-600 bg-purple-50' },
    { name: 'Masks', slug: 'protective-equipment', icon: Shield, color: 'text-indigo-600 bg-indigo-50' },
    { name: 'Thermometer', slug: 'monitoring-devices', icon: Thermometer, color: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen space-y-8 pb-16">
      {/* 1. Hero Section matching template Screen 1 */}
      <section className="bg-gradient-to-r from-[#eef9f8] via-[#f0fbf9] to-white border-b border-teal-100/60 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Your Trusted Partner <br className="hidden sm:inline" />
                in Healthcare Supply
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
                Quality medicines, medical supplies and healthcare essentials for hospitals, pharmacies, clinics and individuals.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/products"
                  className="px-6 py-2.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
                >
                  Shop Now
                </Link>
                <Link
                  href="/about"
                  className="px-6 py-2.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-all shadow-2xs"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right Doctor Image matching template */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md h-72 sm:h-80 rounded-2xl overflow-hidden shadow-lg border-4 border-white bg-teal-100/50">
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&auto=format&fit=crop&q=80"
                  alt="Doctor with Stethoscope"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Five Service Category Cards matching template Screen 1 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {featureServices.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                className="bg-white rounded-2xl p-4 border border-slate-200/90 hover:border-teal-300 hover:shadow-md transition-all flex flex-col items-start group"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 ${card.iconBg} group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                  {card.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate w-full">
                  {card.sub}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Popular Categories Section matching template Screen 1 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Popular Categories</h2>
          <Link
            href="/products"
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {popularCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="bg-white rounded-2xl p-3 border border-slate-200/80 hover:border-teal-300 hover:shadow-sm transition-all flex flex-col items-center text-center group"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${cat.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="text-[11px] font-semibold text-slate-700 group-hover:text-teal-700 transition-colors line-clamp-1">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Featured Products Section matching template Screen 1 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Featured Products</h2>
          <Link
            href="/products"
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-slate-200/60 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {featuredProducts.slice(0, 8).map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
