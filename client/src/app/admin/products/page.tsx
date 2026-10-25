'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from '../../../components/Sidebar';
import { api } from '../../../lib/api';
import {
  Package,
  PlusCircle,
  AlertTriangle,
  Calendar,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  X,
  ShieldAlert,
  Layers,
  ArrowRight,
} from 'lucide-react';

function AdminProductsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'products';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Add/Edit Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    category: 'Cold, Cough and Fever Medicines',
    manufacturer: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
    unit: 'Box',
    price: 50,
    stock: 100,
    lowStockThreshold: 20,
    prescriptionRequired: false,
    batchNumber: '',
    expiryDate: '',
  });

  // Add Batch Modal State
  const [batchModalProduct, setBatchModalProduct] = useState<any>(null);
  const [batchForm, setBatchForm] = useState({
    batchNumber: '',
    quantity: 50,
    manufacturingDate: '',
    expiryDate: '',
    notes: '',
  });

  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [prodRes, catRes, alertRes] = await Promise.all([
        api.get('/products?limit=100'),
        api.get('/categories'),
        api.get('/products/inventory/alerts'),
      ]);

      if (prodRes.success) setProducts(prodRes.data || []);
      if (catRes.success) setCategories(catRes.data || []);
      if (alertRes.success) setAlerts(alertRes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      category: categories[0]?.name || 'Cold, Cough and Fever Medicines',
      manufacturer: 'Square Pharmaceuticals PLC',
      description: '',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
      unit: 'Box (10x10)',
      price: 45,
      stock: 100,
      lowStockThreshold: 20,
      prescriptionRequired: false,
      batchNumber: `BCH-${Date.now().toString().slice(-5)}`,
      expiryDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    });
    setShowProductModal(true);
  };

  const openEditModal = (p: any) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      sku: p.sku,
      category: p.category,
      manufacturer: p.manufacturer,
      description: p.description || '',
      image: p.image || '',
      unit: p.unit,
      price: p.price,
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold || 20,
      prescriptionRequired: p.prescriptionRequired || false,
      batchNumber: p.batchNumber || '',
      expiryDate: p.expiryDate ? new Date(p.expiryDate).toISOString().split('T')[0] : '',
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const res = await api.put(`/products/${editingProduct._id}`, productForm);
        if (res.success) {
          setActionSuccessMsg('Product details updated successfully!');
        }
      } else {
        const res = await api.post('/products', productForm);
        if (res.success) {
          setActionSuccessMsg('New medical supply item added to catalog!');
        }
      }
      setShowProductModal(false);
      loadData();
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchModalProduct) return;
    try {
      const res = await api.post(`/products/${batchModalProduct._id}/batches`, batchForm);
      if (res.success) {
        setActionSuccessMsg(`Added batch ${batchForm.batchNumber} with ${batchForm.quantity} units!`);
        setBatchModalProduct(null);
        loadData();
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add batch');
    }
  };

  const handleDeactivate = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate ${name}?`)) return;
    try {
      const res = await api.delete(`/products/${id}`);
      if (res.success) {
        setActionSuccessMsg(`Product deactivated.`);
        loadData();
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (err: any) {
      alert(err.message || 'Deactivation failed');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.manufacturer.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar type="admin" />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Medical Product & Inventory Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage pharmaceutical catalog, stock counts, batch tracking, and near-expiry thresholds.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-colors self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" /> Add New Product
          </button>
        </div>

        {actionSuccessMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            {actionSuccessMsg}
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'products'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            All Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'alerts'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Low Stock & Expiry Alerts ({alerts?.lowStockCount + alerts?.expiringCount || 0})
          </button>
        </div>

        {/* ================= TAB 1: ALL PRODUCTS ================= */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {/* Search and Category Filter */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative flex-1 w-full sm:w-auto">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by product name, SKU, or manufacturer..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="w-full sm:w-auto">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full sm:w-auto py-2 px-3 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:ring-2 focus:ring-teal-500"
                >
                  <option value="All">All Categories</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Item Details</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Manufacturer</th>
                      <th className="py-3 px-4">Batch / Expiry</th>
                      <th className="py-3 px-4 text-right">Price</th>
                      <th className="py-3 px-4 text-center">Stock</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((p) => {
                      const isLow = p.stock <= (p.lowStockThreshold || 20);
                      const isExp = p.expiryDate && new Date(p.expiryDate) < new Date();
                      return (
                        <tr key={p._id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-slate-50 p-1 border border-slate-100 flex items-center justify-center shrink-0">
                                {p.image ? (
                                  <img src={p.image} alt={p.name} className="max-h-full object-contain" />
                                ) : (
                                  <span className="font-bold text-[10px] text-slate-400">Rx</span>
                                )}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block truncate max-w-xs">
                                  {p.name}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">SKU: {p.sku}</span>
                                {p.prescriptionRequired && (
                                  <span className="ml-2 text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                                    Rx
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600 truncate max-w-[150px]">{p.category}</td>
                          <td className="py-3 px-4 text-slate-600 truncate max-w-[150px]">{p.manufacturer}</td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-slate-700 block text-[11px]">
                              {p.batchNumber || 'N/A'}
                            </span>
                            <span
                              className={`text-[10px] ${
                                isExp ? 'text-rose-600 font-bold' : 'text-slate-400'
                              }`}
                            >
                              {p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : 'No Expiry'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                            ${p.price.toFixed(2)}
                            <span className="block text-[10px] font-normal text-slate-400">{p.unit}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                                p.stock <= 0
                                  ? 'bg-rose-100 text-rose-800'
                                  : isLow
                                  ? 'bg-amber-100 text-amber-800 animate-pulse'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {p.stock}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setBatchModalProduct(p);
                                  setBatchForm({
                                    batchNumber: `BCH-${Date.now().toString().slice(-5)}`,
                                    quantity: 50,
                                    manufacturingDate: '',
                                    expiryDate: '',
                                    notes: 'Replenishment batch',
                                  });
                                }}
                                className="px-2 py-1 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded text-[11px] font-bold"
                                title="Add Inventory Batch"
                              >
                                + Batch
                              </button>
                              <button
                                onClick={() => openEditModal(p)}
                                className="p-1.5 text-slate-500 hover:text-blue-900 hover:bg-slate-100 rounded"
                                title="Edit Product"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeactivate(p._id, p.name)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded"
                                title="Deactivate"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: INVENTORY & EXPIRY ALERTS ================= */}
        {activeTab === 'alerts' && alerts && (
          <div className="space-y-6">
            {/* Low Stock Section */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Low Stock Depletion Warnings ({alerts.lowStockProducts?.length || 0})
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Products whose remaining stock has dropped below or reached their critical replenishment threshold.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Product</th>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-center">Current Stock</th>
                      <th className="py-2.5 px-3 text-center">Alert Threshold</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {alerts.lowStockProducts?.map((p: any) => (
                      <tr key={p._id}>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{p.name}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{p.sku}</td>
                        <td className="py-2.5 px-3 text-slate-600">{p.category}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                            {p.stock}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-500">
                          {p.lowStockThreshold || 20}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => {
                              setBatchModalProduct(p);
                              setBatchForm({
                                batchNumber: `BCH-${Date.now().toString().slice(-5)}`,
                                quantity: 100,
                                manufacturingDate: '',
                                expiryDate: '',
                                notes: 'Emergency low stock replenishment',
                              });
                            }}
                            className="px-2.5 py-1 bg-teal-600 text-white rounded text-[11px] font-bold"
                          >
                            Restock Batch
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Near Expiry Section */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Batches Near Expiry or Expired ({alerts.expiringProducts?.length || 0})
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Products expiring within 90 days. Expired batches are automatically blocked from hospital ordering.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Product Name</th>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Batch Number</th>
                      <th className="py-2.5 px-3">Expiry Date</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {alerts.expiringProducts?.map((p: any) => {
                      const isExpired = new Date(p.expiryDate) < new Date();
                      return (
                        <tr key={p._id}>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{p.name}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">{p.sku}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-700">{p.batchNumber}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-900">
                            {new Date(p.expiryDate).toLocaleDateString()}
                          </td>
                          <td className="py-2.5 px-3">
                            {isExpired ? (
                              <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
                                Expired (Blocked)
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                                Near Expiry (&lt; 90 Days)
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL: ADD / EDIT PRODUCT ================= */}
        {showProductModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl p-6 sm:p-8 space-y-4 my-8">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">
                  {editingProduct ? 'Edit Catalog Product' : 'Add New Medical Product'}
                </h3>
                <button onClick={() => setShowProductModal(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Product Name</label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Product Code / SKU</label>
                    <input
                      type="text"
                      required
                      value={productForm.sku}
                      onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Category</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c._id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Manufacturer</label>
                    <input
                      type="text"
                      required
                      value={productForm.manufacturer}
                      onChange={(e) => setProductForm({ ...productForm, manufacturer: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Unit of Measure</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Box (10x10), Bottle"
                      value={productForm.unit}
                      onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Available Stock</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Low-Stock Alert Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={productForm.lowStockThreshold}
                      onChange={(e) => setProductForm({ ...productForm, lowStockThreshold: parseInt(e.target.value) || 20 })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Initial Batch Number</label>
                    <input
                      type="text"
                      value={productForm.batchNumber}
                      onChange={(e) => setProductForm({ ...productForm, batchNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={productForm.expiryDate}
                      onChange={(e) => setProductForm({ ...productForm, expiryDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Product Image URL</label>
                  <input
                    type="url"
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Product Description</label>
                  <textarea
                    rows={2}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.prescriptionRequired}
                      onChange={(e) => setProductForm({ ...productForm, prescriptionRequired: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    Requires Prescription (Rx Indicator)
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-blue-900 text-white font-bold text-xs hover:bg-blue-800 transition-colors shadow-md"
                >
                  {editingProduct ? 'Save Product Changes' : 'Create Catalog Product'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: ADD BATCH ================= */}
        {batchModalProduct && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">
                  Add Stock Batch for {batchModalProduct.name}
                </h3>
                <button onClick={() => setBatchModalProduct(null)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleAddBatch} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Batch Number</label>
                  <input
                    type="text"
                    required
                    value={batchForm.batchNumber}
                    onChange={(e) => setBatchForm({ ...batchForm, batchNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Batch Quantity to Add</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={batchForm.quantity}
                    onChange={(e) => setBatchForm({ ...batchForm, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={batchForm.expiryDate}
                    onChange={(e) => setBatchForm({ ...batchForm, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Manufacturing Date (Optional)</label>
                  <input
                    type="date"
                    value={batchForm.manufacturingDate}
                    onChange={(e) => setBatchForm({ ...batchForm, manufacturingDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all"
                >
                  Confirm & Increase Stock
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4rem)]">
          <Sidebar type="admin" />
          <div className="flex-1 p-12 text-center text-xs text-slate-400">Loading catalog management...</div>
        </div>
      }
    >
      <AdminProductsContent />
    </Suspense>
  );
}
