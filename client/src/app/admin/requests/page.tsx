'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import { api } from '../../../lib/api';
import { FileQuestion, CheckCircle2, XCircle, Clock, Check, X, ArrowRight } from 'lucide-react';

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Review Modal State
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [status, setStatus] = useState<string>('approved');
  const [adminResponse, setAdminResponse] = useState('');
  const [createCatalog, setCreateCatalog] = useState(false);
  const [productDetails, setProductDetails] = useState({
    name: '',
    sku: '',
    category: 'Tablets and Capsules',
    price: 50,
    stock: 100,
    unit: 'Box',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.append('status', statusFilter);
      const res = await api.get(`/requests?${params.toString()}`);
      if (res.success && res.data) {
        setRequests(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const openReviewModal = (r: any) => {
    setSelectedReq(r);
    setStatus(r.status === 'pending' ? 'under_review' : r.status);
    setAdminResponse(r.adminResponse || '');
    setCreateCatalog(false);
    setProductDetails({
      name: r.itemName,
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      category: r.category || 'Tablets and Capsules',
      price: 50,
      stock: r.expectedQuantity || 100,
      unit: 'Box',
    });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;
    try {
      setIsSubmitting(true);
      const res = await api.patch(`/requests/${selectedReq._id}/review`, {
        status,
        adminResponse,
        createCatalogProduct: createCatalog,
        productDetails: createCatalog ? productDetails : undefined,
      });

      if (res.success) {
        setSuccessMsg(`Request for "${selectedReq.itemName}" has been updated.`);
        setSelectedReq(null);
        loadRequests();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err: any) {
      alert(err.message || 'Review failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar type="admin" />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Hospital & Pharmacy Product Demand Requests
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review custom requests, understand clinic market demand, and convert approved requests into catalog items.
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {successMsg}
          </div>
        )}

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">Filter Requests:</span>
          <div className="flex items-center gap-2">
            {['All', 'pending', 'under_review', 'approved', 'rejected', 'fulfilled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  statusFilter === st
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">No requests found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Requested Item</th>
                    <th className="py-3 px-4">Requesting Organization</th>
                    <th className="py-3 px-4 text-center">Expected Qty</th>
                    <th className="py-3 px-4">Urgency</th>
                    <th className="py-3 px-4">Clinical Explanation</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {r.itemName}
                        <span className="block text-[10px] text-slate-400 font-normal">{r.category}</span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">{r.organizationName}</td>
                      <td className="py-3.5 px-4 text-center font-bold font-mono">{r.expectedQuantity}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            r.urgency === 'high'
                              ? 'bg-rose-100 text-rose-800'
                              : r.urgency === 'medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {r.urgency}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{r.explanation}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                            r.status === 'fulfilled' || r.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : r.status === 'under_review'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {r.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => openReviewModal(r)}
                          className="px-3 py-1 bg-blue-900 text-white rounded-lg text-xs font-bold hover:bg-blue-800"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Review Demand Request */}
        {selectedReq && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">
                  Review Demand Request: {selectedReq.itemName}
                </h3>
                <button onClick={() => setSelectedReq(null)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs space-y-1">
                <p>
                  Requested by: <span className="font-bold text-slate-900">{selectedReq.organizationName}</span>
                </p>
                <p className="text-slate-600 italic">"{selectedReq.explanation}"</p>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Set Review Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-white"
                  >
                    <option value="under_review">Under Review (Checking with suppliers)</option>
                    <option value="approved">Approved</option>
                    <option value="fulfilled">Fulfilled (Procured & Available)</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Response Note to Requesting Facility
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Procured from approved distributor; stock added to catalog."
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                {status === 'approved' && (
                  <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl space-y-2">
                    <label className="flex items-center gap-2 font-bold text-teal-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={createCatalog}
                        onChange={(e) => setCreateCatalog(e.target.checked)}
                        className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                      />
                      Automatically Convert into Catalog Product (Section 3C)
                    </label>

                    {createCatalog && (
                      <div className="space-y-2 pt-2 border-t border-teal-200/60">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-teal-900 block">Price ($)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={productDetails.price}
                              onChange={(e) =>
                                setProductDetails({
                                  ...productDetails,
                                  price: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-full px-2 py-1 bg-white rounded border border-teal-300 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-teal-900 block">Stock Qty</label>
                            <input
                              type="number"
                              value={productDetails.stock}
                              onChange={(e) =>
                                setProductDetails({
                                  ...productDetails,
                                  stock: parseInt(e.target.value) || 0,
                                })
                              }
                              className="w-full px-2 py-1 bg-white rounded border border-teal-300 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-all"
                >
                  {isSubmitting ? 'Submitting...' : 'Save Review Decision'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

