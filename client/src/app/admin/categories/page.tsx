'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import { api } from '../../../lib/api';
import { Layers, PlusCircle, CheckCircle, Edit, Trash2, X } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catIcon, setCatIcon] = useState('Pill');
  const [successMsg, setSuccessMsg] = useState('');

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/categories/all');
      if (res.success) setCategories(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCat(null);
    setCatName('');
    setCatDesc('');
    setCatIcon('Pill');
    setShowModal(true);
  };

  const openEditModal = (c: any) => {
    setEditingCat(c);
    setCatName(c.name);
    setCatDesc(c.description || '');
    setCatIcon(c.icon || 'Pill');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCat) {
        const res = await api.put(`/categories/${editingCat._id}`, {
          name: catName,
          description: catDesc,
          icon: catIcon,
        });
        if (res.success) {
          setSuccessMsg('Category updated successfully');
        }
      } else {
        const res = await api.post('/categories', {
          name: catName,
          description: catDesc,
          icon: catIcon,
        });
        if (res.success) {
          setSuccessMsg('New category added to catalog');
        }
      }
      setShowModal(false);
      loadCategories();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const res = await api.delete(`/categories/${id}`);
      if (res.success) {
        loadCategories();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar type="admin" />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Medical Categories Manager
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Add or edit pharmaceutical categories without modifying application source code.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Add Category
          </button>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            {successMsg}
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading categories...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Category Name</th>
                    <th className="py-3 px-4">Slug Identifier</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categories.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                          <Layers className="w-4 h-4" />
                        </div>
                        {c.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">{c.slug}</td>
                      <td className="py-3 px-4 text-slate-600 max-w-sm truncate">{c.description || 'N/A'}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {c.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-1.5 text-slate-500 hover:text-blue-900 rounded"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggle(c._id)}
                            className="px-2 py-1 text-[10px] font-bold rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                          >
                            {c.isActive ? 'Deactivate' : 'Activate'}
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

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">
                  {editingCat ? 'Edit Category' : 'Create New Medical Category'}
                </h3>
                <button onClick={() => setShowModal(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Oncology & Chemotherapy Supplies"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-all"
                >
                  Save Category
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

