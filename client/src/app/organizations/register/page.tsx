'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import {
  Building2,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  Check,
  FileText,
  Upload,
} from 'lucide-react';

export default function RegisterOrganizationPage() {
  const router = useRouter();
  const { user, organization, refreshUser } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [form, setForm] = useState({
    name: '',
    type: 'Hospital',
    ownerName: user?.name || '',
    contactNumber: '',
    businessEmail: user?.email || '',
    address: '',
    city: 'Dhaka',
    area: 'Central',
    licenseNumber: '',
    licenseDocumentUrl: 'https://medistock.health/docs/sample-license.pdf',
    additionalNotes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    if (step < 3) {
      setStep(step + 1);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      const res = await api.post('/organizations/register', form);
      if (res.success) {
        setSuccessMsg(res.message || 'Registration submitted successfully!');
        await refreshUser();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already registered
  if (organization && !successMsg) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 mx-auto flex items-center justify-center">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">{organization.name}</h1>
          <p className="text-xs text-slate-500">Registered Type: {organization.type}</p>

          <div className="inline-block py-2">
            {organization.verificationStatus === 'approved' ? (
              <span className="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                ✓ Approved & Verified for Healthcare Supply Orders
              </span>
            ) : organization.verificationStatus === 'pending' ? (
              <span className="px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 flex items-center gap-2 mx-auto">
                <Clock className="w-4 h-4 animate-pulse text-amber-600" />
                Under Administrator Verification
              </span>
            ) : (
              <span className="px-4 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200">
                Verification Rejected: {organization.rejectionReason || 'Please resubmit documents'}
              </span>
            )}
          </div>

          <div className="pt-4">
            <Link
              href="/organization/dashboard"
              className="px-5 py-2.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs"
            >
              Go to Organization Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-50 min-h-[calc(100vh-4rem)]">
      {/* Header matching template Screen 4 */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Register Your Organization
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Join MediStock and get access to quality healthcare supplies.
        </p>
      </div>

      {/* Stepper matching template Screen 4 */}
      <div className="flex items-center gap-4 max-w-xl">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 1 ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            1
          </div>
          <span className={`text-xs font-bold ${step >= 1 ? 'text-slate-900' : 'text-slate-400'}`}>
            Basic Info
          </span>
        </div>
        <div className="flex-1 h-0.5 bg-slate-200" />

        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 2 ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            2
          </div>
          <span className={`text-xs font-bold ${step >= 2 ? 'text-slate-900' : 'text-slate-400'}`}>
            Documents
          </span>
        </div>
        <div className="flex-1 h-0.5 bg-slate-200" />

        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 3 ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            3
          </div>
          <span className={`text-xs font-bold ${step >= 3 ? 'text-slate-900' : 'text-slate-400'}`}>
            Review
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium space-y-2">
          <p className="font-bold text-sm">Application Submitted Successfully!</p>
          <p>Your institutional credentials have been routed to the Platform Administrator for verification.</p>
          <Link
            href="/organization/dashboard"
            className="inline-block mt-2 px-4 py-2 bg-emerald-700 text-white rounded-lg font-bold"
          >
            Open Organization Portal
          </Link>
        </div>
      )}

      {/* Two Column Layout matching template Screen 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              {step === 1
                ? 'Organization Information'
                : step === 2
                ? 'License & Verification Documents'
                : 'Review & Submit'}
            </h2>

            {step === 1 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Enter hospital / pharmacy / clinic name"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Organization Type *
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-600 bg-white"
                    >
                      <option value="Hospital">Hospital</option>
                      <option value="Pharmacy">Pharmacy</option>
                      <option value="Clinic">Clinic</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Authorized Representative Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.ownerName}
                      onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                      placeholder="Enter representative name"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.businessEmail}
                      onChange={(e) => setForm({ ...form, businessEmail: e.target.value })}
                      placeholder="Enter email address"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.contactNumber}
                      onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                      placeholder="Enter phone number"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="e.g. Dhaka"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Address *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Full address"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Drug License / Registration Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.licenseNumber}
                    onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                    placeholder="e.g. DGDA-LIC-2026-9874"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    License Document URL / File Attachment *
                  </label>
                  <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 text-center space-y-2">
                    <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">Attach trade license or DGDA registration PDF</p>
                    <input
                      type="text"
                      value={form.licenseDocumentUrl}
                      onChange={(e) => setForm({ ...form, licenseDocumentUrl: e.target.value })}
                      placeholder="https://medistock.health/docs/sample-license.pdf"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Organization:</span>
                  <span className="font-bold text-slate-900">{form.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Facility Type:</span>
                  <span className="font-bold text-slate-900">{form.type}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Representative:</span>
                  <span className="font-bold text-slate-900">{form.ownerName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Email & Phone:</span>
                  <span className="font-bold text-slate-900">{form.businessEmail} • {form.contactNumber}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">License Number:</span>
                  <span className="font-bold text-teal-700">{form.licenseNumber || 'DGDA-PENDING'}</span>
                </div>
              </div>
            )}

            {/* Action Buttons matching template Screen 4 */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => (step > 1 ? setStep(step - 1) : router.push('/'))}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                {step > 1 ? 'Back' : 'Cancel'}
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <span>{step < 3 ? 'Next Step' : 'Submit Application'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Why Register Card matching template Screen 4 */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-6">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Why Register?</h3>
            <div className="space-y-3">
              {[
                'Access to bulk pricing',
                'Track your orders',
                'Manage inventory',
                'Get product alerts',
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hospital Building Illustration matching template */}
          <div className="pt-4 border-t border-slate-100 flex justify-center">
            <div className="w-full h-44 rounded-xl bg-teal-50/60 border border-teal-100 p-4 flex flex-col items-center justify-center text-teal-700 space-y-2">
              <Building2 className="w-14 h-14 text-teal-600 stroke-[1.5]" />
              <p className="text-xs font-bold text-slate-800">Verified Healthcare Network</p>
              <p className="text-[11px] text-slate-500 text-center">
                Institutional discounts & guaranteed authentic pharmaceutical supplies
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
