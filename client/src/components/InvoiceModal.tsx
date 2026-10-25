'use client';

import React from 'react';
import { X, Printer, Activity, CheckCircle, ShieldCheck } from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Actions */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tax Supply Invoice
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
              {order.status.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-900 text-white text-xs font-semibold hover:bg-blue-800 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Invoice
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="p-8 printable-invoice space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center">
                  <Activity className="w-5 h-5 text-teal-400" />
                </div>
                <span className="text-xl font-black text-slate-900">
                  Medi<span className="text-teal-600">Stock</span>
                </span>
              </div>
              <p className="text-xs text-slate-500">Central Healthcare Logistics & Restocking Depot</p>
              <p className="text-xs text-slate-500">DGDA Supply License #MS-DIST-2026-991</p>
            </div>

            <div className="text-right space-y-1">
              <h2 className="text-lg font-black text-slate-900">OFFICIAL INVOICE</h2>
              <p className="text-xs font-mono text-teal-700 font-bold">{order.invoiceNumber}</p>
              <p className="text-xs text-slate-500">
                Date: {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <p className="text-xs text-slate-500 font-mono">Order Ref: {order.orderNumber}</p>
            </div>
          </div>

          {/* Billed To / Shipping Address */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider block mb-1">
                Recipient Organization
              </span>
              <p className="text-sm font-bold text-slate-900">{order.organizationName}</p>
              <p className="text-slate-600 font-medium">Type: {order.organizationType}</p>
              <p className="text-slate-600">Phone: {order.contactNumber}</p>
            </div>

            <div>
              <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider block mb-1">
                Delivery Location
              </span>
              <p className="text-slate-700 font-medium">{order.deliveryAddress}</p>
              <p className="text-slate-700">{order.city}, Bangladesh</p>
              <p className="text-slate-500 mt-1 flex items-center gap-1 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600 inline" />
                Verified Clinical Facility
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3 text-center">Unit</th>
                  <th className="py-2.5 px-3 text-right">Price</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items?.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {item.name}
                      <span className="block text-[10px] font-normal text-slate-500">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">{item.sku}</td>
                    <td className="py-3 px-3 text-center text-slate-600">{item.unit}</td>
                    <td className="py-3 px-3 text-right text-slate-700 font-mono">
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-900">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 font-mono">
                      ${item.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Totals */}
          <div className="border-t-2 border-slate-200 pt-4 flex justify-end">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span className="font-mono">${order.totalAmount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Healthcare Logistics:</span>
                <span className="text-emerald-600 font-medium">FREE (Institutional)</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Standard VAT (0% Exempt):</span>
                <span className="font-mono">$0.00</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-sm text-slate-900">
                <span>Grand Total:</span>
                <span className="text-teal-700 font-mono">${order.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Verification Footnote */}
          <div className="border-t border-slate-100 pt-6 text-[11px] text-slate-400 space-y-1">
            <p>
              Certified by MediStock Quality Assurance. This electronic invoice conforms with medical device and pharmaceutical distribution standards.
            </p>
            <p className="font-mono text-[10px]">
              Security Token: {order._id} • Authorized Signature: System Verified
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

