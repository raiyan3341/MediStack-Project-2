'use client';

import React, { useState } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import { VerificationBadge } from '../../../components/VerificationBadge';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';
import { Building2, ShieldCheck, PhoneCall, Mail, MapPin, FileText, CheckCircle2 } from 'lucide-react';

export default function OrganizationProfilePage() {
  const { user, organization, refreshUser } = useAuth();
  const [form, setForm] = useState({
    contactNumber: organization?.contactNumber || '',
    businessEmail: organization?.businessEmail || '',
    address: organization?.address || '',
    city: organization?.city || '',
    area: organization?.area || '',
    additionalNotes: organization?.additionalNotes || '',
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      const res = await api.put('/organizations/me', form);
      if (res.success) {
        setSuccessMsg('Facility contact details updated successfully.');
        await refreshUser();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update organization');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar type="organization" />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Organization Profile & Verification Records
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered medical facility license information and logistics dispatch addresses.
          </p>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {successMsg}
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
          {/* Header Info */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xl">
                <Building2 className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{organization?.name || 'My Organization'}</h2>
                  <VerificationBadge status={organization?.verificationStatus || 'pending'} />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Facility Type: {organization?.type}</p>
                <p className="text-xs font-mono text-slate-700">License: {organization?.licenseNumber}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleUpdate} className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Update Logistics & Dispatch Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Official Business Email</label>
                <input
                  type="email"
                  required
                  value={form.businessEmail}
                  onChange={(e) => setForm({ ...form, businessEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone</label>
                <input
                  type="tel"
                  required
                  value={form.contactNumber}
                  onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">City</label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Area / Sub-district</label>
              <input
                type="text"
                required
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-all"
            >
              {isUpdating ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

