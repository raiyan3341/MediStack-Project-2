'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  ShieldCheck,
  Package,
  FileText,
  Clock,
  Truck,
  ArrowRight,
  HeartHandshake,
  CheckCircle2,
} from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
          Platform Architecture & Operations
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          How MediStock Powers Healthcare Supply Restocking
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          MediStock is built from the ground up for pharmacies, hospitals, and clinics to eliminate drug stockouts, maintain clinical inventory compliance, and automate emergency supplies.
        </p>
      </div>

      {/* Two Column Workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* For Hospitals & Pharmacies */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-teal-50 text-teal-700">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">For Hospitals & Pharmacies</h2>
              <p className="text-xs text-slate-500">Restock procurement & verified order management</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Facility Verification</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Submit clinical establishment or retail trade documents. Once approved by our compliance team, bulk ordering is unlocked.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Real-Time Inventory & Cart</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Check live depot stock counts, batch expiry timelines, and add items with volume pricing.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Cold-Chain & Secure Fulfillment</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Orders are packed under temperature-controlled monitoring with lot numbers stamped on every shipping container.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                4
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Download Invoices & History</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Print official tax invoices and review organization-specific spend analytics and most frequently ordered items.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/organizations/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-900 text-white text-xs font-bold shadow-xs hover:bg-blue-800 transition-colors"
            >
              <span>Register Healthcare Organization</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* For Public Users & Blood Donors */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-50 text-rose-600">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">For General Users & Donors</h2>
              <p className="text-xs text-slate-500">Public catalog browsing & voluntary blood requests</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Public Medicine Search</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Search product availability, active pharmaceutical ingredients, and manufacturing standards across national suppliers.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Register Blood Donor Profile</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Provide your blood group, city, and voluntary contact preference to be available for emergency surgical transfusions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Post Emergency Blood Requests</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  In critical clinical circumstances, publish patient requirements to coordinate voluntary donors directly with hospital attendants.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/blood-donation"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-xs hover:bg-rose-500 transition-colors"
            >
              <span>Explore Blood Donor Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

