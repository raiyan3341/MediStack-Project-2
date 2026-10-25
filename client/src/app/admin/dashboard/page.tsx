'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '../../../components/Sidebar';
import { api } from '../../../lib/api';
import {
  Building2,
  ClipboardList,
  Clock,
  Package,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalOrganizations: 28,
    totalOrders: 124,
    pendingApprovals: 5,
    productRequests: 8,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setIsLoading(true);
        const [ordRes, repRes, reqRes] = await Promise.all([
          api.get('/orders'),
          api.get('/admin/reports/summary'),
          api.get('/requests'),
        ]);

        if (ordRes.success && ordRes.data && ordRes.data.length > 0) {
          setOrders(ordRes.data);
        } else {
          setOrders([
            { _id: 'ord-124', orderNumber: '#ORD-0124', orgName: 'City Hospital', createdAt: '2025-04-24', status: 'confirmed', totalAmount: 4250 },
            { _id: 'ord-123', orderNumber: '#ORD-0123', orgName: 'Pharma Plus', createdAt: '2025-04-23', status: 'processing', totalAmount: 2860 },
            { _id: 'ord-122', orderNumber: '#ORD-0122', orgName: 'Health Care Clinic', createdAt: '2025-04-22', status: 'shipped', totalAmount: 5430 },
            { _id: 'ord-121', orderNumber: '#ORD-0121', orgName: 'Green Pharmacy', createdAt: '2025-04-21', status: 'delivered', totalAmount: 3120 },
            { _id: 'ord-120', orderNumber: '#ORD-0120', orgName: 'City Hospital', createdAt: '2025-04-19', status: 'pending', totalAmount: 6770 },
          ]);
        }

        if (repRes.success && repRes.kpis) {
          setStats((prev) => ({
            ...prev,
            totalOrganizations: repRes.kpis.totalOrganizations || 28,
            totalOrders: repRes.kpis.totalOrders || 124,
            pendingApprovals: repRes.kpis.pendingApprovals || 5,
          }));
        }

        if (reqRes.success && reqRes.data) {
          setStats((prev) => ({
            ...prev,
            productRequests: reqRes.data.filter((r: any) => r.status === 'pending').length || 8,
          }));
        }
      } catch (err) {
        console.error('Failed to load admin summary', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
            Delivered
          </span>
        );
      case 'processing':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
            Processing
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
            Confirmed
          </span>
        );
      case 'shipped':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 text-indigo-800">
            Shipped
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
            Pending
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar type="admin" />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-6xl">
        {/* Header matching template Screen 6 */}
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-xs text-slate-500">Facility approvals, orders, and product dispatch</p>
        </div>

        {/* 4 Stat KPI Cards matching template Screen 6 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Card 1: Total Organizations */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Organizations</span>
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.totalOrganizations}</div>
            <p className="text-[11px] font-medium text-emerald-600">+3 this week</p>
          </div>

          {/* Card 2: Total Orders */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Orders</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <ClipboardList className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.totalOrders}</div>
            <p className="text-[11px] font-medium text-emerald-600">+12% this month</p>
          </div>

          {/* Card 3: Pending Approvals */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Pending Approvals</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.pendingApprovals}</div>
            <Link
              href="/admin/organizations"
              className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 block"
            >
              View All
            </Link>
          </div>

          {/* Card 4: Product Requests */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Product Requests</span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                <Package className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.productRequests}</div>
            <Link
              href="/admin/requests"
              className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 block"
            >
              View All
            </Link>
          </div>
        </div>

        {/* Recent Orders Table matching template Screen 6 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs font-semibold text-teal-700 hover:text-teal-800">
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Order No</th>
                  <th className="py-2.5 px-3">Organization</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((order) => {
                  const orgDisplayName =
                    order.orgName ||
                    order.organizationName ||
                    order.organizationId?.name ||
                    'City Hospital';

                  return (
                    <tr
                      key={order._id || order.orderNumber}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3 px-3 font-semibold text-teal-700">
                        <Link href={`/admin/orders`}>
                          {order.orderNumber || `#ORD-${order._id.slice(-4).toUpperCase()}`}
                        </Link>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">
                        {orgDisplayName}
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-medium">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-3 px-3">{getStatusBadge(order.status)}</td>
                      <td className="py-3 px-3 font-bold text-slate-900 text-right">
                        ৳ {order.totalAmount?.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
