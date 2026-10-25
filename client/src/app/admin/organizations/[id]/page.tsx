'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Sidebar } from '../../../../components/Sidebar';
import { VerificationBadge } from '../../../../components/VerificationBadge';
import { InvoiceModal } from '../../../../components/InvoiceModal';
import { api } from '../../../../lib/api';
import {
  Building2,
  ArrowLeft,
  ClipboardList,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  Package,
  Star,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export default function DedicatedOrganizationProfilePage() {
  const { id } = useParams();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any>(null);

  useEffect(() => {
    const fetchOrgDetail = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/organizations/${id}`);
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load organization profile', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchOrgDetail();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)]">
        <Sidebar type="admin" />
        <div className="flex-1 p-12 text-center text-xs text-slate-400">Loading organization records...</div>
      </div>
    );
  }

  if (!data || !data.organization) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)]">
        <Sidebar type="admin" />
        <div className="flex-1 p-12 text-center space-y-3">
          <p className="text-sm font-bold text-slate-800">Organization profile not found</p>
          <Link href="/admin/organizations" className="text-xs text-teal-600 font-bold underline">
            Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  const { organization: org, analytics, orders } = data;

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar type="admin" />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl">
        {/* Navigation Breadcrumb */}
        <div>
          <button
            onClick={() => router.push('/admin/organizations')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Organizations Directory
          </button>
        </div>

        {/* Dedicated Organization Profile Header (Section 5) */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-2xl shrink-0">
              <Building2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-slate-900">{org.name}</h1>
                <VerificationBadge status={org.verificationStatus} />
              </div>
              <p className="text-xs text-teal-700 font-semibold">
                Facility Classification: <span className="uppercase">{org.type}</span>
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                <span>
                  License:{' '}
                  <span className="font-mono text-slate-800 font-bold">{org.licenseNumber}</span>
                </span>
                <span>• Contact: {org.contactNumber}</span>
                <span>• Email: {org.businessEmail}</span>
                <span>
                  • Address: {org.address}, {org.city}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Organization-Wise KPI Metrics (Section 5) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Restock Orders
            </span>
            <div className="text-2xl font-black text-slate-900">{analytics.totalOrders || 0}</div>
            <p className="text-[11px] text-slate-500">All recorded orders</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
              Pending Orders
            </span>
            <div className="text-2xl font-black text-amber-600">{analytics.pendingOrders || 0}</div>
            <p className="text-[11px] text-slate-500">Awaiting processing</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
              Completed Deliveries
            </span>
            <div className="text-2xl font-black text-emerald-700">
              {analytics.completedOrders || 0}
            </div>
            <p className="text-[11px] text-slate-500">Delivered successfully</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600">
              Total Facility Spend
            </span>
            <div className="text-2xl font-black text-teal-700 font-mono">
              ${(analytics.totalSpent || 0).toFixed(2)}
            </div>
            <p className="text-[11px] text-slate-500">Net order value</p>
          </div>
        </div>

        {/* Most Frequently Ordered Products by this Facility (Section 5) */}
        {analytics.topOrderedProducts && analytics.topOrderedProducts.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <h2 className="text-sm font-bold text-slate-900">
                Most Frequently Ordered Products by {org.name}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {analytics.topOrderedProducts.map((item: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 block">{item.sku}</span>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{item.name}</h4>
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="font-bold text-teal-700">{item.count} units</span>
                    <span className="font-mono text-slate-600 font-semibold">
                      ${item.totalSpent?.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Complete Historical Order List for this Specific Organization (Section 5) */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Complete Historical Order List ({orders?.length || 0})
              </h3>
              <p className="text-xs text-slate-500">
                Items ordered, quantities, dates, prices, status history, and tax invoices.
              </p>
            </div>
          </div>

          {orders?.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No orders have been submitted by this facility yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {orders.map((ord: any) => (
                <div key={ord._id} className="p-6 space-y-4 hover:bg-slate-50/40 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-slate-900">
                        {ord.orderNumber}
                      </span>
                      <span className="font-mono text-xs text-slate-400">
                        ({ord.invoiceNumber})
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          ord.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'shipped'
                            ? 'bg-cyan-100 text-cyan-800'
                            : ord.status === 'processing'
                            ? 'bg-purple-100 text-purple-800'
                            : ord.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : ord.status === 'cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">
                        Date: {new Date(ord.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-sm font-black font-mono text-slate-900">
                        ${ord.totalAmount?.toFixed(2)}
                      </span>
                      <button
                        onClick={() => setSelectedInvoiceOrder(ord)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold hover:bg-teal-100 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Print Invoice</span>
                      </button>
                    </div>
                  </div>

                  {/* Line Items Snapshot */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="text-slate-400 uppercase text-[9px] font-bold border-b border-slate-200/60 pb-1">
                          <th className="pb-1.5 px-2">Item Name</th>
                          <th className="pb-1.5 px-2">SKU</th>
                          <th className="pb-1.5 px-2 text-center">Unit</th>
                          <th className="pb-1.5 px-2 text-right">Unit Price</th>
                          <th className="pb-1.5 px-2 text-center">Quantity</th>
                          <th className="pb-1.5 px-2 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {ord.items?.map((item: any, i: number) => (
                          <tr key={i}>
                            <td className="py-1.5 px-2 font-semibold text-slate-800">{item.name}</td>
                            <td className="py-1.5 px-2 font-mono text-slate-400">{item.sku}</td>
                            <td className="py-1.5 px-2 text-center text-slate-500">{item.unit}</td>
                            <td className="py-1.5 px-2 text-right font-mono text-slate-600">
                              ${item.unitPrice?.toFixed(2)}
                            </td>
                            <td className="py-1.5 px-2 text-center font-bold text-slate-900">
                              {item.quantity}
                            </td>
                            <td className="py-1.5 px-2 text-right font-bold text-slate-900 font-mono">
                              ${item.subtotal?.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invoice Modal */}
        <InvoiceModal
          isOpen={!!selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
          order={selectedInvoiceOrder}
        />
      </main>
    </div>
  );
}

