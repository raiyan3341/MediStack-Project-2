'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import { api } from '../../../lib/api';
import { PlusCircle, FileQuestion, CheckCircle2, Clock, MessageSquare, AlertCircle } from 'lucide-react';

export default function OrganizationRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('General Medical Supply');
  const [expectedQuantity, setExpectedQuantity] = useState(50);
  const [urgency, setUrgency] = useState('medium');
  const [explanation, setExplanation] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/requests/my');
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
    fetchRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      const res = await api.post('/requests', {
        itemName,
        category,
        expectedQuantity,
        urgency,
        explanation,
      });

      if (res.success) {
        setSuccessMsg('Product demand request submitted! Our procurement team will review it.');
        setItemName('');
        setExplanation('');
        fetchRequests();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar type="organization" />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Product Demand Suggestions & Special Requests
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            If a medicine, vaccine, or specialized surgical supply is missing from our catalog, submit a demand request below.
          </p>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Submission Form */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4 h-fit">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Submit New Item Request
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Item / Generic Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Remdesivir 100mg Injection"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Estimated Clinical Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Estimated Units</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={expectedQuantity}
                    onChange={(e) => setExpectedQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Clinical Urgency</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium"
                  >
                    <option value="low">Low (Next Month)</option>
                    <option value="medium">Medium (Standard)</option>
                    <option value="high">High (Urgent Need)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Reason & Clinical Usage
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain why this medicine is needed (e.g. seasonal outbreak, surgical shortage)..."
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                {isSubmitting ? 'Submitting...' : 'Submit Demand Request'}
              </button>
            </form>
          </div>

          {/* List of Requests */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Your Submitted Requests ({requests.length})
              </span>
            </div>

            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading requests...</div>
            ) : requests.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <FileQuestion className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">No requests submitted yet</h3>
                <p className="text-xs text-slate-500">
                  Submit a request on the left whenever an item is missing from our catalog.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {requests.map((r) => (
                  <div key={r._id} className="p-5 space-y-2 hover:bg-slate-50/50">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{r.itemName}</h4>
                        <p className="text-xs text-slate-500">
                          {r.category} • Expected: <span className="font-bold text-slate-700">{r.expectedQuantity} units</span>
                        </p>
                      </div>

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
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      "{r.explanation}"
                    </p>

                    {r.adminResponse && (
                      <div className="text-xs text-teal-800 bg-teal-50/80 p-2.5 rounded-xl border border-teal-200 flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Procurement Admin Response:</span> {r.adminResponse}
                        </div>
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400">
                      Submitted on: {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

