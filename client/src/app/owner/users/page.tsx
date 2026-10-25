'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import { api } from '../../../lib/api';
import {
  Users,
  Shield,
  ShieldAlert,
  Search,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  UserX,
  Lock,
} from 'lucide-react';

export default function OwnerUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [roleFilter, setRoleFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

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

  const handleRoleChange = async (userId: string, userName: string, targetRole: 'admin' | 'user') => {
    const isPromotion = targetRole === 'admin';
    const confirmMsg = isPromotion
      ? `Are you sure you want to promote ${userName} to Platform Administrator?`
      : `Are you sure you want to demote Administrator ${userName} back to normal user?`;

    if (!confirm(confirmMsg)) return;

    try {
      const res = await api.patch(`/admin/users/${userId}/role`, { role: targetRole });
      if (res.success) {
        setActionSuccessMsg(
          isPromotion
            ? `User ${userName} has been successfully promoted to Platform Admin.`
            : `User ${userName} has been demoted to standard user.`
        );
        loadUsers();
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (err: any) {
      alert(err.message || 'Role change failed');
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: string, userName: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (!confirm(`Are you sure you want to ${newStatus} account for ${userName}?`)) return;

    try {
      const res = await api.patch(`/admin/users/${userId}/status`, { accountStatus: newStatus });
      if (res.success) {
        setActionSuccessMsg(`Account for ${userName} is now ${newStatus}.`);
        loadUsers();
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (err: any) {
      alert(err.message || 'Status toggle failed');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar type="owner" />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                User & Administrative Role Governance
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
                Owner Protected
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Section 3D: Only the Owner can assign or revoke Administrator permissions.
            </p>
          </div>
        </div>

        {actionSuccessMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            {actionSuccessMsg}
          </div>
        )}

        {/* Search & Role Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <form onSubmit={handleSearch} className="relative flex-1 w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by user name or email address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </form>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {['All', 'admin', 'user', 'organization', 'owner'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  roleFilter === r
                    ? 'bg-purple-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading user records...</div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">User Details</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4 text-center">Current Role</th>
                    <th className="py-3 px-4 text-center">Account Status</th>
                    <th className="py-3 px-4">Joined Date</th>
                    <th className="py-3 px-4 text-right">Owner Governance Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => {
                    const isOwner = u.role === 'owner';
                    const isAdmin = u.role === 'admin';
                    const isSuspended = u.accountStatus === 'suspended';

                    return (
                      <tr key={u._id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            {u.profileImage ? (
                              <img
                                src={u.profileImage}
                                alt={u.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-xs">
                                {u.name?.charAt(0)}
                              </div>
                            )}
                            <span className="font-bold text-slate-900">{u.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">{u.email}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                              isOwner
                                ? 'bg-purple-100 text-purple-900 border border-purple-200 font-extrabold'
                                : isAdmin
                                ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                : u.role === 'organization'
                                ? 'bg-teal-100 text-teal-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                              isSuspended
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {u.accountStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {isOwner ? (
                            <span className="text-[10px] font-bold text-slate-400 italic flex items-center justify-end gap-1">
                              <Lock className="w-3 h-3" /> Supreme Owner
                            </span>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              {/* Promote / Demote */}
                              {isAdmin ? (
                                <button
                                  onClick={() => handleRoleChange(u._id, u.name, 'user')}
                                  className="px-2.5 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded text-[11px] font-bold border border-amber-200"
                                >
                                  Demote to User
                                </button>
                              ) : u.role === 'user' ? (
                                <button
                                  onClick={() => handleRoleChange(u._id, u.name, 'admin')}
                                  className="px-2.5 py-1 bg-purple-50 text-purple-800 hover:bg-purple-100 rounded text-[11px] font-bold border border-purple-200"
                                >
                                  Promote to Admin
                                </button>
                              ) : null}

                              {/* Suspend / Reactivate */}
                              <button
                                onClick={() => handleStatusToggle(u._id, u.accountStatus, u.name)}
                                className={`px-2 py-1 rounded text-[11px] font-bold transition-colors ${
                                  isSuspended
                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                }`}
                              >
                                {isSuspended ? 'Reactivate' : 'Suspend'}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

