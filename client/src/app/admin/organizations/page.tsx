'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from '../../../components/Sidebar';
import { VerificationBadge } from '../../../components/VerificationBadge';
import { api } from '../../../lib/api';
import {
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  FileText,
  ArrowRight,
  ShieldAlert,
  X,
  AlertTriangle,
} from 'lucide-react';

function AdminOrganizationsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'verification';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Review Modal State
  const [reviewingOrg, setReviewingOrg] = useState<any>(null);
  const [reviewDecision, setReviewDecision] = useState<'approved' | 'rejected'>('approved');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadOrganizations = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (search.trim()) params.append('search', search.trim());

      const res = await api.get(`/organizations?${params.toString()}`);
      if (res.success && res.data) {
        setOrganizations(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrganizations();
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingOrg) return;
    try {
      setIsSubmittingReview(true);
      const res = await api.patch(`/organizations/${reviewingOrg._id}/verify`, {
        status: reviewDecision,
        rejectionReason: reviewDecision === 'rejected' ? rejectionReason : undefined,
      });

      if (res.success) {
        setSuccessMsg(
          `Organization ${reviewingOrg.name} has been ${reviewDecision.toUpperCase()}.`
        );
        setReviewingOrg(null);
        loadOrganizations();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err: any) {
      alert(err.message || 'Verification update failed');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const pendingCount = organizations.filter((o) => o.verificationStatus === 'pending').length;

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar type="admin" />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Healthcare Facility Verification & Directory
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect submitted trade licenses, verify clinics and hospitals, and explore dedicated facility profiles.
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            {successMsg}
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
          <button
            onClick={() => setActiveTab('verification')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'verification'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Verification Applications
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'directory'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Organization Directory ({organizations.length})
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <form onSubmit={handleSearch} className="relative flex-1 w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by facility name, license #, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </form>

          <div className="flex items-center gap-2">
            {['All', 'pending', 'approved', 'rejected'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  statusFilter === st
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* ================= TAB 1: VERIFICATION APPLICATIONS ================= */}
        {activeTab === 'verification' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center text-xs text-slate-400">Loading applications...</div>
            ) : organizations.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">No organizations found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Facility Name</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">License / Registration #</th>
                      <th className="py-3 px-4">Contact Info</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Verification Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {organizations.map((org) => (
                      <tr key={org._id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <Link
                            href={`/admin/organizations/${org._id}`}
                            className="hover:text-teal-600 underline"
                          >
                            {org.name}
                          </Link>
                          <span className="block text-[10px] text-slate-400 font-normal">
                            Rep: {org.ownerName}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700">{org.type}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-700">{org.licenseNumber}</td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <div>{org.contactNumber}</div>
                          <div className="text-[10px] text-slate-400">{org.businessEmail}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {org.area}, {org.city}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <VerificationBadge status={org.verificationStatus} size="sm" />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setReviewingOrg(org);
                                setReviewDecision('approved');
                                setRejectionReason('');
                              }}
                              className="px-2.5 py-1 rounded bg-blue-900 text-white font-bold text-[11px] hover:bg-blue-800"
                            >
                              Review & Verify
                            </button>
                            <Link
                              href={`/admin/organizations/${org._id}`}
                              className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold"
                              title="Dedicated Profile"
                            >
                              Profile
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: DIRECTORY CARDS ================= */}
        {activeTab === 'directory' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <div
                key={org._id}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between space-y-4 card-hover"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <VerificationBadge status={org.verificationStatus} size="sm" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{org.name}</h3>
                    <p className="text-xs text-teal-600 font-semibold">{org.type}</p>
                  </div>

                  <div className="space-y-1 text-xs text-slate-500 border-t border-slate-100 pt-3">
                    <p>
                      License:{' '}
                      <span className="font-mono text-slate-800 font-semibold">{org.licenseNumber}</span>
                    </p>
                    <p>Contact: {org.contactNumber}</p>
                    <p>
                      Location: {org.area}, {org.city}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <Link
                    href={`/admin/organizations/${org._id}`}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-blue-900 hover:text-white text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Inspect Dedicated Profile & History</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= MODAL: REVIEW VERIFICATION ================= */}
        {reviewingOrg && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Verify Facility: {reviewingOrg.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Type: {reviewingOrg.type} • Rep: {reviewingOrg.ownerName}
                  </p>
                </div>
                <button onClick={() => setReviewingOrg(null)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* License Details Review */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">License Number:</span>
                  <span className="font-mono font-bold text-slate-900">{reviewingOrg.licenseNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location Address:</span>
                  <span className="text-slate-900">
                    {reviewingOrg.address}, {reviewingOrg.city}
                  </span>
                </div>
                {reviewingOrg.additionalNotes && (
                  <div className="pt-1 text-[11px] text-slate-600 italic">
                    Note: "{reviewingOrg.additionalNotes}"
                  </div>
                )}
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-2">Compliance Decision</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setReviewDecision('approved')}
                      className={`p-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                        reviewDecision === 'approved'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Approve Organization
                    </button>

                    <button
                      type="button"
                      onClick={() => setReviewDecision('rejected')}
                      className={`p-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                        reviewDecision === 'rejected'
                          ? 'border-rose-600 bg-rose-50 text-rose-800 ring-1 ring-rose-500'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <XCircle className="w-4 h-4 text-rose-600" />
                      Reject Application
                    </button>
                  </div>
                </div>

                {reviewDecision === 'rejected' && (
                  <div>
                    <label className="font-bold text-rose-700 block mb-1">
                      Reason for Rejection (Required)
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="e.g. Expired DGDA trade license or illegible document scan..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-rose-200 text-xs"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className={`w-full py-3 rounded-xl text-white font-bold text-xs shadow-md transition-all ${
                    reviewDecision === 'approved'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  {isSubmittingReview ? 'Processing...' : `Confirm ${reviewDecision.toUpperCase()}`}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminOrganizationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4rem)]">
          <Sidebar type="admin" />
          <div className="flex-1 p-12 text-center text-xs text-slate-400">Loading organizations...</div>
        </div>
      }
    >
      <AdminOrganizationsContent />
    </Suspense>
  );
}
