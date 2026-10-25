'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '../../../components/Sidebar';
import { InvoiceModal } from '../../../components/InvoiceModal';
import { api } from '../../../lib/api';
import {
  ClipboardList,
  Search,
  FileText,
  CheckCircle,
  Truck,
  XCircle,
  Clock,
  Filter,
  X,
  AlertCircle,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Status update modal
  const [updatingOrder, setUpdatingOrder] = useState<any>(null);
  const [newStatus, setNewStatus] = useState<string>('confirmed');
  const [statusNote, setStatusNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Invoice viewer modal
  const [invoiceOrder, setInvoiceOrder] = useState<any>(null);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (typeFilter !== 'All') params.append('organizationType', typeFilter);
      if (search.trim()) params.append('search', search.trim());

      const res = await api.get(`/orders?${params.toString()}`);
      if (res.success && res.data) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, typeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders();
  };

  const openStatusModal = (ord: any) => {
    setUpdatingOrder(ord);
    setNewStatus(ord.status);
    setStatusNote('');
    setRejectionReason('');
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingOrder) return;
    try {
      setIsUpdatingStatus(true);
      const res = await api.patch(`/orders/${updatingOrder._id}/status`, {
        status: newStatus,
        note: statusNote,
        rejectionReason: newStatus === 'cancelled' ? rejectionReason : undefined,
      });

      if (res.success) {
        setSuccessMsg(`Order ${updatingOrder.orderNumber} updated to ${newStatus.toUpperCase()}`);
        setUpdatingOrder(null);
        loadOrders();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar type="admin" />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Platform Supply Orders Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Confirm incoming clinic restocking requisitions, manage warehouse dispatch, and view audit timelines.
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            {successMsg}
          </div>
        )}

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <form onSubmit={handleSearch} className="relative flex-1 w-full md:w-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order #, Facility Name, or Invoice #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </form>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="py-1.5 px-3 rounded-lg border border-slate-200 text-xs font-medium bg-slate-50"
            >
              <option value="All">All Types</option>
              <option value="Hospital">Hospitals</option>
              <option value="Pharmacy">Pharmacies</option>
              <option value="Clinic">Clinics</option>
            </select>

            {['All', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(
              (st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize whitespace-nowrap transition-all ${
                    statusFilter === st
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              )
            )}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading incoming orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <ClipboardList className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No orders match filter</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Order Ref</th>
                    <th className="py-3 px-4">Ordering Facility</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Items Ordered</th>
                    <th className="py-3 px-4 text-right">Order Total</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((o) => (
                    <tr key={o._id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 block">{o.orderNumber}</span>
                        <span className="text-[10px] font-mono text-slate-400">{o.invoiceNumber}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/admin/organizations/${o.organizationId?._id || o.organizationId}`}
                          className="font-bold text-slate-900 hover:text-teal-600 underline"
                        >
                          {o.organizationName}
                        </Link>
                        <span className="block text-[10px] text-slate-500">{o.city}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{o.organizationType}</td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {o.items?.length || 0} product line(s)
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        ${o.totalAmount?.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            o.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.status === 'shipped'
                              ? 'bg-cyan-100 text-cyan-800'
                              : o.status === 'processing'
                              ? 'bg-purple-100 text-purple-800'
                              : o.status === 'confirmed'
                              ? 'bg-blue-100 text-blue-800'
                              : o.status === 'cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openStatusModal(o)}
                            className="px-2.5 py-1 bg-blue-900 text-white rounded text-[11px] font-bold hover:bg-blue-800"
                          >
                            Update Status
                          </button>
                          <button
                            onClick={() => setInvoiceOrder(o)}
                            className="p-1 text-slate-500 hover:text-teal-700 bg-slate-100 hover:bg-teal-50 rounded"
                            title="Print / View Invoice"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Update Order Status */}
        {updatingOrder && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">
                  Update Status for {updatingOrder.orderNumber}
                </h3>
                <button onClick={() => setUpdatingOrder(null)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleStatusSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Select Next Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-white"
                  >
                    <option value="pending">Pending (Under Initial Review)</option>
                    <option value="confirmed">Confirmed (Inventory Reserved)</option>
                    <option value="processing">Processing (Cold-chain Packaging)</option>
                    <option value="shipped">Shipped (Dispatched to Logistics)</option>
                    <option value="delivered">Delivered (Received by Facility)</option>
                    <option value="cancelled">Cancelled (Restore Stock to Depot)</option>
                  </select>
                </div>

                {newStatus === 'cancelled' && (
                  <div>
                    <label className="font-bold text-rose-700 block mb-1">
                      Cancellation Reason (Required)
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="e.g. Stock recalled, facility requested cancellation..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-rose-200 text-xs"
                    />
                  </div>
                )}

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Audit Note / Delivery Details (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Shipment container #MED-902 handed to logistics courier..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="w-full py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-all"
                >
                  {isUpdatingStatus ? 'Updating...' : 'Confirm Status Transition'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Invoice Modal */}
        <InvoiceModal
          isOpen={!!invoiceOrder}
          onClose={() => setInvoiceOrder(null)}
          order={invoiceOrder}
        />
      </main>
    </div>
  );
}

