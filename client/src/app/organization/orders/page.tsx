'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '../../../components/Sidebar';
import { api } from '../../../lib/api';
import { ClipboardList, Search, FileText, ArrowRight, Filter } from 'lucide-react';

export default function OrganizationOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (search.trim()) params.append('search', search.trim());

      const res = await api.get(`/orders/my-orders?${params.toString()}`);
      if (res.success && res.data) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar type="organization" />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Organization Order History & Invoices
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review current and past pharmaceutical shipments, fulfillment timelines, and official invoices.
            </p>
          </div>

          <Link
            href="/organization/catalog"
            className="px-4 py-2 rounded-xl bg-teal-700 text-white font-bold text-xs hover:bg-teal-800 transition-colors shadow-xs self-start sm:self-auto"
          >
            + New Restock Order
          </Link>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <form onSubmit={handleSearch} className="relative flex-1 w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order # or Invoice #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </form>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['All', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(
              (st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-teal-700 text-white shadow-xs'
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
            <div className="p-12 text-center text-xs text-slate-400">Loading order records...</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <ClipboardList className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No orders found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No orders match your current filter settings.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Order Number</th>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Order Date</th>
                    <th className="py-3 px-4">Items Summary</th>
                    <th className="py-3 px-4 text-right">Total Amount</th>
                    <th className="py-3 px-4">Current Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((o) => (
                    <tr key={o._id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {o.orderNumber}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">{o.invoiceNumber}</td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {o.items?.length || 0} product(s) ordered
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        ৳ {o.totalAmount?.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
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
                        <Link
                          href={`/organization/orders/${o._id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 font-bold text-xs transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Invoice</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

