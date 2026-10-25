'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '../../../components/Sidebar';
import { api } from '../../../lib/api';
import {
  Users,
  Building2,
  ClipboardList,
  TrendingUp,
  Settings,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export default function OwnerDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 156,
    totalOrganizations: 42,
    totalOrders: 348,
    platformRevenue: 86420,
  });

  const chartData = [
    { date: 'Apr 18', orders: 28, revenue: 11400 },
    { date: 'Apr 19', orders: 42, revenue: 16800 },
    { date: 'Apr 20', orders: 35, revenue: 14200 },
    { date: 'Apr 21', orders: 58, revenue: 23600 },
    { date: 'Apr 22', orders: 48, revenue: 19400 },
    { date: 'Apr 23', orders: 64, revenue: 26800 },
    { date: 'Apr 24', orders: 73, revenue: 29500 },
  ];

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const [repRes, userRes] = await Promise.all([
          api.get('/admin/reports/summary'),
          api.get('/admin/users'),
        ]);

        if (repRes.success && repRes.kpis) {
          setStats((prev) => ({
            ...prev,
            totalOrganizations: repRes.kpis.totalOrganizations || 42,
            totalOrders: repRes.kpis.totalOrders || 348,
            platformRevenue: repRes.kpis.totalRevenue || 86420,
          }));
        }

        if (userRes.success && userRes.count) {
          setStats((prev) => ({
            ...prev,
            totalUsers: userRes.count || 156,
          }));
        }
      } catch (err) {
        console.error('Failed to load owner overview:', err);
      }
    };

    loadOverview();
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar type="owner" />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-6xl">
        {/* Header matching template Screen 7 */}
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Owner Dashboard
          </h1>
          <p className="text-xs text-slate-500">Platform governance, revenue, and administrator control</p>
        </div>

        {/* 4 Stat KPI Cards matching template Screen 7 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Card 1: Total Users */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Users</span>
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.totalUsers}</div>
            <p className="text-[11px] font-medium text-emerald-600">+12 this week</p>
          </div>

          {/* Card 2: Total Organizations */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Organizations</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.totalOrganizations}</div>
            <p className="text-[11px] font-medium text-emerald-600">+5 this week</p>
          </div>

          {/* Card 3: Total Orders */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Orders</span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                <ClipboardList className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.totalOrders}</div>
            <p className="text-[11px] font-medium text-emerald-600">+18% this month</p>
          </div>

          {/* Card 4: Platform Revenue */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Platform Revenue</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">৳ {stats.platformRevenue.toLocaleString()}</div>
            <p className="text-[11px] font-medium text-emerald-600">+24% this month</p>
          </div>
        </div>

        {/* Quick Actions Bar matching template Screen 7 */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/owner/users"
              className="p-3.5 bg-white rounded-xl border border-slate-200/90 hover:border-teal-300 hover:shadow-xs transition-all flex items-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
                Manage Users
              </span>
            </Link>

            <Link
              href="/owner/users?tab=admins"
              className="p-3.5 bg-white rounded-xl border border-slate-200/90 hover:border-blue-300 hover:shadow-xs transition-all flex items-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                Manage Admins
              </span>
            </Link>

            <Link
              href="/admin/orders"
              className="p-3.5 bg-white rounded-xl border border-slate-200/90 hover:border-purple-300 hover:shadow-xs transition-all flex items-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ClipboardList className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-purple-700 transition-colors">
                View All Orders
              </span>
            </Link>

            <Link
              href="/owner/users"
              className="p-3.5 bg-white rounded-xl border border-slate-200/90 hover:border-slate-400 hover:shadow-xs transition-all flex items-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Settings className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-slate-900 transition-colors">
                System Settings
              </span>
            </Link>
          </div>
        </div>

        {/* Platform Statistics Chart matching template Screen 7 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Platform Statistics</h2>
              <p className="text-[11px] text-slate-500">Orders & Revenue Trend • Last 7 Days</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-600 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" />
                Orders
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                Revenue
              </span>
            </div>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ownerColorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#ownerColorOrders)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
