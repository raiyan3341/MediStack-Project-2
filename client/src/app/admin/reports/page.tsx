'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import { api } from '../../../lib/api';
import {
  BarChart3,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  Package,
  Building2,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function AdminReportsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/admin/reports/summary');
        if (res.success) setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('medistock_token') : '';
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/reports/export-csv`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medistock-orders-report-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Failed to export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const PIE_COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#ef4444'];

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar type="admin" />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Platform Analytics & Financial Reports
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive hospital restocking metrics, fulfillment status breakdown, and CSV audit reports.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isExporting ? 'Generating CSV...' : 'Download Orders CSV Report'}</span>
          </button>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600">
              Total Order Volume
            </span>
            <div className="text-3xl font-black text-slate-900 font-mono">
              ${(kpis.totalRevenue || 0).toLocaleString()}
            </div>
            <p className="text-xs text-slate-500">Gross pharmaceutical supply orders</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              Total Supply Orders
            </span>
            <div className="text-3xl font-black text-slate-900">{kpis.totalOrders || 0}</div>
            <p className="text-xs text-slate-500">
              Completed deliveries: <span className="font-bold text-emerald-600">{kpis.deliveredOrders || 0}</span>
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
              Verified Healthcare Facilities
            </span>
            <div className="text-3xl font-black text-slate-900">{kpis.approvedOrgs || 0}</div>
            <p className="text-xs text-slate-500">Hospitals, Clinics, & Pharmacies</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
              Depot Stock Alert Count
            </span>
            <div className="text-3xl font-black text-amber-600">{kpis.lowStockProducts || 0}</div>
            <p className="text-xs text-slate-500">Below critical reorder levels</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Procurement Volume */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Procurement Volume by Month ($)</h3>
            <div className="h-72 w-full">
              {charts.monthlyTrends ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.monthlyTrends}>
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      formatter={(val: any) => [`$${val.toLocaleString()}`, 'Volume']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="volume" fill="#0d9488" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Loading chart...
                </div>
              )}
            </div>
          </div>

          {/* Order Status Breakdown */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Fulfillment Status Breakdown</h3>
            <div className="h-72 w-full">
              {charts.orderStatusBreakdown ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.orderStatusBreakdown}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      label={({ name, count }) => `${name}: ${count}`}
                      fontSize={11}
                    >
                      {charts.orderStatusBreakdown.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.fill || PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Loading chart...
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

