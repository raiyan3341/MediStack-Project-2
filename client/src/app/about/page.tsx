'use client';

import React from 'react';
import Link from 'next/link';
import { Activity, ShieldCheck, HeartHandshake, Award, Users, CheckCircle } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
          Our Healthcare Mission
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Modernizing Healthcare Supply Logistics & Emergency Donor Networks
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          MediStock connects pharmaceutical manufacturers, wholesale distributors, clinical hospitals, and community blood donors into one integrated, accountable platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Regulatory Integrity</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every medical supplier and ordering hospital undergoes mandatory license and identity screening to uphold the highest standard of pharmaceutical safety.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Zero Stockout Guarantee</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Automated low-stock threshold triggers and near-expiry batch monitoring protect clinics from running out of life-critical medicines.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Community Lifeline</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Our voluntary blood donation network operates 24/7 with zero commercialization, connecting potential donors with emergency trauma and surgical patients.
          </p>
        </div>
      </div>
    </div>
  );
}

