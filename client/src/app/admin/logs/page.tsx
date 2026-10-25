'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import { api } from '../../../lib/api';
import { History, Shield, Clock, Search, Filter } from 'lucide-react';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [entityFilter, setEntityFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (entityFilter !== 'All') params.append('entityType', entityFilter);
      if (search.trim()) params.append('action', search.trim());
      const res = await api.get(`/admin/activity-logs?${params.toString()}`);
      if (res.success && res.data) {
        setLogs(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [entityFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadLogs();
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar type="admin" />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Platform Audit & Activity Trail
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Immutable ledger of administrative actions, stock changes, verification reviews, and role modifications.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <form onSubmit={handleSearch} className="relative flex-1 w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by action name (e.g. ORDER_PLACED, ORG_APPROVED)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </form>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {['All', 'Order', 'Product', 'Organization', 'User', 'System'].map((type) => (
              <button
                key={type}
                onClick={() => setEntityFilter(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  entityFilter === type
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading audit log records...</div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">No activity logs recorded.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Action Code</th>
                    <th className="py-3 px-4">Target Entity</th>
                    <th className="py-3 px-4">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800 font-sans">
                        {log.actorName}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {log.actorRole}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-blue-900">{log.action}</td>
                      <td className="py-3 px-4 text-teal-700 font-bold">{log.entityType}</td>
                      <td className="py-3 px-4 text-slate-700 font-sans">{log.description}</td>
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

