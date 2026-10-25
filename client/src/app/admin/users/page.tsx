'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import { api } from '../../../lib/api';
import { Users, Search, Shield, User } from 'lucide-react';

export default function AdminUsersDirectoryPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [roleFilter, setRoleFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (roleFilter !== 'All') params.append('role', roleFilter);
      if (search.trim()) params.append('search', search.trim());
      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar type="admin" />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Users & Accounts Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Overview of all registered users, organization accounts, and administrative staff.
          </p>
        </div>

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <form onSubmit={handleSearch} className="relative flex-1 w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </form>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {['All', 'admin', 'organization', 'user', 'owner'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  roleFilter === r
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading directory...</div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Account Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4 text-center">Platform Role</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                        {u.profileImage ? (
                          <img
                            src={u.profileImage}
                            alt={u.name}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-xs">
                            {u.name?.charAt(0)}
                          </div>
                        )}
                        {u.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{u.email}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            u.role === 'owner'
                              ? 'bg-purple-100 text-purple-900'
                              : u.role === 'admin'
                              ? 'bg-blue-100 text-blue-900'
                              : u.role === 'organization'
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            u.accountStatus === 'suspended'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {u.accountStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString()}
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

